import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getRoomByCode, getPlayersInRoom } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkoutLimiter } from '@/lib/rate-limit';
import { requirePlayerSessionFor } from '@/lib/auth/player-session';
import { z } from 'zod';

export const runtime = 'edge';

// GET for teaser (accessible to everyone in the room)
export const GET = withApiHandler({
  async handler({ req }) {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const playerId = searchParams.get('playerId');
    if (!roomCode || !playerId) {
      return NextResponse.json({ error: 'Paramètres manquants', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Salle introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    const players = await getPlayersInRoom(room.id);
    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) {
      return NextResponse.json({ error: 'Joueur introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Fetch responses for this room to see who voted for this player
    const { data: responses, error } = await supabaseAdmin
      .from('Response')
      .select('*')
      .eq('roomId', room.id);

    if (error || !responses || responses.length === 0) {
      return NextResponse.json({ hasConnections: false });
    }

    // Filter responses where the answer is targetPlayer's ID
    const votesReceived = responses.filter(r => r.answer === playerId && r.playerId !== playerId);
    if (votesReceived.length === 0) {
      return NextResponse.json({ hasConnections: false });
    }

    // Find the voter who voted for them the most
    const voteCounts: Record<string, number> = {};
    for (const v of votesReceived) {
      voteCounts[v.playerId] = (voteCounts[v.playerId] || 0) + 1;
    }

    const topVoterId = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
    const topVoter = players.find(p => p.id === topVoterId);

    return NextResponse.json({
      hasConnections: true,
      teaseName: topVoter ? topVoter.name : 'Un joueur',
    });
  },
});

// POST for revealing (requires entitlement check / unlock session)
const revealSchema = z.object({
  roomCode: z.string().min(1),
  playerId: z.string().min(1),
});

export const POST = withApiHandler({
  bodySchema: revealSchema,
  rateLimit: checkoutLimiter,
  async handler({ req, body }) {
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { roomCode, playerId } = body;
    await requirePlayerSessionFor(req, playerId, roomCode);

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Salle introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    const players = await getPlayersInRoom(room.id);
    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) {
      return NextResponse.json({ error: 'Joueur introuvable', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Check if player unlocked the profile
    const { data: entitlements, error: entError } = await supabaseAdmin.rpc('get_user_entitlements_v2', {
      p_user_id: targetPlayer.userId || null,
      p_room_id: room.id,
    });

    const isUnlocked = entitlements && (entitlements.accessible_features?.includes('profile') || entitlements.accessible_features?.includes('profiles'));
    if (!isUnlocked) {
      return NextResponse.json({ error: 'Accès verrouillé. Veuillez acheter le dossier.', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Fetch responses for this room to build full statistics
    const { data: responses, error } = await supabaseAdmin
      .from('Response')
      .select('*')
      .eq('roomId', room.id);

    if (error || !responses) {
      return NextResponse.json({ connections: [] });
    }

    // Map voters who voted for the player
    const votesReceived = responses.filter(r => r.answer === playerId && r.playerId !== playerId);
    const voteCounts: Record<string, number> = {};
    for (const v of votesReceived) {
      voteCounts[v.playerId] = (voteCounts[v.playerId] || 0) + 1;
    }

    const connectionsList = Object.entries(voteCounts).map(([voterId, count]) => {
      const voter = players.find(p => p.id === voterId);
      return {
        voterName: voter ? voter.name : 'Anonyme',
        voteCount: count,
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    return NextResponse.json({ connections: connectionsList });
  },
});
