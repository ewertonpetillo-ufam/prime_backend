export const SAO_PAULO_TZ = 'America/Sao_Paulo';

export const ACTION_COLLECTION_STARTED = 'collection_started';
export const ACTION_COLLECTION_FINISHED = 'collection_finished';

export const EXCLUDED_FREELIVING_PUBLIC_IDS = ['P000', 'P00'] as const;

export type FreelivingDayStatus =
  | 'sem_acao'
  | 'iniciou'
  | 'finalizou'
  | 'iniciou_e_finalizou';

export const FREELIVING_DAY_STATUSES: FreelivingDayStatus[] = [
  'sem_acao',
  'iniciou',
  'finalizou',
  'iniciou_e_finalizou',
];

export function formatDateInTimeZone(
  date: Date,
  timeZone: string = SAO_PAULO_TZ,
): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

export function todayInSaoPaulo(now: Date = new Date()): string {
  return formatDateInTimeZone(now, SAO_PAULO_TZ);
}

export function isIsoDateOnly(value: string | undefined | null): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function deriveDayStatus(
  hasStarted: boolean,
  hasFinished: boolean,
): FreelivingDayStatus {
  if (hasStarted && hasFinished) return 'iniciou_e_finalizou';
  if (hasStarted) return 'iniciou';
  if (hasFinished) return 'finalizou';
  return 'sem_acao';
}

export function parseOptionalBoolean(
  value: string | undefined,
): boolean | undefined {
  if (value == null || value === '') return undefined;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'sim'].includes(normalized)) return true;
  if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) return false;
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const record = error as { code?: string; driverError?: { code?: string } };
  return record.code === '23505' || record.driverError?.code === '23505';
}
