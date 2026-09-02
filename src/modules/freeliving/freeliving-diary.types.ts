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
  'lentidao',
  'discinesia',
  'caminhar',
  'congelamento',
] as const;

export type SymptomKey = (typeof SYMPTOM_KEYS)[number];

export type SymptomScore = 0 | 1 | 2 | 3;

export const WATCH_USAGE_VALUES = [
  'todo_periodo',
  'retirou',
  'nao_usou',
] as const;

export type WatchUsage = (typeof WATCH_USAGE_VALUES)[number];

export const PHONE_NEARBY_VALUES = [
  'sim',
  'as_vezes',
  'nao',
  'nao_sei',
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
  horario: string | null;
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  m5: boolean;
  obs: string | null;
};

export type TimedActivity = {
  horario: string | null;
  obs: string | null;
};

export type IntervalActivity = {
  de: string | null;
  ate: string | null;
  obs: string | null;
};

export type DiaryActivities = {
  higiene_manha: TimedActivity;
  refeicao_1: TimedActivity;
  refeicao_2: TimedActivity;
  refeicao_3: TimedActivity;
  caminhada_curta: TimedActivity;
  caminhada_espontanea: TimedActivity;
  bracos_estendidos_1: TimedActivity;
  bracos_estendidos_2: TimedActivity;
  outra_atividade: TimedActivity;
  repouso_1: IntervalActivity;
  repouso_2: IntervalActivity;
  repouso_3: IntervalActivity;
  cochilo: IntervalActivity;
};

export type SymptomHourMap = Record<SymptomHour, SymptomScore | null>;

export type DiarySymptoms = Record<SymptomKey, SymptomHourMap>;

export type WatchRemoval = {
  de: string | null;
  ate: string | null;
  motivo: string | null;
};

export type DiaryDevices = {
  usou_relogio: WatchUsage | null;
  celular_proximo: PhoneNearby | null;
  relogio_retirou: WatchRemoval;
  problema_dispositivo: boolean | null;
  problema_qual: string | null;
  carregou_fim_dia: boolean | null;
  smartwatch_para_dormir: boolean | null;
  observacoes_dia: string | null;
};

export type FreelivingDiaryPayload = {
  medicacao: {
    rotulos: MedicationLabels;
    doses: MedicationDose[];
  };
  atividades: DiaryActivities;
  sintomas: DiarySymptoms;
  dispositivos: DiaryDevices;
};

export const REQUIRED_TIMED_ACTIVITIES = [
  'higiene_manha',
  'refeicao_1',
  'caminhada_curta',
  'bracos_estendidos_1',
  'bracos_estendidos_2',
] as const;

export const OPTIONAL_TIMED_ACTIVITIES = [
  'refeicao_2',
  'refeicao_3',
  'caminhada_espontanea',
  'outra_atividade',
] as const;

export const OPTIONAL_INTERVAL_ACTIVITIES = [
  'repouso_1',
  'repouso_2',
  'repouso_3',
  'cochilo',
] as const;

export const ACTIVITY_LABELS: Record<
  keyof DiaryActivities,
  string
> = {
  higiene_manha: 'Higiene da manhã / escovou os dentes',
  refeicao_1: 'Refeição 1',
  refeicao_2: 'Refeição 2',
  refeicao_3: 'Refeição 3',
  caminhada_curta: 'Caminhada curta orientada',
  caminhada_espontanea: 'Caminhada espontânea / saída de casa',
  bracos_estendidos_1: 'Braços estendidos — 1ª vez',
  bracos_estendidos_2: 'Braços estendidos — 2ª vez',
  outra_atividade: 'Outra atividade / evento importante',
  repouso_1: 'Repouso sentado/deitado — 1º período',
  repouso_2: 'Repouso sentado/deitado — 2º período',
  repouso_3: 'Repouso sentado/deitado — 3º período',
  cochilo: 'Cochilou / dormiu durante o dia',
};

export const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  tremor: 'Tremor',
  lentidao: 'Lentidão/travamento',
  discinesia: 'Discinesia/balançando',
  caminhar: 'Dificuldade para caminhar',
  congelamento: 'Travou para andar/congelamento',
};

export const DIARY_SECTION_COUNT = 4;
