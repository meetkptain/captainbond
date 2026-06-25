import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomSetModeSchema } from '@/lib/schemas/api';
import { setRoomMode } from '@/services/roomService';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';
import { hostActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const setModeSchema = roomSetModeSchema.extend({
  hostId: z.string().uuid(),
  hostToken: z.string().min(1, 'Le hostToken est requis'),
});

export const POST = withApiHandler({
  bodySchema: setModeSchema,
  rateLimit: hostActionLimiter,
  async handler({ body }) {
    const auth = await requireHostAuthFromBody(body);
    if (auth instanceof Response) return auth;

    const room = await setRoomMode(body.roomCode, auth.hostId, body.mode);
    return NextResponse.json({ success: true, room });
  },
});
