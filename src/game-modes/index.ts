import dynamic from 'next/dynamic';
import { GameModeManifest, GameModeEngine, GameModeTVView, GameModePlayerController } from './types';
import { deepConnectionManifest, deepConnectionEngine } from './deep-connection';
import { icebreakerManifest, icebreakerEngine } from './icebreaker';
import { spicyManifest, spicyEngine } from './spicy';
import { imposteurManifest, imposteurEngine } from './imposteur';
import { dateNightManifest, baseEngine } from './shared';
import { familyManifest, familyEngine } from './family';
import { mostLikelyToManifest, mostLikelyToEngine } from './most-likely-to';
import { missionImpossibleManifest, missionImpossibleEngine } from './mission-impossible';

export interface RegisteredGameMode {
  manifest: GameModeManifest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  engine: GameModeEngine<any, any, any>;
  TVView: GameModeTVView;
  PlayerController: GameModePlayerController;
  HostView?: React.ComponentType<{
    roomCode: string;
    hostId: string;
    hostToken: string;
    players: { id: string; name: string }[];
    onExit: () => void;
  }>;
}





export const gameModesRegistry: Record<string, RegisteredGameMode> = {
  'ICEBREAKER': {
    manifest: icebreakerManifest,
    engine: icebreakerEngine,
    TVView: dynamic(() => import('./icebreaker/TVView').then(mod => mod.IcebreakerTVView as GameModeTVView)),
    PlayerController: dynamic(() => import('./icebreaker/PlayerController').then(mod => mod.IcebreakerPlayerController as GameModePlayerController)),
    HostView: dynamic(() => import('./icebreaker/HostView').then(mod => mod.IcebreakerHostView))
  },
  'DEEP_CONNECTION': {
    manifest: deepConnectionManifest,
    engine: deepConnectionEngine,
    TVView: dynamic(() => import('./deep-connection/TVView').then(mod => mod.default as GameModeTVView)),
    PlayerController: dynamic(() => import('./deep-connection/PlayerController').then(mod => mod.default as GameModePlayerController)),
    HostView: dynamic(() => import('./deep-connection/HostView').then(mod => mod.default))
  },
  'SPICY': {
    manifest: spicyManifest,
    engine: spicyEngine,
    TVView: dynamic(() => import('./spicy/TVView').then(mod => mod.SpicyTVView as GameModeTVView)),
    PlayerController: dynamic(() => import('./spicy/PlayerController').then(mod => mod.SpicyPlayerController as GameModePlayerController)),
    HostView: dynamic(() => import('./spicy/HostView').then(mod => mod.SpicyHostView))
  },
  'IMPOSTEUR': {
    manifest: imposteurManifest,
    engine: imposteurEngine,
    TVView: dynamic(() => import('./imposteur/TVView').then(mod => mod.ImposteurTVView as GameModeTVView)),
    PlayerController: dynamic(() => import('./imposteur/PlayerController').then(mod => mod.ImposteurPlayerController as GameModePlayerController)),
    HostView: dynamic(() => import('./imposteur/HostView').then(mod => mod.ImposteurHostView))
  },
  'DATE_NIGHT': {
    manifest: dateNightManifest,
    engine: baseEngine,
    TVView: dynamic(() => import('./date-night/TVView').then(mod => mod.default as GameModeTVView)),
    PlayerController: dynamic(() => import('./date-night/PlayerController').then(mod => mod.default as GameModePlayerController)),
    HostView: dynamic(() => import('./date-night/HostView').then(mod => mod.default))
  },
  'FAMILY': {
    manifest: familyManifest,
    engine: familyEngine,
    TVView: dynamic(() => import('./family/TVView').then(mod => mod.default as GameModeTVView)),
    PlayerController: dynamic(() => import('./family/PlayerController').then(mod => mod.default as GameModePlayerController)),
    HostView: dynamic(() => import('./family/HostView').then(mod => mod.default))
  },
  'MOST_LIKELY_TO': {
    manifest: mostLikelyToManifest,
    engine: mostLikelyToEngine,
    TVView: dynamic(() => import('./most-likely-to/TVView').then(mod => mod.MostLikelyToTVView as GameModeTVView)),
    PlayerController: dynamic(() => import('./most-likely-to/PlayerController').then(mod => mod.MostLikelyToPlayerController as GameModePlayerController)),
    HostView: dynamic(() => import('./most-likely-to/HostView').then(mod => mod.MostLikelyToHostView))
  },
  'MISSION_IMPOSSIBLE': {
    manifest: missionImpossibleManifest,
    engine: missionImpossibleEngine,
    TVView: dynamic(() => import('./mission-impossible/TVView').then(mod => mod.MissionImpossibleTVView as GameModeTVView)),
    PlayerController: dynamic(() => import('./mission-impossible/PlayerController').then(mod => mod.MissionImpossiblePlayerController as GameModePlayerController))
  }
};

export type GameModeId = keyof typeof gameModesRegistry;

export function getGameMode(id: string): RegisteredGameMode | undefined {
  return gameModesRegistry[id as GameModeId];
}
