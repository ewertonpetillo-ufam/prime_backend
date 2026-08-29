jest.mock('p-limit', () => () => (fn: (...args: unknown[]) => unknown) => fn());

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

jest.mock('../../common/database/pg-transient', () => {
  const actual = jest.requireActual('../../common/database/pg-transient');
  return {
    ...actual,
    withPgRetry: (
      operation: () => Promise<unknown>,
      options?: { retries?: number; onRetry?: (...args: unknown[]) => void },
    ) =>
      actual.withPgRetry(operation, {
        ...options,
        retries: options?.retries ?? 3,
        baseDelayMs: 1,
        maxDelayMs: 1,
      }),
  };
});

jest.mock('./samsung-dataset.utils', () => {
  const actual = jest.requireActual('./samsung-dataset.utils');
  return {
    ...actual,
    cleanupSamsungSyncTempDir: jest.fn().mockResolvedValue(undefined),
    isDeliveryZipReady: jest.fn().mockResolvedValue(false),
  };
});

import { SamsungSyncService } from './samsung-sync.service';
import { SamsungSyncRunStatus } from '../../entities/samsung-sync-run.entity';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { cleanupSamsungSyncTempDir, isDeliveryZipReady } from './samsung-dataset.utils';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    const updatePdfsSql = String(query.mock.calls[3][0]);
    expect(updatePdfsSql).toContain('pdf_report_is_samsung_psg_laudo_excluded');
  });
});

describe('SamsungSyncService.getPendingPatients', () => {
  const createService = (queryImpl: jest.Mock) => {
    const service = Object.create(SamsungSyncService.prototype) as any;
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

  it('does not select csv_data / encode BYTEA in the pending patients query', async () => {
    const query = jest.fn().mockResolvedValueOnce([
      {
        id: 'patient-1',
        full_name: 'Test',
        public_identifier: 'P001',
        sync_version: '1',
        sync_pending_at: null,
        synced_at: null,
        files: [
          {
            id: 'bc-1',
            patient_cpf_hash: 'hash',
            metadata: {},
            file_hash: null,
            file_sync_pending: true,
            deleted_pending: false,
            collected_at: null,
          },
        ],
      },
    ]);
    const service = createService(query);
    const rows = await service.getPendingPatients({});
    const sql = String(query.mock.calls[0][0]);
    expect(sql).not.toMatch(/csv_data/i);
    expect(sql).not.toMatch(/encode\s*\(/i);
    expect(sql).toContain('pdf_report_is_samsung_psg_laudo_excluded');
    expect(rows).toHaveLength(1);
    expect(rows[0].files).toHaveLength(1);
    expect(rows[0].files[0]).not.toHaveProperty('csv_data');
  });
});

describe('SamsungSyncService.recoverStaleRuns', () => {
  const mockedIsDeliveryZipReady = isDeliveryZipReady as jest.MockedFunction<
    typeof isDeliveryZipReady
  >;

  beforeEach(() => {
    mockedIsDeliveryZipReady.mockReset();
    mockedIsDeliveryZipReady.mockResolvedValue(false);
    (cleanupSamsungSyncTempDir as jest.Mock).mockClear();
  });

  it('marks every RUNNING run as failed on restart', async () => {
    const find = jest.fn().mockResolvedValue([
      { id: 'run-recent', started_at: new Date(), summary: { lastHeartbeatAt: new Date().toISOString() } },
      { id: 'run-old', started_at: new Date(Date.now() - 60 * 60 * 1000), summary: {} },
    ]);
    const update = jest.fn().mockResolvedValue(undefined);
    const service = Object.create(SamsungSyncService.prototype) as any;
    Object.assign(service, {
      syncRunRepository: { find, update },
      cancelledRunIds: new Set(['run-recent']),
      runAbortControllers: new Map([['run-recent', new AbortController()]]),
      logger: { warn: jest.fn() },
    });

    await service.recoverStaleRuns();

    expect(find).toHaveBeenCalledWith({
      where: { status: SamsungSyncRunStatus.RUNNING },
    });
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(
      'run-recent',
      expect.objectContaining({
        status: SamsungSyncRunStatus.FAILED,
        error_message: 'Interrompido por reinício do servidor',
      }),
    );
    expect(update).toHaveBeenCalledWith(
      'run-old',
      expect.objectContaining({
        status: SamsungSyncRunStatus.FAILED,
      }),
    );
    expect(cleanupSamsungSyncTempDir).toHaveBeenCalledWith('run-recent');
    expect(cleanupSamsungSyncTempDir).toHaveBeenCalledWith('run-old');
    expect(service.cancelledRunIds.has('run-recent')).toBe(false);
    expect(service.runAbortControllers.has('run-recent')).toBe(false);
  });

  it('retakes BART PUT when the delivery ZIP is still on disk at step 6', async () => {
    mockedIsDeliveryZipReady.mockResolvedValue(true);
    const find = jest.fn().mockResolvedValue([
      {
        id: 'run-zip-ready',
        started_at: new Date(),
        summary: {
          currentStepIndex: 6,
          currentStep: 'Enviando ZIP para o BART',
          zipPath: 'test_api/Data/20260828.zip',
          zipName: '20260828.zip',
          deliveryDate: '20260828',
          metadataRows: [],
          patientsReadyForConfirm: ['patient-1'],
        },
      },
    ]);
    const update = jest.fn().mockResolvedValue(undefined);
    const resumeZipUpload = jest.fn().mockResolvedValue(undefined);
    const service = Object.create(SamsungSyncService.prototype) as any;
    Object.assign(service, {
      syncRunRepository: { find, update },
      cancelledRunIds: new Set(),
      runAbortControllers: new Map(),
      logger: { warn: jest.fn(), error: jest.fn(), log: jest.fn() },
      resumeZipUpload,
    });

    jest.useFakeTimers();
    await service.recoverStaleRuns();
    jest.runAllTimers();
    jest.useRealTimers();

    expect(update).not.toHaveBeenCalled();
    expect(cleanupSamsungSyncTempDir).not.toHaveBeenCalled();
    expect(resumeZipUpload).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'run-zip-ready' }),
    );
  });
});

