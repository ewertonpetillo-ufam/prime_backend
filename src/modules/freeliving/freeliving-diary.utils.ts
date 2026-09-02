import { createHash } from 'crypto';
import {
  ACTIVITY_LABELS,
  DIARY_SECTION_COUNT,
  DIARY_SECTIONS,
  FreelivingDiaryGap,
  FreelivingDiaryPayload,
  FreelivingDiaryStatus,
  IntervalActivity,
  MedicationDose,
  OPTIONAL_INTERVAL_ACTIVITIES,
  OPTIONAL_TIMED_ACTIVITIES,
  PHONE_NEARBY_VALUES,
  REQUIRED_TIMED_ACTIVITIES,
  SYMPTOM_HOURS,
  SYMPTOM_KEYS,
  SYMPTOM_LABELS,
  SymptomHourMap,
  SymptomScore,
  TimedActivity,
  WATCH_USAGE_VALUES,
} from './freeliving-diary.types';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DIARY_EVENT_NAMESPACE = '9f3c1a107b2e5d419c6a11f0c0ffeed1';

export function isFilledTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value.trim());
}

export function normalizeTime(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!TIME_RE.test(trimmed)) {
    throw new Error(`Horário inválido: ${value}`);
  }
  return trimmed;
}

export function emptyTimedActivity(): TimedActivity {
  return { time: null, notes: null };
}

export function emptyIntervalActivity(): IntervalActivity {
  return { from: null, to: null, notes: null };
}

export function emptySymptomHours(): SymptomHourMap {
  return SYMPTOM_HOURS.reduce((acc, hour) => {
    acc[hour] = null;
    return acc;
  }, {} as SymptomHourMap);
}

