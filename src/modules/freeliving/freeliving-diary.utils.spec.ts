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
  payload.medicacao.doses = [
    {
      horario: '08:00',
      m1: true,
      m2: false,
      m3: false,
      m4: false,
      m5: false,
      obs: null,
    },
  ];
  payload.atividades.higiene_manha.horario = '07:00';
  payload.atividades.refeicao_1.horario = '08:00';
  payload.atividades.caminhada_curta.horario = '10:00';
  payload.atividades.bracos_estendidos_1.horario = '11:00';
  payload.atividades.bracos_estendidos_2.horario = '16:00';
  for (const key of SYMPTOM_KEYS) {
    for (const hour of SYMPTOM_HOURS) {
      payload.sintomas[key][hour] = 0;
    }
  }
  payload.dispositivos.usou_relogio = 'todo_periodo';
  payload.dispositivos.celular_proximo = 'sim';
  payload.dispositivos.problema_dispositivo = false;
  payload.dispositivos.carregou_fim_dia = true;
  payload.dispositivos.smartwatch_para_dormir = true;
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
    payload.sintomas.tremor['14'] = null;
    const gaps = computeDiaryGaps(payload);
    expect(gaps.some((g) => g.path === 'sintomas.tremor.14')).toBe(true);
  });

  it('relogio retirou exige intervalo', () => {
    const payload = completePayload();
    payload.dispositivos.usou_relogio = 'retirou';
    const gaps = computeDiaryGaps(payload);
    expect(gaps.some((g) => g.path === 'dispositivos.relogio_retirou.de')).toBe(
      true,
    );
  });

  it('merge raso preserva seção omitida', () => {
    const previous = completePayload();
    const merged = normalizeDiaryPayload(
      {
        medicacao: {
          rotulos: { m1: 'Levodopa', m2: null, m3: null, m4: null, m5: null },
          doses: [
            {
              horario: '09:15',
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
    expect(merged.medicacao.rotulos.m1).toBe('Levodopa');
    expect(merged.atividades.higiene_manha.horario).toBe('07:00');
    expect(merged.sintomas.tremor['06']).toBe(0);
  });

  it('rejeita horário e intensidade inválidos', () => {
    expect(() =>
      normalizeDiaryPayload({
        atividades: { higiene_manha: { horario: '25:00' } },
      }),
    ).toThrow(/Horário inválido/);
    expect(() =>
      normalizeDiaryPayload({
        sintomas: { tremor: { '06': 4 } },
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
