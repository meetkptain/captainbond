import {
  getRoomByCode,
  getPlayersInRoom,
  getPlayersByRoomWithUserId,
  getQuestionById,
  updateRoom,
  updateRoomStatusWithGuard,
  getResponsesByRoomAndQuestion,
  upsertRevealScoresRpc,
  advanceRoomRoundRpc,
} from '@/lib/db/repositories';
import { listQuestionsForDeck } from '@/lib/db/repositories/roomQuestionRepository';
import { Room } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { getServerGameMode } from '@/game-modes/manifests';
import { getUserEntitlements, roomHasActivePass, canAccessMode } from '@/lib/monetization/entitlements';
import { buildQuestionPool, QuestionForDeck } from '@/lib/questions/deck';
import { MONETIZATION_CONFIG } from '@/lib/config/monetization';
import { getPlayerHmac } from '@/lib/crypto';
import { computeRevealResult, findImpostorPlayerId, RawResponse } from '@/lib/game/reveal';
import { safeJsonParseRecord } from '@/lib/json';
import { recordGamePlayed, GameSummary } from './statsService';
import { buildProfilesForRoom } from './profileService';

const FREE_QUESTIONS_LIMIT = 3;

function injectCorporateQuestions(
  room: Room,
  allQuestions: QuestionForDeck[],
  currentMode: string
): QuestionForDeck[] {
  if (room.targetType !== 'CORPORATE') return allQuestions;
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
    throw new AppError('BAD_REQUEST', `Ce mode nécessite entre ${modeMinPlayers} et ${modeMaxPlayers} joueurs. Actuellement : ${nonHostCount}.`);
  }

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
      throw new AppError('FORBIDDEN', 'Ce mode premium nécessite le Pass 24h ou un abonnement Premium.', { details: { passPriceCents: MONETIZATION_CONFIG.PASS_24H_PRICE_CENTS } });
    }
  }

  let previousIntensity = 1;
  if (room.currentQuestionId) {
    const pq = await getQuestionById(room.currentQuestionId);
    previousIntensity = pq?.intensityLevel || 1;
  }

  const allQuestionsRaw = await listQuestionsForDeck(room.language || 'fr');
  const allQuestions = injectCorporateQuestions(room, allQuestionsRaw, currentMode);
  const existingConfig = (room.roundConfig || {}) as { playedQuestionIds?: string[] };
  const playedQuestionIds = new Set(existingConfig.playedQuestionIds || []);
  const pool = buildQuestionPool({ allQuestions, currentMode, roomRound: room.round, previousIntensity, playedQuestionIds });

  if (!pool.length) throw new AppError('NOT_FOUND', 'Database is empty or missing content');

  const selectedQuestion = room.targetType === 'CORPORATE' ? selectCorporateQuestion(pool) : pool[Math.floor(Math.random() * pool.length)];
  const updatedPlayedIds = Array.from(new Set([...Array.from(playedQuestionIds), selectedQuestion.id]));

  let roundConfig: Record<string, unknown> = { playedQuestionIds: updatedPlayedIds };
  if (currentMode === 'IMPOSTEUR') {
    const nonHosts = players.filter((p) => !p.isHost);
    if (nonHosts.length < 2) throw new AppError('BAD_REQUEST', 'L\'Imposteur nécessite au moins 3 joueurs (2 civils + 1 intrus).');
    roundConfig = { ...roundConfig, mode: 'IMPOSTEUR', detections: {}, questionId: selectedQuestion.id, roundDuration: 120 };
  }

  let newRound: number;
  let newStatus: string;
  try {
    const result = await advanceRoomRoundRpc({ roomCode: room.code, expectedRound: room.round, expectedStatus: room.status, questionId: selectedQuestion.id, roundConfig });
    newRound = result.round;
    newStatus = result.status;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as unknown as Record<string, unknown>)?.code;
    if (code === 'ROOM_ROUND_RACE' || msg.includes('Race condition')) throw new AppError('CONFLICT', 'Une manche est déjà en cours');
    throw new AppError('INTERNAL_ERROR', 'Erreur lors du démarrage de la manche');
  }

  return {
    success: true, status: newStatus, round: newRound, roundDuration: serverMode?.manifest?.roundDurationSeconds ?? 30,
    freeQuestionsUsed, freeQuestionsLimit: FREE_QUESTIONS_LIMIT,
    question: { id: selectedQuestion.id, text: selectedQuestion.text, intensityLevel: selectedQuestion.intensityLevel, tags: selectedQuestion.tags || [] },
  };
}

export interface ScoreUpdate {
  playerId: string; pointsEarned: number; isCorrect: boolean;
}

export interface RevealResult {
  success: boolean; status: string; scores: ScoreUpdate[];
  question: { correctAnswer?: string; explanation?: string | null };
}

