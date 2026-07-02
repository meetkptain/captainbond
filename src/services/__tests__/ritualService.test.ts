import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isRitualDay,
  pickIntensity,
  getTodayNoon,
  generateRitualForCouple,
} from '@/services/ritualService';
import * as dailyQuestionRepository from '@/lib/db/repositories/dailyQuestionRepository';
import * as cycleRepository from '@/lib/db/repositories/coupleThemeCycleRepository';
import { pickQuestionForTheme } from '@/lib/db/repositories';
import type { DailyQuestion, Couple } from '@/lib/db/types';
import type { RitualQuestion } from '@/lib/db/repositories';

vi.mock('@/lib/db/repositories/dailyQuestionRepository', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/repositories/dailyQuestionRepository')>(
    '@/lib/db/repositories/dailyQuestionRepository'
  );
  return {
    ...actual,
    createDailyQuestion: vi.fn(),
    getCurrentRitual: vi.fn(),
    listRecentRituals: vi.fn(),
  };
});

vi.mock('@/lib/db/repositories/coupleThemeCycleRepository', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/repositories/coupleThemeCycleRepository')>(
    '@/lib/db/repositories/coupleThemeCycleRepository'
  );
  return {
    ...actual,
    getCoupleThemeCycle: vi.fn(),
    createCoupleThemeCycle: vi.fn(),
    advanceCoupleThemeCycle: vi.fn(),
  };
});

vi.mock('@/lib/db/repositories', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/repositories')>('@/lib/db/repositories');
  return {
    ...actual,
    pickQuestionForTheme: vi.fn(),
  };
});

