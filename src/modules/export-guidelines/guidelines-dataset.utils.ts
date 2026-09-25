import { readFileSync } from 'fs';
import { join } from 'path';

/** Study / Project / schema — UFAM_PRIME_DataGuideliness_V1 + guidelines v1.9 */
export const GUIDELINES_STUDY = 'MentalHealth';
export const GUIDELINES_PROJECT = '2026_UFAM_Parkinson_1';
export const GUIDELINES_SCHEMA_VERSION = '2026-06-18';
export const GUIDELINES_SITE = 'Manaus / AM / Brazil';
export const GUIDELINES_EXECUTE_ORG = 'UFAM';
export const GUIDELINES_TIMEZONE_OFFSET = '-04:00';

export type GuidelinesSessionKind = 'InClinic' | 'PSG' | 'FreeLiving';

export type GuidelinesActivity =
  | 'in_clinic'
  | 'psg'
  | 'free_living';

export type GuidelinesDeviceId =
  | 'User_Data'
  | 'GW8_PrimeInClinic'
  | 'GW8_PrimeFreeLiving'
  | 'GW8_SamsungHealth'
  | 'SP_PrimeInClinic'
  | 'SP_SymptomsDiary'
  | 'Baiobit'
  | 'EMG'
  | 'PSG_Annotations';

export const SPEECH_FEATURE_TASK_CODES = ['TA10', 'TA11', 'TA12'] as const;
export const FREE_LIVING_RAW_TASK_CODES = ['FL01', 'FL02'] as const;
export const FREE_LIVING_SAMSUNG_HEALTH_TASK = 'FL03';

export const activityForSessionKind = (
  kind: GuidelinesSessionKind,
): GuidelinesActivity => {
  if (kind === 'PSG') return 'psg';
  if (kind === 'FreeLiving') return 'free_living';
  return 'in_clinic';
};

/** subject_id = public_identifier (P001), sem hash CPF. */
export const toGuidelinesSubjectId = (
  publicIdentifier?: string | null,
): string => {
  const raw = (publicIdentifier || '').trim().toUpperCase();
  if (!raw) return 'P000';
  const withP = /^P(\d+)$/i.exec(raw);
  if (withP) return `P${withP[1].padStart(3, '0')}`;
  const digits = raw.replace(/\D/g, '');
  if (digits) return `P${digits.padStart(3, '0')}`;
  return raw.replace(/[^A-Z0-9_-]/gi, '_');
};

export const toGuidelinesSessionDate = (
  value: string | Date | null | undefined,
): string => {
  if (!value) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Manaus',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date())
      .replace(/-/g, '');
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10).replace(/-/g, '');
  }
  if (typeof value === 'string' && /^\d{8}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return toGuidelinesSessionDate(null);
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/-/g, '');
};

export const buildGuidelinesSessionId = (
  subjectId: string,
  sessionDateYyyymmdd: string,
  kind: GuidelinesSessionKind,
): string => `${subjectId}_${sessionDateYyyymmdd}_${kind}`;

export const guidelinesProjectRoot = (): string =>
  `${GUIDELINES_STUDY}/${GUIDELINES_PROJECT}`;

export const guidelinesSessionPath = (sessionId: string): string =>
  `${guidelinesProjectRoot()}/${sessionId}`;

export const guidelinesDevicePath = (
  sessionId: string,
  deviceId: GuidelinesDeviceId,
): string => `${guidelinesSessionPath(sessionId)}/${deviceId}`;

export const guidelinesFilePath = (
  sessionId: string,
  deviceId: GuidelinesDeviceId,
  fileName: string,
): string => `${guidelinesDevicePath(sessionId, deviceId)}/${fileName}`;

export const guidelinesMetadataJsonPath = (sessionId: string): string =>
  `${guidelinesSessionPath(sessionId)}/metadata.json`;

export const guidelinesProjectInfoPath = (): string =>
  `${guidelinesProjectRoot()}/project_info.md`;

export const isSpeechFeatureTask = (taskCode: string | null): boolean => {
  if (!taskCode) return false;
  return (SPEECH_FEATURE_TASK_CODES as readonly string[]).includes(
    taskCode.toUpperCase(),
  );
};

export const isSpeechAudioFile = (fileName: string): boolean => {
  const lower = (fileName || '').toLowerCase();
  return (
    lower.endsWith('.wav') ||
    lower.endsWith('.mp3') ||
    lower.endsWith('.m4a') ||
    lower.endsWith('.aac') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.flac')
  );
};

/** Inclui CSV de features de fala; exclui áudio. */
export const shouldIncludeSpeechBinary = (
  taskCode: string | null,
  fileName: string,
): boolean => {
  if (!isSpeechFeatureTask(taskCode)) return true;
  if (isSpeechAudioFile(fileName)) return false;
  return /\.csv$/i.test(fileName || '');
};

