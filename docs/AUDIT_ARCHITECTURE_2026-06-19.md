# Audit Produit — Architecture, Cohérence, Robustesse, Evolutivité

**Projet :** Captain Bond (koze)  
**Date :** 2026-06-19  
**Périmètre :** codebase Next.js + Prisma + Supabase + Stripe, en l’état après les fixes P0 de sécurité.  
**Méthode :** revue statique, lecture des flux critiques, analyse des modèles et des points d’API.

---

## 1. Résumé exécutif

| Pilier | Score /10 | Verdict |
|---|---|---|
| Architecture | 6 | Bons choix de base (Edge, API routes, registry modes), mais manque de couches métier et de garde-fous. |
| Cohérence | 5,5 | Conventions hétérogènes, duplication client/serveur, `any` omniprésents, UI métier partiellement hardcodée. |
| Robustesse | 5 | RLS et RPC bien venus, mais auth joueur/admin fragile, webhook Stripe non atomique, erreurs verbeuses. |
| Evolutivité | 6 | Système de modes extensible en surface, mais profiling et scoring sont couplés à des sets hardcodés. |

**Conclusion :** le MVP est fonctionnel et a des fondations défensives correctes, mais il n’est **pas prêt pour une production publique** sans correction des points P0 listés ci-dessous.

---

## 2. Architecture

### 2.1 Forces

- **Runtime cohérent** : toutes les routes API utilisent `export const runtime = 'edge'` (ou `experimental-edge`), aligné avec le déploiement Cloudflare Pages.
- **Séparation client/serveur** : les composants React ne font plus de requêtes directes `supabase.from()` ; ils passent par des routes API dédiées (`/api/room/state`, `/api/questions/get`, etc.).
- **Service role isolé** : `supabaseAdmin` est réservé aux routes API ; le client navigateur utilise `supabase` (anon key) uniquement pour auth et realtime.
- **Registry de modes** : la séparation `manifest` / `engine` / `TVView` / `PlayerController` permet d’ajouter un mode sans toucher au cœur du jeu.
- **RLS défensif** : `supabase_rls.sql` passe toutes les tables en `Deny all`, ce qui réduit la surface d’attaque si une clé anon fuit.

### 2.2 Faiblesses & risques

| Sévérité | Problème | Localisation | Impact |
|---|---|---|---|
| P0 | **Middleware vs Proxy** : Next.js 16.2.9 déprécie `middleware.ts` au profit de `proxy.ts`, mais `proxy` ne supporte pas le runtime Edge requis par Cloudflare Pages. On reste donc sur `middleware.ts` avec un avertissement de build. | `src/middleware.ts` | Incompatibilité future / build bloquant potentiel lors d’une MAJ Next.js. |
| P1 | **Logique métier dans les routes API** : `next-round`, `reveal`, `webhook` mélangent auth, monétisation, sélection, scoring et persistence. | `src/app/api/room/next-round/route.ts`, `src/app/api/room/reveal/route.ts`, `src/app/api/webhook/route.ts` | Difficile à tester, à réutiliser et à faire évoluer. |
| P1 | **Absence de validation de schéma** : les routes font `await req.json()` sans vérifier le type/la forme des payloads. | Presque toutes les routes API | Erreurs 500, comportements imprévisibles, injection de données. |
| P1 | **Pas de couche service / use-case** : pas de modules `services/room.ts`, `services/checkout.ts`, etc. | `src/lib/` | Duplication, couplage route ↔ base. |
| P1 | **Pas de rate-limiting** : login admin, création de room, vote, webhook sont exposés sans protection de débit. | Routes critiques | Brute-force, spam, coûts Stripe imprévus. |
| P2 | **Prisma n’est pas utilisé au runtime** : le schéma sert de documentation mais toutes les requêtes passent par `supabaseAdmin.from()`. C’est acceptable, mais cela crée deux sources de vérité (Prisma + Supabase). | `prisma/schema.prisma` | Risque de divergence, pas de typage généré côté API. |
| P2 | **Realtime Supabase sans gestion de reconnexion** : la TV et les joueurs s’abonnent à des channels mais ne gèrent pas les déconnexions réseau. | `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx` | UX dégradée en cas de coupure. |

