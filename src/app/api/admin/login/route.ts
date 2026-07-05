import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { adminLoginSchema } from '@/lib/schemas/api';
import {
  signAdminSession,
  signAdminRefreshToken,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
  getAdminCookieOptions,
  getAdminRefreshCookieOptions,
} from '@/lib/auth/admin';
import { adminLoginLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: adminLoginSchema,
  rateLimit: adminLoginLimiter,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    await verifyAdminPassword(body.password);

    const token = await signAdminSession();
    const refreshToken = await signAdminRefreshToken();

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie !',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
    response.cookies.set(ADMIN_REFRESH_COOKIE_NAME, refreshToken, getAdminRefreshCookieOptions());

    return response;
  },
});
