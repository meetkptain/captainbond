import { GameModeManifest, GameModeEngine } from '../types';
import { safeJsonParse } from '@/lib/json';

function coerceSubmittedAnswer(raw: unknown): ImposteurStatement[] | ImposteurDetection | '__SKIP__' | null {
  if (raw === '__SKIP__') return raw;
  if (Array.isArray(raw) && raw.length === 3) return raw as ImposteurStatement[];
  if (typeof raw === 'object' && raw !== null && 'targetPlayerId' in raw) return raw as ImposteurDetection;
  if (typeof raw === 'string') {
    return safeJsonParse<ImposteurStatement[] | ImposteurDetection | null>(raw, null);
  }
  return null;
}

export interface ImposteurStatement {
  text: string;
  isLie: boolean;
}

export interface ImposteurDetection {
  targetPlayerId: string;
  lieIndex: number;
}

export type ImposteurDetectionsMap = Record<string, Record<string, number>>;

export interface ImposteurQuestion {
  correctAnswer?: string;
}

export interface ImposteurRoundContext {
  detections?: ImposteurDetectionsMap;
}

export const imposteurManifest: GameModeManifest = {
  id: 'IMPOSTEUR',
  name: 'Imposteur',
  description: '2 vérités, 1 mensonge. Bluffez vos amis et découvrez leurs mensonges.',
  roundDurationSeconds: 90,
  minPlayers: 3,
  maxPlayers: 10,
  isPremium: false,
  category: 'soiree',
  profilingCapabilities: { alignment: false, perspicacity: true, deception: true, verbalOnly: false },
  playSetup: { local: true, remote: false, solo: false }
};

function isSubmission(answer: unknown): answer is ImposteurStatement[] {
  return Array.isArray(answer) && answer.length === 3;
}

function isDetection(answer: unknown): answer is ImposteurDetection {
  return typeof answer === 'object' && answer !== null && 'targetPlayerId' in answer && 'lieIndex' in answer;
}

function findLieIndex(statements: ImposteurStatement[]): number {
  return statements.findIndex((s) => s.isLie);
}

function parseDetectionsContext(context: unknown): ImposteurDetectionsMap {
  if (!context || typeof context !== 'object') return {};
  const detections = (context as ImposteurRoundContext).detections;
  if (!detections || typeof detections !== 'object') return {};
  return detections;
}

export const imposteurEngine: GameModeEngine<ImposteurQuestion, ImposteurStatement[] | ImposteurDetection | '__SKIP__', unknown> = {
  validateResponse: (res) => {
    if (typeof res !== 'string' || res.trim() === '') {
      return { isValid: false, errorMessage: "Réponse invalide", parsedAnswer: null };
    }
    if (res === '__SKIP__') {
      return { isValid: true, parsedAnswer: res as '__SKIP__' };
    }

    const parsed = safeJsonParse<ImposteurStatement[] | ImposteurDetection | null>(res, null);
    if (parsed === null) {
      return { isValid: false, errorMessage: "Format invalide", parsedAnswer: null };
    }

    if (isSubmission(parsed)) {
      return { isValid: true, parsedAnswer: parsed };
    }

    if (isDetection(parsed)) {
      return { isValid: true, parsedAnswer: parsed };
    }

    return { isValid: false, errorMessage: "Format invalide", parsedAnswer: null };
  },
  calculateScores: (responses, _question, context) => {
    const submissions = new Map<string, ImposteurStatement[]>();

    for (const r of responses) {
      if (r.answer === '__SKIP__') continue;
      const parsed = coerceSubmittedAnswer(r.answer);
      if (!parsed) continue;
      if (isSubmission(parsed)) {
        submissions.set(r.playerId, parsed);
      }
    }

    const detections = parseDetectionsContext(context);
    const playerScores = new Map<string, number>();
    responses.forEach((r) => playerScores.set(r.playerId, 0));

    for (const [targetId, statements] of submissions) {
      const lieIndex = findLieIndex(statements);
      if (lieIndex === -1) continue;

      const targetDetections = detections[targetId] || {};
      let found = false;

      for (const [detectorId, votedIndex] of Object.entries(targetDetections)) {
        if (detectorId === targetId) continue;
        if (votedIndex === lieIndex) {
          playerScores.set(detectorId, (playerScores.get(detectorId) || 0) + 1);
          found = true;
        }
      }

      if (!found) {
        playerScores.set(targetId, (playerScores.get(targetId) || 0) + 2);
      }
    }

    return responses.map((r) => ({
      playerId: r.playerId,
      pointsEarned: playerScores.get(r.playerId) || 0,
      isCorrect: (playerScores.get(r.playerId) || 0) > 0,
    }));
  }
};
