import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '../user';
import { requireCoupleMembership } from '../coupleMembership';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCoupleById } from '@/lib/db/repositories/coupleRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  getCoupleById: vi.fn(),
}));

describe('getAuthenticatedUser', () => {
  it('throws UNAUTHORIZED if token is missing', async () => {
    const req = new NextRequest('http://localhost/api/couple/portrait');
    await expect(getAuthenticatedUser(req)).rejects.toThrow('Session utilisateur manquante');
  });

  it('authenticates user using Authorization Bearer token', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
      },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabaseAdmin.auth.getUser>>);

    const req = new NextRequest('http://localhost/api/couple/portrait', {
      headers: {
        Authorization: 'Bearer mock-jwt',
      },
    });

    const user = await getAuthenticatedUser(req);
    expect(user.id).toBe('user-1');
    expect(user.email).toBe('test@example.com');
  });

  it('authenticates user using Supabase cookie', async () => {
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValueOnce({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
      },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabaseAdmin.auth.getUser>>);

    const req = new NextRequest('http://localhost/api/couple/portrait');
    req.cookies.set('sb-project-auth-token', JSON.stringify({ access_token: 'mock-jwt' }));

    const user = await getAuthenticatedUser(req);
    expect(user.id).toBe('user-1');
  });
});

describe('requireCoupleMembership', () => {
  it('succeeds when userId is user1', async () => {
    vi.mocked(getCoupleById).mockResolvedValueOnce({
      id: 'couple-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
    } as Awaited<ReturnType<typeof getCoupleById>>);

    await expect(requireCoupleMembership('couple-1', 'user-1')).resolves.toBeUndefined();
  });

  it('succeeds when userId is user2', async () => {
    vi.mocked(getCoupleById).mockResolvedValueOnce({
      id: 'couple-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
    } as Awaited<ReturnType<typeof getCoupleById>>);

    await expect(requireCoupleMembership('couple-1', 'user-2')).resolves.toBeUndefined();
  });

  it('throws FORBIDDEN when userId is not a member', async () => {
    vi.mocked(getCoupleById).mockResolvedValueOnce({
      id: 'couple-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
    } as Awaited<ReturnType<typeof getCoupleById>>);

    await expect(requireCoupleMembership('couple-1', 'user-3')).rejects.toThrow(
      'Vous ne faites pas partie de ce couple.'
    );
  });

  it('throws FORBIDDEN when couple does not exist', async () => {
    vi.mocked(getCoupleById).mockResolvedValueOnce(null);

    await expect(requireCoupleMembership('couple-1', 'user-1')).rejects.toThrow(
      'Vous ne faites pas partie de ce couple.'
    );
  });
});
