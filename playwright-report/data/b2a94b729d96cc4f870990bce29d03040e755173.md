# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-couple.spec.ts >> Landing Couple >> la démo interactive fonctionne jusqu'à la révélation
- Location: e2e\landing-couple.spec.ts:14:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/couple
Call log:
  - navigating to "http://localhost:3000/couple", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Landing Couple', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/couple');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/couple
  6  |   });
  7  | 
  8  |   test('affiche le titre principal et les CTAs', async ({ page }) => {
  9  |     await expect(page.getByRole('heading', { name: /rituel de 5 minutes/i })).toBeVisible();
  10 |     await expect(page.getByRole('button', { name: /Commencer le rituel/i })).toBeVisible();
  11 |     await expect(page.getByRole('button', { name: /Voir la démo/i })).toBeVisible();
  12 |   });
  13 | 
  14 |   test('la démo interactive fonctionne jusqu\'à la révélation', async ({ page }) => {
  15 |     await page.getByRole('button', { name: /Voir la démo/i }).click();
  16 | 
  17 |     await page.getByPlaceholder('Écrivez votre réponse...').fill('Notre voyage à la montagne');
  18 |     await page.getByRole('button', { name: /Simuler la Synchronisation/i }).click();
  19 | 
  20 |     await expect(page.getByText(/Analyse des réponses/i)).toBeVisible();
  21 |     await expect(page.getByText(/Réponse partenaire/i)).toBeVisible({ timeout: 10000 });
  22 |   });
  23 | 
  24 |   test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
  25 |     const text = await page.locator('body').innerText();
  26 |     const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  27 |     expect(emojiRegex.test(text)).toBe(false);
  28 |   });
  29 | });
  30 | 
```