---

## 3. Cohérence du codebase

### 3.1 Forces

- **Naming principal cohérent** : `Room`, `Player`, `Response`, `Score`, `Question`, `Pack`, `Purchase` suivent un vocabulaire clair.
- **Configuration centralisée** : `MONETIZATION_CONFIG` regroupe prix et seuils.
- **Fallback catalogue** : `CATALOG_FALLBACK` permet de démarrer sans seed DB.

### 3.2 Faiblesses & risques

| Sévérité | Problème | Localisation | Impact |
|---|---|---|---|
| P1 | **Duplication des registries modes** : `gameModesRegistry` (client) et `gameModesServerRegistry` (serveur) définissent tous les deux `DATE_NIGHT`. | `src/game-modes/index.ts`, `src/game-modes/manifests.ts` | Oubli d’un côté = bug 500 côté serveur ou composant manquant côté client. |
| P1 | **Typage faible** : `any` massif dans les props, les engines, les routes (`GameModeEngine<any, any, any>`, `body: any`, `payload.new as any`). | Partout | Pas de sécurité de compilation, refactoring risqué. |
| P1 | **Mix français/anglais** : noms de fichiers en anglais, erreurs et commentaires souvent en français, certains fichiers admin encore nommés “KOZÉ”. | `src/components/admin/*`, messages d’erreur | Difficile à onboarder, incohérence UX. |
| P1 | **Hardcodes UI métier** : les scores Date Night sont figés à 94 % / 88 % / 85 % dans le composant TV. | `src/components/endgame/ClassifiedDossierTV.tsx` | Produit incohérent et non crédible. |
| P1 | **Logique de déblocage dupliquée** : la vérification des entitlements pour afficher un profil est copiée à plusieurs endroits. | `src/components/endgame/ClassifiedDossierPlayer.tsx`, `src/app/room/[code]/page.tsx` | Risque de divergence du paywall. |
| P2 | **Styles hétérogènes** : Tailwind dominant, mais `QuestionForm` et le dashboard admin utilisent des objets `styles` inline. | `src/components/admin/QuestionForm.tsx`, `src/app/admin/(dashboard)/page.tsx` | Maintenance UI compliquée. |
| P2 | **Champ `socketId` inutilisé** : la colonne est obligatoire dans `Player` mais jamais exploitée. | `prisma/schema.prisma`, `src/app/api/room/join/route.ts` | Dette inutile. |
| P2 | **Analytics PostHog “fait maison”** : pas de librairie officielle, gestion manuelle des distinct_id. | `src/lib/analytics.ts` | Risque de données incohérentes, pas de batching robuste. |
| P2 | **Description metadata obsolète** : `layout.tsx` décrit encore “Skip the small talk” alors que le positionnement a pivoté vers “DJ de votre soirée”. | `src/app/layout.tsx` | SEO / branding incohérent. |

---

## 4. Robustesse

### 4.1 Forces

- **Host token signé** : HMAC-SHA256 du payload `roomCode:hostId`, comparaison constant-time.
- **RLS restrictif** : `Deny all` sur toutes les tables.
- **RPC atomiques** : `record_vote` et `fulfill_checkout` réduisent les race conditions.
- **Verrous sur room** : `next-round` et `reveal` utilisent des mises à jour conditionnelles.
- **CSP & headers** : ajoutés dans `next.config.ts`.

### 4.2 Faiblesses & risques critiques

