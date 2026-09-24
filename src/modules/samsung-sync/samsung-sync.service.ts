import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import pLimit = require('p-limit');
import archiver = require('archiver');
import {
  SamsungSyncRun,
  SamsungSyncRunStatus,
} from '../../entities/samsung-sync-run.entity';
import {
  SamsungSyncItemAction,
  SamsungSyncRunItem,
} from '../../entities/samsung-sync-run-item.entity';
import { withPgRetry } from '../../common/database/pg-transient';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { FreelivingService } from '../freeliving/freeliving.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import { ArtifactoryService } from './artifactory.service';
import {
  buildGuidelinesCollectionZipPath,
  buildGuidelinesPatientEntries,
  buildGuidelinesProjectInfoEntry,
  resolveGuidelinesTaskCode,
  shouldIncludeSpeechBinary,
  toGuidelinesSubjectId,
  type GuidelinesBinaryInput,
  type GuidelinesPackEntry,
  type GuidelinesQuestionnaireExport,
} from '../export-guidelines';
import {
  DeliveryMetadataRow,
  SAMSUNG_SYNC_PROGRESS_STEPS,
  ZipEntryInput,
  buildArchiveEntryDownloadUrl,
  buildDataZipArtifactPath,
  buildDeliveryMetadataCsv,
  buildDeliveryZipFileName,
  buildDeviceSubZipPath,
  buildMetadataCsvArtifactPath,
  buildSamsungActiveTaskFilename,
  buildSamsungDataFileZipPath,
  cleanupSamsungSyncTempDir,
  createZipFileFromEntries,
  ensureSamsungSyncTempDir,
  getDeliveryZipFilePath,
  isDeliveryZipReady,
  deviceGroupKey,
  openDeliveryZipWriter,
  extractTaskCodeFromFilename,
  formatCollectionDateForMetadata,
  getDeliveryDateFolder,
  getUniqueFilename,
  inferSamsungDevice,
  inferSamsungProtocol,
  isSamsungExcludedPublicIdentifier,
  isSamsungExcludedPsgLaudo,
  isSamsungSmartphoneTask,
  isSpeechTask,
  samsungPdfReportDataPath,
  sanitizeExternalDocBaseName,
  samsungStep,
  toDateFolder,
  toSamsungDeviceFolder,
  toStageFolder,
} from './samsung-dataset.utils';

type PendingFile = {
  id: string;
  patient_cpf_hash: string;
  metadata: Record<string, any> | null;
  file_hash: string | null;
  file_sync_pending: boolean;
  deleted_pending: boolean;
  collected_at: string | null;
};

type PendingPatient = {
  id: string;
  full_name: string;
  public_identifier: string | null;
  sync_version: string;
  sync_pending_at: string | null;
  synced_at: string | Date | null;
  files: PendingFile[];
};

type SyncRunFilters = {
  patientStart?: string;
  patientEnd?: string;
  dateStart?: string;
  dateEnd?: string;
};

type QuestionnaireExportItem = {
  questionnaire?: {
    id?: string;
    createdAt?: string | Date | null;
    collection_date?: string | Date | null;
    data?: { dataColeta?: string | null };
    public_identifier?: string | null;
    patient?: { public_identifier?: string | null; cpf_hash?: string } | null;
    cpfHash?: string;
  };
  csvFiles?: Record<string, string>;
  pdfReports?: Array<{
    id?: string;
    report_type?: string;
    file_name?: string;
    file_path?: string | null;
    file_sync_pending?: boolean;
    download_path?: string;
    presigned_download_url?: string | null;
    [key: string]: any;
  }>;
  binaryCollections?: Array<{
    id: string;
    metadata?: Record<string, any> | null;
    collected_at?: string | Date | null;
    download_path?: string;
    repetitions_count?: number;
    active_task?: { task_code?: string | null } | null;
    file_sync_pending?: boolean;
    deleted_pending?: boolean;
  }>;
};


// DATASET_ROOT is now computed per-run from the ZIP name (see executeRun)

