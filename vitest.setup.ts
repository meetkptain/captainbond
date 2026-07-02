// Ensure required env vars are present for unit tests that import Supabase clients
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-32-chars-long-string';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-role-key-32-chars-long';
process.env.ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'dummy-admin-password-hash-32-char-long';
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dummy-admin-jwt-secret-32-char-long';
process.env.PLAYER_JWT_SECRET = process.env.PLAYER_JWT_SECRET || 'dummy-player-jwt-secret-32-char-long';
process.env.HOST_TOKEN_SECRET = process.env.HOST_TOKEN_SECRET || 'dummy-host-token-secret-32-char-long';
process.env.HMAC_IMPOSTEUR_SECRET = process.env.HMAC_IMPOSTEUR_SECRET || 'dummy-hmac-imposteur-secret-32-char';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy-stripe-secret-key-32-char';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy-webhook-secret-32-char-long';
