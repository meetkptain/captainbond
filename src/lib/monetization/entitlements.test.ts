import { describe, it, expect } from 'vitest';
import { canAccessMode, canViewProfile, canViewCoupleProfile } from './entitlements';
import type { Entitlements } from './entitlements';

function buildEntitlements(partial: Partial<Entitlements> = {}): Entitlements {
  return {
    userId: 'user-1',
    hasActivePass: false,
    passExpiresAt: null,
    hasActiveSubscription: false,
    subscriptionStatus: 'NONE',
    hasLifetime: false,
    purchasedPackIds: [],
    accessibleModes: [],
    accessibleFeatures: [],
    ...partial,
  };
}

describe('entitlements helpers', () => {
  it('grants all modes with wildcard', () => {
    const e = buildEntitlements({ accessibleModes: ['*'] });
    expect(canAccessMode(e, 'DATE_NIGHT')).toBe(true);
    expect(canAccessMode(e, 'ICEBREAKER')).toBe(true);
  });

  it('restricts modes without wildcard', () => {
    const e = buildEntitlements({ accessibleModes: ['ICEBREAKER'] });
    expect(canAccessMode(e, 'ICEBREAKER')).toBe(true);
    expect(canAccessMode(e, 'DATE_NIGHT')).toBe(false);
  });

  it('grants profile features with wildcard', () => {
    const e = buildEntitlements({ accessibleFeatures: ['*'] });
    expect(canViewProfile(e)).toBe(true);
    expect(canViewCoupleProfile(e)).toBe(true);
  });

  it('grants couple profile with profile_couple feature', () => {
    const e = buildEntitlements({ accessibleFeatures: ['profile_couple'] });
    expect(canViewProfile(e)).toBe(false);
    expect(canViewCoupleProfile(e)).toBe(true);
  });
});
