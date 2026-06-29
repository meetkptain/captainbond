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

export interface RoomDashboardStats {
  roomCode: string;
  targetType: string;
  status: string;
  language: string;
  roundCount: number;
  participationRate: number;
  consensusRate: number;
  iceScore: number;
  playersCount: number;
  isAdmin: boolean;
  players?: Array<{ id: string; name: string }>;
  customAnecdotesCount: number;
  customAnecdotes?: Array<{ id: string; question: string; answer: string }> | null;
  modeStats: Record<string, number>;
}

export async function getRoomDashboardStats(roomCode: string, token?: string | null): Promise<RoomDashboardStats> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }

  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  const [{ data: dbPlayers }, { data: dbResponses }] = await Promise.all([
    supabaseAdmin.from('Player').select('*').eq('roomId', room.id),
    supabaseAdmin.from('Response').select('*').eq('roomId', room.id),
  ]);

  const players = dbPlayers || [];
  const responses = dbResponses || [];

  const nonHostPlayers = players.filter((p) => !p.isHost);
  const playersCount = nonHostPlayers.length;
  const roundCount = room.round || 0;

  // Calculate participation rate
  const maxPossibleResponses = roundCount * playersCount;
  const actualResponses = responses.length;
  const participationRate = maxPossibleResponses > 0 ? Math.min(100, Math.round((actualResponses / maxPossibleResponses) * 100)) : 100;

  // Calculate consensus rate
  const responsesByQuestion: Record<string, string[]> = {};
  responses.forEach((r) => {
    if (r.questionId && r.answer && r.answer !== '__SKIP__') {
      if (!responsesByQuestion[r.questionId]) {
        responsesByQuestion[r.questionId] = [];
      }
      responsesByQuestion[r.questionId].push(r.answer);
    }
  });

  let sumConsensus = 0;
  let questionCount = 0;
  Object.values(responsesByQuestion).forEach((answers) => {
    if (answers.length === 0) return;
    const counts: Record<string, number> = {};
    let maxCount = 0;
    answers.forEach((ans) => {
      counts[ans] = (counts[ans] || 0) + 1;
      if (counts[ans] > maxCount) {
        maxCount = counts[ans];
      }
    });
    sumConsensus += maxCount / answers.length;
    questionCount++;
  });

  const consensusRate = questionCount > 0 ? Math.round((sumConsensus / questionCount) * 100) : 100;

  // Calculate ICE
  const iceScore = Math.round((consensusRate * 0.6) + (participationRate * 0.4));

  // Mode stats
  const modeStats: Record<string, number> = {};
  if (room.currentMode) {
    modeStats[room.currentMode] = roundCount;
  } else {
    modeStats['ICEBREAKER'] = roundCount;
  }

  const customAnecdotes = Array.isArray(room.customAnecdotes) ? room.customAnecdotes : [];
  const isAdmin = !!token && room.hostToken === token;

  const result: RoomDashboardStats = {
    roomCode: room.code,
    targetType: room.targetType || 'GROUP',
    status: room.status,
    language: room.language || 'fr',
    roundCount,
    participationRate,
    consensusRate,
    iceScore,
    playersCount,
    isAdmin,
    customAnecdotesCount: customAnecdotes.length,
    modeStats,
  };

  if (isAdmin) {
    result.players = nonHostPlayers.map((p) => ({ id: p.id, name: p.name }));
    if (playersCount < 4) {
      result.customAnecdotes = customAnecdotes.map((anec) => ({
        ...anec,
        answer: room.language === 'fr' ? 'Anonymisé (Équipe < 4)' : 'Anonymized (Team < 4)'
      }));
    } else {
      result.customAnecdotes = customAnecdotes;
    }
  } else {
    // Pseudonymized players list for safety
    result.players = nonHostPlayers.map((p, idx) => ({ id: p.id, name: `Agent ${idx + 1}` }));
  }

  return result;
}

