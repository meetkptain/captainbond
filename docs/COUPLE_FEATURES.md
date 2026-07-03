# Features Couple — Captain Bond (P1-P4)

Documentation technique des fonctionnalites couple premium.

## P1 — Rituel 20h Synchronise

### Objectif
Créer un moment quotidien synchronise ou le couple repond a une question profonde separement et decouvre les reponses simultanement a 20h.

### Composants

| Fichier | Role |
|---------|------|
| `src/app/api/cron/rituals/route.ts` | Generation des questions (11h30 UTC) |
| `src/app/api/cron/push-ritual-available/route.ts` | Push quand la question est dispo (11h UTC) |
| `src/app/api/cron/push-reveal-time/route.ts` | Push pour le reveal (19h UTC) |
| `src/services/pushNotificationService.ts` | Envoi push aux deux partenaires |
| `src/services/coupleRealtimeService.ts` | Broadcast Realtime pour synchronisation |
| `src/hooks/useCoupleRitualRealtime.ts` | Hook client Realtime |
| `src/components/couple/PartnerIndicator.tsx` | Indicateur temps reel de la reponse partenaire |
| `src/components/couple/PushConsentBanner.tsx` | Banniere de consentement push |
| `src/components/couple/SharedReveal.tsx` | Compte a rebours synchronise 3-2-1 |

### Flow

```
11h00 — Push notification : "Question disponible"
11h30 — Generation de la question par Gemini
       — L'utilisateur ouvre l'app et repond
20h00 — Push notification : "Heure de la revelation"
       — SharedReveal : compte a rebours 3-2-1
       — Les deux reponses apparaissent en simultane
```

### Feature flags
`COUPLE_SHARED_REVEAL` (default: false)

---

## P2 — Weekly AI Recap

### Objectif
Generer chaque dimanche un recaphebdo du couple (theme, summary, insight, lecon) via Gemini.

### Composants

| Fichier | Role |
|---------|------|
| `src/services/weeklyRecapService.ts` | Generation IA + requete DB |
| `src/lib/db/repositories/weeklyRecapRepository.ts` | CRUD WeeklyRecapData |
| `src/app/api/cron/weekly-recap/route.ts` | Cron dimanche 20h UTC |
| `src/app/api/couple/weekly-recap/route.ts` | API GET pour le client |
| `src/components/couple/WeeklyRecapAI.tsx` | UI du recap (carrousel) |

### Prompt Gemini
Le prompt utilise un role de "psychotherapeute de couple bienveillant" pour analyser les reponses de la semaine et generer :
- **theme** : Theme dominant (1-2 mots)
- **summary** : Resume des echanges (2-3 phrases)
- **insight** : Insight sur la dynamique du couple
- **lesson** : Lecon actionable pour la semaine

### Feature flags
`COUPLE_WEEKLY_RECAP` (default: false)

---

## P3 — Heatmap Confiance

### Objectif
Visualiser la sante de la relation selon 5 axes de confiance, avec tendance et conseils.

### Axes

| Axe | Couleur | Description |
|-----|---------|-------------|
| Vulnerabilite | Violet (#c084fc) | Capacite a se montrer fragile |
| Communication | Bleu (#60a5fa) | Fluidite de l'echange |
| Gestion du conflit | Rouge (#f87171) | Traverser les desaccords |
| Desir & Intimite | Rose (#f472b6) | Connexion intime |
| Projets communs | Vert (#34d399) | Vision commune du futur |

### Composants

| Fichier | Role |
|---------|------|
| `src/services/heatmapService.ts` | Calcul des scores par axe |
| `src/lib/db/repositories/heatmapRepository.ts` | CRUD heatmap + ThemeAxisMapping |
| `src/app/api/cron/heatmap/route.ts` | Cron lundi 2h UTC |
| `src/app/api/couple/heatmap/route.ts` | API GET pour le client |
| `src/components/couple/CoupleHeatmap.tsx` | Grille 5 colonnes |
| `src/components/couple/HeatmapDetail.tsx` | Detail d'un axe (score circulaire, tendance, conseil) |

### Score
- Calcule a partir de l'intensite des rituels (normalisee 0-1)
- Tendance : up / stable / down (comparaison avec le score precedent)

### Feature flags
`COUPLE_HEATMAP` (default: false)

---

## P4 — Arbre de Resonance Enhanced

### Objectif
Visualiser la progression mensuelle de l'arbre semantique du couple (noeuds, connexions, similarite, theme dominant).

### Composants

| Fichier | Role |
|---------|------|
| `src/services/treeProgressService.ts` | Calcul des stats mensuelles |
| `src/lib/db/repositories/treeProgressRepository.ts` | CRUD TreeProgress |
| `src/app/api/cron/tree-progress/route.ts` | Cron 1er du mois 2h UTC |
| `src/app/api/couple/tree-progress/route.ts` | API GET pour le client |
| `src/components/couple/TreeEvolution.tsx` | Stats + mini graphique evolution |

### Metriques
- **Node count** : Nombre de questions auxquelles le couple a repondu
- **Connection count** : Nombre de connexions de resonance entre les reponses
- **Avg similarity** : Similarite semantique moyenne entre les reponses
- **Dominant theme** : Theme le plus present dans l'arbre
- **Strongest link** : Lien de resonance le plus fort

### Feature flags
`COUPLE_TREE_PROGRESS` (default: false)
