import { GameModeManifest, GameModeEngine } from '../types';

export const familyManifest: GameModeManifest = {
  id: 'FAMILY',
  name: 'Family',
  description: 'Questions positives et scoring inversé : en famille, on récompense l\'humilité.',
  roundDurationSeconds: 30,
  minPlayers: 3,
  maxPlayers: 10,
  isPremium: true,
  category: 'standard',
  profilingCapabilities: { alignment: true, perspicacity: false, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: false }
};

export const familyEngine: GameModeEngine<unknown, string, unknown> = {
  validateResponse: (res) => {
    if (typeof res !== 'string' || res.trim() === '') {
      return { isValid: false, errorMessage: "Vote invalide", parsedAnswer: null };
    }
    return { isValid: true, parsedAnswer: res.trim() };
  },
  calculateScores: (responses) => {
    const SKIP = '__SKIP__';
    const validResponses = responses.filter((r) => r.answer !== SKIP);
    if (validResponses.length === 0) {
      return responses.map((r) => ({ playerId: r.playerId, pointsEarned: 0, isCorrect: false }));
    }

    const voteCounts = new Map<string, number>();
    for (const r of validResponses) {
      const targetId = r.answer;
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    }

    const minVotes = Math.min(...voteCounts.values());
    const winners = new Set(
      Array.from(voteCounts.entries())
        .filter(([, count]) => count === minVotes)
        .map(([id]) => id)
    );

    return responses.map((r) => {
      if (r.answer === SKIP) {
        return { playerId: r.playerId, pointsEarned: 0, isCorrect: false };
      }
      const isWinner = winners.has(r.playerId);
      return {
        playerId: r.playerId,
        pointsEarned: isWinner ? 1 : 0,
        isCorrect: isWinner,
      };
    });
  }
};
