import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkoutLimiter } from '@/lib/rate-limit';
import { getRoomByCode } from '@/lib/db/repositories';
import { z } from 'zod';

export const runtime = 'edge';

const anecdotesSchema = z.object({
  roomCode: z.string().min(1),
  hostId: z.string().min(1),
  anecdotes: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
  })),
});

export const POST = withApiHandler({
  bodySchema: anecdotesSchema,
  rateLimit: checkoutLimiter,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { roomCode, hostId, anecdotes } = body;
    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Salle introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }
    
    // Check if the caller is the host
    if (room.hostId !== hostId) {
      return NextResponse.json({ error: 'Action non autorisée', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('Room')
      .update({ customAnecdotes: anecdotes })
      .eq('id', room.id);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde', code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  },
});
