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

- Variables requises : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD_HASH`, `ADMIN_JWT_SECRET`, `PLAYER_JWT_SECRET`, `HOST_TOKEN_SECRET`, `HMAC_IMPOSTEUR_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Variables E2E (optionnelles) : `E2E_ADMIN_PASSWORD` (mot de passe en clair pour les tests Playwright uniquement).
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
- **Prisma = local dev uniquement.** `supabase/migrations/` est l'unique source de vérité pour le schéma runtime. Si tu modifies `prisma/schema.prisma`, tu DOIS créer une migration Supabase correspondante.

## 13. Token Optimization (CRITICAL)
- **Always activate** `/caveman ultra` mode. No filler, no prose.
- **Workflow Strategy**:
  1. **Research (CodeGraph)**: Use CodeGraph index server or MCP server before using `grep`/`find` scans. Use `codegraph explore "<symbol>"` or MCP tool `codegraph_explore` to inspect syntax trees, callers, and exact file paths without parsing entire folders. Avoid global grep entirely.
  2. **Modification (Cavecrew)**: Delegate edits to `cavecrew-builder` for isolated context. Use surgical `view_file` (Start/End lines).
  3. **Validation (RTK & Reviewer)**: Compress command output using `rtk` (e.g. `rtk npm run build`). Audit diffs via `cavecrew-reviewer`.
- **Git checks**: Use `git diff --stat` to verify changes, not full file reads.
- **Search Exclusions**: Never search `.next`, `node_modules`, `.git`, or build logs. Add to `.gitignore` or specify exclusions explicitly.
- **CLI Logging**: Limit terminal logs. Use commands with page caps (e.g. `git log -n 1`, `head -n 20`).
- **Zero Formatting**: Keep responses text-only, no decorative tables/emojis or useless markdown structures.
- **Session Rotation**: If conversation history exceeds 20k tokens, export task progress state to `.agents/state.json` (keys: `current_task`, `modified_files`, `next_steps`) and prompt user to refresh session.
- **SQL / Schema optimization**: Never read multiple migrations from `supabase/migrations/` to understand table structures. Always query `supabase/schema_summary.sql` first. If database schemas or migrations are modified, you MUST run `python3 scripts/update-schema-summary.py` to regenerate the summary file immediately.


## couple/page.tsx State Variables (CRITICAL)

When integrating components into `src/app/(distanciel)/couple/page.tsx`, use the correct React state variables in JSX:
- `couple` → type `CoupleData | null`, use `couple?.id` for the couple ID
- `userId` → `string | null`, the authenticated user's ID (from state)
- `user` → local const inside `useEffect` only, NOT accessible in JSX
- Never use bare `coupleId` — it does not exist as a state variable in this file

## invoke_subagent Tool Name (CRITICAL)

The tool to spawn subagents is named `invoke_subagent` (singular), NOT `invoke_subagents`.
It accepts a `Subagents` array for parallel execution. Never use `invoke_subagents`.

## Global Rules Fallback (CRITICAL)
The directory `/Users/nicolasvirin/.gemini/config/` is system-protected — writes always fail.
When /learn instructs adding a "global" rule to that path, write it to the workspace
`AGENTS.md` instead (`/Users/nicolasvirin/Desktop/toto/mescodes/captainbond/AGENTS.md`).
Never attempt `ask_permission` for that path — it is a hardcoded boundary, not a user permission.

## Aaron Marketing Skills (54 skills, SEO/GEO + Influence + Paid Ads)

Cloné dans `.agents/skills/aaron-marketing/` → `~/.aaron-marketing-skills/` (symlink).
3 disciplines, 4 commands, frameworks CORE-EEAT, CITE, C³, ROAS.

- **SEO/GEO**: keyword research → content writing → technical audits → schema → rank tracking
- **Influence (IMPACT)**: audience insight → creator discovery → campaign → outreach → ROI
- **Paid Ads (ROAS)**: audience segments → creative → experiment design → account audit → measurement
- **Protocol layer**: entity/creator/offer-claim registries + HOT/WARM/COLD memory

Voir `~/.aaron-marketing-skills/README.md` pour le catalogue complet.

## Vibe-Skills (263 skills, Super Skill Harness)

