# Cloudflare Worker — Cron Trigger

Ce worker déclenche les crons de l'application Captain Bond via les routes API existantes.

## Fonctionnement

Le worker est déclenché par les crons Cloudflare et appelle les routes API correspondantes avec le `CRON_SECRET`.

```
Cloudflare Cron Trigger
  → fetch("https://captainbond.app/api/cron/xxx", { Authorization: Bearer CRON_SECRET })
  → Route API exécute la logique
```

## Crons configurés

| Cron | Schedule | Route |
|------|----------|-------|
| rituals | Lun/Mer/Ven 11h30 UTC | `/api/cron/rituals` |
| push-ritual-available | Lun/Mer/Ven 11h00 UTC | `/api/cron/push-ritual-available` |
| push-reveal-time | Lun/Mer/Ven 19h00 UTC | `/api/cron/push-reveal-time` |
| weekly-recap | Dimanche 20h00 UTC | `/api/cron/weekly-recap` |
| heatmap | Lundi 02h00 UTC | `/api/cron/heatmap` |
| tree-progress | 1er du mois 02h00 UTC | `/api/cron/tree-progress` |

## Déploiement

```bash
# Installer wrangler
npm install -g wrangler

# Login
wrangler login

# Déployer
cd workers/cron-trigger
wrangler deploy

# Vérifier les crons
wrangler cron list

# Voir les logs
wrangler tail captainbond-cron
```

## Variables d'environnement

Dans `wrangler.toml` ou via `wrangler secret put` :

- `CRON_SECRET` : Secret pour authentifier les appels aux routes API
- `APP_URL` : URL de base de l'application (ex: https://captainbond.app)

```bash
wrangler secret put CRON_SECRET
wrangler secret put APP_URL
```
