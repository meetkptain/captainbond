export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function isLevelEnabled(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL];
}

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'stripe-signature',
  'x-real-ip',
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return Array.from(SENSITIVE_KEYS).some((sensitive) => lower.includes(sensitive));
}

export function sanitizeValue(key: string, value: unknown): unknown {
  if (isSensitiveKey(key)) {
    return typeof value === 'string' && value.length === 0 ? '[EMPTY]' : '[REDACTED]';
  }
  return value;
}

function sanitizeContext(ctx: LogContext): LogContext {
  const result: LogContext = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (value === undefined) continue;
    result[key] = sanitizeValue(key, value);
  }
  return result;
}

function formatError(error: unknown): Record<string, unknown> | undefined {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      ...(error.stack ? { errorStack: error.stack } : {}),
    };
  }
  if (error !== undefined && error !== null) {
    return { error: String(error) };
  }
  return undefined;
}

function log(level: LogLevel, message: string, ctx?: LogContext, error?: unknown) {
  if (!isLevelEnabled(level)) return;

  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    service: 'koze',
    ...(ctx ? sanitizeContext(ctx) : {}),
    ...(formatError(error) || {}),
  };

  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  } else {
    const ctxString = ctx ? ` ${JSON.stringify(sanitizeContext(ctx))}` : '';
    const errorString = error instanceof Error ? ` | ${error.message}` : '';
    // eslint-disable-next-line no-console
    console.log(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}${ctxString}${errorString}`);
  }
}

export interface Logger {
  debug(message: string, ctx?: LogContext): void;
  info(message: string, ctx?: LogContext): void;
  warn(message: string, ctx?: LogContext, error?: unknown): void;
  error(message: string, ctx?: LogContext, error?: unknown): void;
  child(ctx: LogContext): Logger;
}

export function createLogger(ctx: LogContext = {}): Logger {
  return {
    debug: (message: string, extra?: LogContext) => log('debug', message, { ...ctx, ...extra }),
    info: (message: string, extra?: LogContext) => log('info', message, { ...ctx, ...extra }),
    warn: (message: string, extra?: LogContext, error?: unknown) =>
      log('warn', message, { ...ctx, ...extra }, error),
    error: (message: string, extra?: LogContext, error?: unknown) =>
      log('error', message, { ...ctx, ...extra }, error),
    child: (childCtx: LogContext) => createLogger({ ...ctx, ...childCtx }),
  };
}

export const logger = createLogger();