Cloné dans `.agents/skills/vibe-skills/` → `~/.vibe-skills/` (symlink).
340+ skills avec orchestration automatique. Point d'entrée : `vibe`.

- **Pipeline**: intent → freeze → plan → route → verify → memory
- **Domaines**: engineering, AI/ML, research, data science, debugging, devops
- **Niveaux**: M (rapide), L (multi-step), XL (parallel agents)
- **Mémoire persistante**: workspace memory cross-session

Voir `~/.vibe-skills/README.md`.

## agent-rules-books (règles de 14 livres)

Cloné dans `.agents/skills/agent-rules-books/` → `~/.agent-rules-books/` (symlink).
Règles AGENTS.md distillées de Clean Code, DDD, DDIA, Refactoring...

- Chaque livre en 3 formats: `full` / `mini` / `nano`
- Pas de SKILL.md — inclure manuellement dans AGENTS.md
- Utile pour refactoring, architecture, legacy, code quality

Voir `~/.agent-rules-books/README.md` et `~/.agent-rules-books/docs/USAGE.md`.

## UI/UX Pro Max (7 skills, Design Intelligence)

Installé dans `.opencode/skills/ui-ux-pro-max/` (CLI native).
67 styles UI, 161 règles de raisonnement, 22 stacks, 57 font pairings.

- **Skills**: ui-ux-pro-max, design, ui-styling, brand, slides, design-system, banner-design
- **Stack support**: React, Next.js, Vue, Nuxt, Svelte, Astro, Flutter, SwiftUI, Jetpack Compose, etc.
- **Design System Generator**: pattern + style + colors + typography + anti-patterns

Voir `~/.ui-ux-pro-max-skill/README.md` ou `uipro init --ai opencode`.

<!-- Captain Bond Project Knowledge — accumulated across sessions -->

## Blog Article Template (CRITICAL for new articles)

Every blog post at `src/app/(marketing)/blog/<slug>/page.tsx` (EN) or `src/app/fr/blog/<slug>/page.tsx` (FR) follows this exact structure:

```
0. Metadata block — title, description, alternates.canonical + languages (x-default/en/fr),
   other.datePublished/dateModified, openGraph (1200×630), twitter (summary_large_image)
1. FAQPage schema — const faqSchema = {...} with mainEntity from question array
2. Author bio — flex gap-4 with gradient avatar (CB or NV initials), name, date + read time
3. <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
4. JSON-LD script — <script type="application/ld+json" ...
5. <header className="mb-10"> — <h1> + lead paragraph(s)
6. Key Takeaways — <div className="article-card-takeaways">
7. TOC (long articles) — grid of <a className="article-toc-link" href="#section">
8. Content sections — <section className="article-block"> with <h2> + <p> + <ul>
9. CTA aside — <aside className="article-card-takeaways"> + white CTA button
10. Ending question — <p className="article-ending-question">
11. Related articles — grid with links (always /blog/... even in FR pages)
```

**Workflow for blog upgrades**: Phase A (CSS changes in globals.css) → Phase B (batch script via node/grep) → Phase C (manual edits on pillar articles). Build after each phase.

**Conseils**:
- Utiliser `data.map(...)` pour les listes de questions plutôt que du HTML statique
- Les slugs FR sont des traductions libres, pas des traductions littérales (ex: `increase-bar-revenue-weeknight` → `augmenter-chiffre-bar-semaine`)
- Ne pas mettre de `mb-10` sur les sections — utiliser `article-block`
- Les blockquotes alternent border `border-neon-purple` / `border-neon-pink`
- Les citations externes (Gottman, Aron, HBR, Statista) sont obligatoires pour les articles couple

## CSS Article Reading System (Medium-like, globals.css)

Classes préfixées `.article-*` dans `src/app/globals.css`:

| Classe | Rôle |
|--------|------|
| `.article-body` | Container: clamp(1.125rem, 0.5rem+1vw, 1.25rem), line-height 1.75 |
| `.article-lead` | Premier paragraphe after H1 —  text-lg, text-slate-200 |
| `.article-block` | `margin-bottom: 2.5rem` entre sections |
| `.article-hero` | `aspect-ratio: 2/1`, `object-fit: cover`, `rounded-xl` |
| `.article-card-takeaways` | Takeaways + CTA: `bg-white/[0.02] p-8 rounded-2xl` |
| `.article-toc-link` | Navigation: `block p-3 rounded-xl hover:bg-white/[0.03]` |
| `.article-ending-question` | Question finale: italic, centered, text-base |
| `.article-body a` | Links inline sous la classe parent |

