import { describe, it, expect } from 'vitest';
import { familyEngine } from './index';

describe('familyEngine', () => {
  it('rewards the player with the fewest votes', () => {
    const responses = [
      { playerId: 'p1', answer: 'p2', timeSpentMs: 1000 },
      { playerId: 'p2', answer: 'p3', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'p2', timeSpentMs: 1000 },
    ];
    const scores = familyEngine.calculateScores(responses, {});
    // p2 has 2 votes, p3 has 1 vote -> p3 wins
    expect(scores.find((s) => s.playerId === 'p3')?.pointsEarned).toBe(1);
    expect(scores.find((s) => s.playerId === 'p3')?.isCorrect).toBe(true);
    expect(scores.find((s) => s.playerId === 'p2')?.pointsEarned).toBe(0);
    expect(scores.find((s) => s.playerId === 'p1')?.pointsEarned).toBe(0);
  });

  it('ignores skipped answers', () => {
    const responses = [
      { playerId: 'p1', answer: '__SKIP__', timeSpentMs: 1000 },
      { playerId: 'p2', answer: 'p3', timeSpentMs: 1000 },
      { playerId: 'p3', answer: 'p2', timeSpentMs: 1000 },
    ];
    const scores = familyEngine.calculateScores(responses, {});
    expect(scores.find((s) => s.playerId === 'p1')?.pointsEarned).toBe(0);
    // p2 and p3 are tied with 1 vote each -> both win in inverted scoring
    expect(scores.find((s) => s.playerId === 'p2')?.pointsEarned).toBe(1);
    expect(scores.find((s) => s.playerId === 'p3')?.pointsEarned).toBe(1);
  });
});
