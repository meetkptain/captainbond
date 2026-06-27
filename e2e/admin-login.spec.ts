import { test, expect } from '@playwright/test';

// Plaintext password used only to type into the E2E login form.
// Production auth uses the bcrypt hash in ADMIN_PASSWORD_HASH.
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe('admin login', () => {
  test.skip(() => !E2E_ADMIN_PASSWORD, 'E2E_ADMIN_PASSWORD not configured');

  test('admin can login and access dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input#password', E2E_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForURL('/admin');
    await expect(page.locator('body')).toContainText('Admin');

    const cookies = await page.context().cookies();
    const adminCookie = cookies.find((c) => c.name === 'koze_admin_session');
    expect(adminCookie).toBeDefined();
    expect(adminCookie?.httpOnly).toBe(true);
    expect(adminCookie?.secure).toBe(false); // dev/local
    expect(adminCookie?.sameSite).toBe('Lax');
  });
});
