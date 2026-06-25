import TVView from './TVView';
import PlayerController from './PlayerController';
import { GameModeEngine, GameModeManifest } from '../types';

export const deepConnectionManifest: GameModeManifest = {
  id: 'DEEP_CONNECTION',
  name: 'Deep Connection',
  description: 'Vulnérabilité et confidences. Pas de chronomètre.',
  minPlayers: 3,
  maxPlayers: 6,
  isPremium: true,
  category: 'soiree',
  roundDurationSeconds: 0,
  profilingCapabilities: { alignment: false, perspicacity: true, deception: false, verbalOnly: false },
  playSetup: { local: true, remote: true, solo: false }
};

export const deepConnectionEngine: GameModeEngine<unknown, string, unknown> = {
  validateResponse: (res) => {
    const text = typeof res === 'string' ? res.trim() : '';
    if (!text) {
      return { isValid: false, errorMessage: "Réponse vide", parsedAnswer: null };
    }
    return { isValid: true, parsedAnswer: text };
  },
  calculateScores: (responses) => {
    const SKIP = '__SKIP__';
    return responses.map((r) => ({
      playerId: r.playerId,
      pointsEarned: r.answer === SKIP ? 0 : 1,
      isCorrect: r.answer !== SKIP,
    }));
  },
};

export { TVView as DeepConnectionTVView, PlayerController as DeepConnectionPlayerController };
