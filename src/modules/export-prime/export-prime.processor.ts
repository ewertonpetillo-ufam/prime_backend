import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import archiver = require('archiver');
import { PassThrough } from 'stream';
import { EXPORT_PRIME_QUEUE } from '../queues/queues.module';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import { BinaryCollectionsService } from '../binary-collections/binary-collections.service';
import { appendUfamBulkPatientToArchive } from './ufam-prime-zip.builder';

interface ExportPrimeJobData {
  filters?: {
    patientStart?: string;
    patientEnd?: string;
    dateStart?: string;
    dateEnd?: string;
  };
}

/** Export em massa pode levar >1h com EDF grandes; lock longo evita job "stalled" prematuro. */
@Processor(EXPORT_PRIME_QUEUE, {
  concurrency: 1,
  lockDuration: 2 * 60 * 60 * 1000,
})
export class ExportPrimeProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportPrimeProcessor.name);

  constructor(
    private readonly questionnairesService: QuestionnairesService,
    private readonly minioService: MinioStorageService,
    private readonly binaryCollectionsService: BinaryCollectionsService,
  ) {
    super();
  }

  private async updateStep(job: Job<ExportPrimeJobData>, percent: number, step: string) {
    await job.updateProgress({ percent, step } as unknown as number);
  }

  private logMemory(job: Job<ExportPrimeJobData>, label: string) {
    const mem = process.memoryUsage();
    this.logger.log(
      `[Job ${job.id}] ${label} — heap=${(mem.heapUsed / 1024 / 1024).toFixed(0)}MB rss=${(mem.rss / 1024 / 1024).toFixed(0)}MB`,
    );
  }

  async process(job: Job<ExportPrimeJobData>): Promise<{ minioKey: string; zipName: string }> {
    this.logger.log(`[Job ${job.id}] Iniciando geração do ZIP UFAM/PRIME`);

    const filters = job.data.filters ?? {};
    const minioKey = `exports/prime/${job.id}.zip`;
    const zipName = 'Dados_Todos_Pacientes.zip';

    await this.updateStep(job, 0, 'Iniciando geração do ZIP UFAM/PRIME...');
    await this.updateStep(job, 2, 'Consultando banco de dados...');

    const questionnaireIds =
      await this.questionnairesService.listQuestionnaireIdsForExport(filters);

    if (questionnaireIds.length === 0) {
      throw new Error('Nenhum questionário encontrado para os filtros informados.');
    }

    await this.updateStep(
      job,
      5,
      `Montando ZIP para ${questionnaireIds.length} paciente(s)...`,
    );
    this.logMemory(job, 'Antes do ZIP');

    const archive = archiver('zip', { zlib: { level: 1 } });
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        this.logger.warn(`[Job ${job.id}] Archiver warning: ${err.message}`);
      } else {
        throw err;
      }
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);
    const uploadPromise = this.minioService.putObjectStream(
      minioKey,
      passThrough,
      'application/zip',
    );

    for (let i = 0; i < questionnaireIds.length; i++) {
      const questionnaireId = questionnaireIds[i];
      const item = await this.questionnairesService.exportQuestionnaireData(questionnaireId, {
        skipPresignedUrls: true,
      });

      const folderName = await appendUfamBulkPatientToArchive(archive, item, {
        minioService: this.minioService,
        binaryCollectionsService: this.binaryCollectionsService,
        onPdfError: (reportId, message) => {
          this.logger.warn(`[Job ${job.id}] PDF omitido (${reportId}): ${message}`);
        },
        onBinaryError: (collectionId, message) => {
          this.logger.warn(`[Job ${job.id}] Binário omitido (${collectionId}): ${message}`);
        },
      });

      const percent = Math.round(5 + ((i + 1) / questionnaireIds.length) * 85);
      await this.updateStep(
        job,
        percent,
        `Montando pasta no ZIP: ${folderName} (${i + 1}/${questionnaireIds.length})`,
      );
      this.logger.log(
        `[Job ${job.id}] Paciente ${i + 1}/${questionnaireIds.length} (${folderName}) adicionado ao ZIP`,
      );
      this.logMemory(job, `Após paciente ${i + 1}/${questionnaireIds.length}`);
    }

    await this.updateStep(job, 91, 'Compactando todas as pastas em um único ZIP...');
    await archive.finalize();
    await uploadPromise;

    await this.updateStep(job, 100, 'ZIP gerado com sucesso!');
    this.logger.log(`[Job ${job.id}] ZIP disponível: ${minioKey} (${zipName})`);

    return { minioKey, zipName };
  }
}
