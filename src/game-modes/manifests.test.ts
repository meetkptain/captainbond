import { describe, it, expect } from 'vitest';
import { gameModesServerRegistry, getServerGameMode } from './manifests';

describe('gameModesServerRegistry', () => {
  it('registers all expected server modes', () => {
    expect(Object.keys(gameModesServerRegistry).sort()).toEqual([
      'DATE_NIGHT',
      'DEEP_CONNECTION',
      'FAMILY',
      'ICEBREAKER',
      'IMPOSTEUR',
      'MISSION_IMPOSSIBLE',
      'MOST_LIKELY_TO',
      'SPICY',
    ]);
  });

  it('has valid manifests for every mode', () => {
    for (const [id, mode] of Object.entries(gameModesServerRegistry)) {
      expect(mode.manifest.id).toBe(id);
      expect(mode.manifest.name).toBeTruthy();
      expect(mode.manifest.description).toBeTruthy();
      expect(mode.manifest.category).toMatch(/^(pei|soiree|standard|corporate)$/);
      expect(mode.manifest.playSetup).toEqual(expect.objectContaining({
        local: expect.any(Boolean),
        remote: expect.any(Boolean),
        solo: expect.any(Boolean),
      }));
      expect(mode.manifest.minPlayers).toBeGreaterThanOrEqual(1);
      expect(mode.manifest.maxPlayers).toBeGreaterThanOrEqual(mode.manifest.minPlayers);
      expect(mode.manifest.roundDurationSeconds).toBeGreaterThanOrEqual(0);
      expect(typeof mode.engine.validateResponse).toBe('function');
      expect(typeof mode.engine.calculateScores).toBe('function');
    }
  });

  it('marks premium vs free modes correctly', () => {
    expect(getServerGameMode('ICEBREAKER')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('SPICY')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('IMPOSTEUR')?.manifest.isPremium).toBe(false);
    expect(getServerGameMode('FAMILY')?.manifest.isPremium).toBe(true);
    expect(getServerGameMode('DEEP_CONNECTION')?.manifest.isPremium).toBe(true);
    expect(getServerGameMode('DATE_NIGHT')?.manifest.isPremium).toBe(true);
    expect(getServerGameMode('MOST_LIKELY_TO')?.manifest.isPremium).toBe(true);
    expect(getServerGameMode('MISSION_IMPOSSIBLE')?.manifest.isPremium).toBe(true);
  });

  it('exposes a lookup helper that returns undefined for unknown modes', () => {
    expect(getServerGameMode('UNKNOWN_MODE')).toBeUndefined();
    expect(getServerGameMode('ICEBREAKER')).toBeDefined();
  });

  it('does not duplicate ids between server modes and engines', () => {
    const ids = Object.keys(gameModesServerRegistry);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
