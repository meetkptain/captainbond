import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordGamePlayed, getUserStats } from '../statsService';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })),
  },
}));

import { supabaseAdmin } from '@/lib/supabase-admin';

describe('statsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('returns stats when row exists', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({
                data: {
                  totalGamesPlayed: 5,
                  totalBetrayals: 1,
                  currentStreak: 3,
                  gamesPlayedToday: 1,
                  lastPlayedAt: '2026-06-19T22:00:00.000Z',
                },
                error: null,
              }),
            ),
          })),
        })),
      } as never);

      const stats = await getUserStats('user-1');
      expect(stats.totalGamesPlayed).toBe(5);
      expect(stats.currentStreak).toBe(3);
    });

    it('returns zeros when no row exists', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      } as never);

      const stats = await getUserStats('user-1');
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe('recordGamePlayed', () => {
    it('creates stats row for new user', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      } as never);

      const stats = await recordGamePlayed('user-1');
      expect(stats.totalGamesPlayed).toBe(1);
      expect(stats.currentStreak).toBe(1);
      expect(stats.gamesPlayedToday).toBe(1);
    });
  });
});
