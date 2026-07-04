import dynamic from 'next/dynamic';
import { GameModeManifest, GameModeEngine, GameModeTVView, GameModePlayerController } from './types';
import { gameModesServerRegistry } from './manifests';

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

const componentRegistry: Record<string, () => Promise<{
  TVView: GameModeTVView;
  PlayerController: GameModePlayerController;
  HostView?: React.ComponentType<any>;
}>> = {
  ICEBREAKER: () => Promise.all([
    import('./icebreaker/TVView').then(mod => mod.IcebreakerTVView as GameModeTVView),
    import('./icebreaker/PlayerController').then(mod => mod.IcebreakerPlayerController as GameModePlayerController),
    import('./icebreaker/HostView').then(mod => mod.IcebreakerHostView),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  DEEP_CONNECTION: () => Promise.all([
    import('./deep-connection/TVView').then(mod => mod.default as GameModeTVView),
    import('./deep-connection/PlayerController').then(mod => mod.default as GameModePlayerController),
    import('./deep-connection/HostView').then(mod => mod.default),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  SPICY: () => Promise.all([
    import('./spicy/TVView').then(mod => mod.SpicyTVView as GameModeTVView),
    import('./spicy/PlayerController').then(mod => mod.SpicyPlayerController as GameModePlayerController),
    import('./spicy/HostView').then(mod => mod.SpicyHostView),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  IMPOSTEUR: () => Promise.all([
    import('./imposteur/TVView').then(mod => mod.ImposteurTVView as GameModeTVView),
    import('./imposteur/PlayerController').then(mod => mod.ImposteurPlayerController as GameModePlayerController),
    import('./imposteur/HostView').then(mod => mod.ImposteurHostView),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  DATE_NIGHT: () => Promise.all([
    import('./date-night/TVView').then(mod => mod.default as GameModeTVView),
    import('./date-night/PlayerController').then(mod => mod.default as GameModePlayerController),
    import('./date-night/HostView').then(mod => mod.default),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  FAMILY: () => Promise.all([
    import('./family/TVView').then(mod => mod.default as GameModeTVView),
    import('./family/PlayerController').then(mod => mod.default as GameModePlayerController),
    import('./family/HostView').then(mod => mod.default),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  MOST_LIKELY_TO: () => Promise.all([
    import('./most-likely-to/TVView').then(mod => mod.MostLikelyToTVView as GameModeTVView),
    import('./most-likely-to/PlayerController').then(mod => mod.MostLikelyToPlayerController as GameModePlayerController),
    import('./most-likely-to/HostView').then(mod => mod.MostLikelyToHostView),
  ]).then(([TVView, PlayerController, HostView]) => ({ TVView, PlayerController, HostView })),
  MISSION_IMPOSSIBLE: () => Promise.all([
    import('./mission-impossible/TVView').then(mod => mod.MissionImpossibleTVView as GameModeTVView),
    import('./mission-impossible/PlayerController').then(mod => mod.MissionImpossiblePlayerController as GameModePlayerController),
  ]).then(([TVView, PlayerController]) => ({ TVView, PlayerController })),
};

const clientsCache = new Map<string, RegisteredGameMode>();

function buildClientEntry(modeId: string): RegisteredGameMode {
  const serverEntry = gameModesServerRegistry[modeId];
  if (!serverEntry) {
    throw new Error(`Game mode "${modeId}" registered in client registry but not found in server registry`);
  }

  const componentLoader = componentRegistry[modeId];
  const components = componentLoader();

  return {
    manifest: serverEntry.manifest,
    engine: serverEntry.engine,
    TVView: dynamic(() => components.then(c => c.TVView)),
    PlayerController: dynamic(() => components.then(c => c.PlayerController)),
    HostView: components.then(c => c.HostView) as unknown as undefined,
  };
}

export const gameModesRegistry: Record<string, RegisteredGameMode> = new Proxy({} as Record<string, RegisteredGameMode>, {
  get(_, prop: string) {
    if (typeof prop !== 'string') return undefined;
    if (clientsCache.has(prop)) return clientsCache.get(prop);
    if (prop in gameModesServerRegistry) {
      const entry = buildClientEntry(prop);
      clientsCache.set(prop, entry);
      return entry;
    }
    return undefined;
  },
  ownKeys() {
    return Object.keys(gameModesServerRegistry);
  },
  getOwnPropertyDescriptor(_, prop) {
    return {
      enumerable: true,
      configurable: true,
      value: clientsCache.get(String(prop)) ?? (prop in gameModesServerRegistry ? buildClientEntry(String(prop)) : undefined),
    };
  },
});

export type GameModeId = keyof typeof gameModesServerRegistry;

export function getGameMode(id: string): RegisteredGameMode | undefined {
  return gameModesRegistry[id];
}
