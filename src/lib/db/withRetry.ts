export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryable?: (error: unknown) => boolean;
}

const defaultRetryable = (error: unknown): boolean => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('temporary') ||
      msg.includes('connection') ||
      msg.includes('network') ||
      msg.includes('rate limit') ||
      msg.includes('econnreset') ||
      msg.includes('503') ||
      msg.includes('504')
    );
  }
  return false;
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 100,
    maxDelayMs = 5000,
    retryable = defaultRetryable,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries || !retryable(error)) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Convenience helper for Supabase-style queries that return `{ data, error }`.
 * The function argument is intentionally `Promise<any>` because the generated
 * Supabase client types are not configured in this project, while the caller
 * provides the expected data shape via the generic `T`.
 */
export interface DbResult<T> {
  data: T | null;
  error: unknown | null;
}

export async function dbRetry<T>(
  fn: () => Promise<DbResult<unknown>>,
  options?: RetryOptions
): Promise<DbResult<T>> {
  const result = await withRetry(fn, options);
  return {
    data: result.data as T | null,
    error: result.error,
  };
}
