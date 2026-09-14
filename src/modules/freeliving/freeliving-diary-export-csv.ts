import {
  DiaryActivities,
  FreelivingDiaryPayload,
  OPTIONAL_INTERVAL_ACTIVITIES,
  OPTIONAL_TIMED_ACTIVITIES,
  REQUIRED_TIMED_ACTIVITIES,
  SYMPTOM_HOURS,
  SYMPTOM_KEYS,
} from './freeliving-diary.types';

const MAX_DOSE_SLOTS = 8;

export type FreeLivingDiaryCsvRow = {
  publicIdentifier?: string | null;
  diaryDate: string;
  protocolDay: number;
  status: string;
  saveCount?: number;
  lastSavedAt?: string | Date | null;
  payload: FreelivingDiaryPayload | Record<string, unknown> | null;
};

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  if (text.includes(',') || text.includes('\n') || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function isoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return value == null ? '' : String(value);
}

function boolCell(value: unknown): string {
  if (value === true) return '1';
  if (value === false) return '0';
  return '';
}

function diaryCsvHeaders(): string[] {
  const headers = [
    'public_identifier',
    'diary_date',
    'protocol_day',
    'status',
    'save_count',
    'last_saved_at',
    'm1_label',
    'm2_label',
    'm3_label',
    'm4_label',
    'm5_label',
  ];
  for (let i = 1; i <= MAX_DOSE_SLOTS; i += 1) {
    headers.push(
      `dose_${i}_time`,
      `dose_${i}_m1`,
      `dose_${i}_m2`,
      `dose_${i}_m3`,
      `dose_${i}_m4`,
      `dose_${i}_m5`,
      `dose_${i}_notes`,
    );
  }
  const timed = [...REQUIRED_TIMED_ACTIVITIES, ...OPTIONAL_TIMED_ACTIVITIES];
  for (const key of timed) {
    headers.push(`${key}_time`, `${key}_notes`);
  }
  for (const key of OPTIONAL_INTERVAL_ACTIVITIES) {
    headers.push(`${key}_from`, `${key}_to`, `${key}_notes`);
  }
  for (const symptom of SYMPTOM_KEYS) {
    for (const hour of SYMPTOM_HOURS) {
      headers.push(`${symptom}_${hour}h`);
    }
  }
  headers.push(
    'watch_usage',
    'phone_nearby',
    'watch_removed_from',
    'watch_removed_to',
    'watch_removed_reason',
    'device_problem',
    'device_problem_detail',
    'charged_end_of_day',
    'sleep_with_smartwatch',
    'day_notes',
  );
  return headers;
}

function activityRow(
  activities: DiaryActivities | undefined,
  key: keyof DiaryActivities,
): string[] {
  const item = activities?.[key] as
    | { time?: string | null; from?: string | null; to?: string | null; notes?: string | null }
    | undefined;
  if ('from' in (item || {}) || OPTIONAL_INTERVAL_ACTIVITIES.includes(key as never)) {
    return [item?.from ?? '', item?.to ?? '', item?.notes ?? ''];
  }
  return [item?.time ?? '', item?.notes ?? ''];
}

export function buildFreeLivingDiaryQuestionnaireCsv(
  rows: FreeLivingDiaryCsvRow[],
): string {
  const headers = diaryCsvHeaders();
  const lines = [headers.join(',')];
  for (const row of rows) {
    const payload = (row.payload || {}) as Partial<FreelivingDiaryPayload>;
    const labels = payload.medication?.labels;
    const doses = Array.isArray(payload.medication?.doses)
      ? payload.medication.doses
      : [];
    const values: unknown[] = [
      row.publicIdentifier || '',
      row.diaryDate,
      row.protocolDay,
      row.status,
      row.saveCount ?? '',
      isoDate(row.lastSavedAt),
      labels?.m1 ?? '',
      labels?.m2 ?? '',
      labels?.m3 ?? '',
      labels?.m4 ?? '',
      labels?.m5 ?? '',
    ];
    for (let i = 0; i < MAX_DOSE_SLOTS; i += 1) {
      const dose = doses[i];
      values.push(
        dose?.time ?? '',
        boolCell(dose?.m1),
        boolCell(dose?.m2),
        boolCell(dose?.m3),
        boolCell(dose?.m4),
        boolCell(dose?.m5),
        dose?.notes ?? '',
      );
    }
    const timed = [...REQUIRED_TIMED_ACTIVITIES, ...OPTIONAL_TIMED_ACTIVITIES];
    for (const key of timed) {
      values.push(...activityRow(payload.activities, key));
    }
    for (const key of OPTIONAL_INTERVAL_ACTIVITIES) {
      values.push(...activityRow(payload.activities, key));
    }
    for (const symptom of SYMPTOM_KEYS) {
      const hours = payload.symptoms?.[symptom];
      for (const hour of SYMPTOM_HOURS) {
        const score = hours?.[hour];
        values.push(score == null ? '' : score);
      }
    }
    const devices = payload.devices;
    values.push(
      devices?.watch_usage ?? '',
      devices?.phone_nearby ?? '',
      devices?.watch_removed?.from ?? '',
      devices?.watch_removed?.to ?? '',
      devices?.watch_removed?.reason ?? '',
      boolCell(devices?.device_problem),
      devices?.device_problem_detail ?? '',
      boolCell(devices?.charged_end_of_day),
      boolCell(devices?.sleep_with_smartwatch),
      devices?.day_notes ?? '',
    );
    lines.push(values.map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export const FREE_LIVING_DIARY_CSV_NAME = '06_Free_Living_Diary.csv';
