import { describe, it, expect } from 'vitest';
import { mostLikelyToEngine } from './index';

describe('mostLikelyToEngine', () => {
  describe('validateResponse', () => {
    it('accepts an object with two different player ids', () => {
      const result = mostLikelyToEngine.validateResponse(JSON.stringify({ first: 'p1', second: 'p2' }), {});
      expect(result.isValid).toBe(true);
    });

    it('rejects identical first and second choices', () => {
      const result = mostLikelyToEngine.validateResponse(JSON.stringify({ first: 'p1', second: 'p1' }), {});
      expect(result.isValid).toBe(false);
    });

    it('rejects an answer missing second choice', () => {
      const result = mostLikelyToEngine.validateResponse(JSON.stringify({ first: 'p1' }), {});
      expect(result.isValid).toBe(false);
    });
  });

  describe('calculateScores', () => {
    it('awards a point to voters who picked a winner', () => {
      const responses = [
        { playerId: 'v1', answer: JSON.stringify({ first: 'p2', second: 'p3' }), timeSpentMs: 1000 },
        { playerId: 'v2', answer: JSON.stringify({ first: 'p2', second: 'p1' }), timeSpentMs: 1000 },
        { playerId: 'v3', answer: JSON.stringify({ first: 'p3', second: 'p1' }), timeSpentMs: 1000 },
      ];
      const scores = mostLikelyToEngine.calculateScores(responses, {});
      // p2 = 3+3 = 6, p3 = 1+3 = 4, p1 = 1
      // winners = {p2}
      expect(scores.find((s) => s.playerId === 'v1')?.pointsEarned).toBe(1);
      expect(scores.find((s) => s.playerId === 'v2')?.pointsEarned).toBe(1);
      expect(scores.find((s) => s.playerId === 'v3')?.pointsEarned).toBe(0);
    });

    it('awards no points when answer is skipped', () => {
      const responses = [
        { playerId: 'v1', answer: '__SKIP__', timeSpentMs: 1000 },
        { playerId: 'v2', answer: JSON.stringify({ first: 'p2', second: 'p1' }), timeSpentMs: 1000 },
      ];
      const scores = mostLikelyToEngine.calculateScores(responses, {});
      expect(scores.find((s) => s.playerId === 'v1')?.pointsEarned).toBe(0);
      expect(scores.find((s) => s.playerId === 'v2')?.pointsEarned).toBe(1);
    });
  });
});
