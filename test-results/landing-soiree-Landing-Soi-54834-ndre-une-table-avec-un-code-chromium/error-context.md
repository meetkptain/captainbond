# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-soiree.spec.ts >> Landing Soirée >> permet de rejoindre une table avec un code
- Location: e2e\landing-soiree.spec.ts:14:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { isSupabaseHealthy } from './fixtures/health';
  3  | 
  4  | test.describe('Landing Soirée', () => {
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  7  |   });
  8  | 
  9  |   test('affiche le titre principal et le CTA', async ({ page }) => {
  10 |     await expect(page.getByRole('heading', { name: /TV devient le plateau/i })).toBeVisible();
  11 |     await expect(page.getByRole('button', { name: /Lancer une partie/i })).toBeVisible();
  12 |   });
  13 | 
  14 |   test('permet de rejoindre une table avec un code', async ({ page }) => {
  15 |     await page.getByRole('button', { name: /Rejoindre une table/i }).click();
  16 |     await page.getByPlaceholder('CODE').fill('TEST');
  17 |     await page.getByRole('button', { name: /Rejoindre$/i }).click();
  18 |     await expect(page).toHaveURL(/\/join\/TEST$/, { timeout: 10000 });
  19 |   });
  20 | 
  21 |   test('crée une table au clic sur le CTA principal', async ({ page }) => {
  22 |     const healthy = await isSupabaseHealthy();
  23 |     test.skip(!healthy, 'Supabase not healthy — skipping room creation test');
  24 | 
  25 |     await page.getByRole('button', { name: /Lancer une partie/i }).click();
  26 |     await expect(page).toHaveURL(/\/room\/[A-Z0-9]{4}$/);
  27 |   });
  28 | 
  29 |   test('ne contient pas d\'emojis utilisés comme icônes', async ({ page }) => {
  30 |     const text = await page.locator('body').innerText();
  31 |     const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  32 |     expect(emojiRegex.test(text)).toBe(false);
  33 |   });
  34 | });
  35 | 
```