describe('ritualService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRitualDay', () => {
    it('returns true for Monday', () => {
      expect(isRitualDay(new Date('2026-07-06'))).toBe(true); // Monday
    });
    it('returns true for Wednesday', () => {
      expect(isRitualDay(new Date('2026-07-08'))).toBe(true); // Wednesday
    });
    it('returns true for Friday', () => {
      expect(isRitualDay(new Date('2026-07-10'))).toBe(true); // Friday
    });
    it('returns false for Sunday', () => {
      expect(isRitualDay(new Date('2026-07-05'))).toBe(false); // Sunday
    });
  });

  describe('pickIntensity', () => {
    it('caps at 2 after an intensity-3 ritual', () => {
      const recent = [{ intensity: 3 }] as DailyQuestion[];
      expect(pickIntensity(recent)).toBe(2);
    });

    it('returns a valid intensity when no recent ritual', () => {
      const intensity = pickIntensity([]);
      expect([1, 2, 3]).toContain(intensity);
    });
  });

  describe('getTodayNoon', () => {
    it('returns a date whose time in the target timezone is noon', () => {
      const result = getTodayNoon('Europe/Paris');
      const hourInParis = Number(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Europe/Paris',
          hour: 'numeric',
          hour12: false,
        }).format(result)
      );
      expect(hourInParis).toBe(12);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('generateRitualForCouple', () => {
    it('throws on non-ritual days', async () => {
      const couple: Couple = { id: 'c1', user1Id: 'u1', user2Id: 'u2', timezone: 'Europe/Paris' };
      await expect(generateRitualForCouple(couple, new Date('2026-07-05'))).rejects.toThrow(
        'Today is not a ritual day'
      );
    });

    it('returns existing ritual if already generated today', async () => {
      const couple: Couple = { id: 'c1', user1Id: 'u1', user2Id: 'u2', timezone: 'Europe/Paris' };
      const existing: DailyQuestion = {
        id: 'dq1',
        coupleId: 'c1',
        isAnswered: false,
        user1Answered: false,
        user2Answered: false,
        isRevealed: false,
        analysisStatus: 'PENDING',
        isSkipped: false,
        isSafeZoneActive: false,
        intensity: 1,
        theme: 'RECONNECTION',
      };

      vi.mocked(dailyQuestionRepository.getCurrentRitual).mockResolvedValue(existing);

      const result = await generateRitualForCouple(couple, new Date('2026-07-06'));
      expect(result.id).toBe('dq1');
      expect(dailyQuestionRepository.createDailyQuestion).not.toHaveBeenCalled();
    });

    it('advances theme cycle before creating Mondays ritual', async () => {
      const couple: Couple = { id: 'c1', user1Id: 'u1', user2Id: 'u2', timezone: 'Europe/Paris' };
      const cycle = {
        id: 'cycle1',
        coupleId: 'c1',
        currentTheme: 'RECONNECTION',
        weekNumber: 1,
        startedAt: '',
        updatedAt: '',
      };
      const advancedCycle = {
        ...cycle,
        weekNumber: 2,
        currentTheme: 'COMMUNICATION',
      };
      const created: DailyQuestion = {
        id: 'dq2',
        coupleId: 'c1',
        isAnswered: false,
        user1Answered: false,
        user2Answered: false,
        isRevealed: false,
        analysisStatus: 'PENDING',
        isSkipped: false,
        isSafeZoneActive: false,
        intensity: 1,
        theme: 'COMMUNICATION',
      };
      const question: RitualQuestion = {
        id: 'q1',
        text: 'Question 1',
        intensityLevel: 1,
        suggestedAction: 'Action',
        therapistGuide: 'Guide',
      };

      vi.mocked(dailyQuestionRepository.getCurrentRitual).mockResolvedValue(null);
      vi.mocked(cycleRepository.getCoupleThemeCycle).mockResolvedValue(cycle);
      vi.mocked(dailyQuestionRepository.listRecentRituals).mockResolvedValue([]);
      vi.mocked(dailyQuestionRepository.createDailyQuestion).mockResolvedValue(created);
      vi.mocked(cycleRepository.advanceCoupleThemeCycle).mockResolvedValue(advancedCycle);
      vi.mocked(pickQuestionForTheme).mockResolvedValue(question);

      const result = await generateRitualForCouple(couple, new Date('2026-07-06'));
      expect(result.id).toBe('dq2');
      expect(cycleRepository.advanceCoupleThemeCycle).toHaveBeenCalledWith(cycle);
      expect(dailyQuestionRepository.createDailyQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'COMMUNICATION' })
      );
    });

    it('does not advance theme cycle on Wednesday or Friday', async () => {
      const couple: Couple = { id: 'c1', user1Id: 'u1', user2Id: 'u2', timezone: 'Europe/Paris' };
      const cycle = {
        id: 'cycle1',
        coupleId: 'c1',
        currentTheme: 'RECONNECTION',
        weekNumber: 1,
        startedAt: '',
        updatedAt: '',
      };
      const created: DailyQuestion = {
        id: 'dq3',
        coupleId: 'c1',
        isAnswered: false,
        user1Answered: false,
        user2Answered: false,
        isRevealed: false,
        analysisStatus: 'PENDING',
        isSkipped: false,
        isSafeZoneActive: false,
        intensity: 1,
        theme: 'RECONNECTION',
      };
      const question: RitualQuestion = {
        id: 'q1',
        text: 'Question 1',
        intensityLevel: 1,
        suggestedAction: 'Action',
        therapistGuide: 'Guide',
      };

      vi.mocked(dailyQuestionRepository.getCurrentRitual).mockResolvedValue(null);
      vi.mocked(cycleRepository.getCoupleThemeCycle).mockResolvedValue(cycle);
      vi.mocked(dailyQuestionRepository.listRecentRituals).mockResolvedValue([]);
      vi.mocked(dailyQuestionRepository.createDailyQuestion).mockResolvedValue(created);
      vi.mocked(pickQuestionForTheme).mockResolvedValue(question);

      const wednesdayResult = await generateRitualForCouple(couple, new Date('2026-07-08'));
      expect(wednesdayResult.id).toBe('dq3');
      expect(cycleRepository.advanceCoupleThemeCycle).not.toHaveBeenCalled();

      vi.mocked(cycleRepository.advanceCoupleThemeCycle).mockClear();
      const fridayResult = await generateRitualForCouple(couple, new Date('2026-07-10'));
      expect(fridayResult.id).toBe('dq3');
      expect(cycleRepository.advanceCoupleThemeCycle).not.toHaveBeenCalled();
    });
  });
});
