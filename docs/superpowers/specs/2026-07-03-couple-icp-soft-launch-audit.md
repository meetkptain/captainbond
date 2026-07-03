# Audit ICP Couple — Option 1 Soft Launch

## Contexte

Les features ICP Couple sont implémentées sur `main` (invite tokens single-use, trial 7 jours, onboarding, paywall, archive/journal, SEO blog). Un audit multidisciplinaire a été mené par 7 experts (produit, rétention, thérapeute, clarté, friction UX, compréhension, pic émotionnel). Ce document retient l'**Option 1 Soft Launch** : les corrections les plus impactantes avant déploiement, sans repousser le lancement.

## Synthèse des scores

| Expert | Score |
|---|---|
| Produit | 6/10 |
| Rétention | 6/10 |
| Thérapeute | 5,5/10 |
| Clarté | 6,5/10 |
| Friction UX | 5/10 |
| Compréhension | 5/10 |
| Pic émotionnel | 6/10 |

**Moyenne : 5,7/10** — le rituel est solide, mais le produit surcharge l'utilisateur et monetise avant la preuve de valeur.

## Convergences critiques

1. **Paywall trop précoce** : `CouplePaywall` s'affiche dès l'existence du couple ; le jour 7 de l'onboarding est "Activer l'abo Premium".
2. **Surcharge cognitive** : `StatsColumn.tsx` affiche 8+ widgets dès le jour 1.
3. **Score de résonance numérique** : un pourcentage présenté comme métrique de santé relationnelle, sans garde-fou.
4. **Partenaire déshumanisé** : "Partenaire A/B", "Ton partenaire", "Vous" au lieu des prénoms.
5. **Archive paywallée** : les réponses déjà écrites par le couple sont floutées derrière Premium.
6. **Attente 20h rigide** : temps mort et anxiété quand les deux partenaires ont déjà répondu.
7. **Invite partenaire = impasse** : aucune expérience solo en attendant le partenaire.

## Scope : Option 1 Soft Launch

Seuls les fixes à fort impact / faible effort sont inclus. Les refontes profondes (météo relationnelle, introduction progressive complète) sont reportées en post-launch.

### 1. Alléger le dashboard jour 1

**Fichier** : `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx`  
**Changement** : conditionner l'affichage des modules secondaires dans `StatsColumn` à `currentDay >= 3` ou `dailyQuestions.filter(q => q.isRevealed).length >= 1`.

Jour 1-2, afficher uniquement :
- `TodayRitualCard`
- une carte contextuelle : invitation partenaire si couple incomplet, ou vitalité du totem si couple complet.

Masquer temporairement :
- Detox Challenge
- Weekly Recap
- Monthly Report Card
- Monthly Portrait
- Neural Tree Link
- Time Capsule Panel
- Timeline (Historique des Miroirs) — remplacer par un message "Votre histoire commence aujourd'hui".

### 2. Décaler le paywall

**Fichier** : `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx`  
**Changement** : n'afficher `CouplePaywall` que si :
- `dailyQuestions.filter(q => q.isRevealed).length >= 3`  
- OU `currentDay >= 7`

**Fichier** : `src/app/(distanciel)/couple/archive/_components/ArchiveClient.tsx`  
**Changement** : dans `getIsLocked`, autoriser l'accès gratuit aux questions des 14 derniers jours. Verrouiller uniquement les entrées plus anciennes lorsque le pass n'est pas actif.

### 3. Retirer le jour 7 Premium de l'onboarding

**Fichier** : `src/lib/couple/onboarding.ts`  
**Changement** : remplacer le jour 7 "Activer l'abo Premium" par "Valider notre premier rituel hebdomadaire".  
**Test** : mettre à jour `src/lib/couple/onboarding.test.ts`.

### 4. Propager les prénoms du couple

**Fichiers** :
- `src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts` — récupérer les noms des deux utilisateurs.
- `src/app/(distanciel)/couple/_components/TodayRitualCard.tsx` — remplacer "Vous" / `partnerName` par les prénoms.
- `src/components/couple/RevealCard.tsx` — remplacer "Vous" / "Votre partenaire".
- `src/components/couple/CouchMode.tsx` — remplacer "Partenaire A" / "Partenaire B".
- `src/components/couple/ProtocolWizard.tsx` — utiliser les prénoms.

### 5. Révélation anticipée optionnelle

**Fichier** : `src/app/(distanciel)/couple/_components/TodayRitualCard.tsx`  
**Changement** : quand `bothAnswered && !todayQuestion.isRevealed`, remplacer le simple compte à rebours par un CTA "Révéler maintenant" + indication "ou attendre 20h00".  
**Action** : `triggerReveal()` est déjà disponible.

### 6. Pré-rituel en mode solo

**Fichier** : `src/app/(distanciel)/couple/_components/OnboardingInvite.tsx`  
**Changement** : après génération du lien, proposer deux options :
- "Copier le lien" (existant)
- "Répondre à la première question en solo" — redirige vers `/couple?draft=true` ou affiche un mini-rituel temporaire.

L'objectif est d'éviter l'impasse émotionnelle pendant l'attente du partenaire.

## Non-scope (Option B post-launch)

- Remplacer le score numérique par une météo relationnelle qualitative.
- Ajouter un disclaimer IA/thérapeutique.
- Introduction progressive complète des modules avec tooltips.
- Relance douce au partenaire dans `SyncDropCountdown`.

## Critères de succès

- Dashboard jour 1 : ≤ 2 modules visibles.
- Paywall : affiché uniquement après 3 révélations ou J+7.
- Archive : 14 jours gratuits.
- Prénoms affichés dans `RevealCard`, `CouchMode`, `ProtocolWizard`.
- Jour 7 onboarding reformulé.
- Révélation anticipée fonctionnelle quand les deux ont répondu.

## Validation

- `npm run test -- --run` : tous les tests passent.
- `npm run build` : sans erreur.
- Vérification manuelle du dashboard jour 1 et du parcours invite.
