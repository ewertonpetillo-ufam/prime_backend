jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
  InjectRepository: () => () => undefined,
}));

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Injectable: () => (target: unknown) => target,
  };
});

import { SamsungSyncService } from './samsung-sync.service';

describe('SamsungSyncService.resetSyncPending', () => {
  const createService = (queryImpl: jest.Mock) => {
    const service = Object.create(SamsungSyncService.prototype) as SamsungSyncService;
    Object.assign(service, {
      db: { query: queryImpl },
      normalizeFilters: (f?: Record<string, string>) => ({
        patientStart: f?.patientStart,
        patientEnd: f?.patientEnd,
        dateStart: f?.dateStart,
        dateEnd: f?.dateEnd,
      }),
      parseIdentifierRange: (raw?: string) => {
        if (!raw) return null;
        const digits = raw.replace(/\D/g, '');
        return digits ? Number(digits) : null;
      },
    });
    return service;
  };

  it('returns zero counts when no patients match', async () => {
    const query = jest.fn().mockResolvedValueOnce([]);
    const service = createService(query);
    const result = await service.resetSyncPending({ patientStart: 'P999' });
    expect(result).toEqual({ patients: 0, binary_collections: 0, pdf_reports: 0 });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('updates patients, binaries and pdfs when matches exist', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'patient-1' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'bc-1' }, { id: 'bc-2' }])
      .mockResolvedValueOnce([{ id: 'pdf-1' }]);
    const service = createService(query);
    const result = await service.resetSyncPending({});
    expect(result).toEqual({ patients: 1, binary_collections: 2, pdf_reports: 1 });
    expect(query).toHaveBeenCalledTimes(4);
  });

  it('reset clears synced_at so patients return to pending state', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'patient-1' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const service = createService(query);
    await service.resetSyncPending({});
    const updatePatientsSql = String(query.mock.calls[1][0]);
    expect(updatePatientsSql).toContain('synced_at = NULL');
  });
});
