import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EXPORT_ZIP_QUEUE } from '../queues/queues.module';
import { MinioStorageService } from '../storage/minio-storage.service';

export interface ExportZipRequestDto {
  patientStart?: string;
  patientEnd?: string;
  dateStart?: string;
  dateEnd?: string;
}

@ApiTags('Export ZIP')
@Controller('export/zip')
export class ExportZipController {
  constructor(
    @InjectQueue(EXPORT_ZIP_QUEUE) private readonly exportZipQueue: Queue,
    private readonly minioService: MinioStorageService,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicita geração assíncrona de ZIP Samsung' })
  @ApiResponse({ status: 202, description: 'Job criado — use statusUrl para acompanhar' })
  async requestZipExport(@Body() body: ExportZipRequestDto) {
    const job = await this.exportZipQueue.add(
      'generate-zip',
      {
        filters: {
          patientStart: body.patientStart,
          patientEnd: body.patientEnd,
          dateStart: body.dateStart,
          dateEnd: body.dateEnd,
        },
      },
      {
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    );

    return {
      jobId: job.id,
      statusUrl: `/export/zip/status/${job.id}`,
    };
  }

  @Get('status/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consulta status do job de geração de ZIP' })
  async getZipExportStatus(@Param('jobId') jobId: string) {
    const job = await this.exportZipQueue.getJob(jobId);
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

    // Progresso pode ser número legado ou objeto { percent, step }
    const rawProgress = job.progress;
    const progressObj =
      typeof rawProgress === 'number'
        ? { percent: rawProgress, step: '' }
        : ((rawProgress as { percent?: number; step?: string } | null) ?? {});
    const progress = progressObj.percent ?? 0;
    const step = progressObj.step ?? '';

    if (status === 'ready') {
      const returnValue = job.returnvalue as { minioKey?: string; zipName?: string } | undefined;
      const zipName = returnValue?.zipName ?? `export-${jobId}.zip`;
      return {
        status: 'ready',
        downloadUrl: `/api/export/zip/download/${jobId}`,
        zipName,
        progress: 100,
        step: 'ZIP pronto para download!',
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

  @Get('download/:jobId')
  @ApiOperation({ summary: 'Faz download do ZIP gerado (proxy MinIO)' })
  async downloadZip(@Param('jobId') jobId: string, @Res() res: Response) {
    const job = await this.exportZipQueue.getJob(jobId);
    if (!job) {
      res.status(404).json({ message: `Job ${jobId} não encontrado` });
      return;
    }

    const state = await job.getState();
    if (state !== 'completed') {
      res.status(400).json({ message: `Job não concluído (estado: ${state})` });
      return;
    }

    const returnValue = job.returnvalue as { minioKey?: string; zipName?: string } | undefined;
    if (!returnValue?.minioKey) {
      res.status(404).json({ message: 'Arquivo não disponível' });
      return;
    }

    const zipName = returnValue.zipName ?? `export-${jobId}.zip`;
    const stream = await this.minioService.getObjectStream(returnValue.minioKey);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
    );
    stream.pipe(res);
  }
}
