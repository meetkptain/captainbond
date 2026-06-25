# Audit Produit — Game Design / UX / Market Fit

**Projet :** Captain Bond (koze)  
**Date :** 2026-06-20  
**Périmètre :** MVP actuel après les 4 vagues du plan 10/10 (socle → scoring → monétisation → viralité).  
**Méthode :** revue statique du code, des flows et de l'expérience utilisateur, confrontée aux documents produit (`docs/GAME_DESIGN.md`, `docs/GAME_MODES.md`, `docs/MANIFESTO.md`, `docs/CONTENT_GUIDELINES.md`).

---

## 1. Résumé exécutif

| Grand axe | Score actuel /10 | Verdict |
|---|---|---|
| **Game Design** | 7,0 | Boucle de jeu solide, modes cohérents, scoring et sécurité bien pensés. Manque de pacing avancé, de meta-progression et de gestion du contenu à grande échelle. |
| **UX** | 6,5 | Split TV/téléphone bien exécuté, onboarding et Safe Word réussis. Frictions résiduelles sur les écrans d'attente, le feedback hôte et la gestion des déconnexions. |
| **Market Fit** | 6,0 | Proposition de valeur claire, pricing varié, viral loop amorcé. Faiblesse sur la preuve sociale, le SEO, le funnel d'acquisition et le message "pourquoi payer". |
| **Analytics & Experimentation** | 5,0 | Events métier présents mais peu de propriétés, pas de funnel configuré, pas d'A/B testing. |
| **Trust & Safety** | 6,0 | Consentement, Safe Word, sécurité technique solides. Modération de contenu et signalement absents. |
| **Performance & Scalabilité** | 6,0 | Edge + CDN OK. Chargement du deck en RAM et absence de pagination à corriger. |
| **Content & Copy** | 6,0 | Tone of voice cohérent. SEO obsolète, paywall vague, i18n inexistante. |
| **Accessibility & Inclusion** | 4,0 | Contrastes globalement OK mais navigation clavier, ARIA et `prefers-reduced-motion` manquants. |

**Score global produit : 6,0/10.**  
Captain Bond a dépassé le stade du MVP technique pour devenir un **produit jouable et monétisable**. Pour atteindre 10/10, il faut maintenant travailler le **rythme global de la soirée**, la **fiabilité perçue de l'UX** et la **conversion émotionnelle** (preuve sociale, démo, raison d'acheter immédiatement).

---

## 2. Game Design — 7/10

### 2.1 Forces

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Boucle de jeu principale** | 8/10 | Flow `lobby → vote → reveal → fin` clair. La TV est le "feu de camp", le téléphone est la manette. Le code reflète cette asymétrie (`src/app/room/[code]/page.tsx` vs `src/app/room/[code]/player/page.tsx`). |
| **Mécaniques de modes** | 8/10 | 5 modes distincts (Icebreaker, Spicy, Deep, Imposteur, Date Night) + 2 nouveaux (Family, Most Likely To). Chacun a son `manifest`, `engine`, `TVView`, `PlayerController` (`src/game-modes/index.ts`). |
| **Sécurité émotionnelle** | 8/10 | Safe Word (`🛑`) présent en header joueur (`src/app/room/[code]/player/page.tsx:326`), skip unifié (`__SKIP__`) accepté par le serveur, modale de consentement post-prénom (`src/app/join/[code]/page.tsx`), écran noir Deep Connection (`src/game-modes/deep-connection/TVView.tsx:101`). |
| **Scoring crédible** | 7/10 | Scores déterministes basés sur les votes réels (`src/game-modes/*/index.ts`), plus de hardcodes 94/88/85. Le profil exploite `pointsEarned` et `isCorrect` (`src/lib/profiling/calculateProfile.ts`). |
| **DJ Émotionnel (base)** | 6/10 | Le serveur évite deux questions d'intensité 3 à la suite (`src/services/roomGameService.ts:114`) et force une carte positive tous les 3 tours en Icebreaker. C'est la base du "refroidissement". |

