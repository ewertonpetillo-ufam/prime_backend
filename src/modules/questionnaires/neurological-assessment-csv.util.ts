/** Ordem de exportação UDysRS q1–q26 (campos semânticos) + q27/q28 (subscores). */
export const UDYSRS_Q_EXPORT_FIELD_ORDER = [
  'on_dyskinesia_time',
  'impact_speech',
  'impact_chewing',
  'impact_eating',
  'impact_dressing',
  'impact_hygiene',
  'impact_writing',
  'impact_hobbies',
  'impact_walking',
  'impact_social',
  'impact_emotional',
  'off_dystonia_time',
  'dystonia_activities',
  'dystonia_pain_impact',
  'dystonia_pain_severity',
  'severity_face',
  'severity_neck',
  'severity_right_arm',
  'severity_left_arm',
  'severity_trunk',
  'severity_right_leg',
  'severity_left_leg',
  'disability_communication',
  'disability_drinking',
  'disability_dressing',
  'disability_walking',
  'historical_subscore',
  'objective_subscore',
] as const;

export const formatNeurologicalScoreCsv = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
};

export const formatMeemLanguageNaming = (meem: Record<string, unknown>): string => {
  const parts = [meem.language_naming1, meem.language_naming2]
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map((v) => String(v));
  if (parts.length > 0) return parts.join('|');
  const legacy = meem.language_naming;
  return legacy !== null && legacy !== undefined ? String(legacy) : '';
};

export const getUdysrsQExportValues = (
  udysrs: Record<string, unknown> | null | undefined,
): string[] =>
  UDYSRS_Q_EXPORT_FIELD_ORDER.map((field) =>
    formatNeurologicalScoreCsv(udysrs?.[field]),
  );
