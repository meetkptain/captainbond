import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordGamePlayed, getUserStats } from '../statsService';
import * as userStatsRepository from '@/lib/db/repositories/userStatsRepository';

vi.mock('@/lib/db/repositories/userStatsRepository', () => ({
  loadByUser: vi.fn(),
  createForUser: vi.fn(),
  update: vi.fn(),
  getSummaryByUser: vi.fn(),
}));

describe('statsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('returns stats when row exists', async () => {
      vi.mocked(userStatsRepository.getSummaryByUser).mockResolvedValue({
        id: '',
        totalGamesPlayed: 5,
        totalBetrayals: 1,
        currentStreak: 3,
        gamesPlayedToday: 1,
        lastPlayedAt: '2026-06-19T22:00:00.000Z',
        badges: [],
        archetypesUnlocked: [],
      });

      const stats = await getUserStats('user-1');
      expect(stats.totalGamesPlayed).toBe(5);
      expect(stats.currentStreak).toBe(3);
      expect(userStatsRepository.getSummaryByUser).toHaveBeenCalledWith('user-1');
    });

    it('returns zeros when no row exists', async () => {
      vi.mocked(userStatsRepository.getSummaryByUser).mockResolvedValue({
        id: '',
        totalGamesPlayed: 0,
        totalBetrayals: 0,
        currentStreak: 0,
        gamesPlayedToday: 0,
        lastPlayedAt: null,
        badges: [],
        archetypesUnlocked: [],
      });

      const stats = await getUserStats('user-1');
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe('recordGamePlayed', () => {
    it('creates stats row for new user', async () => {
      vi.mocked(userStatsRepository.loadByUser).mockResolvedValue(null);
      vi.mocked(userStatsRepository.createForUser).mockResolvedValue(undefined);

      const stats = await recordGamePlayed('user-1');
      expect(stats.totalGamesPlayed).toBe(1);
      expect(stats.currentStreak).toBe(1);
      expect(stats.gamesPlayedToday).toBe(1);
      expect(userStatsRepository.createForUser).toHaveBeenCalledWith('user-1', expect.objectContaining({
        totalGamesPlayed: 1,
        totalBetrayals: 0,
        currentStreak: 1,
        gamesPlayedToday: 1,
      }));
      expect(userStatsRepository.update).not.toHaveBeenCalled();
    });

    it('updates existing stats row', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      vi.mocked(userStatsRepository.loadByUser).mockResolvedValue({
        id: 'stats-1',
        totalGamesPlayed: 5,
        totalBetrayals: 0,
        currentStreak: 2,
        gamesPlayedToday: 1,
        lastPlayedAt: yesterday,
        badges: ['first_game'],
        archetypesUnlocked: [],
      });
      vi.mocked(userStatsRepository.update).mockResolvedValue(undefined);

      const stats = await recordGamePlayed('user-1');
      expect(stats.totalGamesPlayed).toBe(6);
      expect(stats.currentStreak).toBe(3);
      expect(userStatsRepository.update).toHaveBeenCalledWith('stats-1', expect.objectContaining({
        totalGamesPlayed: 6,
        currentStreak: 3,
      }));
      expect(userStatsRepository.createForUser).not.toHaveBeenCalled();
    });
  });
});
