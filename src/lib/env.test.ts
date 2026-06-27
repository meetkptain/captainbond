import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv, getPublicEnvSummary } from './env';

describe('validateEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns valid when all required vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    process.env.ADMIN_PASSWORD_HASH = '$2a$12$abcdefghijklmnopqrstuvwxycdefghijklmnopqrstuv';
    process.env.ADMIN_JWT_SECRET = 'admin-jwt-secret-32-chars-long';
    process.env.PLAYER_JWT_SECRET = 'player-jwt-secret-32-chars-long';
    process.env.HOST_TOKEN_SECRET = 'host-token-secret-32-chars-long!!';
    process.env.HMAC_IMPOSTEUR_SECRET = 'hmac-imposteur-secret-32-chars-long';
    process.env.STRIPE_SECRET_KEY = 'sk_test_32charslongsecretvalue';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_32charslongsecretvalue';

    const result = validateEnv();
    expect(result.valid).toBe(true);
  });

  it('detects missing required variables', () => {
    delete process.env.ADMIN_JWT_SECRET;
    delete process.env.PLAYER_JWT_SECRET;

    const result = validateEnv();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ADMIN_JWT_SECRET');
    expect(result.missing).toContain('PLAYER_JWT_SECRET');
  });

  it('warns on short secrets', () => {
    process.env.ADMIN_JWT_SECRET = 'short';

    const result = validateEnv();
    expect(result.warnings.some((w) => w.includes('ADMIN_JWT_SECRET'))).toBe(true);
  });
});

describe('getPublicEnvSummary', () => {
  it('reflects configured integrations', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx';

    const summary = getPublicEnvSummary();
    expect(summary.stripe).toBe(true);
  });
});
