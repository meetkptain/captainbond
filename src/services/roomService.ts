import {
  createRoom as createRoomInDb,
  getRoomByCode,
  getRoomById,
  updateRoom,
} from '@/lib/db/repositories';
import {
  createPlayer,
  countNonHostPlayersInRoom,
  getPlayerById,
} from '@/lib/db/repositories';
import { Room, Player, Response } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { signHostToken } from '@/lib/crypto';
import { getServerGameMode } from '@/game-modes/manifests';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface CreateRoomInput {
  targetType?: 'GROUP' | 'SOLO' | 'CORPORATE';
  playerName?: string;
  language?: string;
}

export async function createRoom(input: CreateRoomInput = {}): Promise<{
  room: Room;
  hostId: string;
  hostToken: string;
}> {
  const targetType = input.targetType ?? 'GROUP';
  const playerName = input.playerName ?? 'Hôte';
  const language = input.language ?? 'fr';

  const hostId = crypto.randomUUID();
  let room: Room | null = null;
  let attempts = 0;

  while (attempts < 5) {
    const code = generateRoomCode();
    const hostToken = await signHostToken(code, hostId);

    try {
      room = await createRoomInDb({
        code,
        hostId,
        hostToken,
        status: targetType === 'SOLO' ? 'PLAYING' : 'WAITING',
        round: 0,
        targetType,
        language,
      });
      break;
    } catch (err: unknown) {
      // Postgres error code 23505 is unique_violation (duplicate code key)
      const postgrestError = err as { code?: string; message?: string };
      if (postgrestError && (postgrestError.code === '23505' || postgrestError.message?.includes('duplicate key') || postgrestError.message?.includes('violates unique constraint'))) {
        attempts++;
        continue;
      }
      throw err;
    }
  }

  if (!room) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Impossible de générer un code unique');
  }

  if (targetType === 'SOLO') {
    await createPlayer({
      id: hostId,
      name: playerName,
      isHost: true,
      isReady: true,
      roomId: room.id,
    });
  }

  return { room, hostId, hostToken: room.hostToken };
}

export interface JoinRoomInput {
  roomCode: string;
  playerName: string;
}

export interface JoinRoomResult {
  player: Player;
  roomId: string;
  roomCode: string;
}

export async function joinRoom(input: JoinRoomInput): Promise<JoinRoomResult> {
  const room = await getRoomByCode(input.roomCode);

  if (!room) {
    throw new AppError('NOT_FOUND', `Room code "${input.roomCode}" not found`);
  }

  const serverMode = room.currentMode ? getServerGameMode(room.currentMode) : null;
  const maxPlayers = serverMode ? serverMode.manifest.maxPlayers : null;

  const playerId = crypto.randomUUID();
  const consentGivenAt = new Date().toISOString();

  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  const { data, error } = await supabaseAdmin.rpc('join_room', {
    p_room_code: input.roomCode.trim(),
    p_player_name: input.playerName.trim(),
    p_player_id: playerId,
    p_max_players: maxPlayers,
    p_consent_given_at: consentGivenAt,
  });

  if (error) {
    const message = error.message || '';
    if (message.includes('Salle introuvable')) {
      throw new AppError('NOT_FOUND', `Room code "${input.roomCode}" not found`);
    }
    if (message.includes('pas en attente')) {
      throw new AppError('ROOM_CLOSED', 'Game has already started or room has closed');
    }
    if (message.includes('déjà pris')) {
      throw new AppError(
        'PLAYER_NAME_TAKEN',
        `The name "${input.playerName}" is already taken in this lobby`
      );
    }
    if (message.includes('complète')) {
      throw new AppError(
        'ROOM_FULL',
        `Cette table est complète (${maxPlayers} joueurs max pour ce mode).`
      );
    }
    throw new AppError('INTERNAL_ERROR', 'Failed to join room', { cause: error });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.player_id) {
    throw new AppError('INTERNAL_ERROR', 'L\'inscription a réussi mais aucune donnée n\'a été renvoyée');
  }

  const player: Player = {
    id: result.player_id,
    name: input.playerName,
    isHost: false,
    isReady: false,
    socketId: '',
    roomId: result.room_id,
    consentGivenAt,
    createdAt: new Date().toISOString(),
    userId: null,
  };

  return { player, roomId: result.room_id, roomCode: result.room_code };
}


