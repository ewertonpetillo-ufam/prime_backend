import archiver = require('archiver');

export type SamsungProtocol = 'Clinic' | 'Sleep' | 'Free-living';

export const SUBJECT_DATA_FOLDER = 'Subject_Data';

/** @deprecated Use SUBJECT_DATA_FOLDER */
export const CLINICAL_DATA_FOLDER = SUBJECT_DATA_FOLDER;

export type DeliveryMetadataRow = {
  generation_date: string;
  download_url: string;
};

/**
 * Nomenclatura de CSV de tarefas ativas (lateralidade, INERTIAL/SDK, STA, Rep):
 * manter alinhado com prime/lib/samsungActiveTaskFilename.ts
 */

export const SAMSUNG_SYNC_PROGRESS_STEPS = [
  'Validando conectividade com o BART',
  'Carregando exportação Samsung',
  'Processando metadados e questionários',
  'Baixando relatórios PDF do MinIO',
  'Processando binary collections',
  'Compactando ZIP em thread separada',
  'Enviando ZIP para o BART',
  'Confirmando sincronização no banco',
  'Finalizando auditoria',
] as const;

export const samsungStep = (stepIndex: number) =>
  SAMSUNG_SYNC_PROGRESS_STEPS[Math.max(0, Math.min(stepIndex, SAMSUNG_SYNC_PROGRESS_STEPS.length - 1))];

export const toDateFolder = (value: string | Date | null | undefined): string => {
  if (!value) return getDeliveryDateFolder();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return getDeliveryDateFolder();
  }
  return date.toISOString().slice(0, 10).replace(/-/g, '');
};

