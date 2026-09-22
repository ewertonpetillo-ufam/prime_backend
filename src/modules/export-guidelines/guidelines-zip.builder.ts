import {
  GuidelinesDeviceId,
  GuidelinesSessionKind,
  buildGuidelinesSessionId,
  extractGuidelinesSubjectFields,
  getUniqueGuidelinesFilename,
  guidelinesFilePath,
  guidelinesMetadataJsonPath,
  guidelinesProjectInfoPath,
  isFreeLivingTask,
  isPsgTask,
  isSpeechAudioFile,
  isSpeechFeatureTask,
  loadGuidelinesProjectInfoMarkdown,
  normalizeGuidelinesFileName,
  resolveGuidelinesDeviceId,
  resolveGuidelinesSessionKind,
  shouldIncludeSpeechBinary,
  toGuidelinesSessionDate,
  toGuidelinesSubjectId,
} from './guidelines-dataset.utils';
import { buildGuidelinesMetadataJson } from './guidelines-metadata.builder';

export type GuidelinesPackEntry = {
  zipPath: string;
  buffer?: Buffer;
  filePath?: string;
  generationDate: string;
  message?: string;
};

export type GuidelinesBinaryInput = {
  id: string;
  metadata?: Record<string, any> | null;
  collected_at?: string | Date | null;
  active_task?: { task_code?: string | null } | null;
  file_sync_pending?: boolean;
  deleted_pending?: boolean;
  repetitions_count?: number;
};

export type GuidelinesPdfInput = {
  id?: string;
  report_type?: string;
  file_name?: string;
  file_path?: string | null;
  file_sync_pending?: boolean;
  mime_type?: string | null;
};

export type GuidelinesQuestionnaireExport = {
  questionnaire?: {
    id?: string;
    createdAt?: string | Date | null;
    collection_date?: string | Date | null;
    data?: Record<string, any> | null;
    public_identifier?: string | null;
    patient?: { public_identifier?: string | null } | null;
    cpfHash?: string;
  };
  csvFiles?: Record<string, string>;
  pdfReports?: GuidelinesPdfInput[];
  binaryCollections?: GuidelinesBinaryInput[];
};

type SessionBucket = {
  kind: GuidelinesSessionKind;
  sessionDate: string;
  sessionId: string;
  deviceFiles: Map<GuidelinesDeviceId, GuidelinesPackEntry[]>;
  remarks: string | null;
};

const USER_DATA_MAP: Array<{ key: string; fileName: string; sessions: GuidelinesSessionKind[] }> = [
  {
    key: 'demographicAnthropometricClinical',
    fileName: 'demographics.csv',
    sessions: ['InClinic'],
  },
  {
    key: 'neurologicalAssessment',
    fileName: 'motorevaluation.csv',
    sessions: ['InClinic'],
  },
  {
    key: 'speechTherapy',
    fileName: 'speechtherapy.csv',
    sessions: ['InClinic'],
  },
  {
    key: 'sleepAssessment',
    fileName: 'sleepevaluation.csv',
    sessions: ['InClinic', 'PSG'],
  },
  {
    key: 'physiotherapy',
    fileName: 'fogevaluation.csv',
    sessions: ['InClinic'],
  },
];

function resolveTaskCode(
  metadata: Record<string, any> | null | undefined,
  activeTask: { task_code?: string | null } | null | undefined,
  fileName: string,
): string | null {
  const fromActive = activeTask?.task_code;
  if (typeof fromActive === 'string' && fromActive.trim()) {
    return fromActive.trim().toUpperCase();
  }
  const fromMeta = metadata?.task_code;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim().toUpperCase();
  }
  const match = /(?:TA|FL)\d{1,2}/i.exec(fileName || '');
  return match ? match[0].toUpperCase() : null;
}

function generationDateFromYyyymmdd(yyyymmdd: string): string {
  if (/^\d{8}$/.test(yyyymmdd)) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  }
  return yyyymmdd;
}

function ensureSession(
  sessions: Map<string, SessionBucket>,
  subjectId: string,
  kind: GuidelinesSessionKind,
  sessionDate: string,
): SessionBucket {
  const sessionId = buildGuidelinesSessionId(subjectId, sessionDate, kind);
  let bucket = sessions.get(sessionId);
  if (!bucket) {
    bucket = {
      kind,
      sessionDate,
      sessionId,
      deviceFiles: new Map(),
      remarks: null,
    };
    sessions.set(sessionId, bucket);
  }
  return bucket;
}

