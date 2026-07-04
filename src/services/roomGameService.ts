import {
  getRoomByCode,
  getRoomById,
  getPlayersInRoom,
  getPlayerInRoom,
  getPlayersByRoomWithUserId,
  getQuestionById,
  listQuestionsByIds,
  getResponsesByRoomAndQuestion,
  getResponsesForProfileInputs,
  getScoresByRoom,
  updateRoom,

  updateRoomStatusWithGuard,
  recordVoteRpc,
  upsertRevealScoresRpc,
  advanceRoomRoundRpc,
} from '@/lib/db/repositories';
import { listQuestionsForDeck } from '@/lib/db/repositories/roomQuestionRepository';
import { Room, Question } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { getServerGameMode } from '@/game-modes/manifests';
import { getPlayerHmac } from '@/lib/crypto';
import { computeRevealResult, findImpostorPlayerId, RawResponse } from '@/lib/game/reveal';
import { getUserEntitlements, roomHasActivePass, canAccessMode, getRoomPassInfo, getPlayerEntitlements, canViewProfile, canViewCoupleProfile } from '@/lib/monetization/entitlements';
import { calculateProfile, EnrichedResponse } from '@/lib/profiling/calculateProfile';
import { safeJsonParseRecord } from '@/lib/json';
import { buildQuestionPool, QuestionForDeck } from '@/lib/questions/deck';
import { MONETIZATION_CONFIG } from '@/lib/config/monetization';
import { recordGamePlayed, GameSummary } from './statsService';

const FREE_QUESTIONS_LIMIT = 3;

function injectCorporateQuestions(
  room: Room,
  allQuestions: QuestionForDeck[],
  currentMode: string
): QuestionForDeck[] {
  if (room.targetType !== 'CORPORATE') {
    return allQuestions;
  }

  const customAnecdotes = Array.isArray(room.customAnecdotes)
    ? (room.customAnecdotes as Array<{ id: string; question: string; answer: string }>)
    : [];

  const customCorporateQuestions = customAnecdotes.map((anec) => ({
    id: `anec-${anec.id}`,
    text: room.language === 'fr'
      ? `Qui est l'auteur de ce Dossier Secret : "${anec.question}" ?`
      : `Who is the author of this Secret File: "${anec.question}" ?`,
    mode: currentMode,
    intensityLevel: 1,
    tags: ['corporate', 'anecdote'],
    correctAnswer: anec.answer,
  }));

  return [...allQuestions, ...customCorporateQuestions];
}

