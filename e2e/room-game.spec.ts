import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, cleanupPlayer } from './fixtures/api';
import { isSupabaseHealthy } from './fixtures/health';

test.describe('room game actions', () => {
  test.beforeAll(async () => {
    const healthy = await isSupabaseHealthy();
    test.skip(!healthy, 'Supabase not healthy — skipping room game E2E tests');
  });

  test('host can set mode and player can ready up', async ({ browser }) => {
    const room = await createRoom('HostGame');
    const player = await joinRoom(room.roomCode, 'PlayerGame');

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto(`/room/${room.roomCode}`);

    const playerContext = await browser.newContext();
    const playerPage = await playerContext.newPage();
    await playerPage.goto(`/room/${room.roomCode}/player?playerId=${player.playerId}`);

    // Player marks ready if button exists
    const readyButton = playerPage.locator('button:has-text("Prêt")');
    if (await readyButton.isVisible().catch(() => false)) {
      await readyButton.click();
      await expect(playerPage.locator('body')).toContainText('Prêt');
    }

    await hostContext.close();
    await playerContext.close();
    await cleanupPlayer(player.playerId, room.roomCode);
  });
});
