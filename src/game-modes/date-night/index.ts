import { GameModeManifest } from '../types';
import DateNightTVView from './TVView';
import DateNightPlayerController from './PlayerController';

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

const baseEngine = {
  validateResponse: (res: string) => ({ isValid: true, parsedAnswer: res }),
  calculateScores: () => [],
};

export const DateNightMode = {
  manifest: dateNightManifest,
  engine: baseEngine,
  TVView: DateNightTVView,
  PlayerController: DateNightPlayerController,
};
