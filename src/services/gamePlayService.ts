import {
  getRoomByCode,
  getRoomById,
  getPlayerInRoom,
  getQuestionById,
  recordVoteRpc,
} from '@/lib/db/repositories';
import { Question } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import { getPlayerHmac } from '@/lib/crypto';
import { safeJsonParseRecord } from '@/lib/json';

export async function recordVote(
  playerId: string,
  roomCode: string,
  questionId: string,
  answer: string
): Promise<{ responseId: string }> {
  const room = await getRoomByCode(roomCode);
  if (!room) throw new AppError('NOT_FOUND', 'Salle introuvable');
  if (room.status !== 'PLAYING') throw new AppError('FORBIDDEN', 'La partie n\'est pas en cours');
  if (room.currentQuestionId !== questionId) throw new AppError('FORBIDDEN', 'Cette question n\'est pas active');

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
    if (message.includes('déjà voté')) throw new AppError('CONFLICT', 'You have already submitted an answer for this question');
    if (message.includes('non inscrit')) throw new AppError('FORBIDDEN', 'Player is not registered in this lobby');
    if (message.includes('partie non en cours')) throw new AppError('FORBIDDEN', 'Room is not currently in playing mode');
    throw new AppError('INTERNAL_ERROR', 'Failed to record response', { cause: error });
  }

  if (!responseId) throw new AppError('INTERNAL_ERROR', 'Le vote a été enregistré mais aucun identifiant de réponse n\'a été retourné');
  return { responseId };
}

export async function getActiveQuestionForPlayer(roomId: string, playerId: string): Promise<Question> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) throw new AppError('UNAUTHORIZED', 'Unauthorized: Player not registered in this room');

  const room = await getRoomById(roomId);
  if (!room) throw new AppError('NOT_FOUND', 'Room not found');
  if (room.status !== 'PLAYING') throw new AppError('BAD_REQUEST', 'No active question: Room is not in playing mode');
  if (!room.currentQuestionId) throw new AppError('NOT_FOUND', 'No active question found for this room');

  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Active question not found');

  return question;
}

export async function getImposteurRole(playerId: string, roomId: string): Promise<{ isImpostor: boolean; word: string; role: string }> {
  const player = await getPlayerInRoom(playerId, roomId);
  if (!player) throw new AppError('UNAUTHORIZED', 'Unauthorized: Player not registered in this room');

  const room = await getRoomById(roomId);
  if (!room) throw new AppError('NOT_FOUND', 'Room not found');
  if (room.currentMode !== 'IMPOSTEUR') throw new AppError('BAD_REQUEST', 'Room is not in IMPOSTEUR mode');
  if (!room.currentQuestionId) throw new AppError('NOT_FOUND', 'No active question found for this room');

  const question = await getQuestionById(room.currentQuestionId);
  if (!question) throw new AppError('NOT_FOUND', 'Active question not found');

  interface ImposteurQuestionMetadata { wordForCivil: string; wordForImpostor: string; }
  const metadata = (typeof question.metadata === 'string' ? safeJsonParseRecord(question.metadata) : question.metadata) as ImposteurQuestionMetadata | null;
  if (!metadata?.wordForCivil || !metadata?.wordForImpostor) throw new AppError('INTERNAL_ERROR', 'Question metadata is missing word assignments');

  const config = typeof room.roundConfig === 'string' ? safeJsonParseRecord(room.roundConfig) : room.roundConfig;
  if (!config?.imposterHash) throw new AppError('INTERNAL_ERROR', 'Room configuration is missing imposter assignment');

  const calculatedPlayerHash = await getPlayerHmac(playerId);
  const isImpostor = calculatedPlayerHash === config.imposterHash;

  return { isImpostor, word: isImpostor ? metadata.wordForImpostor : metadata.wordForCivil, role: isImpostor ? 'INTRUS' : 'CIVIL' };
}
