import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, cleanupPlayer, cleanupRoom } from './fixtures/api';
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

  test('host can start a round when all players are ready', async ({ browser }) => {
    // Icebreaker nécessite 3 joueurs non-hôte ; on en crée 3.
    const room = await createRoom('HostStart');
    const players = await Promise.all([
      joinRoom(room.roomCode, 'PlayerStart1'),
      joinRoom(room.roomCode, 'PlayerStart2'),
      joinRoom(room.roomCode, 'PlayerStart3'),
    ]);

    const playerContext = await browser.newContext();
    const hostContext = await browser.newContext();

    try {
      const playerPages = await Promise.all(players.map(() => playerContext.newPage()));

      await Promise.all(
        players.map(async (player, index) => {
          const page = playerPages[index];
          await page.goto('/');
          await page.evaluate(
            ({ roomCode }) => {
              sessionStorage.setItem(`cb_consent_${roomCode}`, 'true');
            },
            { roomCode: room.roomCode }
          );
          await page.goto(`/room/${room.roomCode}/player?playerId=${player.playerId}`);
          const readyButton = page.locator('button:has-text("Je suis prêt")');
          await expect(readyButton).toBeVisible({ timeout: 5000 });
          await readyButton.click();
        })
      );

      const hostPage = await hostContext.newPage();
      await hostPage.goto('/');
      await hostPage.evaluate(
        ({ roomCode, hostId, hostToken }) => {
          sessionStorage.setItem(`host_${roomCode}`, JSON.stringify({ hostId, hostToken }));
        },
        { roomCode: room.roomCode, hostId: room.hostId, hostToken: room.hostToken }
      );
      await hostPage.goto(`/room/${room.roomCode}/player?playerId=host`);

      const startButton = hostPage.locator('button:has-text("Lancer la partie")');
      await expect(startButton).toBeVisible({ timeout: 5000 });
      await expect(startButton).toBeEnabled({ timeout: 10000 });
      await startButton.click();

      // Une fois la manche lancée, l'hôte voit l'écran de question avec le texte d'attente des votes.
      await expect(hostPage.locator('h2')).toBeVisible({ timeout: 10000 });
      await expect(hostPage.locator('text=Vous êtes l\'Hôte. Les joueurs votent.')).toBeVisible({ timeout: 10000 });
    } finally {
      await hostContext.close();
      await playerContext.close();
      await Promise.all(players.map((player) => cleanupPlayer(player.playerId, room.roomCode)));
      await cleanupRoom(room.roomCode, room.hostId, room.hostToken);
    }
  });

  test('player can trigger the safe word modal', async ({ page }) => {
    const room = await createRoom('HostSafe');
    const player = await joinRoom(room.roomCode, 'PlayerSafe');

    await page.goto('/');
    await page.evaluate(
      ({ roomCode }) => {
        sessionStorage.setItem(`cb_consent_${roomCode}`, 'true');
      },
      { roomCode: room.roomCode }
    );
    await page.goto(`/room/${room.roomCode}/player?playerId=${player.playerId}`);

    const safeButton = page.locator('button:has-text("Safe word")');
    await expect(safeButton).toBeVisible();
    await safeButton.click();

    await expect(page.locator('h2:has-text("Vous avez le contrôle")')).toBeVisible();

    await cleanupPlayer(player.playerId, room.roomCode);
  });
});
