import { test, expect } from '@playwright/test';
import { createCouple, cleanupCouple, createCoupleRitual, CreatedCouple, CreatedRitual } from './fixtures/api';

test.describe('Couple rituals', () => {
  let couple: CreatedCouple;
  let ritual: CreatedRitual;

  test.beforeEach(async () => {
    couple = await createCouple();
    ritual = await createCoupleRitual(couple.coupleId);
  });

  test.afterEach(async () => {
    await cleanupCouple(couple);
  });

  test('happy path: both partners answer a ritual', async ({ page }) => {
    // Partner A answers
    await page.context().addCookies([
      { name: 'sb-access-token', value: couple.userACookies, domain: 'localhost', path: '/' },
    ]);
    await page.goto('/couple');
    await expect(page.getByText(ritual.text)).toBeVisible();
    await page.fill('textarea[placeholder*="sincérité"]', 'Ma réponse A');
    await page.getByRole('button', { name: /Sceller ma réponse/i }).click();
    await expect(page.getByText(/scellée|20h|partenaire/i).first()).toBeVisible();

    // Partner B answers
    await page.context().clearCookies();
    await page.context().addCookies([
      { name: 'sb-access-token', value: couple.userBCookies, domain: 'localhost', path: '/' },
    ]);
    await page.goto('/couple');
    await expect(page.getByText(ritual.text)).toBeVisible();
    await page.fill('textarea[placeholder*="sincérité"]', 'Ma réponse B');
    await page.getByRole('button', { name: /Sceller ma réponse/i }).click();
    await expect(page.getByText(/scellée|20h|partenaire/i).first()).toBeVisible();
  });

  test('skip flow: partner can skip the ritual', async ({ page }) => {
    await page.context().addCookies([
      { name: 'sb-access-token', value: couple.userACookies, domain: 'localhost', path: '/' },
    ]);
    await page.goto('/couple');
    await expect(page.getByText(ritual.text)).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Pas aujourd/i }).click();

    await expect(page.getByText(/passée|ignorée|skip/i).first()).toBeVisible();
  });
});
