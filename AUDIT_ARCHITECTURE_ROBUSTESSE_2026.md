# Audit Architecture, Robustesse & Évolutivité — Captain Bond
## Par un expert technique senior — juin 2026

> Méthode : analyse codebase + veille stack Edge/Cloudflare/Supabase 2026

---

## 🎯 Verdict global

**Captain Bond est un MVP technique cohérent dans l'intention mais dangereux en production.**

L'architecture Edge-first + Cloudflare Pages + Supabase Realtime est le bon choix pour un party game à faible latence. Les game modes sont bien découpés, la monétisation est abstraite, et le profiling est isolé. **Mais le produit n'est pas prêt à encaisser du trafic réel** : RLS ouvertes, secrets avec fallbacks, authentification inexistante, routes critiques non protégées, pas de transactions, pas de tests.

**Autrement dit : le produit marche en démo, mais un utilisateur malintentionné peut tout casser en 10 minutes.**

---

## 🚨 P0 — Bloquants production (à corriger avant tout lancement public)

### 1. RLS Supabase quasiment ouvertes
**Problème** : `supabase_rls.sql` autorise `SELECT/INSERT/UPDATE` avec `USING (true)` sur `Room`, `Player`, `Response`, `Score`.

**Impact** : n'importe qui avec la clé anon peut lire toutes les rooms, réponses, scores, modifier l'état des rooms.

**Fix** : refaire les policies. Interdire toute écriture directe depuis le client. Autoriser uniquement `SELECT Room by code` connu et `SELECT Player/Response/Score` pour la room jointe. Toutes les écritures doivent passer par les API routes avec service role.

**Fichier** : `supabase_rls.sql`

---

### 2. Client Supabase anon exposé dans le browser pour les tables métier
**Problème** : `src/app/room/[code]/page.tsx` et `src/app/room/[code]/player/page.tsx` font des `supabase.from('Room').select(...)`, `supabase.from('Player').select(...)`, etc.

**Impact** : même avec RLS, la surface d'attaque est énorme. Le navigateur ne doit jamais parler directement aux tables métier.

**Fix** : remplacer tous les accès directs par des appels aux API routes (`/api/room/*`, `/api/me/*`). Garder Supabase Realtime uniquement pour les événements de changement d'état.

**Fichiers** : `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`

---

### 3. Fallback secret hardcodé dans `crypto.ts`
**Problème** : `const SECRET_KEY = process.env.ADMIN_SYNC_SECRET || 'koze_fallback_cryptographic_salt_key_987654';`

**Impact** : si `ADMIN_SYNC_SECRET` n'est pas set en prod, n'importe qui peut forger le HMAC de l'imposteur et tricher.

**Fix** : throw si la variable est absente. Ne jamais avoir de fallback cryptographique.

**Fichier** : `src/lib/crypto.ts`

---

### 4. Placeholders dans les clients Supabase
**Problème** : `supabase.ts` et `supabase-admin.ts` initialisent avec des placeholders si les env vars manquent.

**Impact** : en production, si une variable manque, l'app ne plante pas au build mais échoue silencieusement ou pire.

