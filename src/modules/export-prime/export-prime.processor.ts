import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import archiver = require('archiver');
import pLimit from 'p-limit';
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

@Processor(EXPORT_PRIME_QUEUE)
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

  async process(job: Job<ExportPrimeJobData>): Promise<{ minioKey: string; zipName: string }> {
    this.logger.log(`[Job ${job.id}] Iniciando geração do ZIP UFAM/PRIME`);

    const filters = job.data.filters ?? {};
    const minioKey = `exports/prime/${job.id}.zip`;
    const pdfLimit = pLimit(5);
    const zipName = 'Dados_Todos_Pacientes.zip';

    await this.updateStep(job, 0, 'Iniciando geração do ZIP UFAM/PRIME...');
    await this.updateStep(job, 2, 'Consultando banco de dados...');

    const allData: any[] = await this.questionnairesService.exportAllQuestionnairesData(filters);

    if (allData.length === 0) {
      throw new Error('Nenhum questionário encontrado para os filtros informados.');
    }

    await this.updateStep(job, 5, `Montando ZIP para ${allData.length} paciente(s)...`);

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

    for (let i = 0; i < allData.length; i++) {
      const folderName = await appendUfamBulkPatientToArchive(archive, allData[i], {
        minioService: this.minioService,
        binaryCollectionsService: this.binaryCollectionsService,
        pdfLimit,
        onPdfError: (reportId, message) => {
          this.logger.warn(`[Job ${job.id}] PDF omitido (${reportId}): ${message}`);
        },
        onBinaryError: (collectionId, message) => {
          this.logger.warn(`[Job ${job.id}] Binário omitido (${collectionId}): ${message}`);
        },
      });

      const percent = Math.round(5 + ((i + 1) / allData.length) * 85);
      await this.updateStep(
        job,
        percent,
        `Montando pasta no ZIP: ${folderName} (${i + 1}/${allData.length})`,
      );
      this.logger.log(
        `[Job ${job.id}] Paciente ${i + 1}/${allData.length} (${folderName}) adicionado ao ZIP`,
      );
    }

    await this.updateStep(job, 91, 'Compactando todas as pastas em um único ZIP...');
    await archive.finalize();
    await uploadPromise;

    await this.updateStep(job, 100, 'ZIP gerado com sucesso!');
    this.logger.log(`[Job ${job.id}] ZIP disponível: ${minioKey} (${zipName})`);

    return { minioKey, zipName };
  }
}
