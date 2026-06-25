import { logger } from './logger';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_STRING_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
  'ADMIN_JWT_SECRET',
  'PLAYER_JWT_SECRET',
  'HOST_TOKEN_SECRET',
  'HMAC_IMPOSTEUR_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

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

const MIN_SECRET_LENGTH = 32;

function isMissing(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function checkSecretLength(name: string, value: string | undefined): string | null {
  if (!value) return null;
  if (value.length < MIN_SECRET_LENGTH) {
    return `${name} doit faire au moins ${MIN_SECRET_LENGTH} caractères.`;
  }
  return null;
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_STRING_VARS) {
    const value = process.env[key];
    if (isMissing(value)) {
      missing.push(key);
    } else if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
      const warning = checkSecretLength(key, value);
      if (warning) warnings.push(warning);
    }
  }

  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    const value = process.env[key];
    if (isMissing(value)) {
      warnings.push(`Variable optionnelle manquante : ${key}`);
    }
  }

  const result: EnvValidationResult = {
    valid: missing.length === 0,
    missing,
    warnings,
  };

  if (!result.valid) {
    logger.error('Environment validation failed', {
      missing: result.missing,
      warnings: result.warnings,
    });
  } else if (result.warnings.length > 0) {
    logger.warn('Environment validation completed with warnings', {
      warnings: result.warnings,
    });
  } else {
    logger.info('Environment validation passed');
  }

  return result;
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
