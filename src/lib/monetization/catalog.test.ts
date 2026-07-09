import { describe, it, expect } from 'vitest';
import { CATALOG_FALLBACK, toCents, formatPrice } from './catalog';

describe('catalog fallback', () => {
  it('matches public price tiers', () => {
    const pass = CATALOG_FALLBACK.find((p) => p.sku === 'PASS_24H');
    expect(pass?.price).toBe(4.99);

    const profile = CATALOG_FALLBACK.find((p) => p.sku === 'PROFILE');
    expect(profile?.price).toBe(4.99);

    const couple = CATALOG_FALLBACK.find((p) => p.sku === 'PROFILE_COUPLE');
    expect(couple?.price).toBe(4.99);

    const b2b = CATALOG_FALLBACK.find((p) => p.sku === 'B2B_EVENT');
    expect(b2b?.price).toBe(299.00);

    const bar = CATALOG_FALLBACK.find((p) => p.sku === 'BAR_MONTHLY');
    expect(bar?.price).toBe(99.00);
    expect(bar?.isSubscription).toBe(true);
  });

  it('converts euros to cents', () => {
    expect(toCents(4.99)).toBe(499);
    expect(toCents(2.99)).toBe(299);
    expect(toCents(99.00)).toBe(9900);
    expect(toCents(299.00)).toBe(29900);
  });

  it('formats price in french locale', () => {
    expect(formatPrice(4.99)).toBe('4,99€');
    expect(formatPrice(99.00)).toBe('99,00€');
    expect(formatPrice(299.00)).toBe('299,00€');
  });
});