function selectCorporateQuestion(pool: QuestionForDeck[]): QuestionForDeck {
  const anecdotes = pool.filter((q) => q.id.startsWith('anec-'));
  if (anecdotes.length > 0) {
    return anecdotes[Math.floor(Math.random() * anecdotes.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function calculateFreeQuestionsUsed(isPremiumMode: boolean, roomRound: number): number {
  return isPremiumMode ? 0 : Math.min(roomRound, FREE_QUESTIONS_LIMIT);
}

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
  const freeQuestionsUsed = calculateFreeQuestionsUsed(isPremiumMode, room.round);

  if (isPremiumMode) {
    const activePlayers = players.filter((p) => p.userId);
    let anyPlayerCanAccess = false;

    for (const p of activePlayers) {
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
        'Ce mode premium nécessite le Pass 24h ou un abonnement Premium.',
        { details: { passPriceCents: MONETIZATION_CONFIG.PASS_24H_PRICE_CENTS } }
      );
    }
  }

  // DJ emotional filters
  let previousIntensity = 1;
  if (room.currentQuestionId) {
    const pq = await getQuestionById(room.currentQuestionId);
    previousIntensity = pq?.intensityLevel || 1;
  }

  const allQuestionsRaw = await listQuestionsForDeck(room.language || 'fr');
  const allQuestions = injectCorporateQuestions(room, allQuestionsRaw, currentMode);

  // Anti-répétition : exclure les questions déjà jouées dans cette room
  const existingConfig = (room.roundConfig || {}) as { playedQuestionIds?: string[] };
  const playedQuestionIds = new Set(existingConfig.playedQuestionIds || []);

  const pool = buildQuestionPool({
    allQuestions,
    currentMode,
    roomRound: room.round,
    previousIntensity,
    playedQuestionIds,
  });

  if (!pool.length) {
    throw new AppError('NOT_FOUND', 'Database is empty or missing content');
  }

  const selectedQuestion = room.targetType === 'CORPORATE' ? selectCorporateQuestion(pool) : pool[Math.floor(Math.random() * pool.length)];

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

  let newRound: number;
  let newStatus: string;
  try {
    const result = await advanceRoomRoundRpc({
      roomCode: room.code,
      expectedRound: room.round,
      expectedStatus: room.status,
      questionId: selectedQuestion.id,
      roundConfig,
    });
    newRound = result.round;
    newStatus = result.status;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as unknown as Record<string, unknown>)?.code;
    if (code === 'ROOM_ROUND_RACE' || msg.includes('Race condition')) {
      throw new AppError('CONFLICT', 'Une manche est déjà en cours');
    }
    throw new AppError('INTERNAL_ERROR', 'Erreur lors du démarrage de la manche');
  }

  const roundDuration = serverMode?.manifest?.roundDurationSeconds ?? 30;

  return {
    success: true,
    status: newStatus,
    round: newRound,
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

  try {
    await updateRoomStatusWithGuard(room.id, 'REVEALING', 'PLAYING');
  } catch {
    throw new AppError('CONFLICT', 'La révélation est déjà en cours ou la room n\'est plus en jeu');
  }

  const currentMode = room.currentMode || 'ICEBREAKER';
  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Question not found');

  const impostorPlayerId =
    currentMode === 'IMPOSTEUR' && room.roundConfig
      ? await findImpostorPlayerId(
          room.roundConfig,
          () => getPlayersInRoom(room.id),
          getPlayerHmac
        )
      : undefined;

  let responses: Awaited<ReturnType<typeof getResponsesByRoomAndQuestion>>;
  try {
    responses = await getResponsesByRoomAndQuestion(room.id, question.id);
  } catch (responsesError) {
    throw new AppError('INTERNAL_ERROR', 'Failed to fetch player responses', { cause: responsesError });
  }

  const gameMode = getServerGameMode(currentMode) || getServerGameMode('ICEBREAKER');
  if (!gameMode) {
    throw new AppError('INTERNAL_ERROR', 'No default game mode registered');
  }

  const roundConfigContext =
    typeof room.roundConfig === 'string'
      ? safeJsonParseRecord(room.roundConfig)
      : (room.roundConfig ?? null);

  const rawResponses: RawResponse[] = responses.map((r) => ({
    id: r.id!,
    playerId: r.playerId,
    answer: r.answer,
    timestamp: r.timestamp ?? new Date().toISOString(),
  }));

  const revealResult = computeRevealResult({
    question,
    responses: rawResponses,
    gameMode,
    roundConfig: roundConfigContext,
    impostorPlayerId,
  });

  const responseUpdates = revealResult.scores
    .filter((s) => s.rawResponseId)
    .map((s) => ({
      response_id: s.rawResponseId!,
      is_correct: s.isCorrect,
    }));

  const scoreUpserts = revealResult.scores.map((s) => ({
    player_id: s.playerId,
    points_to_add: s.pointsEarned,
  }));

  const updatedRoom = await updateRoomStatusWithGuard(room.id, 'DISCUSSION', 'REVEALING');

  try {
    await upsertRevealScoresRpc({
      roomId: room.id,
      responseUpdates,
      scoreUpserts,
    });
  } catch (rpcError) {
    throw new AppError('INTERNAL_ERROR', 'Failed to save scores', { cause: rpcError });
  }

  return {
    success: true,
    status: updatedRoom.status,
    scores: revealResult.scores,
    question: {
      correctAnswer: revealResult.correctAnswer,
      explanation: revealResult.explanation,
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

  let responseId: string;
  try {
    responseId = await recordVoteRpc({
      playerId,
      roomCode: roomCode.toUpperCase().trim(),
      questionId,
      answer: answer.trim(),
    });
  } catch (error) {
    const message = (error as Error)?.message || '';
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

  if (!responseId) {
    throw new AppError('INTERNAL_ERROR', 'Le vote a été enregistré mais aucun identifiant de réponse n\'a été retourné');
  }
  return { responseId };
}

// ---------- Active question ----------

export async function getActiveQuestionForPlayer(roomId: string, playerId: string): Promise<Question> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) throw new AppError('UNAUTHORIZED', 'Unauthorized: Player not registered in this room');

  const room = await getRoomById(roomId);
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
  const player = await getPlayerInRoom(playerId, roomId);
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
  const [allResponses, allScores] = await Promise.all([
    getResponsesForProfileInputs(roomId),
    getScoresByRoom(roomId),
  ]);

  const questionIds = Array.from(new Set(allResponses.map((r) => r.questionId).filter(Boolean)));

  const questions = questionIds.length > 0 ? await listQuestionsByIds(questionIds) : [];

  const questionModes = new Map<string, string>();
  for (const q of questions) {
    questionModes.set(q.id, q.mode);
  }

  const enrichedResponses = allResponses.map((r) => ({
    playerId: r.playerId,
    answer: r.answer,
    questionId: r.questionId,
    mode: questionModes.get(r.questionId) || 'UNKNOWN',
  }));

  return {
    enrichedResponses,
    questionModes,
    allScores,
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

  const player = await getPlayerInRoom(playerId, room.id);
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

  try {
    await updateRoomStatusWithGuard(room.id, 'ENDED', room.status);
  } catch (error) {
    throw new AppError('INTERNAL_ERROR', 'Impossible de terminer la salle', { cause: error });
  }

  // Construire les profils avant de mettre à jour les stats (badges/archetypes)
  const profiles = await buildProfilesForRoom({ ...room, status: 'ENDED' }, false);

  // Mettre à jour les stats Daily Bond + badges de chaque joueur authentifié
  const players = await getPlayersByRoomWithUserId(room.id);

  const userIds = new Set(players.map((p) => p.userId).filter(Boolean) as string[]);
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

export async function skipQuestion(roomCode: string, playerId: string): Promise<NextRoundResult> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');

  const players = await getPlayersInRoom(room.id);
  const p = players.find(player => player.id === playerId || (player.isHost && playerId === 'host'));
  if (!p) throw new AppError('FORBIDDEN', 'Action non autorisée');

  const currentMode = room.currentMode || 'ICEBREAKER';
  const serverMode = getServerGameMode(currentMode) || getServerGameMode('ICEBREAKER');

  let previousIntensity = 1;
  if (room.currentQuestionId) {
    const pq = await getQuestionById(room.currentQuestionId);
    previousIntensity = pq?.intensityLevel || 1;
  }

  const allQuestionsRaw = await listQuestionsForDeck(room.language || 'fr');
  const allQuestions = injectCorporateQuestions(room, allQuestionsRaw, currentMode);
  const existingConfig = (room.roundConfig || {}) as { playedQuestionIds?: string[] };
  const playedQuestionIds = new Set(existingConfig.playedQuestionIds || []);

  const pool = buildQuestionPool({
    allQuestions,
    currentMode,
    roomRound: room.round,
    previousIntensity,
    playedQuestionIds,
  });

  if (!pool.length) {
    throw new AppError('NOT_FOUND', 'Aucune question disponible');
  }

  const selectedQuestion = room.targetType === 'CORPORATE' ? selectCorporateQuestion(pool) : pool[Math.floor(Math.random() * pool.length)];
  const updatedPlayedIds = Array.from(new Set([...Array.from(playedQuestionIds), selectedQuestion.id]));

  const roundConfig = {
    ...existingConfig,
    playedQuestionIds: updatedPlayedIds,
  };

  let updatedRoom: Room;
  try {
    updatedRoom = await updateRoom(room.id, {
      currentQuestionId: selectedQuestion.id,
      roundConfig,
    });
  } catch {
    throw new AppError('CONFLICT', 'Impossible de passer la question');
  }

  const roundDuration = serverMode?.manifest?.roundDurationSeconds ?? 30;
  const isPremiumMode = serverMode?.manifest?.isPremium === true;
  const freeQuestionsUsed = calculateFreeQuestionsUsed(isPremiumMode, updatedRoom.round);

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
