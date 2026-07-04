# Guide de Déploiement — Captain Bond

## Vue d'ensemble

3 plateformes impliquées :

```
Votre PC (.env.local)          GitHub Secrets                  Cloudflare Dashboard
      │                              │                                │
      ├── NEXT_PUBLIC_* ─────────► 6 secrets                  ──►    │
      ├── SUPABASE_SERVICE_... ──► (build-time only)                 │
      ├── STRIPE_SECRET_KEY ───►                                     │
      ├── ...                                                         │
      └── 28 vars total ──────────────────────────────────────► 22 secrets + 6 vars
                                                                     │
                                                                     ▼
                                                            captainbond.com
```

**Ordre à suivre** :
1. Configurer les produits externes (Supabase, Stripe, etc.)
2. Générer les clés manquantes
3. Remplir **GitHub Secrets** (6 entrées)
4. Remplir **Cloudflare Dashboard** (28 entrées)
5. Déploiement automatique

---

## 1. Produits externes — Configurer chaque service

### 1.1 Supabase (🔴 Obligatoire — déjà fait)

| Variable | Où trouver |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → **Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Même page → **anon public key** |
| `SUPABASE_SERVICE_ROLE_KEY` | Même page → **service_role key** (secret) |
| `DATABASE_URL` | Même page → **Connection string → URI** |

**Lien** : https://supabase.com/dashboard/project

---

### 1.2 Stripe (🔴 Obligatoire — déjà fait)

| Variable | Où trouver |
|----------|------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → **Developers → API Keys** → `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → **Developers → Webhooks** → Endpoint → Signing secret `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Même page → **Publishable key** `pk_live_...` |

**⚠️ Webhook à configurer APRÈS déploiement** : dans Stripe Dashboard, ajouter un endpoint vers `https://captainbond.com/api/webhook/stripe`

**Lien** : https://dashboard.stripe.com/apikeys

---

### 1.3 Auth Secrets (🔴 Obligatoire — à générer)

Générer avec le terminal :

```bash
# Un seul mot de passe admin (tu choisis le mot de passe)
echo -n "ton_mot_de_passe_admin" | openssl dgst -sha256
# Résultat : ADMIN_PASSWORD_HASH = a1b2c3d4e5f6...

# 6 clés aléatoires
openssl rand -base64 32   # ADMIN_JWT_SECRET
openssl rand -base64 32   # PLAYER_JWT_SECRET
openssl rand -base64 32   # HOST_TOKEN_SECRET
openssl rand -base64 32   # HMAC_IMPOSTEUR_SECRET
openssl rand -base64 32   # COUPLE_INVITE_SECRET
openssl rand -base64 32   # CRON_SECRET
openssl rand -base64 32   # ADMIN_SYNC_SECRET
```

Ou tout d'un coup :

```bash
echo "=== AUTH SECRETS ==="
echo -n "MonAdminPassword2025!" | openssl dgst -sha256 | awk '{print "ADMIN_PASSWORD_HASH="$2}'
for name in ADMIN_JWT_SECRET PLAYER_JWT_SECRET HOST_TOKEN_SECRET HMAC_IMPOSTEUR_SECRET COUPLE_INVITE_SECRET CRON_SECRET ADMIN_SYNC_SECRET; do
  echo "$name=$(openssl rand -base64 32)"
done
```

---

### 1.4 Cloudflare API Token (🔴 Obligatoire — à créer)

1. Aller sur https://dash.cloudflare.com/profile/api-tokens
2. Cliquer **Create Token**
3. Choisir **Cloudflare Pages: Edit**
4. Sélectionner le compte et **captainbond** comme ressource
5. Copier le token généré → **`CLOUDFLARE_API_TOKEN`**

Ce token servira pour GitHub Secrets (étape 2) pour que le workflow déploie automatiquement.

---

### 1.5 PostHog (🟡 Recommandé — analytics produit)

