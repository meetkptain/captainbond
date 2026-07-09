import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignJWT } from 'jose';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/admin';
import { PLAYER_COOKIE_NAME } from '@/lib/auth/player';

vi.mock('next/server', () => {
  class MockNextRequest {
    public nextUrl: { pathname: string };
    public headers: Headers;
    public cookies: { get: (name: string) => { name: string; value: string } | undefined };
    public url: string;

    constructor(request: Request) {
      this.url = request.url;
      const url = new URL(request.url);
      this.nextUrl = { pathname: url.pathname };
      this.headers = new Headers(request.headers);

      const cookieHeader = request.headers.get('cookie') ?? '';
      const jar = new Map<string, string>();
      for (const part of cookieHeader.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key) jar.set(key, rest.join('='));
      }

      this.cookies = {
        get(name: string) {
          const value = jar.get(name);
          return value !== undefined ? { name, value } : undefined;
        },
      };
    }
  }

  class MockNextResponse extends Response {
    public cookies = {
      set: vi.fn(),
    };

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
    }

    static next(init?: { request?: { headers?: Headers } }) {
      return new MockNextResponse(null, { status: 200, headers: init?.request?.headers });
    }

    static redirect(url: string | URL, status?: number) {
      const response = new MockNextResponse(null, { status: status ?? 307 });
      response.headers.set('location', String(url));
      return response;
    }

    static json(data: unknown, init?: ResponseInit) {
      return new MockNextResponse(JSON.stringify(data), { ...init });
    }
  }

  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const { NextRequest } = await import('next/server');
const { middleware, config } = await import('./middleware');

async function signAdminToken(): Promise<string> {
  const secret = new TextEncoder().encode('admin-jwt-secret-32-chars-long!!');
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

async function signPlayerToken(): Promise<string> {
  const secret = new TextEncoder().encode('player-jwt-secret-32-chars-long!');
  return new SignJWT({ playerId: '550e8400-e29b-41d4-a716-446655440000', roomId: 'room-1' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

describe('middleware', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_JWT_SECRET', 'admin-jwt-secret-32-chars-long!!');
    vi.stubEnv('ADMIN_SYNC_SECRET', 'sync-secret-32-chars-long!!!!');
    vi.stubEnv('PLAYER_JWT_SECRET', 'player-jwt-secret-32-chars-long!');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects /admin to login when no admin cookie is present', async () => {
    const req = new NextRequest(new Request('http://localhost/admin'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/admin/login?error=invalid');
  });

  it('returns 401 for /api/admin/stats when no admin cookie is present', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/admin/stats', {
        headers: { 'x-request-id': 'req-1' },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBe('req-1');
    const body = await res.json();
    expect(body.error).toBe('Non autorisé');
  });

  it('allows /api/admin/sync with a valid sync secret', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/admin/sync', {
        headers: {
          Authorization: 'Bearer sync-secret-32-chars-long!!!!',
          'x-request-id': 'req-2',
        },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('req-2');
  });

  it('allows /admin/dashboard with a valid admin cookie', async () => {
    const token = await signAdminToken();
    const req = new NextRequest(
      new Request('http://localhost/admin/dashboard', {
        headers: {
          cookie: `${ADMIN_COOKIE_NAME}=${token}`,
          'x-request-id': 'req-3',
        },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('req-3');
  });

  it('allows /api/admin/sync with a valid admin cookie only', async () => {
    const token = await signAdminToken();
    const req = new NextRequest(
      new Request('http://localhost/api/admin/sync', {
        headers: {
          cookie: `${ADMIN_COOKIE_NAME}=${token}`,
          'x-request-id': 'req-4',
        },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('req-4');
  });

  it('returns 401 and clears the cookie for /api/room/vote with an invalid player cookie', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/room/vote', {
        headers: {
          cookie: `${PLAYER_COOKIE_NAME}=invalid-token`,
          'x-request-id': 'req-5',
        },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBe('req-5');
    const body = await res.json();
    expect(body.error).toBe('Session joueur invalide');
    expect(res.cookies.set).toHaveBeenCalledWith(PLAYER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
  });

  it('returns 401 for /api/room/vote when no player cookie is present', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/room/vote', {
        headers: { 'x-request-id': 'req-6' },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBe('req-6');
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('allows /api/room/vote with a valid player cookie', async () => {
    const token = await signPlayerToken();
    const req = new NextRequest(
      new Request('http://localhost/api/room/vote', {
        headers: {
          cookie: `${PLAYER_COOKIE_NAME}=${token}`,
          'x-request-id': 'req-7',
        },
      })
    );
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('req-7');
  });

  it('sets x-lang header on all responses', async () => {
    const req = new NextRequest(
      new Request('http://localhost/', {
        headers: {
          'accept-language': 'en',
          'x-request-id': 'req-lang-1',
        },
      })
    );
    const res = await middleware(req);
    expect(res.headers.get('x-lang')).toBe('en');
  });

  it('redirects /blog/* to /fr/blog/* for French users', async () => {
    const req = new NextRequest(
      new Request('http://localhost/blog/questions-pour-couple', {
        headers: {
          'accept-language': 'fr',
          'x-request-id': 'req-blog-1',
        },
      })
    );
    const res = await middleware(req);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/fr/blog/questions-pour-couple');
  });

  it('redirects /party to /fr/soiree for French users', async () => {
    const req = new NextRequest(
      new Request('http://localhost/party', {
        headers: {
          'accept-language': 'fr',
          'x-request-id': 'req-party-1',
        },
      })
    );
    const res = await middleware(req);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/fr/soiree');
  });

  it('redirects /pro to /fr/pro for French users', async () => {
    const req = new NextRequest(
      new Request('http://localhost/pro', {
        headers: {
          'accept-language': 'fr',
          'x-request-id': 'req-pro-1',
        },
      })
    );
    const res = await middleware(req);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/fr/pro');
  });

  it('exports a matcher for admin and player routes', () => {
    expect(config.matcher).toEqual([
      '/',
      '/party',
      '/pro',
      '/corporate',
      '/couple',
      '/vault',
      '/privacy',
      '/b2b/bars-cafes',
      '/group/:path*',
      '/blog',
      '/blog/:path*',
      '/admin/:path*',
      '/api/admin/:path*',
      '/api/room/:path*',
      '/api/me/:path*',
      '/api/checkout/:path*',
      '/api/couple/:path*',
      '/api/storage/:path*',
      '/api/trees/:path*',
      '/api/user/:path*',
      '/api/questions/:path*',
      '/api/player/delete-me',
    ]);
  });
});
