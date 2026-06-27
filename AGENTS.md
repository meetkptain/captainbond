<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Conventions Koze

## Architecture

- **Services** : toute la logique métier doit vivre dans `src/services/*`.
- **Repositories** : tout accès à Supabase passe par `src/lib/db/repositories/*`.
- **Routes API** : toutes les routes utilisent `withApiHandler` avec des schémas Zod et `runtime = 'edge'`.
- **Middleware** : l'authentification admin se fait dans `src/middleware.ts` (runtime Edge).

## Erreurs

- Utiliser `AppError` pour toutes les erreurs métier prévisibles.
- `throw new Error` est réservé aux échecs de configuration au boot (secrets manquants).

## Environnement

- Variables requises : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `PLAYER_JWT_SECRET`, `HOST_TOKEN_SECRET`, `HMAC_IMPOSTEUR_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Voir `.env.example` et `docs/DEPLOYMENT.md`.

## Sécurité

- `HOST_TOKEN_SECRET` est dédié aux tokens hôte et doit être différent de `ADMIN_SYNC_SECRET`.
- `storage/presign` est protégé par authentification admin.

## Robustesse

- Utiliser `safeJsonParse` pour tout parsing JSON externe.
- Utiliser `fetchWithTimeout` / `withTimeout` pour les appels externes.
- Utiliser `withRetry` / `dbRetry` pour les appels Supabase et Stripe.

## Déploiement Supabase

- Appliquer les migrations dans `supabase/migrations/` par ordre numérique.
