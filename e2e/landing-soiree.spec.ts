import { test, expect } from '@playwright/test';
import { isSupabaseHealthy } from './fixtures/health';

test.describe('Landing Soirée', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche le titre principal et le CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /TV devient le plateau/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lancer une partie/i })).toBeVisible();
  });

  test('permet de rejoindre une table avec un code', async ({ page }) => {
    await page.getByRole('button', { name: /Rejoindre une table/i }).click();
    await page.getByPlaceholder('CODE').fill('TEST');
    await page.getByRole('button', { name: /Rejoindre$/i }).click();
    await expect(page).toHaveURL(/\/join\/TEST$/, { timeout: 10000 });
  });

  test('crée une table au clic sur le CTA principal', async ({ page }) => {
    const healthy = await isSupabaseHealthy();
    test.skip(!healthy, 'Supabase not healthy — skipping room creation test');

    await page.getByRole('button', { name: /Lancer une partie/i }).click();
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{4}$/);
  });

  test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
    const text = await page.locator('body').innerText();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    expect(emojiRegex.test(text)).toBe(false);
  });
});
