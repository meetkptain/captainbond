import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import { reconcilePendingPurchases } from '@/services/paymentService';
import { adminSyncLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  rateLimit: adminSyncLimiter,
  async handler({ req }) {
    await requireAdminSession(req);
    const result = await reconcilePendingPurchases();
    return NextResponse.json({ success: true, ...result });
  },
});
