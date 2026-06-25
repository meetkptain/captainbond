import {
  roomExistsWithCode,
  createRoom as createRoomInDb,
  getRoomByCode,
  getRoomByCodeWithPlayers,
  getRoomById,
  updateRoom,
  updateRoomStatus,
} from '@/lib/db/repositories';
import {
  createPlayer,
  playerNameExistsInRoom,
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
  targetType?: 'GROUP' | 'SOLO';
  playerName?: string;
}

export async function createRoom(input: CreateRoomInput = {}): Promise<{
  room: Room;
  hostId: string;
  hostToken: string;
}> {
  const targetType = input.targetType ?? 'GROUP';
  const playerName = input.playerName ?? 'Hôte';

  const hostId = crypto.randomUUID();
  let code = generateRoomCode();
  let attempts = 0;

  while ((await roomExistsWithCode(code)) && attempts < 5) {
    code = generateRoomCode();
    attempts++;
  }

  if (await roomExistsWithCode(code)) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Impossible de générer un code unique');
  }

  const hostToken = await signHostToken(code, hostId);

  const room = await createRoomInDb({
    code,
    hostId,
    hostToken,
    status: targetType === 'SOLO' ? 'PLAYING' : 'WAITING',
    round: 0,
    targetType,
  });

  if (targetType === 'SOLO') {
    await createPlayer({
      id: hostId,
      name: playerName,
      isHost: true,
      isReady: true,
      roomId: room.id,
    });
  }

  return { room, hostId, hostToken };
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
  const { room, players } = await getRoomByCodeWithPlayers(input.roomCode);

  if (!room) {
    throw new AppError('NOT_FOUND', `Room code "${input.roomCode}" not found`);
  }

  if (room.status !== 'WAITING') {
    throw new AppError('ROOM_CLOSED', 'Game has already started or room has closed');
  }

  const serverMode = room.currentMode ? getServerGameMode(room.currentMode) : null;
  const nonHostCount = players.filter((p) => !p.isHost).length;

  if (serverMode) {
    const { maxPlayers } = serverMode.manifest;
    if (nonHostCount >= maxPlayers) {
      throw new AppError(
        'ROOM_FULL',
        `Cette table est complète (${maxPlayers} joueurs max pour ce mode).`
      );
    }
  }

  if (await playerNameExistsInRoom(room.id, input.playerName)) {
    throw new AppError(
      'PLAYER_NAME_TAKEN',
      `The name "${input.playerName}" is already taken in this lobby`
    );
  }

  const player = await createPlayer({
    id: crypto.randomUUID(),
    name: input.playerName,
    isHost: false,
    isReady: false,
    socketId: '',
    roomId: room.id,
    consentGivenAt: new Date().toISOString(),
  });

  return { player, roomId: room.id, roomCode: room.code };
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

  const { hostToken, paidByUserId, ...safeRoom } = room;
  const safePlayers = (players || []).map((p) => {
    const { userId, consentGivenAt, ...rest } = p as Player & { userId?: string | null; consentGivenAt?: string | null };
    return rest;
  });

  return {
    room: safeRoom,
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
