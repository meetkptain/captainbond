import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { joinRoomRpc } from '../roomRpcRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: { rpc: vi.fn() },
}));

describe('joinRoomRpc', () => {
  it('returns the rpc result', async () => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: { player_id: 'p1', room_id: 'r1', room_code: 'CODE' },
      error: null,
    });
    const result = await joinRoomRpc({
      roomCode: 'CODE',
      playerName: 'Alice',
      playerId: 'p1',
      maxPlayers: 8,
      consentGivenAt: new Date().toISOString(),
    });
    expect(result.player_id).toBe('p1');
  });
});
