import { createHash } from 'crypto';
import {
  ACTIVITY_LABELS,
  DIARY_SECTION_COUNT,
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
  return { horario: null, obs: null };
}

export function emptyIntervalActivity(): IntervalActivity {
  return { de: null, ate: null, obs: null };
}

export function emptySymptomHours(): SymptomHourMap {
  return SYMPTOM_HOURS.reduce((acc, hour) => {
    acc[hour] = null;
    return acc;
  }, {} as SymptomHourMap);
}

export function emptyDiaryPayload(): FreelivingDiaryPayload {
  return {
    medicacao: {
      rotulos: { m1: null, m2: null, m3: null, m4: null, m5: null },
      doses: [],
    },
    atividades: {
      higiene_manha: emptyTimedActivity(),
      refeicao_1: emptyTimedActivity(),
      refeicao_2: emptyTimedActivity(),
      refeicao_3: emptyTimedActivity(),
      caminhada_curta: emptyTimedActivity(),
      caminhada_espontanea: emptyTimedActivity(),
      bracos_estendidos_1: emptyTimedActivity(),
      bracos_estendidos_2: emptyTimedActivity(),
      outra_atividade: emptyTimedActivity(),
      repouso_1: emptyIntervalActivity(),
      repouso_2: emptyIntervalActivity(),
      repouso_3: emptyIntervalActivity(),
      cochilo: emptyIntervalActivity(),
    },
    sintomas: {
      tremor: emptySymptomHours(),
      lentidao: emptySymptomHours(),
      discinesia: emptySymptomHours(),
      caminhar: emptySymptomHours(),
      congelamento: emptySymptomHours(),
    },
    dispositivos: {
      usou_relogio: null,
      celular_proximo: null,
      relogio_retirou: { de: null, ate: null, motivo: null },
      problema_dispositivo: null,
      problema_qual: null,
      carregou_fim_dia: null,
      smartwatch_para_dormir: null,
      observacoes_dia: null,
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
    horario: normalizeTime(row.horario),
    obs: normalizeNullableString(row.obs),
  };
}

function normalizeIntervalActivity(raw: unknown): IntervalActivity {
  const row = asRecord(raw);
  return {
    de: normalizeTime(row.de),
    ate: normalizeTime(row.ate),
    obs: normalizeNullableString(row.obs),
  };
}

function normalizeDose(raw: unknown): MedicationDose {
  const row = asRecord(raw);
  return {
    horario: normalizeTime(row.horario),
    m1: Boolean(row.m1),
    m2: Boolean(row.m2),
    m3: Boolean(row.m3),
    m4: Boolean(row.m4),
    m5: Boolean(row.m5),
    obs: normalizeNullableString(row.obs),
  };
}

function isValidDose(dose: MedicationDose): boolean {
  return Boolean(
    dose.horario && (dose.m1 || dose.m2 || dose.m3 || dose.m4 || dose.m5),
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
    medicacao: src.medicacao ?? base.medicacao,
    atividades: src.atividades ?? base.atividades,
    sintomas: src.sintomas ?? base.sintomas,
    dispositivos: src.dispositivos ?? base.dispositivos,
  };
}

export function normalizeDiaryPayload(
  incoming: unknown,
  previous?: FreelivingDiaryPayload | null,
): FreelivingDiaryPayload {
  const base = previous ? structuredClone(previous) : emptyDiaryPayload();
  const merged = asRecord(mergeShallowBySection(base, incoming));
  const medicacaoIn = asRecord(merged.medicacao);
  const rotulosIn = asRecord(medicacaoIn.rotulos);
  const dosesRaw = Array.isArray(medicacaoIn.doses) ? medicacaoIn.doses : [];
  if (dosesRaw.length > 6) {
    throw new Error('São permitidas no máximo 6 doses');
  }

  const atividadesIn = asRecord(merged.atividades);
  const sintomasIn = asRecord(merged.sintomas);
  const dispositivosIn = asRecord(merged.dispositivos);
  const retiradaIn = asRecord(dispositivosIn.relogio_retirou);

  const watchUsage = dispositivosIn.usou_relogio ?? null;
  if (
    watchUsage != null &&
    !WATCH_USAGE_VALUES.includes(watchUsage as (typeof WATCH_USAGE_VALUES)[number])
  ) {
    throw new Error(`usou_relogio inválido: ${watchUsage}`);
  }

  const phoneNearby = dispositivosIn.celular_proximo ?? null;
  if (
    phoneNearby != null &&
    !PHONE_NEARBY_VALUES.includes(phoneNearby as (typeof PHONE_NEARBY_VALUES)[number])
  ) {
    throw new Error(`celular_proximo inválido: ${phoneNearby}`);
  }

  const atividades = { ...emptyDiaryPayload().atividades };
  for (const key of REQUIRED_TIMED_ACTIVITIES) {
    atividades[key] = normalizeTimedActivity(atividadesIn[key]);
  }
  for (const key of OPTIONAL_TIMED_ACTIVITIES) {
    atividades[key] = normalizeTimedActivity(atividadesIn[key]);
  }
  for (const key of OPTIONAL_INTERVAL_ACTIVITIES) {
    atividades[key] = normalizeIntervalActivity(atividadesIn[key]);
  }

  const sintomas = emptyDiaryPayload().sintomas;
  for (const key of SYMPTOM_KEYS) {
    const hourMap = asRecord(sintomasIn[key]);
    for (const hour of SYMPTOM_HOURS) {
      sintomas[key][hour] = normalizeSymptomScore(hourMap[hour]);
    }
  }

  return {
    medicacao: {
      rotulos: {
        m1: normalizeNullableString(rotulosIn.m1),
        m2: normalizeNullableString(rotulosIn.m2),
        m3: normalizeNullableString(rotulosIn.m3),
        m4: normalizeNullableString(rotulosIn.m4),
        m5: normalizeNullableString(rotulosIn.m5),
      },
      doses: dosesRaw.map(normalizeDose),
    },
    atividades,
    sintomas,
    dispositivos: {
      usou_relogio: (watchUsage as FreelivingDiaryPayload['dispositivos']['usou_relogio']) ?? null,
      celular_proximo:
        (phoneNearby as FreelivingDiaryPayload['dispositivos']['celular_proximo']) ??
        null,
      relogio_retirou: {
        de: normalizeTime(retiradaIn.de),
        ate: normalizeTime(retiradaIn.ate),
        motivo: normalizeNullableString(retiradaIn.motivo),
      },
      problema_dispositivo: normalizeBoolean(dispositivosIn.problema_dispositivo),
      problema_qual: normalizeNullableString(dispositivosIn.problema_qual),
      carregou_fim_dia: normalizeBoolean(dispositivosIn.carregou_fim_dia),
      smartwatch_para_dormir: normalizeBoolean(
        dispositivosIn.smartwatch_para_dormir,
      ),
      observacoes_dia: normalizeNullableString(dispositivosIn.observacoes_dia),
    },
  };
}

export function computeDiaryGaps(
  payload: FreelivingDiaryPayload,
): FreelivingDiaryGap[] {
  const gaps: FreelivingDiaryGap[] = [];

  if (!payload.medicacao.doses.some(isValidDose)) {
    gaps.push({
      path: 'medicacao.doses',
      label_pt: 'Pelo menos uma dose de medicação (horário + medicamento)',
    });
  }

  for (const key of REQUIRED_TIMED_ACTIVITIES) {
    if (!isFilledTime(payload.atividades[key].horario)) {
      gaps.push({
        path: `atividades.${key}.horario`,
        label_pt: ACTIVITY_LABELS[key],
      });
    }
  }

  for (const symptom of SYMPTOM_KEYS) {
    for (const hour of SYMPTOM_HOURS) {
      if (payload.sintomas[symptom][hour] == null) {
        gaps.push({
          path: `sintomas.${symptom}.${hour}`,
          label_pt: `${SYMPTOM_LABELS[symptom]} às ${hour}h`,
        });
      }
    }
  }

  const devices = payload.dispositivos;
  if (devices.usou_relogio == null) {
    gaps.push({
      path: 'dispositivos.usou_relogio',
      label_pt: 'Usou o relógio hoje?',
    });
  }
  if (devices.celular_proximo == null) {
    gaps.push({
      path: 'dispositivos.celular_proximo',
      label_pt: 'Celular ligado/próximo?',
    });
  }
  if (devices.problema_dispositivo == null) {
    gaps.push({
      path: 'dispositivos.problema_dispositivo',
      label_pt: 'Problema com relógio/celular?',
    });
  }
  if (devices.carregou_fim_dia == null) {
    gaps.push({
      path: 'dispositivos.carregou_fim_dia',
      label_pt: 'Colocou celular e relógio para carregar no fim do dia?',
    });
  }
  if (devices.smartwatch_para_dormir == null) {
    gaps.push({
      path: 'dispositivos.smartwatch_para_dormir',
      label_pt: 'Colocou o smartwatch para dormir?',
    });
  }
  if (devices.usou_relogio === 'retirou') {
    if (!isFilledTime(devices.relogio_retirou.de)) {
      gaps.push({
        path: 'dispositivos.relogio_retirou.de',
        label_pt: 'Início do período sem relógio',
      });
    }
    if (!isFilledTime(devices.relogio_retirou.ate)) {
      gaps.push({
        path: 'dispositivos.relogio_retirou.ate',
        label_pt: 'Fim do período sem relógio',
      });
    }
  }
  if (devices.problema_dispositivo === true && !devices.problema_qual) {
    gaps.push({
      path: 'dispositivos.problema_qual',
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
  const sections = ['medicacao', 'atividades', 'sintomas', 'dispositivos'];
  return sections.filter((section) => !missing.has(section)).length;
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
  return isFilledTime(value.de) || isFilledTime(value.ate) || Boolean(value.obs);
}

export function isTimedFilled(value: TimedActivity): boolean {
  return isFilledTime(value.horario) || Boolean(value.obs);
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
