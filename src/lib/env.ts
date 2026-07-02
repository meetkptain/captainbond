import { envSchema, Env } from '@/lib/schemas/env';
import { logger } from '@/lib/logger';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

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
] as const;

const SECRET_LENGTH_VARS = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_JWT_SECRET',
  'PLAYER_JWT_SECRET',
  'HOST_TOKEN_SECRET',
  'HMAC_IMPOSTEUR_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CRON_SECRET',
] as const;

const MIN_SECRET_LENGTH = 32;

function isMissing(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function validateEnv(): EnvValidationResult {
  const parsed = envSchema.safeParse(process.env);
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!parsed.success) {
    const formatted = parsed.error.format();
    for (const key of Object.keys(formatted)) {
      if (key === '_errors') continue;
      const field = formatted[key as keyof typeof formatted];
      if (field && Array.isArray((field as { _errors?: string[] })._errors) && (field as { _errors: string[] })._errors.length > 0) {
        missing.push(key);
      }
    }
  } else {
    for (const key of SECRET_LENGTH_VARS) {
      const value = process.env[key];
      if (value && value.length < MIN_SECRET_LENGTH) {
        warnings.push(`${key} doit faire au moins ${MIN_SECRET_LENGTH} caractères.`);
      }
    }
  }

  if (process.env.ADMIN_PASSWORD) {
    warnings.push('ADMIN_PASSWORD est déprécié. Utilisez ADMIN_PASSWORD_HASH à la place.');
  }

  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    const value = process.env[key];
    if (isMissing(value)) {
      warnings.push(`Variable optionnelle manquante : ${key}`);
    }
  }

  const result: EnvValidationResult = {
    valid: parsed.success && missing.length === 0,
    missing,
    warnings,
  };

  if (!result.valid) {
    logger.error('Environment validation failed', { missing, warnings });
  } else if (result.warnings.length > 0) {
    logger.warn('Environment validation completed with warnings', { warnings });
  } else {
    logger.info('Environment validation passed');
  }

  return result;
}

let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (!cachedEnv) {
    const result = validateEnv();
    if (!result.valid) {
      throw new Error('Invalid environment configuration');
    }
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}

export function requireEnv(name: keyof Env): string {
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return `mock-${String(name).toLowerCase().replace(/_/g, '-')}-value-for-build-32-chars-long`;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return raw;
}

export function getPublicEnvSummary(): Record<string, boolean> {
  return {
    supabase: !isMissing(process.env.NEXT_PUBLIC_SUPABASE_URL) && !isMissing(process.env.SUPABASE_SERVICE_ROLE_KEY),
    upstash: !isMissing(process.env.UPSTASH_REDIS_REST_URL) && !isMissing(process.env.UPSTASH_REDIS_REST_TOKEN),
    stripe: !isMissing(process.env.STRIPE_SECRET_KEY) && !isMissing(process.env.STRIPE_WEBHOOK_SECRET),
    posthog: !isMissing(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    storage: !isMissing(process.env.WASABI_ENDPOINT) && !isMissing(process.env.WASABI_BUCKET_NAME),
    gemini: !isMissing(process.env.GEMINI_API_KEY),
    sync: !isMissing(process.env.GOOGLE_SHEETS_CSV_URL) && !isMissing(process.env.ADMIN_SYNC_SECRET),
  };
}
