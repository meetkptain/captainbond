import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/admin';

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await verifyAdminSession(token);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Non autorisé. Accès administrateur requis.' },
      { status: 401 }
    );
  }
  return null;
}

export function adminUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Non autorisé. Accès administrateur requis.' },
    { status: 401 }
  );
}
