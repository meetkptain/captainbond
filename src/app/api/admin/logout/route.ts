import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/admin';

export const runtime = 'edge';

export const POST = withApiHandler({
  async handler() {
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie !',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  },
});
