import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { BART_SYNC_QUEUE } from '../queues/queues.module';
import { SamsungSyncService } from '../samsung-sync/samsung-sync.service';
import { SamsungSyncRun, SamsungSyncRunStatus } from '../../entities/samsung-sync-run.entity';

interface BartSyncJobData {
  filters?: {
    patientStart?: string;
    patientEnd?: string;
    dateStart?: string;
    dateEnd?: string;
  };
  userId?: string | null;
}

interface BartSyncProgress {
  runId: string;
  current: number;
  total: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Processor(BART_SYNC_QUEUE, { concurrency: 1 })
export class BartSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(BartSyncProcessor.name);

  constructor(
    private readonly samsungSyncService: SamsungSyncService,
    @InjectRepository(SamsungSyncRun)
    private readonly syncRunRepository: Repository<SamsungSyncRun>,
  ) {
    super();
  }

  async process(job: Job<BartSyncJobData>): Promise<{ runId: string; errors: string[] }> {
    this.logger.log(`[Job ${job.id}] Iniciando sincronização com BART`);

    const { filters, userId = null } = job.data;

    // Dispara o sync assíncrono — retorna imediatamente com { run_id }
    const asyncResult = await this.samsungSyncService.runSyncAsync(
      userId ?? null,
      'manual',
      filters,
    );
    const runId = asyncResult.run_id;

    this.logger.log(`[Job ${job.id}] run_id criado: ${runId}`);

    // Publica o runId imediatamente para que o status endpoint possa usá-lo
    await job.updateProgress({ runId, current: 0, total: 0 } as BartSyncProgress);

    // Aguarda o run completar — polling no banco a cada 3s
    let run: SamsungSyncRun | null = null;
    while (true) {
      await sleep(3000);

      run = await this.syncRunRepository.findOne({ where: { id: runId } });
      if (!run) {
        this.logger.warn(`[Job ${job.id}] Run ${runId} não encontrado no banco.`);
        break;
      }

      const total =
        (run.total_patients ?? 0) > 0
          ? run.total_patients
          : (run.uploaded_files ?? 0) + (run.skipped_files ?? 0) + (run.error_files ?? 0) + (run.deleted_files ?? 0);
      const current =
        (run.uploaded_files ?? 0) + (run.skipped_files ?? 0) + (run.error_files ?? 0);

      await job.updateProgress({ runId, current, total } as BartSyncProgress);

      this.logger.log(`[Job ${job.id}] Status=${run.status} | ${current}/${total} arquivos`);

      if (run.status !== SamsungSyncRunStatus.RUNNING) {
        break;
      }
    }

    const errors: string[] = [];
    if (run?.error_message) {
      errors.push(run.error_message);
    }

    this.logger.log(`[Job ${job.id}] Sincronização com BART concluída. runId=${runId}`);
    return { runId, errors };
  }
}
