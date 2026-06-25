import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppError } from '@/lib/errors';
import { validateCheckoutUrl } from './checkout';

describe('validateCheckoutUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://captainbond.com';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it('accepts URLs on the configured public site origin', () => {
    expect(() => validateCheckoutUrl('https://captainbond.com/success')).not.toThrow();
    expect(() => validateCheckoutUrl('https://captainbond.com/cancel?room=ABCD')).not.toThrow();
  });

  it('accepts root-relative URLs', () => {
    expect(() => validateCheckoutUrl('/success')).not.toThrow();
    expect(() => validateCheckoutUrl('/cancel')).not.toThrow();
  });

  it('rejects open-redirect URLs to external origins', () => {
    expect(() => validateCheckoutUrl('https://evil.com/phish')).toThrow(
      new AppError('VALIDATION_ERROR', 'URL de redirection invalide'),
    );
  });

  it('rejects protocol-relative malicious URLs', () => {
    expect(() => validateCheckoutUrl('//evil.com')).toThrow(
      new AppError('VALIDATION_ERROR', 'URL de redirection invalide'),
    );
  });

  it('rejects URLs using the origin as a substring prefix', () => {
    expect(() => validateCheckoutUrl('https://captainbond.com.evil.com/success')).toThrow(
      new AppError('VALIDATION_ERROR', 'URL de redirection invalide'),
    );
  });
});
