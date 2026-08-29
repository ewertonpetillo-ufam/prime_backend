const TRANSIENT_PG_CODES = new Set([
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '57P03', // cannot_connect_now
  '08000', // connection_exception
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08003', // connection_does_not_exist
  '08006', // connection_failure
  '08004', // sqlserver_rejected_establishment_of_sqlconnection
  '53300', // too_many_connections
]);

const TRANSIENT_NODE_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

const TRANSIENT_MESSAGE_PATTERNS = [
  /connection terminated/i,
  /not yet accepting connections/i,
  /the database system is in recovery mode/i,
  /the database system is shutting down/i,
  /the database system is starting up/i,
  /sorry, too many clients already/i,
  /remaining connection slots are reserved/i,
  /server closed the connection unexpectedly/i,
  /cannot connect now/i,
  /client has encountered a connection error/i,
  /connection refused/i,
  /timeout expired/i,
];

export type PgRetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  shouldAbort?: () => boolean;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function collectErrorParts(error: unknown): { codes: string[]; messages: string[] } {
  const codes: string[] = [];
  const messages: string[] = [];
  const seen = new Set<unknown>();
  const visit = (value: unknown, depth: number) => {
    if (value == null || depth > 4 || seen.has(value)) return;
    if (typeof value === 'string') {
      messages.push(value);
      return;
    }
    if (typeof value !== 'object') return;
    seen.add(value);
    const record = value as Record<string, unknown>;
    if (typeof record.code === 'string') codes.push(record.code);
    if (typeof record.message === 'string') messages.push(record.message);
    visit(record.driverError, depth + 1);
    visit(record.original, depth + 1);
    visit(record.cause, depth + 1);
  };
  visit(error, 0);
  if (error instanceof Error && error.stack) messages.push(error.stack);
  return { codes, messages };
}

export function isTransientPgError(error: unknown): boolean {
  const { codes, messages } = collectErrorParts(error);
  if (codes.some((code) => TRANSIENT_PG_CODES.has(code) || TRANSIENT_NODE_CODES.has(code))) {
    return true;
  }
  return messages.some((message) =>
    TRANSIENT_MESSAGE_PATTERNS.some((pattern) => pattern.test(message)),
  );
}

export async function withPgRetry<T>(
  operation: () => Promise<T>,
  options: PgRetryOptions = {},
): Promise<T> {
  const retries = options.retries ?? 8;
  const baseDelayMs = options.baseDelayMs ?? 750;
  const maxDelayMs = options.maxDelayMs ?? 8_000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    if (options.shouldAbort?.()) {
      throw lastError ?? new Error('Operação abortada durante retry do PostgreSQL');
    }
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const canRetry = attempt <= retries && isTransientPgError(error);
      if (!canRetry) throw error;
      const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
