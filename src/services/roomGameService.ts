import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getRoomByCode,
  getRoomById,
  getPlayersInRoom,
  getQuestionById,
  listQuestionsForDeck,
} from '@/lib/db/repositories';
import { Room, Player, Question } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { getServerGameMode } from '@/game-modes/manifests';
import { getPlayerHmac } from '@/lib/crypto';
import { getUserEntitlements, roomHasActivePass, canAccessMode, getRoomPassInfo, getPlayerEntitlements, canViewProfile, canViewCoupleProfile } from '@/lib/monetization/entitlements';
import { calculateProfile, EnrichedResponse } from '@/lib/profiling/calculateProfile';
import { safeJsonParseRecord } from '@/lib/json';
import { recordGamePlayed, GameSummary } from './statsService';

const FREE_QUESTIONS_LIMIT = 3;

function checkHost(room: Room, hostId: string) {
  if (room.hostId !== hostId) {
    throw new AppError('FORBIDDEN', 'Seul l\'hôte peut effectuer cette action');
  }
}

// ---------- Next round ----------

export interface NextRoundResult {
  success: boolean;
  status: string;
  round: number;
  roundDuration: number;
  freeQuestionsUsed: number;
  freeQuestionsLimit: number;
  question: {
    id: string;
    text: string;
    intensityLevel?: number;
    tags?: string[];
    metadata?: Record<string, unknown> | null;
  };
}