### 2.2 Faiblesses & risques

| Sous-axe | Score | Problème | Localisation | Impact |
|---|---|---|---|---|
| **Pacing global** | 5/10 | Pas de gestion du "cycle de soirée" : début, montée, climax, descente. Seul le refroidissement anti-deep existe. | `src/services/roomGameService.ts` | Les soirées peuvent devenir monotones ou épuisantes. |
| **Meta-progression** | 4/10 | Daily Bond = simple streak. Pas de niveaux, de badges, de défis entre soirées, de collection d'archétypes. | `src/services/statsService.ts` | Faible incitation à revenir après 2-3 parties. |
| **Équilibre des modes** | 6/10 | Family et Most Likely To réutilisent le moteur Icebreaker sans variation de scoring. Imposteur manque d'une phase de vote/détection. | `src/game-modes/family/`, `src/game-modes/most-likely-to/`, `src/game-modes/imposteur/index.ts` | Les nouveaux modes risquent de ressembler à des reskins. |
| **Gestion du contenu** | 5/10 | `listQuestionsForDeck()` charge toutes les questions en RAM. Pas de pool par session, pas de rotation anti-répétition. | `src/services/roomGameService.ts:102` | Ne scale pas, répétitions possibles. |
| **Date Night** | 5/10 | Le mode est documenté avec de nombreuses règles (asymétrie, hold-to-proceed, mode veille) mais une grande partie n'est pas implémentée. | `docs/GAME_MODES.md`, `src/game-modes/date-night/` | Décalage entre promesse et réalité. |

### 2.3 Recommandations pour passer à 10/10

1. **Ajouter un "Arc de soirée"** : forcer une séquence imposée sur les 10 premières minutes (Icebreaker → Spicy → Deep) pour garantir une montée en puissance.
2. **Implémenter Date Night complet** : éteindre la TV, hold-to-proceed, mode bougie, joker géant. C'est un use case très différenciant.
3. **Donner une identité mécanique à Family / Most Likely To** : par ex. Family = pas de vote négatif, Most Likely To = double vote possible.
4. **Ajouter une meta-progression** : collection des archétypes débloqués, badges "Premier bluff", "Traître en série", etc.
5. **Anti-répétition** : tracker les IDs des questions déjà posées par room et les exclure du pool.

---

## 3. UX — 6,5/10

### 3.1 Forces

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Onboarding** | 8/10 | Modales tutorielles pour l'hôte (3 slides) et le joueur (2 slides), affichées une seule fois par room via `sessionStorage`. | `src/app/room/[code]/page.tsx:307`, `src/app/room/[code]/player/page.tsx:396` |
| **Join flow** | 8/10 | Landing avec saisie auto-redirect à 4 caractères, puis saisie du prénom, puis consentement. Friction faible. | `src/app/page.tsx:58`, `src/app/join/[code]/page.tsx` |
| **Split TV / joueur** | 8/10 | La TV montre la question et le podium, le joueur vote depuis son téléphone. Deep Connection ajoute le typing indicator et l'écran noir. | `src/game-modes/icebreaker/TVView.tsx`, `src/game-modes/deep-connection/TVView.tsx` |
| **Safe Word** | 8/10 | Accessible en permanence sur le header joueur. Permet de skipper ou de quitter. | `src/components/SafeWordModal.tsx`, `src/app/room/[code]/player/page.tsx:415` |
| **Feedback visuel** | 7/10 | États "vote enregistré", "levez les yeux", compteurs, animations de podium. | multiples composants de mode |

### 3.2 Faiblesses & risques

