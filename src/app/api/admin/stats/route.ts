import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import { getAdminStats } from '@/services/adminService';
import { adminActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const GET = withApiHandler({
  rateLimit: adminActionLimiter,
  async handler({ req }) {
    await requireAdminSession(req);
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  },
});