export async function startNextRound(roomCode: string, hostId: string): Promise<NextRoundResult> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);

  const currentMode = room.currentMode || 'ICEBREAKER';
  const serverMode = getServerGameMode(currentMode) || getServerGameMode('ICEBREAKER');

  const players = await getPlayersInRoom(room.id);
  const nonHostCount = players.filter((p) => !p.isHost).length;
  const modeMinPlayers = serverMode?.manifest.minPlayers ?? 1;
  const modeMaxPlayers = serverMode?.manifest.maxPlayers ?? 10;

  if (nonHostCount < modeMinPlayers || nonHostCount > modeMaxPlayers) {
    throw new AppError(
      'BAD_REQUEST',
      `Ce mode nécessite entre ${modeMinPlayers} et ${modeMaxPlayers} joueurs. Actuellement : ${nonHostCount}.`
    );
  }

  // Premium gating — seuls les modes premium sont bloqués.
  // Les modes gratuits (Icebreaker, Imposteur, Spicy, etc.) n'ont plus de limite de rounds
  // pour maximiser la boucle virale et la conversion post-soirée (Dossier Classifié).
  const isPremiumMode = serverMode?.manifest?.isPremium === true;
  const hasReachedFreeLimit = false; // Anciennement : !isPremiumMode && room.round >= FREE_QUESTIONS_LIMIT
  const freeQuestionsUsed = !isPremiumMode ? Math.min(room.round, FREE_QUESTIONS_LIMIT) : 0;

  if (isPremiumMode || hasReachedFreeLimit) {
    const nonHostPlayers = players.filter((p) => !p.isHost && p.userId);
    let anyPlayerCanAccess = false;

    for (const p of nonHostPlayers) {
      if (!p.userId) continue;
      const entitlements = await getUserEntitlements(p.userId);
      if (entitlements && canAccessMode(entitlements, currentMode)) {
        anyPlayerCanAccess = true;
        break;
      }
    }

    const roomPassActive = await roomHasActivePass(room.id);

    if (!anyPlayerCanAccess && !roomPassActive) {
      throw new AppError(
        'FORBIDDEN',
        isPremiumMode
          ? 'Ce mode premium nécessite le Pass 24h ou un abonnement Premium.'
          : 'Vous avez atteint la limite de questions gratuites. Passez en soirée premium pour continuer.',
        { details: { passPriceCents: 299 } }
      );
    }
  }

  // DJ emotional filters
  let previousIntensity = 1;
  if (room.currentQuestionId) {
    const pq = await getQuestionById(room.currentQuestionId);
    previousIntensity = pq?.intensityLevel || 1;
  }

  const allQuestions = await listQuestionsForDeck();
  let pool = allQuestions;

  if (currentMode === 'DATE_NIGHT') {
    pool = pool.filter((q) => q.tags?.includes('date_safe'));
  } else if (currentMode === 'FAMILY') {
    pool = pool.filter((q) => q.mode === currentMode && q.tags?.includes('positive'));
  } else {
    pool = pool.filter((q) => q.mode === currentMode);
    if (currentMode === 'ICEBREAKER' && room.round > 0 && (room.round + 1) % 3 === 0) {
      pool = pool.filter((q) => q.tags?.includes('positive'));
    }
  }

  // Anti-répétition : exclure les questions déjà jouées dans cette room
  const existingConfig = (room.roundConfig || {}) as { playedQuestionIds?: string[] };
  const playedQuestionIds = new Set(existingConfig.playedQuestionIds || []);
  const poolWithoutRepeats = pool.filter((q) => !playedQuestionIds.has(q.id));

  // Date Night : courbe 70% légèreté / 30% profondeur après la première carte
  if (currentMode === 'DATE_NIGHT' && room.round > 0) {
    if (previousIntensity === 3) {
      pool = poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);
    } else {
      const deepPool = poolWithoutRepeats.filter((q) => q.intensityLevel === 3);
      const lightPool = poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);
      pool = Math.random() < 0.3 && deepPool.length > 0 ? deepPool : lightPool;
    }
  } else if (previousIntensity === 3) {
    pool = poolWithoutRepeats.filter((q) => (q.intensityLevel || 1) <= 2);
  } else {
    pool = poolWithoutRepeats;
  }

  if (currentMode === 'DATE_NIGHT' && room.round === 0) {
    pool = pool.filter((q) => q.intensityLevel === 1 && q.tags?.includes('icebreaker'));
  }

  // Fallback : si le filtrage a tout vidé, on relâche l'anti-répétition
  if (!pool.length) {
    pool = currentMode === 'DATE_NIGHT'
      ? allQuestions.filter((q) => q.tags?.includes('date_safe'))
      : allQuestions.filter((q) => q.mode === currentMode);
  }

  if (!pool.length) {
    throw new AppError('NOT_FOUND', 'Database is empty or missing content');
  }

  const selectedQuestion = pool[Math.floor(Math.random() * pool.length)];

  // Mémoriser la question jouée
  const updatedPlayedIds = Array.from(new Set([...Array.from(playedQuestionIds), selectedQuestion.id]));

  let roundConfig: Record<string, unknown> = {
    playedQuestionIds: updatedPlayedIds,
  };

  if (currentMode === 'IMPOSTEUR') {
    const nonHosts = players.filter((p) => !p.isHost);
    if (nonHosts.length < 2) {
      throw new AppError('BAD_REQUEST', 'L\'Imposteur nécessite au moins 3 joueurs (2 civils + 1 intrus).');
    }
    roundConfig = {
      ...roundConfig,
      mode: 'IMPOSTEUR',
      detections: {},
      questionId: selectedQuestion.id,
      roundDuration: 120,
    };
  }

  const { data: updatedRoom, error: updateError } = await supabaseAdmin
    .from('Room')
    .update({
      status: 'PLAYING',
      currentQuestionId: selectedQuestion.id,
      round: room.round + 1,
      roundConfig,
    })
    .eq('id', room.id)
    .not('status', 'eq', 'PLAYING')
    .select()
    .single();

  if (updateError || !updatedRoom) {
    throw new AppError('CONFLICT', 'Une manche est déjà en cours');
  }

  const roundDuration = serverMode?.manifest?.roundDurationSeconds ?? 30;

  return {
    success: true,
    status: updatedRoom.status,
    round: updatedRoom.round,
    roundDuration,
    freeQuestionsUsed,
    freeQuestionsLimit: FREE_QUESTIONS_LIMIT,
    question: {
      id: selectedQuestion.id,
      text: selectedQuestion.text,
      intensityLevel: selectedQuestion.intensityLevel,
      tags: selectedQuestion.tags || [],
    },
  };
}

// ---------- Reveal ----------

export interface ScoreUpdate {
  playerId: string;
  pointsEarned: number;
  isCorrect: boolean;
}

export interface RevealResult {
  success: boolean;
  status: string;
  scores: ScoreUpdate[];
  question: {
    correctAnswer?: string;
    explanation?: string | null;
  };
}