Autres patterns visuels à retenir :
- Selection couleur `rgba(252, 211, 77, 0.35)` (amber chaud)
- `scroll-behavior: smooth` sur html
- Blockquote XXL: `clamp(1.25rem, 0.75rem+1vw, 1.5rem)` avec fond subtil
- `safe-area-inset-*` sur les éléments fixes (MobileCta)
- `user-select: none` global (sauf input/textarea)
- Toujours `prefers-reduced-motion` guard pour les animations

## OG Images

**Où** : `public/og/` — 48 images, 1200×630.webp
**Naming** : `blog-<slug>-<lang>.webp` (ex: `blog-deep-questions-en.webp`, `blog-deep-questions-fr.webp`)
**6 templates** : confetti (party), circles (couple), grid (pro), bubbles (bars), data chart (study), game-dots (game)
**Police** : Outfit embarquée dans `scripts/Outfit-*.ttf`
**Générateur** : `scripts/generate-og-images.ts` — usage: `npx tsx scripts/generate-og-images.ts`
**Référencement** : dans metadata → `openGraph.images[0]` + `twitter.images` + parfois `<img className="article-hero">`

## Multi-Langue FR/EN

**Routes**:
- EN: `src/app/(marketing)/<path>/page.tsx` → `captainbond.com/<path>`
- FR: `src/app/fr/<path>/page.tsx` → `captainbond.com/fr/<path>`

**Metadata alternates** (toujours 3 entrées):
```
x-default → EN url
en → EN url
fr → /fr/<path> url
```

**Middleware** (`src/middleware.ts:68-92`) : redirige les visiteurs FR vers `/fr/` via accept-language, avec bypass pour les bots (Googlebot, Bingbot, etc. toujours en canonical EN)

**Slug FR** : traductions libres, garder une liste de mapping manuelle quand tu crées un article dans les deux langues.

## Déploiement Cloudflare Pages

**Build** : `npm run pages:build` (wraps `npx @cloudflare/next-on-pages`)
**Preview** : `npm run pages:preview`
**CI/CD** : `.github/workflows/deploy-pages.yml` (push sur main → build + deploy CF Pages)

