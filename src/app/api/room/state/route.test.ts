import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { AppError } from '@/lib/errors';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';
import { getRoomState } from '@/services/roomService';

vi.mock('@/lib/auth/player-session', () => ({
  getAuthenticatedPlayer: vi.fn(),
}));

vi.mock('@/lib/db/repositories', () => ({
  getRoomByCode: vi.fn(),
}));

vi.mock('@/services/roomService', () => ({
  getRoomState: vi.fn(),
}));

describe('GET /api/room/state', () => {
  it('rejects unauthenticated requests (401)', async () => {
    vi.mocked(getAuthenticatedPlayer).mockRejectedValueOnce(
      new AppError('UNAUTHORIZED', 'Session joueur manquante')
    );

    const req = new NextRequest('http://localhost/api/room/state?roomCode=ABCD', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 if the room does not exist', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId: 'player-1',
      roomId: 'room-1',
      fromCookie: true,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost/api/room/state?roomCode=ABCD', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 403 if the player does not belong to the requested room', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId: 'player-1',
      roomId: 'room-1', // Player belongs to room-1
      fromCookie: true,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce({
      id: 'room-2', // Requested room is room-2
      code: 'ABCD',
    } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);


    const req = new NextRequest('http://localhost/api/room/state?roomCode=ABCD', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with room state when authorized', async () => {
    vi.mocked(getAuthenticatedPlayer).mockResolvedValueOnce({
      playerId: 'player-1',
      roomId: 'room-1',
      fromCookie: true,
    });
    vi.mocked(getRoomByCode).mockResolvedValueOnce({
      id: 'room-1',
      code: 'ABCD',
    } as unknown as Awaited<ReturnType<typeof getRoomByCode>>);
    vi.mocked(getRoomState).mockResolvedValueOnce({
      room: { id: 'room-1', code: 'ABCD', status: 'WAITING' },
      players: [],
    } as unknown as Awaited<ReturnType<typeof getRoomState>>);

    const req = new NextRequest('http://localhost/api/room/state?roomCode=ABCD', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.room.id).toBe('room-1');
  });
});