export const isFreeLivingRawTask = (taskCode: string | null): boolean => {
  if (!taskCode) return false;
  return (FREE_LIVING_RAW_TASK_CODES as readonly string[]).includes(
    taskCode.toUpperCase(),
  );
};

export const isFreeLivingSamsungHealthTask = (
  taskCode: string | null,
): boolean => (taskCode || '').toUpperCase() === FREE_LIVING_SAMSUNG_HEALTH_TASK;

export const isFreeLivingTask = (taskCode: string | null): boolean =>
  isFreeLivingRawTask(taskCode) || isFreeLivingSamsungHealthTask(taskCode);

export const isPsgTask = (taskCode: string | null): boolean =>
  (taskCode || '').toUpperCase() === 'TA13';

export const resolveGuidelinesSessionKind = (
  taskCode: string | null,
  fileName: string,
  reportType?: string | null,
): GuidelinesSessionKind => {
  const type = (reportType || '').toUpperCase();
  if (type === 'POLYSOMNOGRAPHY' || isPsgTask(taskCode) || /psg|polysomn|sono/i.test(fileName)) {
    return 'PSG';
  }
  if (isFreeLivingTask(taskCode) || /freeliving|free.?living|fl0[123]/i.test(fileName)) {
    return 'FreeLiving';
  }
  return 'InClinic';
};

export const resolveGuidelinesDeviceId = (input: {
  taskCode: string | null;
  fileName: string;
  reportType?: string | null;
  isUserData?: boolean;
  isDiary?: boolean;
}): GuidelinesDeviceId => {
  if (input.isDiary) return 'SP_SymptomsDiary';
  if (input.isUserData) return 'User_Data';

  const type = (input.reportType || '').toUpperCase();
  if (type === 'BIOBIT' || /baiobit|biobit/i.test(input.fileName)) return 'Baiobit';
  if (type === 'DELSYS' || /emg|delsys/i.test(input.fileName)) return 'EMG';
  if (
    type === 'POLYSOMNOGRAPHY' ||
    /\.edf$/i.test(input.fileName) ||
    /psg|polysomn/i.test(input.fileName)
  ) {
    return 'PSG_Annotations';
  }

  const task = (input.taskCode || '').toUpperCase();
  if (isSpeechFeatureTask(task)) return 'SP_PrimeInClinic';
  if (isFreeLivingSamsungHealthTask(task)) return 'GW8_SamsungHealth';
  if (isFreeLivingRawTask(task)) return 'GW8_PrimeFreeLiving';
  if (isPsgTask(task)) {
    if (/\.edf$/i.test(input.fileName) || /annotation/i.test(input.fileName)) {
      return 'PSG_Annotations';
    }
    return 'GW8_PrimeInClinic';
  }

  // TA6–TA9 smartphone non-speech → still GW8 / SP: plan maps SP only for speech features
  if (['TA6', 'TA7', 'TA8', 'TA9'].includes(task)) {
    return 'SP_PrimeInClinic';
  }

  return 'GW8_PrimeInClinic';
};

/**
 * EMG/Baiobit chegam com o nome do paciente no arquivo
 * (ex.: maria_auxiliadora_-_fog_01.csv). Mantém só o trecho clínico
 * e prefixa o identificador PXXX.
 */
