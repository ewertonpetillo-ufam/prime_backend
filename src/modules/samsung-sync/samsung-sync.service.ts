import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  SamsungSyncRun,
  SamsungSyncRunStatus,
} from '../../entities/samsung-sync-run.entity';
import {
  SamsungSyncItemAction,
  SamsungSyncRunItem,
} from '../../entities/samsung-sync-run-item.entity';
import { ArtifactoryService } from './artifactory.service';

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

@Injectable()
export class SamsungSyncService implements OnModuleInit {
  private readonly logger = new Logger(SamsungSyncService.name);
  private readonly repoPatients: string;
  private readonly repoCollections: string;
  private readonly basePath: string;

  constructor(
    @InjectDataSource() private readonly db: DataSource,
    @InjectRepository(SamsungSyncRun)
    private readonly syncRunRepository: Repository<SamsungSyncRun>,
    @InjectRepository(SamsungSyncRunItem)
    private readonly syncRunItemRepository: Repository<SamsungSyncRunItem>,
    private readonly artifactoryService: ArtifactoryService,
    private readonly configService: ConfigService,
  ) {
    this.repoPatients =
      this.configService.get<string>('ARTIFACTORY_REPO_PATIENTS') ||
      'srbr-ufamprime-generic-local';
    this.repoCollections =
      this.configService.get<string>('ARTIFACTORY_REPO_COLLECTIONS') ||
      this.repoPatients;
    this.basePath = (
      this.configService.get<string>('ARTIFACTORY_BASE_PATH') || 'test_api'
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
      void this.runSync(null, 'scheduler');
    }, intervalMs);
  }

  private toDateFolder(value: string | Date | null | undefined): string {
    if (!value) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    }
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private isSamsungExcludedPublicIdentifier(publicIdentifier?: string | null): boolean {
    const normalized = (publicIdentifier || '').trim().toUpperCase();
    return normalized === 'P000' || normalized === 'P00';
  }

  private extractTaskCodeFromFilename(fileName: string): string | null {
    const match = /TA\d{1,2}/i.exec(fileName || '');
    return match ? match[0].toUpperCase() : null;
  }

  private isSpeechTask(taskCode: string | null): boolean {
    return taskCode === 'TA10' || taskCode === 'TA11' || taskCode === 'TA12';
  }

  private inferSamsungProtocol(taskCode: string | null, fileName: string): 'Clinic' | 'Sleep' | 'Free-living' {
    if (taskCode === 'TA13' || /sleep|sono|psg/i.test(fileName)) return 'Sleep';
    return 'Clinic';
  }

  private inferSamsungDevice(fileName: string): string {
    if (/baiobit|biobit/i.test(fileName)) return 'Baiobit';
    if (/emg|delsys/i.test(fileName)) return 'EMG';
    if (/ring/i.test(fileName)) return 'Ring';
    if (/psg|polysomn|polisson/i.test(fileName)) return 'PSG';
    if (/-SP-|_SP_|smartphone/i.test(fileName)) return 'SP';
    return 'SW';
  }

  private toStageFolder(protocol: 'Clinic' | 'Sleep' | 'Free-living'): string {
    if (protocol === 'Sleep') return '2_Sleep';
    if (protocol === 'Free-living') return '3_Free-living';
    return '1_In-Clinic';
  }

  private toSamsungDeviceFolder(device: string): string {
    const upper = device.toUpperCase();
    if (upper === 'SW') return 'SW_Smartwatch';
    if (upper === 'SP') return 'SP_Smartphone';
    if (upper === 'PSG') return 'PSG';
    if (upper === 'EMG') return 'EMG';
    if (upper === 'RING') return 'Ring';
    if (upper === 'BAIOBIT' || upper === 'BIOBIT') return 'Baiobit';
    return device;
  }

  private buildSamsungActiveTaskFilename(
    rawFileName: string,
    subjectId: string,
    collectionDate: string,
    file: PendingFile,
    device: string,
  ): string {
    const fallback = `${file.id}.csv`;
    const base = (rawFileName || fallback).trim().split(/[/\\]/).pop() || fallback;
    const extMatch = base.match(/(\.[^.]+)$/i);
    const ext = extMatch ? extMatch[1] : '.csv';
    const stem = extMatch ? base.slice(0, -ext.length) : base;

    const taskCode = this.extractTaskCodeFromFilename(stem) || 'TA0';
    const protocol = this.inferSamsungProtocol(taskCode === 'TA0' ? null : taskCode, stem);
    const stageLabel = protocol === 'Sleep' ? 'Stage2' : protocol === 'Free-living' ? 'Stage3' : 'Stage1';
    const deviceCode = device.toUpperCase() === 'BAIOBIT' ? 'BAIOBIT' : device.toUpperCase();
    const repetition =
      Number(file?.metadata?.repetition || file?.metadata?.rep || file?.metadata?.repetitions_count || 1) || 1;

    return `${collectionDate}-${subjectId}-${stageLabel}-${deviceCode}-NA-SDK-${taskCode}-Rep${Math.max(
      1,
      repetition,
    )}${ext}`;
  }

  private toSubjectId(publicIdentifier?: string | null): string {
    const digits = (publicIdentifier || '').replace(/\D/g, '');
    const num = digits ? Number(digits) : 0;
    return `S${String(num || 0).padStart(3, '0')}`;
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

  private getCollectionPath(patient: PendingPatient, file: PendingFile): string {
    const { subjectId } = this.getPatientPath(patient);
    const originalName =
      (file.metadata?.file_name as string | undefined) || `${file.id}.csv`;
    const taskCode = this.extractTaskCodeFromFilename(originalName);
    if (this.isSpeechTask(taskCode)) {
      return '';
    }
    const protocol = this.inferSamsungProtocol(taskCode, originalName);
    const stageFolder = this.toStageFolder(protocol);
    const device = this.inferSamsungDevice(originalName);
    const deviceFolder = this.toSamsungDeviceFolder(device);
    const collectionDate = this.toDateFolder(file.collected_at || patient.sync_pending_at);
    const finalName = this.buildSamsungActiveTaskFilename(
      originalName,
      subjectId,
      collectionDate,
      file,
      device,
    );
    return `${this.basePath}/${collectionDate}/${subjectId}/${stageFolder}/${deviceFolder}/${finalName}`;
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

  private async getPendingPatients(): Promise<PendingPatient[]> {
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
      GROUP BY p.id
      ORDER BY p.sync_pending_at ASC NULLS LAST
    `);

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
  ) {
    this.logger.log(
      `Iniciando runSyncAsync. triggerType=${triggerType} userId=${triggeredByUserId ?? 'n/a'}`,
    );
    const run = await this.createRun(triggeredByUserId, triggerType);
    setTimeout(() => {
      void this.executeRun(run);
    }, 0);
    return { run_id: run.id, status: 'running' as const };
  }

  async runSync(
    triggeredByUserId: string | null,
    triggerType: 'manual' | 'scheduler' = 'manual',
  ) {
    this.logger.log(
      `Iniciando runSync. triggerType=${triggerType} userId=${triggeredByUserId ?? 'n/a'}`,
    );
    const run = await this.createRun(triggeredByUserId, triggerType);
    return this.executeRun(run);
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

  private async executeRun(run: SamsungSyncRun) {

    const summary = {
      totalPatients: 0,
      syncedPatients: 0,
      erroredPatients: 0,
      uploadedFiles: 0,
      skippedFiles: 0,
      deletedFiles: 0,
      errorFiles: 0,
    };

    try {
      this.logger.log(`Run ${run.id}: validando conectividade com Artifactory`);
      await this.artifactoryService.ping();
      this.logger.log(`Run ${run.id}: conectividade com Artifactory OK`);
      const patients = await this.getPendingPatients();
      summary.totalPatients = patients.length;
      this.logger.log(`Run ${run.id}: ${patients.length} pacientes pendentes encontrados`);
      await this.updateRunProgress(run.id, summary);

      for (const patient of patients) {
        if (this.isSamsungExcludedPublicIdentifier(patient.public_identifier)) {
          this.logger.log(
            `Run ${run.id}: paciente ignorado por regra de teste (${patient.public_identifier})`,
          );
          continue;
        }
        const syncedFileIds: string[] = [];
        try {
          this.logger.log(
            `Run ${run.id}: sincronizando paciente ${patient.id} (${patient.public_identifier ?? 'sem-id'})`,
          );

          for (const file of patient.files || []) {
            const artifactPath = this.getCollectionPath(patient, file);
            if (!artifactPath) {
              this.logger.log(
                `Run ${run.id}: arquivo ${file.id} ignorado por regra de nomenclatura/tarefa`,
              );
              continue;
            }
            if (file.deleted_pending) {
              this.logger.log(`Run ${run.id}: removendo artefato ${artifactPath}`);
              await this.artifactoryService.deleteFile(
                this.repoCollections,
                artifactPath,
              );
              syncedFileIds.push(file.id);
              summary.deletedFiles += 1;

              await this.appendRunItem({
                runId: run.id,
                patientId: patient.id,
                collectionId: file.id,
                action: SamsungSyncItemAction.DELETE,
                repo: this.repoCollections,
                path: artifactPath,
                uploaded: true,
                message: 'Arquivo removido no destino',
              });
              continue;
            }

            if (!file.csv_data) continue;

            this.logger.log(
              `Run ${run.id}: enviando/checando arquivo ${file.id} para ${artifactPath}`,
            );
            const upload = await this.artifactoryService.uploadIfChanged(
              this.repoCollections,
              artifactPath,
              file.csv_data,
              file.file_hash,
              'application/octet-stream',
            );

            if (upload.uploaded) {
              await this.db.query(
                `
                UPDATE binary_collections
                   SET file_hash = $1
                 WHERE id = $2
                `,
                [upload.sha256, file.id],
              );
              summary.uploadedFiles += 1;
            } else {
              summary.skippedFiles += 1;
            }

            syncedFileIds.push(file.id);

            await this.appendRunItem({
              runId: run.id,
              patientId: patient.id,
              collectionId: file.id,
              action: upload.uploaded
                ? SamsungSyncItemAction.UPLOAD
                : SamsungSyncItemAction.SKIP,
              repo: this.repoCollections,
              path: artifactPath,
              sha256: upload.sha256,
              uploaded: upload.uploaded,
              message: upload.uploaded ? 'Arquivo enviado' : 'Arquivo sem mudanças',
            });
          }

          await this.confirmPatientSync(patient.id, syncedFileIds);
          this.logger.log(
            `Run ${run.id}: paciente ${patient.id} confirmado com ${syncedFileIds.length} itens`,
          );
          summary.syncedPatients += 1;
          await this.updateRunProgress(run.id, summary);
        } catch (error) {
          summary.erroredPatients += 1;
          const message =
            error instanceof Error ? error.message : 'Erro desconhecido';
          this.logger.error(
            `Falha ao sincronizar paciente ${patient.id}: ${message}`,
          );
          await this.appendRunItem({
            runId: run.id,
            patientId: patient.id,
            action: SamsungSyncItemAction.ERROR,
            repo: this.repoCollections,
            path: this.basePath,
            uploaded: false,
            error: message,
          });
          summary.errorFiles += 1;
          await this.updateRunProgress(run.id, summary);
        }
      }

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
      this.logger.log(
        `Run ${run.id} concluído com sucesso. pacientes=${summary.totalPatients} uploaded=${summary.uploadedFiles} skipped=${summary.skippedFiles} deleted=${summary.deletedFiles} errors=${summary.errorFiles}`,
      );

      return {
        run_id: run.id,
        status: 'success',
        summary,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Run ${run.id} falhou: ${message}`);
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
      throw error;
    }
  }

  private async confirmPatientSync(patientId: string, collectionIds: string[]) {
    await this.db.query(
      `
      UPDATE patients
         SET sync_pending = FALSE,
             synced_at = NOW()
       WHERE id = $1
      `,
      [patientId],
    );

    if (collectionIds.length === 0) return;

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

    await this.db.query(
      `
      DELETE FROM binary_collections
       WHERE id = ANY($1::uuid[])
         AND deleted_pending = TRUE
      `,
      [collectionIds],
    );
  }
}
