import { emptyDiaryPayload } from './freeliving-diary.utils';
import {
  buildFreeLivingDiaryQuestionnaireCsv,
  FREE_LIVING_DIARY_CSV_NAME,
} from './freeliving-diary-export-csv';

describe('buildFreeLivingDiaryQuestionnaireCsv', () => {
  it('usa o nome 06_Free_Living_Diary.csv', () => {
    expect(FREE_LIVING_DIARY_CSV_NAME).toBe('06_Free_Living_Diary.csv');
  });

  it('com lista vazia devolve só o cabeçalho', () => {
    const csv = buildFreeLivingDiaryQuestionnaireCsv([]);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('public_identifier');
    expect(lines[0]).toContain('diary_date');
    expect(lines[0]).toContain('protocol_day');
  });

  it('emite uma linha por dia com medicação e dispositivos', () => {
    const payload = emptyDiaryPayload();
    payload.medication.labels.m1 = 'Levodopa';
    payload.medication.doses = [
      {
        time: '08:00',
        m1: true,
        m2: false,
        m3: false,
        m4: false,
        m5: false,
        notes: 'café',
      },
    ];
    payload.devices.watch_usage = 'all_day';
    payload.devices.phone_nearby = 'yes';
    payload.symptoms.tremor['08'] = 2;

    const csv = buildFreeLivingDiaryQuestionnaireCsv([
      {
        publicIdentifier: 'P001',
        diaryDate: '2026-09-01',
        protocolDay: 1,
        status: 'completo',
        saveCount: 3,
        lastSavedAt: '2026-09-01T12:00:00.000Z',
        payload,
      },
    ]);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('P001');
    expect(lines[1]).toContain('2026-09-01');
    expect(lines[1]).toContain('Levodopa');
    expect(lines[1]).toContain('08:00');
    expect(lines[1]).toContain('all_day');
  });
});
