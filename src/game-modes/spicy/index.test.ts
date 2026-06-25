import { describe, it, expect } from 'vitest';
import { spicyEngine } from './index';

describe('spicyEngine.calculateScores', () => {
  it('gives 2 points to minority camp and 1 to majority', () => {
    const responses = [
      { playerId: 'p1', answer: 'A', timeSpentMs: 1000 },
      { playerId: 'p2', answer: 'A', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'B', timeSpentMs: 1000 },
    ];
    const scores = spicyEngine.calculateScores(responses, {});
    const p3 = scores.find((s) => s.playerId === 'p3');
    expect(p3?.pointsEarned).toBe(2);
  });

  it('gives 0 points to skipped answers', () => {
    const responses = [
      { playerId: 'p1', answer: 'A', timeSpentMs: 1000 },
      { playerId: 'p2', answer: '__SKIP__', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'A', timeSpentMs: 1000 },
    ];
    const scores = spicyEngine.calculateScores(responses, {});
    const p2 = scores.find((s) => s.playerId === 'p2');
    expect(p2?.pointsEarned).toBe(0);
    expect(p2?.isCorrect).toBe(false);
  });
});