export async function revealRound(roomCode: string, hostId: string): Promise<RevealResult> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);
  if (!room.currentQuestionId) throw new AppError('BAD_REQUEST', 'No active question found to calculate scores for');

  try { await updateRoomStatusWithGuard(room.id, 'REVEALING', 'PLAYING'); }
  catch { throw new AppError('CONFLICT', 'La révélation est déjà en cours ou la room n\'est plus en jeu'); }

  const currentMode = room.currentMode || 'ICEBREAKER';
  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Question not found');

  const impostorPlayerId = currentMode === 'IMPOSTEUR' && room.roundConfig
    ? await findImpostorPlayerId(room.roundConfig, () => getPlayersInRoom(room.id), getPlayerHmac)
    : undefined;

  let responses: ReturnType<typeof getResponsesByRoomAndQuestion> extends Promise<infer R> ? R : never;
  try { responses = await getResponsesByRoomAndQuestion(room.id, question.id); }
  catch (responsesError) { throw new AppError('INTERNAL_ERROR', 'Failed to fetch player responses', { cause: responsesError }); }

  const gameMode = getServerGameMode(currentMode) || getServerGameMode('ICEBREAKER');
  if (!gameMode) throw new AppError('INTERNAL_ERROR', 'No default game mode registered');

  const roundConfigContext = typeof room.roundConfig === 'string' ? safeJsonParseRecord(room.roundConfig) : (room.roundConfig ?? null);
  const rawResponses: RawResponse[] = (responses as any[]).map((r: any) => ({ id: r.id!, playerId: r.playerId, answer: r.answer, timestamp: r.timestamp ?? new Date().toISOString() }));

  const revealResult = computeRevealResult({ question, responses: rawResponses, gameMode, roundConfig: roundConfigContext, impostorPlayerId });

  const responseUpdates = revealResult.scores.filter((s) => s.rawResponseId).map((s) => ({ response_id: s.rawResponseId!, is_correct: s.isCorrect }));
  const scoreUpserts = revealResult.scores.map((s) => ({ player_id: s.playerId, points_to_add: s.pointsEarned }));

  const updatedRoom = await updateRoomStatusWithGuard(room.id, 'DISCUSSION', 'REVEALING');
  try { await upsertRevealScoresRpc({ roomId: room.id, responseUpdates, scoreUpserts }); }
  catch (rpcError) { throw new AppError('INTERNAL_ERROR', 'Failed to save scores', { cause: rpcError }); }

  return { success: true, status: updatedRoom.status, scores: revealResult.scores, question: { correctAnswer: revealResult.correctAnswer, explanation: revealResult.explanation } };
}

export async function endRoomAndBuildProfiles(roomCode: string, hostId: string): Promise<{ status: string; profiles: Awaited<ReturnType<typeof buildProfilesForRoom>> }> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  checkHost(room, hostId);

  try { await updateRoomStatusWithGuard(room.id, 'ENDED', room.status); }
  catch (error) { throw new AppError('INTERNAL_ERROR', 'Impossible de terminer la salle', { cause: error }); }

  const profiles = await buildProfilesForRoom({ ...room, status: 'ENDED' }, false);
  const players = await getPlayersByRoomWithUserId(room.id);
  const userIds = new Set(players.map((p) => p.userId).filter(Boolean) as string[]);

  await Promise.allSettled(
    Array.from(userIds).map((userId) => {
      const player = players?.find((p) => p.userId === userId);
      const profileEntry = profiles.find((entry) => entry.playerId === player?.id);
      return recordGamePlayed(userId, {
        wasHost: player?.isHost ?? false,
        archetype: profileEntry?.profile?.archetype,
        axes: profileEntry?.profile?.axes,
      } as GameSummary);
    })
  );

  return { status: 'ENDED', profiles };
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
  const pool = buildQuestionPool({ allQuestions, currentMode, roomRound: room.round, previousIntensity, playedQuestionIds });
  if (!pool.length) throw new AppError('NOT_FOUND', 'Aucune question disponible');

  const selectedQuestion = room.targetType === 'CORPORATE' ? selectCorporateQuestion(pool) : pool[Math.floor(Math.random() * pool.length)];
  const updatedPlayedIds = Array.from(new Set([...Array.from(playedQuestionIds), selectedQuestion.id]));
  const roundConfig = { ...existingConfig, playedQuestionIds: updatedPlayedIds };

  let updatedRoom: Room;
  try { updatedRoom = await updateRoom(room.id, { currentQuestionId: selectedQuestion.id, roundConfig }); }
  catch { throw new AppError('CONFLICT', 'Impossible de passer la question'); }

  return {
    success: true, status: updatedRoom.status, round: updatedRoom.round,
    roundDuration: serverMode?.manifest?.roundDurationSeconds ?? 30,
    freeQuestionsUsed: calculateFreeQuestionsUsed(serverMode?.manifest?.isPremium === true, updatedRoom.round),
    freeQuestionsLimit: FREE_QUESTIONS_LIMIT,
    question: { id: selectedQuestion.id, text: selectedQuestion.text, intensityLevel: selectedQuestion.intensityLevel, tags: selectedQuestion.tags || [] },
  };
}
