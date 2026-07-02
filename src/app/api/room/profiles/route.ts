import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getRoomGameProfiles } from '@/services/roomGameService';
import { requireHostAuthQuery } from '@/lib/auth/room-host';
import { hostAuthQuerySchema } from '@/lib/schemas/api';
import { hostActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const GET = withApiHandler({
  querySchema: hostAuthQuerySchema,
  rateLimit: hostActionLimiter,
  async handler({ req }) {
    const auth = await requireHostAuthQuery(req);
    if (auth instanceof Response) return auth;

    const result = await getRoomGameProfiles(auth.roomCode, auth.hostId);
    return NextResponse.json(result);
  },
});