export function emptyDiaryPayload(): FreelivingDiaryPayload {
  return {
    medication: {
      labels: { m1: null, m2: null, m3: null, m4: null, m5: null },
      doses: [],
    },
    activities: {
      morning_hygiene: emptyTimedActivity(),
      meal_1: emptyTimedActivity(),
      meal_2: emptyTimedActivity(),
      meal_3: emptyTimedActivity(),
      short_walk: emptyTimedActivity(),
      spontaneous_walk: emptyTimedActivity(),
      arms_extended_1: emptyTimedActivity(),
      arms_extended_2: emptyTimedActivity(),
      other_activity: emptyTimedActivity(),
      rest_1: emptyIntervalActivity(),
      rest_2: emptyIntervalActivity(),
      rest_3: emptyIntervalActivity(),
      nap: emptyIntervalActivity(),
    },
    symptoms: {
      tremor: emptySymptomHours(),
      slowness: emptySymptomHours(),
      dyskinesia: emptySymptomHours(),
      walking: emptySymptomHours(),
      freezing: emptySymptomHours(),
    },
    devices: {
      watch_usage: null,
      phone_nearby: null,
      watch_removed: { from: null, to: null, reason: null },
      device_problem: null,
      device_problem_detail: null,
      charged_end_of_day: null,
      sleep_with_smartwatch: null,
      day_notes: null,
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeBoolean(value: unknown): boolean | null {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  throw new Error('Valor booleano inválido');
}

function normalizeTimedActivity(raw: unknown): TimedActivity {
  const row = asRecord(raw);
  return {
    time: normalizeTime(row.time),
    notes: normalizeNullableString(row.notes),
  };
}

function normalizeIntervalActivity(raw: unknown): IntervalActivity {
  const row = asRecord(raw);
  return {
    from: normalizeTime(row.from),
    to: normalizeTime(row.to),
    notes: normalizeNullableString(row.notes),
  };
}

function normalizeDose(raw: unknown): MedicationDose {
  const row = asRecord(raw);
  return {
    time: normalizeTime(row.time),
    m1: Boolean(row.m1),
    m2: Boolean(row.m2),
    m3: Boolean(row.m3),
    m4: Boolean(row.m4),
    m5: Boolean(row.m5),
    notes: normalizeNullableString(row.notes),
  };
}

function isValidDose(dose: MedicationDose): boolean {
  return Boolean(
    dose.time && (dose.m1 || dose.m2 || dose.m3 || dose.m4 || dose.m5),
  );
}

function normalizeSymptomScore(value: unknown): SymptomScore | null {
  if (value == null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(num) || num < 0 || num > 3) {
    throw new Error(`Intensidade de sintoma inválida: ${value}`);
  }
  return num as SymptomScore;
}

function mergeShallowBySection(
  base: FreelivingDiaryPayload,
  incoming: unknown,
): unknown {
  const src = asRecord(incoming);
  return {
    medication: src.medication ?? base.medication,
    activities: src.activities ?? base.activities,
    symptoms: src.symptoms ?? base.symptoms,
    devices: src.devices ?? base.devices,
  };
}

export function normalizeDiaryPayload(
  incoming: unknown,
  previous?: FreelivingDiaryPayload | null,
): FreelivingDiaryPayload {
  const base = previous ? structuredClone(previous) : emptyDiaryPayload();
  const merged = asRecord(mergeShallowBySection(base, incoming));
  const medicationIn = asRecord(merged.medication);
  const labelsIn = asRecord(medicationIn.labels);
  const dosesRaw = Array.isArray(medicationIn.doses) ? medicationIn.doses : [];
  if (dosesRaw.length > 6) {
    throw new Error('São permitidas no máximo 6 doses');
  }

  const activitiesIn = asRecord(merged.activities);
  const symptomsIn = asRecord(merged.symptoms);
  const devicesIn = asRecord(merged.devices);
  const watchRemovedIn = asRecord(devicesIn.watch_removed);

  const watchUsage = devicesIn.watch_usage ?? null;
  if (
    watchUsage != null &&
    !WATCH_USAGE_VALUES.includes(watchUsage as (typeof WATCH_USAGE_VALUES)[number])
  ) {
    throw new Error(`watch_usage inválido: ${watchUsage}`);
  }

  const phoneNearby = devicesIn.phone_nearby ?? null;
  if (
    phoneNearby != null &&
    !PHONE_NEARBY_VALUES.includes(phoneNearby as (typeof PHONE_NEARBY_VALUES)[number])
  ) {
    throw new Error(`phone_nearby inválido: ${phoneNearby}`);
  }

  const activities = { ...emptyDiaryPayload().activities };
  for (const key of REQUIRED_TIMED_ACTIVITIES) {
    activities[key] = normalizeTimedActivity(activitiesIn[key]);
  }
  for (const key of OPTIONAL_TIMED_ACTIVITIES) {
    activities[key] = normalizeTimedActivity(activitiesIn[key]);
  }
  for (const key of OPTIONAL_INTERVAL_ACTIVITIES) {
    activities[key] = normalizeIntervalActivity(activitiesIn[key]);
  }

  const symptoms = emptyDiaryPayload().symptoms;
  for (const key of SYMPTOM_KEYS) {
    const hourMap = asRecord(symptomsIn[key]);
    for (const hour of SYMPTOM_HOURS) {
      symptoms[key][hour] = normalizeSymptomScore(hourMap[hour]);
    }
  }

  return {
    medication: {
      labels: {
        m1: normalizeNullableString(labelsIn.m1),
        m2: normalizeNullableString(labelsIn.m2),
        m3: normalizeNullableString(labelsIn.m3),
        m4: normalizeNullableString(labelsIn.m4),
        m5: normalizeNullableString(labelsIn.m5),
      },
      doses: dosesRaw.map(normalizeDose),
    },
    activities,
    symptoms,
    devices: {
      watch_usage:
        (watchUsage as FreelivingDiaryPayload['devices']['watch_usage']) ?? null,
      phone_nearby:
        (phoneNearby as FreelivingDiaryPayload['devices']['phone_nearby']) ??
        null,
      watch_removed: {
        from: normalizeTime(watchRemovedIn.from),
        to: normalizeTime(watchRemovedIn.to),
        reason: normalizeNullableString(watchRemovedIn.reason),
      },
      device_problem: normalizeBoolean(devicesIn.device_problem),
      device_problem_detail: normalizeNullableString(
        devicesIn.device_problem_detail,
      ),
      charged_end_of_day: normalizeBoolean(devicesIn.charged_end_of_day),
      sleep_with_smartwatch: normalizeBoolean(devicesIn.sleep_with_smartwatch),
      day_notes: normalizeNullableString(devicesIn.day_notes),
    },
  };
}

export function computeDiaryGaps(
  payload: FreelivingDiaryPayload,
): FreelivingDiaryGap[] {
  const gaps: FreelivingDiaryGap[] = [];

  if (!payload.medication.doses.some(isValidDose)) {
    gaps.push({
      path: 'medication.doses',
      label_pt: 'Pelo menos uma dose de medicação (horário + medicamento)',
    });
  }

  for (const key of REQUIRED_TIMED_ACTIVITIES) {
    if (!isFilledTime(payload.activities[key].time)) {
      gaps.push({
        path: `activities.${key}.time`,
        label_pt: ACTIVITY_LABELS[key],
      });
    }
  }

  for (const symptom of SYMPTOM_KEYS) {
    for (const hour of SYMPTOM_HOURS) {
      if (payload.symptoms[symptom][hour] == null) {
        gaps.push({
          path: `symptoms.${symptom}.${hour}`,
          label_pt: `${SYMPTOM_LABELS[symptom]} às ${hour}h`,
        });
      }
    }
  }

  const devices = payload.devices;
  if (devices.watch_usage == null) {
    gaps.push({
      path: 'devices.watch_usage',
      label_pt: 'Usou o relógio hoje?',
    });
  }
  if (devices.phone_nearby == null) {
    gaps.push({
      path: 'devices.phone_nearby',
      label_pt: 'Celular ligado/próximo?',
    });
  }
  if (devices.device_problem == null) {
    gaps.push({
      path: 'devices.device_problem',
      label_pt: 'Problema com relógio/celular?',
    });
  }
  if (devices.charged_end_of_day == null) {
    gaps.push({
      path: 'devices.charged_end_of_day',
      label_pt: 'Colocou celular e relógio para carregar no fim do dia?',
    });
  }
  if (devices.sleep_with_smartwatch == null) {
    gaps.push({
      path: 'devices.sleep_with_smartwatch',
      label_pt: 'Colocou o smartwatch para dormir?',
    });
  }
  if (devices.watch_usage === 'removed') {
    if (!isFilledTime(devices.watch_removed.from)) {
      gaps.push({
        path: 'devices.watch_removed.from',
        label_pt: 'Início do período sem relógio',
      });
    }
    if (!isFilledTime(devices.watch_removed.to)) {
      gaps.push({
        path: 'devices.watch_removed.to',
        label_pt: 'Fim do período sem relógio',
      });
    }
  }
  if (devices.device_problem === true && !devices.device_problem_detail) {
    gaps.push({
      path: 'devices.device_problem_detail',
      label_pt: 'Qual o problema com relógio/celular?',
    });
  }

  return gaps;
}

export function diaryStatusFromGaps(
  gaps: FreelivingDiaryGap[],
): FreelivingDiaryStatus {
  return gaps.length === 0 ? 'completo' : 'rascunho';
}

export function filledSectionCount(gaps: FreelivingDiaryGap[]): number {
  const missing = new Set(gaps.map((gap) => gap.path.split('.')[0]));
  return DIARY_SECTIONS.filter((section) => !missing.has(section)).length;
}

export function diarySectionSummary(gaps: FreelivingDiaryGap[]): {
  filledSectionCount: number;
  sectionCount: number;
} {
  return {
    filledSectionCount: filledSectionCount(gaps),
    sectionCount: DIARY_SECTION_COUNT,
  };
}

export function isIntervalFilled(value: IntervalActivity): boolean {
  return isFilledTime(value.from) || isFilledTime(value.to) || Boolean(value.notes);
}

export function isTimedFilled(value: TimedActivity): boolean {
  return isFilledTime(value.time) || Boolean(value.notes);
}

export function uuidV5FromName(name: string): string {
  const hash = createHash('sha1')
    .update(Buffer.from(DIARY_EVENT_NAMESPACE, 'hex'))
    .update(name)
    .digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function diaryMilestoneClientEventId(
  diaryId: string,
  actionCode: string,
): string {
  return uuidV5FromName(`freeliving-diary:${diaryId}:${actionCode}`);
}

export function hasGap(gaps: FreelivingDiaryGap[], path: string): boolean {
  return gaps.some((gap) => gap.path === path);
}
