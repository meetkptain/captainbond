import { describe, it, expect, vi } from 'vitest';
import { getPlayersByRoomWithUserId } from '../playerRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          not: vi.fn(() => ({
            data: [
              { id: 'p1', userId: 'u1', isHost: false },
              { id: 'p2', userId: 'u2', isHost: true },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('getPlayersByRoomWithUserId', () => {
  it('returns only players linked to a user', async () => {
    const players = await getPlayersByRoomWithUserId('room-1');
    expect(players).toHaveLength(2);
    expect(players[0].userId).toBe('u1');
  });
});
