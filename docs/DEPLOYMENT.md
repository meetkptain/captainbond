# Deploiement — Captain Bond

Checklist de deploiement sur **Cloudflare Pages** + **Cloudflare Workers** (crons).

## 1. Variables d'environnement

Voir `.env.example` pour la liste complete.

Obligatoires :
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD_HASH` (hash bcrypt), `ADMIN_JWT_SECRET`, `PLAYER_JWT_SECRET`, `HOST_TOKEN_SECRET`
- `COUPLE_INVITE_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY`

Fortement recommandes :
- `WASABI_ACCESS_KEY_ID`, `WASABI_SECRET_ACCESS_KEY`, `WASABI_BUCKET_NAME`, `WASABI_ENDPOINT`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate-limiting)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (analytics)

Crons (Cloudflare Worker) :
- `CRON_SECRET` (secret partage entre les crons et l'app)
- `APP_URL` (URL de l'app, ex: https://captainbond.app)

## 2. Base de donnees Supabase

Appliquer les migrations dans l'ordre numerique via l'editeur SQL Supabase :

```bash
supabase/migrations/001_initial_rls.sql
supabase/migrations/002_initial_rpc.sql
...
supabase/migrations/20260618_monetization_v2.sql
supabase/migrations/20260703074937_advance_room_round.sql
supabase/migrations/20260703100000_couple_killer_features.sql
```

## 3. Stripe

1. Creer les produits/prix dans Stripe Dashboard
2. Reporter les `stripePriceId` dans la table `Pack`
3. Webhook : `/api/webhook`, evenements `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

## 4. Build & deploy Cloudflare Pages

```bash
npm ci
npm run build
npx wrangler pages deploy .next --project-name=captainbond
```

Ou via GitHub (auto-deploy) : connecter le repo dans Cloudflare Dashboard > Pages > Create > Connect to Git.

## 5. Deploy Cloudflare Worker (crons)

```bash
cd workers/cron-trigger
npx wrangler secret put CRON_SECRET
npx wrangler secret put APP_URL
npx wrangler deploy
```

Ou via GitHub Actions (automatique sur chaque push modifiant `workers/`).

### Crons configures

| Cron | Schedule | Route |
|------|----------|-------|
| rituals | Lun/Mer/Ven 11h30 UTC | `/api/cron/rituals` |
| push-ritual-available | Lun/Mer/Ven 11h00 UTC | `/api/cron/push-ritual-available` |
| push-reveal-time | Lun/Mer/Ven 19h00 UTC | `/api/cron/push-reveal-time` |
| weekly-recap | Dimanche 20h00 UTC | `/api/cron/weekly-recap` |
| heatmap | Lundi 02h00 UTC | `/api/cron/heatmap` |
| tree-progress | 1er du mois 02h00 UTC | `/api/cron/tree-progress` |

## 6. Verification post-deploiement

- [ ] `GET /api/health` retourne `healthy`
- [ ] Login admin fonctionne
- [ ] Creation de room + join + vote fonctionnent
- [ ] Creation de couple via lien d'invitation fonctionne et declenche l'essai 7 jours
- [ ] Paiement Stripe test fonctionne (carte `4242 4242 4242 4242`)
- [ ] Rituel du jour genere (11h30 UTC Lun/Mer/Ven)
- [ ] Push notification recue (11h et 19h UTC)
- [ ] Shared Reveal fonctionne (20h UTC)
- [ ] Weekly recap generne le dimanche 20h UTC
- [ ] Heatmap mise a jour le lundi 2h UTC
- [ ] Tree progress calcule le 1er du mois

## 7. Securite

- Les secrets JWT doivent etre generes aleatoirement (32+ caracteres)
- `ADMIN_PASSWORD` est deprecie ; utiliser `ADMIN_PASSWORD_HASH`
- Ne jamais commiter `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` utilise uniquement cote serveur
