import { describe, it, expect } from 'vitest';
import { icebreakerEngine } from './index';

describe('icebreakerEngine.calculateScores', () => {
  it('awards point to players who voted for the most voted target', () => {
    const responses = [
      { playerId: 'p1', answer: 'p3', timeSpentMs: 1000 },
      { playerId: 'p2', answer: 'p3', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'p1', timeSpentMs: 1000 },
    ];
    const scores = icebreakerEngine.calculateScores(responses, {});
    const p1 = scores.find((s) => s.playerId === 'p1');
    expect(p1?.pointsEarned).toBe(1);
    expect(p1?.isCorrect).toBe(true);
  });

  it('ignores skipped answers and gives them zero points', () => {
    const responses = [
      { playerId: 'p1', answer: 'p3', timeSpentMs: 1000 },
      { playerId: 'p2', answer: '__SKIP__', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'p1', timeSpentMs: 1000 },
    ];
    const scores = icebreakerEngine.calculateScores(responses, {});
    const p2 = scores.find((s) => s.playerId === 'p2');
    expect(p2?.pointsEarned).toBe(0);
    expect(p2?.isCorrect).toBe(false);
  });
});
