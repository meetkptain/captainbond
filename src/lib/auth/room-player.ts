import { NextRequest } from 'next/server';
import { getRoomByCode, getPlayerInRoom } from '@/lib/db/repositories';
import { Room, Player } from '@/lib/db/types';

export interface PlayerAuthResult {
  room: Room;
  player: Player;
  roomCode: string;
}

export async function requirePlayerAuth(req: NextRequest): Promise<PlayerAuthResult | Response> {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    const roomCode = searchParams.get('roomCode');

    if (!playerId || !roomCode) {
      return new Response(JSON.stringify({ error: 'playerId et roomCode sont requis' }), { status: 400 });
    }

    const cleanCode = String(roomCode).toUpperCase().trim();

    const room = await getRoomByCode(cleanCode);
    if (!room) {
      return new Response(JSON.stringify({ error: 'Salle introuvable' }), { status: 404 });
    }

    const player = await getPlayerInRoom(playerId, room.id);
    if (!player) {
      return new Response(JSON.stringify({ error: 'Joueur introuvable dans cette salle' }), { status: 403 });
    }

    return { room, player, roomCode: cleanCode };
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), { status: 400 });
  }
}