export async function revealRound(roomCode: string, hostId: string): Promise<RevealResult> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);

  if (!room.currentQuestionId) {
    throw new AppError('BAD_REQUEST', 'No active question found to calculate scores for');
  }

  const { data: lockedRoom, error: lockError } = await supabaseAdmin
    .from('Room')
    .update({ status: 'REVEALING' })
    .eq('id', room.id)
    .eq('status', 'PLAYING')
    .select()
    .single();

  if (lockError || !lockedRoom) {
    throw new AppError('CONFLICT', 'La révélation est déjà en cours ou la room n\'est plus en jeu');
  }

  const currentMode = room.currentMode || 'VRAI_FAUX';
  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Question not found');

  if (currentMode === 'IMPOSTEUR' && room.roundConfig) {
    const config = typeof room.roundConfig === 'string' ? safeJsonParseRecord(room.roundConfig) : room.roundConfig;
    if (config?.imposterHash) {
      const players = await getPlayersInRoom(room.id);
      for (const p of players) {
        const hash = await getPlayerHmac(p.id);
        if (hash === config.imposterHash) {
          question.correctAnswer = p.id;
          break;
        }
      }
    }
  }

  const { data: responses, error: responsesError } = await supabaseAdmin
    .from('Response')
    .select('*')
    .eq('roomId', room.id)
    .eq('questionId', question.id);

  if (responsesError) {
    throw new AppError('INTERNAL_ERROR', 'Failed to fetch player responses', { cause: responsesError });
  }

  const gameMode = getServerGameMode(currentMode) || getServerGameMode('ICEBREAKER');
  if (!gameMode) {
    throw new AppError('INTERNAL_ERROR', 'No default game mode registered');
  }

  const mappedResponses: Array<{
    playerId: string;
    answer: unknown;
    timeSpentMs: number;
    rawResponseId?: string;
  }> = [];
  for (const r of responses || []) {
    const { isValid, parsedAnswer } = gameMode.engine.validateResponse(r.answer, question);
    if (isValid) {
      mappedResponses.push({
        playerId: r.playerId,
        answer: parsedAnswer,
        timeSpentMs: new Date(r.timestamp).getTime(),
        rawResponseId: r.id,
      });
    }
  }

  const roundConfigContext = typeof room.roundConfig === 'string' ? safeJsonParseRecord(room.roundConfig) : room.roundConfig;
  const calculatedScores = gameMode.engine.calculateScores(mappedResponses, question, roundConfigContext);

  for (const scoreItem of calculatedScores) {
    const resp = mappedResponses.find((m) => m.playerId === scoreItem.playerId);
    if (resp?.rawResponseId) {
      await supabaseAdmin
        .from('Response')
        .update({ isCorrect: scoreItem.isCorrect })
        .eq('id', resp.rawResponseId);
    }

    const { data: existingScore } = await supabaseAdmin
      .from('Score')
      .select('*')
      .eq('roomId', room.id)
      .eq('playerId', scoreItem.playerId)
      .maybeSingle();

    if (existingScore) {
      await supabaseAdmin
        .from('Score')
        .update({ points: existingScore.points + scoreItem.pointsEarned })
        .eq('id', existingScore.id);
    } else {
      await supabaseAdmin.from('Score').insert({
        id: crypto.randomUUID(),
        roomId: room.id,
        playerId: scoreItem.playerId,
        points: scoreItem.pointsEarned,
      });
    }
  }

  const { data: updatedRoom } = await supabaseAdmin
    .from('Room')
    .update({ status: 'DISCUSSION' })
    .eq('id', room.id)
    .eq('status', 'REVEALING')
    .select()
    .single();

  return {
    success: true,
    status: updatedRoom?.status || 'DISCUSSION',
    scores: calculatedScores,
    question: {
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    },
  };
}

// ---------- Vote ----------

export async function recordVote(
  playerId: string,
  roomCode: string,
  questionId: string,
  answer: string
): Promise<{ responseId: string }> {
  const room = await getRoomByCode(roomCode);
  if (!room) {
    throw new AppError('NOT_FOUND', 'Salle introuvable');
  }
  if (room.status !== 'PLAYING') {
    throw new AppError('FORBIDDEN', 'La partie n\'est pas en cours');
  }
  if (room.currentQuestionId !== questionId) {
    throw new AppError('FORBIDDEN', 'Cette question n\'est pas active');
  }

  const { data, error } = await supabaseAdmin.rpc('record_vote', {
    p_player_id: playerId,
    p_room_code: roomCode.toUpperCase().trim(),
    p_question_id: questionId,
    p_answer: answer.trim(),
  });

  if (error) {
    const message = error.message || '';
    if (message.includes('déjà voté')) {
      throw new AppError('CONFLICT', 'You have already submitted an answer for this question');
    }
    if (message.includes('non inscrit')) {
      throw new AppError('FORBIDDEN', 'Player is not registered in this lobby');
    }
    if (message.includes('partie non en cours')) {
      throw new AppError('FORBIDDEN', 'Room is not currently in playing mode');
    }
    throw new AppError('INTERNAL_ERROR', 'Failed to record response', { cause: error });
  }

  const responseId = (data as { responseId?: string } | null)?.responseId;
  if (!responseId) {
    throw new AppError('INTERNAL_ERROR', 'Le vote a été enregistré mais aucun identifiant de réponse n\'a été retourné');
  }
  return { responseId };
}

