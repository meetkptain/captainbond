import { GameModeManifest, GameModeEngine } from '../types';

export const mostLikelyToManifest: GameModeManifest = {
  id: 'MOST_LIKELY_TO',
  name: 'Most Likely To',
  description: 'Qui est le plus susceptible de… ? Votez pour votre premier et second choix.',
  roundDurationSeconds: 45,
  minPlayers: 3,
  maxPlayers: 10,
  isPremium: true,
  category: 'soiree',
  profilingCapabilities: { alignment: true, perspicacity: false, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: false }
};

interface MostLikelyToAnswer {
  first: string;
  second: string;
}

const SKIP = '__SKIP__';

function parseAnswer(answer: string): MostLikelyToAnswer | null {
  if (answer === SKIP) return null;
  try {
    const parsed = JSON.parse(answer) as Partial<MostLikelyToAnswer>;
    if (parsed.first && parsed.second && parsed.first !== parsed.second) {
      return { first: parsed.first, second: parsed.second };
    }
  } catch {
    // Legacy single vote fallback
    return { first: answer, second: answer };
  }
  return null;
}

export const mostLikelyToEngine: GameModeEngine<unknown, string, unknown> = {
  validateResponse: (res) => {
    if (typeof res !== 'string' || res.trim() === '') {
      return { isValid: false, errorMessage: "Vote invalide", parsedAnswer: null };
    }
    if (res === SKIP) {
      return { isValid: true, parsedAnswer: res };
    }
    const parsed = parseAnswer(res);
    if (!parsed) {
      return { isValid: false, errorMessage: "Votez pour deux joueurs différents", parsedAnswer: null };
    }
    return { isValid: true, parsedAnswer: res };
  },
  calculateScores: (responses) => {
    const scores = new Map<string, number>();

    for (const r of responses) {
      const parsed = parseAnswer(r.answer as string);
      if (!parsed) continue;
      scores.set(parsed.first, (scores.get(parsed.first) || 0) + 3);
      scores.set(parsed.second, (scores.get(parsed.second) || 0) + 1);
    }

    const maxScore = scores.size > 0 ? Math.max(...scores.values()) : 0;
    const winners = new Set(
      Array.from(scores.entries())
        .filter(([, score]) => score === maxScore && maxScore > 0)
        .map(([id]) => id)
    );

    return responses.map((r) => {
      const parsed = parseAnswer(r.answer as string);
      if (!parsed) {
        return { playerId: r.playerId, pointsEarned: 0, isCorrect: false };
      }
      const votedFor = winners.has(parsed.first) || winners.has(parsed.second);
      return {
        playerId: r.playerId,
        pointsEarned: votedFor ? 1 : 0,
        isCorrect: votedFor,
      };
    });
  }
};
