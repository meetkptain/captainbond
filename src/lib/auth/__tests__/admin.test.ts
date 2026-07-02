import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  signAdminSession,
  verifyAdminSession,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
} from '../admin';

const TEST_PASSWORD = 'super-secret-admin-password';

describe('admin auth', () => {
  beforeEach(async () => {
    vi.stubEnv('ADMIN_JWT_SECRET', 'admin-secret-test-32-chars-long!!');
    vi.stubEnv('ADMIN_PASSWORD_HASH', await bcrypt.hash(TEST_PASSWORD, 4));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('signs and verifies an admin session', async () => {
    const token = await signAdminSession();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const payload = await verifyAdminSession(token);
    expect(payload.role).toBe('admin');
  });

  it('rejects an invalid token', async () => {
    await expect(verifyAdminSession('invalid-token')).rejects.toThrow('Session admin invalide');
  });

  it('rejects a token signed with another secret', async () => {
    const token = await signAdminSession();
    vi.stubEnv('ADMIN_JWT_SECRET', 'another-secret-test-32-chars-long!');
    await expect(verifyAdminSession(token)).rejects.toThrow('Session admin invalide');
  });

  it('verifies the admin password', async () => {
    await expect(verifyAdminPassword(TEST_PASSWORD)).resolves.not.toThrow();
  });

  it('throws on wrong admin password', async () => {
    await expect(verifyAdminPassword('wrong-password')).rejects.toThrow('Mot de passe incorrect');
  });

  it('throws internal error when ADMIN_PASSWORD_HASH is missing', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('ADMIN_JWT_SECRET', 'admin-secret-test-32-chars-long!!');
    delete process.env.ADMIN_PASSWORD_HASH;
    await expect(verifyAdminPassword(TEST_PASSWORD)).rejects.toThrow("ADMIN_PASSWORD_HASH n'est pas configuré");
  });

  it('throws at import if STRIPE_SECRET_KEY is missing', async () => {
    const originalStripeKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    vi.resetModules();
    await expect(import('@/services/paymentService')).rejects.toThrow('STRIPE_SECRET_KEY');
    if (originalStripeKey) {
      process.env.STRIPE_SECRET_KEY = originalStripeKey;
    }
  });

  it('exposes the cookie name', () => {
    expect(ADMIN_COOKIE_NAME).toBe('koze_admin_session');
  });
});
