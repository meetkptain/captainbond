import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv, requireEnv, getEnv, getPublicEnvSummary } from '@/lib/env';

function buildValidEnv(): NodeJS.ProcessEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a'.repeat(32),
    SUPABASE_SERVICE_ROLE_KEY: 'b'.repeat(32),
    ADMIN_PASSWORD_HASH: 'c'.repeat(32),
    ADMIN_JWT_SECRET: 'd'.repeat(32),
    PLAYER_JWT_SECRET: 'e'.repeat(32),
    HOST_TOKEN_SECRET: 'f'.repeat(32),
    HMAC_IMPOSTEUR_SECRET: 'g'.repeat(32),
    COUPLE_INVITE_SECRET: 'j'.repeat(32),
    STRIPE_SECRET_KEY: 'h'.repeat(32),
    STRIPE_WEBHOOK_SECRET: 'i'.repeat(32),
  } as unknown as NodeJS.ProcessEnv;
}

describe('env', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('rejects missing required vars', () => {
      process.env = {} as unknown as NodeJS.ProcessEnv;
      const result = validateEnv();
      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('accepts valid env', () => {
      process.env = buildValidEnv();
      const result = validateEnv();
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('warns on short secrets but does not fail validation', () => {
      process.env = {
        ...buildValidEnv(),
        ADMIN_JWT_SECRET: 'short',
      } as unknown as NodeJS.ProcessEnv;
      const result = validateEnv();
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('ADMIN_JWT_SECRET'))).toBe(true);
    });

    it('warns when ADMIN_PASSWORD is present', () => {
      process.env = {
        ...buildValidEnv(),
        ADMIN_PASSWORD: 'old-password',
      } as unknown as NodeJS.ProcessEnv;
      const result = validateEnv();
      expect(result.warnings.some((w) => w.includes('ADMIN_PASSWORD'))).toBe(true);
    });

    it('warns on missing optional-but-recommended vars', () => {
      process.env = buildValidEnv();
      const result = validateEnv();
      expect(result.warnings.some((w) => w.includes('UPSTASH_REDIS_REST_URL'))).toBe(true);
    });

    it('treats empty optional values as warnings, not validation failures', () => {
      process.env = {
        ...buildValidEnv(),
        UPSTASH_REDIS_REST_URL: '',
      } as unknown as NodeJS.ProcessEnv;
      const result = validateEnv();
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('UPSTASH_REDIS_REST_URL'))).toBe(true);
    });

    it('fails validation on invalid NEXT_PUBLIC_SUPABASE_URL', () => {
      process.env = {
        ...buildValidEnv(),
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      } as unknown as NodeJS.ProcessEnv;
      const result = validateEnv();
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_URL');
    });
  });

  describe('getEnv', () => {
    it('throws on invalid config', () => {
      process.env = {} as unknown as NodeJS.ProcessEnv;
      expect(() => getEnv()).toThrow('Invalid environment configuration');
    });
  });

  describe('requireEnv', () => {
    const originalPhase = process.env.NEXT_PHASE;

    afterEach(() => {
      process.env.NEXT_PHASE = originalPhase;
    });

    it('returns the build mock when a required var is missing during production build', () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      delete process.env.STRIPE_SECRET_KEY;
      const value = requireEnv('STRIPE_SECRET_KEY');
      expect(value).toBe('mock-stripe-secret-key-value-for-build-32-chars-long');
    });

    it('throws when a required var is missing outside production build', () => {
      process.env.NEXT_PHASE = '';
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => requireEnv('STRIPE_SECRET_KEY')).toThrow('Missing required environment variable: STRIPE_SECRET_KEY');
    });
  });

  describe('getPublicEnvSummary', () => {
    it('returns expected public keys', () => {
      process.env = buildValidEnv();
      const summary = getPublicEnvSummary();
      expect(summary).toHaveProperty('supabase');
      expect(summary).toHaveProperty('stripe');
      expect(summary).toHaveProperty('upstash');
      expect(summary).toHaveProperty('posthog');
      expect(summary).toHaveProperty('storage');
      expect(summary).toHaveProperty('gemini');
      expect(summary).toHaveProperty('sync');
    });
  });
});