**Fix** : throw au build/démarrage si `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sont manquants.

**Fichiers** : `src/lib/supabase.ts`, `src/lib/supabase-admin.ts`

---

### 5. `hostId` utilisé comme seul secret d'autorisation
**Problème** : les routes `next-round`, `reveal`, `set-mode`, `kick`, `reset` vérifient `room.hostId === body.hostId`. Le `hostId` est stocké dans `sessionStorage` et visible sur la TV.

**Impact** : n'importe quel joueur qui lit le localStorage devient hôte.

**Fix** : générer un token signé (`hostToken`) à la création de room, stocké côté client à la place du `hostId`, validé côté serveur. Ou utiliser Supabase Auth + JWT.

**Fichiers** : `src/app/api/room/create/route.ts`, `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`, toutes les routes `room/*`

---

### 6. `/api/room/end` sans authentification
**Problème** : n'importe qui avec un `roomCode` peut terminer la partie et forcer le calcul des profils.

**Impact** : sabotage de soirée, fuite de données.

**Fix** : exiger `hostToken` ou vérifier que l'appelant est bien l'hôte.

**Fichier** : `src/app/api/room/end/route.ts`

---

### 7. `/api/room/profile` et `/api/room/profiles` sans authentification
**Problème** : n'importe qui récupère les réponses, scores et profils de tous les joueurs d'une room.

**Impact** : fuite RGPD massive.

**Fix** : exiger `playerId` et vérifier qu'il appartient à la room. Ne jamais exposer les réponses des autres joueurs directement.

**Fichiers** : `src/app/api/room/profile/route.ts`, `src/app/api/room/profiles/route.ts`

---

### 8. `/api/questions/deck` expose toutes les questions + metadata
**Problème** : la route retourne `id, text, intensityLevel, tags, metadata, mode` de toutes les questions, avec cache public 24h.

**Impact** : triche totale (mots imposteur, réponses correctes, tags). N'importe qui peut scraper tout le contenu.

**Fix** : ne jamais exposer `metadata` ni `correctAnswer`. Exiger un token room. Invalider le cache quand les questions changent.

**Fichier** : `src/app/api/questions/deck/route.ts`

---

### 9. UI admin non protégée
**Problème** : `src/proxy.ts` existe mais ce n'est pas un middleware Next.js valide. Il manque `src/middleware.ts` avec export `middleware`.

**Impact** : n'importe qui accède à `/admin/*` en frontend. Les API admin sont protégées, mais le login est bruteforcable.

**Fix** : créer `src/middleware.ts` qui protège `/admin/:path*` (hors `/admin/login`).

**Fichiers** : à créer `src/middleware.ts`, `src/lib/admin/auth.ts`

---

### 10. Vote sans vérification de la question active
**Problème** : `vote/route.ts` accepte `questionId` du client sans vérifier que c'est `room.currentQuestionId`.

**Impact** : on peut voter pour n'importe quelle question, passée ou future, dans n'importe quel statut.

**Fix** : vérifier `questionId === room.currentQuestionId` et `room.status === 'PLAYING'`.

**Fichier** : `src/app/api/room/vote/route.ts`

---

### 11. Race conditions partout
**Problème** : `create`, `join`, `vote`, `next-round`, `reveal`, `checkout` font des `SELECT` puis `INSERT` non atomiques.

**Impact** : codes doublons, noms dupliqués, votes doubles, scores corrompus, users Stripe doublons, rooms qui dépassent maxPlayers.

**Fix** : utiliser des transactions DB (Supabase RPC PostgreSQL) ou des contraintes d'unicité + upserts atomiques.

**Fichiers** : `src/app/api/room/create/route.ts`, `src/app/api/room/join/route.ts`, `src/app/api/room/vote/route.ts`, `src/app/api/room/next-round/route.ts`, `src/app/api/room/reveal/route.ts`, `src/lib/monetization/checkout.ts`

---

### 12. Webhook Stripe non idempotent
**Problème** : `checkout.session.completed` ne vérifie pas si déjà traité. Un retry Stripe crée des `UserPass`/`UserPack`/`Purchase` dupliqués.

**Impact** : double-crédit des droits, achats dupliqués.

**Fix** : vérifier `Purchase.status !== 'COMPLETED'` avant traitement. Index unique sur `Purchase.stripePaymentId`.

**Fichier** : `src/app/api/webhook/route.ts`, `prisma/schema.prisma`

---

## ⚠️ P1 — Importants (à corriger dans le mois)

### 13. Open redirect dans checkout
**Problème** : `successUrl`/`cancelUrl` ne sont pas validés sur le domaine.

**Fix** : vérifier que les URLs commencent par `NEXT_PUBLIC_SITE_URL`.

**Fichiers** : `src/app/api/checkout/route.ts`, `checkout/pass`, `checkout/profile`

### 14. `/api/storage/presign` sans authentification
**Problème** : n'importe qui peut obtenir une URL PUT Wasabi.

**Fix** : exiger `playerId` valide dans la room, limiter extensions et content-type.

**Fichier** : `src/app/api/storage/presign/route.ts`

### 15. `/api/me` et `/api/me/entitlements` sans authentification
**Problème** : fuite des entitlements et achats liés à un `playerId`.

**Fix** : exiger un token signé ou Supabase Auth.

**Fichiers** : `src/app/api/me/route.ts`, `src/app/api/me/entitlements/route.ts`

### 16. Admin login : cookie = SHA256 du password
**Problème** : pas de session revocable, pas de rate limiting, pas de bruteforce protection.

**Fix** : utiliser des JWT courts avec expiration + refresh, ou une vraie session côté serveur.

**Fichier** : `src/lib/admin/auth.ts`

### 17. `/api/room/next-round` fait un `fetch` auto-référencé
**Problème** : appelle `/api/questions/deck` via HTTP. Si `NEXT_PUBLIC_SITE_URL` est mal configuré ou le worker overload, la room ne démarre pas.

**Fix** : remplacer par un appel direct à une fonction `getQuestionDeck()`.

**Fichier** : `src/app/api/room/next-round/route.ts`

### 18. Aucune validation Zod
**Problème** : les types sont castés en `any`. Injection de champs inattendus possible.

**Fix** : ajouter Zod sur toutes les routes API.

**Fichiers** : toutes les routes API

---

## 🔧 P2 — Évolutivité & cohérence

### 19. Source de vérité dupliquée pour `DATE_NIGHT`
**Problème** : le manifest est défini à l'identique dans `game-modes/index.ts` et `game-modes/manifests.ts`.

**Fix** : importer `dateNightManifest` partout.

### 20. Logique hardcodée par mode dans `next-round`
**Problème** : filtres spéciaux `DATE_NIGHT`, `ICEBREAKER` Pity Shield, assignation imposteur directement dans la route.

**Fix** : extraire un `DJEngine` data-driven. Le manifest devrait porter `questionStrategy`.

### 21. Logique Imposteur dans `reveal`
**Problème** : résolution `imposterHash` directement dans la route de révélation générique.

**Fix** : `GameModeEngine` devrait avoir `onRoundStart` et `onReveal`.

### 22. Triplication du calcul de profil
**Problème** : même mapping `Response → EnrichedResponse` dans `end`, `profiles`, `profile`.

**Fix** : créer `src/lib/profiling/buildRoomProfiles.ts`.

### 23. `calculateProfile.ts` ignore ses `profilingCapabilities`
**Problème** : `ALIGNMENT_MODES`, `PERSPICACITY_MODES`, etc. sont des `Set` hardcodés.

**Fix** : lire dynamiquement les `profilingCapabilities` du manifest.

### 24. Composants de mode typés `any`
**Problème** : `TVComponentProps` / `PlayerComponentProps` ne sont pas respectés.

**Fix** : normaliser les exports et typer les props.

### 25. State management monolithique
**Problème** : `room/[code]/page.tsx` (577 lignes) et `player/page.tsx` (546 lignes) dupliquent subscriptions et handlers.

**Fix** : introduire un store partagé (`Zustand` ou `Context`) pour l'état room.

### 26. Schema DB qui va bloquer
**Problème** : `Room.roundConfig`, `Question.metadata`, `Pack.scope` en `Json?` sans schema. `ProductType` enum figé. Pas de `RoomQuestionHistory`. `Player.socketId` non utilisé.

**Fix** : modéliser les métadonnées, remplacer `ProductType` enum par une table/catégorie libre, créer `RoomQuestionHistory`, nettoyer `socketId`.

### 27. Aucun test
**Problème** : zéro test unitaire/intégration.

**Fix** : tester `calculateProfile`, les engines, les entitlements, le webhook Stripe.

---

## 📊 Stack : verdict

| Élément | Verdict | Commentaire |
|---|---|---|
| Next.js 16 + React 19 | ⚠️ Risqué | Trop récent pour `@cloudflare/next-on-pages`. L'AGENTS.md avertit lui-même des breaking changes. |
| Cloudflare Pages + Edge | ✅ Bon | Coût/latence OK. Limite : pas de stateful server, pas de transactions locales. |
| Supabase (Postgres + Realtime + Auth) | ✅ Bon | RLS mal configuré = gâchis. Realtime a des quotas. |
| Prisma 7 | ⚠️ Mauvais pour Edge | Prisma Client n'est pas natif Edge. Heureusement non utilisé au runtime, mais source de confusion. |
| Supabase JS direct dans le browser | ❌ Mauvais | Même avec RLS, pratique dangereuse pour un jeu multi-joueur. |
| Stripe | ✅ Bon | Intégration Edge-compatible. |
| Tailwind v4 | ✅ Bon | Config simple. |
| Remotion | ❓ Inutilisé ? | Présent mais aucune utilisation visible. |

---

## 🗓 Plan d'action 30 jours

### Semaine 1 — P0 sécurité (critique)
- [ ] Refaire les RLS Supabase
- [ ] Retirer les fallback secrets (`crypto.ts`, `supabase.ts`, `supabase-admin.ts`)
- [ ] Séparer `ADMIN_SYNC_SECRET` et `HMAC_IMPOSTEUR_SECRET`
- [ ] Remplacer `hostId` par un `hostToken` signé
- [ ] Sécuriser `/api/room/end`, `/api/room/profile`, `/api/room/profiles`
- [ ] Restreindre `/api/questions/deck`
- [ ] Créer `src/middleware.ts` pour protéger `/admin`
- [ ] Vérifier `questionId === currentQuestionId` dans `/api/room/vote`

### Semaine 2 — Robustesse
- [ ] Ajouter Zod partout
- [ ] Transactions DB via Supabase RPC pour `reveal`, `next-round`, webhook, checkout
- [ ] Idempotence webhook Stripe
- [ ] Valider `successUrl`/`cancelUrl` sur le domaine
- [ ] Sécuriser `/api/storage/presign`
- [ ] Protéger `/api/me` et `/api/me/entitlements`

### Semaine 3 — Évolutivité
- [ ] Unifier la source de vérité des modes
- [ ] Extraire `DJEngine` data-driven
- [ ] Déplacer logique Imposteur dans l'engine
- [ ] Extraire `buildRoomProfiles.ts`
- [ ] Lire `profilingCapabilities` du manifest

### Semaine 4 — Polish & tests
- [ ] Normaliser les composants de mode (named exports, types)
- [ ] Store partagé room (Zustand)
- [ ] Tests unitaires sur engines, profiling, entitlements
- [ ] Tests d'intégration webhook Stripe

---

## 🏗 Architecture cible recommandée

### Option A — Garder Edge, sécuriser (recommandé pour post-audit)
- Toutes les écritures passent par les API routes.
- RLS strict + transactions via RPC.
- Drizzle ORM ou Zod pour le typage.
- Cache Cloudflare KV pour le deck de questions.

### Option B — Backend temps réel dédié (si > 500 rooms simultanées)
- Next.js pour front + checkout.
- Cloudflare Durable Objects ou Fastify/NestJS avec WebSockets pour la logique de room.
- Supabase reste la source de vérité.

**Conseil** : Option A maintenant. Option B si vous dépassez ~500 rooms simultanées.

---

## ⚡ Top 5 quick wins

1. **Retirer les fallback secrets** — 5 minutes, risque P0.
2. **Créer `src/middleware.ts`** — protège l'UI admin.
3. **Vérifier `questionId === currentQuestionId`** dans vote — empêche la triche.
4. **Idempotence webhook Stripe** — empêche les double-crédits.
5. **Remplacer fetch auto-référencé dans `next-round`** — supprime un point de fragilité.

---

## 💬 Mot de la fin

> "Captain Bond a les bonnes intentions architecturales. Mais en 2026, une bonne architecture sans sécurité, sans transactions et sans tests, c'est une dette qui va coûter 10× plus cher à réparer après le premier incident. Corrigez les P0 avant de penser scale."