1. Créer un compte gratuit sur https://app.posthog.com/signup
2. Aller dans **Project Settings → API Keys**
3. Copier **Project API Key** (`phc_...`)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_AbCdEf123456...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` (ou `.eu` si Europe) |

**Alternative** : sans PostHog, le site marche, les analytics sont juste désactivés.

---

### 1.6 Google Analytics GA4 (🟡 Recommandé — SEO)

1. Aller sur https://analytics.google.com
2. Créer une propriété → **Web** → renseigner `captainbond.com`
3. Aller dans **Admin → Data Streams → Web**
4. Copier le **Measurement ID** (`G-XXXXXXXX`)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_GA_ID` | `G-12345ABC` |

**Alternative** : sans GA4, fallback `'G-XXXXXXXXXX'`, analytics désactivés.

---

### 1.7 Resend (🟡 Optionnel — emails transactionnels)

1. Créer compte sur https://resend.com
2. Aller dans **API Keys**
3. Créer une clé → copier `re_...`

Sans ça : pas d'envoi d'emails. Le site marche.

---

### 1.8 Gemini AI (🟡 Optionnel — génération de questions)

1. Aller sur https://aistudio.google.com/app/apikey
2. Créer une clé API → copier

Sans ça : les questions générées par IA cassent. Le mode couple fonctionne sans.

---

### 1.9 Upstash Redis (🟡 Optionnel — cache / rate limiting)

1. Créer compte sur https://upstash.com
2. Créer une **Redis Database** (gratuit)
3. Copier l'URL REST et le token

Sans ça : rate limiting et cache désactivés. Site marche.

---

### 1.10 Wasabi (🟡 Optionnel — upload fichiers)

1. Créer compte sur https://wasabi.com
2. Générer **Access Keys**
3. Créer un bucket et noter le endpoint

Sans ça : upload de fichiers cassé (profils, images). App marche sans.

---

### 1.11 RevenueCat (🟡 Optionnel — mobile)

| Variable | Où trouver |
|----------|------------|
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat Dashboard → **Webhooks** |
| `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat → **App Config → iOS** |
| `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat → **App Config → Android** |

Sans ça : webhooks mobile ignorés. Site web marche parfaitement.

---

### 1.12 Google Sheets (🟡 Optionnel — sync admin)

| Variable | Où trouver |
|----------|------------|
| `GOOGLE_SHEETS_CSV_URL` | Publier un Google Sheet → CSV → copier l'URL publique |

Sans ça : sync admin désactivée.

---

## 2. Remplir GitHub Secrets

**Lien** : https://github.com/meetkptain/captainbond/settings/secrets/actions

Cliquer **"New repository secret"** pour chaque entrée :

| Secret GitHub | Valeur |
|---------------|--------|
| `CLOUDFLARE_API_TOKEN` | Token créé étape 1.4 |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` (étape 1.5) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_GA_ID` | `G-...` (étape 1.6) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` (étape 1.1) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (étape 1.1) |

---

## 3. Remplir Cloudflare Dashboard

**Lien** : https://dash.cloudflare.com → **Workers & Pages** → **captainbond** → **Settings** → **Environment Variables**

### Section "Variables" (ajouter comme **plain text**)

Cliquer "Add variable" :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://captainbond.com` |
| `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/captainbond/demo` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (étape 1.2) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (vide si pas de push notification) |
| `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | (vide si pas mobile) |
| `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` | (vide si pas mobile) |

### Section "Secrets" (ajouter comme **secret**)

Cliquer "Add secret" — le champ est masqué automatiquement :

**Supabase :**
| Secret | Valeur |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role) |
| `DATABASE_URL` | `postgresql://...` |

**Auth :**
| Secret | Valeur |
|--------|--------|
| `ADMIN_PASSWORD_HASH` | Hash sha256 (étape 1.3) |
| `ADMIN_JWT_SECRET` | `openssl rand` (étape 1.3) |
| `PLAYER_JWT_SECRET` | `openssl rand` |
| `HOST_TOKEN_SECRET` | `openssl rand` |
| `HMAC_IMPOSTEUR_SECRET` | `openssl rand` |
| `COUPLE_INVITE_SECRET` | `openssl rand` |
| `ADMIN_SYNC_SECRET` | `openssl rand` |

**Stripe :**
| Secret | Valeur |
|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