function addDeviceFile(
  bucket: SessionBucket,
  deviceId: GuidelinesDeviceId,
  entry: Omit<GuidelinesPackEntry, 'zipPath'> & { fileName: string },
  nameCounters: Map<string, number>,
): void {
  const uniqueName = getUniqueGuidelinesFilename(
    entry.fileName,
    nameCounters,
    `${bucket.sessionId}/${deviceId}`,
  );
  const zipPath = guidelinesFilePath(bucket.sessionId, deviceId, uniqueName);
  const list = bucket.deviceFiles.get(deviceId) || [];
  list.push({
    zipPath,
    buffer: entry.buffer,
    filePath: entry.filePath,
    generationDate: entry.generationDate,
    message: entry.message,
  });
  bucket.deviceFiles.set(deviceId, list);
}

export function buildGuidelinesProjectInfoEntry(): GuidelinesPackEntry {
  return {
    zipPath: guidelinesProjectInfoPath(),
    buffer: Buffer.from(loadGuidelinesProjectInfoMarkdown(), 'utf-8'),
    generationDate: '',
    message: 'project_info.md',
  };
}

export type BuildGuidelinesPatientResult = {
  entries: GuidelinesPackEntry[];
  includedCollectionIds: Set<string>;
  skippedSpeechAudioIds: string[];
  pdfReportIds: string[];
};

/**
 * Monta entradas Study/Project/Session/Device para um sujeito.
 * Não cria Device vazio; gera metadata.json por sessão com arquivos.
 */
