import { describe, it, expect } from 'vitest';
import { missionImpossibleEngine, MissionImpossibleQuestion } from './index';

describe('missionImpossibleEngine', () => {
  const mockQuestion: MissionImpossibleQuestion = {
    id: 'q-1',
    text: 'Quel est le premier client de Captain Bond ?',
    options: ['Client A', 'Client B', 'Client C'],
    correctAnswer: 'Client B',
  };

  describe('validateResponse', () => {
    it('accepts valid non-empty string answers', () => {
      const res = missionImpossibleEngine.validateResponse('Client B', mockQuestion);
      expect(res.isValid).toBe(true);
      expect(res.parsedAnswer).toBe('Client B');
    });

    it('rejects empty or whitespace answers', () => {
      const res = missionImpossibleEngine.validateResponse('   ', mockQuestion);
      expect(res.isValid).toBe(false);
      expect(res.parsedAnswer).toBeNull();
    });
  });

  describe('calculateScores', () => {
    it('awards 1 point to everyone when the majority is correct', () => {
      const responses = [
        { playerId: 'p1', answer: 'Client B', timeSpentMs: 100 },
        { playerId: 'p2', answer: 'Client B', timeSpentMs: 200 },
        { playerId: 'p3', answer: 'Client A', timeSpentMs: 150 },
      ];

      const scores = missionImpossibleEngine.calculateScores(responses, mockQuestion);
      expect(scores).toHaveLength(3);
      expect(scores[0]).toEqual({ playerId: 'p1', pointsEarned: 1, isCorrect: true });
      expect(scores[1]).toEqual({ playerId: 'p2', pointsEarned: 1, isCorrect: true });
      expect(scores[2]).toEqual({ playerId: 'p3', pointsEarned: 1, isCorrect: true });
    });

    it('awards 0 points when the majority is incorrect', () => {
      const responses = [
        { playerId: 'p1', answer: 'Client A', timeSpentMs: 100 },
        { playerId: 'p2', answer: 'Client A', timeSpentMs: 200 },
        { playerId: 'p3', answer: 'Client B', timeSpentMs: 150 },
      ];

      const scores = missionImpossibleEngine.calculateScores(responses, mockQuestion);
      expect(scores).toHaveLength(3);
      expect(scores.every((s) => s.pointsEarned === 0 && !s.isCorrect)).toBe(true);
    });

    it('awards participation points if no correctAnswer is specified', () => {
      const responses = [
        { playerId: 'p1', answer: 'Client A', timeSpentMs: 100 },
        { playerId: 'p2', answer: 'Client B', timeSpentMs: 200 },
      ];

      const scores = missionImpossibleEngine.calculateScores(responses, {
        id: 'q-no-ans',
        text: 'Question without answer',
      });
      expect(scores).toHaveLength(2);
      expect(scores.every((s) => s.pointsEarned === 1 && s.isCorrect)).toBe(true);
    });

    it('handles empty responses list', () => {
      const scores = missionImpossibleEngine.calculateScores([], mockQuestion);
      expect(scores).toHaveLength(0);
    });
  });
});
