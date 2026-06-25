import { test, expect } from '@playwright/test';

test('health endpoint responds with status and checks', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = await response.json();

  expect(response.headers()['x-request-id']).toBeDefined();
  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('checks');
  expect(body.checks).toHaveProperty('supabase');
  expect(body.checks).toHaveProperty('stripe');
  expect(body.checks).toHaveProperty('adminJwt');
  expect(body.checks).toHaveProperty('playerJwt');
  expect(body).toHaveProperty('uptimeSeconds');
});
