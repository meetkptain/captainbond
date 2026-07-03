# Design — Couple ICP & SEO Acquisition

## Context
Captain Bond a déjà un espace couple (`/couple`) avec :
- daily question / révélation à 20h,
- Totem / Fusion, TimeCapsule, WeeklyRecap,
- Dossier Couple 4,99€ et abonnements.

Le but de ce design est de transformer ce flow en **moteur de croissance couple** : acquisition post-party, onboarding appairé, rétention quotidienne, monétisation par abonnement, et SEO long-tail pour capter des couples en amont de la soirée.

## Goal
- Augmenter le taux de conversion groupe → couple inscrit.
- Augmenter le taux de conversion couple → abonnement Premium annuel.
- Créer une habitude quotidienne (D1 / D7 / D30 retention).
- Générer du trafic organique via des articles de blog SEO ciblés.

## Non-goals
- Ne pas refondre l’architecture technique (Supabase, Stripe, Next.js restent).
- Ne pas créer une app native couple séparée.
- Ne pas changer le pricing des autres ICP (amis / B2B).

## ICP Couple affiné
- **Âge** : 25-40 ans.
- **Relation** : 1-10 ans, en couple cohabitant ou à distance.
- **Pain** : routine, manque de moments de qualité, envie de se (re)découvrir.
- **Trigger** : soirée entre amis avec Captain Bond + Dossier Couple, ou recherche Google (“questions couple”, “jeux couple”, “rituel couple”).
- **Valeur promise** : “5 minutes par jour pour ne pas se perdre dans le quotidien.”

## 1. Acquisition

### 1.1 Post-party upsell
- À la fin d’une room `DATE_NIGHT` ou `DEEP_CONNECTION`, proposer le Dossier Couple 4,99€.
- Dans le Dossier Couple déverrouillé, CTA secondaire : “Créer notre Espace Couple” (lien vers `/couple?invite=<userId>`).
- Si l’utilisateur n’a pas de compte, `AuthModal` puis redirection automatique vers le lien d’invitation.

### 1.2 Invitation partenaire
- Lien magique `/couple?invite=<userId>` + token signé (HMAC, TTL 7 jours).
- Preview du lien (OG image couple personnalisée ou générique) avec copy : “Viens créer notre espace privé sur Captain Bond.”
- Reward viral : quand le partenaire rejoint, les deux comptes débloquent 7 jours Premium.

### 1.3 Landing couple dédiée
- URL `/couple` (déjà existante) devient la landing principale.
- Hero : “5 minutes par jour. Un rituel pour deux.”
- Sections : daily question, révélation, Totem, archive, avis.
- CTA principal : “Créer notre espace”.
- Bilingue FR/EN dès le départ.

## 2. Onboarding 7 jours

Objectif : transformer l’inscription en habitude.

| Jour | Action |
|------|--------|
| J1 | Appairage, premier Miroir, choix d’un thème relationnel |
| J2 | Daily question légère + révélation |
| J3 | Daily question + micro-action rituelle |
| J4 | Découverte du Totem (pas de score, juste un état qualitatif) |
| J5 | TimeCapsule : sceller un message futur |
| J6 | Pack découverte “Communication” (freemium teaser) |
| J7 | Recap de la semaine + offre Premium annualisée |

- Notifications push/browser : 12h “Question du jour”, 20h “Révélation”, dimanche “Recap”.
- Skip possible à chaque étape (Safe Word / consentement).

## 3. Rétention

### 3.1 Daily Rituel
- Une question gratuite par jour (même modèle actuel).
- Thèmes rotatifs : communication, intimité, souvenirs, projets, humour.
- Réponses scellées jusqu’à 20h (déjà en place).

### 3.2 Archive & Journal
- Page `/couple/archive` : historique des réponses, filtres par mois/thème.
- “Moments forts” : les deux partenaires peuvent épingler une réponse ou ajouter une photo/note.
- Objectif : créer de la valeur à long terme qui justifie l’abonnement.

### 3.3 Roadmap relationnelle
- Remplacer le score numérique de résonance par des **parcours thématiques** de 7/14/30 jours.
- Exemples : “Reconnexion”, “Gérer un conflit”, “Projet commun”, “Intimité”.
- Chaque parcours = une séquence de questions + rituels + micro-actions.
- Premium : débloquer tous les parcours + archives illimitées.