| Sévérité | Problème | Localisation | Impact |
|---|---|---|---|
| P0 | **Auth admin : `ADMIN_PASSWORD` en clair dans le header Bearer** | `src/app/api/admin/stats/route.ts:20`, `src/app/api/admin/rooms/end/route.ts:16` | Compromission totale via logs/proxy/XSS. |
| P0 | **Auth admin : session = SHA256 du mot de passe**, sans sel/itération. | `src/lib/admin/auth.ts`, `src/app/api/admin/login/route.ts` | Brute-force / lookup rapide. |
| P0 | **Auth joueur : `playerId` public comme seule preuve d’identité** | `src/lib/auth/room-player.ts` | Usurpation facile d’un autre joueur. |
| P0 | **Webhook Stripe : marqué comme traité même si le handler échoue silencieusement** | `src/app/api/webhook/route.ts:86-95`, `:68-73` | Perte d’achat irréversible. |
| P0 | **Host token stocké en clair dans la DB** et sans expiration. | `prisma/schema.prisma:50` | Usurpation d’hôte permanente en cas de fuite DB. |
| P1 | **Webhook Stripe non atomique** : traitement puis `WebhookEvent.insert` séparés. | `src/app/api/webhook/route.ts` | Double fulfillment possible. |
| P1 | **Webhook ne vérifie pas `payment_status` ni `livemode`** | `src/app/api/webhook/route.ts` | Fulfillment sur paiements gratuits/test. |
| P1 | **Création de room : TOCTOU sur le code** | `src/app/api/room/create/route.ts:41-62` | Collision de code possible. |
| P1 | **`/api/room/state` expose toutes les réponses à quiconque connaît le roomCode** | `src/app/api/room/state/route.ts` | Fuite de données, triche. |
| P1 | **Fallbacks vides sur secrets critiques** (`STRIPE_SECRET_KEY || ''`, etc.) | `src/app/api/webhook/route.ts:9,19`, `src/lib/monetization/checkout.ts:6` | Démarrage d’un service mal configuré. |
| P1 | **Erreurs renvoyées au client** (`error.message`) | multiples routes | Fuite d’informations internes. |
| P1 | **`ilike` non paramétré et parsing CSV externe** | `src/app/api/admin/questions/route.ts:29`, `src/app/api/admin/sync/route.ts` | Risque d’injection / corruption. |
| P1 | **Checkout multi-étapes non atomique** (auth user → User DB → customer Stripe → Purchase) | `src/lib/monetization/checkout.ts` | Incohérences joueur/customer/achat. |
| P2 | **CSP trop permissif** (`unsafe-inline`, `unsafe-eval`) | `next.config.ts` | Atténuation XSS limitée. |
| P2 | **Pas de HSTS ni `frame-ancestors`** | `next.config.ts` | Downgrade / clickjacking résiduel. |
| P2 | **`Math.random()` pour imposteur et sélection question** | `src/app/api/room/next-round/route.ts` | Pas cryptographique, acceptable pour du jeu mais à noter. |

---

## 5. Evolutivité

### 5.1 Forces

- **Registry de modes** : ajouter un mode suit un pattern clair (`manifest`, `engine`, `TVView`, `PlayerController`).
- **Catalogue de packs** : `Pack`, `UserPack`, `UserPass`, `Purchase` modélisent plusieurs modèles de revenus.
- **Engine pattern** : chaque mode a son propre `validateResponse` / `calculateScores`.

### 5.2 Faiblesses & risques

| Sévérité | Problème | Localisation | Impact |
|---|---|---|---|
| P1 | **Profiling couplé à des sets de modes hardcodés** : `ALIGNMENT_MODES`, `PERSPICACITY_MODES`, etc. | `src/lib/profiling/calculateProfile.ts:104-107` | Ajouter un mode nécessite de modifier le moteur de profilage. |
| P1 | **Duplication du manifest DATE_NIGHT** (client + serveur) | `src/game-modes/index.ts`, `src/game-modes/manifests.ts` | Oubli = crash. |
| P1 | **Sélection de questions entièrement en RAM** : `getQuestionDeck()` charge toutes les questions. | `src/lib/questions/deck.ts`, `src/app/api/room/next-round/route.ts` | Ne scale pas à un grand catalogue. |
| P1 | **Pas de tests d’intégration / E2E** | `vitest` a 12 tests unitaires seulement | Régressions non détectées sur les flux room/join/vote/pay. |
| P2 | **Pas de feature flags** | — | Impossible d’activer/désactiver un mode ou un pack sans déployer. |
| P2 | **Pas de documentation technique des modes** | `docs/GAME_MODES.md` existe mais ne décrit pas comment en ajouter un. | Friction pour les contributeurs. |
| P2 | **Analytics maison** : difficile à enrichir avec des funnels complexes. | `src/lib/analytics.ts` | Limites de croissance produit. |

