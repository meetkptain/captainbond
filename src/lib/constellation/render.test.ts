import { describe, it, expect } from 'vitest';
import { starColor, lineAlpha } from './render';

describe('render helpers', () => {
  it('maps category to an hsl color string', () => {
    expect(starColor('DEEP')).toMatch(/^hsl/);
    expect(starColor('UNKNOWN')).toMatch(/^hsl/); // falls back, no throw
  });
  it('scales line alpha by resonance (higher resonance = more opaque)', () => {
    expect(lineAlpha(1)).toBeGreaterThan(lineAlpha(0.2));
    expect(lineAlpha(0)).toBeCloseTo(0.15, 5);
    expect(lineAlpha(2)).toBeCloseTo(1, 5); // clamps at 1
  });
});
