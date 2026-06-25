import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getPublicStats } from '@/services/adminService';
import { ipLimiter, rateLimiters } from '@/lib/rate-limit';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler({
  rateLimit: ipLimiter(rateLimiters.ip),
  async handler() {
    const stats = await getPublicStats();
    return NextResponse.json(stats);
  },
});
