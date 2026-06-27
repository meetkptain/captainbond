import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { roomCodeSchema } from '@/lib/schemas/api';
import { getRoomState } from '@/services/roomService';
import { getAuthenticatedPlayer } from '@/lib/auth/player-session';
import { getRoomByCode } from '@/lib/db/repositories';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

const stateQuerySchema = z.object({
  roomCode: roomCodeSchema,
});

export const GET = withApiHandler({
  querySchema: stateQuerySchema,
  async handler({ req, query }) {
    const playerContext = await getAuthenticatedPlayer(req, { roomCode: query.roomCode });
    
    // Resolve the room to verify ownership alignment
    const room = await getRoomByCode(query.roomCode);
    if (!room) {
      throw new AppError('NOT_FOUND', 'Salle introuvable');
    }
    
    if (playerContext.roomId !== room.id) {
      throw new AppError('FORBIDDEN', 'Accès refusé à cette salle');
    }

    const state = await getRoomState(query.roomCode);
    return NextResponse.json(state);
  },
});