/** Data de entrega (sync) em YYYYMMDD — timezone America/Sao_Paulo. */
export const getDeliveryDateFolder = (date: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}${m}${d}`;
};

/** Data de coleta para coluna generation_date do metadata eBART (YYYY-MM-DD). */
export const formatCollectionDateForMetadata = (questionnaire?: {
  data?: { dataColeta?: string | null };
  collection_date?: string | Date | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
} | null): string => {
  const raw =
    questionnaire?.data?.dataColeta ??
    questionnaire?.collection_date ??
    questionnaire?.createdAt ??
    questionnaire?.created_at;
  if (!raw) return '';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export const buildDeliveryZipFileName = (deliveryDate: string): string =>
  `${deliveryDate}.zip`;

export const buildDataZipArtifactPath = (
  artifactoryBasePath: string,
  deliveryDate: string,
): string => {
  const prefix = (artifactoryBasePath || '').replace(/^\/+|\/+$/g, '');
  return prefix
    ? `${prefix}/Data/${buildDeliveryZipFileName(deliveryDate)}`
    : `Data/${buildDeliveryZipFileName(deliveryDate)}`;
};

export const buildMetadataCsvArtifactPath = (
  artifactoryBasePath: string,
  deliveryDate: string,
): string => {
  const prefix = (artifactoryBasePath || '').replace(/^\/+|\/+$/g, '');
  return prefix
    ? `${prefix}/Metadata/${deliveryDate}_metadata.csv`
    : `Metadata/${deliveryDate}_metadata.csv`;
};

/** URL Artifactory para entrada dentro do ZIP de entrega (sintaxe !/). */
export const buildArchiveEntryDownloadUrl = (
  artifactoryBaseUrl: string,
  repo: string,
  artifactoryBasePath: string,
  deliveryDate: string,
  entryPathInsideZip: string,
): string => {
  const base = artifactoryBaseUrl.replace(/\/$/, '');
  const zipPath = buildDataZipArtifactPath(artifactoryBasePath, deliveryDate);
  const encodedZipPath = zipPath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  const inner = entryPathInsideZip.replace(/^\/+/, '');
  return `${base}/${repo}/${encodedZipPath}!/${inner}`;
};

export const buildArtifactoryArtifactPath = (
  basePath: string,
  relativePath: string,
): string => {
  const prefix = (basePath || '').replace(/^\/+|\/+$/g, '');
  const rel = relativePath.replace(/^\/+/, '');
  return prefix ? `${prefix}/${rel}` : rel;
};

export const buildSubjectDataZipPath = (
  deliveryDate: string,
  subjectId: string,
  stageFolder: string,
  fileName: string,
): string =>
  `${deliveryDate}/${subjectId}/${stageFolder}/${SUBJECT_DATA_FOLDER}/${fileName}`;

/** @deprecated Use buildSubjectDataZipPath */
export const buildClinicalDataZipPath = buildSubjectDataZipPath;

export const buildSamsungDataFileZipPath = (
  deliveryDate: string,
  subjectId: string,
  stageFolder: string,
  deviceFolder: string,
  fileName: string,
): string =>
  `${deliveryDate}/${subjectId}/${stageFolder}/${deviceFolder}/${fileName}`;

export const buildDeviceSubZipPath = (
  deliveryDate: string,
  subjectId: string,
  stageFolder: string,
  deviceFolder: string,
): string =>
  `${deliveryDate}/${subjectId}/${stageFolder}/${deviceFolder}.zip`;

export const buildDeliveryMetadataCsv = (rows: DeliveryMetadataRow[]): string => {
  const lines = ['generation_date,download_url'];
  for (const row of rows) {
    const gd = (row.generation_date || '').replace(/"/g, '""');
    const url = (row.download_url || '').replace(/"/g, '""');
    lines.push(`"${gd}","${url}"`);
  }
  return `${lines.join('\n')}\n`;
};

export type ZipEntryInput = { name: string; buffer: Buffer };

export const createZipBufferFromEntries = async (
  entries: ZipEntryInput[],
): Promise<Buffer> => {
  const arc = archiver('zip', { zlib: { level: 1 } });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    arc.on('data', (chunk: Buffer) => chunks.push(chunk));
    arc.on('end', () => resolve(Buffer.concat(chunks)));
    arc.on('error', reject);
  });
  for (const entry of entries) {
    arc.append(entry.buffer, { name: entry.name });
  }
  await arc.finalize();
  return result;
};

export const deviceGroupKey = (
  subjectId: string,
  stageFolder: string,
  deviceFolder: string,
): string => `${subjectId}::${stageFolder}::${deviceFolder}`;

export const toSamsungSubjectId = (publicIdentifier?: string | null): string => {
  const digits = (publicIdentifier || '').replace(/\D/g, '');
  const num = digits ? Number(digits) : 0;
  return `S${String(num || 0).padStart(3, '0')}`;
};

export const isSamsungExcludedPublicIdentifier = (publicIdentifier?: string | null): boolean => {
  const normalized = (publicIdentifier || '').trim().toUpperCase();
  return normalized === 'P000' || normalized === 'P00';
};

export const extractTaskCodeFromFilename = (fileName: string): string | null => {
  const match = /TA\d{1,2}/i.exec(fileName || '');
  return match ? match[0].toUpperCase() : null;
};

export const normalizeSamsungTa = (token: string): string => {
  const m = /^TA0*(\d{1,2})$/i.exec(token.trim());
  return m ? `TA${parseInt(m[1], 10)}` : token.toUpperCase();
};

const normalizeSamsungSta = (token: string): string => {
  const m = /^STA0*(\d{1,2})$/i.exec(token.trim());
  return m ? `STA${parseInt(m[1], 10)}` : token.toUpperCase();
};

export const isSpeechTask = (taskCode: string | null): boolean =>
  taskCode === 'TA10' || taskCode === 'TA11' || taskCode === 'TA12';

export const isSamsungSmartphoneTask = (taskCode: string | null): boolean => {
  if (!taskCode) return false;
  const normalized = normalizeSamsungTa(taskCode);
  return normalized === 'TA6' || normalized === 'TA7' || normalized === 'TA8' || normalized === 'TA9';
};

export const inferSamsungProtocol = (
  taskCode: string | null,
  fileName: string,
): SamsungProtocol => {
  if (taskCode === 'TA13' || /sleep|sono|psg/i.test(fileName)) return 'Sleep';
  return 'Clinic';
};

export const inferSamsungDevice = (fileName: string, taskCode?: string | null): string => {
  if (/baiobit|biobit/i.test(fileName)) return 'Baiobit';
  if (/emg|delsys/i.test(fileName)) return 'EMG';
  if (/ring/i.test(fileName)) return 'Ring';
  if (/psg|polysomn|polisson/i.test(fileName)) return 'PSG';
  const normalizedTaskCode = taskCode || extractTaskCodeFromFilename(fileName);
  if (isSamsungSmartphoneTask(normalizedTaskCode)) {
    return 'SP';
  }
  return 'SW';
};

export const toSamsungDeviceFolder = (device: string): string => {
  const upper = device.toUpperCase();
  if (upper === 'SW') return 'SW';
  if (upper === 'SP') return 'SP';
  if (upper === 'PSG') return 'PSG';
  if (upper === 'EMG') return 'EMG';
  if (upper === 'RING') return 'Ring';
  if (upper === 'BAIOBIT' || upper === 'BIOBIT') return 'Baiobit';
  return device;
};

export const toStageFolder = (protocol: SamsungProtocol): string => {
  if (protocol === 'Sleep') return '2_Sleep';
  if (protocol === 'Free-living') return '3_Free-living';
  return '1_In-Clinic';
};

export type SamsungActiveTaskFileContext = {
  id?: string;
  metadata?: Record<string, unknown> | null;
  repetitions_count?: number;
};

const removeCpfFromFilenameString = (s: string): string => {
  let t = s.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '');
  t = t.replace(/\b\d{11}\b/g, '');
  return t.replace(/[-_]{2,}/g, '_').replace(/^[-_]+|[-_]+$/g, '');
};

const removeTrailingIdNoise = (s: string): string => {
  let t = s.replace(/[-_]ReS\d+(-\d{8,})?$/i, '');
  t = t.replace(/ReS\d+$/i, '');
  t = t.replace(/[-_](\d{10,})$/g, '');
  return t.replace(/^[-_]+|[-_]+$/g, '');
};

const parseSamsungRepetition = (rawFullName: string, ctx: SamsungActiveTaskFileContext): number => {
  const m = /Rep[_\s-]?(\d{1,3})/i.exec(rawFullName);
  if (m) return Math.max(1, parseInt(m[1], 10));
  const meta = ctx?.metadata;
  if (meta?.repetition != null && String(meta.repetition).match(/^\d+$/)) {
    return Math.max(1, parseInt(String(meta.repetition), 10));
  }
  if (meta?.rep != null && String(meta.rep).match(/^\d+$/)) {
    return Math.max(1, parseInt(String(meta.rep), 10));
  }
  if (typeof ctx?.repetitions_count === 'number' && ctx.repetitions_count >= 1) {
    return Math.max(1, ctx.repetitions_count);
  }
  return 1;
};

const toProtocolLabel = (protocol: SamsungProtocol): string => {
  if (protocol === 'Sleep') return 'Stage2';
  if (protocol === 'Free-living') return 'Stage3';
  return 'Stage1';
};

const toSamsungDeviceCode = (device: string): string => {
  const upper = device.toUpperCase();
  if (upper === 'SW' || upper === 'SP' || upper === 'EMG' || upper === 'PSG') return upper;
  if (upper === 'RING') return 'RING';
  if (upper === 'BAIOBIT' || upper === 'BIOBIT') return 'BAIOBIT';
  return upper;
};

const inferDataTypeFromFilename = (
  fileName: string,
): 'INERTIAL' | 'SDK' | 'SDK_PPG' | 'SDK_Others' => {
  if (/(^|[-_\s])(NATIVO|INERTIAL|ACC|GR|GYRO|MAG|IMU)($|[-_\s])/i.test(fileName)) {
    return 'INERTIAL';
  }
  const hasSdk = /(^|[-_\s])(SDK)($|[-_\s])/i.test(fileName);
  if (hasSdk && /(^|[-_\s])(PPG)($|[-_\s])/i.test(fileName)) return 'SDK_PPG';
  if (hasSdk && /(^|[-_\s])(EDA|IBI|HR)($|[-_\s])/i.test(fileName)) return 'SDK_Others';
  if (hasSdk) return 'SDK';
  return 'SDK_Others';
};

const parseSpecificityToken = (fileName: string): string => {
  if (/(^|[-_\s])(LD|RIGHT|DIREITO|DIREITA)($|[-_\s])/i.test(fileName)) return 'R';
  if (/(^|[-_\s])(LE|LEFT|ESQUERDO|ESQUERDA)($|[-_\s])/i.test(fileName)) return 'L';
  return 'NA';
};

const parseSubtaskToken = (fileName: string): string => {
  const match = /(?:^|[-_\s])STA0*(\d{1,2})(?:$|[-_\s])/i.exec(fileName);
  if (!match) return '';
  return `[${normalizeSamsungSta(`STA${match[1]}`)}]`;
};

const mustIncludeStaInFilename = (taskCode: string): boolean =>
  ['TA8', 'TA10', 'TA11', 'TA12', 'TA16'].includes(taskCode);

export const buildSamsungActiveTaskFilename = (
  rawFileName: string,
  subjectId: string,
  collectionDate: string,
  file: SamsungActiveTaskFileContext & { id: string },
  device: string,
  trustedTaskCode?: string | null,
): string => {
  const fallback = `${file.id}.csv`;
  const base = (rawFileName || '').trim().split(/[/\\]/).pop() || fallback;
  const extMatch = base.match(/(\.[^.]+)$/i);
  const ext = extMatch ? extMatch[1] : '.csv';
  const stemFull = extMatch ? base.slice(0, -ext.length) : base;
  const cleaned = removeTrailingIdNoise(removeCpfFromFilenameString(stemFull));

  const taskMatch = /TA\d{1,2}/i.exec(cleaned);
  const taskCode = trustedTaskCode
    ? normalizeSamsungTa(trustedTaskCode)
    : taskMatch
      ? normalizeSamsungTa(taskMatch[0])
      : 'TA0';
  const subtask = parseSubtaskToken(cleaned);
  const repetition = parseSamsungRepetition(stemFull, file);
  const protocol = inferSamsungProtocol(taskCode === 'TA0' ? null : taskCode, cleaned);
  const protocolLabel = toProtocolLabel(protocol);
  const specificity = parseSpecificityToken(cleaned);
  const dataType = inferDataTypeFromFilename(cleaned);
  const resolvedDevice = isSamsungSmartphoneTask(taskCode) ? 'SP' : device;
  const deviceCode = toSamsungDeviceCode(resolvedDevice);

  const orderedParts = [
    collectionDate,
    subjectId,
    protocolLabel,
    deviceCode,
    specificity,
    dataType,
    taskCode,
  ];
  if (subtask && mustIncludeStaInFilename(taskCode)) orderedParts.push(subtask);
  orderedParts.push(`Rep${repetition}`);

  return `${orderedParts.join('-')}${ext}`;
};

export const samsungPdfReportDataPath = (reportType: string | undefined) => {
  switch (reportType) {
    case 'BIOBIT':
      return { protocol: 'Clinic' as SamsungProtocol, device: 'Baiobit' };
    case 'DELSYS':
      return { protocol: 'Clinic' as SamsungProtocol, device: 'EMG' };
    case 'POLYSOMNOGRAPHY':
      return { protocol: 'Sleep' as SamsungProtocol, device: 'PSG' };
    default:
      return { protocol: 'Clinic' as SamsungProtocol, device: 'Ring' };
  }
};

export const sanitizeExternalDocBaseName = (rawName: string, cpfHash: string): string => {
  const base = (rawName || 'documento').split(/[/\\]/).pop() || 'documento';
  const extMatch = base.match(/(\.[^.]+)$/i);
  const ext = extMatch ? extMatch[1] : '.pdf';
  const hash = (cpfHash || '').slice(0, 12) || 'ANON';
  return `DOC-${hash}${ext}`;
};

export const getUniqueFilename = (
  baseName: string,
  counters: Map<string, number>,
  scope = '',
): string => {
  const safeBase = (baseName || 'arquivo').trim();
  const key = `${scope}::${safeBase}`.toLowerCase();
  const current = counters.get(key) || 0;
  counters.set(key, current + 1);
  if (current === 0) return safeBase;
  const extMatch = safeBase.match(/(\.[^.]+)$/i);
  const ext = extMatch ? extMatch[1] : '';
  const stem = ext ? safeBase.slice(0, -ext.length) : safeBase;
  return `${stem} (${current + 1})${ext}`;
};
