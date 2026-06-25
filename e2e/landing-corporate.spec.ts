import { test, expect } from '@playwright/test';

test.describe('Landing Corporate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/corporate');
  });

  test('affiche le titre principal et le calculateur', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Fédérez vos équipes/i })).toBeVisible();
    await expect(page.getByRole('slider')).toBeVisible();
  });

  test('met à jour le prix en temps réel', async ({ page }) => {
    // Use the number input for reliable cross-browser updates
    await page.locator('#participants-number').fill('100');

    const calculator = page.locator('#estimateur');
    await expect(calculator.getByText(/Avec facilitateur dédié/i)).toBeVisible();
    await expect(calculator.locator('[data-testid="estimated-price"]')).toContainText(/3[\s\u00A0\u202F]500/);
  });

  test('pré-remplit le formulaire avec le nombre de participants', async ({ page }) => {
    await page.locator('#participants-number').fill('75');
    await page.getByRole('button', { name: /Demander un devis/i }).first().click();

    await expect(page.locator('input#participants')).toHaveValue('75');
  });

  test('soumet le formulaire de contact', async ({ page }) => {
    await page.getByRole('button', { name: /Demander un devis/i }).first().click();

    await page.fill('input#name', 'Jean Test');
    await page.fill('input#company', 'Acme Test');
    await page.fill('input#email', 'jean@test.com');
    await page.fill('input#date', '2026-12-31');

    await page.getByRole('button', { name: /Envoyer ma demande/i }).click();

    await expect(page.getByText('Demande bien reçue !')).toBeVisible();
  });

  test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
    const text = await page.locator('body').innerText();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    expect(emojiRegex.test(text)).toBe(false);
  });
});