describe('SamsungSyncService.confirmRunDelivery', () => {
  it('retries transient Postgres errors then confirms the batch', async () => {
    const query = jest
      .fn()
      .mockRejectedValueOnce(new Error('Connection terminated unexpectedly'))
      .mockResolvedValue(undefined);
    const innerQuery = jest.fn().mockResolvedValue(undefined);
    const transaction = jest.fn(async (cb: (m: { query: jest.Mock }) => Promise<void>) => {
      await cb({ query: innerQuery });
    });
    const service = Object.create(SamsungSyncService.prototype) as any;
    Object.assign(service, {
      db: { query, transaction },
      logger: { warn: jest.fn(), error: jest.fn(), log: jest.fn() },
    });

    await service.confirmRunDelivery(['patient-1']);

    expect(service.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('confirmRunDelivery: PostgreSQL transiente'),
    );
    expect(query.mock.calls.length).toBeGreaterThanOrEqual(4);
    const sqls = query.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(sqls.some((sql: string) => sql.includes('UPDATE patients'))).toBe(true);
    expect(sqls.some((sql: string) => sql.includes('UPDATE binary_collections'))).toBe(true);
    expect(sqls.some((sql: string) => sql.includes('UPDATE pdf_reports'))).toBe(true);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});

describe('getDatabaseConfig pool hardening', () => {
  it('configures keepAlive and idleTimeoutMillis without global statement_timeout', () => {
    const configService = {
      get: (key: string) => {
        const map: Record<string, string | number> = {
          DB_HOST: 'localhost',
          DB_PORT: 5432,
          DB_USERNAME: 'user',
          DB_PASSWORD: 'pass',
          DB_DATABASE: 'prime',
          NODE_ENV: 'test',
        };
        return map[key];
      },
    } as unknown as ConfigService;

    const config = getDatabaseConfig(configService);
    expect(config.extra).toEqual(
      expect.objectContaining({
        max: 20,
        connectionTimeoutMillis: 30_000,
        idleTimeoutMillis: 30_000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10_000,
      }),
    );
    expect((config.extra as { options?: string } | undefined)?.options).toBeUndefined();
  });
});

describe('binary_collections audit migration', () => {
  it('omits csv_data from audit JSON instead of row_to_json(NEW/OLD)', () => {
    const sql = readFileSync(
      join(
        __dirname,
        '../../../db/migrations/20260830_binary_collections_audit_omit_csv_data.sql',
      ),
      'utf8',
    );
    expect(sql).toContain('rec.csv_data := NULL');
    expect(sql).toContain("to_jsonb(rec) - 'csv_data'");
    expect(sql).toContain('audit_binary_collections_trigger');
    expect(sql).not.toMatch(/row_to_json\(\s*(NEW|OLD)\s*\)/);
  });
});
