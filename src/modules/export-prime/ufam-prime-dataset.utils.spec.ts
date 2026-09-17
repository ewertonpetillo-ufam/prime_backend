import {
  resolvePrimeZipName,
  resolveUfamBinaryTaskCode,
  ufamBinaryZipFolder,
} from './ufam-prime-dataset.utils';

describe('ufam-prime-dataset.utils', () => {
  it('resolvePrimeZipName só Free Living vira Dados_FreeLiving.zip', () => {
    expect(
      resolvePrimeZipName({ includeFreeLivingQuestionnaires: true }),
    ).toBe('Dados_FreeLiving.zip');
    expect(resolvePrimeZipName({ taskCodes: ['FL01'] })).toBe(
      'Dados_FreeLiving.zip',
    );
    expect(resolvePrimeZipName({ taskCodes: ['fl02'] })).toBe(
      'Dados_FreeLiving.zip',
    );
    expect(resolvePrimeZipName({ taskCodes: ['FL03'] })).toBe(
      'Dados_FreeLiving.zip',
    );
  });

  it('resolvePrimeZipName mistura protocolos vira Dados_Selecionados.zip', () => {
    expect(
      resolvePrimeZipName({
        includeClinicalQuestionnaires: true,
        includeFreeLivingQuestionnaires: true,
      }),
    ).toBe('Dados_Selecionados.zip');
  });

  it('ufamBinaryZipFolder coloca FL01/FL02/FL03 em FreeLiving', () => {
    expect(ufamBinaryZipFolder('FL01')).toBe('FreeLiving/FL01');
    expect(ufamBinaryZipFolder('fl02')).toBe('FreeLiving/FL02');
    expect(ufamBinaryZipFolder('FL03')).toBe('FreeLiving/FL03');
    expect(ufamBinaryZipFolder('TA1')).toBe('Active_Tasks');
  });

  it('resolveUfamBinaryTaskCode usa metadata quando não há active_task', () => {
    expect(
      resolveUfamBinaryTaskCode({
        metadata: { task_code: 'FL01' },
      }),
    ).toBe('FL01');
    expect(
      resolveUfamBinaryTaskCode({
        active_task: { task_code: 'FL02' },
        metadata: { task_code: 'FL01' },
      }),
    ).toBe('FL02');
  });
});
