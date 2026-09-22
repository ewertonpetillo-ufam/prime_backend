import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Job, Queue } from 'bullmq';
import archiver = require('archiver');
import pLimit = require('p-limit');
import { PassThrough } from 'stream';
import { EXPORT_ZIP_QUEUE } from '../queues/queues.module';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { FreelivingService } from '../freeliving/freeliving.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import {
  buildGuidelinesPatientEntries,
  buildGuidelinesProjectInfoEntry,
  toGuidelinesSubjectId,
  type GuidelinesQuestionnaireExport,
} from '../export-guidelines';
import {
  buildDeliveryZipFileName,
  getDeliveryDateFolder,
  isSamsungExcludedPublicIdentifier,
  isSamsungExcludedPsgLaudo,
} from '../samsung-sync/samsung-dataset.utils';

interface ExportZipJobData {
  filters?: {
    patientStart?: string;
    patientEnd?: string;
    dateStart?: string;
    dateEnd?: string;
  };
  cancelled?: boolean;
}

@Processor(EXPORT_ZIP_QUEUE, {
  concurrency: 1,
  lockDuration: 2 * 60 * 60 * 1000,
})
export class ExportZipProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportZipProcessor.name);

  constructor(
    @InjectQueue(EXPORT_ZIP_QUEUE) private readonly exportZipQueue: Queue,
    private readonly questionnairesService: QuestionnairesService,
    private readonly freelivingService: FreelivingService,
    private readonly minioService: MinioStorageService,
    @InjectDataSource() private readonly db: DataSource,
  ) {
    super();
  }

  private async updateStep(job: Job<ExportZipJobData>, percent: number, step: string) {
    await job.updateProgress({ percent, step } as unknown as number);
  }

  private async assertNotCancelled(job: Job<ExportZipJobData>) {
    const fresh = await this.exportZipQueue.getJob(String(job.id));
    if (fresh?.data?.cancelled) {
      throw new Error('Exportação cancelada pelo usuário');
    }
  }

  async process(job: Job<ExportZipJobData>): Promise<{ minioKey: string; zipName: string }> {
    this.logger.log(`[Job ${job.id}] Iniciando geração do ZIP Samsung`);

    const filters = job.data.filters ?? {};
    const minioKey = `exports/temp/${job.id}.zip`;
    const limit = pLimit(3);
    const deliveryDate = getDeliveryDateFolder();
    const zipName = buildDeliveryZipFileName(deliveryDate);

    await this.updateStep(job, 0, 'Iniciando geração do ZIP Samsung...');
    await this.assertNotCancelled(job);

    await this.updateStep(job, 2, 'Consultando banco de dados...');
    const questionnaireIds =
      await this.questionnairesService.listQuestionnaireIdsForExport(filters);

    const allData: any[] = [];
    for (const questionnaireId of questionnaireIds) {
      await this.assertNotCancelled(job);
      allData.push(
        await this.questionnairesService.exportQuestionnaireData(questionnaireId, {
          skipPresignedUrls: true,
        }),
      );
    }

    const filteredData = allData.filter(
      (item: any) =>
        !isSamsungExcludedPublicIdentifier(
          item?.questionnaire?.patient?.public_identifier ??
            item?.questionnaire?.public_identifier,
        ),
    );

    if (filteredData.length === 0) {
      throw new Error('Nenhum questionário encontrado para os filtros informados.');
    }

    const bySubject = new Map<string, any[]>();
    for (const item of filteredData) {
      const publicId =
        item?.questionnaire?.patient?.public_identifier ??
        item?.questionnaire?.public_identifier ??
        '';
      const subjectId = toGuidelinesSubjectId(publicId);
      const list = bySubject.get(subjectId) || [];
      list.push(item);
      bySubject.set(subjectId, list);
    }

    await this.updateStep(job, 5, `Montando ZIP Samsung ${deliveryDate}...`);

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

    const projectInfo = buildGuidelinesProjectInfoEntry();
    archive.append(projectInfo.buffer!, { name: projectInfo.zipPath });

    let subjectIndex = 0;
    const subjectTotal = bySubject.size;
    for (const [subjectId, items] of bySubject.entries()) {
      await this.assertNotCancelled(job);
      subjectIndex += 1;

      const binaryPayloadById = new Map<string, Buffer>();
      const allBinaryIds: string[] = [];
      for (const item of items) {
        for (const bc of item?.binaryCollections || []) {
          if (bc?.id) allBinaryIds.push(bc.id);
        }
      }
      const binaryMap = await this.getBinaryCsvDataMap(allBinaryIds);
      for (const [id, buf] of binaryMap) binaryPayloadById.set(id, buf);

      const exportItems: GuidelinesQuestionnaireExport[] = items.map((item) => ({
        questionnaire: item.questionnaire,
        csvFiles: item.csvFiles,
        pdfReports: (item.pdfReports || []).filter((r: any) => {
          if (!r?.id || !r?.file_path) return false;
          return !isSamsungExcludedPsgLaudo(
            r.report_type,
            r.file_name || '',
            r.mime_type,
          );
        }),
        binaryCollections: item.binaryCollections || [],
      }));

      const pdfBuffers = new Map<string, Buffer>();
      const uniqueReports = new Map<string, NonNullable<GuidelinesQuestionnaireExport['pdfReports']>[number]>();
      for (const exp of exportItems) {
        for (const report of exp.pdfReports || []) {
          if (report?.id) uniqueReports.set(String(report.id), report);
        }
      }
      await Promise.all(
        [...uniqueReports.values()].map((report) =>
          limit(async () => {
            try {
              if (!report?.file_path || !report.id) return;
              const buf = await this.minioService.getObjectBuffer(report.file_path);
              pdfBuffers.set(String(report.id), buf);
            } catch (err) {
              this.logger.warn(
                `[Job ${job.id}] PDF omitido (${report?.id}): ${
                  err instanceof Error ? err.message : String(err)
                }`,
              );
            }
          }),
        ),
      );

      for (const exp of exportItems) {
        exp.pdfReports = (exp.pdfReports || []).filter((r) =>
          pdfBuffers.has(String(r?.id)),
        );
      }

      let freeLivingDiaryCsv: string | null = null;
      const patientId =
        items[0]?.questionnaire?.patient?.id ||
        items[0]?.questionnaire?.patient_id ||
        null;
      const publicIdentifier =
        items[0]?.questionnaire?.patient?.public_identifier ??
        items[0]?.questionnaire?.public_identifier ??
        subjectId;
      try {
        if (patientId) {
          freeLivingDiaryCsv =
            await this.freelivingService.buildDiaryQuestionnaireCsvForPatient(
              patientId,
              publicIdentifier,
            );
          const lines = (freeLivingDiaryCsv || '').trim().split('\n');
          if (lines.length <= 1) freeLivingDiaryCsv = null;
        }
      } catch (err) {
        this.logger.warn(
          `[Job ${job.id}] Diário Free Living omitido (${subjectId}): ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }

      const packed = buildGuidelinesPatientEntries({
        publicIdentifier,
        exportItems,
        binaryPayloadById,
        pdfBufferByReportId: pdfBuffers,
        freeLivingDiaryCsv,
        onlyPendingBinaries: false,
        patientEverSynced: false,
      });

      for (const entry of packed.entries) {
        if (entry.buffer) {
          archive.append(entry.buffer, { name: entry.zipPath });
        }
      }

      const percent = Math.round(5 + (subjectIndex / subjectTotal) * 85);
      await this.updateStep(
        job,
        percent,
        `Processando paciente ${subjectIndex}/${subjectTotal} (${subjectId})...`,
      );
    }

    await this.updateStep(job, 91, 'Finalizando compactação e upload MinIO...');
    await archive.finalize();
    await uploadPromise;

    await this.updateStep(job, 100, 'ZIP Samsung gerado com sucesso!');
    this.logger.log(`[Job ${job.id}] ZIP disponível: ${minioKey} (${zipName})`);

    return { minioKey, zipName };
  }

  private async getBinaryCsvDataMap(ids: string[]): Promise<Map<string, Buffer>> {
    if (ids.length === 0) return new Map();
    const rows: Array<{ id: string; csv_data: Buffer | null }> = await this.db.query(
      `SELECT id, csv_data FROM binary_collections WHERE id = ANY($1::uuid[])`,
      [ids],
    );
    const map = new Map<string, Buffer>();
    for (const row of rows) {
      if (row?.id && row?.csv_data) {
        map.set(row.id, Buffer.from(row.csv_data));
      }
    }
    return map;
  }
}
