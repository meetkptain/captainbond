import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkoutLimiter } from '@/lib/rate-limit';
import { getRoomByCode } from '@/lib/db/repositories';
import { z } from 'zod';

export const runtime = 'edge';

const submitAnecdoteSchema = z.object({
  roomCode: z.string().min(1),
  playerId: z.string().min(1),
  anecdoteText: z.string().min(3).max(250),
});

export const POST = withApiHandler({
  bodySchema: submitAnecdoteSchema,
  rateLimit: checkoutLimiter,
  async handler({ body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const { roomCode, playerId, anecdoteText } = body;
    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Salle introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Get player details to obtain their name
    const { data: player } = await supabaseAdmin
      .from('Player')
      .select('name')
      .eq('id', playerId)
      .eq('roomId', room.id)
      .maybeSingle();

    if (!player) {
      return NextResponse.json({ error: 'Joueur introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Read current custom anecdotes list
    const currentAnecdotes = Array.isArray(room.customAnecdotes)
      ? (room.customAnecdotes as Array<{ id: string; question: string; answer: string }>)
      : [];

    // Avoid duplicates for the same player
    const filteredAnecdotes = currentAnecdotes.filter(a => a.id !== playerId);
    
    // Add new one
    filteredAnecdotes.push({
      id: playerId,
      question: anecdoteText,
      answer: player.name,
    });

    const { error } = await supabaseAdmin
      .from('Room')
      .update({ customAnecdotes: filteredAnecdotes })
      .eq('id', room.id);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde', code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  },
});
