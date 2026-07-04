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
