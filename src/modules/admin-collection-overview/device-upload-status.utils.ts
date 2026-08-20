/** TAs com subcolunas Csv | Baiobit | Delsys. */
export const DEVICE_BREAKDOWN_TASK_CODES = ['TA5', 'TA14', 'TA15', 'TA16'] as const;

export const SLEEP_TASK_CODE = 'TA13';

export type DeviceBreakdownCell = {
  csv: number;
  baiobit?: number;
  delsys?: number;
  edf?: number;
};

export type PendingUploadKind = 'Baiobit' | 'Delsys' | 'Polissonografo';

export type PendingUploadDto = {
  kind: PendingUploadKind;
  daysPending: number;
  risk: 3 | 5 | 7;
};

export type ClassifiedFileKind = 'baiobit' | 'delsys' | 'edf' | 'csv' | 'other';

export type DevicePresenceFlags = {
  hasBaiobitPdf: boolean;
  hasDelsysPdf: boolean;
  hasPolysomnographyPdf: boolean;
  hasPolysomnographyEdf: boolean;
  baiobitPdfCount: number;
  delsysPdfCount: number;
  psgPdfCount: number;
  psgEdfCount: number;
};

export type ClassifyFileExtras = {
  deviceType?: string | null;
  mimeType?: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function isDeviceBreakdownTask(taskCode: string): boolean {
  return (DEVICE_BREAKDOWN_TASK_CODES as readonly string[]).includes(taskCode);
}

export function emptyPdfPresence(): DevicePresenceFlags {
  return {
    hasBaiobitPdf: false,
    hasDelsysPdf: false,
    hasPolysomnographyPdf: false,
    hasPolysomnographyEdf: false,
    baiobitPdfCount: 0,
    delsysPdfCount: 0,
    psgPdfCount: 0,
    psgEdfCount: 0,
  };
}

export function normalizeTaskCode(raw: string | null | undefined): string | null {
  const m = /^TA0*(\d{1,2})$/i.exec((raw || '').trim());
  return m ? `TA${parseInt(m[1], 10)}` : null;
}

export function resolveTaskCode(
  taskId: number | string | null | undefined,
  metaTaskCode: string | null | undefined,
  taskIdToCode: Map<number, string>,
): string | null {
  if (taskId != null && String(taskId).trim() !== '') {
    const n = Number(taskId);
    if (!Number.isNaN(n) && taskIdToCode.has(n)) {
      return taskIdToCode.get(n) ?? null;
    }
  }
  return normalizeTaskCode(metaTaskCode);
}

export function pdfFilesTotal(flags: DevicePresenceFlags): number {
  return flags.baiobitPdfCount + flags.delsysPdfCount + flags.psgPdfCount;
}

/** Arquivos já existentes entram sempre numa subcoluna visível (Csv por omissão). */
export function reconcileBreakdownWithTaskTotal(
  cell: DeviceBreakdownCell,
  taskTotal: number,
): void {
  const classified =
    (cell.csv || 0) +
    (cell.baiobit || 0) +
    (cell.delsys || 0) +
    (cell.edf || 0);
  if (taskTotal > classified) {
    cell.csv += taskTotal - classified;
  }
}

export function applyPdfCountsToBreakdown(
  breakdown: Record<string, DeviceBreakdownCell>,
  flags: DevicePresenceFlags,
): void {
  if (flags.baiobitPdfCount > 0 || flags.delsysPdfCount > 0) {
    for (const code of DEVICE_BREAKDOWN_TASK_CODES) {
      if (!breakdown[code]) breakdown[code] = emptyBreakdownForTask(code);
      const cell = breakdown[code];
      if (cell.baiobit != null) cell.baiobit += flags.baiobitPdfCount;
      if (cell.delsys != null) cell.delsys += flags.delsysPdfCount;
    }
  }
  if (flags.psgPdfCount > 0 || flags.psgEdfCount > 0) {
    if (!breakdown[SLEEP_TASK_CODE]) {
      breakdown[SLEEP_TASK_CODE] = emptyBreakdownForTask(SLEEP_TASK_CODE);
    }
    const cell = breakdown[SLEEP_TASK_CODE];
    const nonEdf = Math.max(0, flags.psgPdfCount - flags.psgEdfCount);
    cell.csv += nonEdf;
    if (cell.edf != null) cell.edf += flags.psgEdfCount;
  }
}

/** PDF POLYSOMNOGRAPHY conta como EDF se o nome/mime indicar .edf. */
export function isPolysomnographyEdf(
  fileName: string,
  mimeType?: string | null,
): boolean {
  const name = (fileName || '').trim();
  if (/\.edf(\.|$)/i.test(name) || /(^|[^a-z])edf([^a-z]|$)/i.test(name)) {
    return true;
  }
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('edf')) return true;
  return false;
}

export function classifyBinaryFileName(
  fileName: string,
  taskCode: string,
  extras?: ClassifyFileExtras,
): ClassifiedFileKind {
  const name = (fileName || '').trim();
  const device = (extras?.deviceType || '').trim();
  const mime = (extras?.mimeType || '').trim();
  const haystack = `${name} ${device}`.trim();
  const countsInCsvFallback =
    isDeviceBreakdownTask(taskCode) || taskCode === SLEEP_TASK_CODE;

  if (!haystack && !mime) {
    return countsInCsvFallback ? 'csv' : 'other';
  }

  if (/baiobit|biobit/i.test(haystack)) return 'baiobit';
  if (/delsys|trigno|\bemg\b/i.test(haystack)) return 'delsys';
  if (
    isPolysomnographyEdf(name, mime) ||
    (taskCode === SLEEP_TASK_CODE && /\.edf/i.test(name))
  ) {
    return 'edf';
  }
  if (/\.csv(\.|$)/i.test(name) || /csv/i.test(mime)) return 'csv';
  if (countsInCsvFallback) return 'csv';
  return 'other';
}

