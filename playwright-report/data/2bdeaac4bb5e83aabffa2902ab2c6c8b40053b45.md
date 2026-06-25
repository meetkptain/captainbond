# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-corporate.spec.ts >> Landing Corporate >> ne contient pas d'emojis utilisés comme icônes
- Location: e2e\landing-corporate.spec.ts:42:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/corporate
Call log:
  - navigating to "http://localhost:3000/corporate", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Landing Corporate', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/corporate');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/corporate
  6  |   });
  7  | 
  8  |   test('affiche le titre principal et le calculateur', async ({ page }) => {
  9  |     await expect(page.getByRole('heading', { name: /Fédérez vos équipes/i })).toBeVisible();
  10 |     await expect(page.getByRole('slider')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('met à jour le prix en temps réel', async ({ page }) => {
  14 |     // Use the number input for reliable cross-browser updates
  15 |     await page.locator('#participants-number').fill('100');
  16 | 
  17 |     const calculator = page.locator('#estimateur');
  18 |     await expect(calculator.getByText(/Avec facilitateur dédié/i)).toBeVisible();
  19 |     await expect(calculator.locator('[data-testid="estimated-price"]')).toContainText(/3[\s\u00A0\u202F]500/);
  20 |   });
  21 | 
  22 |   test('pré-remplit le formulaire avec le nombre de participants', async ({ page }) => {
  23 |     await page.locator('#participants-number').fill('75');
  24 |     await page.getByRole('button', { name: /Demander un devis/i }).first().click();
  25 | 
  26 |     await expect(page.locator('input#participants')).toHaveValue('75');
  27 |   });
  28 | 
  29 |   test('soumet le formulaire de contact', async ({ page }) => {
  30 |     await page.getByRole('button', { name: /Demander un devis/i }).first().click();
  31 | 
  32 |     await page.fill('input#name', 'Jean Test');
  33 |     await page.fill('input#company', 'Acme Test');
  34 |     await page.fill('input#email', 'jean@test.com');
  35 |     await page.fill('input#date', '2026-12-31');
  36 | 
  37 |     await page.getByRole('button', { name: /Envoyer ma demande/i }).click();
  38 | 
  39 |     await expect(page.getByText('Demande bien reçue !')).toBeVisible();
  40 |   });
  41 | 
  42 |   test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
  43 |     const text = await page.locator('body').innerText();
  44 |     const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  45 |     expect(emojiRegex.test(text)).toBe(false);
  46 |   });
  47 | });
  48 | 
```