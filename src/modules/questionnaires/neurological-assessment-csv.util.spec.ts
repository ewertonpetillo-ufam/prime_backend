import {
  formatMeemLanguageNaming,
  formatNeurologicalScoreCsv,
  getUdysrsQExportValues,
  UDYSRS_Q_EXPORT_FIELD_ORDER,
} from './neurological-assessment-csv.util';

describe('neurological-assessment-csv.util', () => {
  it('formatNeurologicalScoreCsv formats booleans as 0/1', () => {
    expect(formatNeurologicalScoreCsv(true)).toBe('1');
    expect(formatNeurologicalScoreCsv(false)).toBe('0');
    expect(formatNeurologicalScoreCsv(2)).toBe('2');
    expect(formatNeurologicalScoreCsv(null)).toBe('');
  });

  it('formatMeemLanguageNaming joins naming1 and naming2', () => {
    expect(
      formatMeemLanguageNaming({ language_naming1: 1, language_naming2: 0 }),
    ).toBe('1|0');
  });

  it('getUdysrsQExportValues maps semantic fields to 28 columns', () => {
    const values = getUdysrsQExportValues({
      on_dyskinesia_time: 3,
      impact_speech: 2,
      historical_subscore: 10,
      objective_subscore: 20,
    });
    expect(values).toHaveLength(UDYSRS_Q_EXPORT_FIELD_ORDER.length);
    expect(values[0]).toBe('3');
    expect(values[1]).toBe('2');
    expect(values[26]).toBe('10');
    expect(values[27]).toBe('20');
  });
});
