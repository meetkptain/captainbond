import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { revealRound } from '@/services/roomLifecycleService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';
import { hostActionLimiter } from '@/lib/rate-limit';
import { hostAuthSchema } from '@/lib/schemas/api';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: hostAuthSchema,
  rateLimit: hostActionLimiter,
  async handler({ body }) {
    const auth = await requireHostAuthFromBody(body);
    if (auth instanceof Response) return auth;

    const result = await revealRound(auth.roomCode, auth.hostId);
    return NextResponse.json(result);
  },
});
