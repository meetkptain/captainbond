import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCreateSchema } from '@/lib/schemas/api';
import { createRoom } from '@/services/roomService';
import { createRoomLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: roomCreateSchema,
  rateLimit: createRoomLimiter,
  async handler({ body }) {
    const { room, hostId, hostToken } = await createRoom({
      targetType: body.targetType,
      playerName: body.playerName,
    });

    return NextResponse.json({
      roomCode: room.code,
      roomId: room.id,
      hostId,
      hostToken,
      status: room.status,
    });
  },
});
