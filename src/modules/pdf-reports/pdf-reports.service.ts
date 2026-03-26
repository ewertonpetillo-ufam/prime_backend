import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
import { MinioStorageService } from '../storage/minio-storage.service';

function pdfReportTypeToFolder(reportType: string): string {
  const map: Record<string, string> = {
    BIOBIT: 'baiobit',
    DELSYS: 'delsys',
    POLYSOMNOGRAPHY: 'polysomnograph',
    OTHER: 'other',
  };
  return map[reportType] || 'other';
}

function sanitizeOriginalFileName(name: string): string {
  const base = name
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  const trimmed = base.replace(/^_|_$/g, '').slice(0, 180);
  return trimmed || 'file';
}

function buildStorageKeyCandidates(originalPath: string): string[] {
  const variants = new Set<string>();
  const base = originalPath.trim();
  if (!base) return [];

  variants.add(base);

  // Variações comuns de nomenclatura de pastas já vistas em ambientes diferentes.
  variants.add(base.replace(/baiobit/gi, 'biobit'));
  variants.add(base.replace(/biobit/gi, 'baiobit'));
  variants.add(base.replace(/polysomnograph/gi, 'polysomnography'));
  variants.add(base.replace(/polysomnography/gi, 'polysomnograph'));

  return Array.from(variants).filter(Boolean);
}

function isStorageNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { name?: string; Code?: string; code?: string };
  const values = [e.name, e.Code, e.code].filter(Boolean);
  return values.some((v) =>
    ['NoSuchKey', 'NotFound', 'NoSuchObject', 'NoSuchBucket'].includes(String(v)),
  );
}

@Injectable()
export class PdfReportsService {
  constructor(
    @InjectRepository(PdfReport)
    private readonly pdfReportRepository: Repository<PdfReport>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async uploadReport(
    dto: UploadPdfReportDto,
    file: Express.Multer.File,
    uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (!this.minioStorage.isEnabled()) {
      throw new BadRequestException(
        'Armazenamento de arquivos (MinIO) não está configurado. Defina MINIO_* no ambiente.',
      );
    }

    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    const id = randomUUID();
    const folder = pdfReportTypeToFolder(dto.reportType);
    const safeName = sanitizeOriginalFileName(file.originalname);
    const key = `${folder}/${dto.questionnaireId}/${id}_${safeName}`;

    try {
      await this.minioStorage.putObject(
        key,
        file.buffer,
        file.mimetype || 'application/octet-stream',
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao enviar arquivo ao MinIO';
      throw new InternalServerErrorException(msg);
    }

    const pdfReport = this.pdfReportRepository.create({
      id,
      questionnaire_id: dto.questionnaireId,
      report_type: dto.reportType,
      file_name: file.originalname,
      file_size_bytes: file.size,
      mime_type: file.mimetype || 'application/octet-stream',
      file_path: key,
      file_data: null,
      notes: dto.notes || null,
      uploaded_by: uploadedBy || null,
    });

    const saved = await this.pdfReportRepository.save(pdfReport);
    const fileDownloadUrl = await this.getPresignedDownloadUrl(saved.file_path);
    return Object.assign(saved, { fileDownloadUrl });
  }

  async getReportById(id: string) {
    const report = await this.pdfReportRepository
      .createQueryBuilder('report')
      .addSelect('report.file_data')
      .where('report.id = :id', { id })
      .getOne();

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    if (report.file_path) {
      if (!this.minioStorage.isEnabled()) {
        throw new InternalServerErrorException(
          'Arquivo está no MinIO mas o storage não está configurado neste ambiente.',
        );
      }
      const candidates = buildStorageKeyCandidates(report.file_path);
      for (const candidate of candidates) {
        try {
          const buffer = await this.minioStorage.getObjectBuffer(candidate);
          return Object.assign(report, { file_data: buffer });
        } catch (error) {
          // Só tenta próximo candidato quando o storage reporta "objeto não encontrado".
          // Erros de credencial/assinatura/rede devem aparecer para diagnóstico.
          if (isStorageNotFoundError(error)) {
            continue;
          }
          const msg =
            error instanceof Error ? error.message : 'Falha ao acessar arquivo no storage';
          throw new InternalServerErrorException(msg);
        }
      }

      // Fallback para legado: se houver BYTEA no banco, retorna mesmo com file_path inválido.
      if (report.file_data?.length) {
        return report;
      }
      throw new NotFoundException(`Arquivo do relatório ${id} não encontrado no storage`);
    }

    return report;
  }

  async getReportForDownload(id: string): Promise<{
    report: PdfReport;
    stream: Readable;
  }> {
    const report = await this.pdfReportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    if (report.file_path) {
      if (!this.minioStorage.isEnabled()) {
        throw new InternalServerErrorException(
          'Arquivo está no MinIO mas o storage não está configurado neste ambiente.',
        );
      }
      try {
        const stream = await this.minioStorage.getObjectStream(report.file_path);
        return { report, stream };
      } catch {
        throw new NotFoundException(`Arquivo do relatório ${id} não encontrado no storage`);
      }
    }

    return { report, stream: Readable.from(report.file_data ?? Buffer.from([])) };
  }

  async deleteReport(id: string) {
    const existing = await this.pdfReportRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }
    if (existing.file_path && this.minioStorage.isEnabled()) {
      try {
        await this.minioStorage.deleteObject(existing.file_path);
      } catch {
        // objeto pode já ter sido removido manualmente
      }
    }
    await this.pdfReportRepository.delete(id);
    return { success: true };
  }

  /** URL pré-assinada para download direto no navegador (null se legado só com BYTEA ou MinIO desligado). */
  async getPresignedDownloadUrl(
    filePath: string | null | undefined,
    expiresInSeconds = 3600,
  ): Promise<string | null> {
    if (!filePath || !this.minioStorage.isEnabled()) {
      return null;
    }
    try {
      return await this.minioStorage.getPresignedGetUrl(filePath, expiresInSeconds);
    } catch {
      return null;
    }
  }

  /** Lê bytes do MinIO ou do BYTEA legado. */
  async readStoredFileBuffer(report: {
    file_path?: string | null;
    file_data?: Buffer | null;
  }): Promise<Buffer | null> {
    if (report.file_path) {
      if (!this.minioStorage.isEnabled()) {
        return null;
      }
      try {
        return await this.minioStorage.getObjectBuffer(report.file_path);
      } catch {
        return null;
      }
    }
    if (report.file_data?.length) {
      return report.file_data;
    }
    return null;
  }
}
