import { describe, it, expect } from 'vitest';
import { safeJsonParse, safeJsonParseRecord } from './json';

describe('json helpers', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('not json', { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback on null/undefined input', () => {
    expect(safeJsonParse(null, [])).toEqual([]);
    expect(safeJsonParse(undefined, [])).toEqual([]);
  });

  it('parses records', () => {
    expect(safeJsonParseRecord('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns null for non-object JSON', () => {
    expect(safeJsonParseRecord('[1,2,3]')).toBeNull();
    expect(safeJsonParseRecord('"string"')).toBeNull();
  });
});
