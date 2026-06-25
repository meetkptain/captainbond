import { describe, it, expect } from 'vitest';
import { gameModesServerRegistry, getServerGameMode } from './manifests';

describe('gameModesServerRegistry', () => {
  it('registers all expected server modes', () => {
    expect(Object.keys(gameModesServerRegistry).sort()).toEqual([
      'DATE_NIGHT',
      'DEEP_CONNECTION',
      'ICEBREAKER',
      'IMPOSTEUR',
      'SPICY',
    ]);
  });

  it('has valid manifests for every mode', () => {
    for (const [id, mode] of Object.entries(gameModesServerRegistry)) {
      expect(mode.manifest.id).toBe(id);
      expect(mode.manifest.minPlayers).toBeGreaterThanOrEqual(1);
      expect(mode.manifest.maxPlayers).toBeGreaterThanOrEqual(mode.manifest.minPlayers);
      expect(mode.manifest.roundDurationSeconds).toBeGreaterThanOrEqual(0);
      expect(typeof mode.engine.validateResponse).toBe('function');
      expect(typeof mode.engine.calculateScores).toBe('function');
    }
  });

  it('marks premium vs free modes correctly', () => {
    expect(getServerGameMode('ICEBREAKER')?.manifest.isPremium).toBeFalsy();
    expect(getServerGameMode('ICEBREAKER')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('SPICY')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('IMPOSTEUR')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('DEEP_CONNECTION')?.manifest.isPremium).toBe(true);
    expect(getServerGameMode('DATE_NIGHT')?.manifest.isPremium).toBe(true);
  });
});