**Autres :**
| Secret | Valeur |
|--------|--------|
| `CRON_SECRET` | `openssl rand` |
| `RESEND_API_KEY` | `re_...` (ou vide) |
| `UPSTASH_REDIS_REST_URL` | URL Upstash (ou vide) |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash (ou vide) |
| `WASABI_ACCESS_KEY_ID` | Wasabi key (ou vide) |
| `WASABI_SECRET_ACCESS_KEY` | Wasabi secret (ou vide) |
| `WASABI_BUCKET_NAME` | Nom du bucket (ou vide) |
| `WASABI_ENDPOINT` | `s3.eu-central-1.wasabisys.com` (ou vide) |
| `GOOGLE_SHEETS_CSV_URL` | URL Google Sheet (ou vide) |
| `GEMINI_API_KEY` | Clé Google AI (ou vide) |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat (ou vide) |
| `APP_URL` | `https://captainbond.app` |

**⚠️ Important** : les variables notées "ou vide" peuvent être laissées vides (features optionnelles désactivées). Les 🔴 obligatoires doivent impérativement avoir une valeur.

---

## 4. Configurer les webhooks (APRÈS déploiement)

Une fois `captainbond.com` en ligne :

**Stripe :**
1. Aller sur https://dashboard.stripe.com/webhooks
2. **Add endpoint** → URL : `https://captainbond.com/api/webhook/stripe`
3. Écouter l'événement `checkout.session.completed`
4. Copier le **Signing secret** dans `STRIPE_WEBHOOK_SECRET`

**RevenueCat (si utilisé) :**
1. Aller sur RevenueCat Dashboard → **Webhooks**
2. URL : `https://captainbond.com/api/webhook/revenuecat`

---

## 5. Déclencher le déploiement

Dès que `CLOUDFLARE_API_TOKEN` est dans GitHub Secrets, le déploiement se déclenche **automatiquement** sur chaque push vers `main`.

Pour vérifier :
```
1. https://github.com/meetkptain/captainbond/actions
   → Voir le workflow "Deploy Cloudflare Pages" en cours

2. https://captainbond.com → doit répondre 200

3. curl https://captainbond.com/pricing → page visible
```

---

## 6. Comptes à créer — Résumé

| Service | Lien | Créer compte ? | Temps |
|---------|------|----------------|-------|
| Cloudflare | https://dash.cloudflare.com | ✅ Déjà fait | — |
| GitHub | https://github.com | ✅ Déjà fait | — |
| Supabase | https://supabase.com | ✅ Déjà fait | — |
| Stripe | https://dashboard.stripe.com | ✅ Déjà fait | — |
| **PostHog** | https://app.posthog.com | ❌ **À créer** | 5 min |
| **Google Analytics** | https://analytics.google.com | ❌ **À créer** | 5 min |
| **Resend** | https://resend.com | ❌ Optionnel | 5 min |
| **Gemini AI** | https://aistudio.google.com | ❌ Optionnel | 3 min |
| **Upstash** | https://upstash.com | ❌ Optionnel | 5 min |
| **Wasabi** | https://wasabi.com | ❌ Optionnel | 5 min |
| **RevenueCat** | https://www.revenuecat.com | ❌ Optionnel | 5 min |

---

## 7. Vérification post-déploiement

```
□ https://captainbond.com → 200 OK
□ /pricing → page visible
□ /sitemap.xml → 52 URLs
□ /robots.txt → AI bots autorisés (GPTBot, ChatGPT-User, ClaudeBot, etc.)
□ /llms.txt → accessible
□ /okf/index.json → accessible
□ Page blog → 404 non (vérifier /blog/questions-to-ask-your-partner)
□ GA4 → Real-time report montre 1 session active
□ PostHog → 1 event page_view reçu
□ Google Search Console → propriété ajoutée + vérifiée
□ Bing Webmaster Tools → propriété ajoutée + vérifiée
□ Stripe webhook → endpoint créé + fire test event
```

---

## 8. Script complet de génération des secrets