export const anonymizeExternalReportFileName = (
  rawFileName: string,
  subjectId: string,
): string => {
  const base = (rawFileName || 'file').trim().split(/[/\\]/).pop() || 'file';
  const extMatch = base.match(/(\.(?:csv|txt|edf|pdf|zip|json|md))$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  let stem = (ext ? base.slice(0, -ext.length) : base).toLowerCase();
  stem = stem.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '');
  stem = stem.replace(/\b\d{11}\b/g, '');
  stem = stem.replace(/\d{1,2}\.\d{1,2}(?:\.\d{2,4})?/g, '');
  const marker = /(fog|tc\d+|tremor(?:_[a-z]+)*)/i.exec(stem);
  if (marker?.index != null) {
    stem = stem.slice(marker.index);
  }
  stem = stem.replace(/[^a-z0-9.]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  stem = stem.replace(/_(?:0?[1-9]|[12]\d|3[01])(?:0?[1-9]|1[0-2])(?=_|$)/g, '');
  stem = stem.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  const id = (subjectId || 'P000').trim().toUpperCase() || 'P000';
  if (!stem) return ext ? `${id}${ext}` : id;
  if (stem.startsWith(`${id.toLowerCase()}_`) || stem === id.toLowerCase()) {
    return `${id}${stem.slice(id.length)}${ext}`;
  }
  return `${id}_${stem}${ext}`;
};

export const normalizeGuidelinesFileName = (
  rawFileName: string,
  taskCode: string | null,
  deviceId: GuidelinesDeviceId,
  subjectId?: string | null,
): string => {
  if (deviceId === 'EMG' || deviceId === 'Baiobit') {
    return anonymizeExternalReportFileName(rawFileName, subjectId || '');
  }
  const base =
    (rawFileName || 'file').trim().split(/[/\\]/).pop() || 'file';
  const lower = base.toLowerCase();

  if (deviceId === 'SP_SymptomsDiary') {
    return 'annotations.csv';
  }
  if (deviceId === 'PSG_Annotations') {
    if (lower.endsWith('.edf')) return 'annotations.edf';
    if (lower.endsWith('.csv')) return 'annotations.csv';
  }
  if (deviceId === 'SP_PrimeInClinic' && isSpeechFeatureTask(taskCode)) {
    const ta = (taskCode || 'TA0').toLowerCase();
    return `features_${ta}.csv`;
  }

  // Prefer accelerometer / ppg when detectable
  if (/ppg/i.test(base) && lower.endsWith('.csv')) return 'ppg.csv';
  if (/(acc|accel|inertial|imu)/i.test(base) && lower.endsWith('.csv')) {
    return 'accelerometer.csv';
  }

  // Strip CPF-like prefixes and normalize
  let stem = lower.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '');
  stem = stem.replace(/\b\d{11}\b/g, '');
  stem = stem.replace(/[^a-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  if (!stem) stem = 'file.csv';
  if (taskCode && !stem.includes(taskCode.toLowerCase())) {
    const extMatch = stem.match(/(\.[^.]+)$/);
    const ext = extMatch ? extMatch[1] : '';
    const name = ext ? stem.slice(0, -ext.length) : stem;
    stem = `${taskCode.toLowerCase()}_${name}${ext || '.csv'}`;
  }
  return stem;
};

export const getUniqueGuidelinesFilename = (
  baseName: string,
  counters: Map<string, number>,
  scope = '',
): string => {
  const safeBase = (baseName || 'file').trim();
  const key = `${scope}::${safeBase}`.toLowerCase();
  const current = (counters.get(key) || 0) + 1;
  counters.set(key, current);
  if (current === 1) return safeBase;
  const extMatch = safeBase.match(/(\.[^.]+)$/i);
  const ext = extMatch ? extMatch[1] : '';
  const stem = ext ? safeBase.slice(0, -ext.length) : safeBase;
  return `${stem}(${current})${ext}`;
};

export const toManausIsoDateTime = (
  dateYyyymmdd: string,
  endOfDay = false,
): string => {
  const y = dateYyyymmdd.slice(0, 4);
  const m = dateYyyymmdd.slice(4, 6);
  const d = dateYyyymmdd.slice(6, 8);
  const hms = endOfDay ? '23:59:59' : '00:00:00';
  return `${y}-${m}-${d}T${hms}${GUIDELINES_TIMEZONE_OFFSET}`;
};

export const loadGuidelinesProjectInfoMarkdown = (): string => {
  const candidates = [
    join(__dirname, 'templates', 'project_info.md'),
    join(__dirname, '..', 'export-guidelines', 'templates', 'project_info.md'),
    join(
      process.cwd(),
      'src',
      'modules',
      'export-guidelines',
      'templates',
      'project_info.md',
    ),
  ];
  for (const path of candidates) {
    try {
      return readFileSync(path, 'utf-8');
    } catch {
      // try next
    }
  }
  return `# Project Name\n${GUIDELINES_PROJECT}\n`;
};

export type GuidelinesSubjectFields = {
  subject_id: string;
  age: number;
  sex: 'male' | 'female' | 'intersex' | 'unknown';
  height_cm: number;
  weight_kg: number;
};

export const extractGuidelinesSubjectFields = (
  subjectId: string,
  questionnaireData?: Record<string, any> | null,
): GuidelinesSubjectFields => {
  const data = questionnaireData || {};
  const ageRaw = Number(data.age);
  const heightRaw = Number(data.height ?? data.height_cm);
  const weightRaw = Number(data.weight ?? data.weight_kg);
  const genderRaw = String(data.gender || data.sex || '')
    .trim()
    .toLowerCase();

  let sex: GuidelinesSubjectFields['sex'] = 'unknown';
  if (['male', 'm', 'masculino', 'homem'].includes(genderRaw)) sex = 'male';
  else if (['female', 'f', 'feminino', 'mulher'].includes(genderRaw)) sex = 'female';
  else if (['intersex', 'intersexo'].includes(genderRaw)) sex = 'intersex';

  return {
    subject_id: subjectId,
    age: Number.isFinite(ageRaw) && ageRaw > 0 ? Math.round(ageRaw) : 0,
    sex,
    height_cm: Number.isFinite(heightRaw) && heightRaw > 0 ? heightRaw : 0,
    weight_kg: Number.isFinite(weightRaw) && weightRaw > 0 ? weightRaw : 0,
  };
};
