import { describe, it, expect, vi } from 'vitest';
import { withRetry, dbRetry } from './withRetry';

describe('withRetry', () => {
  it('returns the result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('not found'));
    await expect(withRetry(fn, { maxRetries: 3, baseDelayMs: 1 })).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws the last error when retries are exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('temporary failure'));
    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow('temporary failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects a custom retryable predicate', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('custom'));
    await expect(
      withRetry(fn, {
        maxRetries: 1,
        baseDelayMs: 1,
        retryable: (err) => err instanceof Error && err.message === 'custom',
      })
    ).rejects.toThrow('custom');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('dbRetry', () => {
  it('returns data/error shape from a Supabase-like query', async () => {
    const result = await dbRetry<{ id: string }>(async () => ({
      data: { id: '123' },
      error: null,
    }));
    expect(result.data).toEqual({ id: '123' });
    expect(result.error).toBeNull();
  });

  it('retries on retryable errors', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('connection lost'))
      .mockResolvedValue({ data: { id: 'abc' }, error: null });

    const result = await dbRetry<{ id: string }>(fn, { maxRetries: 2, baseDelayMs: 1 });
    expect(result.data).toEqual({ id: 'abc' });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
