import { getServerGameMode } from '@/game-modes/manifests';
import { safeJsonParseRecord } from '@/lib/json';
import type { Question } from '@/lib/db/types';

export interface RawResponse {
  id: string;
  playerId: string;
  answer: unknown;
  timestamp: string;
}

export interface ValidatedResponse {
  playerId: string;
  answer: unknown;
  timeSpentMs: number;
  rawResponseId: string;
}

export interface RevealScoreItem {
  playerId: string;
  pointsEarned: number;
  isCorrect: boolean;
  rawResponseId?: string;
}

export interface RevealResult {
  correctAnswer?: string;
  explanation?: string | null;
  scores: RevealScoreItem[];
}

export interface ComputeRevealInput {
  question: Question;
  responses: RawResponse[];
  gameMode: NonNullable<ReturnType<typeof getServerGameMode>>;
  roundConfig: Record<string, unknown> | null;
  impostorPlayerId?: string;
}

export interface ScoreRecord {
  id: string;
  roomId: string;
  playerId: string;
  points: number;
}

export function computeRevealResult(input: ComputeRevealInput): RevealResult {
  const { question, responses, gameMode, roundConfig, impostorPlayerId } = input;
  const workingQuestion = { ...question };
  if (impostorPlayerId) {
    workingQuestion.correctAnswer = impostorPlayerId;
  }

  const mappedResponses: ValidatedResponse[] = [];
  for (const r of responses) {
    const { isValid, parsedAnswer } = gameMode.engine.validateResponse(r.answer as string, workingQuestion);
    if (isValid) {
      mappedResponses.push({
        playerId: r.playerId,
        answer: parsedAnswer,
        timeSpentMs: new Date(r.timestamp).getTime(),
        rawResponseId: r.id,
      });
    }
  }

  const calculatedScores = gameMode.engine.calculateScores(mappedResponses, workingQuestion, roundConfig);

  const scores = calculatedScores.map((scoreItem) => {
    const resp = mappedResponses.find((m) => m.playerId === scoreItem.playerId);
    return {
      playerId: scoreItem.playerId,
      pointsEarned: scoreItem.pointsEarned,
      isCorrect: scoreItem.isCorrect,
      rawResponseId: resp?.rawResponseId,
    };
  });

  return {
    correctAnswer: workingQuestion.correctAnswer,
    explanation: workingQuestion.explanation,
    scores,
  };
}

export async function findImpostorPlayerId(
  roomId: string,
  roundConfig: unknown,
  getPlayers: () => Promise<Array<{ id: string }>>,
  getHmac: (playerId: string) => Promise<string>
): Promise<string | undefined> {
  const config = (
    typeof roundConfig === 'string' ? safeJsonParseRecord(roundConfig) : roundConfig
  ) as Record<string, unknown> | null;
  if (!config?.imposterHash) return undefined;
  const players = await getPlayers();
  for (const p of players) {
    const hash = await getHmac(p.id);
    if (hash === config.imposterHash) {
      return p.id;
    }
  }
  return undefined;
}
