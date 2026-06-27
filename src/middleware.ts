import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/admin';
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

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(req);
  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