@Injectable()
export class SamsungSyncService implements OnModuleInit {
  private readonly logger = new Logger(SamsungSyncService.name);
  private readonly repoPatients: string;
  private readonly repoCollections: string;
  private readonly repoZip: string;
  private readonly cancelledRunIds = new Set<string>();
  private readonly runAbortControllers = new Map<string, AbortController>();

  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectRepository(SamsungSyncRun)
    private readonly syncRunRepository: Repository<SamsungSyncRun>,
    @InjectRepository(SamsungSyncRunItem)
    private readonly syncRunItemRepository: Repository<SamsungSyncRunItem>,
    private readonly questionnairesService: QuestionnairesService,
    private readonly freelivingService: FreelivingService,
    private readonly artifactoryService: ArtifactoryService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioStorageService,
  ) {
    this.repoPatients =
      this.configService.get<string>('ARTIFACTORY_REPO_PATIENTS') ||
      'srbr-ufamprime-generic-local';
    this.repoCollections =
      this.configService.get<string>('ARTIFACTORY_REPO_COLLECTIONS') ||
      this.repoPatients;
    this.repoZip =
      this.configService.get<string>('ARTIFACTORY_REPO_ZIP') || this.repoCollections;
  }

  async onModuleInit() {
    this.attachPoolErrorHandler();
    await this.recoverStaleRuns();

    const enabled =
      (this.configService.get<string>('SAMSUNG_SYNC_CRON_ENABLED') || 'false') ===
      'true';
    if (!enabled) return;

    const intervalMs = Number(
      this.configService.get<string>('SAMSUNG_SYNC_INTERVAL_MS') ||
        6 * 60 * 60 * 1000,
    );
    this.logger.log(`Scheduler de Entrega Samsung habilitado. intervalMs=${intervalMs}`);
    setInterval(() => {
      this.logger.log('Disparando Entrega Samsung por scheduler');
      void this.runSync(null, 'scheduler', {});
    }, intervalMs);
  }

  /** Evita que erros assíncronos do pg-pool derrubem o processo Nest. */
  private attachPoolErrorHandler() {
    const driver = this.db.driver as { master?: NodeJS.EventEmitter };
    const pool = driver?.master;
    if (!pool || typeof pool.on !== 'function') return;
    pool.on('error', (error: Error) => {
      this.logger.error(
        `Erro no pool PostgreSQL (não fatal): ${error?.message || String(error)}`,
      );
    });
  }

  private async recoverStaleRuns(): Promise<void> {
    const running = await this.syncRunRepository.find({
      where: { status: SamsungSyncRunStatus.RUNNING },
    });
    for (const run of running) {
      this.cancelledRunIds.delete(run.id);
      this.runAbortControllers.delete(run.id);
      const zipReady = await isDeliveryZipReady(run.id);
      if (this.canResumeZipUpload(run, zipReady)) {
        this.logger.warn(
          `Run ${run.id}: ZIP de entrega ainda no disco — retomando PUT para o BART após reinício`,
        );
        setTimeout(() => {
          void this.resumeZipUpload(run).catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Run ${run.id}: falha ao retomar upload do ZIP: ${message}`);
          });
        }, 0);
        continue;
      }
      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.FAILED,
        finished_at: new Date(),
        error_message: 'Interrompido por reinício do servidor',
      });
      await cleanupSamsungSyncTempDir(run.id);
      this.logger.warn(`Run órfão ${run.id} marcado como failed após reinício`);
    }
  }

  private canResumeZipUpload(run: SamsungSyncRun, zipReady: boolean): boolean {
    const summary = (run.summary || {}) as Record<string, unknown>;
    const step = Number(summary.currentStepIndex ?? 0);
    return (
      zipReady &&
      step >= 6 &&
      typeof summary.zipPath === 'string' &&
      typeof summary.zipName === 'string' &&
      typeof summary.deliveryDate === 'string' &&
      Array.isArray(summary.metadataRows) &&
      Array.isArray(summary.patientsReadyForConfirm)
    );
  }

  async findActiveRunningRun(): Promise<SamsungSyncRun | null> {
    return this.syncRunRepository.findOne({
      where: { status: SamsungSyncRunStatus.RUNNING },
      order: { started_at: 'DESC' },
    });
  }

  private toDateFolder(value: string | Date | null | undefined): string {
    return toDateFolder(value);
  }

  private isSamsungExcludedPublicIdentifier(publicIdentifier?: string | null): boolean {
    return isSamsungExcludedPublicIdentifier(publicIdentifier);
  }

  private extractTaskCodeFromFilename(fileName: string): string | null {
    return extractTaskCodeFromFilename(fileName);
  }

  private isSpeechTask(taskCode: string | null): boolean {
    return isSpeechTask(taskCode);
  }

  private isSamsungSmartphoneTask(taskCode: string | null): boolean {
    return isSamsungSmartphoneTask(taskCode);
  }

  private inferSamsungProtocol(taskCode: string | null, fileName: string): 'Clinic' | 'Sleep' | 'Free-living' {
    return inferSamsungProtocol(taskCode, fileName);
  }

  private inferSamsungDevice(fileName: string, taskCode?: string | null): string {
    return inferSamsungDevice(fileName, taskCode);
  }

  private toStageFolder(protocol: 'Clinic' | 'Sleep' | 'Free-living'): string {
    return toStageFolder(protocol);
  }

  private toSamsungDeviceFolder(device: string): string {
    return toSamsungDeviceFolder(device);
  }

  private buildSamsungActiveTaskFilename(
    rawFileName: string,
    subjectId: string,
    collectionDate: string,
    file: PendingFile,
    device: string,
    trustedTaskCode?: string | null,
  ): string {
    return buildSamsungActiveTaskFilename(
      rawFileName,
      subjectId,
      collectionDate,
      file,
      device,
      trustedTaskCode,
    );
  }

  private toSubjectId(publicIdentifier?: string | null): string {
    return toGuidelinesSubjectId(publicIdentifier);
  }

  private getPatientPath(patient: PendingPatient): {
    subjectId: string;
    dateFolder: string;
  } {
    const subjectId = this.toSubjectId(patient.public_identifier);
    const dateFolder = this.toDateFolder(patient.sync_pending_at);
    return {
      subjectId,
      dateFolder,
    };
  }

  private resolveTaskCode(
    metadata: Record<string, any> | null | undefined,
    activeTask: { task_code?: string | null } | null | undefined,
    fileName: string,
  ): string | null {
    return resolveGuidelinesTaskCode(metadata, activeTask, fileName);
  }

  private getCollectionPath(
    patient: PendingPatient,
    file: PendingFile,
    fixedDate?: string,
  ): string {
    const originalName =
      (file.metadata?.file_name as string | undefined) || `${file.id}.csv`;
    const taskCode = this.resolveTaskCode(file.metadata, null, originalName);
    if (!shouldIncludeSpeechBinary(taskCode, originalName)) {
      return '';
    }
    const collectionDate = fixedDate || getDeliveryDateFolder();
    const zipPath = buildGuidelinesCollectionZipPath({
      publicIdentifier: patient.public_identifier,
      fileName: originalName,
      taskCode,
      sessionDate: file.collected_at || collectionDate,
    });
    if (!zipPath) return '';
    return zipPath;
  }

  private getCollectionPathInZip(
    patient: PendingPatient,
    file: PendingFile,
    fixedDate: string,
  ): string {
    const path = this.getCollectionPath(patient, file, fixedDate);
    if (!path) return '';
    return path;
  }

  private samsungPdfReportDataPath(reportType: string | undefined): {
    protocol: 'Clinic' | 'Sleep' | 'Free-living';
    device: string;
  } {
    return samsungPdfReportDataPath(reportType);
  }

  private sanitizeExternalDocBaseName(rawName: string, cpfHash: string): string {
    return sanitizeExternalDocBaseName(rawName, cpfHash);
  }

  private getUniqueFilename(
    baseName: string,
    counters: Map<string, number>,
    scope = '',
  ): string {
    return getUniqueFilename(baseName, counters, scope);
  }

  private async downloadFileAsBuffer(
    primaryUrl?: string | null,
    fallbackUrl?: string | null,
  ): Promise<Buffer | null> {
    const candidates = [primaryUrl, fallbackUrl].filter(Boolean) as string[];
    for (const url of candidates) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const res = await fetch(url, { method: 'GET' });
          if (!res.ok) break;
          const ab = await res.arrayBuffer();
          return Buffer.from(ab);
        } catch (error) {
          const retriable =
            attempt < maxAttempts &&
            (error instanceof TypeError ||
              (error instanceof Error &&
                /fetch|network|aborted|Failed to fetch|ECONNRESET|ERR_NETWORK/i.test(
                  error.message,
                )));
          if (!retriable) break;
          await new Promise((resolve) => setTimeout(resolve, attempt * 300));
        }
      }
    }
    return null;
  }

  private async validateMinioConnectivityQuick(
    timeoutMs = 5000,
  ): Promise<{ ok: boolean; warning?: string }> {
    if (!this.minioService.isEnabled()) {
      return { ok: false, warning: 'MinIO não configurado (MINIO_* ausente).' };
    }
    const endpoint = this.minioService.getEndpoint();
    const pingOk = await this.minioService.ping(timeoutMs);
    if (pingOk) {
      return { ok: true };
    }
    return {
      ok: false,
      warning:
        `MinIO inacessível em ${endpoint}. PDFs (Baiobit, EMG, PSG) não serão incluídos. ` +
        'Em dev local, mantenha o túnel SSH: ssh -N -L 9000:127.0.0.1:9000 -L 9001:127.0.0.1:9001 usuario@servidor',
    };
  }

  private async validateBartConnectivityQuick(
    timeoutMs = 5000,
  ): Promise<{ ok: boolean; warning?: string }> {
    try {
      const pingResult = await Promise.race([
        this.artifactoryService.ping(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
      ]);
      if (pingResult) {
        return { ok: true };
      }
      return {
        ok: false,
        warning: `Validação rápida do BART excedeu ${timeoutMs}ms; seguindo execução e validando novamente no upload.`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'falha desconhecida na conectividade';
      return {
        ok: false,
        warning: `Falha na validação rápida do BART (${message}); seguindo execução e validando novamente no upload.`,
      };
    }
  }

  private logMem(context: string, zipBytes?: number) {
    const mem = process.memoryUsage();
    const zipPart =
      zipBytes != null ? ` zip=${(zipBytes / 1048576).toFixed(1)}MB` : '';
    this.logger.log(
      `${context}${zipPart} heap=${(mem.heapUsed / 1048576).toFixed(0)}MB rss=${(mem.rss / 1048576).toFixed(0)}MB`,
    );
  }

  private async downloadMinioToTempFile(
    tempDir: string,
    objectKey: string,
  ): Promise<string | null> {
    const destPath = join(tempDir, `minio-${randomUUID()}`);
    try {
      await this.minioService.getObjectToFile(objectKey, destPath);
      return destPath;
    } catch (error) {
      await unlink(destPath).catch(() => undefined);
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`MinIO ${objectKey}: ${message}`);
      return null;
    }
  }

  private async flushDeviceGroupsToArchive(
    runId: string,
    tempDir: string,
    deviceGroups: Map<string, ZipEntryInput[]>,
    archive: archiver.Archiver,
    metadataRows: DeliveryMetadataRow[],
    deliveryDate: string,
    summary: { uploadedFiles: number },
  ): Promise<void> {
    // Legacy sub-ZIP path retained for tests; Guidelines packing uses appendGuidelinesEntries.
    for (const [groupKey, entries] of deviceGroups.entries()) {
      if (entries.length === 0) continue;
      const [subjectId, stageFolder, deviceFolder] = groupKey.split('::');
      if (!subjectId || !stageFolder || !deviceFolder) continue;

      const subZipTempPath = join(tempDir, `sub-${randomUUID()}.zip`);
      try {
        await createZipFileFromEntries(entries, subZipTempPath);
        const subZipInnerPath = buildDeviceSubZipPath(
          deliveryDate,
          subjectId,
          stageFolder,
          deviceFolder,
        );
        archive.append(createReadStream(subZipTempPath), { name: subZipInnerPath });
        const subZipGenerationDate = deliveryDate.replace(
          /(\d{4})(\d{2})(\d{2})/,
          '$1-$2-$3',
        );
        this.registerDeliveryMetadataEntry(
          metadataRows,
          deliveryDate,
          subZipInnerPath,
          subZipGenerationDate,
        );
        summary.uploadedFiles += 1;
        await this.appendRunItem({
          runId,
          action: SamsungSyncItemAction.METADATA,
          repo: this.repoZip,
          path: subZipInnerPath,
          uploaded: false,
          message: `Sub-ZIP do dispositivo ${deviceFolder} incluído no ZIP de entrega`,
        });
      } finally {
        await unlink(subZipTempPath).catch(() => undefined);
        await Promise.all(
          entries.map((entry) =>
            entry.filePath ? unlink(entry.filePath).catch(() => undefined) : Promise.resolve(),
          ),
        );
      }
      deviceGroups.delete(groupKey);
    }
  }

  private async appendGuidelinesEntries(
    runId: string,
    patientId: string | undefined,
    entries: GuidelinesPackEntry[],
    archive: archiver.Archiver,
    metadataRows: DeliveryMetadataRow[],
    deliveryDate: string,
    summary: { uploadedFiles: number },
  ): Promise<void> {
    for (const entry of entries) {
      if (entry.filePath) {
        archive.append(createReadStream(entry.filePath), { name: entry.zipPath });
      } else if (entry.buffer) {
        archive.append(entry.buffer, { name: entry.zipPath });
      } else {
        continue;
      }
      const generationDate =
        entry.generationDate ||
        deliveryDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      this.registerDeliveryMetadataEntry(
        metadataRows,
        deliveryDate,
        entry.zipPath,
        generationDate,
      );
      summary.uploadedFiles += 1;
      await this.appendRunItem({
        runId,
        patientId,
        action: SamsungSyncItemAction.METADATA,
        repo: this.repoZip,
        path: entry.zipPath,
        uploaded: false,
        message: entry.message || 'Arquivo Samsung incluído no ZIP',
      });
      if (entry.filePath) {
        await unlink(entry.filePath).catch(() => undefined);
      }
    }
  }

  private buildDeliveryZipName(deliveryDate: string): string {
    return buildDeliveryZipFileName(deliveryDate);
  }

  private registerDeliveryMetadataEntry(
    metadataRows: DeliveryMetadataRow[],
    deliveryDate: string,
    entryPathInsideZip: string,
    generationDate: string,
  ): void {
    metadataRows.push({
      generation_date: generationDate,
      download_url: buildArchiveEntryDownloadUrl(
        this.artifactoryService.getPublicBaseUrl(),
        this.repoZip,
        deliveryDate,
        entryPathInsideZip,
      ),
    });
  }

  private normalizePdfReportType(report: {
    report_type?: string;
    reportType?: string;
    [key: string]: unknown;
  }): string | undefined {
    const raw = report?.report_type ?? report?.reportType;
    return raw != null ? String(raw) : undefined;
  }

  private isExcludedPsgLaudo(report: {
    report_type?: string;
    reportType?: string;
    file_name?: string;
    mime_type?: string | null;
  }): boolean {
    return isSamsungExcludedPsgLaudo(
      this.normalizePdfReportType(report),
      report.file_name || '',
      report.mime_type,
    );
  }

  private async getPendingPdfReportsForPatient(
    patientId: string,
    patientEverSynced: boolean,
  ): Promise<
    Array<{
      id: string;
      report_type?: string;
      file_name?: string;
      mime_type?: string | null;
      file_path?: string | null;
      file_sync_pending?: boolean;
      collection_date?: string | Date | null;
      questionnaire_created_at?: string | Date | null;
      cpf_hash?: string;
    }>
  > {
    const rows = await this.db.query(
      `
      SELECT pr.id,
             pr.report_type,
             pr.file_name,
             pr.mime_type,
             pr.file_path,
             pr.file_sync_pending,
             q.collection_date,
             q.created_at AS questionnaire_created_at,
             p.cpf_hash
        FROM pdf_reports pr
        JOIN questionnaires q ON q.id = pr.questionnaire_id
        JOIN patients p ON p.id = q.patient_id
       WHERE q.patient_id = $1::uuid
         AND pr.file_path IS NOT NULL
         AND ($2::boolean = FALSE OR pr.file_sync_pending = TRUE)
         AND NOT pdf_report_is_samsung_psg_laudo_excluded(
           pr.report_type, pr.file_name, pr.mime_type
         )
       ORDER BY q.created_at ASC
      `,
      [patientId, patientEverSynced],
    );
    return rows || [];
  }

  private sanitizeStorageRelativePath(relativePath: string): string {
    const normalized = (relativePath || '')
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '');
    const parts = normalized.split('/').filter((p) => p && p !== '.' && p !== '..');
    return parts.join('/');
  }

  private async getBinaryPayloadMap(binaryIds: string[]) {
    if (binaryIds.length === 0) return new Map<string, Buffer>();
    const rows = await this.db.query(
      `
      SELECT id, csv_data
        FROM binary_collections
       WHERE id = ANY($1::uuid[])
      `,
      [binaryIds],
    );
    const map = new Map<string, Buffer>();
    for (const row of rows) {
      if (row?.id && row?.csv_data) {
        map.set(row.id, Buffer.from(row.csv_data));
      }
    }
    return map;
  }

  private parseIdentifierRange(raw?: string): number | null {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, '');
    if (!digits) return null;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeFilters(filters?: SyncRunFilters): SyncRunFilters {
    return {
      patientStart: filters?.patientStart?.trim() || undefined,
      patientEnd: filters?.patientEnd?.trim() || undefined,
      dateStart: filters?.dateStart?.trim() || undefined,
      dateEnd: filters?.dateEnd?.trim() || undefined,
    };
  }

  private async appendRunItem(params: {
    runId: string;
    patientId?: string | null;
    collectionId?: string | null;
    action: SamsungSyncItemAction;
    repo: string;
    path: string;
    sha256?: string | null;
    uploaded?: boolean;
    message?: string;
    error?: string;
  }) {
    await this.syncRunItemRepository.save(
      this.syncRunItemRepository.create({
        run_id: params.runId,
        patient_id: params.patientId ?? null,
        binary_collection_id: params.collectionId ?? null,
        action: params.action,
        artifact_repo: params.repo,
        artifact_path: params.path,
        sha256: params.sha256 ?? null,
        uploaded: Boolean(params.uploaded),
        message: params.message ?? null,
        error_message: params.error ?? null,
      }),
    );
  }

  async getPendingSummary() {
    // Agrega pendências em CTEs (1 scan cada) em vez de LEFT JOIN + EXISTS
    // correlacionados por paciente — muito mais rápido na tela de sync.
    const rows = await this.db.query(`
      WITH pending_bc AS (
        SELECT
          bc.patient_cpf_hash,
          COUNT(*)::int AS pending_files
        FROM binary_collections bc
        WHERE (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)
          AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
        GROUP BY bc.patient_cpf_hash
      ),
      pending_pdf AS (
        SELECT
          q.patient_id,
          COUNT(*)::int AS pending_pdf_reports
        FROM pdf_reports pr
        JOIN questionnaires q ON q.id = pr.questionnaire_id
        WHERE pr.file_sync_pending = TRUE
          AND NOT pdf_report_is_samsung_psg_laudo_excluded(
            pr.report_type, pr.file_name, pr.mime_type
          )
        GROUP BY q.patient_id
      )
      SELECT
        p.id,
        p.full_name,
        p.public_identifier,
        p.sync_pending,
        p.sync_pending_at,
        p.synced_at,
        COALESCE(pb.pending_files, 0)::int AS pending_files,
        COALESCE(pp.pending_pdf_reports, 0)::int AS pending_pdf_reports,
        (
          p.synced_at IS NOT NULL
          AND COALESCE(pb.pending_files, 0) = 0
          AND COALESCE(pp.pending_pdf_reports, 0) = 0
        ) AS is_bart_synced
      FROM patients p
      LEFT JOIN pending_bc pb ON pb.patient_cpf_hash = p.cpf_hash
      LEFT JOIN pending_pdf pp ON pp.patient_id = p.id
      WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
      ORDER BY
        (
          p.sync_pending = TRUE
          OR p.synced_at IS NULL
          OR COALESCE(pb.pending_files, 0) > 0
          OR COALESCE(pp.pending_pdf_reports, 0) > 0
        ) DESC,
        p.sync_pending DESC,
        p.sync_pending_at ASC NULLS LAST,
        p.synced_at DESC NULLS LAST
    `);
    return rows;
  }

  async getHistory(limit = 20) {
    const runs = await this.syncRunRepository.find({
      order: { started_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return runs;
  }

  async getRunStatus(runId: string) {
    return this.syncRunRepository.findOne({ where: { id: runId } });
  }

  async getDirectoryTree(limit = 500) {
    const items = await this.syncRunItemRepository.find({
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 10), 2000),
    });

    return items.map((item) => ({
      run_id: item.run_id,
      action: item.action,
      repo: item.artifact_repo,
      path: item.artifact_path,
      uploaded: item.uploaded,
      created_at: item.created_at,
      sha256: item.sha256,
      error_message: item.error_message,
    }));
  }

  private patientHadPriorBartSync(patient: PendingPatient): boolean {
    const v = patient.synced_at;
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (v instanceof Date) return !Number.isNaN(v.getTime());
    return true;
  }

  private async getPendingPatients(filters?: SyncRunFilters): Promise<PendingPatient[]> {
    const normalized = this.normalizeFilters(filters);
    const patientStart = this.parseIdentifierRange(normalized.patientStart);
    const patientEnd = this.parseIdentifierRange(normalized.patientEnd);
    if (
      patientStart != null &&
      patientEnd != null &&
      Number.isFinite(patientStart) &&
      Number.isFinite(patientEnd) &&
      patientStart > patientEnd
    ) {
      throw new Error('Faixa de pacientes inválida: início maior que o fim.');
    }
    if (normalized.dateStart && normalized.dateEnd && normalized.dateStart > normalized.dateEnd) {
      throw new Error('Faixa de datas inválida: início maior que o fim.');
    }

    // Metadados apenas — csv_data (BYTEA) é carregado sob demanda via getBinaryPayloadMap
    // por paciente, evitando materializar todos os payloads de uma vez no pool/memória.
    const rows = await this.db.query(`
      SELECT
        p.id,
        p.full_name,
        p.public_identifier,
        p.sync_version,
        p.sync_pending_at,
        p.synced_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', bc.id,
              'patient_cpf_hash', bc.patient_cpf_hash,
              'metadata', bc.metadata,
              'file_hash', bc.file_hash,
              'file_sync_pending', bc.file_sync_pending,
              'deleted_pending', bc.deleted_pending,
              'collected_at', bc.collected_at
            )
          ) FILTER (
            WHERE bc.id IS NOT NULL
              AND (
                bc.file_sync_pending = TRUE
                OR bc.deleted_pending = TRUE
              )
          ),
          '[]'::json
        ) AS files
      FROM patients p
      LEFT JOIN binary_collections bc ON bc.patient_cpf_hash = p.cpf_hash
        AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
      WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
        AND (
          p.synced_at IS NULL
          OR EXISTS (
            SELECT 1
              FROM binary_collections bc2
             WHERE bc2.patient_cpf_hash = p.cpf_hash
               AND NOT binary_collection_is_samsung_speech_excluded(bc2.task_id, bc2.metadata)
               AND (bc2.file_sync_pending = TRUE OR bc2.deleted_pending = TRUE)
          )
          OR EXISTS (
            SELECT 1
              FROM pdf_reports pr2
              JOIN questionnaires q2 ON q2.id = pr2.questionnaire_id
             WHERE q2.patient_id = p.id
               AND pr2.file_sync_pending = TRUE
               AND NOT pdf_report_is_samsung_psg_laudo_excluded(
                 pr2.report_type, pr2.file_name, pr2.mime_type
               )
          )
        )
        AND ($1::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int >= $1::int)
        AND ($2::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int <= $2::int)
        AND ($3::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) >= $3::date)
        AND ($4::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) <= $4::date)
      GROUP BY p.id
      ORDER BY p.sync_pending_at ASC NULLS LAST
    `, [patientStart, patientEnd, normalized.dateStart || null, normalized.dateEnd || null]);

    return rows.map((row: any) => ({
      ...row,
      files: Array.isArray(row.files) ? row.files : [],
    }));
  }

  private async createRun(
    triggeredByUserId: string | null,
    triggerType: 'manual' | 'scheduler',
  ) {
    return this.syncRunRepository.save(
      this.syncRunRepository.create({
        status: SamsungSyncRunStatus.RUNNING,
        triggered_by_user_id: triggeredByUserId,
        trigger_type: triggerType,
      }),
    );
  }

  async runSyncAsync(
    triggeredByUserId: string | null,
    triggerType: 'manual' | 'scheduler' = 'manual',
    filters?: SyncRunFilters,
  ): Promise<{
    run_id: string;
    status: 'running';
    alreadyRunning?: boolean;
  }> {
    const existing = await this.findActiveRunningRun();
    if (existing) {
      this.logger.warn(
        `Sync Samsung já em execução (run ${existing.id}); reutilizando run existente.`,
      );
      return { run_id: existing.id, status: 'running', alreadyRunning: true };
    }

    this.logger.log(
      `Iniciando runSyncAsync. triggerType=${triggerType} userId=${triggeredByUserId ?? 'n/a'}`,
    );
    const run = await this.createRun(triggeredByUserId, triggerType);
    this.cancelledRunIds.delete(run.id);
    setTimeout(() => {
      void this.executeRun(run, filters).catch((error) => {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        if (/cancelada manualmente/i.test(message)) {
          this.logger.warn(`Run ${run.id} interrompida por cancelamento manual.`);
          return;
        }
        this.logger.error(`Falha não tratada na execução assíncrona ${run.id}: ${message}`);
      });
    }, 0);
    return { run_id: run.id, status: 'running' as const };
  }

  async runSync(
    triggeredByUserId: string | null,
    triggerType: 'manual' | 'scheduler' = 'manual',
    filters?: SyncRunFilters,
  ) {
    const existing = await this.findActiveRunningRun();
    if (existing) {
      throw new Error(`Já existe sync Samsung em execução: ${existing.id}`);
    }
    this.logger.log(
      `Iniciando runSync. triggerType=${triggerType} userId=${triggeredByUserId ?? 'n/a'}`,
    );
    const run = await this.createRun(triggeredByUserId, triggerType);
    this.cancelledRunIds.delete(run.id);
    return this.executeRun(run, filters);
  }

  async cancelRun(runId: string, requestedByUserId?: string | null) {
    const run = await this.syncRunRepository.findOne({ where: { id: runId } });
    if (!run) {
      throw new Error('Execução de sincronização não encontrada');
    }
    if (run.status !== SamsungSyncRunStatus.RUNNING) {
      return {
        run_id: runId,
        status: run.status,
        cancelled: false,
        reset: { patients: 0, binary_collections: 0, pdf_reports: 0 },
      };
    }

    this.cancelledRunIds.add(runId);
    this.runAbortControllers.get(runId)?.abort();

    const runSummary = (run.summary || {}) as Record<string, unknown>;
    const summary = {
      ...runSummary,
      currentStep: 'Cancelamento solicitado pelo usuário',
      cancelRequestedAt: new Date().toISOString(),
      cancelRequestedBy: requestedByUserId || null,
    };

    const syncFilters = (runSummary.syncFilters as SyncRunFilters | undefined) || {};
    let reset = { patients: 0, binary_collections: 0, pdf_reports: 0 };
    try {
      reset = await this.resetSyncPending(syncFilters);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Run ${runId}: falha ao redefinir pendências após cancelamento: ${message}`);
    }

    const zipPath =
      typeof runSummary.zipPath === 'string' && runSummary.zipPath.trim()
        ? runSummary.zipPath.trim()
        : null;
    if (zipPath) {
      await this.artifactoryService.deleteFile(this.repoZip, zipPath).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Run ${runId}: não foi possível remover ZIP parcial (${zipPath}): ${message}`);
      });
    }

    await cleanupSamsungSyncTempDir(runId);
    this.runAbortControllers.delete(runId);

    await this.syncRunRepository.update(runId, {
      status: SamsungSyncRunStatus.FAILED,
      finished_at: new Date(),
      error_message: 'Cancelado pelo usuário',
      summary,
    });

    this.logger.warn(`Run ${runId} cancelado. Pendências redefinidas: ${reset.patients} paciente(s).`);
    return { run_id: runId, status: 'failed', cancelled: true, reset };
  }

  private ensureRunNotCancelled(runId: string) {
    if (this.cancelledRunIds.has(runId)) {
      throw new Error('Execução cancelada manualmente');
    }
  }

  private async updateRunProgress(
    runId: string,
    summary: {
      totalPatients: number;
      syncedPatients: number;
      erroredPatients: number;
      uploadedFiles: number;
      skippedFiles: number;
      deletedFiles: number;
      errorFiles: number;
      currentStep?: string;
      currentStepIndex?: number;
      stepLabels?: readonly string[];
    },
  ) {
    await this.syncRunRepository.update(runId, {
      total_patients: summary.totalPatients,
      synced_patients: summary.syncedPatients,
      errored_patients: summary.erroredPatients,
      uploaded_files: summary.uploadedFiles,
      skipped_files: summary.skippedFiles,
      deleted_files: summary.deletedFiles,
      error_files: summary.errorFiles,
      summary,
    });
  }

  private async executeRun(run: SamsungSyncRun, filters?: SyncRunFilters) {
    const runAbort = new AbortController();
    this.runAbortControllers.set(run.id, runAbort);
    const normalizedFilters = this.normalizeFilters(filters);

    const summary: {
      totalPatients: number;
      syncedPatients: number;
      erroredPatients: number;
      uploadedFiles: number;
      skippedFiles: number;
      deletedFiles: number;
      errorFiles: number;
      zipName: string | null;
      zipPath: string | null;
      syncFilters: SyncRunFilters;
      currentStep: string;
      currentStepIndex: number;
      stepLabels: readonly string[];
      lastHeartbeatAt: string;
      deliveryDate?: string;
      metadataRows?: DeliveryMetadataRow[];
      patientsReadyForConfirm?: string[];
    } = {
      totalPatients: 0,
      syncedPatients: 0,
      erroredPatients: 0,
      uploadedFiles: 0,
      skippedFiles: 0,
      deletedFiles: 0,
      errorFiles: 0,
      zipName: null as string | null,
      zipPath: null as string | null,
      syncFilters: normalizedFilters,
      currentStep: samsungStep(0),
      currentStepIndex: 0,
      stepLabels: SAMSUNG_SYNC_PROGRESS_STEPS,
      lastHeartbeatAt: new Date().toISOString(),
    };

    const setCurrentStep = async (stepIndex: number, customMessage?: string) => {
      summary.currentStepIndex = stepIndex;
      summary.currentStep = customMessage || samsungStep(stepIndex);
      summary.lastHeartbeatAt = new Date().toISOString();
      await this.updateRunProgress(run.id, summary);
    };

    let heartbeatTimer: NodeJS.Timeout | null = null;
    const startHeartbeat = () => {
      heartbeatTimer = setInterval(() => {
        summary.lastHeartbeatAt = new Date().toISOString();
        void this.updateRunProgress(run.id, summary).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Run ${run.id}: falha no heartbeat: ${message}`);
        });
      }, 10000);
    };
    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    };

    try {
      await this.syncRunRepository.update(run.id, { summary });
      await setCurrentStep(0);
      startHeartbeat();
      this.ensureRunNotCancelled(run.id);
      const connectivity = await this.validateBartConnectivityQuick(5000);
      if (!connectivity.ok && connectivity.warning) {
        this.logger.warn(`Run ${run.id}: ${connectivity.warning}`);
        await this.appendRunItem({
          runId: run.id,
          action: SamsungSyncItemAction.SKIP,
          repo: this.repoZip,
          path: '/',
          uploaded: false,
          message: connectivity.warning,
        });
      }
      await setCurrentStep(0, 'Listando pacientes pendentes');
      const patients = await this.getPendingPatients(filters);
      this.ensureRunNotCancelled(run.id);
      summary.totalPatients = patients.length;
      await this.updateRunProgress(run.id, summary);
      this.logger.log(
        `Run ${run.id}: ${patients.length} paciente(s) pendente(s) para sincronização`,
      );

      if (patients.length === 0) {
        await this.syncRunRepository.update(run.id, {
          status: SamsungSyncRunStatus.SUCCESS,
          finished_at: new Date(),
          total_patients: 0,
          synced_patients: 0,
          errored_patients: 0,
          uploaded_files: 0,
          skipped_files: 0,
          deleted_files: 0,
          error_files: 0,
          summary,
        });
        return { run_id: run.id, status: 'success', summary };
      }

      const runPatientIds = new Set<string>();
      const patientsReadyForConfirm: string[] = [];
      const pdfReportIdsByPatient = new Map<string, Set<string>>();
      const deliveryDate = getDeliveryDateFolder();
      const zipName = this.buildDeliveryZipName(deliveryDate);
      summary.zipName = zipName;
      const zipArtifactPath = buildDataZipArtifactPath(deliveryDate);
      summary.zipPath = zipArtifactPath;
      const metadataRows: DeliveryMetadataRow[] = [];
      const syncTempDir = await ensureSamsungSyncTempDir(run.id);
      const { archive, finished: archiveFinished, filePath: zipFilePath } =
        openDeliveryZipWriter(run.id);
      const minioDownloadLimit = pLimit(2);

      await setCurrentStep(1);
      const questionnaireIds =
        await this.questionnairesService.listQuestionnaireIdsForExport(filters);
      const exportedBySubject = new Map<string, QuestionnaireExportItem[]>();
      for (const questionnaireId of questionnaireIds) {
        this.ensureRunNotCancelled(run.id);
        const item = (await this.questionnairesService.exportQuestionnaireData(
          questionnaireId,
        )) as unknown as QuestionnaireExportItem;
        const publicId =
          item?.questionnaire?.patient?.public_identifier ||
          item?.questionnaire?.public_identifier ||
          '';
        if (this.isSamsungExcludedPublicIdentifier(publicId)) continue;
        const subjectId = this.toSubjectId(publicId);
        const current = exportedBySubject.get(subjectId) || [];
        current.push(item);
        exportedBySubject.set(subjectId, current);
      }
      this.ensureRunNotCancelled(run.id);
      for (const [subjectId, items] of exportedBySubject.entries()) {
        items.sort((a, b) => {
          const aTs = new Date(a?.questionnaire?.createdAt || 0).getTime();
          const bTs = new Date(b?.questionnaire?.createdAt || 0).getTime();
          return aTs - bTs;
        });
        exportedBySubject.set(subjectId, items);
      }


      /** Evita contar 2× o mesmo skip de áudio de fala. */
      const speechSkipCountedIds = new Set<string>();

      const minioConnectivity = await this.validateMinioConnectivityQuick(8000);
      if (!minioConnectivity.ok && minioConnectivity.warning) {
        this.logger.warn(`[Run ${run.id}] ${minioConnectivity.warning}`);
        await this.appendRunItem({
          runId: run.id,
          action: SamsungSyncItemAction.SKIP,
          repo: this.repoZip,
          path: '/',
          uploaded: false,
          message: minioConnectivity.warning,
        });
      }

      // project_info.md uma vez por ZIP (nível Project)
      const projectInfoEntry = buildGuidelinesProjectInfoEntry();
      archive.append(projectInfoEntry.buffer!, { name: projectInfoEntry.zipPath });
      this.registerDeliveryMetadataEntry(
        metadataRows,
        deliveryDate,
        projectInfoEntry.zipPath,
        deliveryDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      );
      summary.uploadedFiles += 1;
      await this.appendRunItem({
        runId: run.id,
        action: SamsungSyncItemAction.METADATA,
        repo: this.repoZip,
        path: projectInfoEntry.zipPath,
        uploaded: false,
        message: 'project_info.md incluído no ZIP Samsung',
      });

      for (const patient of patients) {
        this.ensureRunNotCancelled(run.id);
        if (this.isSamsungExcludedPublicIdentifier(patient.public_identifier)) continue;
        runPatientIds.add(patient.id);
        try {
          let patientHasCriticalError = false;
          const patientEverSynced = this.patientHadPriorBartSync(patient);
          const subjectId = this.toSubjectId(patient.public_identifier);
          const subjectExportItems = (exportedBySubject.get(subjectId) ||
            []) as GuidelinesQuestionnaireExport[];

          await setCurrentStep(2, `${samsungStep(2)} (${subjectId})`);
          await setCurrentStep(3, `${samsungStep(3)} (${subjectId})`);

          // Baixar PDFs do MinIO para temp
          const pdfTempPathByReportId = new Map<string, string>();
          for (const exportedItem of subjectExportItems) {
            for (const report of exportedItem?.pdfReports || []) {
              this.ensureRunNotCancelled(run.id);
              if (
                patientEverSynced &&
                report.file_sync_pending !== true
              ) {
                continue;
              }
              if (this.isExcludedPsgLaudo(report)) {
                summary.skippedFiles += 1;
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  action: SamsungSyncItemAction.SKIP,
                  repo: this.repoZip,
                  path: report?.file_name || 'laudo.pdf',
                  uploaded: false,
                  message:
                    'Laudo PDF de polissonografia excluído da entrega Samsung (dados pessoais)',
                });
                continue;
              }
              const pdfPath = report?.file_path as string | undefined;
              if (!pdfPath || !report?.id) continue;
              const pdfFilePath = await minioDownloadLimit(() =>
                this.downloadMinioToTempFile(syncTempDir, pdfPath),
              );
              if (!pdfFilePath) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoZip,
                  path: report.file_name || 'relatorio.pdf',
                  uploaded: false,
                  error: 'Falha ao baixar PDF do MinIO para inclusão no ZIP Samsung.',
                });
                continue;
              }
              pdfTempPathByReportId.set(String(report.id), pdfFilePath);
            }
          }

          // Fallback PDFs pendentes se não houver export do questionário
          if (subjectExportItems.length === 0) {
            const dbPdfReports = await this.getPendingPdfReportsForPatient(
              patient.id,
              patientEverSynced,
            );
            const synthetic: GuidelinesQuestionnaireExport = {
              questionnaire: {
                public_identifier: patient.public_identifier,
                patient: { public_identifier: patient.public_identifier },
              },
              csvFiles: {},
              pdfReports: [],
              binaryCollections: [],
            };
            for (const report of dbPdfReports) {
              if (this.isExcludedPsgLaudo(report)) {
                summary.skippedFiles += 1;
                continue;
              }
              const dbPdfPath = report?.file_path as string | undefined;
              if (!dbPdfPath) continue;
              const pdfFilePath = await minioDownloadLimit(() =>
                this.downloadMinioToTempFile(syncTempDir, dbPdfPath),
              );
              if (!pdfFilePath) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                continue;
              }
              pdfTempPathByReportId.set(String(report.id), pdfFilePath);
              synthetic.pdfReports!.push({
                id: report.id,
                report_type: report.report_type,
                file_name: report.file_name,
                file_path: report.file_path,
                file_sync_pending: true,
                mime_type: report.mime_type,
              });
            }
            if ((synthetic.pdfReports || []).length > 0) {
              subjectExportItems.push(synthetic);
            }
          }

          await setCurrentStep(4, `${samsungStep(4)} (${subjectId})`);

          // Merge binaries do export + arquivos pendentes do paciente
          const exportItemsForPack: GuidelinesQuestionnaireExport[] =
            subjectExportItems.map((item) => ({
              ...item,
              binaryCollections: [...(item.binaryCollections || [])],
            }));
          if (exportItemsForPack.length === 0) {
            exportItemsForPack.push({
              questionnaire: {
                public_identifier: patient.public_identifier,
                patient: { public_identifier: patient.public_identifier },
              },
              csvFiles: {},
              pdfReports: [],
              binaryCollections: [],
            });
          }
          const seenBinaryIds = new Set<string>();
          for (const item of exportItemsForPack) {
            for (const bc of item.binaryCollections || []) {
              if (bc?.id) seenBinaryIds.add(bc.id);
            }
          }
          const pendingAsBinary: GuidelinesBinaryInput[] = [];
          for (const file of patient.files || []) {
            if (!file?.id || seenBinaryIds.has(file.id)) continue;
            const fileIsPending =
              file.deleted_pending === true || file.file_sync_pending === true;
            if (patientEverSynced && !fileIsPending) continue;
            pendingAsBinary.push({
              id: file.id,
              metadata: file.metadata,
              collected_at: file.collected_at,
              file_sync_pending: file.file_sync_pending,
              deleted_pending: file.deleted_pending,
            });
          }
          exportItemsForPack[0].binaryCollections = [
            ...(exportItemsForPack[0].binaryCollections || []),
            ...pendingAsBinary,
          ];

          const allBinaryIds = exportItemsForPack
            .flatMap((i) => i.binaryCollections || [])
            .map((b) => b.id)
            .filter(Boolean);
          const binaryPayloadMap = await this.getBinaryPayloadMap(allBinaryIds);

          // Deletes pendentes
          for (const file of patient.files || []) {
            if (!file.deleted_pending) continue;
            const artifactPath = this.getCollectionPath(patient, file, deliveryDate);
            summary.deletedFiles += 1;
            await this.appendRunItem({
              runId: run.id,
              patientId: patient.id,
              collectionId: file.id,
              action: SamsungSyncItemAction.DELETE,
              repo: this.repoCollections,
              path: artifactPath || file.id,
              uploaded: false,
              message: 'Arquivo marcado para remoção — será excluído ao confirmar entrega',
            });
          }

          let freeLivingDiaryCsv: string | null = null;
          try {
            freeLivingDiaryCsv =
              await this.freelivingService.buildDiaryQuestionnaireCsvForPatient(
                patient.id,
                patient.public_identifier,
              );
            // Header-only CSV → sem diário útil
            const lines = (freeLivingDiaryCsv || '').trim().split('\n');
            if (lines.length <= 1) freeLivingDiaryCsv = null;
          } catch (err) {
            this.logger.warn(
              `Run ${run.id}: falha ao montar diário Free Living de ${subjectId}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }

          const packed = buildGuidelinesPatientEntries({
            publicIdentifier: patient.public_identifier,
            exportItems: exportItemsForPack,
            binaryPayloadById: binaryPayloadMap,
            pdfTempPathByReportId,
            freeLivingDiaryCsv,
            onlyPendingBinaries: true,
            patientEverSynced,
          });

          for (const skippedId of packed.skippedSpeechAudioIds) {
            if (!speechSkipCountedIds.has(skippedId)) {
              speechSkipCountedIds.add(skippedId);
              summary.skippedFiles += 1;
            }
          }

          // Erros de payload ausente para binários que deveriam entrar
          for (const item of exportItemsForPack) {
            for (const collection of item.binaryCollections || []) {
              if (collection.deleted_pending) continue;
              if (
                patientEverSynced &&
                collection.file_sync_pending !== true
              ) {
                continue;
              }
              const fileName = (collection?.metadata?.file_name || '').toString();
              const taskCode = this.resolveTaskCode(
                collection.metadata,
                collection.active_task,
                fileName,
              );
              if (!shouldIncludeSpeechBinary(taskCode, fileName)) continue;
              if (packed.includedCollectionIds.has(collection.id)) continue;
              if (packed.skippedSpeechAudioIds.includes(collection.id)) continue;
              if (!fileName) continue;
              if (!binaryPayloadMap.get(collection.id)) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  collectionId: collection.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoCollections,
                  path: fileName,
                  uploaded: false,
                  error: 'Payload da tarefa ativa não encontrado para inclusão no ZIP Samsung',
                });
              }
            }
          }

          for (const reportId of packed.pdfReportIds) {
            let set = pdfReportIdsByPatient.get(patient.id);
            if (!set) {
              set = new Set<string>();
              pdfReportIdsByPatient.set(patient.id, set);
            }
            set.add(reportId);
          }

          await this.appendGuidelinesEntries(
            run.id,
            patient.id,
            packed.entries,
            archive,
            metadataRows,
            deliveryDate,
            summary,
          );

          if (patientHasCriticalError) {
            summary.erroredPatients += 1;
          } else {
            summary.syncedPatients += 1;
            patientsReadyForConfirm.push(patient.id);
          }
          this.logMem(`Run ${run.id}: ${subjectId} processado (Samsung)`);
          await this.updateRunProgress(run.id, summary);
        } catch (error) {
          summary.erroredPatients += 1;
          summary.errorFiles += 1;
          const message = error instanceof Error ? error.message : 'Erro desconhecido';
          await this.appendRunItem({
            runId: run.id,
            patientId: patient.id,
            action: SamsungSyncItemAction.ERROR,
            repo: this.repoZip,
            path: '/',
            uploaded: false,
            error: message,
          });
          await this.updateRunProgress(run.id, summary);
        }
      }

      await setCurrentStep(5);
      this.ensureRunNotCancelled(run.id);
      await archive.finalize();
      await archiveFinished;
      summary.deliveryDate = deliveryDate;
      summary.metadataRows = metadataRows;
      summary.patientsReadyForConfirm = patientsReadyForConfirm;
      await setCurrentStep(6);
      this.ensureRunNotCancelled(run.id);
      await this.uploadZipAndMetadata(
        run,
        summary,
        zipFilePath,
        zipArtifactPath,
        zipName,
        metadataRows,
        deliveryDate,
        runAbort.signal,
      );

      await setCurrentStep(7);
      this.ensureRunNotCancelled(run.id);
      if (patientsReadyForConfirm.length > 0) {
        await this.confirmRunDelivery(patientsReadyForConfirm);
      }
      await setCurrentStep(8, 'Sincronização concluída');

      const runStatus =
        summary.erroredPatients > 0 && patientsReadyForConfirm.length === 0
          ? SamsungSyncRunStatus.FAILED
          : SamsungSyncRunStatus.SUCCESS;

      await this.syncRunRepository.update(run.id, {
        status: runStatus,
        finished_at: new Date(),
        total_patients: summary.totalPatients,
        synced_patients: patientsReadyForConfirm.length,
        errored_patients: summary.erroredPatients,
        uploaded_files: summary.uploadedFiles,
        skipped_files: summary.skippedFiles,
        deleted_files: summary.deletedFiles,
        error_files: summary.errorFiles,
        summary,
      });
      stopHeartbeat();
      this.cancelledRunIds.delete(run.id);
      const statusLabel = runStatus === SamsungSyncRunStatus.SUCCESS ? 'success' : 'failed';
      return { run_id: run.id, status: statusLabel, summary };
    } catch (error) {
      stopHeartbeat();
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      const cancelled =
        this.cancelledRunIds.has(run.id) || /cancelad/i.test(message);
      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.FAILED,
        finished_at: new Date(),
        total_patients: summary.totalPatients,
        synced_patients: summary.syncedPatients,
        errored_patients: summary.erroredPatients,
        uploaded_files: summary.uploadedFiles,
        skipped_files: summary.skippedFiles,
        deleted_files: summary.deletedFiles,
        error_files: cancelled ? summary.errorFiles : summary.errorFiles + 1,
        summary,
        error_message: cancelled ? 'Cancelado pelo usuário' : message,
      });
      this.cancelledRunIds.delete(run.id);
      this.runAbortControllers.delete(run.id);
      if (cancelled) {
        return { run_id: run.id, status: 'failed' as const, summary };
      }
      throw error;
    } finally {
      this.runAbortControllers.delete(run.id);
      await cleanupSamsungSyncTempDir(run.id);
    }
  }

  private async uploadZipAndMetadata(
    run: SamsungSyncRun,
    summary: { zipName: string | null; zipPath: string | null },
    zipFilePath: string,
    zipArtifactPath: string,
    zipName: string,
    metadataRows: DeliveryMetadataRow[],
    deliveryDate: string,
    signal: AbortSignal,
  ): Promise<void> {
    const zipStat = await stat(zipFilePath);
    this.logMem(`Run ${run.id}: enviando ZIP ${zipName} para o BART`, zipStat.size);
    const zipSha256 = await this.artifactoryService.uploadFileFromPath(
      this.repoZip,
      zipArtifactPath,
      zipFilePath,
      'application/zip',
      60 * 60 * 1000,
      signal,
    );
    await this.appendRunItem({
      runId: run.id,
      action: SamsungSyncItemAction.UPLOAD,
      repo: this.repoZip,
      path: zipArtifactPath,
      sha256: zipSha256,
      uploaded: true,
      message: `ZIP de entrega ${zipName} enviado com sucesso`,
    });

    const metadataCsvPath = buildMetadataCsvArtifactPath(deliveryDate);
    const metadataCsvBuffer = Buffer.from(buildDeliveryMetadataCsv(metadataRows), 'utf-8');
    const metadataCsvSha256 = await this.artifactoryService.uploadFile(
      this.repoZip,
      metadataCsvPath,
      metadataCsvBuffer,
      'text/csv',
    );
    await this.appendRunItem({
      runId: run.id,
      action: SamsungSyncItemAction.METADATA,
      repo: this.repoZip,
      path: metadataCsvPath,
      sha256: metadataCsvSha256,
      uploaded: true,
      message: `CSV de metadata da entrega ${deliveryDate} enviado`,
    });
    this.logMem(`Run ${run.id}: ZIP e metadata enviados`);
  }

  private async resumeZipUpload(run: SamsungSyncRun): Promise<void> {
    const summary = {
      ...((run.summary || {}) as Record<string, unknown>),
    } as {
      zipName: string;
      zipPath: string;
      deliveryDate: string;
      metadataRows: DeliveryMetadataRow[];
      patientsReadyForConfirm: string[];
      totalPatients?: number;
      syncedPatients?: number;
      erroredPatients?: number;
      uploadedFiles?: number;
      skippedFiles?: number;
      deletedFiles?: number;
      errorFiles?: number;
      currentStep?: string;
      currentStepIndex?: number;
    };
    const runAbort = new AbortController();
    this.runAbortControllers.set(run.id, runAbort);
    const zipFilePath = getDeliveryZipFilePath(run.id);
    try {
      this.ensureRunNotCancelled(run.id);
      await this.uploadZipAndMetadata(
        run,
        summary,
        zipFilePath,
        summary.zipPath,
        summary.zipName,
        summary.metadataRows,
        summary.deliveryDate,
        runAbort.signal,
      );
      const patientsReadyForConfirm = summary.patientsReadyForConfirm || [];
      if (patientsReadyForConfirm.length > 0) {
        await this.confirmRunDelivery(patientsReadyForConfirm);
      }
      const runStatus =
        (summary.erroredPatients || 0) > 0 && patientsReadyForConfirm.length === 0
          ? SamsungSyncRunStatus.FAILED
          : SamsungSyncRunStatus.SUCCESS;
      await this.syncRunRepository.update(run.id, {
        status: runStatus,
        finished_at: new Date(),
        total_patients: summary.totalPatients ?? 0,
        synced_patients: patientsReadyForConfirm.length,
        errored_patients: summary.erroredPatients ?? 0,
        uploaded_files: summary.uploadedFiles ?? 0,
        skipped_files: summary.skippedFiles ?? 0,
        deleted_files: summary.deletedFiles ?? 0,
        error_files: summary.errorFiles ?? 0,
        summary: {
          ...summary,
          currentStepIndex: 8,
          currentStep: 'Sincronização concluída',
        },
      });
      this.logger.log(`Run ${run.id}: upload retomado após reinício (${runStatus})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      const cancelled =
        this.cancelledRunIds.has(run.id) || /cancelad/i.test(message);
      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.FAILED,
        finished_at: new Date(),
        error_message: cancelled ? 'Cancelado pelo usuário' : message,
      });
      throw error;
    } finally {
      this.cancelledRunIds.delete(run.id);
      this.runAbortControllers.delete(run.id);
      await cleanupSamsungSyncTempDir(run.id);
    }
  }

  /** Após entrega bem-sucedida no BART: marca pacientes e limpa pendências no banco. */
  private async confirmRunDelivery(patientIds: string[]) {
    if (patientIds.length === 0) return;

    // Lotes pequenos evitam UPDATEs longos (triggers + muitas binary_collections).
    const batchSize = 5;
    for (let i = 0; i < patientIds.length; i += batchSize) {
      const batch = patientIds.slice(i, i + batchSize);
      await withPgRetry(() => this.confirmRunDeliveryBatch(batch), {
        onRetry: (error, attempt, delayMs) => {
          this.logger.warn(
            `confirmRunDelivery: PostgreSQL transiente (lote ${i / batchSize + 1}, tentativa ${attempt}), nova em ${delayMs}ms: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        },
      });
    }
  }

  private async confirmRunDeliveryBatch(patientIds: string[]) {
    await this.db.query(
      `
      UPDATE patients
         SET sync_pending = FALSE,
             synced_at = NOW()
       WHERE id = ANY($1::uuid[])
      `,
      [patientIds],
    );

    await this.db.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.hard_delete = 'true'`);
      await manager.query(
        `
        DELETE FROM binary_collections bc
         USING patients p
         WHERE bc.patient_cpf_hash = p.cpf_hash
           AND p.id = ANY($1::uuid[])
           AND bc.deleted_pending = TRUE
        `,
        [patientIds],
      );
    });

    // Só linhas ainda pendentes — speech excluída já deve ter file_sync_pending=FALSE.
    await this.db.query(
      `
      UPDATE binary_collections bc
         SET file_sync_pending = FALSE,
             file_synced_at = NOW(),
             deleted_pending = FALSE
        FROM patients p
       WHERE bc.patient_cpf_hash = p.cpf_hash
         AND p.id = ANY($1::uuid[])
         AND (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)
      `,
      [patientIds],
    );

    await this.db.query(
      `
      UPDATE pdf_reports pr
         SET file_sync_pending = FALSE,
             file_synced_at = NOW()
        FROM questionnaires q
       WHERE q.id = pr.questionnaire_id
         AND q.patient_id = ANY($1::uuid[])
         AND pr.file_sync_pending = TRUE
      `,
      [patientIds],
    );
  }

  async resetSyncPending(filters?: SyncRunFilters): Promise<{
    patients: number;
    binary_collections: number;
    pdf_reports: number;
  }> {
    const normalized = this.normalizeFilters(filters);
    const patientStart = this.parseIdentifierRange(normalized.patientStart);
    const patientEnd = this.parseIdentifierRange(normalized.patientEnd);
    if (
      patientStart != null &&
      patientEnd != null &&
      Number.isFinite(patientStart) &&
      Number.isFinite(patientEnd) &&
      patientStart > patientEnd
    ) {
      throw new Error('Faixa de pacientes inválida: início maior que o fim.');
    }
    if (normalized.dateStart && normalized.dateEnd && normalized.dateStart > normalized.dateEnd) {
      throw new Error('Faixa de datas inválida: início maior que o fim.');
    }

    const patientRows = await this.db.query(
      `
      SELECT p.id
        FROM patients p
       WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
         AND ($1::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int >= $1::int)
         AND ($2::int IS NULL OR COALESCE(NULLIF(regexp_replace(p.public_identifier, '\\D', '', 'g'), ''), '0')::int <= $2::int)
         AND ($3::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) >= $3::date)
         AND ($4::date IS NULL OR DATE(COALESCE(p.sync_pending_at, p.synced_at, NOW())) <= $4::date)
      `,
      [
        patientStart,
        patientEnd,
        normalized.dateStart || null,
        normalized.dateEnd || null,
      ],
    );
    const patientIds: string[] = (patientRows || [])
      .map((r: { id?: string }) => r?.id)
      .filter((id): id is string => Boolean(id));

    if (patientIds.length === 0) {
      return { patients: 0, binary_collections: 0, pdf_reports: 0 };
    }

    await this.db.query(
      `
      UPDATE patients
         SET sync_pending = TRUE,
             sync_pending_at = NOW(),
             synced_at = NULL,
             sync_version = COALESCE(sync_version, 0) + 1
       WHERE id = ANY($1::uuid[])
      `,
      [patientIds],
    );

    const bcRows = await this.db.query(
      `
      UPDATE binary_collections bc
         SET file_sync_pending = TRUE,
             deleted_pending = FALSE
        FROM patients p
       WHERE bc.patient_cpf_hash = p.cpf_hash
         AND p.id = ANY($1::uuid[])
         AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
      RETURNING bc.id
      `,
      [patientIds],
    );

    const pdfRows = await this.db.query(
      `
      UPDATE pdf_reports pr
         SET file_sync_pending = TRUE,
             file_synced_at = NULL
        FROM questionnaires q
       WHERE q.id = pr.questionnaire_id
         AND q.patient_id = ANY($1::uuid[])
         AND NOT pdf_report_is_samsung_psg_laudo_excluded(
           pr.report_type, pr.file_name, pr.mime_type
         )
      RETURNING pr.id
      `,
      [patientIds],
    );

    return {
      patients: patientIds.length,
      binary_collections: bcRows?.length ?? 0,
      pdf_reports: pdfRows?.length ?? 0,
    };
  }

  getStorageConfig() {
    return {
      basePath: '',
      repo: this.repoZip,
    };
  }

  async browseStorage(relativePath?: string) {
    const safeRelative = this.sanitizeStorageRelativePath(relativePath || '');
    const items = await this.artifactoryService.listStorage(this.repoZip, safeRelative);
    return {
      basePath: '',
      repo: this.repoZip,
      path: safeRelative,
      items,
    };
  }

  async downloadStorageItem(relativePath: string) {
    const safeRelative = this.sanitizeStorageRelativePath(relativePath);
    if (!safeRelative) {
      throw new Error('Caminho inválido');
    }
    return this.artifactoryService.downloadFile(this.repoZip, safeRelative);
  }

  async deleteStorageItem(relativePath: string) {
    const safeRelative = this.sanitizeStorageRelativePath(relativePath);
    if (!safeRelative) {
      throw new Error('Caminho inválido');
    }
    await this.artifactoryService.deleteFile(this.repoZip, safeRelative);
  }

  async listZipArtifacts() {
    return this.artifactoryService.listArtifacts(this.repoZip, 'Data');
  }

  async downloadZipArtifact(name: string) {
    const safeName = (name || '').split('/').pop() || '';
    if (!safeName.endsWith('.zip')) {
      throw new Error('Artefato inválido');
    }
    return this.artifactoryService.downloadFile(
      this.repoZip,
      buildDataZipArtifactPath(safeName.replace(/\.zip$/i, '')),
    );
  }

  async deleteZipArtifact(name: string) {
    const safeName = (name || '').split('/').pop() || '';
    if (!safeName.endsWith('.zip')) {
      throw new Error('Artefato inválido');
    }
    const deliveryDate = safeName.replace(/\.zip$/i, '');
    await this.artifactoryService.deleteFile(
      this.repoZip,
      buildDataZipArtifactPath(deliveryDate),
    );
  }
}