export function emptyBreakdownForTask(taskCode: string): DeviceBreakdownCell {
  if (taskCode === SLEEP_TASK_CODE) {
    return { csv: 0, edf: 0 };
  }
  if (isDeviceBreakdownTask(taskCode)) {
    return { csv: 0, baiobit: 0, delsys: 0 };
  }
  return { csv: 0 };
}

export function incrementBreakdownCell(
  cell: DeviceBreakdownCell,
  kind: ClassifiedFileKind,
): void {
  if (kind === 'baiobit' && cell.baiobit != null) cell.baiobit += 1;
  else if (kind === 'delsys' && cell.delsys != null) cell.delsys += 1;
  else if (kind === 'edf' && cell.edf != null) cell.edf += 1;
  else if (kind === 'csv') cell.csv += 1;
}

export function applyPdfReportToPresence(
  flags: DevicePresenceFlags,
  reportType: string,
  fileName: string,
  mimeType?: string | null,
): void {
  const type = (reportType || '').trim().toUpperCase();
  const kind = classifyBinaryFileName(fileName, '', { mimeType });

  if (type === 'BIOBIT') {
    flags.hasBaiobitPdf = true;
    flags.baiobitPdfCount += 1;
    return;
  }
  if (type === 'DELSYS') {
    flags.hasDelsysPdf = true;
    flags.delsysPdfCount += 1;
    return;
  }
  if (type === 'POLYSOMNOGRAPHY') {
    flags.hasPolysomnographyPdf = true;
    flags.psgPdfCount += 1;
    if (isPolysomnographyEdf(fileName, mimeType) || kind === 'edf') {
      flags.hasPolysomnographyEdf = true;
      flags.psgEdfCount += 1;
    }
    return;
  }

  if (kind === 'baiobit') {
    flags.hasBaiobitPdf = true;
    flags.baiobitPdfCount += 1;
  } else if (kind === 'delsys') {
    flags.hasDelsysPdf = true;
    flags.delsysPdfCount += 1;
  } else if (kind === 'edf' || isPolysomnographyEdf(fileName, mimeType)) {
    flags.hasPolysomnographyPdf = true;
    flags.hasPolysomnographyEdf = true;
    flags.psgPdfCount += 1;
    flags.psgEdfCount += 1;
  }
}

export function daysSince(createdAt: Date | string | null | undefined, nowMs: number): number {
  if (!createdAt) return 0;
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((nowMs - d.getTime()) / DAY_MS));
}

export function riskFromDays(daysPending: number): 3 | 5 | 7 | null {
  if (daysPending >= 7) return 7;
  if (daysPending >= 5) return 5;
  if (daysPending >= 3) return 3;
  return null;
}

export function listMissingDeviceKinds(params: {
  countsByTask: Record<string, number>;
  deviceBreakdownByTask: Record<string, DeviceBreakdownCell>;
  hasPolysomnographyPdf: boolean;
  hasPolysomnographyEdf: boolean;
  hasBaiobitPdf?: boolean;
  hasDelsysPdf?: boolean;
}): PendingUploadKind[] {
  let baiobitTotal = 0;
  let delsysTotal = 0;
  for (const code of DEVICE_BREAKDOWN_TASK_CODES) {
    const cell = params.deviceBreakdownByTask[code];
    baiobitTotal += cell?.baiobit ?? 0;
    delsysTotal += cell?.delsys ?? 0;
  }

  const hasBaiobit = baiobitTotal > 0 || !!params.hasBaiobitPdf;
  const hasDelsys = delsysTotal > 0 || !!params.hasDelsysPdf;

  const ta13Count = params.countsByTask[SLEEP_TASK_CODE] ?? 0;
  const edfCount = params.deviceBreakdownByTask[SLEEP_TASK_CODE]?.edf ?? 0;
  const hasPolissonografo =
    edfCount > 0 || params.hasPolysomnographyEdf || params.hasPolysomnographyPdf;
  const sleepStarted =
    ta13Count > 0 ||
    params.hasPolysomnographyPdf ||
    params.hasPolysomnographyEdf;

  const out: PendingUploadKind[] = [];
  if (!hasBaiobit) out.push('Baiobit');
  if (!hasDelsys) out.push('Delsys');
  if (sleepStarted && !hasPolissonografo) out.push('Polissonografo');
  return out;
}

export function buildPendingUploads(params: {
  createdAt: Date | string | null | undefined;
  nowMs: number;
  countsByTask: Record<string, number>;
  deviceBreakdownByTask: Record<string, DeviceBreakdownCell>;
  hasPolysomnographyPdf: boolean;
  hasPolysomnographyEdf: boolean;
  hasBaiobitPdf?: boolean;
  hasDelsysPdf?: boolean;
}): PendingUploadDto[] {
  const days = daysSince(params.createdAt, params.nowMs);
  const risk = riskFromDays(days);
  if (!risk) return [];

  return listMissingDeviceKinds(params).map((kind) => ({
    kind,
    daysPending: days,
    risk,
  }));
}
