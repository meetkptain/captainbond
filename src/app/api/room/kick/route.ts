import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { uuidSchema, hostAuthSchema } from '@/lib/schemas/api';
import { kickPlayerFromRoom } from '@/services/playerService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';
import { hostActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const kickSchema = hostAuthSchema.extend({
  targetPlayerId: uuidSchema,
});

export const POST = withApiHandler({
  bodySchema: kickSchema,
  rateLimit: hostActionLimiter,
  async handler({ body }) {
    const auth = await requireHostAuthFromBody(body);
    if (auth instanceof Response) return auth;

    await kickPlayerFromRoom(auth.hostId, body.targetPlayerId, auth.room.id);
    return NextResponse.json({ success: true });
  },
});
