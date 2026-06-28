import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/admin';
import { verifyPlayerSession, PLAYER_COOKIE_NAME } from '@/lib/auth/player';
import { logger } from '@/lib/logger';

const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
]);

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

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
}

function isPlayerRoute(pathname: string): boolean {
  return pathname.startsWith('/api/room') || pathname.startsWith('/api/me');
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(req);
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  // 1. Détection de langue et redirection bilingue (avec bypass Googlebot et préférences cookies)
  if (pathname === '/' || pathname === '/corporate' || pathname === '/couple' || pathname === '/vault' || pathname === '/b2b/bars-cafes' || pathname.startsWith('/group/')) {
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /bot|googlebot|bingbot|yandexbot|baidu|duckduckbot|crawler|spider|robot|crawling/i.test(userAgent);
    const langCookie = req.cookies.get('cb_language')?.value;

    if (!isBot && langCookie !== 'en') {
      const acceptLang = req.headers.get('accept-language') || '';
      if (acceptLang.toLowerCase().includes('fr')) {
        let dest = '/fr';
        if (pathname === '/corporate') dest = '/fr/corporate';
        if (pathname === '/couple') dest = '/fr/couple';
        if (pathname === '/vault') dest = '/fr/vault';
        if (pathname === '/b2b/bars-cafes') dest = '/fr/b2b/bars-cafes';
        if (pathname.startsWith('/group/')) dest = `/fr${pathname}`;
        const response = NextResponse.redirect(new URL(dest, req.url), 302);
        response.headers.set('x-request-id', requestId);
        return response;
      }
    }
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isAdminRoute(pathname)) {
    if (pathname === '/api/admin/sync') {
      const isAdmin = await verifyAdminCookie(req);
      const syncSecret = process.env.ADMIN_SYNC_SECRET;
      const authHeader = req.headers.get('Authorization');
      const isSync = !!syncSecret && authHeader === `Bearer ${syncSecret}`;

      if (!isAdmin && !isSync) {
        logger.warn('Unauthorized admin sync attempt', { requestId, pathname });
        const response = NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        response.headers.set('x-request-id', requestId);
        return response;
      }

      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const isAdmin = await verifyAdminCookie(req);

    if (!isAdmin) {
      logger.warn('Unauthorized admin access attempt', { requestId, pathname });

      if (pathname.startsWith('/api/admin')) {
        const response = NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        response.headers.set('x-request-id', requestId);
        return response;
      }

      const response = NextResponse.redirect(
        new URL('/admin/login?error=invalid', req.url)
      );
      response.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0, path: '/' });
      response.headers.set('x-request-id', requestId);
      return response;
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isPlayerRoute(pathname)) {
    const playerSecret = process.env.PLAYER_JWT_SECRET;
    if (playerSecret) {
      const token = req.cookies.get(PLAYER_COOKIE_NAME)?.value;
      if (token) {
        try {
          await verifyPlayerSession(token);
        } catch {
          logger.warn('Invalid player session', { requestId, pathname });
          const response = NextResponse.json(
            { error: 'Session joueur invalide', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
          response.cookies.set(PLAYER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
          response.headers.set('x-request-id', requestId);
          return response;
        }
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/', '/corporate', '/couple', '/vault', '/b2b/bars-cafes', '/group/:path*', '/admin/:path*', '/api/admin/:path*', '/api/room/:path*', '/api/me/:path*'],
};
