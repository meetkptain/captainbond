import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { hostActionLimiter } from '@/lib/rate-limit';
import { requireHostAuthFromBody } from '@/lib/auth/room-host';
import { hostAuthSchema } from '@/lib/schemas/api';
import { getRoomByCode } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeJsonParseRecord } from '@/lib/json';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

export const POST = withApiHandler({
  bodySchema: hostAuthSchema,
  rateLimit: hostActionLimiter,
  async handler({ body }) {
    const auth = await requireHostAuthFromBody(body);
    if (auth instanceof Response) return auth;

    const room = await getRoomByCode(auth.roomCode);
    if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
    if (room.currentMode !== 'IMPOSTEUR') throw new AppError('BAD_REQUEST', 'Mode invalide');
    if (room.status !== 'PLAYING') throw new AppError('BAD_REQUEST', 'La manche n\'est pas en cours');

    const rawConfig = typeof room.roundConfig === 'string' ? room.roundConfig : JSON.stringify(room.roundConfig ?? {});
    const roundConfig = safeJsonParseRecord(rawConfig) || {};

    const { error } = await supabaseAdmin
      .from('Room')
      .update({ roundConfig: { ...roundConfig, detectionPhase: true } })
      .eq('id', room.id);

    if (error) throw new AppError('INTERNAL_ERROR', 'Impossible de lancer la détection', { cause: error });

    return NextResponse.json({ success: true, detectionPhase: true });
  },
});
