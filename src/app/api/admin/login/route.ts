import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { adminLoginSchema } from '@/lib/schemas/api';
import {
  signAdminSession,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from '@/lib/auth/admin';
import { adminLoginLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: adminLoginSchema,
  rateLimit: adminLoginLimiter,
  async handler({ body }) {
    await verifyAdminPassword(body.password);

    const token = await signAdminSession();

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie !',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

    return response;
  },
});
