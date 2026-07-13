import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Job, Queue } from 'bullmq';
import archiver = require('archiver');
import pLimit from 'p-limit';
import { PassThrough } from 'stream';
import { EXPORT_ZIP_QUEUE } from '../queues/queues.module';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import {
  ZipEntryInput,
  buildSubjectDataZipPath,
  buildDeliveryZipFileName,
  buildDeviceSubZipPath,
  buildSamsungDataFileZipPath,
  createZipBufferFromEntries,
  deviceGroupKey,
  extractTaskCodeFromFilename,
  formatCollectionDateForMetadata,
  getDeliveryDateFolder,
  getUniqueFilename,
  inferSamsungDevice,
  inferSamsungProtocol,
  isSamsungExcludedPublicIdentifier,
  isSamsungSmartphoneTask,
  isSpeechTask,
  samsungPdfReportDataPath,
  sanitizeExternalDocBaseName,
  toSamsungDeviceFolder,
  toSamsungSubjectId,
  toStageFolder,
  buildSamsungActiveTaskFilename,
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
    const deviceGroups = new Map<string, ZipEntryInput[]>();

    const addToDeviceGroup = (key: string, fileName: string, buffer: Buffer) => {
      const list = deviceGroups.get(key) || [];
      list.push({ name: fileName, buffer });
      deviceGroups.set(key, list);
    };

    await this.updateStep(job, 0, 'Iniciando geração do ZIP...');
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

    await this.updateStep(job, 5, `Montando ZIP de entrega ${deliveryDate}...`);

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

    archive.append(
      `ZIP de entrega ${deliveryDate}. Dados do sujeito em Subject_Data/. Binários/PDFs agrupados em sub-ZIPs por dispositivo.`,
      { name: 'README.txt' },
    );

    const clinicalStageFolder = toStageFolder('Clinic');

    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      const questionnaire = item?.questionnaire;
      const publicIdentifier =
        questionnaire?.patient?.public_identifier ??
        questionnaire?.public_identifier ??
        '';
      const subjectId = toSamsungSubjectId(publicIdentifier);
      const cpfHash: string = questionnaire?.cpfHash ?? questionnaire?.patient?.cpf_hash ?? '';
      void formatCollectionDateForMetadata(questionnaire);

      const csvFiles = item?.csvFiles ?? {};
      const csvMetadataPrefix = `${deliveryDate}-${subjectId}`;
      const clinicalFiles = [
        { suffix: '01_demographic_anthropometric_clinical.csv', content: csvFiles.demographicAnthropometricClinical },
        { suffix: '02_neurological_assessment_updrs.csv', content: csvFiles.neurologicalAssessment },
        { suffix: '03_speech_therapy.csv', content: csvFiles.speechTherapy },
        { suffix: '04_sleep_assessment.csv', content: csvFiles.sleepAssessment },
        { suffix: '05_physiotherapy.csv', content: csvFiles.physiotherapy },
      ];
      for (const cf of clinicalFiles) {
        archive.append(cf.content ?? '', {
          name: buildSubjectDataZipPath(
            deliveryDate,
            subjectId,
            clinicalStageFolder,
            `${csvMetadataPrefix}-${cf.suffix}`,
          ),
        });
      }

      const pdfReports: any[] = Array.isArray(item?.pdfReports) ? item.pdfReports : [];
      const pdfNameCounters = new Map<string, number>();

      await Promise.all(
        pdfReports
          .filter((r: any) => Boolean(r?.id) && Boolean(r?.file_path))
          .map((report: any) =>
            limit(async () => {
              try {
                const { protocol, device } = samsungPdfReportDataPath(report.report_type);
                const stageFolder = toStageFolder(protocol);
                const deviceFolder = toSamsungDeviceFolder(device);
                const isExternalDevice = ['Baiobit', 'EMG', 'Ring', 'PSG'].includes(device);
                const baseName = isExternalDevice
                  ? sanitizeExternalDocBaseName(report.file_name ?? 'relatorio.pdf', cpfHash)
                  : report.file_name ?? 'relatorio.pdf';
                const scope = `${stageFolder}/${deviceFolder}`;
                const uniqueName = getUniqueFilename(baseName, pdfNameCounters, scope);
                const pdfBuffer = await this.minioService.getObjectBuffer(report.file_path);
                addToDeviceGroup(
                  deviceGroupKey(subjectId, stageFolder, deviceFolder),
                  uniqueName,
                  pdfBuffer,
                );
              } catch (err) {
                this.logger.warn(
                  `[Job ${job.id}] PDF omitido (${report.id}): ${err instanceof Error ? err.message : String(err)}`,
                );
              }
            }),
          ),
      );

      const binaryCollections: any[] = Array.isArray(item?.binaryCollections)
        ? item.binaryCollections
        : [];

      const collectionsToInclude = binaryCollections
        .filter((bc: any) => {
          const fileName = String(bc?.metadata?.file_name ?? '');
          if (!fileName) return false;
          const taskCode = this.resolveTaskCode(bc);
          return !isSpeechTask(taskCode);
        })
        .sort((a: any, b: any) => {
          const ta = new Date(a?.collected_at ?? a?.uploaded_at ?? 0).getTime();
          const tb = new Date(b?.collected_at ?? b?.uploaded_at ?? 0).getTime();
          if (ta !== tb) return ta - tb;
          return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
        });

      const patientBinaryIds = collectionsToInclude.map((bc: any) => bc.id).filter(Boolean);
      const binaryCsvMap = await this.getBinaryCsvDataMap(patientBinaryIds);
      const repetitionCounters = new Map<string, number>();

      for (const bc of collectionsToInclude) {
        const csvBuffer = binaryCsvMap.get(bc.id);
        if (!csvBuffer || csvBuffer.length === 0) continue;

        const fileName = String(bc?.metadata?.file_name ?? '');
        const taskCode = this.resolveTaskCode(bc);
        const isSmartphone = isSamsungSmartphoneTask(taskCode);
        const protocol = isSmartphone
          ? ('Clinic' as const)
          : inferSamsungProtocol(taskCode, fileName);
        const device = isSmartphone ? 'SP' : inferSamsungDevice(fileName, taskCode);
        const stageFolder = toStageFolder(protocol);
        const deviceFolder = toSamsungDeviceFolder(device);

        const tentativeName = buildSamsungActiveTaskFilename(
          fileName,
          subjectId,
          deliveryDate,
          bc,
          device,
          taskCode,
        );
        const extMatch = tentativeName.match(/(\.[^.]+)$/i);
        const ext = extMatch ? extMatch[1] : '.csv';
        const stem = extMatch ? tentativeName.slice(0, -ext.length) : tentativeName;
        const stemWithoutRep = stem.replace(/-Rep\d+$/i, '');
        const repKey = `${stageFolder}/${deviceFolder}/${stemWithoutRep}`;
        const nextRep = (repetitionCounters.get(repKey) ?? 0) + 1;
        repetitionCounters.set(repKey, nextRep);
        const finalName = `${stemWithoutRep}-Rep${nextRep}${ext}`;

        addToDeviceGroup(deviceGroupKey(subjectId, stageFolder, deviceFolder), finalName, csvBuffer);
        void buildSamsungDataFileZipPath(
          deliveryDate,
          subjectId,
          stageFolder,
          deviceFolder,
          finalName,
        );
      }

      const percent = Math.round(5 + ((i + 1) / filteredData.length) * 85);
      await this.updateStep(
        job,
        percent,
        `Processando paciente ${i + 1}/${filteredData.length} (${subjectId})...`,
      );
    }

    for (const [groupKey, entries] of deviceGroups.entries()) {
      const [subjectId, stageFolder, deviceFolder] = groupKey.split('::');
      if (!subjectId || !stageFolder || !deviceFolder || entries.length === 0) continue;
      const subZipBuffer = await createZipBufferFromEntries(entries);
      archive.append(subZipBuffer, {
        name: buildDeviceSubZipPath(deliveryDate, subjectId, stageFolder, deviceFolder),
      });
    }

    await this.updateStep(job, 91, 'Finalizando compactação e fazendo upload para o MinIO...');
    await archive.finalize();
    await uploadPromise;

    await this.updateStep(job, 100, 'ZIP gerado com sucesso!');
    this.logger.log(`[Job ${job.id}] ZIP disponível: ${minioKey} (${zipName})`);

    return { minioKey, zipName };
  }

  private resolveTaskCode(collection: any): string | null {
    const fromActiveTask = collection?.active_task?.task_code;
    if (typeof fromActiveTask === 'string' && fromActiveTask.trim()) {
      return fromActiveTask.trim().toUpperCase().replace(/^TA0*(\d{1,2})$/i, (_m, n) => `TA${Number(n)}`);
    }
    const fromMetadata = collection?.metadata?.task_code;
    if (typeof fromMetadata === 'string' && fromMetadata.trim()) {
      return fromMetadata.trim().toUpperCase().replace(/^TA0*(\d{1,2})$/i, (_m, n) => `TA${Number(n)}`);
    }
    const fileName = String(collection?.metadata?.file_name ?? '');
    return extractTaskCodeFromFilename(fileName);
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
