import { GameModeManifest, GameModeEngine } from './types';
import { deepConnectionManifest, deepConnectionEngine } from './deep-connection';
import { icebreakerManifest, icebreakerEngine } from './icebreaker';
import { spicyManifest, spicyEngine } from './spicy';
import { imposteurManifest, imposteurEngine } from './imposteur';
import { dateNightManifest, baseEngine } from './shared';
import { familyManifest, familyEngine } from './family';
import { mostLikelyToManifest, mostLikelyToEngine } from './most-likely-to';

/**
 * Registre server-safe des modes de jeu.
 * Contient uniquement les manifests et les engines (pas de composants React).
 * Peut être importé dans les routes API Edge sans problème de RSC.
 */



export interface ServerGameMode {
  manifest: GameModeManifest;
  engine: GameModeEngine<unknown, unknown, unknown>;
}

export const gameModesServerRegistry: Record<string, ServerGameMode> = {
  'ICEBREAKER': {
    manifest: icebreakerManifest,
    engine: icebreakerEngine,
  },
  'DEEP_CONNECTION': {
    manifest: deepConnectionManifest,
    engine: deepConnectionEngine,
  },
  'SPICY': {
    manifest: spicyManifest,
    engine: spicyEngine,
  },
  'IMPOSTEUR': {
    manifest: imposteurManifest,
    engine: imposteurEngine,
  },
  'DATE_NIGHT': {
    manifest: dateNightManifest,
    engine: baseEngine,
  },
  'FAMILY': {
    manifest: familyManifest,
    engine: familyEngine,
  },
  'MOST_LIKELY_TO': {
    manifest: mostLikelyToManifest,
    engine: mostLikelyToEngine,
  }
};

export type ServerGameModeId = keyof typeof gameModesServerRegistry;

export function getServerGameMode(id: string): ServerGameMode | undefined {
  if (id in gameModesServerRegistry) {
    return gameModesServerRegistry[id as ServerGameModeId];
  }
  return undefined;
}
