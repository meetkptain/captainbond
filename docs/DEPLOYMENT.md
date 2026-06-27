# Déploiement Koze — Checklist

> Cette checklist couvre le déploiement sur **Cloudflare Pages** avec le runtime Edge (`@cloudflare/next-on-pages`).

## 1. Variables d’environnement

Copier `.env.example` vers `.env.local` en local et configurer les variables sur Cloudflare Pages :

### Obligatoires

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD_HASH` (hash bcrypt du mot de passe admin)
- `ADMIN_JWT_SECRET` (min. 32 caractères)
- `HOST_TOKEN_SECRET` (min. 32 caractères, **différent** de `ADMIN_SYNC_SECRET` et des autres secrets)
- `PLAYER_JWT_SECRET` (min. 32 caractères, différent de `ADMIN_JWT_SECRET`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Fortement recommandées en production

- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (rate-limiting)
- `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (analytics)
- `WASABI_ACCESS_KEY_ID`, `WASABI_SECRET_ACCESS_KEY`, `WASABI_BUCKET_NAME`, `WASABI_ENDPOINT` (stockage médias)
- `GOOGLE_SHEETS_CSV_URL` + `ADMIN_SYNC_SECRET` (sync questions)
- `GEMINI_API_KEY` (génération questions)

### Validation locale

```bash
npm run validate:env
```

## 2. Base de données Supabase

Déployer les migrations dans l’ordre numérique via l’éditeur SQL Supabase (`supabase/migrations/`) :

1. `001_initial_rls.sql` — active RLS et policies restrictives.
2. `002_initial_rpc.sql` — fonctions atomiques (`record_vote`, `fulfill_checkout`, …).

Les fichiers racine `supabase_rls.sql` et `supabase_rpc.sql` sont conservés pour compatibilité mais ne sont plus la source de vérité.

Vérifier que les tables suivantes existent et ont RLS activé :

- `Room`, `Player`, `Response`, `Score`, `Question`, `Pack`, `Purchase`, `UserPass`, `UserPack`, `User`, `UserStats`, `WebhookEvent`, `RoomPass`

## 3. Stripe

1. Créer les produits/prix dans Stripe et reporter les `priceId` dans la table `Pack`.
2. Configurer le webhook Stripe sur `/api/webhook`.
3. S’assurer que les métadonnées des Checkout Sessions contiennent bien `userId`.

## 4. Build & déploiement Cloudflare Pages

```bash
npm run pages:build
npm run pages:deploy
```

Ou via CI :

```bash
npm ci
npm run validate:env
npm run build
npm run pages:deploy
```

## 5. Vérifications post-déploiement

- [ ] `GET /api/health` retourne `healthy` avec `upstash: ok`.
- [ ] Le login admin fonctionne et le cookie `koze_admin_session` est `HttpOnly; Secure; SameSite=Lax`.
- [ ] Création de room + join + vote fonctionnent.
- [ ] Un paiement test Stripe déclenche `/api/webhook` et remplit `Purchase` + `UserPack`/`UserPass`.
- [ ] Le rate-limit bloque les bursts (si Upstash est configuré).

## 6. Sécurité

- Les secrets JWT et HOST_TOKEN doivent être générés aléatoirement (256 bits / 32+ caractères).
- `ADMIN_PASSWORD` est déprécié ; utiliser `ADMIN_PASSWORD_HASH` (hash bcrypt) à la place.
- Ne jamais commiter `.env.local` ni `ADMIN_PASSWORD` en clair.
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` n’est utilisé que côté serveur.

## 7. Mise à jour

Avant chaque mise en production :

1. Lancer `npm run validate:env`.
2. Lancer `npm test`.
3. Lancer `npm run build`.
4. Vérifier que `supabase/migrations/` n’a pas de nouvelles migrations depuis le dernier déploiement ; si oui, les appliquer dans l’ordre numérique.