| Sous-axe | Score | Problème | Localisation | Impact |
|---|---|---|---|---|
| **Écrans d'attente** | 5/10 | Le joueur en attente voit "En attente... Regardez l'écran TV". Pas d'animation de progression, pas d'indication de qui est prêt. | `src/app/room/[code]/player/page.tsx:435` | Sensation de blocage, diminue l'engagement. |
| **Contrôles hôte** | 6/10 | Les boutons hôte sont visibles mais "Tirer une carte", "Révéler", "Carte suivante", "Terminer" peuvent prêter à confusion. Pas de confirmation avant de terminer la partie. | `src/app/room/[code]/page.tsx:470` | Risque de fin accidentelle ou de double-clic. |
| **Gestion des erreurs réseau** | 4/10 | Pas de reconnexion Supabase Realtime explicite, pas de message si la room est fermée dans l'autre onglet. | `src/app/room/[code]/page.tsx:101` | Parties cassées silencieusement. |
| **Accessibilité** | 4/10 | Pas de gestion du focus clavier visible, contrastes parfois limités (texte gris sur fond sombre), pas de `aria-live` sur les annonces. | global | Exclusion partielle des joueurs en situation de handicap. |
| **Paywall UX** | 6/10 | Le panel Unlock est clair, mais le message "Débloquer Captain Bond" est vague. On ne comprend pas immédiatement ce qu'on achète (tous les modes vs dossier). | `src/components/UnlockPanel.tsx`, `src/app/room/[code]/page.tsx:359` | Friction conversion. |

### 3.3 Recommandations pour passer à 10/10

1. **Ajouter une "salle d'attente ludique"** : prénoms connectés, bouton "Prêt", mini-fun fact en attendant l'hôte.
2. **Durcir les contrôles hôte** : confirmation "Terminer la partie ?", états disabled pendant les appels API, raccourcis clavier.
3. **Gérer les déconnexions** : reconnexion auto, message "Vous avez été déconnecté", bouton "Rejoindre à nouveau".
4. **Accessibilité** : labels ARIA, focus visible, mode contrasté, taille de texte ajustable.
5. **Clarifier le paywall** : comparatif visuel Pass / Dossier / Abonnement avec ce qui est inclus.

---

## 4. Market Fit — 6/10

### 4.1 Forces

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Value proposition** | 8/10 | "Le DJ de votre soirée" est clair, différenciant et aligné sur le manifeste anti-tech. | `src/app/page.tsx:129`, `docs/MANIFESTO.md` |
| **Pricing** | 7/10 | Offres variées : Pass 24h (2,99€), Week-end (4,99€), Abo mensuel/annuel, Lifetime, Dossier individuel (4,99€), Couple (9,99€). | `src/lib/monetization/catalog.ts` |
| **Freemium** | 7/10 | 3 questions gratuites, archétype visible gratuit, axes floutés. Tease sans bloquer totalement. | `src/components/endgame/ClassifiedDossierPlayer.tsx:432`, `MONETIZATION_CONFIG.FREE_TEASER_ENABLED` |
| **Viral loop** | 6/10 | Story 9:16 générée, ShareSheet WhatsApp/SMS/native, QR code de partage sur la TV. | `src/components/ShareSheet.tsx`, `src/components/endgame/ClassifiedDossierPlayer.tsx`, `src/components/endgame/ClassifiedDossierTV.tsx` |
| **Cible** | 7/10 | Soirées, apéros, dates, EVG/EVJF. Positionnement multi-contexte. | `src/app/page.tsx:239` |

### 4.2 Faiblesses & risques