// ---------- Active question ----------

export async function getActiveQuestionForPlayer(roomId: string, playerId: string): Promise<Question> {
  const { data: player } = await supabaseAdmin
    .from('Player')
    .select('id, roomId')
    .eq('id', playerId)
    .eq('roomId', roomId)
    .maybeSingle();

  if (!player) throw new AppError('UNAUTHORIZED', 'Unauthorized: Player not registered in this room');

  const { data: room } = await supabaseAdmin
    .from('Room')
    .select('id, status, currentQuestionId')
    .eq('id', roomId)
    .maybeSingle();

  if (!room) throw new AppError('NOT_FOUND', 'Room not found');
  if (room.status !== 'PLAYING') {
    throw new AppError('BAD_REQUEST', 'No active question: Room is not in playing mode');
  }
  if (!room.currentQuestionId) throw new AppError('NOT_FOUND', 'No active question found for this room');

  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Active question not found');

  return question;
}

// ---------- Imposteur role ----------

export async function getImposteurRole(playerId: string, roomId: string): Promise<{
  isImpostor: boolean;
  word: string;
  role: string;
}> {
  const { data: player } = await supabaseAdmin
    .from('Player')
    .select('id, roomId')
    .eq('id', playerId)
    .eq('roomId', roomId)
    .maybeSingle();

  if (!player) throw new AppError('UNAUTHORIZED', 'Unauthorized: Player not registered in this room');

  const room = await getRoomById(roomId);
  if (!room) throw new AppError('NOT_FOUND', 'Room not found');
  if (room.currentMode !== 'IMPOSTEUR') {
    throw new AppError('BAD_REQUEST', 'Room is not in IMPOSTEUR mode');
  }
  if (!room.currentQuestionId) throw new AppError('NOT_FOUND', 'No active question found for this room');

  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Active question not found');

  interface ImposteurQuestionMetadata {
    wordForCivil: string;
    wordForImpostor: string;
  }

  const metadata = (
    typeof question.metadata === 'string' ? safeJsonParseRecord(question.metadata) : question.metadata
  ) as ImposteurQuestionMetadata | null;
  if (!metadata?.wordForCivil || !metadata?.wordForImpostor) {
    throw new AppError('INTERNAL_ERROR', 'Question metadata is missing word assignments');
  }

  const config = typeof room.roundConfig === 'string' ? safeJsonParseRecord(room.roundConfig) : room.roundConfig;
  if (!config?.imposterHash) {
    throw new AppError('INTERNAL_ERROR', 'Room configuration is missing imposter assignment');
  }

  const calculatedPlayerHash = await getPlayerHmac(playerId);
  const isImpostor = calculatedPlayerHash === config.imposterHash;

  return {
    isImpostor,
    word: isImpostor ? metadata.wordForImpostor : metadata.wordForCivil,
    role: isImpostor ? 'INTRUS' : 'CIVIL',
  };
}

// ---------- Profiles ----------

type EnrichedResponseInput = {
  playerId: string;
  answer: string;
  questionId: string;
  mode: string;
};

async function buildProfileInputs(roomId: string) {
  const [{ data: allResponses }, { data: allScores }] = await Promise.all([
    supabaseAdmin.from('Response').select('playerId, answer, questionId, isCorrect').eq('roomId', roomId),
    supabaseAdmin.from('Score').select('playerId, points').eq('roomId', roomId),
  ]);

  const questionIds = Array.from(new Set((allResponses || []).map((r) => r.questionId).filter(Boolean)));

  const { data: questions } =
    questionIds.length > 0
      ? await supabaseAdmin.from('Question').select('id, mode').in('id', questionIds)
      : { data: [] };

  const questionModes = new Map<string, string>();
  for (const q of questions || []) {
    questionModes.set(q.id, q.mode);
  }

  const enrichedResponses = (allResponses || []).map((r) => ({
    playerId: r.playerId,
    answer: r.answer,
    questionId: r.questionId,
    mode: questionModes.get(r.questionId) || 'UNKNOWN',
  }));

  return {
    enrichedResponses,
    questionModes,
    allScores: allScores || [],
  };
}

function calculatePlayerProfile(
  playerId: string,
  enrichedResponses: EnrichedResponseInput[],
  allScores: Array<{ playerId: string; points: number }>
): ReturnType<typeof calculateProfile> {
  const playerResponses = enrichedResponses
    .filter((r) => r.playerId === playerId)
    .map((r) => ({
      answer: r.answer,
      isCorrect: null as boolean | null,
      questionId: r.questionId,
      mode: r.mode,
    }));

  const playerScores = allScores.filter((s) => s.playerId === playerId).map((s) => ({ points: s.points }));

  return calculateProfile(playerResponses as EnrichedResponse[], enrichedResponses, playerScores);
}

