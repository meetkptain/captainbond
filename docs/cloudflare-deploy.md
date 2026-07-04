# Déploiement Cloudflare Pages + Workers

## Prérequis

```bash
# 1. Installer Wrangler CLI
npm install -g wrangler

# 2. Se connecter à Cloudflare
wrangler login

# 3. Vérifier la connexion
wrangler whoami
```

## Étape 1 : Build

```bash
npm run pages:build
```

Cela exécute `npx @cloudflare/next-on-pages` qui transforme le build Next.js en format compatible Cloudflare Pages.

Le output est dans `.vercel/output/static/`.

## Étape 2 : Preview local

```bash
npm run pages:preview
```

Cela lance un serveur local avec `wrangler pages dev` pour tester.

## Étape 3 : Déployer

```bash
npm run pages:deploy
```

Cela build + déploie sur Cloudflare Pages.

Alternative : déploiement via le dashboard Cloudflare :
1. Aller sur https://dash.cloudflare.com
2. Workers & Pages > Create > Pages > Connect to Git
3. Sélectionner le repo
4. Framework: Next.js
5. Build command: `npm run pages:build`
6. Output directory: `.vercel/output/static`
7. Environment variables: toutes les clés du `.env.example`

## Configuration requise dans le dashboard Cloudflare

### Environment Variables (Production)
Ajouter TOUTES les variables de `.env.example` dans :
Dashboard > captainbond > Settings > Environment Variables > Production

**Important** : Les variables `NEXT_PUBLIC_*` doivent être en clair. Les autres en "secret".

### Variables préfixées
| Variable | Valeur | Type |
|----------|--------|------|
| `NEXT_PUBLIC_SITE_URL` | https://captainbond.com | Texte |
| `NEXT_PUBLIC_SUPABASE_URL` | ... | Texte |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ... | Texte |
| `NEXT_PUBLIC_CALENDLY_URL` | https://calendly.com/captainbond/demo | Texte |
| `NEXT_PUBLIC_POSTHOG_KEY` | ... | Texte |
| `NEXT_PUBLIC_POSTHOG_HOST` | ... | Texte |
| `SUPABASE_SERVICE_ROLE_KEY` | ... | Secret |
| `ADMIN_PASSWORD_HASH` | ... | Secret |
| `ADMIN_JWT_SECRET` | ... | Secret |
| `PLAYER_JWT_SECRET` | ... | Secret |
| `HOST_TOKEN_SECRET` | ... | Secret |
| `HMAC_IMPOSTEUR_SECRET` | ... | Secret |
| `STRIPE_SECRET_KEY` | ... | Secret |
| `STRIPE_WEBHOOK_SECRET` | ... | Secret |
| (etc. pour toutes les variables du `.env.example`) | | |

### Custom Domain
Dashboard > captainbond.com > Custom domains > Add > captainbond.com
- DNS géré par Cloudflare (nameservers à changer si besoin)

### SSL/TLS
- Full (strict) recommandé

## Limites Cloudflare à connaître

| Ressource | Limite Free | Au-delà |
|-----------|-------------|---------|
| Builds/mois | 500 | $ |
| Bandwidth | 1 GB | Pay-as-you-go |
| Workers | 100K req/jour | Workers Paid ($) |
| KV (si utilisé) | 1GB | Pay-as-you-go |
| Duration Worker | 30s Free / 60s Paid | - |

## Pièges fréquents

1. **Prisma** : Ne fonctionne pas directement sur Workers (pas de Node.js). Solution : utiliser Supabase JS client directement au lieu de Prisma, ou déployer Prisma sur une instance séparée.
2. **WebSockets** : Les Workers ne supportent pas les WebSockets en entrée. Si Supabase Realtime est utilisé côté serveur, vérifier la compatibilité.
3. **Stripe webhooks** : Fonctionnent bien sur Workers (fetch API).
4. **Node.js API** : `@cloudflare/next-on-pages` émule Node.js via `nodejs_compat` flag. Vérifier que toutes les dépendances sont compatibles.
5. **Middleware** : Le middleware Edge Next.js fonctionne comme un Worker Cloudflare.

## Rollback

```bash
# Déployer une version précédente
wrangler pages deploy --branch=<commit-sha>

# Via dashboard : captainbond > Production > ... > Rollback
```

## Logs

```bash
wrangler pages deployment list
wrangler pages tail
```

## Tester après déploiement

```bash
# Vérifier que le site répond
curl -I https://captainbond.com

# Vérifier le sitemap
curl https://captainbond.com/sitemap.xml

# Vérifier robots.txt
curl https://captainbond.com/robots.txt
```
