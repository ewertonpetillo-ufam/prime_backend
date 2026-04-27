import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
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

/** Rede / processo: MinIO inacessível (não confundir com “arquivo não existe”). */
function isMinioConnectivityError(e: unknown): boolean {
  const err = e as Error & { code?: string; cause?: unknown };
  const cause = err?.cause as Error & { code?: string } | undefined;
  const code = err?.code || cause?.code;
  if (typeof code === 'string') {
    return ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'EPIPE'].includes(
      code,
    );
  }
  const msg = (err?.message || '').toLowerCase();
  return /connect econnrefused|econnrefused|network|timed out|getaddrinfo|fetch failed|socket hang up/i.test(msg);
}

function isStorageObjectMissing(e: unknown): boolean {
  const err = e as {
    name?: string
    Code?: string
    $metadata?: { httpStatusCode?: number }
  };
  if (err?.name === 'NotFound' || err?.name === 'NoSuchKey') return true;
  if (err?.Code === 'NoSuchKey') return true;
  if (err?.$metadata?.httpStatusCode === 404) return true;
  return false;
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
      const err = e as Error & { code?: string; name?: string };
      const msg = e instanceof Error ? e.message : 'Falha ao enviar arquivo ao MinIO';
      console.error('[pdf-reports] MinIO putObject failed', {
        key,
        fileSizeBytes: file.size,
        message: msg,
        code: err.code,
        name: err.name,
      });
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
      try {
        const buffer = await this.minioStorage.getObjectBuffer(report.file_path);
        return Object.assign(report, { file_data: buffer });
      } catch (e) {
        if (isMinioConnectivityError(e)) {
          const msg = e instanceof Error ? e.message : 'MinIO indisponível';
          throw new ServiceUnavailableException(
            `Armazenamento de arquivos (MinIO) indisponível: ${msg}. Verifique MINIO_ENDPOINT e se o serviço está acessível a partir deste backend.`,
          );
        }
        if (isStorageObjectMissing(e)) {
          throw new NotFoundException(`Arquivo do relatório ${id} não encontrado no storage`);
        }
        const msg = e instanceof Error ? e.message : 'Falha ao ler arquivo no storage';
        console.error('[pdf-reports] MinIO getObjectBuffer failed', {
          reportId: id,
          filePath: report.file_path,
          message: msg,
        });
        throw new InternalServerErrorException(msg);
      }
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
      } catch (e) {
        const err = e as Error & { code?: string };
        console.error('[pdf-reports] MinIO getObjectStream failed', {
          reportId: id,
          filePath: report.file_path,
          message: err?.message,
          code: err?.code,
        });
        if (isMinioConnectivityError(e)) {
          throw new ServiceUnavailableException(
            `Armazenamento de arquivos (MinIO) indisponível: ${err?.message || 'falha de conexão'}. Verifique se o MinIO está em execução e se MINIO_ENDPOINT é alcançável a partir deste servidor.`,
          );
        }
        if (isStorageObjectMissing(e)) {
          throw new NotFoundException(`Arquivo do relatório ${id} não encontrado no storage`);
        }
        throw new InternalServerErrorException(
          err?.message || 'Falha ao abrir stream do arquivo no storage',
        );
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
    if (
      !filePath ||
      !this.minioStorage.isEnabled() ||
      !this.minioStorage.isPresignedEnabled()
    ) {
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
