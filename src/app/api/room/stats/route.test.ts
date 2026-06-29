import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/services/roomService', () => ({
  getRoomDashboardStats: vi.fn().mockImplementation((roomCode, token) => {
    const isAdmin = token === 'host-token-xyz';
    const isSmall = roomCode === 'SMALL';
    return Promise.resolve({
      roomCode,
      targetType: 'CORPORATE',
      status: 'ENDED',
      language: 'fr',
      roundCount: 10,
      participationRate: 90,
      consensusRate: 80,
      iceScore: 86,
      playersCount: isSmall ? 3 : 5,
      isAdmin,
      customAnecdotesCount: 3,
      modeStats: { 'ICEBREAKER': 10 },
      players: isAdmin
        ? [{ id: 'p1', name: 'Alice' }]
        : [{ id: 'p1', name: 'Agent 1' }],
      customAnecdotes: isAdmin
        ? [{ id: 'p1', question: 'Secret', answer: isSmall ? 'Anonymisé (Équipe < 4)' : 'Alice' }]
        : undefined,
    });
  }),
}));

describe('GET /api/room/stats', () => {
  it('anonymizes players and hides secrets when no token is provided', async () => {
    const req = new NextRequest('http://localhost/api/room/stats?roomCode=ABCD', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.roomCode).toBe('ABCD');
    expect(data.isAdmin).toBe(false);
    expect(data.players[0].name).toBe('Agent 1');
    expect(data.customAnecdotes).toBeUndefined();
  });

  it('reveals full details and custom secrets when a valid host token is provided', async () => {
    const req = new NextRequest('http://localhost/api/room/stats?roomCode=ABCD&token=host-token-xyz', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.roomCode).toBe('ABCD');
    expect(data.isAdmin).toBe(true);
    expect(data.players[0].name).toBe('Alice');
    expect(data.customAnecdotes).toBeDefined();
    expect(data.customAnecdotes[0].answer).toBe('Alice');
  });

  it('anonymizes secret authors if group is too small even for admin/host', async () => {
    const req = new NextRequest('http://localhost/api/room/stats?roomCode=SMALL&token=host-token-xyz', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isAdmin).toBe(true);
    expect(data.customAnecdotes[0].answer).toBe('Anonymisé (Équipe < 4)');
  });
});
