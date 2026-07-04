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

function setCommonHeaders(response: NextResponse, requestId: string, lang: string): NextResponse {
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-lang', lang);
  return response;
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

const PLAYER_ROUTE_PREFIXES = ['/api/me/'];

const PLAYER_ROUTE_EXACT = new Set([
  '/api/me',
  '/api/player/delete-me',
  '/api/checkout',
  '/api/checkout/pass',
  '/api/checkout/profile',
  '/api/room/state',
  '/api/room/profile',
  '/api/room/ready',
  '/api/room/vote',
  '/api/room/leave',
  '/api/room/skip',
  '/api/room/connections',
  '/api/room/question',
  '/api/room/anecdotes/submit',
  '/api/room/imposteur/role',
  '/api/room/imposteur/statements',
  '/api/room/imposteur/detect',
]);

function isPlayerRoute(pathname: string): boolean {
  if (PLAYER_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return PLAYER_ROUTE_EXACT.has(pathname);
}

const LANG_ROUTED_PATHS = new Set(['/', '/party', '/pro', '/corporate', '/couple', '/vault', '/privacy', '/b2b/bars-cafes']);
const FR_PATH_MAP: Record<string, string> = {
  '/party': '/fr/soiree',
  '/pro': '/fr/pro',
  '/corporate': '/fr/corporate',
  '/couple': '/fr/couple',
  '/vault': '/fr/vault',
  '/b2b/bars-cafes': '/fr/b2b/bars-cafes',
  '/privacy': '/fr/privacy',
};

function buildFrRedirect(pathname: string): string | null {
  if (pathname.startsWith('/group/')) return `/fr${pathname}`;
  if (pathname.startsWith('/blog/')) return `/fr${pathname}`;
  return FR_PATH_MAP[pathname] ?? null;
}

function detectAndRedirectLang(req: NextRequest, requestId: string): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (!LANG_ROUTED_PATHS.has(pathname) && !pathname.startsWith('/group/') && !pathname.startsWith('/blog/')) return null;

  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /bot|googlebot|bingbot|yandexbot|baidu|duckduckbot|crawler|spider|robot|crawling/i.test(userAgent);
  const langCookie = req.cookies.get('cb_language')?.value;

  if (isBot || langCookie === 'en') return null;

  const acceptLang = req.headers.get('accept-language') || '';
  if (!acceptLang.toLowerCase().includes('fr')) return null;

  const dest = buildFrRedirect(pathname);
  if (!dest) return null;

  const response = NextResponse.redirect(new URL(dest, req.url), 302);
  return setCommonHeaders(response, requestId, 'fr');
}

async function handleAdminAuth(req: NextRequest, requestId: string, lang: string): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  if (!isAdminRoute(pathname)) return null;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next({ request: { headers: new Headers(req.headers) } });

  if (pathname === '/api/admin/sync') {
    const isAdmin = await verifyAdminCookie(req);
    const syncSecret = process.env.ADMIN_SYNC_SECRET;
    const authHeader = req.headers.get('Authorization');
    const isSync = !!syncSecret && authHeader === `Bearer ${syncSecret}`;

    if (!isAdmin && !isSync) {
      logger.warn('Unauthorized admin sync attempt', { requestId, pathname });
      return setCommonHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }), requestId, lang);
    }

    const headers = new Headers(req.headers);
    headers.set('x-request-id', requestId);
    headers.set('x-lang', lang);
    return NextResponse.next({ request: { headers } });
  }

  const isAdmin = await verifyAdminCookie(req);
  if (!isAdmin) {
    logger.warn('Unauthorized admin access attempt', { requestId, pathname });
    if (pathname.startsWith('/api/admin')) {
      return setCommonHeaders(NextResponse.json({ error: 'Non autorisé' }, { status: 401 }), requestId, lang);
    }
    const response = NextResponse.redirect(new URL('/admin/login?error=invalid', req.url));
    response.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return setCommonHeaders(response, requestId, lang);
  }

  const headers = new Headers(req.headers);
  headers.set('x-request-id', requestId);
  headers.set('x-lang', lang);
  return NextResponse.next({ request: { headers } });
}

async function handlePlayerAuth(req: NextRequest, requestId: string, lang: string): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  if (!isPlayerRoute(pathname)) return null;

  const token = req.cookies.get(PLAYER_COOKIE_NAME)?.value;
  if (!token) {
    logger.warn('Missing player session', { requestId, pathname });
    return setCommonHeaders(NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }), requestId, lang);
  }

  try {
    await verifyPlayerSession(token);
  } catch {
    logger.warn('Invalid player session', { requestId, pathname });
    const response = NextResponse.json({ error: 'Session joueur invalide', code: 'UNAUTHORIZED' }, { status: 401 });
    response.cookies.set(PLAYER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return setCommonHeaders(response, requestId, lang);
  }

  const headers = new Headers(req.headers);
  headers.set('x-request-id', requestId);
  headers.set('x-lang', lang);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(req);
  const lang = req.nextUrl.pathname.startsWith('/fr/') ? 'fr' : 'en';

  const headers = new Headers(req.headers);
  headers.set('x-request-id', requestId);
  headers.set('x-lang', lang);

  const langRedirect = detectAndRedirectLang(req, requestId);
  if (langRedirect) return langRedirect;

  const adminResult = await handleAdminAuth(req, requestId, lang);
  if (adminResult) return adminResult;

  const playerResult = await handlePlayerAuth(req, requestId, lang);
  if (playerResult) return playerResult;

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/', '/party', '/pro', '/corporate', '/couple', '/vault', '/privacy', '/b2b/bars-cafes', '/group/:path*', '/blog', '/blog/:path*', '/admin/:path*', '/api/admin/:path*', '/api/room/:path*', '/api/me/:path*', '/api/checkout/:path*', '/api/couple/:path*', '/api/storage/:path*', '/api/trees/:path*', '/api/user/:path*', '/api/questions/:path*', '/api/player/delete-me'],
};