---

## 6. Plan d’action recommandé

### P0 — Avant production publique

1. **Refondre l’auth admin**
   - Générer un JWT aléatoire signé à la connexion.
   - Utiliser ce cookie pour **tous** les endpoints admin (supprimer le header `Authorization: Bearer <ADMIN_PASSWORD>`).
   - Hasher `ADMIN_PASSWORD` avec Argon2id/bcrypt.

2. **Sécuriser l’auth joueur**
   - À l’inscription (`/api/room/join`), retourner un token signé (JWT ou HMAC) stocké en cookie/localStorage.
   - Valider ce token sur les endpoints joueur, pas seulement `playerId`.

3. **Rendre le webhook Stripe atomique et correct**
   - Vérifier `session.payment_status === 'paid'`.
   - Vérifier `event.livemode`.
   - Inclure `WebhookEvent.insert` dans la transaction RPC de fulfillment.
   - Ne pas marquer un événement comme traité si une erreur survient.

4. **Durcir le host token**
   - Stocker un hash du token en DB, pas le token en clair (ou utiliser un token dérivé par room).
   - Ajouter une expiration liée à la durée de vie de la room.
   - Ne jamais passer le token en query string ; utiliser un header ou un cookie.

5. **Limiter l’exposition de `/api/room/state`**
   - Ne retourner les réponses que si l’appelant est authentifié (hôte ou joueur avec token).
   - Ou scinder en `/api/room/public-state` (room + players) et `/api/room/private-state` (responses).

6. **Ajouter la validation Zod (ou Valibot) sur toutes les routes API.**

7. **Supprimer les fallbacks vides sur les secrets critiques.**

8. **Corriger le TOCTOU de création de room** en s’appuyant sur la contrainte unique `Room.code`.

9. **Ajouter du rate-limiting** sur login admin, host auth, join, vote, webhook.

### P1 — Court terme

10. Durcir le CSP (`frame-ancestors 'none'`, nonces, supprimer `unsafe-eval` si possible).
11. Ajouter HSTS et `X-Permitted-Cross-Domain-Policies`.
12. Gérer les erreurs sans fuite d’information en production.
13. Refactoriser `calculateProfile` pour lire les axes depuis `manifest.profilingCapabilities`.
14. Unifier les registries client/serveur (source unique du manifest + dérivations).
15. Ajouter des tests d’intégration sur les flux critiques.
16. Paginer et minimiser `/api/admin/stats`.

### P2 — Moyen terme

17. Mettre en place des feature flags pour modes/packs.
18. Documenter le guide d’ajout d’un mode de jeu.
19. Passer à un vrai client PostHog ou Segment.
20. Ajouter un cache serveur (Redis/Upstash) pour les questions et les rooms actives.
21. Gérer la reconnexion realtime et les heartbeats.

---

## 7. Conclusion

Captain Bond dispose d’une architecture MVP solide et d’une direction produit claire. Les efforts récents sur la sécurité (RLS, host token, RPC) vont dans le bon sens. Cependant, les points P0 d’authentification (admin, joueur, webhook) et de configuration des secrets doivent impérativement être corrigés avant tout lancement public. Une fois ces bases sécurisées, le produit gagnera beaucoup en maintenabilité en refactorisant la logique métier hors des routes API et en unifiant les sources de vérité (manifests, types, validation).
