import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, cleanupPlayer } from './fixtures/api';
import { isSupabaseHealthy } from './fixtures/health';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

test.describe('checkout flow', () => {
  test.beforeAll(async () => {
    test.skip(!STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY not configured');
    const healthy = await isSupabaseHealthy();
    test.skip(!healthy, 'Supabase not healthy — skipping checkout E2E tests');
  });

  test('player can initiate a checkout session', async ({ request }) => {
    const room = await createRoom('HostCheckout');
    const player = await joinRoom(room.roomCode, 'PlayerCheckout');

    const response = await request.post('/api/checkout/pass', {
      headers: { Cookie: player.cookies },
      data: {
        playerId: player.playerId,
        roomCode: player.roomCode,
        successUrl: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/success`
          : 'http://localhost:3000/success',
        cancelUrl: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`
          : 'http://localhost:3000/cancel',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('sessionId');
    expect(body).toHaveProperty('sessionUrl');
    expect(body.sessionUrl).toContain('checkout.stripe.com');

    await cleanupPlayer(player.playerId, room.roomCode);
  });
});
