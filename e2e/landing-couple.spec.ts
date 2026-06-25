import { test, expect } from '@playwright/test';

test.describe('Landing Couple', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/couple');
  });

  test('affiche le titre principal et les CTAs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /rituel de 5 minutes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Commencer le rituel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Voir la démo/i })).toBeVisible();
  });

  test('la démo interactive fonctionne jusqu\'à la révélation', async ({ page }) => {
    await page.getByRole('button', { name: /Voir la démo/i }).click();

    await page.getByPlaceholder('Écrivez votre réponse...').fill('Notre voyage à la montagne');
    await page.getByRole('button', { name: /Simuler la Synchronisation/i }).click();

    await expect(page.getByText(/Analyse des réponses/i)).toBeVisible();
    await expect(page.getByText(/Réponse partenaire/i)).toBeVisible({ timeout: 10000 });
  });

  test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
    const text = await page.locator('body').innerText();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    expect(emojiRegex.test(text)).toBe(false);
  });
});
