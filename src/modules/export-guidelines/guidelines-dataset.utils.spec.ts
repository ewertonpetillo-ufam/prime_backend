import {
  GUIDELINES_PROJECT,
  GUIDELINES_STUDY,
  buildGuidelinesSessionId,
  guidelinesFilePath,
  isSpeechAudioFile,
  anonymizeExternalReportFileName,
  normalizeGuidelinesFileName,
  shouldIncludeSpeechBinary,
  toGuidelinesSubjectId,
} from './guidelines-dataset.utils';
import { buildGuidelinesMetadataJson } from './guidelines-metadata.builder';
import {
  buildGuidelinesPatientEntries,
  buildGuidelinesProjectInfoEntry,
} from './guidelines-zip.builder';

describe('guidelines-dataset.utils', () => {
  it('normaliza subject_id para Pxxx', () => {
    expect(toGuidelinesSubjectId('P13')).toBe('P013');
    expect(toGuidelinesSubjectId('p001')).toBe('P001');
    expect(toGuidelinesSubjectId('13')).toBe('P013');
  });

  it('exclui áudio de fala e inclui CSV de features', () => {
    expect(shouldIncludeSpeechBinary('TA11', 'features_TA11.csv')).toBe(true);
    expect(shouldIncludeSpeechBinary('TA10', 'P001_TA10_papapa.wav')).toBe(false);
    expect(isSpeechAudioFile('x.wav')).toBe(true);
  });

  it('substitui o nome do paciente por PXXX em EMG e Baiobit', () => {
    expect(
      anonymizeExternalReportFileName('maria_auxiliadora_-_fog_01.csv', 'P001'),
    ).toBe('P001_fog_01.csv');
    expect(
      anonymizeExternalReportFileName('jos_milton_da_silva_costa-_fog_01.csv', 'P008'),
    ).toBe('P008_fog_01.csv');
    expect(
      anonymizeExternalReportFileName('jefferson_souto_p13_26.03_--_tc10_rep1', 'P010'),
    ).toBe('P010_tc10_rep1');
    expect(
      anonymizeExternalReportFileName('paulo_roberto_tc10-_rep3.txt', 'P012'),
    ).toBe('P012_tc10_rep3.txt');
    expect(anonymizeExternalReportFileName('tc10_26.03_rep1', 'P003')).toBe(
      'P003_tc10_rep1',
    );
    expect(
      normalizeGuidelinesFileName(
        'Maria Auxiliadora - tremor_repouso_02.csv',
        null,
        'EMG',
        'P001',
      ),
    ).toBe('P001_tremor_repouso_02.csv');
  });

  it('normaliza nome de features por TA', () => {
    expect(
      normalizeGuidelinesFileName('features_TA11.csv', 'TA11', 'SP_PrimeInClinic'),
    ).toBe('features_ta11.csv');
  });

  it('monta paths Study/Project/Session/Device', () => {
    const sessionId = buildGuidelinesSessionId('P001', '20260512', 'InClinic');
    expect(sessionId).toBe('P001_20260512_InClinic');
    expect(guidelinesFilePath(sessionId, 'SP_PrimeInClinic', 'features_ta10.csv')).toBe(
      `${GUIDELINES_STUDY}/${GUIDELINES_PROJECT}/P001_20260512_InClinic/SP_PrimeInClinic/features_ta10.csv`,
    );
  });
});

describe('guidelines-metadata.builder', () => {
  it('gera metadata.json com schema e devices presentes', () => {
    const json = JSON.parse(
      buildGuidelinesMetadataJson({
        sessionId: 'P001_20260512_InClinic',
        sessionKind: 'InClinic',
        sessionDateYyyymmdd: '20260512',
        subject: {
          subject_id: 'P001',
          age: 63,
          sex: 'female',
          height_cm: 164,
          weight_kg: 64.6,
        },
        deviceIds: ['User_Data', 'GW8_PrimeInClinic', 'SP_PrimeInClinic'],
      }),
    );
    expect(json.schema_version).toBe('2026-06-18');
    expect(json.study).toBe(GUIDELINES_STUDY);
    expect(json.project).toBe(GUIDELINES_PROJECT);
    expect(json.session.activity).toBe('in_clinic');
    expect(json.session.start_time).toContain('-04:00');
    expect(json.subject.age).toBe(63);
    expect(json.devices).toHaveLength(3);
    expect(json.devices[0].device_id).toBe('User_Data');
  });
});