export async function getPlayerGameProfile(playerId: string, roomCode: string): Promise<{
  profile: ReturnType<typeof calculateProfile>;
  currentMode?: string | null;
  isUnlocked: boolean;
}> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');

  const { data: player } = await supabaseAdmin
    .from('Player')
    .select('*')
    .eq('id', playerId)
    .eq('roomId', room.id)
    .maybeSingle();

  if (!player) throw new AppError('UNAUTHORIZED', 'Joueur introuvable dans cette salle');

  if (room.status !== 'ENDED') {
    throw new AppError('BAD_REQUEST', 'La partie n\'est pas encore terminée');
  }

  const { enrichedResponses, allScores } = await buildProfileInputs(room.id);

  const profile = calculatePlayerProfile(playerId, enrichedResponses, allScores);

  const entitlements = await getPlayerEntitlements(playerId);
  const isCouple = room.currentMode === 'DATE_NIGHT';
  const isUnlocked = isCouple ? canViewCoupleProfile(entitlements) : canViewProfile(entitlements);

  return { profile, currentMode: room.currentMode, isUnlocked };
}

export interface RoomProfileEntry {
  playerId: string;
  name: string;
  profile: ReturnType<typeof calculateProfile>;
  isUnlocked?: boolean;
}

async function buildProfilesForRoom(room: Room, includeUnlockStatus: boolean): Promise<RoomProfileEntry[]> {
  const players = await getPlayersInRoom(room.id);
  const nonHosts = players.filter((p) => !p.isHost);

  const roomPass = includeUnlockStatus ? await getRoomPassInfo(room.id) : { isActive: false };
  const roomPassActive = roomPass.isActive;
  const isCouple = room.currentMode === 'DATE_NIGHT';

  const { enrichedResponses, allScores } = await buildProfileInputs(room.id);

  const profiles: RoomProfileEntry[] = [];
  for (const player of nonHosts) {
    const profile = calculatePlayerProfile(player.id, enrichedResponses, allScores);

    const entry: RoomProfileEntry = {
      playerId: player.id,
      name: player.name,
      profile,
    };

    if (includeUnlockStatus) {
      let isUnlocked = roomPassActive;
      if (!isUnlocked && player.userId) {
        const entitlements = await getPlayerEntitlements(player.id);
        isUnlocked = isCouple ? canViewCoupleProfile(entitlements) : canViewProfile(entitlements);
      }
      entry.isUnlocked = isUnlocked;
    }

    profiles.push(entry);
  }

  return profiles;
}

export async function endRoomAndBuildProfiles(roomCode: string, hostId: string): Promise<{
  status: string;
  profiles: RoomProfileEntry[];
}> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);

  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  const { error } = await supabaseAdmin.from('Room').update({ status: 'ENDED' }).eq('id', room.id);
  if (error) throw new AppError('INTERNAL_ERROR', 'Impossible de terminer la salle', { cause: error });

  // Construire les profils avant de mettre à jour les stats (badges/archetypes)
  const profiles = await buildProfilesForRoom({ ...room, status: 'ENDED' }, false);

  // Mettre à jour les stats Daily Bond + badges de chaque joueur authentifié
  const { data: players } = await supabaseAdmin
    .from('Player')
    .select('id, userId, isHost')
    .eq('roomId', room.id)
    .not('userId', 'is', null);

  const userIds = new Set((players || []).map((p) => p.userId).filter(Boolean) as string[]);
  await Promise.allSettled(
    Array.from(userIds).map((userId) => {
      const player = players?.find((p) => p.userId === userId);
      const profileEntry = profiles.find((entry) => entry.playerId === player?.id);
      const summary: GameSummary = {
        wasHost: player?.isHost ?? false,
        archetype: profileEntry?.profile.archetype,
        axes: profileEntry?.profile.axes,
      };
      return recordGamePlayed(userId, summary);
    })
  );

  return { status: 'ENDED', profiles };
}

export async function getRoomGameProfiles(roomCode: string, hostId: string): Promise<{
  profiles: RoomProfileEntry[];
  roomPassActive: boolean;
}> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);

  const profiles = await buildProfilesForRoom(room, true);
  const roomPass = await getRoomPassInfo(room.id);
  return { profiles, roomPassActive: roomPass.isActive };
}
