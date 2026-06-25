import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  signAdminSession,
  verifyAdminSession,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
} from '../admin';

describe('admin auth', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_JWT_SECRET', 'admin-secret-test-32-chars-long!!');
    vi.stubEnv('ADMIN_PASSWORD', 'super-secret-admin-password');
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
    await expect(verifyAdminPassword('super-secret-admin-password')).resolves.not.toThrow();
  });

  it('throws on wrong admin password', async () => {
    await expect(verifyAdminPassword('wrong-password')).rejects.toThrow('Mot de passe incorrect');
  });

  it('exposes the cookie name', () => {
    expect(ADMIN_COOKIE_NAME).toBe('koze_admin_session');
  });
});
