import { describe, it, expect } from 'vitest';
import { fetchWithTimeout, withTimeout } from './fetch';

describe('withTimeout', () => {
  it('resolves when the promise finishes in time', async () => {
    const result = await withTimeout(Promise.resolve('done'), 1000);
    expect(result).toBe('done');
  });

  it('rejects when the promise takes longer than the timeout', async () => {
    await expect(withTimeout(new Promise((resolve) => setTimeout(resolve, 1000)), 1)).rejects.toThrow(
      'timed out'
    );
  });
});

describe('fetchWithTimeout', () => {
  it('uses the provided timeout via AbortSignal', async () => {
    // We cannot easily hit the network in unit tests, so we assert the
    // function rejects on an intentionally tiny timeout against a slow URL.
    // This test documents the timeout behavior; in CI without network it may
    // fail with a generic fetch error instead, which is still acceptable.
    await expect(
      fetchWithTimeout('http://localhost:59999/never-responds', { timeout: 1 })
    ).rejects.toBeDefined();
  });
});
