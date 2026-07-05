import { describe, it, expect } from 'vitest';
import { deepConnectionEngine } from './index';

describe('deepConnectionEngine', () => {
  describe('validateResponse', () => {
    it('accepts non-empty string', () => {
      const result = deepConnectionEngine.validateResponse('hello');
      expect(result.isValid).toBe(true);
      expect(result.parsedAnswer).toBe('hello');
    });

    it('rejects empty string', () => {
      const result = deepConnectionEngine.validateResponse('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('rejects whitespace-only string', () => {
      const result = deepConnectionEngine.validateResponse('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('calculateScores', () => {
    it('awards 1 point for answering, 0 for skip', () => {
      const results = deepConnectionEngine.calculateScores([
        { playerId: 'p1', answer: 'I feel vulnerable', timeSpentMs: 5000 },
        { playerId: 'p2', answer: '__SKIP__', timeSpentMs: 0 },
        { playerId: 'p3', answer: 'My deepest fear', timeSpentMs: 7000 },
      ], null as never, {} as never);

      expect(results).toHaveLength(3);
      expect(results[0].pointsEarned).toBe(1);
      expect(results[1].pointsEarned).toBe(0);
      expect(results[2].pointsEarned).toBe(1);
    });
  });
});
