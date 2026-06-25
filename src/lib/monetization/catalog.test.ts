import { describe, it, expect } from 'vitest';
import { CATALOG_FALLBACK, toCents, formatPrice } from './catalog';

describe('catalog fallback', () => {
  it('matches public price tiers', () => {
    const pass = CATALOG_FALLBACK.find((p) => p.sku === 'PASS_24H');
    expect(pass?.price).toBe(2.99);

    const profile = CATALOG_FALLBACK.find((p) => p.sku === 'PROFILE');
    expect(profile?.price).toBe(9.99);

    const couple = CATALOG_FALLBACK.find((p) => p.sku === 'PROFILE_COUPLE');
    expect(couple?.price).toBe(9.99);
  });

  it('converts euros to cents', () => {
    expect(toCents(4.99)).toBe(499);
    expect(toCents(9.99)).toBe(999);
    expect(toCents(2.99)).toBe(299);
  });

  it('formats price in french locale', () => {
    expect(formatPrice(4.99)).toBe('4,99€');
    expect(formatPrice(9.99)).toBe('9,99€');
  });
});