export interface RoomState {
  room: Omit<Room, 'hostToken'>;
  players: Player[];
  responses: Response[];
}

export async function getRoomState(roomCode: string): Promise<RoomState> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }

  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  const [{ data: players }, { data: responses }] = await Promise.all([
    supabaseAdmin.from('Player').select('*').eq('roomId', room.id),
    supabaseAdmin
      .from('Response')
      .select('*')
      .eq('roomId', room.id)
      .eq('questionId', room.currentQuestionId ?? ''),
  ]);

  const safeRoom = { ...room } as Partial<Room>;
  delete safeRoom.hostToken;
  delete safeRoom.paidByUserId;

  const safePlayers = (players || []).map((p) => {
    const rest = { ...p } as Partial<Player> & { userId?: string | null; consentGivenAt?: string | null };
    delete rest.userId;
    delete rest.consentGivenAt;
    return rest;
  });

  return {
    room: safeRoom as Omit<Room, 'hostToken'>,
    players: safePlayers as Player[],
    responses: (responses || []) as Response[],
  };
}

export async function setRoomMode(
  roomCode: string,
  hostId: string,
  modeId: string
): Promise<Room> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  if (room.hostId !== hostId) {
    throw new AppError('FORBIDDEN', 'Seul l\'hôte peut changer le mode');
  }
  if (room.status !== 'WAITING') {
    throw new AppError('GAME_ALREADY_STARTED', 'La partie a déjà commencé');
  }

  const mode = getServerGameMode(modeId);
  if (!mode) {
    throw new AppError('NOT_FOUND', `Mode de jeu inconnu : ${modeId}`);
  }

  const nonHostCount = await countNonHostPlayersInRoom(room.id);
  const { minPlayers, maxPlayers } = mode.manifest;

  if (nonHostCount < minPlayers || nonHostCount > maxPlayers) {
    throw new AppError(
      'BAD_REQUEST',
      `Ce mode nécessite entre ${minPlayers} et ${maxPlayers} joueurs (actuellement ${nonHostCount})`
    );
  }

  return updateRoom(room.id, { currentMode: modeId });
}

export async function resetRoom(
  roomCode: string,
  hostId: string,
  resetScores: boolean
): Promise<Room> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  if (room.hostId !== hostId) {
    throw new AppError('FORBIDDEN', 'Seul l\'hôte peut réinitialiser la room');
  }

  const { supabaseAdmin } = await import('@/lib/supabase-admin');

  if (resetScores) {
    await supabaseAdmin.from('Score').delete().eq('roomId', room.id);
  }

  await supabaseAdmin
    .from('Player')
    .update({ isReady: false })
    .eq('roomId', room.id);

  return updateRoom(room.id, {
    status: 'WAITING',
    round: 0,
    currentQuestionId: null,
    roundConfig: null,
  });
}

export async function endRoomByHost(roomCode: string, hostId: string): Promise<Room> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  if (room.hostId !== hostId) {
    throw new AppError('FORBIDDEN', 'Seul l\'hôte peut terminer la partie');
  }
  return updateRoom(room.id, { status: 'ENDED' });
}

export async function getRoomForPlayer(playerId: string): Promise<{ room: Room; player: Player }> {
  const player = await getPlayerById(playerId);
  if (!player) {
    throw new AppError('NOT_FOUND', 'Joueur introuvable');
  }
  const room = await getRoomById(player.roomId);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  return { room, player };
}
