import { listActiveRooms, updateRoomStatus, getRoomById } from '@/lib/db/repositories';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Player } from '@/lib/db/types';
import { AppError } from '@/lib/errors';

const ADMIN_STATS_LIMIT = 500;

export interface AdminStats {
  totalQuestions: number;
  totalRooms: number;
  totalPlayers: number;
  rooms: { id: string; code: string; status: string; currentMode: string | null; round: number; createdAt?: string }[];
  players: Player[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    { count: totalQuestions },
    { count: totalRooms },
    { count: totalPlayers },
    rooms,
    { data: players },
  ] = await Promise.all([
    supabaseAdmin.from('Question').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('Room').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('Player').select('*', { count: 'exact', head: true }),
    listActiveRooms(),
    supabaseAdmin
      .from('Player')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(ADMIN_STATS_LIMIT),
  ]);

  return {
    totalQuestions: totalQuestions || 0,
    totalRooms: totalRooms || 0,
    totalPlayers: totalPlayers || 0,
    rooms: (rooms || []).map((r) => ({
      id: r.id,
      code: r.code,
      status: r.status,
      currentMode: r.currentMode ?? null,
      round: r.round,
      createdAt: r.createdAt,
    })),
    players: (players || []) as Player[],
  };
}

export async function endRoomByAdmin(roomId: string): Promise<void> {
  const room = await getRoomById(roomId);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  await updateRoomStatus(roomId, 'ENDED');
}

export interface PublicStats {
  totalRooms: number;
  totalPlayers: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const [{ count: totalRooms }, { count: totalPlayers }] = await Promise.all([
    supabaseAdmin.from('Room').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('Player').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalRooms: totalRooms || 0,
    totalPlayers: totalPlayers || 0,
  };
}


