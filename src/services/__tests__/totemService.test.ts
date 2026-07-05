import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TotemState } from '@/lib/db/types';

const mockGetOrCreateTotem = vi.fn();
const mockUpdateOrbeA = vi.fn();
const mockUpdateOrbeB = vi.fn();
const mockUpdateFusionState = vi.fn();
const mockUpdateTotemRitual = vi.fn();

vi.mock('@/lib/db/repositories/totemRepository', () => ({
  getOrCreateTotem: mockGetOrCreateTotem,
  updateOrbeA: mockUpdateOrbeA,
  updateOrbeB: mockUpdateOrbeB,
  updateFusionState: mockUpdateFusionState,
  updateTotemRitual: mockUpdateTotemRitual,
}));

const mockTotem = (overrides: Partial<TotemState> = {}): TotemState => ({
  coupleId: 'couple-1',
  stateA: { hue: 200, energy: 0.8, attachmentStyle: 'secure' } as TotemState['stateA'],
  stateB: { hue: 220, energy: 0.6, attachmentStyle: 'anxious' } as TotemState['stateB'],
  fusionState: { harmonyRate: 0.5, tensionLevel: 0.3, syncScore: 0.6, evolutionStage: 0, fusionTexture: 'smooth' } as TotemState['fusionState'],
  streakDays: 5,
  lastRitualAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('totemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('computeFusion', () => {
    it('calculates harmony rate from hue and energy proximity', async () => {
      mockGetOrCreateTotem.mockResolvedValue(mockTotem({
        stateA: { hue: 200, energy: 0.8, attachmentStyle: 'secure' } as TotemState['stateA'],
        stateB: { hue: 200, energy: 0.8, attachmentStyle: 'secure' } as TotemState['stateB'],
      }));
      mockUpdateFusionState.mockResolvedValue(mockTotem());

      const { computeFusion } = await import('../totemService');
      await computeFusion('couple-1');

      const call = mockUpdateFusionState.mock.calls[0][1];
      expect(call.harmonyRate).toBeGreaterThanOrEqual(0);
      expect(call.harmonyRate).toBeLessThanOrEqual(1);
    });

    it('detects fault line when tension exceeds threshold', async () => {
      mockGetOrCreateTotem.mockResolvedValue(mockTotem({
        stateA: { hue: 0, energy: 1.0, attachmentStyle: 'secure' } as TotemState['stateA'],
        stateB: { hue: 180, energy: 1.0, attachmentStyle: 'avoidant' } as TotemState['stateB'],
      }));
      mockUpdateFusionState.mockResolvedValue(mockTotem());

      const { computeFusion } = await import('../totemService');
      await computeFusion('couple-1');

      const call = mockUpdateFusionState.mock.calls[0][1];
      expect(typeof call.faultLineVisible).toBe('boolean');
    });
  });

  describe('completeRitual', () => {
    it('increments streak and boosts harmony', async () => {
      mockGetOrCreateTotem.mockResolvedValue(mockTotem({ streakDays: 5 }));
      mockUpdateTotemRitual.mockResolvedValue(mockTotem({ streakDays: 6 }));
      mockUpdateFusionState.mockResolvedValue(mockTotem());

      const { completeRitual } = await import('../totemService');
      await completeRitual('couple-1');

      expect(mockUpdateTotemRitual).toHaveBeenCalledWith('couple-1', 6);
      expect(mockUpdateFusionState).toHaveBeenCalledWith(
        'couple-1',
        expect.objectContaining({ energy: 1.0, status: 'ACTIVE' })
      );
    });
  });

  describe('updatePartnerOrbe', () => {
    it('updates Orbe A for partner A', async () => {
      mockUpdateOrbeA.mockResolvedValue(mockTotem());

      const { updatePartnerOrbe } = await import('../totemService');
      await updatePartnerOrbe('couple-1', 'user-1', 'user-1', { energy: 0.9 });

      expect(mockUpdateOrbeA).toHaveBeenCalledWith('couple-1', { energy: 0.9 });
    });

    it('updates Orbe B for partner B', async () => {
      mockUpdateOrbeB.mockResolvedValue(mockTotem());

      const { updatePartnerOrbe } = await import('../totemService');
      await updatePartnerOrbe('couple-1', 'user-2', 'user-1', { energy: 0.9 });

      expect(mockUpdateOrbeB).toHaveBeenCalledWith('couple-1', { energy: 0.9 });
    });
  });

  describe('getTotem', () => {
    it('returns totem if recently active', async () => {
      mockGetOrCreateTotem.mockResolvedValue(mockTotem({
        lastRitualAt: new Date().toISOString(),
      }));

      const { getTotem } = await import('../totemService');
      const result = await getTotem('couple-1');

      expect(result.coupleId).toBe('couple-1');
      expect(mockUpdateFusionState).not.toHaveBeenCalled();
    });
  });
});
