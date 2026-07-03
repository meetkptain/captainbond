# Architecture — Captain Bond

Vue d'ensemble de l'architecture technique.

## Schema

```
                    +---------------------------+
                    |    CLOUDFLARE PAGES       |
                    |  (Next.js App Router)     |
                    |  Edge Runtime             |
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

CLOUDFLARE WORKERS (crons)
 |   rituals (11h30 L/M/V)
 |   push (11h + 19h L/M/V)
 |   weekly recap (20h Dim)
 |   heatmap (2h Lun)
 |   tree progress (2h 1er)
 v
 (appelle les routes API de l'app avec CRON_SECRET)
```

## Stack

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Hosting** | Cloudflare Pages | Edge network, auto-deploy GitHub |
| **Crons** | Cloudflare Workers | Cron triggers natifs |
| **Framework** | Next.js App Router | SSR, Edge, App dir |
| **Styling** | TailwindCSS | Utilitaire, rapide |
| **DB** | PostgreSQL (Supabase) | Realtime, RLS, hosted |
| **ORM** | Prisma | Type-safe, migrations |
| **Realtime** | Supabase Realtime | Broadcast + presence |
| **IA** | Gemini 1.5 Flash | Generation questions, analysis, recaps |
| **Storage** | Wasabi S3 | S3-compatible, pas cher |
| **Paiement** | Stripe | Subscriptions + webhooks |
| **Analytics** | PostHog | Self-hosted analytics |
| **Rate-limit** | Upstash Redis | Edge-compatible |

## Structure du projet

```
captainbond/
├── src/
│   ├── app/                    → Pages + API routes (Next.js App Router)
│   │   ├── api/cron/           → Routes executees par le Worker
│   │   ├── api/couple/         → API couple
│   │   └── (distanciel)/       → Pages couple (dashboard, etc.)
│   ├── components/
│   │   ├── couple/             → Composants couple (P1-P5)
│   │   └── ui/                 → Composants generiques
│   ├── hooks/                  → React hooks
│   ├── lib/
│   │   ├── db/repositories/    → Acces Supabase
│   │   ├── config/             → Feature flags, etc.
│   │   └── gemini.ts          → Client Gemini
│   └── services/               → Logique metier
├── workers/
│   └── cron-trigger/           → Cloudflare Worker (crons)
├── supabase/
│   └── migrations/             → Migrations SQL
├── prisma/
│   └── schema.prisma           → Schema Prisma
└── docs/                       → Documentation
```

## Routes API principales

| Route | Methode | Description |
|-------|---------|-------------|
| `/api/cron/rituals` | GET | Generer les questions du jour |
| `/api/cron/push-ritual-available` | GET | Push notification question dispo |
| `/api/cron/push-reveal-time` | GET | Push notification heure du reveal |
| `/api/cron/weekly-recap` | GET | Generer recap hebdomadaire |
| `/api/cron/heatmap` | GET | Mettre a jour la heatmap |
| `/api/cron/tree-progress` | GET | Calculer progression arbre |
| `/api/couple/ritual` | GET | Recuperer le rituel du jour |
| `/api/couple/analyze` | POST | Analyser une reponse |
| `/api/couple/reveal` | POST | Reveler les reponses |
| `/api/couple/daily` | GET | Etat du daily ritual |
| `/api/couple/heatmap` | GET | Donnees heatmap |
| `/api/couple/weekly-recap` | GET | Recaphebdo |
| `/api/couple/tree-progress` | GET | Progression arbre |
| `/api/couple/push/subscribe` | POST | Abonnement push |

## Patterns

### API
Toutes les routes API utilisent :
- `withApiHandler` — handler wrapper avec validation Zod
- `getAuthenticatedUser` — extraction utilisateur auth
- `runtime = 'edge'` — execution sur le edge network

### Crons
Tous les crons utilisent :
- `acquireCronLock` / `releaseCronLock` — lock distribue pour eviter les executions concurrentes
- Bearer token auth (CRON_SECRET)

### Feature flags
Definis dans `src/lib/config/features.ts`, tous par defaut a `false` pour un rollout incremental.
