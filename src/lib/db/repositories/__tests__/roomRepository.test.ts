import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateRoomWithStatusGuard } from '../roomRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'room-1', status: 'PLAYING' }, error: null }),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('updateRoomWithStatusGuard', () => {
  it('updates a room only if it has the required status', async () => {
    const room = await updateRoomWithStatusGuard('room-1', { status: 'PLAYING' }, 'WAITING');
    expect(room.status).toBe('PLAYING');
    expect(supabaseAdmin.from).toHaveBeenCalledWith('Room');
  });
});
