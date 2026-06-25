import { describe, it, expect } from 'vitest';
import { config } from './proxy';

describe('proxy config', () => {
  it('has matchers for admin, room and me routes', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/room/:path*',
        '/api/me/:path*',
      ])
    );
  });

  it('does not match static assets or webhook in the matcher list', () => {
    const matchers = config.matcher as string[];
    expect(matchers.some((m) => m.includes('_next/static'))).toBe(false);
    expect(matchers.some((m) => m.includes('webhook'))).toBe(false);
  });
});
