import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BART_SYNC_QUEUE } from '../queues/queues.module';
import { SamsungSyncRun, SamsungSyncRunStatus } from '../../entities/samsung-sync-run.entity';

export interface BartSyncRequestDto {
  patientStart?: string;
  patientEnd?: string;
  dateStart?: string;
  dateEnd?: string;
}

@ApiTags('BART Sync')
@Controller('sync/bart')
export class BartSyncController {
  constructor(
    @InjectQueue(BART_SYNC_QUEUE) private readonly bartSyncQueue: Queue,
    @InjectRepository(SamsungSyncRun)
    private readonly syncRunRepository: Repository<SamsungSyncRun>,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicita sincronização assíncrona com BART/Artifactory' })
  @ApiResponse({ status: 202, description: 'Job criado — use statusUrl para acompanhar' })
  async requestBartSync(@Body() body: BartSyncRequestDto) {
    const job = await this.bartSyncQueue.add(
      'sync-to-bart',
      {
        filters: {
          patientStart: body.patientStart,
          patientEnd: body.patientEnd,
          dateStart: body.dateStart,
          dateEnd: body.dateEnd,
        },
        userId: null,
      },
      {
        removeOnComplete: { age: 86400 },
        removeOnFail: { age: 86400 * 7 },
      },
    );

    return {
      jobId: job.id,
      statusUrl: `/sync/bart/status/${job.id}`,
    };
  }

  @Get('status/:jobId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consulta status do job de sincronização com BART' })
  async getBartSyncStatus(@Param('jobId') jobId: string) {
    const job = await this.bartSyncQueue.getJob(jobId);
    if (!job) {
      // Job não encontrado — backend pode ter reiniciado ou Redis foi limpo
      return {
        status: 'error',
        error: 'Processo não encontrado. O servidor pode ter sido reiniciado. Por favor, tente novamente.',
        progress: undefined,
        runId: null,
        errors: [],
      };
    }

    const state = await job.getState();
    const jobProgress = job.progress as { runId?: string; current?: number; total?: number } | null;

    const statusMap: Record<string, string> = {
      waiting: 'pending',
      active: 'processing',
      completed: 'done',
      failed: 'error',
      delayed: 'pending',
      prioritized: 'pending',
    };

    const status = statusMap[state] ?? 'pending';

    // Tenta obter o runId seja do progress (durante execução) ou do returnvalue (concluído)
    const returnValue = job.returnvalue as { runId?: string; errors?: string[] } | undefined;
    const runId = jobProgress?.runId ?? returnValue?.runId ?? null;

    // Busca dados de auditoria do banco se runId disponível
    let runData: SamsungSyncRun | null = null;
    if (runId) {
      runData = await this.syncRunRepository.findOne({ where: { id: runId } });
    }

    const dbProgress = runData
      ? {
          current: (runData.synced_patients ?? 0) + (runData.errored_patients ?? 0),
          total: runData.total_patients ?? 0,
          uploadedFiles: runData.uploaded_files ?? 0,
          skippedFiles: runData.skipped_files ?? 0,
          errorFiles: runData.error_files ?? 0,
        }
      : (typeof jobProgress?.current === 'number'
          ? { current: jobProgress.current, total: jobProgress.total ?? 0 }
          : undefined);

    if (status === 'error') {
      return {
        status: 'error',
        error: job.failedReason ?? 'Erro desconhecido',
        errors: returnValue?.errors ?? [],
        progress: dbProgress,
        runId,
      };
    }

    if (status === 'done') {
      return {
        status: 'done',
        runId,
        errors: returnValue?.errors ?? [],
        progress: dbProgress,
        summary: runData?.summary ?? undefined,
      };
    }

    // pending / processing
    return {
      status,
      runId,
      progress: dbProgress,
      summary: runData?.summary ?? undefined,
    };
  }
}