export function buildGuidelinesPatientEntries(input: {
  publicIdentifier?: string | null;
  exportItems: GuidelinesQuestionnaireExport[];
  binaryPayloadById: Map<string, Buffer>;
  pdfTempPathByReportId?: Map<string, string>;
  /** Alternativa a filePath: buffer do PDF já em memória (export-zip). */
  pdfBufferByReportId?: Map<string, Buffer>;
  freeLivingDiaryCsv?: string | null;
  freeLivingSessionDate?: string | Date | null;
  /** Se true, só inclui binários/PDF com file_sync_pending (exceto 1ª sync). */
  onlyPendingBinaries?: boolean;
  patientEverSynced?: boolean;
}): BuildGuidelinesPatientResult {
  const subjectId = toGuidelinesSubjectId(input.publicIdentifier);
  const sessions = new Map<string, SessionBucket>();
  const nameCounters = new Map<string, number>();
  const includedCollectionIds = new Set<string>();
  const skippedSpeechAudioIds: string[] = [];
  const pdfReportIds: string[] = [];

  const primaryExport = input.exportItems[0];
  const subject = extractGuidelinesSubjectFields(
    subjectId,
    primaryExport?.questionnaire?.data || null,
  );

  for (const exported of input.exportItems) {
    const qDate = toGuidelinesSessionDate(
      exported?.questionnaire?.data?.dataColeta ||
        exported?.questionnaire?.collection_date ||
        exported?.questionnaire?.createdAt,
    );
    const generationDate = generationDateFromYyyymmdd(qDate);

    for (const mapping of USER_DATA_MAP) {
      const content = exported?.csvFiles?.[mapping.key] || '';
      if (!content || !String(content).trim()) continue;
      for (const kind of mapping.sessions) {
        const bucket = ensureSession(sessions, subjectId, kind, qDate);
        addDeviceFile(
          bucket,
          'User_Data',
          {
            fileName: mapping.fileName,
            buffer: Buffer.from(content, 'utf-8'),
            generationDate,
            message: `User_Data/${mapping.fileName}`,
          },
          nameCounters,
        );
      }
    }

    for (const report of exported?.pdfReports || []) {
      if (
        input.onlyPendingBinaries &&
        input.patientEverSynced &&
        report.file_sync_pending !== true
      ) {
        continue;
      }
      const reportType = (report.report_type || '').toUpperCase();
      const fileName = report.file_name || 'relatorio.pdf';
      // Exclude PSG PDF laudo (PII); EDF goes as annotations
      if (reportType === 'POLYSOMNOGRAPHY' && !/\.edf$/i.test(fileName)) {
        continue;
      }
      const kind = resolveGuidelinesSessionKind(null, fileName, reportType);
      const deviceId = resolveGuidelinesDeviceId({
        taskCode: null,
        fileName,
        reportType,
      });
      const sessionDate = qDate;
      const bucket = ensureSession(sessions, subjectId, kind, sessionDate);
      const normalized =
        deviceId === 'PSG_Annotations' && /\.edf$/i.test(fileName)
          ? 'annotations.edf'
          : normalizeGuidelinesFileName(fileName, null, deviceId);
      const tempPath =
        report.id && input.pdfTempPathByReportId
          ? input.pdfTempPathByReportId.get(String(report.id))
          : undefined;
      const pdfBuffer =
        report.id && input.pdfBufferByReportId
          ? input.pdfBufferByReportId.get(String(report.id))
          : undefined;
      if (!tempPath && !pdfBuffer) continue;
      addDeviceFile(
        bucket,
        deviceId,
        {
          fileName: normalized,
          filePath: tempPath,
          buffer: pdfBuffer,
          generationDate,
          message: `${deviceId}/${normalized}`,
        },
        nameCounters,
      );
      if (report.id) pdfReportIds.push(String(report.id));
    }

    for (const collection of exported?.binaryCollections || []) {
      if (
        input.onlyPendingBinaries &&
        input.patientEverSynced &&
        collection.deleted_pending !== true &&
        collection.file_sync_pending !== true
      ) {
        continue;
      }
      const fileName = (collection?.metadata?.file_name || '').toString();
      if (!fileName) continue;
      const taskCode = resolveTaskCode(
        collection.metadata,
        collection.active_task,
        fileName,
      );
      if (isSpeechFeatureTask(taskCode) && isSpeechAudioFile(fileName)) {
        skippedSpeechAudioIds.push(collection.id);
        continue;
      }
      if (!shouldIncludeSpeechBinary(taskCode, fileName)) {
        skippedSpeechAudioIds.push(collection.id);
        continue;
      }
      const payload = input.binaryPayloadById.get(collection.id);
      if (!payload) continue;

      const kind = resolveGuidelinesSessionKind(taskCode, fileName);
      const deviceId = resolveGuidelinesDeviceId({ taskCode, fileName });
      const collectedDate = toGuidelinesSessionDate(
        collection.collected_at || qDate,
      );
      const bucket = ensureSession(sessions, subjectId, kind, collectedDate);
      const normalized = normalizeGuidelinesFileName(fileName, taskCode, deviceId);
      addDeviceFile(
        bucket,
        deviceId,
        {
          fileName: normalized,
          buffer: payload,
          generationDate: generationDateFromYyyymmdd(collectedDate),
          message: `${deviceId}/${normalized}`,
        },
        nameCounters,
      );
      includedCollectionIds.add(collection.id);
    }
  }

  // Free Living diary → SP_SymptomsDiary/annotations.csv
  if (input.freeLivingDiaryCsv && input.freeLivingDiaryCsv.trim()) {
    const flDate = toGuidelinesSessionDate(
      input.freeLivingSessionDate ||
        primaryExport?.questionnaire?.collection_date ||
        primaryExport?.questionnaire?.createdAt,
    );
    const bucket = ensureSession(sessions, subjectId, 'FreeLiving', flDate);
    addDeviceFile(
      bucket,
      'SP_SymptomsDiary',
      {
        fileName: 'annotations.csv',
        buffer: Buffer.from(input.freeLivingDiaryCsv, 'utf-8'),
        generationDate: generationDateFromYyyymmdd(flDate),
        message: 'SP_SymptomsDiary/annotations.csv',
      },
      nameCounters,
    );
  }

  const entries: GuidelinesPackEntry[] = [];
  for (const bucket of sessions.values()) {
    const deviceIds = [...bucket.deviceFiles.keys()];
    if (deviceIds.length === 0) continue;

    for (const [, files] of bucket.deviceFiles) {
      entries.push(...files);
    }

    const remarks =
      deviceIds.includes('User_Data')
        ? 'User_Data clinical CSVs included'
        : null;
    const metadata = buildGuidelinesMetadataJson({
      sessionId: bucket.sessionId,
      sessionKind: bucket.kind,
      sessionDateYyyymmdd: bucket.sessionDate,
      subject,
      deviceIds,
      remarks,
    });
    entries.push({
      zipPath: guidelinesMetadataJsonPath(bucket.sessionId),
      buffer: Buffer.from(metadata, 'utf-8'),
      generationDate: generationDateFromYyyymmdd(bucket.sessionDate),
      message: 'metadata.json',
    });
  }

  return {
    entries,
    includedCollectionIds,
    skippedSpeechAudioIds,
    pdfReportIds,
  };
}

/** Resolve path Guidelines para um binary collection pendente (auditoria / delete). */
export function buildGuidelinesCollectionZipPath(input: {
  publicIdentifier?: string | null;
  fileName: string;
  taskCode: string | null;
  sessionDate?: string | Date | null;
}): string | null {
  if (!shouldIncludeSpeechBinary(input.taskCode, input.fileName)) {
    return null;
  }
  const subjectId = toGuidelinesSubjectId(input.publicIdentifier);
  const sessionDate = toGuidelinesSessionDate(input.sessionDate);
  const kind = resolveGuidelinesSessionKind(input.taskCode, input.fileName);
  const deviceId = resolveGuidelinesDeviceId({
    taskCode: input.taskCode,
    fileName: input.fileName,
  });
  const sessionId = buildGuidelinesSessionId(subjectId, sessionDate, kind);
  const fileName = normalizeGuidelinesFileName(
    input.fileName,
    input.taskCode,
    deviceId,
  );
  return guidelinesFilePath(sessionId, deviceId, fileName);
}

export {
  resolveTaskCode as resolveGuidelinesTaskCode,
  isPsgTask,
  isFreeLivingTask,
};
