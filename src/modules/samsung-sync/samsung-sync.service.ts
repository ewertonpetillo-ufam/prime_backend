import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import pLimit from 'p-limit';
import archiver = require('archiver');
import {
  SamsungSyncRun,
  SamsungSyncRunStatus,
} from '../../entities/samsung-sync-run.entity';
import {
  SamsungSyncItemAction,
  SamsungSyncRunItem,
} from '../../entities/samsung-sync-run-item.entity';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { MinioStorageService } from '../storage/minio-storage.service';
import { ArtifactoryService } from './artifactory.service';
import {
  DeliveryMetadataRow,
  SAMSUNG_SYNC_PROGRESS_STEPS,
  ZipEntryInput,
  buildArchiveEntryDownloadUrl,
  buildSubjectDataZipPath,
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
  deviceGroupKey,
  openDeliveryZipWriter,
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
  samsungStep,
  toDateFolder,
  toSamsungDeviceFolder,
  toSamsungSubjectId,
  toStageFolder,
} from './samsung-dataset.utils';

type PendingFile = {
  id: string;
  patient_cpf_hash: string;
  metadata: Record<string, any> | null;
  file_hash: string | null;
  file_sync_pending: boolean;
  deleted_pending: boolean;
  csv_data: Buffer | null;
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
  private readonly basePath: string;
  private readonly zipBasePath: string;
  private readonly cancelledRunIds = new Set<string>();
  private readonly runAbortControllers = new Map<string, AbortController>();

  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectRepository(SamsungSyncRun)
    private readonly syncRunRepository: Repository<SamsungSyncRun>,
    @InjectRepository(SamsungSyncRunItem)
    private readonly syncRunItemRepository: Repository<SamsungSyncRunItem>,
    private readonly questionnairesService: QuestionnairesService,
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
    this.basePath = (
      this.configService.get<string>('ARTIFACTORY_BASE_PATH') || 'test_api'
    ).replace(/^\/+|\/+$/g, '');
    this.zipBasePath = (
      this.configService.get<string>('ARTIFACTORY_ZIP_BASE_PATH') ||
      this.basePath
    ).replace(/^\/+|\/+$/g, '');
  }

  async onModuleInit() {
    await this.recoverStaleRuns();

    const enabled =
      (this.configService.get<string>('SAMSUNG_SYNC_CRON_ENABLED') || 'false') ===
      'true';
    if (!enabled) return;

    const intervalMs = Number(
      this.configService.get<string>('SAMSUNG_SYNC_INTERVAL_MS') ||
        6 * 60 * 60 * 1000,
    );
    this.logger.log(`Scheduler de sync Samsung habilitado. intervalMs=${intervalMs}`);
    setInterval(() => {
      this.logger.log('Disparando sync Samsung por scheduler');
      void this.runSync(null, 'scheduler', {});
    }, intervalMs);
  }

  private async recoverStaleRuns(): Promise<void> {
    const staleMs = 5 * 60 * 1000;
    const cutoff = Date.now() - staleMs;
    const running = await this.syncRunRepository.find({
      where: { status: SamsungSyncRunStatus.RUNNING },
    });
    for (const run of running) {
      const summary = (run.summary || {}) as { lastHeartbeatAt?: string };
      const lastActivity = summary.lastHeartbeatAt
        ? new Date(summary.lastHeartbeatAt).getTime()
        : new Date(run.started_at).getTime();
      if (lastActivity >= cutoff) continue;

      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.FAILED,
        finished_at: new Date(),
        error_message: 'Interrompido por reinício do servidor',
      });
      await cleanupSamsungSyncTempDir(run.id);
      this.cancelledRunIds.delete(run.id);
      this.logger.warn(`Run órfão ${run.id} marcado como failed após reinício`);
    }
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
    return toSamsungSubjectId(publicIdentifier);
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
    const fromActiveTask = activeTask?.task_code;
    if (typeof fromActiveTask === 'string' && fromActiveTask.trim()) {
      return fromActiveTask.trim().toUpperCase();
    }
    const fromMetadata = metadata?.task_code;
    if (typeof fromMetadata === 'string' && fromMetadata.trim()) {
      return fromMetadata.trim().toUpperCase();
    }
    return this.extractTaskCodeFromFilename(fileName);
  }

  private getCollectionPath(
    patient: PendingPatient,
    file: PendingFile,
    fixedDate?: string,
    includeBasePath = true,
  ): string {
    const { subjectId } = this.getPatientPath(patient);
    const originalName =
      (file.metadata?.file_name as string | undefined) || `${file.id}.csv`;
    const taskCode = this.resolveTaskCode(file.metadata, null, originalName);
    if (this.isSpeechTask(taskCode)) {
      return '';
    }
    const isSmartphoneTask = this.isSamsungSmartphoneTask(taskCode);
    const protocol = isSmartphoneTask ? 'Clinic' : this.inferSamsungProtocol(taskCode, originalName);
    const stageFolder = this.toStageFolder(protocol);
    const device = isSmartphoneTask ? 'SP' : this.inferSamsungDevice(originalName, taskCode);
    const deviceFolder = this.toSamsungDeviceFolder(device);
    const collectionDate =
      fixedDate || getDeliveryDateFolder();
    const finalName = this.buildSamsungActiveTaskFilename(
      originalName,
      subjectId,
      collectionDate,
      file,
      device,
      taskCode,
    );
    const prefix = includeBasePath ? `${this.basePath}/` : '';
    return `${prefix}${collectionDate}/${subjectId}/${stageFolder}/${deviceFolder}/${finalName}`;
  }

  private getCollectionPathInZip(
    patient: PendingPatient,
    file: PendingFile,
    fixedDate: string,
  ): string {
    const path = this.getCollectionPath(patient, file, fixedDate, false);
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

  private async flushDeviceGroupsToArchive(
    runId: string,
    tempDir: string,
    deviceGroups: Map<string, ZipEntryInput[]>,
    archive: archiver.Archiver,
    metadataRows: DeliveryMetadataRow[],
    deliveryDate: string,
    summary: { uploadedFiles: number },
  ): Promise<void> {
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
      }
      deviceGroups.delete(groupKey);
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
        this.basePath,
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

  private async getPendingPdfReportsForPatient(
    patientId: string,
    patientEverSynced: boolean,
  ): Promise<
    Array<{
      id: string;
      report_type?: string;
      file_name?: string;
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
    const rows = await this.db.query(`
      SELECT
        p.id,
        p.full_name,
        p.public_identifier,
        p.sync_pending,
        p.sync_pending_at,
        p.synced_at,
        COUNT(bc.*) FILTER (
          WHERE bc.id IS NOT NULL
            AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
            AND (bc.file_sync_pending = TRUE OR bc.deleted_pending = TRUE)
        )::int AS pending_files,
        COALESCE((
          SELECT COUNT(*)::int
            FROM pdf_reports pr
            JOIN questionnaires q ON q.id = pr.questionnaire_id
           WHERE q.patient_id = p.id
             AND pr.file_sync_pending = TRUE
        ), 0) AS pending_pdf_reports,
        (
          p.synced_at IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
              FROM binary_collections bc_sync
             WHERE bc_sync.patient_cpf_hash = p.cpf_hash
               AND NOT binary_collection_is_samsung_speech_excluded(bc_sync.task_id, bc_sync.metadata)
               AND (bc_sync.file_sync_pending = TRUE OR bc_sync.deleted_pending = TRUE)
          )
          AND NOT EXISTS (
            SELECT 1
              FROM pdf_reports pr_sync
              JOIN questionnaires q_sync ON q_sync.id = pr_sync.questionnaire_id
             WHERE q_sync.patient_id = p.id
               AND pr_sync.file_sync_pending = TRUE
          )
        ) AS is_bart_synced
      FROM patients p
      LEFT JOIN binary_collections bc ON bc.patient_cpf_hash = p.cpf_hash
        AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
      WHERE UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
      GROUP BY p.id
      ORDER BY
        (
          p.sync_pending = TRUE
          OR p.synced_at IS NULL
          OR EXISTS (
            SELECT 1
              FROM binary_collections bc_ord
             WHERE bc_ord.patient_cpf_hash = p.cpf_hash
               AND NOT binary_collection_is_samsung_speech_excluded(bc_ord.task_id, bc_ord.metadata)
               AND (bc_ord.file_sync_pending = TRUE OR bc_ord.deleted_pending = TRUE)
          )
          OR EXISTS (
            SELECT 1
              FROM pdf_reports pr_ord
              JOIN questionnaires q_ord ON q_ord.id = pr_ord.questionnaire_id
             WHERE q_ord.patient_id = p.id
               AND pr_ord.file_sync_pending = TRUE
          )
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
              'csv_data', encode(bc.csv_data, 'escape'),
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
      files: (row.files || []).map((file: any) => ({
        ...file,
        csv_data: file.csv_data ? Buffer.from(file.csv_data, 'binary') : null,
      })),
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
        void this.updateRunProgress(run.id, summary);
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
          path: this.basePath,
          uploaded: false,
          message: connectivity.warning,
        });
      }
      const patients = await this.getPendingPatients(filters);
      this.ensureRunNotCancelled(run.id);
      summary.totalPatients = patients.length;
      await this.updateRunProgress(run.id, summary);

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
      const zipArtifactPath = buildDataZipArtifactPath(this.basePath, deliveryDate);
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

      /** Evita contar 2× o mesmo skip de fala (export do questionário + loop patient.files). */
      const speechSkipCountedIds = new Set<string>();

      const minioConnectivity = await this.validateMinioConnectivityQuick(8000);
      if (!minioConnectivity.ok && minioConnectivity.warning) {
        this.logger.warn(`[Run ${run.id}] ${minioConnectivity.warning}`);
        await this.appendRunItem({
          runId: run.id,
          action: SamsungSyncItemAction.SKIP,
          repo: this.repoZip,
          path: this.basePath,
          uploaded: false,
          message: minioConnectivity.warning,
        });
      }

      for (const patient of patients) {
        this.ensureRunNotCancelled(run.id);
        if (this.isSamsungExcludedPublicIdentifier(patient.public_identifier)) continue;
        runPatientIds.add(patient.id);
        try {
          let patientHasCriticalError = false;
          const patientEverSynced = this.patientHadPriorBartSync(patient);
          const subjectId = this.toSubjectId(patient.public_identifier);
          const subjectExportItems = exportedBySubject.get(subjectId) || [];
          const patientDeviceGroups = new Map<string, ZipEntryInput[]>();

          const addToDeviceGroup = (key: string, fileName: string, buffer: Buffer) => {
            const list = patientDeviceGroups.get(key) || [];
            list.push({ name: fileName, buffer });
            patientDeviceGroups.set(key, list);
          };

          await setCurrentStep(2, `${samsungStep(2)} (${subjectId})`);
          const pdfNameCounters = new Map<string, number>();
          const activeTaskRepCounters = new Map<string, number>();
          const includedCollectionIds = new Set<string>();
          const clinicalStageFolder = this.toStageFolder('Clinic');

          for (const exportedItem of subjectExportItems) {
            this.ensureRunNotCancelled(run.id);
            const generationDate = formatCollectionDateForMetadata(exportedItem?.questionnaire);
            const clinicalCsvPrefix = `${deliveryDate}-${subjectId}`;
            const clinicalCsvFiles = [
              {
                name: `${clinicalCsvPrefix}-01_demographic_anthropometric_clinical.csv`,
                content: exportedItem?.csvFiles?.demographicAnthropometricClinical || '',
              },
              {
                name: `${clinicalCsvPrefix}-02_neurological_assessment_updrs.csv`,
                content: exportedItem?.csvFiles?.neurologicalAssessment || '',
              },
              {
                name: `${clinicalCsvPrefix}-03_speech_therapy.csv`,
                content: exportedItem?.csvFiles?.speechTherapy || '',
              },
              {
                name: `${clinicalCsvPrefix}-04_sleep_assessment.csv`,
                content: exportedItem?.csvFiles?.sleepAssessment || '',
              },
              {
                name: `${clinicalCsvPrefix}-05_physiotherapy.csv`,
                content: exportedItem?.csvFiles?.physiotherapy || '',
              },
            ];
            for (const clinicalFile of clinicalCsvFiles) {
              const zipPath = buildSubjectDataZipPath(
                deliveryDate,
                subjectId,
                clinicalStageFolder,
                clinicalFile.name,
              );
              const buffer = Buffer.from(clinicalFile.content, 'utf-8');
              archive.append(buffer, { name: zipPath });
              this.registerDeliveryMetadataEntry(
                metadataRows,
                deliveryDate,
                zipPath,
                generationDate,
              );
              summary.uploadedFiles += 1;
              await this.appendRunItem({
                runId: run.id,
                patientId: patient.id,
                action: SamsungSyncItemAction.METADATA,
                repo: this.repoCollections,
                path: zipPath,
                uploaded: false,
                message: 'CSV clínico adicionado ao ZIP de entrega (Subject_Data)',
              });
            }

            await setCurrentStep(3, `${samsungStep(3)} (${subjectId})`);
            const pdfReports = Array.isArray(exportedItem?.pdfReports)
              ? exportedItem.pdfReports
              : [];
            for (const report of pdfReports) {
              this.ensureRunNotCancelled(run.id);
              if (
                patientEverSynced &&
                report.file_sync_pending !== true
              ) {
                continue;
              }
              const { protocol, device } = this.samsungPdfReportDataPath(
                this.normalizePdfReportType(report),
              );
              const stageFolder = this.toStageFolder(protocol);
              const deviceFolderName = this.toSamsungDeviceFolder(device);
              const isExternalDevice = ['Baiobit', 'EMG', 'Ring', 'PSG'].includes(device);
              const cpfHash =
                exportedItem?.questionnaire?.cpfHash ||
                exportedItem?.questionnaire?.patient?.cpf_hash ||
                '';
              const baseFileName = isExternalDevice
                ? this.sanitizeExternalDocBaseName(
                    report?.file_name || 'relatorio.pdf',
                    cpfHash,
                  )
                : report?.file_name || 'relatorio.pdf';
              const uniqueFileName = this.getUniqueFilename(
                baseFileName,
                pdfNameCounters,
                `${stageFolder}/${deviceFolderName}`,
              );
              const pdfPath = report?.file_path as string | undefined;
              const pdfBuffer = pdfPath
                ? await minioDownloadLimit(() =>
                    this.minioService.getObjectBuffer(pdfPath).catch((err: Error) => {
                      this.logger.warn(
                        `[Run ${run.id}] PDF ${String(pdfPath)} MinIO: ${err.message}`,
                      );
                      return null;
                    }),
                  )
                : null;
              if (!pdfBuffer) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                const minioHint = !minioConnectivity.ok
                  ? ` ${minioConnectivity.warning}`
                  : '';
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoZip,
                  path: buildSamsungDataFileZipPath(
                    deliveryDate,
                    subjectId,
                    stageFolder,
                    deviceFolderName,
                    uniqueFileName,
                  ),
                  uploaded: false,
                  error: `Falha ao baixar PDF do MinIO para inclusão no ZIP.${minioHint}`,
                });
                continue;
              }
              const zipPath = buildSamsungDataFileZipPath(
                deliveryDate,
                subjectId,
                stageFolder,
                deviceFolderName,
                uniqueFileName,
              );
              addToDeviceGroup(
                deviceGroupKey(subjectId, stageFolder, deviceFolderName),
                uniqueFileName,
                pdfBuffer,
              );
              if (report?.id) {
                let set = pdfReportIdsByPatient.get(patient.id);
                if (!set) {
                  set = new Set<string>();
                  pdfReportIdsByPatient.set(patient.id, set);
                }
                set.add(String(report.id));
              }
            }

            await setCurrentStep(4, `${samsungStep(4)} (${subjectId})`);
            const exportedBinaryCollections = (exportedItem?.binaryCollections || [])
              .slice()
              .sort((a, b) => {
                const ta = new Date(a?.collected_at || 0).getTime();
                const tb = new Date(b?.collected_at || 0).getTime();
                if (ta !== tb) return ta - tb;
                return String(a?.id || '').localeCompare(String(b?.id || ''));
              });
            const exportBinaryIds = exportedBinaryCollections
              .map((bc) => bc?.id)
              .filter((id): id is string => Boolean(id));
            const binaryPayloadMap = await this.getBinaryPayloadMap(exportBinaryIds);
            for (const collection of exportedBinaryCollections) {
              this.ensureRunNotCancelled(run.id);
              if (
                patientEverSynced &&
                collection.deleted_pending !== true &&
                collection.file_sync_pending !== true
              ) {
                continue;
              }
              const fileName = (collection?.metadata?.file_name || '').toString();
              if (!fileName) continue;
              const taskCode = this.resolveTaskCode(
                collection?.metadata,
                collection?.active_task,
                fileName,
              );
              if (this.isSpeechTask(taskCode)) {
                const cid = collection.id;
                if (cid) {
                  if (!speechSkipCountedIds.has(cid)) {
                    speechSkipCountedIds.add(cid);
                    summary.skippedFiles += 1;
                  }
                } else {
                  summary.skippedFiles += 1;
                }
                continue;
              }
              const isSmartphoneTask = this.isSamsungSmartphoneTask(taskCode);
              const protocol = isSmartphoneTask
                ? 'Clinic'
                : this.inferSamsungProtocol(taskCode, fileName);
              const device = isSmartphoneTask ? 'SP' : this.inferSamsungDevice(fileName, taskCode);
              const stageFolder = this.toStageFolder(protocol);
              const deviceFolderName = this.toSamsungDeviceFolder(device);
              const tentativeName = this.buildSamsungActiveTaskFilename(
                fileName,
                subjectId,
                deliveryDate,
                collection as any,
                device,
                taskCode,
              );
              const extMatch = tentativeName.match(/(\.[^.]+)$/i);
              const ext = extMatch ? extMatch[1] : '.csv';
              const stem = extMatch ? tentativeName.slice(0, -ext.length) : tentativeName;
              const stemWithoutRep = stem.replace(/-Rep\d+$/i, '');
              const repKey = `${stageFolder}/${deviceFolderName}/${stemWithoutRep}`;
              const nextRep = (activeTaskRepCounters.get(repKey) ?? 0) + 1;
              activeTaskRepCounters.set(repKey, nextRep);
              const finalName = `${stemWithoutRep}-Rep${nextRep}${ext}`;
              const payload = binaryPayloadMap.get(collection.id);
              if (!payload) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  collectionId: collection.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoCollections,
                  path: buildSamsungDataFileZipPath(
                    deliveryDate,
                    subjectId,
                    stageFolder,
                    deviceFolderName,
                    finalName,
                  ),
                  uploaded: false,
                  error: 'Payload da tarefa ativa não encontrado para inclusão no ZIP',
                });
                continue;
              }
              const zipPath = buildSamsungDataFileZipPath(
                deliveryDate,
                subjectId,
                stageFolder,
                deviceFolderName,
                finalName,
              );
              addToDeviceGroup(
                deviceGroupKey(subjectId, stageFolder, deviceFolderName),
                finalName,
                payload,
              );
              includedCollectionIds.add(collection.id);
            }
          }

          if (subjectExportItems.length === 0) {
            await setCurrentStep(3, `${samsungStep(3)} (${subjectId})`);
            const dbPdfReports = await this.getPendingPdfReportsForPatient(
              patient.id,
              patientEverSynced,
            );
            for (const report of dbPdfReports) {
              this.ensureRunNotCancelled(run.id);
              const generationDate = formatCollectionDateForMetadata({
                collection_date: report.collection_date,
                created_at: report.questionnaire_created_at,
              });
              const { protocol, device } = this.samsungPdfReportDataPath(
                this.normalizePdfReportType(report),
              );
              const stageFolder = this.toStageFolder(protocol);
              const deviceFolderName = this.toSamsungDeviceFolder(device);
              const isExternalDevice = ['Baiobit', 'EMG', 'Ring', 'PSG'].includes(device);
              const cpfHash = report.cpf_hash || '';
              const baseFileName = isExternalDevice
                ? this.sanitizeExternalDocBaseName(
                    report?.file_name || 'relatorio.pdf',
                    cpfHash,
                  )
                : report?.file_name || 'relatorio.pdf';
              const uniqueFileName = this.getUniqueFilename(
                baseFileName,
                pdfNameCounters,
                `${stageFolder}/${deviceFolderName}`,
              );
              const dbPdfPath = report?.file_path as string | undefined;
              const pdfBuffer = dbPdfPath
                ? await minioDownloadLimit(() =>
                    this.minioService.getObjectBuffer(dbPdfPath).catch((err: Error) => {
                      this.logger.warn(
                        `[Run ${run.id}] PDF ${String(dbPdfPath)} não encontrado no MinIO: ${err.message}`,
                      );
                      return null;
                    }),
                  )
                : null;
              if (!pdfBuffer) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                const minioHint = !minioConnectivity.ok
                  ? ` ${minioConnectivity.warning}`
                  : '';
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoZip,
                  path: buildSamsungDataFileZipPath(
                    deliveryDate,
                    subjectId,
                    stageFolder,
                    deviceFolderName,
                    uniqueFileName,
                  ),
                  uploaded: false,
                  error: `Falha ao baixar PDF do MinIO para inclusão no ZIP.${minioHint}`,
                });
                continue;
              }
              addToDeviceGroup(
                deviceGroupKey(subjectId, stageFolder, deviceFolderName),
                uniqueFileName,
                pdfBuffer,
              );
              let set = pdfReportIdsByPatient.get(patient.id);
              if (!set) {
                set = new Set<string>();
                pdfReportIdsByPatient.set(patient.id, set);
              }
              set.add(String(report.id));
            }
          }

          const pendingFileIds = (patient.files || [])
            .map((file) => file?.id)
            .filter((id): id is string => Boolean(id));
          const patientBinaryPayloadMap = await this.getBinaryPayloadMap(pendingFileIds);
          for (const file of patient.files || []) {
            this.ensureRunNotCancelled(run.id);
            const fileIsPending =
              file.deleted_pending === true || file.file_sync_pending === true;
            if (!fileIsPending) {
              continue;
            }
            const artifactPath = this.getCollectionPath(patient, file, deliveryDate, true);
            if (!artifactPath) {
              const fid = file.id;
              if (fid) {
                if (!speechSkipCountedIds.has(fid)) {
                  speechSkipCountedIds.add(fid);
                  summary.skippedFiles += 1;
                }
              } else {
                summary.skippedFiles += 1;
              }
              continue;
            }
            if (file.deleted_pending) {
              summary.deletedFiles += 1;
              await this.appendRunItem({
                runId: run.id,
                patientId: patient.id,
                collectionId: file.id,
                action: SamsungSyncItemAction.DELETE,
                repo: this.repoCollections,
                path: artifactPath,
                uploaded: false,
                message: 'Arquivo marcado para remoção — será excluído ao confirmar entrega',
              });
              continue;
            }
            const payload = patientBinaryPayloadMap.get(file.id) || file.csv_data;
            if (!payload) {
              patientHasCriticalError = true;
              summary.errorFiles += 1;
              await this.appendRunItem({
                runId: run.id,
                patientId: patient.id,
                collectionId: file.id,
                action: SamsungSyncItemAction.ERROR,
                repo: this.repoCollections,
                path: artifactPath,
                uploaded: false,
                error: 'Payload pendente não encontrado para confirmação de sincronização',
              });
              continue;
            }
            if (!includedCollectionIds.has(file.id)) {
              const zipPath = this.getCollectionPathInZip(patient, file, deliveryDate);
              if (!zipPath) {
                summary.skippedFiles += 1;
              } else {
                const parts = zipPath.split('/');
                const fileName = parts[parts.length - 1] || `${file.id}.csv`;
                const stageFolder = parts[parts.length - 3] || this.toStageFolder('Clinic');
                const deviceFolderName = parts[parts.length - 2] || 'SW';
                addToDeviceGroup(
                  deviceGroupKey(subjectId, stageFolder, deviceFolderName),
                  fileName,
                  payload,
                );
                includedCollectionIds.add(file.id);
              }
            }
          }

          await this.flushDeviceGroupsToArchive(
            run.id,
            syncTempDir,
            patientDeviceGroups,
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
          await this.updateRunProgress(run.id, summary);
        } catch (error) {
          summary.erroredPatients += 1;
          summary.errorFiles += 1;
          const message = error instanceof Error ? error.message : 'Erro desconhecido';
          await this.appendRunItem({
            runId: run.id,
            patientId: patient.id,
            action: SamsungSyncItemAction.ERROR,
            repo: this.repoCollections,
            path: this.basePath,
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
      await setCurrentStep(6);
      this.ensureRunNotCancelled(run.id);
      const zipSha256 = await this.artifactoryService.uploadFileFromPath(
        this.repoZip,
        zipArtifactPath,
        zipFilePath,
        'application/zip',
        60 * 60 * 1000,
        runAbort.signal,
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

      const metadataCsvPath = buildMetadataCsvArtifactPath(this.basePath, deliveryDate);
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

  /** Após entrega bem-sucedida no BART: marca pacientes e limpa pendências no banco. */
  private async confirmRunDelivery(patientIds: string[]) {
    if (patientIds.length === 0) return;

    await this.db.query(
      `
      UPDATE patients
         SET sync_pending = FALSE,
             synced_at = NOW()
       WHERE id = ANY($1::uuid[])
      `,
      [patientIds],
    );

    await this.db.query(
      `
      DELETE FROM binary_collections bc
       USING patients p
       WHERE bc.patient_cpf_hash = p.cpf_hash
         AND p.id = ANY($1::uuid[])
         AND bc.deleted_pending = TRUE
      `,
      [patientIds],
    );

    await this.db.query(
      `
      UPDATE binary_collections bc
         SET file_sync_pending = FALSE,
             file_synced_at = NOW(),
             deleted_pending = FALSE
        FROM patients p
       WHERE bc.patient_cpf_hash = p.cpf_hash
         AND p.id = ANY($1::uuid[])
         AND NOT binary_collection_is_samsung_speech_excluded(bc.task_id, bc.metadata)
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
      basePath: this.basePath,
      repo: this.repoZip,
    };
  }

  async browseStorage(relativePath?: string) {
    const safeRelative = this.sanitizeStorageRelativePath(relativePath || '');
    const fullPath = safeRelative ? `${this.basePath}/${safeRelative}` : this.basePath;
    const items = await this.artifactoryService.listStorage(this.repoZip, fullPath);
    return {
      basePath: this.basePath,
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
    const fullPath = `${this.basePath}/${safeRelative}`;
    return this.artifactoryService.downloadFile(this.repoZip, fullPath);
  }

  async deleteStorageItem(relativePath: string) {
    const safeRelative = this.sanitizeStorageRelativePath(relativePath);
    if (!safeRelative) {
      throw new Error('Caminho inválido');
    }
    const fullPath = `${this.basePath}/${safeRelative}`;
    await this.artifactoryService.deleteFile(this.repoZip, fullPath);
  }

  async listZipArtifacts() {
    const dataPath = `${this.basePath}/Data`;
    return this.artifactoryService.listArtifacts(this.repoZip, dataPath);
  }

  async downloadZipArtifact(name: string) {
    const safeName = (name || '').split('/').pop() || '';
    if (!safeName.endsWith('.zip')) {
      throw new Error('Artefato inválido');
    }
    return this.artifactoryService.downloadFile(
      this.repoZip,
      buildDataZipArtifactPath(this.basePath, safeName.replace(/\.zip$/i, '')),
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
      buildDataZipArtifactPath(this.basePath, deliveryDate),
    );
  }
}