| Sous-axe | Score | Problème | Localisation | Impact |
|---|---|---|---|---|
| **Preuve sociale** | 3/10 | Aucun témoignage, aucune stat "X soirées créées cette semaine", aucune vidéo démo. | `src/app/page.tsx` | Difficile de convaincre un nouvel utilisateur de créer une soirée. |
| **Funnel d'acquisition** | 4/10 | Pas de capture email, pas de newsletter, pas de landing dédiée par use case (couple, EVG, team building). | global | Acquisition dépendante du bouche-à-oreille. |
| **Message "pourquoi payer"** | 5/10 | Le Pass 24h à 2,99€ inclut déjà les profils, ce qui cannibalise le Dossier à 4,99€. Le valeur du Dossier Couple (9,99€) n'est pas assez démontrée. | `src/lib/monetization/catalog.ts`, `src/components/endgame/ClassifiedDossierPlayer.tsx` | Confusion et sous-optimisation du revenu. |
| **SEO / contenu** | 3/10 | Page d'accueil unique, metadata obsolète ("Skip the small talk" dans `src/app/layout.tsx:16`), pas de blog ou de fiches modes. | `src/app/layout.tsx` | Trafic organique quasi nul. |
| **Parrainage** | 2/10 | Pas de code promo, pas de crédit offert, pas de "invite un ami et jouez gratuitement". | global | Croissance organique non amplifiée. |
| **Démonstration** | 3/10 | Pas de démo jouable sans créer de room, pas de GIF/vidéo du flow. | `src/app/page.tsx` | Un visiteur ne comprend pas le produit en 10 secondes. |

### 4.3 Recommandations pour passer à 10/10

1. **Ajouter une section preuve sociale** : compteur de soirées, avis beta, vidéo 30s du flow TV/téléphone.
2. **Créer des landings dédiées** : `/date-night`, `/evg`, `/team-building` avec copy et CTA adaptés.
3. **Clarifier la hiérarchie des offres** : Pass = accès modes+profils 24h, Dossier = souvenir permanent à partager, Abo = joueur régulier.
4. **Mettre en place un parrainage** : "Invite 3 amis, débloque un mode gratuit" ou crédit de 1€.
5. **SEO** : corriger les metadata, ajouter des pages statiques par mode, un blog "50 questions pour casser la glace".
6. **Funnel pré-lancement** : capture email avec promesse "Soyez les premiers à tester la beta".

---

## 5. Analytics & Experimentation — 5/10

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Instrumentation** | 6/10 | Events métier prédéfinis (`ROOM_CREATED`, `PLAYER_JOINED`, `CHECKOUT_INITIATED`, etc.) dans `src/lib/analytics.ts:108`. Client PostHog maison edge-compatible. |
| **Qualité des events** | 4/10 | Peu de propriétés contextuelles (roomCode, mode, SKU, paid_status). Les events côté client ne sont pas appelés systématiquement sur les actions clés (vote, share). | `src/lib/analytics.ts`, `src/app/room/[code]/player/page.tsx` |
| **Funnels & cohortes** | 3/10 | Pas de funnel configuré, pas de rétention par cohorte, pas de tracking des étapes de conversion. | global |
| **A/B testing** | 2/10 | Pas d'infrastructure de feature flags ni d'experimentation. Chaque test pricing/copy nécessite un déploiement. | global |

### Recommandations

1. **Tracker le funnel complet** : `landing_seen` → `room_created` → `player_joined` → `question_answered` → `paywall_seen` → `checkout_initiated` → `purchase_completed` → `profile_shared`.
2. **Enrichir chaque event** avec `room_code`, `mode_id`, `player_count`, `sku`, `price_cents`, `is_premium_mode`.
3. **Utiliser les feature flags** de PostHog pour tester prix, copy et ordre des modes sans déployer.
4. **Ajouter un hook `useAnalytics`** pour centraliser les captures côté client et éviter les oublis.

---

## 6. Trust & Safety — 6/10

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Consentement & contrôle** | 8/10 | Consentement explicite, Safe Word, skip, possibilité de quitter. | `src/components/ConsentModal.tsx`, `src/components/SafeWordModal.tsx` |
| **Sécurité technique** | 7/10 | RLS restrictif, validation Zod via `withApiHandler`, rate limiting Upstash, headers CSP. | `src/proxy.ts`, `src/lib/api/withApiHandler.ts`, `src/lib/rate-limit.ts`, `next.config.ts` |
| **Modération de contenu** | 3/10 | Pas de filtre sur les questions générées par l'admin, pas de modération des réponses texte (Deep Connection), pas de signalement. | `src/app/api/admin/generate/route.ts`, `src/game-modes/deep-connection/PlayerController.tsx` |
| **Gestion des joueurs problématiques** | 4/10 | L'hôte peut kick un joueur (`/api/room/kick`), mais il n'y a pas de blocage de joueur, de signalement ni de "ban room". | `src/app/api/room/kick/route.ts` |

