import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EXPORT_PRIME_QUEUE } from '../queues/queues.module';
import { MinioStorageService } from '../storage/minio-storage.service';

export interface ExportPrimeRequestDto {
  patientStart?: string;
  patientEnd?: string;
  dateStart?: string;
  dateEnd?: string;
}

@ApiTags('Export UFAM/PRIME')
@Controller('export/prime')
export class ExportPrimeController {
  constructor(
    @InjectQueue(EXPORT_PRIME_QUEUE) private readonly exportPrimeQueue: Queue,
    private readonly minioService: MinioStorageService,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicita geração assíncrona de ZIP UFAM/PRIME' })
  @ApiResponse({ status: 202, description: 'Job criado — use statusUrl para acompanhar' })
  async requestPrimeExport(@Body() body: ExportPrimeRequestDto) {
    const job = await this.exportPrimeQueue.add(
      'generate-prime-zip',
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
      statusUrl: `/export/prime/status/${job.id}`,
    };
  }

  @Get('status/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consulta status do job de geração de ZIP UFAM/PRIME' })
  async getPrimeExportStatus(@Param('jobId') jobId: string) {
    const job = await this.exportPrimeQueue.getJob(jobId);
    if (!job) {
      return {
        status: 'error',
        error:
          'Exportação interrompida: o servidor reiniciou ou o job expirou. Inicie uma nova exportação.',
        progress: 0,
        step: '',
      };
    }

    const state = await job.getState();

    if (state === 'failed') {
      return {
        status: 'error',
        error:
          job.failedReason ??
          'Exportação falhou (memória insuficiente ou erro no servidor). Tente novamente com menos pacientes ou após o redeploy.',
        progress: 0,
        step: '',
      };
    }

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
      const returnValue = job.returnvalue as { minioKey?: string; zipName?: string } | undefined;
      const zipName = returnValue?.zipName ?? `export-prime-${jobId}.zip`;
      return {
        status: 'ready',
        downloadUrl: `/api/export/prime/download/${jobId}`,
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
  @ApiOperation({ summary: 'Faz download do ZIP UFAM/PRIME gerado (proxy MinIO)' })
  async downloadZip(@Param('jobId') jobId: string, @Res() res: Response) {
    const job = await this.exportPrimeQueue.getJob(jobId);
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

    const zipName = returnValue.zipName ?? `export-prime-${jobId}.zip`;
    const stream = await this.minioService.getObjectStream(returnValue.minioKey);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
    );
    stream.pipe(res);
  }
}
