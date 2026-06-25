import { describe, it, expect, vi } from 'vitest';
import { createLogger, sanitizeValue } from './logger';

describe('sanitizeValue', () => {
  it('redacts sensitive keys', () => {
    expect(sanitizeValue('password', 'secret123')).toBe('[REDACTED]');
    expect(sanitizeValue('Authorization', 'Bearer token')).toBe('[REDACTED]');
    expect(sanitizeValue('stripe-signature', 'sig')).toBe('[REDACTED]');
  });

  it('keeps non-sensitive values unchanged', () => {
    expect(sanitizeValue('userId', '123')).toBe('123');
    expect(sanitizeValue('count', 42)).toBe(42);
  });

  it('marks empty sensitive values as empty', () => {
    expect(sanitizeValue('token', '')).toBe('[EMPTY]');
  });
});

describe('createLogger', () => {
  it('logs messages with context', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createLogger({ requestId: 'req-1' });
    logger.info('Test message', { foo: 'bar' });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('[INFO] Test message');
    expect(output).toContain('req-1');
    expect(output).toContain('bar');

    consoleSpy.mockRestore();
  });

  it('child logger merges context', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const parent = createLogger({ requestId: 'req-1' });
    const child = parent.child({ route: '/api/test' });
    child.debug('Child message');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('req-1');
    expect(output).toContain('/api/test');

    consoleSpy.mockRestore();
  });
});
