import {
  applyPdfCountsToBreakdown,
  applyPdfReportToPresence,
  buildPendingUploads,
  classifyBinaryFileName,
  DeviceBreakdownCell,
  emptyPdfPresence,
  isPolysomnographyEdf,
  listMissingDeviceKinds,
  pdfFilesTotal,
  reconcileBreakdownWithTaskTotal,
  resolveTaskCode,
  riskFromDays,
} from './device-upload-status.utils';

describe('device-upload-status.utils', () => {
  const createdFiveDaysAgo = new Date('2026-08-15T12:00:00.000Z');
  const nowMs = Date.parse('2026-08-20T12:00:00.000Z');

  describe('classifyBinaryFileName', () => {
    it('classifica pelo nome mesmo com maiúsculas e variações', () => {
      expect(classifyBinaryFileName('Paciente_Baiobit_TA5.csv', 'TA5')).toBe(
        'baiobit',
      );
      expect(classifyBinaryFileName('BIOBIT-relatorio.pdf', 'TA5')).toBe(
        'baiobit',
      );
      expect(classifyBinaryFileName('Trigno_EMG_TA14.csv', 'TA14')).toBe(
        'delsys',
      );
      expect(classifyBinaryFileName('sono.edf', 'TA13')).toBe('edf');
    });

    it('usa device_type quando o nome do arquivo está vazio', () => {
      expect(
        classifyBinaryFileName('', 'TA5', { deviceType: 'Baiobit' }),
      ).toBe('baiobit');
      expect(
        classifyBinaryFileName('', 'TA14', { deviceType: 'Delsys EMG' }),
      ).toBe('delsys');
    });

    it('conta arquivo sem nome nas TAs de dispositivo como csv', () => {
      expect(classifyBinaryFileName('', 'TA5')).toBe('csv');
      expect(classifyBinaryFileName('gravacao.bin', 'TA14')).toBe('csv');
      expect(classifyBinaryFileName('sono.wav', 'TA13')).toBe('csv');
    });

    it('reconhece EDF pelo mime mesmo sem extensão', () => {
      expect(
        classifyBinaryFileName('exame_sono', 'TA13', {
          mimeType: 'application/edf',
        }),
      ).toBe('edf');
    });
  });

  describe('applyPdfReportToPresence', () => {
    it('marca BIOBIT/DELSYS/POLYSOMNOGRAPHY pelo report_type', () => {
      const flags = emptyPdfPresence();
      applyPdfReportToPresence(flags, 'BIOBIT', 'qualquer.pdf');
      applyPdfReportToPresence(flags, 'DELSYS', 'emg.pdf');
      applyPdfReportToPresence(flags, 'POLYSOMNOGRAPHY', 'laudo.pdf');
      expect(flags).toEqual({
        hasBaiobitPdf: true,
        hasDelsysPdf: true,
        hasPolysomnographyPdf: true,
        hasPolysomnographyEdf: false,
        baiobitPdfCount: 1,
        delsysPdfCount: 1,
        psgPdfCount: 1,
        psgEdfCount: 0,
      });
    });

    it('marca EDF de polissonografia pelo nome', () => {
      const flags = emptyPdfPresence();
      applyPdfReportToPresence(
        flags,
        'POLYSOMNOGRAPHY',
        'paciente.EDF',
        'application/octet-stream',
      );
      expect(flags.hasPolysomnographyPdf).toBe(true);
      expect(flags.hasPolysomnographyEdf).toBe(true);
    });
  });

  describe('buildPendingUploads', () => {
    it('não sinaliza quando os PDFs já existem', () => {
      const pending = buildPendingUploads({
        createdAt: createdFiveDaysAgo,
        nowMs,
        countsByTask: {},
        deviceBreakdownByTask: {},
        hasPolysomnographyPdf: true,
        hasPolysomnographyEdf: false,
        hasBaiobitPdf: true,
        hasDelsysPdf: true,
      });
      expect(pending).toEqual([]);
    });

    it('não sinaliza Baiobit/Delsys quando os binários já foram classificados', () => {
      const pending = buildPendingUploads({
        createdAt: createdFiveDaysAgo,
        nowMs,
        countsByTask: { TA5: 2 },
        deviceBreakdownByTask: {
          TA5: { csv: 0, baiobit: 1, delsys: 1 },
        },
        hasPolysomnographyPdf: false,
        hasPolysomnographyEdf: false,
      });
      expect(pending.map((p) => p.kind)).toEqual([]);
    });

    it('sinaliza ausência só do que realmente falta', () => {
      const pending = buildPendingUploads({
        createdAt: createdFiveDaysAgo,
        nowMs,
        countsByTask: { TA13: 2 },
        deviceBreakdownByTask: {
          TA5: { csv: 3, baiobit: 0, delsys: 0 },
          TA13: { csv: 2, edf: 0 },
        },
        hasPolysomnographyPdf: false,
        hasPolysomnographyEdf: false,
        hasBaiobitPdf: true,
        hasDelsysPdf: false,
      });
      expect(pending.map((p) => p.kind).sort()).toEqual([
        'Delsys',
        'Polissonografo',
      ]);
      expect(pending.every((p) => p.risk === 5)).toBe(true);
    });

    it('não sinaliza Polissonógrafo quando o relatório PDF já existe', () => {
      const pending = buildPendingUploads({
        createdAt: createdFiveDaysAgo,
        nowMs,
        countsByTask: { TA13: 1 },
        deviceBreakdownByTask: { TA13: { csv: 1, edf: 0 } },
        hasPolysomnographyPdf: true,
        hasPolysomnographyEdf: false,
        hasBaiobitPdf: true,
        hasDelsysPdf: true,
      });
      expect(pending).toEqual([]);
    });

    it('lista ausências mesmo com menos de 3 dias', () => {
      expect(
        listMissingDeviceKinds({
          countsByTask: {},
          deviceBreakdownByTask: {},
          hasPolysomnographyPdf: false,
          hasPolysomnographyEdf: false,
        }).sort(),
      ).toEqual(['Baiobit', 'Delsys']);
    });

    it('não cria badge com menos de 3 dias', () => {
      expect(riskFromDays(2)).toBeNull();
      const pending = buildPendingUploads({
        createdAt: new Date(nowMs - 2 * 24 * 60 * 60 * 1000),
        nowMs,
        countsByTask: {},
        deviceBreakdownByTask: {},
        hasPolysomnographyPdf: false,
        hasPolysomnographyEdf: false,
      });
      expect(pending).toEqual([]);
    });
  });

  describe('isPolysomnographyEdf', () => {
    it('aceita extensão e mime', () => {
      expect(isPolysomnographyEdf('a.edf')).toBe(true);
      expect(isPolysomnographyEdf('a.EDF.bin')).toBe(true);
      expect(isPolysomnographyEdf('laudo.pdf', 'application/edf')).toBe(true);
      expect(isPolysomnographyEdf('laudo.pdf', 'application/pdf')).toBe(false);
    });
  });

  describe('resolveTaskCode e reconciliação', () => {
    it('usa metadata.task_code quando o task_id não mapeia', () => {
      const map = new Map<number, string>([[3, 'TA3']]);
      expect(resolveTaskCode(3, '', map)).toBe('TA3');
      expect(resolveTaskCode(null, 'TA05', map)).toBe('TA5');
      expect(resolveTaskCode('99', 'TA16', map)).toBe('TA16');
    });

    it('joga o restante da contagem da TA para Csv', () => {
      const cell = { csv: 0, baiobit: 1, delsys: 0 };
      reconcileBreakdownWithTaskTotal(cell, 12);
      expect(cell.csv).toBe(11);
      expect(cell.baiobit).toBe(1);
    });

    it('soma PDFs nas subcolunas e no total', () => {
      const flags = emptyPdfPresence();
      applyPdfReportToPresence(flags, 'BIOBIT', 'a.pdf');
      applyPdfReportToPresence(flags, 'DELSYS', 'b.pdf');
      applyPdfReportToPresence(flags, 'POLYSOMNOGRAPHY', 'c.pdf');
      const breakdown: Record<string, DeviceBreakdownCell> = {};
      applyPdfCountsToBreakdown(breakdown, flags);
      expect(breakdown.TA5?.baiobit).toBe(1);
      expect(breakdown.TA5?.delsys).toBe(1);
      expect(breakdown.TA14?.baiobit).toBe(1);
      expect(breakdown.TA13?.csv).toBe(1);
      expect(pdfFilesTotal(flags)).toBe(3);
    });
  });
});
