import { describe, it, expect } from 'vitest';
import {
  EMERGENCY_TRUTHS,
  EMERGENCY_LIES,
  pickTwoDistinct,
  pickRandomLie,
} from './emergencyCards';

describe('emergencyCards', () => {
  describe('pickTwoDistinct', () => {
    it('returns two different items from the array', () => {
      const [a, b] = pickTwoDistinct(EMERGENCY_TRUTHS);
      expect(a).not.toBe(b);
      expect(EMERGENCY_TRUTHS).toContain(a);
      expect(EMERGENCY_TRUTHS).toContain(b);
    });

    it('throws if fewer than 2 items', () => {
      expect(() => pickTwoDistinct([])).toThrow();
      expect(() => pickTwoDistinct(['only one'])).toThrow();
    });
  });

  describe('pickRandomLie', () => {
    it('returns a string from the lies array', () => {
      const lie = pickRandomLie(EMERGENCY_LIES);
      expect(typeof lie).toBe('string');
      expect(EMERGENCY_LIES).toContain(lie);
    });

    it('throws if empty array', () => {
      expect(() => pickRandomLie([])).toThrow();
    });
  });
});
