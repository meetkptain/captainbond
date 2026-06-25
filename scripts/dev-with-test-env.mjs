#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { spawn } from 'child_process';

// Load env files in priority order: .env.local overrides .env
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

// Ensure test JWT secrets are present for E2E runs. These are only used
// in the local dev server spawned by Playwright and never in production.
if (!process.env.ADMIN_JWT_SECRET || process.env.ADMIN_JWT_SECRET.length < 32) {
  process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret-which-is-32-characters';
}
if (!process.env.PLAYER_JWT_SECRET || process.env.PLAYER_JWT_SECRET.length < 32) {
  process.env.PLAYER_JWT_SECRET = 'test-player-jwt-secret-which-is-32-characters';
}
if (!process.env.HOST_TOKEN_SECRET || process.env.HOST_TOKEN_SECRET.length < 32) {
  process.env.HOST_TOKEN_SECRET = 'test-host-token-secret-which-is-32-characters';
}
if (!process.env.HMAC_IMPOSTEUR_SECRET || process.env.HMAC_IMPOSTEUR_SECRET.length < 32) {
  process.env.HMAC_IMPOSTEUR_SECRET = 'test-hmac-imposteur-secret-which-is-32-chars';
}

const args = process.argv.slice(2);
const child = spawn('npx', ['next', 'dev', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
