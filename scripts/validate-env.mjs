#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const REQUIRED_STRING_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_JWT_SECRET',
  'PLAYER_JWT_SECRET',
  'HOST_TOKEN_SECRET',
  'HMAC_IMPOSTEUR_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const OPTIONAL_BUT_RECOMMENDED = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'WASABI_ACCESS_KEY_ID',
  'WASABI_SECRET_ACCESS_KEY',
  'WASABI_BUCKET_NAME',
  'WASABI_ENDPOINT',
  'GOOGLE_SHEETS_CSV_URL',
  'ADMIN_SYNC_SECRET',
  'GEMINI_API_KEY',
];

const MIN_SECRET_LENGTH = 32;

function isMissing(value) {
  return !value || value.trim().length === 0;
}

const missing = REQUIRED_STRING_VARS.filter((key) => isMissing(process.env[key]));
const warnings = [];

for (const key of REQUIRED_STRING_VARS) {
  const value = process.env[key];
  if (!isMissing(value) && (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY'))) {
    if (value.length < MIN_SECRET_LENGTH) {
      warnings.push(`${key} doit faire au moins ${MIN_SECRET_LENGTH} caractères.`);
    }
  }
}

for (const key of OPTIONAL_BUT_RECOMMENDED) {
  if (isMissing(process.env[key])) {
    warnings.push(`Variable optionnelle manquante : ${key}`);
  }
}

const publicSummary = {
  supabase: !isMissing(process.env.NEXT_PUBLIC_SUPABASE_URL) && !isMissing(process.env.SUPABASE_SERVICE_ROLE_KEY),
  upstash: !isMissing(process.env.UPSTASH_REDIS_REST_URL) && !isMissing(process.env.UPSTASH_REDIS_REST_TOKEN),
  stripe: !isMissing(process.env.STRIPE_SECRET_KEY) && !isMissing(process.env.STRIPE_WEBHOOK_SECRET),
  posthog: !isMissing(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  storage: !isMissing(process.env.WASABI_ENDPOINT) && !isMissing(process.env.WASABI_BUCKET_NAME),
  gemini: !isMissing(process.env.GEMINI_API_KEY),
  sync: !isMissing(process.env.GOOGLE_SHEETS_CSV_URL) && !isMissing(process.env.ADMIN_SYNC_SECRET),
};

console.log('Public env summary:', JSON.stringify(publicSummary, null, 2));

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Warnings:\n', warnings.join('\n'));
}

console.log('Environment validation passed.');
