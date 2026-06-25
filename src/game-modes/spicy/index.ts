import { GameModeManifest, GameModeEngine } from '../types';

export const spicyManifest: GameModeManifest = {
  id: 'SPICY',
  name: 'Spicy',
  description: 'Dilemmes moraux et débats enflammés. La table se sépare en deux.',
  roundDurationSeconds: 45,
  minPlayers: 3,
  maxPlayers: 10,
  isPremium: false,
  category: 'soiree',
  profilingCapabilities: { alignment: true, perspicacity: false, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: true }
};

export const spicyEngine: GameModeEngine<unknown, string, unknown> = {
  validateResponse: (res) => {
    const choice = typeof res === 'string' ? res.toUpperCase() : '';
    if (choice !== 'A' && choice !== 'B') {
      return { isValid: false, errorMessage: "Choix invalide", parsedAnswer: null };
    }
    return { isValid: true, parsedAnswer: choice as 'A' | 'B' };
  },
  calculateScores: (responses) => {
    const SKIP = '__SKIP__';
    const validResponses = responses.filter((r) => r.answer === 'A' || r.answer === 'B');

    if (validResponses.length === 0) {
      return responses.map((r) => ({ playerId: r.playerId, pointsEarned: 0, isCorrect: false }));
    }

    const countA = validResponses.filter((r) => r.answer === 'A').length;
    const countB = validResponses.length - countA;

    if (countA === countB) {
      return responses.map((r) => ({
        playerId: r.playerId,
        pointsEarned: r.answer === SKIP ? 0 : 1,
        isCorrect: r.answer !== SKIP,
      }));
    }

    const minorityChoice = countA < countB ? 'A' : 'B';

    return responses.map((r) => {
      if (r.answer === SKIP) {
        return { playerId: r.playerId, pointsEarned: 0, isCorrect: false };
      }
      const isMinority = r.answer === minorityChoice;
      return {
        playerId: r.playerId,
        pointsEarned: isMinority ? 2 : 1,
        isCorrect: isMinority,
      };
    });
  }
};
