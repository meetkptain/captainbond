import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getAuthenticatedCoupleUser } from '../couple';
import { supabaseAdmin } from '@/lib/supabase-admin';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('getAuthenticatedCoupleUser', () => {
  it('throws UNAUTHORIZED if token is missing', async () => {
    const req = new NextRequest('http://localhost/api/couple/portrait');
    await expect(getAuthenticatedCoupleUser(req)).rejects.toThrow('Session utilisateur manquante');
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

    const user = await getAuthenticatedCoupleUser(req);
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

    const user = await getAuthenticatedCoupleUser(req);
    expect(user.id).toBe('user-1');
  });
});
