import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
  SAMSUNG_SYNC_PROGRESS_STEPS,
  buildSamsungActiveTaskFilename,
  extractTaskCodeFromFilename,
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
    public_identifier?: string | null;
    patient?: { public_identifier?: string | null } | null;
  };
  csvFiles?: Record<string, string>;
  pdfReports?: Array<{
    id?: string;
    report_type?: string;
    file_name?: string;
    file_path?: string | null;
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

  onModuleInit() {
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
    const collectionDate = fixedDate || this.toDateFolder(file.collected_at || patient.sync_pending_at);
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

  private generateZipBuffer(): {
    archive: archiver.Archiver;
    result: Promise<Buffer>;
  } {
    const arc = archiver('zip', { zlib: { level: 1 } });
    const chunks: Buffer[] = [];
    const result = new Promise<Buffer>((resolve, reject) => {
      arc.on('data', (chunk: Buffer) => chunks.push(chunk));
      arc.on('end', () => resolve(Buffer.concat(chunks)));
      arc.on('error', reject);
      arc.on('warning', (err: any) => {
        if (err.code !== 'ENOENT') {
          this.logger.warn(`[Archiver] ${String(err.message)}`);
        }
      });
    });
    return { archive: arc, result };
  }

  private buildZipName(filters: SyncRunFilters | undefined, patients: PendingPatient[]): string {
    const startFromFilter = this.parseIdentifierRange(filters?.patientStart || '');
    const endFromFilter = this.parseIdentifierRange(filters?.patientEnd || '');
    const firstSubject =
      startFromFilter != null
        ? `S${String(startFromFilter).padStart(3, '0')}`
        : this.toSubjectId(patients[0]?.public_identifier);
    const lastSubject =
      endFromFilter != null
        ? `S${String(endFromFilter).padStart(3, '0')}`
        : this.toSubjectId(patients[patients.length - 1]?.public_identifier);
    return `SRBR-M_UFAMPRIME_${firstSubject}-${lastSubject}.zip`;
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
          WHERE bc.file_sync_pending = TRUE
             OR bc.deleted_pending = TRUE
             OR p.synced_at IS NULL
        )::int AS pending_files
      FROM patients p
      LEFT JOIN binary_collections bc ON bc.patient_cpf_hash = p.cpf_hash
      WHERE (p.sync_pending = TRUE
         OR p.synced_at IS NULL)
        AND UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
      GROUP BY p.id
      ORDER BY p.sync_pending_at ASC NULLS LAST
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
            WHERE bc.file_sync_pending = TRUE
               OR bc.deleted_pending = TRUE
               OR p.synced_at IS NULL
          ),
          '[]'::json
        ) AS files
      FROM patients p
      LEFT JOIN binary_collections bc ON bc.patient_cpf_hash = p.cpf_hash
      WHERE (p.sync_pending = TRUE
         OR p.synced_at IS NULL)
        AND UPPER(COALESCE(p.public_identifier, '')) NOT IN ('P000', 'P00')
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
  ) {
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
      return { run_id: runId, status: run.status, cancelled: false };
    }

    this.cancelledRunIds.add(runId);
    const summary = {
      ...(run.summary || {}),
      currentStep: 'Cancelamento solicitado pelo usuário',
      cancelRequestedAt: new Date().toISOString(),
      cancelRequestedBy: requestedByUserId || null,
    };

    await this.syncRunRepository.update(runId, { summary });
    return { run_id: runId, status: 'running', cancelled: true };
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
          path: this.zipBasePath,
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

      const patientIdsToConfirm: string[] = [];
      const collectionIdsToConfirm: string[] = [];
      const zipName = this.buildZipName(filters, patients);
      const DATASET_ROOT = zipName.replace(/\.zip$/i, ''); // e.g. "SRBR-M_UFAMPRIME_S001-S012"
      summary.zipName = zipName;
      const zipArtifactPath = `${this.zipBasePath}/${zipName}`;
      summary.zipPath = zipArtifactPath;

      // Streaming ZIP — archiver compresses and outputs chunks incrementally;
      // files are GC-eligible after append, avoiding the 4-5× memory spike of
      // the previous JSZip-in-worker-thread approach.
      const { archive, result: archiveFinished } = this.generateZipBuffer();

      await setCurrentStep(1);
      const exported = (await this.questionnairesService.exportAllQuestionnairesData(
        filters,
      )) as unknown as QuestionnaireExportItem[];
      this.ensureRunNotCancelled(run.id);
      const exportedBySubject = new Map<string, QuestionnaireExportItem[]>();
      for (const item of exported || []) {
        // public_identifier está no patient relacionado; o campo no questionnaire pode ser nulo
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
      for (const [subjectId, items] of exportedBySubject.entries()) {
        items.sort((a, b) => {
          const aTs = new Date(a?.questionnaire?.createdAt || 0).getTime();
          const bTs = new Date(b?.questionnaire?.createdAt || 0).getTime();
          return aTs - bTs;
        });
        exportedBySubject.set(subjectId, items);
      }

      for (const patient of patients) {
        this.ensureRunNotCancelled(run.id);
        if (this.isSamsungExcludedPublicIdentifier(patient.public_identifier)) continue;
        try {
          let patientHasCriticalError = false;
          const subjectId = this.toSubjectId(patient.public_identifier);
          const subjectExportItems = exportedBySubject.get(subjectId) || [];
          if (subjectExportItems.length === 0) {
            this.logger.warn(`[Run ${run.id}] Paciente ${subjectId} sem questionário — metadata e PDFs omitidos`);
            await this.appendRunItem({
              runId: run.id,
              patientId: patient.id,
              action: SamsungSyncItemAction.SKIP,
              repo: this.repoCollections,
              path: `Metadata/${subjectId}/`,
              uploaded: false,
              message: 'Paciente sem questionário exportável — metadata/PDFs omitidos',
            });
          }
          const metadataRoot = `${DATASET_ROOT}/Metadata/${subjectId}`;

          await setCurrentStep(2, `${samsungStep(2)} (${subjectId})`);
          const pdfNameCounters = new Map<string, number>();
          const activeTaskRepCounters = new Map<string, number>();
          const includedCollectionIds = new Set<string>();
          let latestPatientDate = this.toDateFolder(patient.sync_pending_at);
          for (const exportedItem of subjectExportItems) {
            this.ensureRunNotCancelled(run.id);
            const patientDate = this.toDateFolder(
              exportedItem?.questionnaire?.createdAt || patient.sync_pending_at,
            );
            latestPatientDate = patientDate;
            const metadataCsvPrefix = `METADATA-${patientDate}-${subjectId}`;
            const metadataCsvPaths = [
              `${metadataRoot}/${metadataCsvPrefix}-01_demographic_anthropometric_clinical.csv`,
              `${metadataRoot}/${metadataCsvPrefix}-02_neurological_assessment_updrs.csv`,
              `${metadataRoot}/${metadataCsvPrefix}-03_speech_therapy.csv`,
              `${metadataRoot}/${metadataCsvPrefix}-04_sleep_assessment.csv`,
              `${metadataRoot}/${metadataCsvPrefix}-05_physiotherapy.csv`,
            ];
            const metadataCsvContents = [
              exportedItem?.csvFiles?.demographicAnthropometricClinical || '',
              exportedItem?.csvFiles?.neurologicalAssessment || '',
              exportedItem?.csvFiles?.speechTherapy || '',
              exportedItem?.csvFiles?.sleepAssessment || '',
              exportedItem?.csvFiles?.physiotherapy || '',
            ];
            for (let csvIdx = 0; csvIdx < metadataCsvPaths.length; csvIdx++) {
              archive.append(metadataCsvContents[csvIdx] || '', { name: metadataCsvPaths[csvIdx] });
              await this.appendRunItem({
                runId: run.id,
                patientId: patient.id,
                action: SamsungSyncItemAction.METADATA,
                repo: this.repoCollections,
                path: metadataCsvPaths[csvIdx],
                uploaded: false,
                message: 'CSV de metadata adicionado ao ZIP',
              });
            }

            await setCurrentStep(3, `${samsungStep(3)} (${subjectId})`);
            const pdfReports = Array.isArray(exportedItem?.pdfReports)
              ? exportedItem.pdfReports
              : [];
            for (const report of pdfReports) {
              this.ensureRunNotCancelled(run.id);
              const { protocol, device } = this.samsungPdfReportDataPath(report?.report_type);
              const stageFolder = this.toStageFolder(protocol);
              const deviceFolderName = this.toSamsungDeviceFolder(device);
              const isExternalDevice = ['Baiobit', 'EMG', 'Ring', 'PSG'].includes(device);
              const baseFileName = isExternalDevice
                ? this.sanitizeExternalDocBaseName(
                    report?.file_name || 'relatorio.pdf',
                    (exportedItem as any)?.questionnaire?.cpfHash || '',
                  )
                : report?.file_name || 'relatorio.pdf';
              const uniqueFileName = this.getUniqueFilename(
                baseFileName,
                pdfNameCounters,
                `${stageFolder}/${deviceFolderName}`,
              );
              const pdfBuffer = report?.file_path
                ? await this.minioService.getObjectBuffer(report.file_path as string).catch((err: Error) => {
                    this.logger.warn(`[Run ${run.id}] PDF ${String(report.file_path)} não encontrado no MinIO: ${err.message}`);
                    return null;
                  })
                : null;
              if (!pdfBuffer) {
                patientHasCriticalError = true;
                summary.errorFiles += 1;
                await this.appendRunItem({
                  runId: run.id,
                  patientId: patient.id,
                  action: SamsungSyncItemAction.ERROR,
                  repo: this.repoCollections,
                  path: `${patientDate}/${subjectId}/${stageFolder}/${deviceFolderName}/${uniqueFileName}`,
                  uploaded: false,
                  error: 'Falha ao baixar PDF externo para inclusão no ZIP',
                });
                continue;
              }
              archive.append(pdfBuffer, {
                name: `${DATASET_ROOT}/${patientDate}/${subjectId}/${stageFolder}/${deviceFolderName}/${uniqueFileName}`,
              });
              summary.uploadedFiles += 1;
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
              const fileName = (collection?.metadata?.file_name || '').toString();
              if (!fileName) continue;
              const taskCode = this.resolveTaskCode(
                collection?.metadata,
                collection?.active_task,
                fileName,
              );
              if (this.isSpeechTask(taskCode)) {
                summary.skippedFiles += 1;
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
                patientDate,
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
                  path: `${patientDate}/${subjectId}/${stageFolder}/${deviceFolderName}/${finalName}`,
                  uploaded: false,
                  error: 'Payload da tarefa ativa não encontrado para inclusão no ZIP',
                });
                continue;
              }
              archive.append(payload, {
                name: `${DATASET_ROOT}/${patientDate}/${subjectId}/${stageFolder}/${deviceFolderName}/${finalName}`,
              });
              summary.uploadedFiles += 1;
              includedCollectionIds.add(collection.id);
            }
          }

          const pendingFileIds = (patient.files || [])
            .map((file) => file?.id)
            .filter((id): id is string => Boolean(id));
          const patientBinaryPayloadMap = await this.getBinaryPayloadMap(pendingFileIds);
          for (const file of patient.files || []) {
            this.ensureRunNotCancelled(run.id);
            const artifactPath = this.getCollectionPath(patient, file, latestPatientDate, true);
            if (!artifactPath) {
              summary.skippedFiles += 1;
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
                message: 'Arquivo marcado para remoção após upload do ZIP',
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
              const zipPath = this.getCollectionPathInZip(patient, file, latestPatientDate);
              if (!zipPath) {
                summary.skippedFiles += 1;
              } else {
                archive.append(payload, { name: `${DATASET_ROOT}/${zipPath}` });
                summary.uploadedFiles += 1;
                includedCollectionIds.add(file.id);
              }
            }
            collectionIdsToConfirm.push(file.id);
          }

          if (patientHasCriticalError) summary.erroredPatients += 1;
          else {
            summary.syncedPatients += 1;
            patientIdsToConfirm.push(patient.id);
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
      const zipBuffer = await archiveFinished;
      await setCurrentStep(6);
      this.ensureRunNotCancelled(run.id);
      const zipSha256 = await this.artifactoryService.uploadFile(
        this.repoZip,
        zipArtifactPath,
        zipBuffer,
        'application/zip',
      );
      await this.appendRunItem({
        runId: run.id,
        action: SamsungSyncItemAction.UPLOAD,
        repo: this.repoZip,
        path: zipArtifactPath,
        sha256: zipSha256,
        uploaded: true,
        message: `ZIP ${zipName} enviado com sucesso`,
      });

      await setCurrentStep(7);
      this.ensureRunNotCancelled(run.id);
      if (patientIdsToConfirm.length > 0 || collectionIdsToConfirm.length > 0) {
        await this.confirmBatchSync(patientIdsToConfirm, collectionIdsToConfirm);
      }
      await setCurrentStep(8, 'Sincronização concluída');

      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.SUCCESS,
        finished_at: new Date(),
        total_patients: summary.totalPatients,
        synced_patients: summary.syncedPatients,
        errored_patients: summary.erroredPatients,
        uploaded_files: summary.uploadedFiles,
        skipped_files: summary.skippedFiles,
        deleted_files: summary.deletedFiles,
        error_files: summary.errorFiles,
        summary,
      });
      stopHeartbeat();
      this.cancelledRunIds.delete(run.id);
      return { run_id: run.id, status: 'success', summary };
    } catch (error) {
      stopHeartbeat();
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      await this.syncRunRepository.update(run.id, {
        status: SamsungSyncRunStatus.FAILED,
        finished_at: new Date(),
        total_patients: summary.totalPatients,
        synced_patients: summary.syncedPatients,
        errored_patients: summary.erroredPatients,
        uploaded_files: summary.uploadedFiles,
        skipped_files: summary.skippedFiles,
        deleted_files: summary.deletedFiles,
        error_files: summary.errorFiles + 1,
        summary,
        error_message: message,
      });
      this.cancelledRunIds.delete(run.id);
      throw error;
    }
  }

  private async confirmPatientSync(patientId: string, collectionIds: string[]) {
    return this.confirmBatchSync([patientId], collectionIds);
  }

  private async confirmBatchSync(patientIds: string[], collectionIds: string[]) {
    if (patientIds.length > 0) {
      await this.db.query(
        `
        UPDATE patients
           SET sync_pending = FALSE,
               synced_at = NOW()
         WHERE id = ANY($1::uuid[])
        `,
        [patientIds],
      );
    }

    if (collectionIds.length > 0) {
      await this.db.query(
        `
        UPDATE binary_collections
           SET file_sync_pending = FALSE,
               file_synced_at = NOW()
         WHERE id = ANY($1::uuid[])
           AND deleted_pending = FALSE
        `,
        [collectionIds],
      );
    }

    await this.db.query(
      `
      DELETE FROM binary_collections
       WHERE patient_cpf_hash IN (
          SELECT cpf_hash
            FROM patients
           WHERE id = ANY($1::uuid[])
       )
         AND deleted_pending = TRUE
      `,
      [patientIds],
    );
  }

  async listZipArtifacts() {
    return this.artifactoryService.listArtifacts(this.repoZip, this.zipBasePath);
  }

  async downloadZipArtifact(name: string) {
    const safeName = (name || '').split('/').pop() || '';
    if (!safeName.endsWith('.zip')) {
      throw new Error('Artefato inválido');
    }
    return this.artifactoryService.downloadFile(
      this.repoZip,
      `${this.zipBasePath}/${safeName}`,
    );
  }

  async deleteZipArtifact(name: string) {
    const safeName = (name || '').split('/').pop() || '';
    if (!safeName.endsWith('.zip')) {
      throw new Error('Artefato inválido');
    }
    await this.artifactoryService.deleteFile(
      this.repoZip,
      `${this.zipBasePath}/${safeName}`,
    );
  }
}