### Recommandations

1. **Modération automatique** : scanner les réponses texte et les questions générées via une API légère (Perspective, Gemini modéré) ou des listes de mots.
2. **Signalement en jeu** : bouton "Signaler cette question" dans le Safe Word.
3. **Exploiter les tags NSFW** : filtrer les questions `#nsfw` en mode Family / par défaut public.
4. **Audit trail** : logger les kicks et les changements de mode pour l'hôte.

---

## 7. Performance & Scalabilité (produit) — 6/10

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Runtime & déploiement** | 8/10 | Edge runtime cohérent, build rapide, pages statiques pour landing/privacy. | `next.config.ts`, routes `runtime = 'edge'` |
| **Chargement du contenu** | 4/10 | `listQuestionsForDeck()` charge toutes les questions à chaque tour (`src/services/roomGameService.ts:102`). Pas de cache côté serveur. | `src/services/roomGameService.ts` |
| **Admin & stats** | 5/10 | Pas de pagination sur `/api/admin/stats` ni sur `/api/admin/questions`. Risque de timeout à grande échelle. | `src/app/api/admin/stats/route.ts`, `src/app/api/admin/questions/route.ts` |
| **Assets** | 6/10 | Pas d'optimisation d'images (pas de `<Image />` Next.js), pas de prefetch des routes de mode. | `src/app/page.tsx` |

### Recommandations

1. **Pagination / cache des questions** : charger par mode + intensity, avec un cache Redis de 5 minutes.
2. **Pool par session** : sélectionner N questions au début de la partie et piocher dedans.
3. **Pagination admin** : `limit` / `offset` sur les listes.
4. **Optimiser la landing** : utiliser `<Image />`, lazy load des sections, prefetch `/join/[code]`.

---

## 8. Content & Copy — 6/10

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Tone of voice** | 7/10 | Univers CIA / agent, humoristique, cohérent avec les modales et les écrans de fin. | `src/components/endgame/ClassifiedDossier*.tsx` |
| **SEO / metadata** | 3/10 | Metadata obsolète (`"Skip the small talk"` dans `src/app/layout.tsx:16`), pas deOpen Graph dynamique, pas de sitemap. | `src/app/layout.tsx` |
| **Paywall copy** | 5/10 | "Débloquer Captain Bond" est vague. Le différenciel Pass / Dossier / Abo n'est pas clair. | `src/components/UnlockPanel.tsx`, `src/app/room/[code]/page.tsx` |
| **Microcopy erreurs** | 6/10 | Messages d'erreur compréhensibles mais génériques. Pas de guidance corrective. | `src/lib/api/withApiHandler.ts`, `src/lib/api/client.ts` |
| **i18n** | 2/10 | Tout est en français, hardcodé. Pas de structure pour l'anglais ou d'autres langues. | global |

### Recommandations

1. **Mettre à jour metadata** : title/description/Open Graph alignés sur "DJ de votre soirée".
2. **Réécrire le paywall** : "3 cartes gratuites jouées. Passez en mode Premium pour 2,99€ et débloquez tous les modes + les profils de toute la soirée."
3. **Créer un fichier de copy** centralisé (`src/lib/copy/fr.ts`) pour préparer l'i18n.
4. **Ajouter des messages d'erreur actionnables** : "Code invalide — vérifiez les 4 caractères" au lieu de "Erreur".

---

## 9. Accessibility & Inclusion — 4/10

