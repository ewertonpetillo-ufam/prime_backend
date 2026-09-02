export const SYMPTOM_HOURS = [
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
] as const;

export type SymptomHour = (typeof SYMPTOM_HOURS)[number];

export const SYMPTOM_KEYS = [
  'tremor',
  'slowness',
  'dyskinesia',
  'walking',
  'freezing',
] as const;

export type SymptomKey = (typeof SYMPTOM_KEYS)[number];

export type SymptomScore = 0 | 1 | 2 | 3;

export const WATCH_USAGE_VALUES = [
  'all_day',
  'removed',
  'not_used',
] as const;

export type WatchUsage = (typeof WATCH_USAGE_VALUES)[number];

export const PHONE_NEARBY_VALUES = [
  'yes',
  'sometimes',
  'no',
  'unknown',
] as const;

export type PhoneNearby = (typeof PHONE_NEARBY_VALUES)[number];

export type FreelivingDiaryStatus = 'rascunho' | 'completo';

export type DiaryOverviewStatus =
  | 'sem_registro'
  | 'em_preenchimento'
  | 'completo';

export const DIARY_OVERVIEW_STATUSES: DiaryOverviewStatus[] = [
  'sem_registro',
  'em_preenchimento',
  'completo',
];

export const DIARY_SECTIONS = [
  'medication',
  'activities',
  'symptoms',
  'devices',
] as const;

export type DiarySection = (typeof DIARY_SECTIONS)[number];

export type FreelivingDiaryGap = {
  path: string;
  label_pt: string;
};

export type MedicationLabels = {
  m1: string | null;
  m2: string | null;
  m3: string | null;
  m4: string | null;
  m5: string | null;
};

export type MedicationDose = {
  time: string | null;
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  m5: boolean;
  notes: string | null;
};

export type TimedActivity = {
  time: string | null;
  notes: string | null;
};

export type IntervalActivity = {
  from: string | null;
  to: string | null;
  notes: string | null;
};

export type DiaryActivities = {
  morning_hygiene: TimedActivity;
  meal_1: TimedActivity;
  meal_2: TimedActivity;
  meal_3: TimedActivity;
  short_walk: TimedActivity;
  spontaneous_walk: TimedActivity;
  arms_extended_1: TimedActivity;
  arms_extended_2: TimedActivity;
  other_activity: TimedActivity;
  rest_1: IntervalActivity;
  rest_2: IntervalActivity;
  rest_3: IntervalActivity;
  nap: IntervalActivity;
};

export type SymptomHourMap = Record<SymptomHour, SymptomScore | null>;

export type DiarySymptoms = Record<SymptomKey, SymptomHourMap>;

export type WatchRemoval = {
  from: string | null;
  to: string | null;
  reason: string | null;
};

export type DiaryDevices = {
  watch_usage: WatchUsage | null;
  phone_nearby: PhoneNearby | null;
  watch_removed: WatchRemoval;
  device_problem: boolean | null;
  device_problem_detail: string | null;
  charged_end_of_day: boolean | null;
  sleep_with_smartwatch: boolean | null;
  day_notes: string | null;
};

export type FreelivingDiaryPayload = {
  medication: {
    labels: MedicationLabels;
    doses: MedicationDose[];
  };
  activities: DiaryActivities;
  symptoms: DiarySymptoms;
  devices: DiaryDevices;
};

export const REQUIRED_TIMED_ACTIVITIES = [
  'morning_hygiene',
  'meal_1',
  'short_walk',
  'arms_extended_1',
  'arms_extended_2',
] as const;

export const OPTIONAL_TIMED_ACTIVITIES = [
  'meal_2',
  'meal_3',
  'spontaneous_walk',
  'other_activity',
] as const;

export const OPTIONAL_INTERVAL_ACTIVITIES = [
  'rest_1',
  'rest_2',
  'rest_3',
  'nap',
] as const;

export const ACTIVITY_LABELS: Record<keyof DiaryActivities, string> = {
  morning_hygiene: 'Higiene da manhã / escovou os dentes',
  meal_1: 'Refeição 1',
  meal_2: 'Refeição 2',
  meal_3: 'Refeição 3',
  short_walk: 'Caminhada curta orientada',
  spontaneous_walk: 'Caminhada espontânea / saída de casa',
  arms_extended_1: 'Braços estendidos — 1ª vez',
  arms_extended_2: 'Braços estendidos — 2ª vez',
  other_activity: 'Outra atividade / evento importante',
  rest_1: 'Repouso sentado/deitado — 1º período',
  rest_2: 'Repouso sentado/deitado — 2º período',
  rest_3: 'Repouso sentado/deitado — 3º período',
  nap: 'Cochilou / dormiu durante o dia',
};

export const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  tremor: 'Tremor',
  slowness: 'Lentidão/travamento',
  dyskinesia: 'Discinesia/balançando',
  walking: 'Dificuldade para caminhar',
  freezing: 'Travou para andar/congelamento',
};

export const DIARY_SECTION_COUNT = 4;
