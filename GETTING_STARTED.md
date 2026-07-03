# Guide de demarrage et deploiement

Guide pour mettre en production Captain Bond et configurer les services tiers (Supabase, Stripe, Gemini, Wasabi S3).

## Architecture

```
                    +---------------------------+
                    |    CLOUDFLARE PAGES       |
                    |  (Next.js App Router)     |
                    +------+----------+--------+
                           |          |
             (API REST)    |    (Presigned upload)
                           v          v
            +----------+        +-----------+
            | SUPABASE |        | WASABI S3 |
            | (DB+Rl)  |        | (Storage) |
            +----------+        +-----------+
                   |
                   v
            +----------+
            |  GEMINI  |
            |  (IA)    |
            +----------+

Cloudflare Workers (crons)
  - rituals (Lun/Mer/Ven 11h30)
  - push notifications (Lun/Mer/Ven 11h et 19h)
  - weekly recap (Dim 20h)
  - heatmap (Lun 2h)
  - tree progress (1er du mois 2h)
```

## 1. Base de donnees Supabase

1. Creer un projet Supabase
2. Copier l'URL et la cles depuis Dashboard > Settings > API
3. Appliquer les migrations depuis `supabase/migrations/` dans l'ordre numerique via l'editeur SQL

```bash
# Via Supabase CLI
supabase migration up
# Ou manuellement via l'editeur SQL
```

## 2. Variables d'environnement

### Local (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
ADMIN_PASSWORD_HASH= (hash bcrypt)
ADMIN_JWT_SECRET= (min 32 char)
PLAYER_JWT_SECRET= (min 32 char)
HOST_TOKEN_SECRET= (min 32 char)
COUPLE_INVITE_SECRET= (min 32 char)

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini
GEMINI_API_KEY=AIzaSy...

# Wasabi S3
WASABI_ACCESS_KEY_ID=
WASABI_SECRET_ACCESS_KEY=
WASABI_BUCKET_NAME=
WASABI_ENDPOINT=

# Cron (Cloudflare Worker)
CRON_SECRET= (genere avec openssl rand -hex 32)
APP_URL=https://captainbond.app

# Analyses
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Production (Cloudflare Pages)

Ajouter les memes variables dans Cloudflare Dashboard > Pages > captainbond > Settings > Environment Variables.

## 3. Stripe

1. Creer les produits dans Stripe Dashboard
2. Configurer le webhook Stripe sur `/api/webhook`
   - Evenements : `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
3. Reporter les `priceId` dans la table `Pack` Supabase

## 4. Deploiement Cloudflare Pages

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy .next --project-name=captainbond
```

Ou connecter le repo GitHub directement (auto-deploy).

## 5. Deploiement Cloudflare Worker (crons)

```bash
cd workers/cron-trigger

# Configurer les secrets
npx wrangler secret put CRON_SECRET
npx wrangler secret put APP_URL

# Deployer
npx wrangler deploy
```

Ou via GitHub Actions (sur chaque push modifiant `workers/`).

## 6. Migrations

Appliquer les migrations Supabase dans l'ordre :

1. `20260618_monetization_v2.sql` — Monetisation Stripe
2. `20260703074937_advance_room_round.sql` — Room round advance
3. `20260703100000_couple_killer_features.sql` — Features couple (P1-P4)

## 7. Verification post-deploiement

- [ ] `GET /api/health` retourne `healthy`
- [ ] Creation de couple via lien d'invitation fonctionne
- [ ] Paiement Stripe test fonctionne (`4242 4242 4242 4242`)
- [ ] Rituel du jour genere a 11h
- [ ] Push notification recue
- [ ] Reveal a 20h fonctionne
- [ ] Weekly recap genere le dimanche
