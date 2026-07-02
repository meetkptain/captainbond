import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  loadByUser,
  createForUser,
  update,
  getSummaryByUser,
} from '../userStatsRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })),
  },
}));

const baseRow = {
  totalGamesPlayed: 5,
  totalBetrayals: 2,
  currentStreak: 3,
  gamesPlayedToday: 1,
  lastPlayedAt: '2026-06-19T22:00:00.000Z',
  badges: ['first_game'],
  archetypesUnlocked: ['trickster'],
};

describe('userStatsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadByUser', () => {
    it('returns mapped row when found', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: { id: 'stats-1', ...baseRow },
              error: null,
            })),
          })),
        })),
      } as never);

      const row = await loadByUser('user-1');
      expect(row).toEqual({ id: 'stats-1', ...baseRow });
      expect(supabaseAdmin.from).toHaveBeenCalledWith('UserStats');
    });

    it('returns null when not found', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      } as never);

      const row = await loadByUser('user-1');
      expect(row).toBeNull();
    });

    it('throws when supabase returns an error', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: new Error('db fail') })),
          })),
        })),
      } as never);

      await expect(loadByUser('user-1')).rejects.toThrow('db fail');
    });
  });

  describe('createForUser', () => {
    it('inserts a new row with a generated id', async () => {
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        insert: insertMock,
      } as never);

      await createForUser('user-1', baseRow);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('UserStats');
      expect(insertMock).toHaveBeenCalledTimes(1);
      const inserted = (insertMock.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
      expect(inserted.userId).toBe('user-1');
      expect(inserted.totalGamesPlayed).toBe(baseRow.totalGamesPlayed);
      expect(inserted.totalBetrayals).toBe(baseRow.totalBetrayals);
      expect(inserted.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('throws when supabase returns an error', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        insert: vi.fn(() => Promise.resolve({ error: new Error('insert fail') })),
      } as never);

      await expect(createForUser('user-1', baseRow)).rejects.toThrow('insert fail');
    });
  });

  describe('update', () => {
    it('updates an existing row by id', async () => {
      const eqMock = vi.fn(() => ({ error: null }));
      const updateMock = vi.fn(() => ({ eq: eqMock }));
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        update: updateMock,
      } as never);

      await update('stats-1', baseRow);

      expect(supabaseAdmin.from).toHaveBeenCalledWith('UserStats');
      expect(updateMock).toHaveBeenCalledTimes(1);
      expect(eqMock).toHaveBeenCalledWith('id', 'stats-1');
      const updated = (updateMock.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
      expect(updated.totalGamesPlayed).toBe(baseRow.totalGamesPlayed);
      expect(updated.updatedAt).toBeDefined();
    });

    it('throws when supabase returns an error', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => ({ error: new Error('update fail') })) })),
      } as never);

      await expect(update('stats-1', baseRow)).rejects.toThrow('update fail');
    });
  });

  describe('getSummaryByUser', () => {
    it('returns summary with empty id when row exists', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: baseRow,
              error: null,
            })),
          })),
        })),
      } as never);

      const stats = await getSummaryByUser('user-1');
      expect(stats).toEqual({ id: '', ...baseRow });
    });

    it('returns zeros when no row exists', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      } as never);

      const stats = await getSummaryByUser('user-1');
      expect(stats).toEqual({
        id: '',
        totalGamesPlayed: 0,
        totalBetrayals: 0,
        currentStreak: 0,
        gamesPlayedToday: 0,
        lastPlayedAt: null,
        badges: [],
        archetypesUnlocked: [],
      });
    });

    it('throws when supabase returns an error', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: new Error('db fail') })),
          })),
        })),
      } as never);

      await expect(getSummaryByUser('user-1')).rejects.toThrow('db fail');
    });
  });
});
