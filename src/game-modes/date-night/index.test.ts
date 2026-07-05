import { describe, it, expect } from 'vitest';
import { DateNightMode } from './index';

describe('DateNight engine', () => {
  it('has a valid manifest', () => {
    expect(DateNightMode.manifest).toBeDefined();
    expect(DateNightMode.manifest.id).toBe('DATE_NIGHT');
    expect(DateNightMode.manifest.minPlayers).toBe(2);
    expect(DateNightMode.manifest.maxPlayers).toBe(2);
  });

  describe('validateResponse', () => {
    it('accepts any response', () => {
      const result = DateNightMode.engine.validateResponse('anything');
      expect(result.isValid).toBe(true);
      expect(result.parsedAnswer).toBe('anything');
    });
  });

  describe('calculateScores', () => {
    it('returns empty scores (non-competitive)', () => {
      const results = DateNightMode.engine.calculateScores([
        { playerId: 'p1', answer: 'I love you', timeSpentMs: 5000 },
      ], null as never, {} as never);

      expect(results).toEqual([]);
    });
  });
});
