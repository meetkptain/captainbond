import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getRoomByCode } from '@/lib/db/repositories';
import { roomCodeSchema } from '@/lib/schemas/api';

export const runtime = 'edge';

const querySchema = z.object({
  roomCode: roomCodeSchema,
});

export const GET = withApiHandler({
  querySchema,
  async handler({ query }) {
    const room = await getRoomByCode(query.roomCode.toUpperCase());
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: room.id,
      code: room.code,
      language: room.language || 'fr',
      status: room.status,
    });
  },
});
