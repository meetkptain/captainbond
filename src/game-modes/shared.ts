import { GameModeManifest, GameModeEngine } from './types';

export const dateNightManifest: GameModeManifest = {
  id: 'DATE_NIGHT',
  name: 'Date Night',
  description: 'Tête-à-tête pour deux. Strictement 2 joueurs.',
  minPlayers: 2,
  maxPlayers: 2,
  isPremium: true,
  category: 'soiree',
  roundDurationSeconds: 0,
  profilingCapabilities: { alignment: false, perspicacity: false, deception: false, verbalOnly: true },
  playSetup: { local: true, remote: false, solo: false },
};

export const baseEngine: GameModeEngine<unknown, unknown, unknown> = {
  validateResponse: (res) => ({ isValid: true, parsedAnswer: res }),
  calculateScores: () => [],
};
