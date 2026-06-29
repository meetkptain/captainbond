import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getRoomDashboardStats } from '@/services/roomService';

export const runtime = 'edge';

const querySchema = z.object({
  roomCode: roomCodeSchema,
  token: z.string().optional().nullable(),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ query }) {
    const stats = await getRoomDashboardStats(query.roomCode, query.token);
    return NextResponse.json(stats);
  },
});
