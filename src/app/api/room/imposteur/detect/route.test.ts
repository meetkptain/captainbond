import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';

vi.mock('@/lib/auth/player-session', () => ({
  getAuthenticatedPlayer: vi.fn(),
}));

vi.mock('@/lib/db/repositories', () => ({
  getRoomByCode: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    rpc: vi.fn(),
  },
}));

const playerId = '550e8400-e29b-41d4-a716-446655440000';
const targetPlayerId = '550e8400-e29b-41d4-a716-446655440001';

describe('POST /api/room/imposteur/detect', () => {
  it('rejects if target is same as source', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId,
      roomId: 'room-1',
      fromCookie: false,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce({
      id: 'room-1',
      code: 'ABCD',
    } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);

    const req = new NextRequest('http://localhost/api/room/imposteur/detect', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        playerId,
        targetPlayerId: playerId, // same
        lieIndex: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('submits detection successfully calling RPC', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId,
      roomId: 'room-1',
      fromCookie: false,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce({
      id: 'room-1',
      code: 'ABCD',
    } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({
      data: null,
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabaseAdmin.rpc>>);

    const req = new NextRequest('http://localhost/api/room/imposteur/detect', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        playerId,
        targetPlayerId,
        lieIndex: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('record_imposteur_detection', {
      p_room_id: 'room-1',
      p_target_player_id: targetPlayerId,
      p_source_player_id: playerId,
      p_lie_index: 1,
    });
  });

  it('maps RPC errors correctly', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId,
      roomId: 'room-1',
      fromCookie: false,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce({
      id: 'room-1',
      code: 'ABCD',
    } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: 'La phase de détection n\'a pas commencé', details: '', hint: '', code: '' },
    } as unknown as Awaited<ReturnType<typeof supabaseAdmin.rpc>>);

    const req = new NextRequest('http://localhost/api/room/imposteur/detect', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ABCD',
        playerId,
        targetPlayerId,
        lieIndex: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