```bash
#!/bin/bash
# Génère tous les secrets auth pour Captain Bond
# Usage : bash generate-secrets.sh

echo "=== SECRETS CAPTAIN BOND ==="
echo ""

echo "--- Admin Password Hash ---"
read -sp "Enter admin password: " ADMIN_PWD
echo ""
echo "ADMIN_PASSWORD_HASH=$(echo -n "$ADMIN_PWD" | openssl dgst -sha256 | awk '{print $2}')"
echo ""

echo "--- Random secrets (save these!) ---"
for name in ADMIN_JWT_SECRET PLAYER_JWT_SECRET HOST_TOKEN_SECRET HMAC_IMPOSTEUR_SECRET COUPLE_INVITE_SECRET CRON_SECRET ADMIN_SYNC_SECRET; do
  echo "$name=$(openssl rand -base64 32)"
done
```

---

## Annexe A : `wrangler.toml` complet

```toml
name = "captainbond"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2025-07-03"

pages_build_output_dir = ".vercel/output/static"

[[services]]
binding = "NEXT_PAGES"
service = "captainbond"

[env.production]
vars = { NEXT_PUBLIC_SITE_URL = "https://captainbond.com" }

[env.preview]
vars = { NEXT_PUBLIC_SITE_URL = "https://preview.captainbond.com" }

[env.production.secrets]
# Ces vars sont définies dans le dashboard Cloudflare :
# https://dash.cloudflare.com → Workers & Pages → captainbond → Settings → Environment Variables

# Supabase
NEXT_PUBLIC_SUPABASE_URL = ""
NEXT_PUBLIC_SUPABASE_ANON_KEY = ""
SUPABASE_SERVICE_ROLE_KEY = ""
DATABASE_URL = ""

# Auth
ADMIN_PASSWORD_HASH = ""
ADMIN_JWT_SECRET = ""
PLAYER_JWT_SECRET = ""
HOST_TOKEN_SECRET = ""
HMAC_IMPOSTEUR_SECRET = ""
COUPLE_INVITE_SECRET = ""
ADMIN_SYNC_SECRET = ""

# Stripe
STRIPE_SECRET_KEY = ""
STRIPE_WEBHOOK_SECRET = ""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = ""

# Autres
CRON_SECRET = ""
RESEND_API_KEY = ""
UPSTASH_REDIS_REST_URL = ""
UPSTASH_REDIS_REST_TOKEN = ""
NEXT_PUBLIC_POSTHOG_KEY = ""
NEXT_PUBLIC_POSTHOG_HOST = ""
NEXT_PUBLIC_GA_ID = ""
NEXT_PUBLIC_CALENDLY_URL = "https://calendly.com/captainbond/demo"
WASABI_ACCESS_KEY_ID = ""
WASABI_SECRET_ACCESS_KEY = ""
WASABI_BUCKET_NAME = ""
WASABI_ENDPOINT = ""
NEXT_PUBLIC_VAPID_PUBLIC_KEY = ""
NEXT_PUBLIC_REVENUECAT_IOS_KEY = ""
NEXT_PUBLIC_REVENUECAT_ANDROID_KEY = ""
REVENUECAT_WEBHOOK_SECRET = ""
GOOGLE_SHEETS_CSV_URL = ""
GEMINI_API_KEY = ""
APP_URL = "https://captainbond.app"
```

---

## Annexe B : `.env.example` complet

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Admin / Auth secrets
ADMIN_PASSWORD_HASH=
ADMIN_JWT_SECRET=
PLAYER_JWT_SECRET=
HOST_TOKEN_SECRET=
HMAC_IMPOSTEUR_SECRET=
COUPLE_INVITE_SECRET=
ADMIN_SYNC_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cron
CRON_SECRET=
APP_URL=https://captainbond.app

# Optional
NEXT_PUBLIC_SITE_URL=https://captainbond.com
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/captainbond/demo
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_GA_ID=
WASABI_ACCESS_KEY_ID=
WASABI_SECRET_ACCESS_KEY=
WASABI_BUCKET_NAME=
WASABI_ENDPOINT=
GOOGLE_SHEETS_CSV_URL=
GEMINI_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
NEXT_PUBLIC_REVENUECAT_IOS_KEY=
NEXT_PUBLIC_REVENUECAT_ANDROID_KEY=
REVENUECAT_WEBHOOK_SECRET=

# E2E only
E2E_ADMIN_PASSWORD=
```