describe('guidelines-zip.builder', () => {
  it('inclui project_info.md sob o Project', () => {
    const entry = buildGuidelinesProjectInfoEntry();
    expect(entry.zipPath).toBe(
      `${GUIDELINES_STUDY}/${GUIDELINES_PROJECT}/project_info.md`,
    );
    expect(entry.buffer?.toString('utf-8')).toContain('2026_UFAM_Parkinson_1');
  });

  it('empacota features CSV em SP_PrimeInClinic e exclui wav', () => {
    const result = buildGuidelinesPatientEntries({
      publicIdentifier: 'P001',
      exportItems: [
        {
          questionnaire: {
            public_identifier: 'P001',
            collection_date: '2026-05-12',
            data: { age: 60, gender: 'female', height: 160, weight: 60 },
          },
          csvFiles: {
            demographicAnthropometricClinical: 'h,a\n1,2\n',
          },
          binaryCollections: [
            {
              id: 'b1',
              metadata: { file_name: 'features_TA10.csv', task_code: 'TA10' },
              active_task: { task_code: 'TA10' },
              file_sync_pending: true,
            },
            {
              id: 'b2',
              metadata: { file_name: 'papapa.wav', task_code: 'TA10' },
              active_task: { task_code: 'TA10' },
              file_sync_pending: true,
            },
            {
              id: 'b3',
              metadata: { file_name: 'acc_TA1.csv', task_code: 'TA1' },
              active_task: { task_code: 'TA1' },
              file_sync_pending: true,
            },
          ],
        },
      ],
      binaryPayloadById: new Map([
        ['b1', Buffer.from('feat\n')],
        ['b2', Buffer.from('RIFF')],
        ['b3', Buffer.from('acc\n')],
      ]),
    });

    const paths = result.entries.map((e) => e.zipPath);
    expect(paths.some((p) => p.includes('SP_PrimeInClinic/features_ta10.csv'))).toBe(
      true,
    );
    expect(paths.some((p) => p.endsWith('.wav'))).toBe(false);
    expect(paths.some((p) => p.includes('GW8_PrimeInClinic'))).toBe(true);
    expect(paths.some((p) => p.includes('User_Data/demographics.csv'))).toBe(true);
    expect(paths.some((p) => p.endsWith('metadata.json'))).toBe(true);
    expect(result.skippedSpeechAudioIds).toContain('b2');
    expect(result.includedCollectionIds.has('b1')).toBe(true);
    expect(result.includedCollectionIds.has('b2')).toBe(false);
  });

  it('mapeia FL01/FL03 e diário Free Living', () => {
    const result = buildGuidelinesPatientEntries({
      publicIdentifier: 'P002',
      exportItems: [
        {
          questionnaire: {
            public_identifier: 'P002',
            collection_date: '2026-05-20',
            data: { age: 55, gender: 'male', height: 170, weight: 70 },
          },
          csvFiles: {},
          binaryCollections: [
            {
              id: 'fl1',
              metadata: { file_name: 'ppg_fl01.csv', task_code: 'FL01' },
              active_task: { task_code: 'FL01' },
              file_sync_pending: true,
            },
            {
              id: 'fl3',
              metadata: {
                file_name: 'com.samsung.health.heart_rate.csv',
                task_code: 'FL03',
              },
              active_task: { task_code: 'FL03' },
              file_sync_pending: true,
            },
          ],
        },
      ],
      binaryPayloadById: new Map([
        ['fl1', Buffer.from('ppg\n')],
        ['fl3', Buffer.from('hr\n')],
      ]),
      freeLivingDiaryCsv:
        'public_identifier,diary_date\nP002,2026-05-20\n',
      freeLivingSessionDate: '2026-05-20',
    });

    const paths = result.entries.map((e) => e.zipPath);
    expect(paths.some((p) => p.includes('FreeLiving') && p.includes('GW8_PrimeFreeLiving'))).toBe(
      true,
    );
    expect(paths.some((p) => p.includes('GW8_SamsungHealth'))).toBe(true);
    expect(
      paths.some((p) => p.includes('SP_SymptomsDiary/annotations.csv')),
    ).toBe(true);
  });
});
