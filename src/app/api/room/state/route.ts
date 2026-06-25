import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getRoomState } from '@/services/roomService';

export const runtime = 'edge';

const stateQuerySchema = z.object({
  roomCode: roomCodeSchema,
});

export const GET = withApiHandler({
  querySchema: stateQuerySchema,
  async handler({ query }) {
    const state = await getRoomState(query.roomCode);
    return NextResponse.json(state);
  },
});
