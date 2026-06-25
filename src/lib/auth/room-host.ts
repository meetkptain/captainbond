import { NextRequest } from 'next/server';
import { getRoomByCode } from '@/lib/db/repositories';
import { Room } from '@/lib/db/types';
import { verifyHostToken } from '@/lib/crypto';

export interface HostAuthResult {
  room: Room;
  hostId: string;
  roomCode: string;
}

async function authenticateHost(
  roomCode: string | null,
  hostId: string | null,
  hostToken: string | null
): Promise<HostAuthResult | Response> {
  if (!roomCode || !hostId || !hostToken) {
    return new Response(JSON.stringify({ error: 'roomCode, hostId et hostToken sont requis' }), { status: 400 });
  }

  const cleanCode = String(roomCode).toUpperCase().trim();

  const room = await getRoomByCode(cleanCode);
  if (!room) {
    return new Response(JSON.stringify({ error: 'Salle introuvable' }), { status: 404 });
  }

  if (room.hostId !== hostId) {
    return new Response(JSON.stringify({ error: 'hostId invalide' }), { status: 401 });
  }

  const isValid = await verifyHostToken(hostToken, cleanCode, hostId);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'hostToken invalide' }), { status: 401 });
  }

  return { room, hostId, roomCode: cleanCode };
}

export async function requireHostAuthFromBody(body: unknown): Promise<HostAuthResult | Response> {
  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), { status: 400 });
  }
  const { roomCode, hostId, hostToken } = body as Record<string, unknown>;
  return authenticateHost(
    typeof roomCode === 'string' ? roomCode : null,
    typeof hostId === 'string' ? hostId : null,
    typeof hostToken === 'string' ? hostToken : null
  );
}

export async function requireHostAuth(req: NextRequest): Promise<HostAuthResult | Response> {
  try {
    const body = await req.clone().json();
    return requireHostAuthFromBody(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), { status: 400 });
  }
}

export async function requireHostAuthQuery(req: NextRequest): Promise<HostAuthResult | Response> {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const hostId = searchParams.get('hostId');
    const hostToken = searchParams.get('hostToken');
    return authenticateHost(roomCode, hostId, hostToken);
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), { status: 400 });
  }
}
