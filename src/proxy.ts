import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/admin';
import { verifyPlayerSession, PLAYER_COOKIE_NAME } from '@/lib/auth/player';
import { logger } from '@/lib/logger';

function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || crypto.randomUUID();
}

async function verifyAdminCookie(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await verifyAdminSession(token);
    return true;
  } catch {
    return false;
  }
}

async function verifySyncSecret(req: NextRequest): Promise<boolean> {
  const syncSecret = process.env.ADMIN_SYNC_SECRET;
  if (!syncSecret) return false;
  const authHeader = req.headers.get('Authorization');
  return authHeader === `Bearer ${syncSecret}`;
}

export async function proxy(req: NextRequest) {
  const requestId = getRequestId(req);
  const { pathname } = req.nextUrl;

  // Propagate the correlation ID to upstream routes.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isPlayerApi = pathname.startsWith('/api/room') || pathname.startsWith('/api/me');

  // ---------- Admin routes ----------
  if (isAdminPage || isAdminApi) {
    // Public auth routes
    if (
      pathname === '/admin/login' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout'
    ) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_JWT_SECRET;

    if (!adminPassword || !adminSecret) {
      logger.error('Admin configuration missing', { requestId, pathname });
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Configuration admin manquante' },
          { status: 500 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login?error=config', req.url));
    }

    // /api/admin/sync can be called either with an admin cookie or a sync secret.
    if (pathname === '/api/admin/sync') {
      const isAdmin = await verifyAdminCookie(req);
      const isSync = await verifySyncSecret(req);
      if (!isAdmin && !isSync) {
        logger.warn('Unauthorized sync attempt', { requestId, pathname });
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const isAdmin = await verifyAdminCookie(req);

    if (!isAdmin) {
      logger.warn('Unauthorized admin access attempt', { requestId, pathname });
      if (isAdminApi) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      const response = NextResponse.redirect(
        new URL('/admin/login?error=invalid', req.url)
      );
      response.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ---------- Player routes ----------
  // We validate the player JWT when present, but we do not block the request
  // yet to maintain backward compatibility with clients still sending playerId
  // in the body/query. This proxy only rejects explicitly invalid tokens.
  if (isPlayerApi) {
    const playerSecret = process.env.PLAYER_JWT_SECRET;
    if (playerSecret) {
      const sessionCookie = req.cookies.get(PLAYER_COOKIE_NAME)?.value;
      if (sessionCookie) {
        try {
          await verifyPlayerSession(sessionCookie);
        } catch {
          logger.warn('Invalid player session', { requestId, pathname });
          const response = NextResponse.json(
            { error: 'Session joueur invalide', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
          response.cookies.set(PLAYER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
          return response;
        }
      }
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/room/:path*', '/api/me/:path*'],
};
