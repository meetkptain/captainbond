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

## 13. Token Optimization

- **Caveman mode** : use `/caveman ultra` on user request or for subagent output, not by default. Superpowers skills override this when active.
- **Research** : prefer `codegraph explore "<symbol>"` for symbols and call graphs. Use targeted `Grep` for text patterns when CodeGraph is overkill.
- **Subagents** : in Kimi Code, use `Agent(subagent_type="explore"|"coder"|"plan")`. Use `Skill("cavecrew")` to decide when compressed cavecrew-style delegation saves context.
- **Validation** : compress long command output with `rtk` when available (e.g. `rtk npm run build`).
- **Git checks** : use `git diff --stat` to verify changes, not full file reads.
- **Search exclusions** : never search `.next`, `node_modules`, `.git`, or build logs.
- **CLI logging** : cap output (e.g. `git log -n 1`, `head -n 20`).
- **Formatting** : keep responses concise. Avoid decorative emojis/tables unless they genuinely improve readability.
- **SQL / Schema** : read `supabase/schema_summary.sql` before multiple migrations. Run `python3 scripts/update-schema-summary.py` after any schema change.


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
