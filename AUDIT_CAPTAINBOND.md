# 🔍 Audit Multidisciplinaire — Captain Bond

**Date :** 18 juin 2026  
**Auditeurs simulés :** Expert UX/CRO, Business/ROI, Thérapeute/Psychologue, Architecte technique.  
**Périmètre :** Stack Next.js 16 + React 19 + Tailwind 4 + Supabase + Stripe + Cloudflare Pages.

---

## 1. Résumé exécutif

**Verdict global :** Captain Bond est un **produit prometteur avec une vision forte** (l'anti-tech, le lien humain, la TV comme feu de camp). Il souffre cependant d'un **écart critique entre l'ambition et l'implémentation** : la monétisation est quasiment absente, le gating premium est inopérant, l'onboarding est inexistant, et le positionnement psychologique expose à des risques médico-légaux.

**Les 3 blocages prioritaires :**
1. **Aucun revenu réel** — le paiement Stripe du Dossier Classifié est un mock.
2. **Aucune explication** à l'arrivée — la landing demande immédiatement un code.
3. **Risque psychologique/légal** — positionnement thérapeutique sans encadrement clinique et profilage sans consentement.

---

## 2. Audit UX / Conversion

### 2.1 Frictions d'onboarding

| Problème | Localisation | Impact |
|---|---|---|
| Landing sans pitch ni démo | `src/app/page.tsx:96-98` | Rebond élevé des nouveaux utilisateurs |
| Champ code en premier plan | `src/app/page.tsx:101-133` | L'utilisateur ne sait pas s'il doit créer ou rejoindre |
| Options Hôte/Solo cachées | `src/app/page.tsx:136-143` | CTA principal invisible |
| Pas de tutoriel / `/comment-jouer` | Absent | Confusion sur le mécanisme TV + téléphone |
| Join sans contexte de mode | `src/app/join/[code]/page.tsx` | Le joueur ne sait pas dans quoi il entre |

### 2.2 Problèmes UX/UI

- **Confusion TV vs joueur :** la route `/room/[code]` est la vue TV mais rien n'interdit à un joueur d'y accéder. L'hôte sur la page joueur voit un fallback confus.
- **Textes trop petits :** plusieurs consignes essentielles sont en `text-xs` (10-12 px), difficiles à lire dans l'obscurité d'une soirée.
- **Terminologie interne visible :** boutons "Fallback: Révéler", "DJ Émotionnel" non expliqué.
- **Feedback d'attente faible :** écran "En attente..." avec un emoji ☕, sans progression ni explication.
- **Deep Connection :** les réponses textuelles ne sont jamais affichées sur la TV, ce qui réduit l'interactivité visuelle.

### 2.3 Trust / Social proof

- Aucun compteur de parties, témoignage, note, badge de sécurité.
- Paiement non rassurant (Stripe non branché, pas de CGV/confidentialité visibles).
- Aucune preuve de valeur du profil avant le paywall.

### 2.4 Paywall & churn

- **Paywall uniquement post-partie**, sans préparation. Choc tarifaire à froid.
- **Modes premium non bloqués** en amont (`isPremium: true` n'est jamais vérifié).
- **Profil "non prêt" = cul-de-sac** : il faut 10 questions et 80 % de confiance, sinon on renvoie vers une nouvelle partie.
- Mécanique Imposteur complexe ; parsing Spicy fragile (`" ou "`).

### 2.5 Forces à conserver

- Design cohérent (glassmorphism, néon, typographies).
- Architecture TV + téléphone différenciante.
- DJ Émotionnel (cooling rule) bien pensé.
- Partage Story 9:16 très efficace pour la viralité.
- Teaser freemium (archétype visible, axes floutés).

---

## 3. Audit Business / Monétisation / ROI

### 3.1 Inventaire des produits

| Produit | Prix | Statut |
|---|---|---|
| Dossier Classifié individuel | 1,99 € | UI ✅ / Paiement **MOCK** ❌ |
| Dossier Compatibilité couple | 2,99 € | UI ✅ / Paiement **MOCK** ❌ |
| Pack Péi (+5 modes, +150 questions) | 2,99 € | API Stripe ✅ / **UI absente** ❌ |
| Pack Soirée (tous modes, +500 questions) | 4,99 € | API Stripe ✅ / **UI absente** ❌ |
| Kozé+ (abonnement illimité) | 2,99 €/mois | API Stripe ✅ / **UI absente** ❌ |
| Kozé Pro B2B | 9,99 €/mois | API Stripe ✅ / **UI absente** ❌ |
| Pass 24h | Non défini | Champ mort dans le schéma ❌ |

### 3.2 Problèmes critiques

- **Paiement du Dossier = mock** (`/api/checkout/profile/route.ts`). Aucun euro encaissable aujourd'hui.
- **Gating inexistant :** `isPremium` n'est pas filtré dans `/api/questions/deck`, `next-round` ne vérifie pas les droits premium.
- **Prix hardcodés** dans `PACKS_PRICING`, non liés à la table `Pack`.
- **Pass 24h** existe dans le schéma (`User.activePassExpiresAt`) mais jamais utilisé.
- **Aucun upsell/cross-sell** après l'achat du Dossier.

### 3.3 Projection d'unit economics (conservatrice)

Hypothèses :
- 1 000 parties/mois × 4 joueurs = 4 000 sessions joueur
- 3 % achètent le Dossier à 1,99 €
- 1 % achète un Pack à 3,49 € moyen
- Coût infra ~150 €/mois, Stripe ~1,5 % + 0,25 €

**Revenu mensuel estimé :**
- Dossiers : 4 000 × 3 % × 1,99 € = **239 €**
- Packs : 4 000 × 1 % × 3,49 € = **140 €**
- **Total brut : ~379 €/mois**
- **Net après frais : ~250–280 €/mois**

Pour atteindre **2 000 € nets/mois** : 10× le volume, ou conversion ~8 % + ARPU 5 €, ou ajouter un abonnement récurrent.

### 3.4 Opportunités de revenus

**Court terme (0–3 mois) :**
- Brancher Stripe réel sur le Dossier.
- Pass 24h à 4,99 €.
- Vente de packs dans le lobby.
- Bundle Dossier + Pack à prix réduit.
- Bloquer les modes premium et proposer un upgrade.

**Long terme (6–18 mois) :**
- Kozé Pro B2B (dashboard, licences multi-salles).
- Abonnement Kozé+ avec contenu mensuel.
- Packs saisonniers (Halloween, Saint-Valentin).
- Programme de parrainage.
- API/data anonymisée B2B/RH.

---

## 4. Audit Psychologie / Contenu / Éthique

### 4.1 Forces psychologiques

| Mécanisme | Fichier | Pourquoi c'est bon |
|---|---|---|
| Contrat social en Deep Connection | `deep-connection/TVView.tsx:67-73` | Crée un cadre de sécurité avant la vulnérabilité |
| Input limité 60 caractères | `deep-connection/PlayerController.tsx:91-103` | Force l'oralité, réduit la charge cognitive |
| Droit à l'esquive (SKIP) | `deep-connection/PlayerController.tsx:46-50` | Préserve l'autonomie |
| Mode Bougie / Pause | `date-night/PlayerController.tsx:91-107` | Permet de suspendre sans casser l'ambiance |
| Jauge de tension (hold 2s) | `date-night/PlayerController.tsx:49-72` | Ralentit, crée une présence contemplative |
| Pity Shield (1 question positive sur 3) | `next-round/route.ts:79-82` | Protège l'ambiance émotionnelle |

### 4.2 Risques GRAVES

#### A. Positionnement comme outil thérapeutique sans encadrement clinique
- Le mode Deep Connection est nommé **"La Thérapie de Groupe"** (`GAME_MODES.md`).
- Le Date Night est nommé **"Thérapie de couple"** (`src/game-modes/date-night/index.ts`).
- Les questions du seed portent des **intentions cliniques explicites** :
  - *"Mesurer la capacité d'introspection"*
  - *"Évaluer le style d'attachement (évitant vs sécurisant)"*
  - *"Identifier le travail psychologique en cours et le récit intérieur autodestructeur"*
  - *"Aborder frontalement les peurs d'abandon, de fusion ou de perte de liberté"*

**Risque :** en France, l'exercice de la psychothérapie est réservé aux professionnels de santé (Code de la santé publique, art. L4161-1 et L4161-5). Positionner un jeu grand public comme outil diagnostique/thérapeutique expose à un risque médico-légal majeur et peut retarder une prise en charge appropriée.

#### B. Profilage psychologique stigmatisant et intrusif
- `calculateProfile.ts` calcule trois axes : **Conformisme / Empathie / Duperie**.
- Les archétypes s'appellent *"Le Manipulateur Bienveillant"*, *"Le Maître du Chaos"*, *"L'Agent Double"*.
- Le `UserStats` stocke `psychologicalProfile`, `compatibilityData`, `totalBetrayals`.

**Risque :** catégorisation stigmatisante, absence de contexte clinique, possible détournement (harcèlement, manipulation). Les données entrent dans le champ des **données sensibles RGPD** (vie mentale).

#### C. Absence de consentement éclairé
- Aucun écran de consentement avant le calcul du profil.
- Aucune privacy policy dédiée au profilage.
- Aucun mode "jouer sans profilage".
- Le partage Story contient prénom + archétype, potentiellement sans consentement des autres joueurs.

#### D. Pression sociale et exposition forcée
- En Icebreaker/Spicy, les votes sont publics et affichent les noms des votants.
- En Deep Connection, bien que les réponses soient anonymes à la révélation, elles sont lues par l'hôte.
- Pas de safe word global, pas de sortie de secours visible.

### 4.3 Recommandations psychologiques

1. **Retirer le vocabulaire thérapeutique** : ne jamais présenter le jeu comme de la "thérapie" ou un "diagnostic".
2. **Ajouter un écran de consentement** explicite avant la première partie :
   - "Captain Bond est un jeu. Il ne remplace pas un professionnel de santé mentale."
   - "Vos réponses servent à générer un profil ludique. Vous pouvez jouer sans profilage."
3. **Renommer les axes et archétypes** pour qu'ils soient descriptifs et non pathologisants :
   - Conformisme → **Tendance au consensus**
   - Duperie → **Esprit de jeu / Bluff**
   - Manipulateur Bienveillant → **L'Observateur Stratège**
4. **Offrir un mode anonyme** sans stockage de profil.
5. **Ajouter un safe word / bouton pause** accessible en permanence.
6. **Anonymiser/supprimer les `Response` après 30–90 jours**.
7. **Ne jamais afficher les données d'un joueur sur la Story d'un autre** sans consentement explicite.
8. **Interdire l'usage aux moins de 16 ans** ou adapter radicalement le contenu.

---

## 5. Audit Technique

### 5.1 Stack & compatibilité

- **Next.js 16.2.9 + React 19.2.4 + TailwindCSS 4** : versions très récentes. Le README dit Next.js 14+, il est obsolète.
- **Prisma 7.8** : compatible Edge ? Non. Prisma n'est pas utilisé au runtime (seulement `seed.ts`). Toutes les routes utilisent Supabase JS. C'est cohérent avec Cloudflare Pages Edge.
- **Cloudflare Pages + Edge runtime** : bien pris en charge par Supabase JS et Stripe avec `createFetchHttpClient`.

### 5.2 Bugs & incohérences

| Problème | Localisation | Conséquence |
|---|---|---|
| `gameEnginesRegistry` ne contient que `IMPOSTEUR` | `src/game-modes/engines.ts:9-14` | `getGameEngine('ICEBREAKER')` retourne `undefined` ; `reveal/route.ts` utilise `gameEnginesRegistry` mais `gameModesRegistry` est utilisé ailleurs |
| `currentMode` par défaut `'ICEBREAKER'` dans `next-round`, mais `'VRAI_FAUX'` dans `reveal` | `reveal/route.ts:58` | Incohérence si `currentMode` est null |
| `roundDuration` est lu depuis `room.roundDuration` mais jamais écrit | `TVRoom page.tsx:50` | `roundDuration` peut être `null` sauf si récupéré du `roundConfig` de `next-round` |
| Imposteur PlayerController envoie un JSON mélangé ; TVView parse `stmt.isLie` mais la réponse ne stocke pas l'ordre original | `imposteur/PlayerController.tsx`, `imposteur/TVView.tsx:92` | `isLie` est bien présent dans le JSON envoyé, OK |
| `calculateProfile` divise par `MIN_QUESTIONS` (10) même si le joueur a répondu à moins | `calculateProfile.ts:127` | `confidencePercent` peut être < 100 sans atteindre le seuil, OK logiquement |

### 5.3 Sécurité

| Problème | Localisation | Sévérité |
|---|---|---|
| `ADMIN_SYNC_SECRET` a une valeur fallback dans `crypto.ts` | `src/lib/crypto.ts:6` | 🔴 Haute — clé HMAC par défaut publique |
| Admin auth via simple mot de passe en SHA-256 ; pas de rate limiting | `src/app/api/admin/login/route.ts` | 🟡 Moyenne |
| Routes admin (`/api/admin/*`) ne vérifient pas systématiquement le cookie admin | `src/app/api/admin/generate/route.ts`, `sync/route.ts`, `questions/route.ts` | 🔴 Haute — n'importe qui peut générer des questions ou synchroniser |
| Pas de validation Zod sur les payloads API | Toutes les routes | 🟡 Moyenne — injections et formats invalides possibles |
| `room/create` génère un code 4 caractères avec 5 tentatives max | `src/app/api/room/create/route.ts:40-58` | 🟢 Faible — collision possible mais gérée |
| `vote` insère la réponse sans valider que `questionId` correspond à `room.currentQuestionId` | `src/app/api/room/vote/route.ts` | 🟡 Moyenne — vote sur une ancienne question possible |
| RLS Supabase non auditable depuis le code ; la config est dans `supabase_rls.sql` | `supabase_rls.sql` | 🟡 À vérifier en production |
| Webhook Stripe utilise `supabase` (anon key) et non `supabaseAdmin` | `src/app/api/webhook/route.ts` | 🟡 Si RLS est mal configurée, l'insertion échoue |
| `/api/checkout/profile` mock crée un `User` mock avec email prédictible | `src/app/api/checkout/profile/route.ts:57-66` | 🟡 Risque de conflit d'email en production |

### 5.4 Performance

- `/api/questions/deck` cache 24h sur Cloudflare : ✅ bon.
- `next-round` fait un `fetch` interne vers `/api/questions/deck` : 🟡 ajoute une latence inutile, pourrait utiliser un cache en mémoire ou la DB directement.
- TVRoom fait beaucoup de requêtes Supabase en parallèle à l'init : 🟡 N+1 potentiel.
- Deep Connection broadcast un événement `TYPING` à chaque frappe : 🟠 risque de spam sur Supabase Realtime.

### 5.5 Maintenabilité

- Pas de tests unitaires/d'intégration dans le projet principal (hors `node_modules`).
- TypeScript `strict: true` ✅ mais beaucoup de `any` dans les composants de jeu.
- Admin utilise encore beaucoup d'inline styles, non unifié avec Tailwind.
- `gameEnginesRegistry` vs `gameModesRegistry` : duplication/ confusion.
- `studio/page.tsx` importe des composants Remotion manquants (`CaptainBondConfession`, `CaptainBondChat`).

### 5.6 Recommandations techniques prioritaires

1. **Retirer la clé fallback** dans `crypto.ts` et exiger `ADMIN_SYNC_SECRET`.
2. **Sécuriser les routes admin** avec un middleware vérifiant le cookie `koze_admin_session`.
3. **Ajouter Zod** pour valider tous les payloads API.
4. **Unifier `gameEnginesRegistry` et `gameModesRegistry`** ou clarifier leur usage.
5. **Ajouter rate limiting** sur `/api/admin/login` et `/api/room/create`.
6. **Écrire des tests** sur `calculateProfile`, les routes API critiques, et le moteur DJ.
7. **Vérifier les RLS Supabase** et utiliser `supabaseAdmin` partout côté serveur si nécessaire.
8. **Réduire les appels internes** dans `next-round` (éviter le fetch vers soi-même).
9. **Linter/typer** les composants de jeu pour retirer les `any`.

---

## 6. Plan d'action global priorisé

### 🔴 P0 — Bloquant (à faire immédiatement)

| # | Action | Discipline | Fichiers clés |
|---|---|---|---|
| 1 | Brancher Stripe réel sur `/api/checkout/profile` | Business | `src/app/api/checkout/profile/route.ts` |
| 2 | Réparer le gating premium (`isPremium`, modes premium) | Business + Tech | `src/app/api/questions/deck/route.ts`, `src/app/api/room/next-round/route.ts` |
| 3 | Expliquer le produit sur la landing + rendre les CTA hôte visibles | UX | `src/app/page.tsx` |
| 4 | Retirer le vocabulaire "thérapie" et ajouter un écran de consentement | Psychologie + Légal | `docs/GAME_MODES.md`, `src/app/join/[code]/page.tsx` |
| 5 | Sécuriser les routes admin (vérifier cookie, retirer fallback secret) | Tech | `src/app/api/admin/*`, `src/lib/crypto.ts` |
| 6 | Renommer axes/archétypes et ajouter mode anonyme | Psychologie | `src/lib/profiling/calculateProfile.ts`, `ClassifiedDossierPlayer.tsx` |

### 🟡 P1 — Court terme (1–3 mois)

| # | Action | Impact |
|---|---|---|
| 7 | Lancer le Pass 24h | Revenu rapide |
| 8 | Afficher les packs/abonnements dans l'UI (lobby + fin de partie) | Revenu rapide |
| 9 | Créer bundles Dossier + Pack | Revenu rapide |
| 10 | Ajouter onboarding interactif + page `/comment-jouer` | Conversion |
| 11 | Ajouter QR code dans le lobby TV | Conversion |
| 12 | Améliorer le cas "profil non prêt" | Conversion |
| 13 | Ajouter social proof et badges de confiance | Conversion |
| 14 | Ajouter validation Zod + rate limiting | Sécurité |
| 15 | Ajouter analytics funnel | Growth |

### 🟢 P2 — Long terme (3–12 mois)

| # | Action | Impact |
|---|---|---|
| 16 | Développer Kozé Pro B2B | Revenu récurrent |
| 17 | Activer l'abonnement Kozé+ | Revenu récurrent |
| 18 | Système de comptes utilisateurs + historique | Rétention |
| 19 | Marketplace de packs thématiques saisonniers | Revenu |
| 20 | Programme de parrainage | Acquisition virale |
| 21 | Mise en conformité RGPD complète | Légal |
| 22 | Tests automatisés + CI/CD | Qualité |
| 23 | Internationalisation | Croissance |

---

## 7. Conclusion

Captain Bond a **tous les ingrédients d'un bon produit** : une vision claire, un design accrocheur, une mécanique différenciante (TV + téléphone), et un paywall psychologique bien conçu sur le papier. Mais il est actuellement **à mi-chemin entre le prototype et le produit commercial**.

**Pour gagner de l'argent rapidement :** brancher Stripe, bloquer le contenu premium, et montrer les offres dans le parcours.

**Pour durer :** soigner l'onboarding, sécuriser la sécurité émotionnelle et juridique, et construire un modèle hybride achat unique + abonnement + B2B.

**Pour ne pas se faire attaquer :** retirer tout positionnement thérapeutique, collecter un consentement explicite, et gouverner les données psychologiques avec soin.

---

*Aucun fichier du projet n'a été modifié lors de cet audit.*