| Sous-axe | Score | Pourquoi |
|---|---|---|
| **Contrastes & couleurs** | 6/10 | Fond sombre + texte clair globalement lisible, mais certains gris (`text-slate-400` / `text-slate-500`) sur fond `bg-slate-950` peuvent être limite. | global |
| **Navigation clavier** | 3/10 | Pas de focus visible, pas de gestion des raccourcis, ordre de tabulation non optimisé. | `src/app/page.tsx`, `src/app/join/[code]/page.tsx` |
| **ARIA & screen readers** | 3/10 | Peu de labels `aria-label`, pas de `aria-live` pour les annonces de changement de phase, pas de rôles sur les graphiques de podium. | `src/game-modes/icebreaker/TVView.tsx` |
| **Motion & cognition** | 4/10 | Animations pulse/bounce omniprésentes, pas de respect de `prefers-reduced-motion`. | multiples composants |
| **Inclusion** | 5/10 | Pas de mode daltonien, pas d'option pour agrandir le texte, prénom limité à 15 caractères (OK). | global |

### Recommandations

1. **WCAG 2.1 AA** : focus visible, contrastes >= 4.5:1, labels sur tous les boutons.
2. **Annonces ARIA** : `aria-live="polite"` sur les changements de statut de room.
3. **`prefers-reduced-motion`** : réduire ou désactiver les animations pour les utilisateurs concernés.
4. **Mode daltonien** : ne pas se fier uniquement aux couleurs (ex. camp A/B avec icônes + labels).

---

## 10. Funnel de conversion détaillé

| Étape | Friction identifiée | Taux cible | Taux estimé actuel | Priorité |
|---|---|---|---|---|
| **Visit → Create** | Pas de preuve sociale, pas de démo jouable | 15-20% | ~8-10% | P1 |
| **Create → Join** | QR code + URL visibles, code 4 caractères facile | 80% | ~70% | P2 |
| **Join → Play** | Consentement + prénom, 2 écrans | 85% | ~75% | P2 |
| **Play → Pay** | Freemium clair mais paywall vague | 5-8% | ~2-3% | P1 |
| **Pay → Share** | ShareSheet présent, Story visuelle forte | 30% | ~15% | P2 |

### Hypothèses clés

- **Le gros goulot d'étranglement est Visit → Create** : un visiteur ne comprend pas en 10s ce que fait le produit.
- **Le deuxième goulot est Play → Pay** : l'utilisateur ne voit pas la valeur immédiate du Pass vs du Dossier.
- **Le share est sous-exploité** : aucun incitatif à partager avant la fin de partie (pas de "invite un ami pour une carte gratuite").

---

## 11. Synthèse : le chemin vers 10/10

Pour passer de **6,0/10** à **10/10**, les axes doivent converger sur une promesse unique : **"Captain Bond garantit une soirée mémorable, sans friction technique, accessible à tous, et donne envie de revenir et de partager."**

### Priorités immédiates (impact / effort)

| Priorité | Action | Axe | Effort |
|---|---|---|---|
| P1 | Corriger metadata + ajouter vidéo démo sur la landing | Market Fit | 1j |
| P1 | Clarifier le comparatif Pass / Dossier / Abo | Market Fit | 1j |
| P1 | Ajouter confirmation avant fin de partie + états disabled hôte | UX | 0,5j |
| P2 | Améliorer la salle d'attente joueur (prêts, fun facts) | UX | 1j |
| P2 | Implémenter Date Night complet (TV off, hold, bougie, joker) | Game Design | 2-3j |
| P2 | Ajouter meta-progression (badges, collection archétypes) | Game Design | 2j |
| P3 | Anti-répétition + pool par session | Game Design | 1j |
| P3 | Landings par use case + SEO | Market Fit | 2j |
| P3 | Parrainage / crédit ami | Market Fit | 2j |

### Note finale

Captain Bond est un **produit avec un fort potentiel** : la vision est claire, le split TV/téléphone est bien pensé et la monétisation a une base solide. Les notes actuelles reflètent un MVP qui a fait le plus gros du chemin technique, mais qui doit maintenant **polir l'expérience émotionnelle** (pacing, attente, Date Night) et **le message commercial** (preuve, démo, funnel) pour prétendre à 10/10.
