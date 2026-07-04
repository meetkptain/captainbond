import {
  getRoomByCode,
  getPlayerInRoom,
  getPlayersInRoom,
  getResponsesForProfileInputs,
  getScoresByRoom,
  listQuestionsByIds,
} from '@/lib/db/repositories';
import { Room } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { getPlayerEntitlements, canViewProfile, canViewCoupleProfile, getRoomPassInfo } from '@/lib/monetization/entitlements';
import { calculateProfile, EnrichedResponse } from '@/lib/profiling/calculateProfile';

type EnrichedResponseInput = { playerId: string; answer: string; questionId: string; mode: string };

async function buildProfileInputs(roomId: string) {
  const [allResponses, allScores] = await Promise.all([
    getResponsesForProfileInputs(roomId),
    getScoresByRoom(roomId),
  ]);

  const questionIds = Array.from(new Set(allResponses.map((r) => r.questionId).filter(Boolean)));
  const questions = questionIds.length > 0 ? await listQuestionsByIds(questionIds) : [];

  const questionModes = new Map<string, string>();
  for (const q of questions) questionModes.set(q.id, q.mode);

  const enrichedResponses = allResponses.map((r) => ({ playerId: r.playerId, answer: r.answer, questionId: r.questionId, mode: questionModes.get(r.questionId) || 'UNKNOWN' }));

  return { enrichedResponses, questionModes, allScores };
}

function calculatePlayerProfile(
  playerId: string,
  enrichedResponses: EnrichedResponseInput[],
  allScores: Array<{ playerId: string; points: number }>
) {
  const playerResponses = enrichedResponses.filter((r) => r.playerId === playerId).map((r) => ({ answer: r.answer, isCorrect: null as boolean | null, questionId: r.questionId, mode: r.mode }));
  const playerScores = allScores.filter((s) => s.playerId === playerId).map((s) => ({ points: s.points }));
  return calculateProfile(playerResponses as EnrichedResponse[], enrichedResponses, playerScores);
}

export async function buildProfilesForRoom(room: Room, includeUnlockStatus: boolean): Promise<{ playerId: string; name: string; profile: ReturnType<typeof calculateProfile>; isUnlocked?: boolean }[]> {
  const players = await getPlayersInRoom(room.id);
  const nonHosts = players.filter((p) => !p.isHost);
  const roomPass = includeUnlockStatus ? await getRoomPassInfo(room.id) : { isActive: false };
  const roomPassActive = roomPass.isActive;
  const isCouple = room.currentMode === 'DATE_NIGHT';

  const { enrichedResponses, allScores } = await buildProfileInputs(room.id);
  const profiles: { playerId: string; name: string; profile: ReturnType<typeof calculateProfile>; isUnlocked?: boolean }[] = [];

  for (const player of nonHosts) {
    const profile = calculatePlayerProfile(player.id, enrichedResponses, allScores);
    const entry: { playerId: string; name: string; profile: ReturnType<typeof calculateProfile>; isUnlocked?: boolean } = { playerId: player.id, name: player.name, profile };

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

export async function getPlayerGameProfile(playerId: string, roomCode: string): Promise<{ profile: ReturnType<typeof calculateProfile>; currentMode?: string | null; isUnlocked: boolean }> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');

  const player = await getPlayerInRoom(playerId, room.id);
  if (!player) throw new AppError('UNAUTHORIZED', 'Joueur introuvable dans cette salle');
  if (room.status !== 'ENDED') throw new AppError('BAD_REQUEST', 'La partie n\'est pas encore terminée');

  const { enrichedResponses, allScores } = await buildProfileInputs(room.id);
  const profile = calculatePlayerProfile(playerId, enrichedResponses, allScores);

  const entitlements = await getPlayerEntitlements(playerId);
  const isCouple = room.currentMode === 'DATE_NIGHT';
  const isUnlocked = isCouple ? canViewCoupleProfile(entitlements) : canViewProfile(entitlements);

  return { profile, currentMode: room.currentMode, isUnlocked };
}

export async function getRoomGameProfiles(roomCode: string, hostId: string): Promise<{ profiles: Awaited<ReturnType<typeof buildProfilesForRoom>>; roomPassActive: boolean }> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  if (room.hostId !== hostId) throw new AppError('FORBIDDEN', 'Seul l\'hôte peut effectuer cette action');

  const profiles = await buildProfilesForRoom(room, true);
  const roomPass = await getRoomPassInfo(room.id);
  return { profiles, roomPassActive: roomPass.isActive };
}
