import { MedicationLabels } from './freeliving-diary.types';

export type ClinicalMedicationSlot = {
  name: string;
  doseMg: number | null;
  dosesPerDay: number | null;
  label: string;
};

export function formatMedicationLabel(
  name: string,
  doseMg: number | null | undefined,
): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '';
  const dose = doseMg == null ? NaN : Number(doseMg);
  if (!Number.isFinite(dose) || dose <= 0) return trimmed;
  const formatted = Number.isInteger(dose) ? String(dose) : String(dose);
  return `${trimmed} ${formatted} mg`;
}

export function toMedicationLabels(
  slots: ClinicalMedicationSlot[],
): MedicationLabels {
  return {
    m1: slots[0]?.label || null,
    m2: slots[1]?.label || null,
    m3: slots[2]?.label || null,
    m4: slots[3]?.label || null,
    m5: slots[4]?.label || null,
  };
}

export function mapMedicationRows(
  rows: Array<{
    drug_name?: string | null;
    dose_mg?: string | number | null;
    doses_per_day?: string | number | null;
  }>,
): { slots: ClinicalMedicationSlot[]; extraCount: number } {
  const mapped = rows
    .map((row) => {
      const name = (row.drug_name || '').trim();
      const doseMgRaw =
        row.dose_mg == null || row.dose_mg === '' ? null : Number(row.dose_mg);
      const doseMg =
        doseMgRaw != null && Number.isFinite(doseMgRaw) ? doseMgRaw : null;
      const dosesRaw =
        row.doses_per_day == null || row.doses_per_day === ''
          ? null
          : Number(row.doses_per_day);
      const dosesPerDay =
        dosesRaw != null && Number.isFinite(dosesRaw) ? dosesRaw : null;
      return {
        name,
        doseMg,
        dosesPerDay,
        label: formatMedicationLabel(name, doseMg),
      };
    })
    .filter((row) => row.label);
  return {
    slots: mapped.slice(0, 5),
    extraCount: Math.max(0, mapped.length - 5),
  };
}
