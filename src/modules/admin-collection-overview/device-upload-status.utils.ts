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

const DAY_MS = 24 * 60 * 60 * 1000;

export function isDeviceBreakdownTask(taskCode: string): boolean {
  return (DEVICE_BREAKDOWN_TASK_CODES as readonly string[]).includes(taskCode);
}

export function classifyBinaryFileName(
  fileName: string,
  taskCode: string,
): ClassifiedFileKind {
  const name = (fileName || '').trim();
  if (!name) return 'other';

  if (/baiobit|biobit/i.test(name)) return 'baiobit';
  if (/delsys|trigno|\bemg\b/i.test(name)) return 'delsys';
  if (/\.edf$/i.test(name)) return 'edf';
  if (taskCode === SLEEP_TASK_CODE && /\.edf$/i.test(name)) return 'edf';
  if (/\.csv$/i.test(name)) return 'csv';
  return 'other';
}

/** PDF POLYSOMNOGRAPHY conta como EDF se o nome/mime indicar .edf. */
export function isPolysomnographyEdf(
  fileName: string,
  mimeType?: string | null,
): boolean {
  const name = (fileName || '').trim();
  if (/\.edf$/i.test(name)) return true;
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('edf')) return true;
  return false;
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

export function buildPendingUploads(params: {
  createdAt: Date | string | null | undefined;
  nowMs: number;
  countsByTask: Record<string, number>;
  deviceBreakdownByTask: Record<string, DeviceBreakdownCell>;
  hasPolysomnographyPdf: boolean;
  hasPolysomnographyEdf: boolean;
}): PendingUploadDto[] {
  const days = daysSince(params.createdAt, params.nowMs);
  const risk = riskFromDays(days);
  if (!risk) return [];

  let baiobitTotal = 0;
  let delsysTotal = 0;
  for (const code of DEVICE_BREAKDOWN_TASK_CODES) {
    const cell = params.deviceBreakdownByTask[code];
    baiobitTotal += cell?.baiobit ?? 0;
    delsysTotal += cell?.delsys ?? 0;
  }

  const ta13Count = params.countsByTask[SLEEP_TASK_CODE] ?? 0;
  const edfCount = params.deviceBreakdownByTask[SLEEP_TASK_CODE]?.edf ?? 0;
  const sleepDone = ta13Count > 0 || params.hasPolysomnographyPdf;
  const hasEdf = edfCount > 0 || params.hasPolysomnographyEdf;

  const out: PendingUploadDto[] = [];
  if (baiobitTotal === 0) {
    out.push({ kind: 'Baiobit', daysPending: days, risk });
  }
  if (delsysTotal === 0) {
    out.push({ kind: 'Delsys', daysPending: days, risk });
  }
  if (sleepDone && !hasEdf) {
    out.push({ kind: 'Polissonografo', daysPending: days, risk });
  }
  return out;
}
