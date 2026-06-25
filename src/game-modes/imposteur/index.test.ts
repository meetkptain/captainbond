import { describe, it, expect } from 'vitest';
import { imposteurEngine } from './index';

function statements(lieIndex: number) {
  return [
    { text: 'Vérité 1', isLie: false },
    { text: 'Vérité 2', isLie: false },
    { text: 'Mensonge', isLie: true },
  ].map((s, i) => ({ ...s, isLie: i === lieIndex }));
}

describe('imposteurEngine', () => {
  describe('validateResponse', () => {
    it('accepts a submission of 3 statements', () => {
      const answer = JSON.stringify(statements(2));
      const result = imposteurEngine.validateResponse(answer, {});
      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.parsedAnswer)).toBe(true);
    });

    it('rejects a submission with fewer than 3 statements', () => {
      const result = imposteurEngine.validateResponse(JSON.stringify([{ text: 'a', isLie: false }]), {});
      expect(result.isValid).toBe(false);
    });

    it('rejects an empty answer', () => {
      const result = imposteurEngine.validateResponse('', {});
      expect(result.isValid).toBe(false);
    });

    it('accepts __SKIP__', () => {
      const result = imposteurEngine.validateResponse('__SKIP__', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateScores', () => {
    it('awards bluffeur 2 points when nobody finds the lie', () => {
      const responses = [
        { playerId: 'p1', answer: statements(2), timeSpentMs: 1000 },
        { playerId: 'p2', answer: statements(2), timeSpentMs: 1000 },
      ];
      const scores = imposteurEngine.calculateScores(responses, {}, { detections: {} });
      const p1 = scores.find((s) => s.playerId === 'p1');
      expect(p1?.pointsEarned).toBe(2);
      expect(p1?.isCorrect).toBe(true);
    });

    it('awards detector 1 point when they find the lie', () => {
      const responses = [
        { playerId: 'p1', answer: statements(2), timeSpentMs: 1000 },
        { playerId: 'p2', answer: statements(2), timeSpentMs: 1000 },
        { playerId: 'p3', answer: statements(2), timeSpentMs: 1000 },
      ];
      const detections = {
        p1: { p2: 2 },
      };
      const scores = imposteurEngine.calculateScores(responses, {}, { detections });
      // p2 gagne +1 pour avoir détecté p1, et +2 car personne n'a trouvé son propre mensonge.
      expect(scores.find((s) => s.playerId === 'p2')?.pointsEarned).toBe(3);
      expect(scores.find((s) => s.playerId === 'p1')?.pointsEarned).toBe(0);
    });

    it('ignores self-detection', () => {
      const responses = [
        { playerId: 'p1', answer: statements(2), timeSpentMs: 1000 },
        { playerId: 'p2', answer: statements(2), timeSpentMs: 1000 },
      ];
      const detections = {
        p1: { p1: 2 },
      };
      const scores = imposteurEngine.calculateScores(responses, {}, { detections });
      expect(scores.find((s) => s.playerId === 'p1')?.pointsEarned).toBe(2);
    });

    it('awards each correct detector and denies bluffeur when multiple find the lie', () => {
      const responses = [
        { playerId: 'p1', answer: statements(1), timeSpentMs: 1000 },
        { playerId: 'p2', answer: statements(1), timeSpentMs: 1000 },
        { playerId: 'p3', answer: statements(1), timeSpentMs: 1000 },
      ];
      const detections = {
        p1: { p2: 1, p3: 1 },
      };
      const scores = imposteurEngine.calculateScores(responses, {}, { detections });
      // p2 et p3 gagnent +1 pour avoir détecté p1, et +2 car leurs propres mensonges ne sont pas trouvés.
      expect(scores.find((s) => s.playerId === 'p2')?.pointsEarned).toBe(3);
      expect(scores.find((s) => s.playerId === 'p3')?.pointsEarned).toBe(3);
      expect(scores.find((s) => s.playerId === 'p1')?.pointsEarned).toBe(0);
    });

    it('awards bluff points when a wrong detection is made', () => {
      const responses = [
        { playerId: 'p1', answer: statements(0), timeSpentMs: 1000 },
        { playerId: 'p2', answer: statements(1), timeSpentMs: 1000 },
      ];
      const scores = imposteurEngine.calculateScores(responses, {}, { detections: { p1: { p2: 99 } } });
      // p2 voted wrong index, so gets no detection point
      expect(scores.find((s) => s.playerId === 'p2')?.pointsEarned).toBe(2);
    });
  });
});
