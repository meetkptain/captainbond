import { createClient, SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    if (process.env.NEXT_PHASE === 'phase-production-build') return '';
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

// Client Supabase privilégié pour bypasser le RLS en base de données.
// À importer UNIQUEMENT dans le cadre d'opérations exécutées côté serveur (API Routes, Server Actions).
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return Reflect.get(getClient(), prop as keyof SupabaseClient);
  },
});