### 3.4 Totem
- Garder le Totem comme signal “nous sommes en phase”.
- Remplacer les scores par des états qualitatifs : “En phase”, “En construction”, “Bulle à créer”.
- Ajouter un “rituel de fusion” hebdomadaire.

## 4. Monétisation

### 4.1 Freemium clair
- Gratuit : daily question, Totem basique, 1 parcours découverte.
- Premium : archive complète, tous les parcours, packs thématiques, insights hebdo, notifications avancées.

### 4.2 Pricing
- Un abonnement Premium = les deux partenaires (comme Paired).
- **Trial 7 jours** pour tout nouveau couple appairé.
- Après trial, **annual par défaut** : 39,99€/an (3,33€/mois).
- Option mensuelle secondaire : 7,99€/mois.

### 4.3 Paywall contextuel
- Déclencher le paywall quand le couple tente d’accéder à un parcours premium ou à l’archive ancienne.
- Ne pas bloquer la daily question gratuite derrière le paywall.

## 5. Confiance / sécurité
- Disclaimer visible : “Outil de réflexion ludique, pas diagnostic thérapeutique.”
- Safe Word / skip accessible partout.
- Pas de score global relationnel, seulement des tendances et prompts positifs.
- Données partenaire chiffrées en transit et au repos (déjà en place via Supabase).

## 6. SEO / Contenu

### 6.1 Objectif SEO
Capter les couples **avant** la soirée : recherches d’intention “question pour couple”, “jeu couple”, “rituel couple”, “comment renforcer son couple”.

### 6.2 Arborescence de contenu

#### Piliers (pillar pages)
1. `/blog/questions-pour-couple` — “150 questions pour couple : du fun au profond”
2. `/blog/jeux-couple` — “Les meilleurs jeux de couple pour se reconnecter”
3. `/blog/rituel-couple-quotidien` — “5 rituels de couple de 5 minutes pour ne pas sombrer dans la routine”
4. `/blog/communication-couple` — “Comment mieux communiquer en couple : guide pratique”

#### Clusters
- Sous chaque pilier, 4-6 articles long-tail :
  - “questions couple soirée”,
  - “questions couple intimes”,
  - “jeu couple soirée”,
  - “rituel couple avant de dormir”,
  - “comment relancer la conversation en couple”,
  - etc.

#### Format
- Articles 1 500-2 500 mots.
- Structure H2/H3, listes numérotées, citations expertes (thérapeute ou sexologue).
- CTA contextualisé vers `/couple` ou `/couple?topic=<theme>`.
- OG images, canonical, hreflang FR/EN.

### 6.3 Outils / données
- Cibler les mots-clés avec Search Console + Ubersuggest/Ahrefs (manuel).
- Programme éditorial : 1 article pilier + 2 articles cluster par mois.

## 7. Métriques

| Métrique | Cible initiale |
|----------|---------------|
| Taux d’invitation partenaire acceptée | > 60% |
| D1 retention | > 40% |
| D7 retention | > 25% |
| D30 retention | > 15% |
| Trial → Premium annual | > 20% |
| Trafic organique blog | +30% / mois |

## 8. Phases d’implémentation suggérées

1. **Fondations** : onboarding 7 jours, invitation reward, archive basique.
2. **Monétisation** : trial 7 jours, paywall contextuel, annual default.
3. **Rétention** : parcours thématiques, notifications, journal.
4. **SEO** : 4 piliers + 8 articles cluster, programme éditorial.
5. **Itération** : A/B copy pricing, nouveaux parcours, partenariats experts.

## Risques
- **Scope creep** : le SEO et les parcours peuvent s’étaler. Garder le MVP concentré sur onboarding + trial + 1 pilier SEO.
- **Anxiété couple** : bien maintenir le framing positif et ludique.
- **Cannibalisation** : s’assurer que le Pass 24h groupe ne promet plus “tous les profils” dans la communication couple.

## Decision log
- **Annual default** : Paired et CoupleJoy poussent l’annual car c’est le LTV maximal.
- **Un abo = 2 comptes** : standard du marché, réduit la friction.
- **Freemium daily question** : maintient l’habitude et réduit le churn avant conversion.
- **SEO avant publicité** : les requêtes couple sont peu compétitives et alignées avec la valeur du produit.
