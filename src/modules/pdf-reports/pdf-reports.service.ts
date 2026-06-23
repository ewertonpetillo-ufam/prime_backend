import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { Readable } from 'stream';
import { PdfReport } from '../../entities/pdf-report.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
import { UploadPreflightDto } from './dto/upload-preflight.dto';
import { MinioStorageService } from '../storage/minio-storage.service';
import { PDF_REPORT_UPLOAD_QUEUE } from '../queues/queues.module';
import {
  PdfReportUploadJobData,
  PdfReportUploadJobResult,
} from './pdf-report-upload.types';

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
  return /connect econnrefused|econnrefused|network|timed out|timeout exceeded|getaddrinfo|fetch failed|socket hang up/i.test(
    msg,
  );
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
    @InjectQueue(PDF_REPORT_UPLOAD_QUEUE)
    private readonly uploadQueue: Queue<PdfReportUploadJobData>,
  ) {}

  async assertQuestionnaireExists(questionnaireId: string): Promise<void> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: questionnaireId },
    });
    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${questionnaireId} not found`);
    }
  }

  async preflightUpload(dto: UploadPreflightDto) {
    await this.assertQuestionnaireExists(dto.questionnaireId);

    const items = dto.files.map((file) => ({
      fileName: file.fileName,
      fileSizeBytes: file.fileSizeBytes,
      action: 'upload' as const,
    }));

    return { items };
  }

  async enqueueUploadReport(
    dto: UploadPdfReportDto,
    file: Express.Multer.File,
    uploadedBy?: string,
  ): Promise<{ jobId: string; statusUrl: string }> {
    if (!file?.path) {
      throw new BadRequestException('Arquivo temporário inválido após upload');
    }

    if (!this.minioStorage.isEnabled()) {
      await unlink(file.path).catch(() => undefined);
      throw new BadRequestException(
        'Armazenamento de arquivos (MinIO) não está configurado. Defina MINIO_* no ambiente.',
      );
    }

    await this.assertQuestionnaireExists(dto.questionnaireId);

    const job = await this.uploadQueue.add(
      'process-upload',
      {
        tempPath: file.path,
        questionnaireId: dto.questionnaireId,
        reportType: dto.reportType,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype || 'application/octet-stream',
        notes: dto.notes ?? null,
        uploadedBy: uploadedBy ?? null,
      },
      {
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    );

    return {
      jobId: String(job.id),
      statusUrl: `/pdf-reports/upload/status/${job.id}`,
    };
  }

  /** Persiste relatório a partir de arquivo temporário (worker assíncrono). Não lê file_data legado. */
  async persistUploadFromTemp(
    data: PdfReportUploadJobData,
  ): Promise<PdfReportUploadJobResult> {
    const id = randomUUID();
    const folder = pdfReportTypeToFolder(data.reportType);
    const safeName = sanitizeOriginalFileName(data.fileName);
    const key = `${folder}/${data.questionnaireId}/${id}_${safeName}`;

    try {
      const stream = createReadStream(data.tempPath);
      await this.minioStorage.putObjectStream(key, stream, data.mimeType);
    } catch (e) {
      const err = e as Error & { code?: string; name?: string };
      const msg = e instanceof Error ? e.message : 'Falha ao enviar arquivo ao MinIO';
      console.error('[pdf-reports] MinIO upload failed (async)', {
        key,
        fileSizeBytes: data.fileSizeBytes,
        message: msg,
        code: err.code,
        name: err.name,
      });
      if (isMinioConnectivityError(e)) {
        throw new ServiceUnavailableException(
          `Armazenamento de arquivos (MinIO) indisponível: ${msg}. Verifique MINIO_ENDPOINT e se o serviço MinIO está acessível a partir do container do backend.`,
        );
      }
      throw new InternalServerErrorException(msg);
    } finally {
      await unlink(data.tempPath).catch(() => undefined);
    }

    const pdfReport = this.pdfReportRepository.create({
      id,
      questionnaire_id: data.questionnaireId,
      report_type: data.reportType,
      file_name: data.fileName,
      file_size_bytes: data.fileSizeBytes,
      mime_type: data.mimeType,
      file_path: key,
      file_data: null,
      file_sync_pending: false,
      file_synced_at: new Date(),
      notes: data.notes ?? null,
      uploaded_by: data.uploadedBy ?? null,
    });

    const saved = await this.pdfReportRepository.save(pdfReport);
    const fileDownloadUrl = await this.getPresignedDownloadUrl(saved.file_path);
    return {
      id: saved.id,
      fileName: saved.file_name,
      fileDownloadUrl,
    };
  }

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
    const tempPath = file.path;
    const mimeType = file.mimetype || 'application/octet-stream';

    try {
      if (tempPath) {
        const stream = createReadStream(tempPath);
        await this.minioStorage.putObjectStream(key, stream, mimeType);
      } else if (file.buffer) {
        await this.minioStorage.putObject(key, file.buffer, mimeType);
      } else {
        throw new BadRequestException('Arquivo temporário inválido após upload');
      }
    } catch (e) {
      const err = e as Error & { code?: string; name?: string };
      const msg = e instanceof Error ? e.message : 'Falha ao enviar arquivo ao MinIO';
      console.error('[pdf-reports] MinIO upload failed', {
        key,
        fileSizeBytes: file.size,
        message: msg,
        code: err.code,
        name: err.name,
      });
      if (isMinioConnectivityError(e)) {
        throw new ServiceUnavailableException(
          `Armazenamento de arquivos (MinIO) indisponível: ${msg}. Verifique MINIO_ENDPOINT e se o serviço MinIO está acessível a partir do container do backend.`,
        );
      }
      throw new InternalServerErrorException(msg);
    } finally {
      if (tempPath) {
        await unlink(tempPath).catch(() => undefined);
      }
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
      return { success: true, alreadyDeleted: true as const };
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
