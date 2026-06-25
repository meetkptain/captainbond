import { GameModeManifest, GameModeEngine } from '../types';

export const icebreakerManifest: GameModeManifest = {
  id: 'ICEBREAKER',
  name: 'Icebreaker',
  description: 'Le Tribunal Social. Votez pour vos amis.',
  roundDurationSeconds: 30,
  minPlayers: 3,
  maxPlayers: 10,
  isPremium: false,
  category: 'soiree',
  profilingCapabilities: { alignment: true, perspicacity: true, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: false }
};

export const icebreakerEngine: GameModeEngine<unknown, string, unknown> = {
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

    const maxVotes = Math.max(...voteCounts.values());
    const winners = new Set(
      Array.from(voteCounts.entries())
        .filter(([, count]) => count === maxVotes)
        .map(([id]) => id)
    );

    return responses.map((r) => {
      if (r.answer === SKIP) {
        return { playerId: r.playerId, pointsEarned: 0, isCorrect: false };
      }
      const isWinner = winners.has(r.answer);
      return {
        playerId: r.playerId,
        pointsEarned: isWinner ? 1 : 0,
        isCorrect: isWinner,
      };
    });
  }
};
