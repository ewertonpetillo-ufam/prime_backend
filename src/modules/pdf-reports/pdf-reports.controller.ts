import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Res,
  Delete,
  PayloadTooLargeException,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PdfReportsService } from './pdf-reports.service';
import { UploadPdfReportDto } from './dto/upload-pdf-report.dto';
import { UploadPreflightDto } from './dto/upload-preflight.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PDF_REPORT_UPLOAD_QUEUE } from '../queues/queues.module';
import { PdfReportUploadJobResult } from './pdf-report-upload.types';

const MAX_UPLOAD_FILE_SIZE_BYTES = Number(
  process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 700 * 1024 * 1024,
);

const PDF_UPLOAD_TMP_DIR = path.join(os.tmpdir(), 'pdf-uploads');

function ensurePdfUploadTmpDir(): void {
  if (!fs.existsSync(PDF_UPLOAD_TMP_DIR)) {
    fs.mkdirSync(PDF_UPLOAD_TMP_DIR, { recursive: true });
  }
}

function isSyncUploadMode(req: Request, headerMode?: string): boolean {
  if (headerMode?.toLowerCase() === 'sync') return true;
  const query = req.query?.async;
  if (query === 'false' || query === '0') return true;
  return false;
}

@ApiTags('PDF Reports')
@ApiBearerAuth('JWT-auth')
@Controller('pdf-reports')
export class PdfReportsController {
  constructor(
    private readonly pdfReportsService: PdfReportsService,
    @InjectQueue(PDF_REPORT_UPLOAD_QUEUE)
    private readonly uploadQueue: Queue,
  ) {}

  private logMemoryTelemetry(event: string, details: Record<string, unknown>) {
    const mem = process.memoryUsage();
    console.log(`[pdf-reports] ${event}`, {
      ...details,
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
    });
  }

  @Post('upload/preflight')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preflight de upload — verifica duplicatas por metadados',
    description:
      'Compara questionnaire + tipo + nome + tamanho com registros existentes em pdf_reports.',
  })
  async preflightUpload(@Body() dto: UploadPreflightDto) {
    return this.pdfReportsService.preflightUpload(dto);
  }

  @Get('upload/status/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consulta status do job de upload assíncrono' })
  async getUploadStatus(@Param('jobId') jobId: string) {
    const job = await this.uploadQueue.getJob(jobId);
    if (!job) {
      return {
        status: 'error',
        error: 'Processo não encontrado. O servidor pode ter sido reiniciado. Tente novamente.',
        progress: 0,
        step: '',
      };
    }

    const state = await job.getState();
    const statusMap: Record<string, string> = {
      waiting: 'pending',
      active: 'processing',
      completed: 'ready',
      failed: 'error',
      delayed: 'pending',
      prioritized: 'pending',
    };
    const status = statusMap[state] ?? 'pending';

    const rawProgress = job.progress;
    const progressObj =
      typeof rawProgress === 'number'
        ? { percent: rawProgress, step: '' }
        : ((rawProgress as { percent?: number; step?: string } | null) ?? {});
    const progress = progressObj.percent ?? 0;
    const step = progressObj.step ?? '';

    if (status === 'ready') {
      const result = job.returnvalue as PdfReportUploadJobResult | undefined;
      return {
        status: 'ready',
        progress: 100,
        step: 'Upload concluído',
        result: result
          ? { id: result.id, fileName: result.fileName, fileDownloadUrl: result.fileDownloadUrl }
          : undefined,
      };
    }

    if (status === 'error') {
      return {
        status: 'error',
        error: job.failedReason ?? 'Erro desconhecido',
        progress,
        step,
      };
    }

    return { status, progress, step };
  }

  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Upload de relatório de arquivo',
    description:
      'Modo assíncrono (padrão): grava temp, enfileira job e retorna 202. Use X-Upload-Mode: sync ou ?async=false para modo síncrono.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questionnaireId: { type: 'string', format: 'uuid' },
        reportType: {
          type: 'string',
          enum: ['BIOBIT', 'DELSYS', 'POLYSOMNOGRAPHY', 'OTHER'],
        },
        notes: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['questionnaireId', 'reportType', 'file'],
    },
  })
  @ApiResponse({ status: 202, description: 'Job enfileirado — use statusUrl para acompanhar' })
  @ApiResponse({ status: 201, description: 'Relatório salvo (modo síncrono)' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensurePdfUploadTmpDir();
          cb(null, PDF_UPLOAD_TMP_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '');
          cb(null, `pdf-upload-${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE_BYTES },
    }),
  )
  async uploadReport(
    @Req() req: Request,
    @Body() dto: UploadPdfReportDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
    @Headers('x-upload-mode') uploadModeHeader?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const startedAt = Date.now();
    console.log('[pdf-reports] upload_report_started', {
      questionnaireId: dto.questionnaireId,
      reportType: dto.reportType,
      fileSizeBytes: file?.size ?? 0,
      originalName: file?.originalname,
      async: !isSyncUploadMode(req, uploadModeHeader),
    });

    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Arquivo excede o limite de ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes`,
      );
    }

    if (isSyncUploadMode(req, uploadModeHeader)) {
      const result = await this.pdfReportsService.uploadReport(dto, file, user?.userId);
      this.logMemoryTelemetry('upload_report_sync', {
        questionnaireId: dto.questionnaireId,
        reportType: dto.reportType,
        fileSizeBytes: file.size,
        durationMs: Date.now() - startedAt,
      });
      if (res) {
        res.status(HttpStatus.CREATED);
      }
      return result;
    }

    const enqueueResult = await this.pdfReportsService.enqueueUploadReport(
      dto,
      file,
      user?.userId,
    );

    this.logMemoryTelemetry('upload_report_enqueued', {
      questionnaireId: dto.questionnaireId,
      reportType: dto.reportType,
      fileSizeBytes: file.size,
      jobId: 'jobId' in enqueueResult ? enqueueResult.jobId : undefined,
      durationMs: Date.now() - startedAt,
    });

    return enqueueResult;
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download de relatório de arquivo',
    description: 'Retorna o arquivo original para download',
  })
  @ApiResponse({ status: 200, description: 'Relatório retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const startedAt = Date.now();
    const { report, stream } = await this.pdfReportsService.getReportForDownload(id);
    const mimeType = report.mime_type || 'application/octet-stream';
    const dispositionFileName = encodeURIComponent(report.file_name || 'relatorio');

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${dispositionFileName}"`,
    });

    if (report.file_size_bytes) {
      res.set('Content-Length', report.file_size_bytes.toString());
    }

    stream.on('error', (err: Error & { code?: string }) => {
      console.error('[pdf-reports] download stream error', {
        reportId: id,
        message: err?.message,
        code: err?.code,
      });
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Falha ao transmitir o arquivo do armazenamento',
        });
      } else {
        res.destroy(err);
      }
    });

    stream.on('end', () => {
      this.logMemoryTelemetry('download_report', {
        reportId: id,
        fileSizeBytes: report.file_size_bytes ?? 0,
        durationMs: Date.now() - startedAt,
      });
    });

    stream.pipe(res);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir relatório de arquivo',
    description: 'Remove um relatório PDF associado a um questionário',
  })
  @ApiResponse({ status: 204, description: 'Relatório excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async deleteReport(@Param('id') id: string) {
    await this.pdfReportsService.deleteReport(id);
  }
}
