import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { resetRoom } from '@/services/roomService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';
import { hostActionLimiter } from '@/lib/rate-limit';
import { hostAuthSchema } from '@/lib/schemas/api';

export const runtime = 'edge';

const resetSchema = hostAuthSchema.extend({
  resetScores: z.boolean().optional(),
});

export const POST = withApiHandler({
  bodySchema: resetSchema,
  rateLimit: hostActionLimiter,
  async handler({ body }) {
    const auth = await requireHostAuthFromBody(body);
    if (auth instanceof Response) return auth;

    const room = await resetRoom(auth.roomCode, auth.hostId, body.resetScores ?? false);
    return NextResponse.json({ success: true, room });
  },
});
