import {
  SYMPTOM_HOURS,
  SYMPTOM_KEYS,
} from './freeliving-diary.types';
import {
  computeDiaryGaps,
  diaryMilestoneClientEventId,
  diaryStatusFromGaps,
  emptyDiaryPayload,
  filledSectionCount,
  isFilledTime,
  normalizeDiaryPayload,
} from './freeliving-diary.utils';

function completePayload() {
  const payload = emptyDiaryPayload();
  payload.medication.doses = [
    {
      time: '08:00',
      m1: true,
      m2: false,
      m3: false,
      m4: false,
      m5: false,
      notes: null,
    },
  ];
  payload.activities.morning_hygiene.time = '07:00';
  payload.activities.meal_1.time = '08:00';
  payload.activities.short_walk.time = '10:00';
  payload.activities.arms_extended_1.time = '11:00';
  payload.activities.arms_extended_2.time = '16:00';
  for (const key of SYMPTOM_KEYS) {
    for (const hour of SYMPTOM_HOURS) {
      payload.symptoms[key][hour] = 0;
    }
  }
  payload.devices.watch_usage = 'all_day';
  payload.devices.phone_nearby = 'yes';
  payload.devices.device_problem = false;
  payload.devices.charged_end_of_day = true;
  payload.devices.sleep_with_smartwatch = true;
  return payload;
}

describe('freeliving-diary.utils', () => {
  it('empty payload gera gaps e status rascunho', () => {
    const gaps = computeDiaryGaps(emptyDiaryPayload());
    expect(gaps.length).toBeGreaterThan(0);
    expect(diaryStatusFromGaps(gaps)).toBe('rascunho');
    expect(filledSectionCount(gaps)).toBe(0);
  });

  it('payload completo não tem gaps', () => {
    const gaps = computeDiaryGaps(completePayload());
    expect(gaps).toEqual([]);
    expect(diaryStatusFromGaps(gaps)).toBe('completo');
    expect(filledSectionCount(gaps)).toBe(4);
  });

  it('0 em sintoma conta como preenchido; null é falta', () => {
    const payload = completePayload();
    payload.symptoms.tremor['14'] = null;
    const gaps = computeDiaryGaps(payload);
    expect(gaps.some((g) => g.path === 'symptoms.tremor.14')).toBe(true);
  });

  it('watch_usage removed exige intervalo', () => {
    const payload = completePayload();
    payload.devices.watch_usage = 'removed';
    const gaps = computeDiaryGaps(payload);
    expect(gaps.some((g) => g.path === 'devices.watch_removed.from')).toBe(
      true,
    );
  });

  it('merge raso preserva seção omitida', () => {
    const previous = completePayload();
    const merged = normalizeDiaryPayload(
      {
        medication: {
          labels: { m1: 'Levodopa', m2: null, m3: null, m4: null, m5: null },
          doses: [
            {
              time: '09:15',
              m1: true,
              m2: false,
              m3: false,
              m4: false,
              m5: false,
            },
          ],
        },
      },
      previous,
    );
    expect(merged.medication.labels.m1).toBe('Levodopa');
    expect(merged.activities.morning_hygiene.time).toBe('07:00');
    expect(merged.symptoms.tremor['06']).toBe(0);
  });

  it('rejeita horário e intensidade inválidos', () => {
    expect(() =>
      normalizeDiaryPayload({
        activities: { morning_hygiene: { time: '25:00' } },
      }),
    ).toThrow(/Horário inválido/);
    expect(() =>
      normalizeDiaryPayload({
        symptoms: { tremor: { '06': 4 } },
      }),
    ).toThrow(/Intensidade/);
  });

  it('isFilledTime e client_event_id estável', () => {
    expect(isFilledTime('08:00')).toBe(true);
    expect(isFilledTime('')).toBe(false);
    const a = diaryMilestoneClientEventId('diary-1', 'diary_started');
    const b = diaryMilestoneClientEventId('diary-1', 'diary_started');
    const c = diaryMilestoneClientEventId('diary-1', 'diary_submitted');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
