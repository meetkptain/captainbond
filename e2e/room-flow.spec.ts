import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, cleanupPlayer } from './fixtures/api';
import { isSupabaseHealthy } from './fixtures/health';

test.describe('room lifecycle', () => {
  test.beforeAll(async () => {
    const healthy = await isSupabaseHealthy();
    test.skip(!healthy, 'Supabase not healthy — skipping room lifecycle E2E tests');
  });

  test('host can create a room and player can join it', async ({ page }) => {
    const room = await createRoom('HostTest');

    // Host opens the room
    await page.goto(`/room/${room.roomCode}`);
    await expect(page.locator('body')).toContainText(room.roomCode);

    // Player joins in a new context
    const player = await joinRoom(room.roomCode, 'PlayerTest');
    expect(player.roomCode).toBe(room.roomCode);

    // Cleanup
    await cleanupPlayer(player.playerId, room.roomCode);
  });

  test('invalid room code shows an error after consent', async ({ page }) => {
    await page.goto('/join/XXXX');

    // Accept consent
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Entrer dans la salle")');

    await page.fill('input[placeholder="Ex: Sophie"]', 'Test');
    await page.click('button:has-text("Rejoindre le Deck")');

    await expect(page.locator('p.text-red-400')).toContainText('Impossible de rejoindre');
  });

  test('player sees free card gauge and unlock option after joining', async ({ page }) => {
    const room = await createRoom('HostGauge');
    const player = await joinRoom(room.roomCode, 'GaugePlayer');

    await page.goto('/');
    await page.evaluate(
      ({ roomCode }) => {
        sessionStorage.setItem(`cb_consent_${roomCode}`, 'true');
      },
      { roomCode: room.roomCode }
    );
    await page.goto(`/room/${room.roomCode}/player?playerId=${player.playerId}`);

    await expect(page.locator('body')).toContainText('0/3');
    await expect(page.locator('body')).toContainText('Débloquer');

    await cleanupPlayer(player.playerId, room.roomCode);
  });
});
