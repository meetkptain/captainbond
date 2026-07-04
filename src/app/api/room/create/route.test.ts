import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/services/roomService', () => ({
  createRoom: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  createRoomLimiter: undefined,
}));

import { createRoom } from '@/services/roomService';

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/room/create', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/room/create', () => {
  it('returns 400 when body is invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/room/create', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('BAD_REQUEST');
  });

  it('creates a room with default params and returns 200', async () => {
    vi.mocked(createRoom).mockResolvedValueOnce({
      room: { id: 'room-1', code: 'ABCD', hostToken: 'host-token-1', status: 'WAITING' } as never,
      hostId: 'host-1',
      hostToken: 'host-token-1',
    });

    const res = await POST(request({}));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.roomCode).toBe('ABCD');
    expect(json.roomId).toBe('room-1');
    expect(json.hostId).toBe('host-1');
    expect(json.hostToken).toBe('host-token-1');
    expect(json.status).toBe('WAITING');
    expect(createRoom).toHaveBeenCalledWith({});
  });

  it('creates a room with custom targetType, playerName and language', async () => {
    vi.mocked(createRoom).mockResolvedValueOnce({
      room: { id: 'room-2', code: 'EFGH', hostToken: 'host-token-2', status: 'PLAYING' } as never,
      hostId: 'host-2',
      hostToken: 'host-token-2',
    });

    const res = await POST(request({
      targetType: 'SOLO',
      playerName: 'Alice',
      language: 'en',
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.roomCode).toBe('EFGH');
    expect(json.roomId).toBe('room-2');
    expect(json.hostId).toBe('host-2');
    expect(json.hostToken).toBe('host-token-2');
    expect(json.status).toBe('PLAYING');
    expect(createRoom).toHaveBeenCalledWith({
      targetType: 'SOLO',
      playerName: 'Alice',
      language: 'en',
    });
  });
});
