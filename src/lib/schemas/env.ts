import { z } from 'zod';

const optionalString = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().min(1).optional(),
);

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(1),
  PLAYER_JWT_SECRET: z.string().min(1),
  HOST_TOKEN_SECRET: z.string().min(1),
  HMAC_IMPOSTEUR_SECRET: z.string().min(1),
  COUPLE_INVITE_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  E2E_ADMIN_PASSWORD: optionalString,
  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalString,
  WASABI_ACCESS_KEY_ID: optionalString,
  WASABI_SECRET_ACCESS_KEY: optionalString,
  WASABI_BUCKET_NAME: optionalString,
  WASABI_ENDPOINT: optionalString,
  GOOGLE_SHEETS_CSV_URL: optionalString,
  ADMIN_SYNC_SECRET: optionalString,
  GEMINI_API_KEY: optionalString,
  CRON_SECRET: optionalString,
  DATABASE_URL: optionalString,
});

export type Env = z.infer<typeof envSchema>;