**Secrets** : 28 vars total — 6 dans GitHub Secrets (build-time), 22 dans Cloudflare Dashboard (runtime)
- GitHub: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN`
- Cloudflare: tout le reste (secrets Stripe, RevenueCat, JWT, etc.)

**Infra note** : Prisma ne marche pas sur Cloudflare Workers → utiliser Supabase JS client directement.
**Note** : `package.json` name = "koze", mais wrangler.toml name = "captainbond" — c'est normal, ne pas "corriger".

## Structured Data / Schema (JSON-LD)

**Root layout** (`src/app/layout.tsx`) : 5 schemas embarqués
- `Organization` — brand info, logo, sameAs (GitHub), alternateName par langue
- `WebSite` — avec SearchAction
- `Product` — offers array (6 prices: Party Free/24h/Monthly, Couple Monthly, Pro Bar/Corporate)
- `BreadcrumbList` — Home + Blog
- `ItemList` — top-level navigation

**Per-article** : 
- `FAQPage` — questions depuis le data array
- Bar/cafe guides ajoutent `HowTo` avec step array

**Sitemap** : `/sitemap.xml` (52 URLs), `/robots.txt` (AI bots allowed), `/llms.txt`

## Build Verification

Toujours vérifier après modifications :
1. `npm run build` — 71/71 static pages
2. `npm run pages:build` — @cloudflare/next-on-pages (si déploiement)
3. `git diff --stat` — audit des fichiers modifiés

## .agents/memory.md — Anchored Summary (session memory)

Le fichier `.agents/anchor.md` contient le résumé de tout le travail de la session en cours. Structure :
- Goal, Constraints & Preferences
- Progress (Done / In Progress / Blocked)
- Key Decisions (les « pourquoi » des choix techniques)
- Next Steps
- Critical Context
- Relevant Files (paths avec description)

Mettre à jour à chaque phase terminée. Utiliser pour le context dans une nouvelle session.

## Session Start Protocol (CRITICAL)
- Activate `/caveman ultra` mode immediately. No filler, no prose.
- Read `.agents/codebase-map.md` → project structure, routes, data flow, key files
- Read `.agents/anchor.md` → what was done in the current session
- `.opencode.json` is loaded automatically at start

## Codebase Map Maintenance (Agent Responsibility)
**YOU** must update `.agents/codebase-map.md` when you:
- Add/remove/move a route or API endpoint
- Create/rename a service or component directory
- Change infrastructure (external service, deploy pipeline, CI/CD)
- Add or modify a game mode

## Skill Loading by Task Type (Agent Responsibility)
**YOU** must load these skills based on the type of task.

### Always (every session)
- `caveman` → `/caveman ultra` immediately on start (see Session Start Protocol)
- `cavecrew` → ready to delegate edits when context runs low

### Content / Blog
- Writing an article → `seo-content-writer` + `schema-markup-generator` + `meta-tags-optimizer`
- GEO / AI citations → `geo-content-optimizer` + `content-quality-auditor`
- Find topics → `keyword-research` + `content-gap-analysis`
- Update existing content → `content-refresher`
- Programmatic pages → `programmatic-seo`

### SEO / Audits
- Full audit → `content-quality-auditor` + `domain-authority-auditor` + `technical-seo-checker`
- Single page audit → `on-page-seo-auditor`
- Competitors → `competitor-analysis`
- Backlinks → `backlink-analyzer`
- Rankings → `rank-tracker`
- SERP features → `serp-analysis`
- Internal links → `internal-linking-optimizer`
- Site architecture → `site-architecture`

### Paid Ads (if applicable)
- Account audit → `ad-account-auditor`
- Conversion tracking → `conversion-signal-qa`
- Campaign structure → `campaign-architect`
- Ad creative → `ad-creative-builder`
- Attribution → `attribution-reconciler`

### Influence (if applicable)
- Find creators → `influencer-discovery` + `fit-scorer`
- Campaign plan → `campaign-planner` + `brief-generator`
- Performance → `performance-analyzer` + `roi-calculator`

### UI / Design
- UI component → `ui-ux-pro-max` + `ui-styling`
- Brand assets → `brand` + `design-system`
- Banners → `banner-design`
- Presentation → `slides`

### Development
- Bug / crash → `systematic-debugging`
- Code review → `code-reviewer` + `security-reviewer`
- Clean AI slop → `deslop`
- Discover patterns before editing → `context-hunter`
- Plan multi-step task → `brainstorming` + `create-plan`
- Look up API / framework → `documentation-lookup`
- Test / TDD → `tdd-guide`

## Learning Registry

Chaque fois qu'on découvre un pattern non documenté, l'ajouter dans une section dédiée d'AGENTS.md. Les patterns à capturer incluent :
- Erreurs récurrentes et leurs solutions
- Décisions d'architecture avec leur raisonnement
- Contournements spécifiques à Cloudflare/Next.js
- Mappings de slugs (FR ↔ EN)
- Bugs connus et workarounds

## Known Bugs & Workarounds (CRITICAL)

| Bug | Cause | Workaround / Fix Status |
|-----|-------|------------------------|
| `gameEnginesRegistry` crash on 4/5 modes | Only IMPOSTEUR mode registered, others return 500 on reveal/next-round | Use `getServerGameMode()` instead. P0 — not fixed yet |
| Price triple source conflict | 3 sources: MONETIZATION_CONFIG (1.99/2.99), catalog.ts (9.99/14.99), hardcoded UI (9.99/14.99) | Must unify to 4.99€/9.99€. P0 — not fixed |
| Weekend Pass exists in catalog but NO UI | `Weekend` variant defined in ProductSchema but no button in any paywall | P1 — not fixed |
| Subscription upsell missing from paywall | Paywall only shows Pass 24h, no subscription toggle | P0 — not fixed |
| Stripe webhook mock | `/api/checkout/profile` was a mock creating fake users | Real webhook needed. P0 — not fixed |
| Single-payer model blocks group payment | Only host can pay for room unlock | Allow any player to pay. P0 |
| Next.js middleware deprecation | `middleware.ts` deprecated in 16.2, `proxy.ts` doesn't support Edge CF | Stay on middleware.ts with build warnings. Accepted |
| Wasabi CONFIG_MISSING | Env vars can be empty (optional feature) | App continues gracefully with 4XX instead of 500. Fixed |
| CRON_SECRET duplication | Same secret used in Worker + app API must match exactly | Documented in wrangler.toml. Verified |
| Package name "koze" vs wrangler "captainbond" | Intentional, not a bug | Do NOT "fix" — wrangler requires unique name on CF |

## Architecture Decisions (Critical Context)

### Why Cloudflare Pages (not Vercel)
Edge network, auto-deploy from GitHub, cheaper at scale. Build: `npx @cloudflare/next-on-pages`. Output: `.vercel/output/static`.

### Why NOT Prisma at Runtime
Prisma incompatible with Edge Workers. Supabase JS client used for all runtime DB access. Prisma schema used only for local dev + seed.

### Hybrid Pivot Strategy
**Do NOT pivot to pure couple app.** Party viral K-factor > 1 (1 host = 5-8 players) is top-of-funnel. Funnel: Group party → Profile Reveal (Barnum) → Couple upsell → Subscription. CAC ~0€ via viral vs 15-30€ via ads.

### Business Model Evolution
- **Phase 1 (M1-6)**: Conquer groups — Pass 24h 2.99€, 500→2000 rooms/mo
- **Phase 2 (M7-12)**: Upsell couples — subscription 7.99€, DJ IA, 2000 active couples
- **Phase 3 (M13+)**: Open B2B — events 29.99€, team-building 800-1500€

### 7 Game Design Laws (docs/GAME_DESIGN.md)
1. **Teaser Rule**: Inputs ≤60 chars (~5 words). Force orality
2. **Spotlight Rule**: One story read aloud per round
3. **Campfire Mode**: TV BLACK during deep reveals. Eye contact
4. **Tension Gauge**: Hold-to-proceed (2s) in Date Night
5. **Social Tribunal**: No keyboard in light modes — names as big buttons
6. **Emotional DJ**: Never 2 Deep questions in a row
7. **Dunbar's Law**: Deep mode ≤6 players. Date Night strictly 2

## Security Hardening

### JWT Secrets — ALL Must Be Distinct
```
ADMIN_JWT_SECRET        → admin session tokens
PLAYER_JWT_SECRET       → player auth
HOST_TOKEN_SECRET       → host tokens (DIFFERENT from ADMIN_SYNC_SECRET)
HMAC_IMPOSTEUR_SECRET   → imposter game HMAC
COUPLE_INVITE_SECRET    → couple invite links
ADMIN_SYNC_SECRET       → sync API Bearer token
CRON_SECRET             → shared Worker→API auth
```
Generate each with: `openssl rand -base64 32`

### Cookie-Based Auth (Not Bearer)
- Admin session: `koze_admin_session` cookie, JWT-encoded
- Player auth: `PLAYER_COOKIE_NAME` cookie
- Language pref: `cb_language` cookie
- Middleware protects `/admin/*` + `/api/admin/*` routes

### Ethical Guards
- Rename axes: Conformism → Consensus Tendency, Dupery → Playfulness/Bluff, "Benevolent Manipulator" → Strategic Observer
- Disclaimer: "This profile is entertainment fiction" before each Dossier
- Auto-delete Responses within 24h (max 90 days)
- Never show one player's data on another's device
- Block/adapt content for under-16
- Permanent Safe Word / Pause button required

## P0 Fix List (From 5 Audits)

Ordered by impact. These MUST be fixed before scaling:

1. `gameEnginesRegistry` — support all 5 modes (not just IMPOSTEUR)
2. Unify prices: MONETIZATION_CONFIG, catalog.ts, Stripe, UI → 4.99€/9.99€
3. Show "Free card X/3" gauge on TV + player controller
4. Allow ANY player to pay room unlock (not just host)
5. Add micro-onboarding 3 slides (host + player)
6. Remove ALL therapeutic vocabulary ("therapy", "diagnosis", "manipulator")
7. Move RGPD consent before name entry
8. Add permanent Safe Word / Pause button
9. Replace `hostId` auth with signed `hostToken`
10. Stripe webhook: atomic + idempotent
11. Zod validation on ALL API routes
12. Server-side player limit enforcement
