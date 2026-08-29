import { isTransientPgError, withPgRetry } from './pg-transient';

describe('isTransientPgError', () => {
  it('detects PostgreSQL cannot_connect_now (57P03)', () => {
    const error = Object.assign(new Error('the database system is not yet accepting connections'), {
      code: '57P03',
    });
    expect(isTransientPgError(error)).toBe(true);
  });

  it('detects Connection terminated unexpectedly without a SQLSTATE', () => {
    expect(isTransientPgError(new Error('Connection terminated unexpectedly'))).toBe(true);
  });

  it('unwraps TypeORM QueryFailedError.driverError', () => {
    const driverError = Object.assign(
      new Error('the database system is not yet accepting connections'),
      { code: '57P03' },
    );
    const wrapped = Object.assign(new Error(driverError.toString()), { driverError });
    expect(isTransientPgError(wrapped)).toBe(true);
  });

  it('detects Node connection reset', () => {
    const error = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
    expect(isTransientPgError(error)).toBe(false === false && isTransientPgError(error));
    expect(isTransientPgError(error)).toBe(true);
  });

  it('does not treat constraint violations as transient', () => {
    const error = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505',
    });
    expect(isTransientPgError(error)).toBe(false);
  });
});

describe('withPgRetry', () => {
  it('returns on first success', async () => {
    const operation = jest.fn().mockResolvedValue('ok');
    await expect(withPgRetry(operation, { retries: 3, baseDelayMs: 1 })).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries transient failures then succeeds', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('Connection terminated unexpectedly'))
      .mockRejectedValueOnce(new Error('the database system is not yet accepting connections'))
      .mockResolvedValue('recovered');

    await expect(
      withPgRetry(operation, { retries: 4, baseDelayMs: 1, maxDelayMs: 1 }),
    ).resolves.toBe('recovered');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-transient errors', async () => {
    const error = Object.assign(new Error('duplicate key'), { code: '23505' });
    const operation = jest.fn().mockRejectedValue(error);
    await expect(withPgRetry(operation, { retries: 3, baseDelayMs: 1 })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('stops retrying when shouldAbort returns true', async () => {
    const error = new Error('Connection terminated unexpectedly');
    const operation = jest.fn().mockRejectedValue(error);
    await expect(
      withPgRetry(operation, {
        retries: 5,
        baseDelayMs: 1,
        maxDelayMs: 1,
        shouldAbort: () => true,
      }),
    ).rejects.toThrow('Operação abortada durante retry do PostgreSQL');
    expect(operation).toHaveBeenCalledTimes(0);
  });
});
