export type SamsungProtocol = 'Clinic' | 'Sleep' | 'Free-living';

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
  if (!value) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().slice(0, 10).replace(/-/g, '');
};

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

export const isSpeechTask = (taskCode: string | null): boolean =>
  taskCode === 'TA10' || taskCode === 'TA11' || taskCode === 'TA12';

export const isSamsungSmartphoneTask = (taskCode: string | null): boolean =>
  (() => {
    if (!taskCode) return false;
    const match = /^TA0*(\d{1,2})$/i.exec(taskCode.trim());
    if (!match) return false;
    const normalized = `TA${Number(match[1])}`;
    return (
      normalized === 'TA6' ||
      normalized === 'TA7' ||
      normalized === 'TA8' ||
      normalized === 'TA9'
    );
  })();

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

export const buildSamsungActiveTaskFilename = (
  rawFileName: string,
  subjectId: string,
  collectionDate: string,
  file: { id: string; metadata?: Record<string, any> | null },
  device: string,
  trustedTaskCode?: string | null,
): string => {
  const fallback = `${file.id}.csv`;
  const base = (rawFileName || fallback).trim().split(/[/\\]/).pop() || fallback;
  const extMatch = base.match(/(\.[^.]+)$/i);
  const ext = extMatch ? extMatch[1] : '.csv';
  const stem = extMatch ? base.slice(0, -ext.length) : base;
  const taskCode = trustedTaskCode
    ? trustedTaskCode.toUpperCase().replace(/^TA0*(\d{1,2})$/i, (_m, n) => `TA${Number(n)}`)
    : extractTaskCodeFromFilename(stem) || 'TA0';
  const protocol = inferSamsungProtocol(taskCode === 'TA0' ? null : taskCode, stem);
  const stageLabel =
    protocol === 'Sleep' ? 'Stage2' : protocol === 'Free-living' ? 'Stage3' : 'Stage1';
  const isSmartphoneActiveTask = isSamsungSmartphoneTask(taskCode);
  const resolvedDevice = isSmartphoneActiveTask ? 'SP' : device.toUpperCase();
  const deviceCode = resolvedDevice === 'BAIOBIT' ? 'BAIOBIT' : resolvedDevice;
  const repetition =
    Number(
      file?.metadata?.repetition ||
        file?.metadata?.rep ||
        file?.metadata?.repetitions_count ||
        1,
    ) || 1;
  return `${collectionDate}-${subjectId}-${stageLabel}-${deviceCode}-NA-SDK-${taskCode}-Rep${Math.max(1, repetition)}${ext}`;
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
