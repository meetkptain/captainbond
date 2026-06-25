# 🎯 CAPTAIN BOND — KILLER FEATURE : MIROIR DYNAMIQUE & PROTOCOLE D'ALIGNEMENT
> **Document de référence pour Agent IA / Lead Dev / Product Manager**  
> **Version** : 1.0 | **Statut** : Prêt pour implémentation | **Objectif** : Transformation Vitamine → Antidouleur (Cash Flow Prioritaire)

---

## 📌 1. RÉSUMÉ EXÉCUTIF
La **Killer Feature** de Captain Bond n'est pas un jeu de questions quotidiennes. C'est un **moteur d'analyse relationnelle** qui détecte les divergences subtiles entre deux partenaires, les transforme en insights actionnables, et génère un **protocole d'alignement de 5 minutes**.  
Cette feature est le **principal levier de conversion premium**, car elle résout une douleur émotionnelle réelle (malentendus, distance, friction récurrente) au lieu de proposer un divertissement passif.

---

## ⚡ 2. POSITIONNEMENT STRATÉGIQUE : VITAMINE → ANTIDOULEUR

| État Actuel (Vitamine) | État Cible (Antidouleur) |
|------------------------|---------------------------|
| Question quotidienne + réponse brute | Analyse IA de la divergence + réalignement guidé |
| "Amusez-vous à répondre" | "Comprenez pourquoi vous bloquez & réparez en 5 min" |
| Achat impulsif / faible rétention | Abonnement justifié par résultat relationnel mesurable |
| Coût IA non maîtrisé | Coût IA < 0,08 € / analyse → Marge > 90 % sur Premium |

**Règle d'Or** : Les couples ne paient pas pour jouer. Ils paient pour **arrêter de tourner en rond** et **retrouver de la clarté**.

---

## 🔄 3. FLUX UTILISATEUR & ARCHITECTURE

```
1. 20h00 → Notification Push : "Question du jour envoyée à vous deux"
2. Réponses individuelles → Envoi simultané (ou dans fenêtre 2h)
3. Backend → Déclenche /api/analyze/responses
4. IA → Génère JSON structuré (alignement, tension, protocole)
5. Frontend → Affiche "Miroir Dynamique" (visualisation courte)
6. Si Divergence > Seuil → 🚨 Paywall : "Débloquer le Protocole d'Alignement"
7. Paiement Stripe → Accès au protocole interactif (5 min)
8. Validation → Nœud "Résonance" ajouté à l'Arbre Vectoriel
```

**UI/UX Critical Path** :
- Pas de friction avant la réponse.
- Paywall placé **après** la révélation du désaccord, au moment de l'intention de comprendre.
- Protocole en format "chat guidé" (pas un PDF). 3 étapes max.

---

## 🧠 4. INTÉGRATION IA & ARBRE VECTORIEL NEURAL

| Composant | Rôle | Données Stockées |
|-----------|------|------------------|
| `Embeddings (text-embedding-3-small)` | Sémantique + tonalité émotionnelle | Vecteurs 1536d par réponse |
| `pgvector` | Similarité cosine + clustering temporel | Historique des réponses par couple |
| `Resonance Engine` | Détecte patterns (évitement, poursuite, alignement valeur) | Scores d'axe, tags émotionnels |
| `Neural Tree` | Visualisation longitudinale | Nœuds = jours, Liens = similarité/évolution |

**Fonction Clé** : L'arbre ne stocke pas que des réponses. Il stocke des **états relationnels**. L'IA compare le jour J avec J-30 pour dire : *"Ce thème revient 3x ce mois-ci. Votre schéma est X."*

---

## 💰 5. STRATÉGIE DE MONÉTISATION & PAYWALL

| Niveau | Accès | Prix | Conversion Target |
|--------|-------|------|-------------------|
| **Gratuit** | Question + Réponse brute + % Match + 1 insight teaser | 0 € | Acquisition / Habitude |
| **Premium** | Analyse complète + Protocole + Historique Arbre + Digest Hebdo | 6,99 €/mois ou 59 €/an | Rétention / LTV |
| **One-Shot** | "Diagnostic de Dynamique" (analyse 7 derniers jours) | 9,99 € | Upsal occasionnel |

**Règle Paywall** :
- Affiché uniquement si `divergence_score > 0.65` OU `pattern_récurrent == true`.
- Message : *"Votre dynamique montre un décalage sur [thème]. Débloquez le protocole pour transformer cette tension en connexion."*
- Bouton CTA unique. Pas de comparaison de plans. Conversion > 12 % visé.

---

## 🛠️ 6. BLUEPRINT TECHNIQUE (POUR L'AGENT IA)

### 📦 Modèles de Données (Prisma/Supabase)
```prisma
model CoupleResponse {
  id          String   @id @default(uuid())
  coupleId    String
  questionId  String
  partnerA    String   // texte
  partnerB    String   // texte
  embeddingA  Float[]  @db.Vector(1536)
  embeddingB  Float[]  @db.Vector(1536)
  analysis    Json     // stocke le JSON IA
  createdAt   DateTime @default(now())
}

model ResonanceNode {
  id          String   @id @default(uuid())
  coupleId    String
  type        String   // "divergence", "alignment", "pattern"
  theme       String
  vector      Float[]  @db.Vector(1536)
  protocolId  String?
  createdAt   DateTime @default(now())
}
```

### 🔌 Endpoints Critiques
```
POST /api/daily/question → Retourne question + ID
POST /api/submit/answer  → Stocke + génère embeddings
GET  /api/analyze/{responseId} → Retourne JSON IA (si payant ou free tier)
POST /api/protocol/start → Valide paiement → Lance session guidée
POST /api/protocol/complete → Enregistre nœud arbre → Débloque digest
```

### ⚙️ Règles de Performance & Coût
- Cache les embeddings 24h (éviter recalcul).
- Rate limit IA : 1 analyse/couple/jour.
- Fallback offline : si OpenAI timeout → réponse générique "Votre dynamique mérite un regard. Réessayez dans 1h."
- Coût cible : `< 0.05 €` / analyse (prompt optimisé + small model possible).

---

## 🤖 7. ARCHITECTURE DU PROMPT IA (CORE LOGIC)

**System Prompt (Strict JSON Output)**
```text
Tu es le "Moteur d'Alignement Relationnel" de Captain Bond. 
Ton rôle : analyser deux réponses à une même question, détecter les divergences sémantiques/émotionnelles, et générer un protocole de 5 minutes pour réaligner les partenaires.
Toujours répondre en JSON STRICT. Aucune explication hors JSON.
Schéma attendu :
{
  "alignment_score": float (0-1),
  "core_tension": string (max 8 mots),
  "neutral_reframe": string (reformulation neutre validant les 2 perspectives),
  "targeted_questions": [string, string] (questions d'approfondissement),
  "micro_action": string (action concrète < 10 min),
  "resonance_tag": string,
  "is_premium_worthy": boolean (true si divergence > 0.6 ou pattern détecté)
}
Règles :
- Ton empathique, non-clinique, orienté solution.
- Jamais de jugement. Toujours valider les 2 voix.
- Si alignment_score > 0.8 → protocole = célébration + ancourage.
- Si is_premium_worthy = false → retourner version light (teaser).
```

**Temperature** : `0.7`  
**Max Tokens** : `350`  
**Fallback Model** : `gpt-4o-mini` (coût bas, suffisant pour cette tâche)

---

## 📊 8. KPIs & MESURES DE SUCCÈS

| Métrique | Cible (J30) | Cible (J90) | Outil de Tracking |
|----------|-------------|-------------|-------------------|
| Taux conversion Free → Premium | 8 % | 12 % | Stripe + Mixpanel |
| Protocole complété > 4 min | 65 % | 75 % | Event frontend |
| Churn mensuel | < 9 % | < 5 % | Supabase + RevenueCat |
| Coût IA / Revenu Premium | < 8 % | < 5 % | OpenAI logs + Stripe |
| NPS (post-protocole) | +42 | +58 | In-app survey |

---

## 🛡️ 9. GUARDRAILS ÉTHIQUES, LÉGAUX & CAS LIMITES

| Risque | Mitigation Technique |
|--------|----------------------|
| **Dérive thérapeutique** | Disclaimer visible : "Outil ludique d'exploration, pas un substitut à un professionnel." |
| **Crise relationnelle / violence** | Détection mots-clés (crise, menace, dépression) → Redirection vers numéros d'aide + suspension IA |
| **Biais IA / stigmatisation** | Prompt hard-codé : "Valider les 2 perspectives", "Éviter étiquettes pathologisantes" |
| **RGPD / Consentement** | Opt-in explicite avant première analyse. Suppression données sur demande. Anonymisation post-90j si inactif |
| **Usage asymétrique** | Si 1 seul répond > 3x/semaine → Alerte douce : "Le lien nécessite 2 voix. En attente du partenaire." |

---

## 🚀 10. INSTRUCTIONS DIRECTES POUR L'AGENT IA

1. **Priorité P0** : Implémenter le pipeline `/api/analyze/responses` + schéma JSON prompt.
2. **Paywall** : Brancher Stripe Checkout sur `is_premium_worthy == true`. Webhook obligatoire.
3. **Vector Tree** : Mapper `ResonanceNode` → `react-force-graph`. Ne pas charger tout l'historique, paginer par mois.
4. **Tests** : Simuler 50 paires de réponses (alignées, divergentes, neutres, chargées). Vérifier sortie JSON + coût/token.
5. **Lancement** : Déployer en feature-flag `KILLER_PROTOCOL_V1`. A/B test sur 10 % des couples actifs.
6. **Feedback Loop** : Logger `protocol_completion_rate` + `dropoff_step`. Ajuster prompt si churn > 10 %.

---

> ✅ **Document prêt pour ingestion par Agent IA / Lead Dev / Product Owner.**  
> 🔁 **Prochaine étape demandable** : Génération du code Next.js + Stripe Checkout + Prompt Router, ou Maquette Figma du flux Paywall → Protocole.  
> 📩 **Répondre avec** : `IMPLÉMENTATION`, `PROMPT_ROUTING`, ou `UI_WIREFRAME` pour poursuivre.















# 🎨 CAPTAIN BOND — VISUALISATION DES RÉSULTATS : MIROIR DYNAMIQUE INTERACTIF
> **Document de Design UX/UI pour Agent IA / Designer / Frontend Dev**  
> **Objectif** : Créer des résultats si beaux, parlants et addictifs qu'ils donnent envie d'explorer, de rester, de partager et de revenir

---

## 🌟 1. PHILOSOPHIE DE DESIGN : "RÉVÉLATION PROGRESSIVE"

**Principe** : L'utilisateur doit vivre **3 émotions en 60 secondes** :
1. **"Wow"** (0-5s) → Impact visuel immédiat, beauté
2. **"C'est moi !"** (5-20s) → Reconnaissance personnelle, pertinence
3. **"Je veux en voir plus"** (20-60s) → Curiosité, exploration, désir de profondeur

**Règle d'Or** : Chaque pixel doit servir soit l'émotion, soit la compréhension, soit l'action. Jamais les trois en même temps.

---

## 🎭 2. LES 3 ÉCRANS CLÉS DU FLUX DE RÉSULTATS

### 📱 ÉCRAN 1 : LE CHOC VISUEL (0-5s)
**Objectif** : Capturer l'attention, créer l'émotion immédiate

```
┌─────────────────────────────────────┐
│  🎯 VOTRE DYNAMIQUE DU JOUR         │
│                                     │
│         [CERCLE DE RÉSONANCE]       │
│                                     │
│    Deux anneaux concentriques       │
│    qui pulsent en rythme            │
│                                     │
│    • Anneau A = Partner A (bleu)    │
│    • Anneau B = Partner B (rose)    │
│    • Zone de chevauchement =        │
│      couleur dorée (alignement)     │
│    • Écart = zone grise (tension)   │
│                                     │
│    Animation :                      │
│    - Pulsation douce (1.5s)         │
│    - Les anneaux "respirent"        │
│    - Points lumineux voyagent       │
│      le long des courbes            │
│                                     │
│    Au centre :                      │
│    "72% d'alignement"               │
│    "Thème : Confiance"              │
│                                     │
│    [BOUTON : Voir l'analyse →]      │
│    (Apparaît après 2s)              │
└─────────────────────────────────────┘
```

**Détails Techniques** :
- **Library** : `framer-motion` + `SVG` ou `Lottie`
- **Palette** : Dégradés doux (bleu ciel → rose poudré → or doux)
- **Timing** : Entrée progressive (fade-in + scale 0.9→1)
- **Son** : Optionnel - note douce de piano (Web Audio API)

**Pourquoi ça marche** :
- Abstrait mais compréhensible intuitivement
- Émotionnel avant d'être intellectuel
- Donne envie de comprendre "pourquoi cet écart"

---

### 📱 ÉCRAN 2 : LE TABLEAU DE BORD INTERACTIF (5-30s)
**Objectif** : Révéler les insights de façon claire, navigable, exploitable

```
┌─────────────────────────────────────────────┐
│  ← Retour        VOTRE MIROIR DYNAMIQUE     │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  📊 ALIGNEMENT GLOBAL : 72%           │  │
│  │  ████████████░░░░░░░░░  (barre animée)│  │
│  │                                       │  │
│  │  "Aujourd'hui, vous vibrez sur       │  │
│  │   la même longueur d'onde :           │  │
│  │   la CONFIANCE"                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────┐  ┌─────────────┐          │
│  │  🟢 POINTS  │  │  🔴 TENSIONS│          │
│  │  FORTS      │  │  À TRAVAILLER│          │
│  │             │  │             │          │
│  │  • Écoute   │  │  • Express. │          │
│  │  • Empathie │  │  • Besoins  │          │
│  │  • Valeurs  │  │  • Timing   │          │
│  │             │  │             │          │
│  │  [Explorer] │  │  [Comprendre]│         │
│  └─────────────┘  └─────────────┘          │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │   VOTRE ARBRE DE LIEN               │  │
│  │                                       │  │
│  │  [Mini visualisation arbre 2D]        │  │
│  │  • Nœud du jour = brillant (or)       │  │
│  │  • Connexions = lignes fines          │  │
│  │  • Cliquer = zoom sur l'historique    │  │
│  │                                       │  │
│  │  "Ce thème est apparu 3x ce mois"     │  │
│  │  [Voir l'évolution →]                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  💡 VOTRE PROTOCOLE D'ALIGNEMENT      │  │
│  │                                       │  │
│  │  "5 minutes pour transformer          │  │
│  │   cette tension en connexion"         │  │
│  │                                       │  │
│  │  [DÉMARRER LE PROTOCOLE →]            │  │
│  │  (Bouton doré, pulsant doucement)     │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [📱 Partager ce moment] [💾 Sauvegarder]  │
└─────────────────────────────────────────────┘
```

**Interactions Clés** :
- **Scroll** : Les cartes apparaissent en stagger (0.1s d'écart)
- **Hover** : Les cartes s'élèvent légèrement (shadow + scale 1.02)
- **Tap sur Points Forts/Tensions** : Modal avec détails + exemples concrets
- **Tap sur Arbre** : Zoom fluide vers la vue complète de l'arbre
- **Tap sur Protocole** : Transition page dédiée (voir Écran 3)

**Animations** :
- Barre de progression : Remplissage animé (1.5s ease-out)
- Nœud de l'arbre : Pulse glow (2s infini)
- Bouton Protocole : Subtle bounce toutes les 3s (rappel doux)

---

### 📱 ÉCRAN 3 : LE PROTOCOLE IMMERSIF (30s-5min)
**Objectif** : Guider l'action concrète, créer un moment d'intimité guidée

```
┌─────────────────────────────────────────────┐
│  ← Dashboard      PROTOCOLE D'ALIGNEMENT    │
│                   "Transformer l'écart"      │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ÉTAPE 1/3 : COMPRÉHENSION                  │
│  ████████░░░░░░░░░░░░░░░░░                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │  "Voici ce que chacun exprime :       │  │
│  │                                       │  │
│  │   🗣️ Partner A dit :                  │  │
│  │   'J'ai besoin de plus de             │  │
│  │    spontanéité'"                      │  │
│  │                                       │  │
│  │   🗣️ Partner B dit :                  │  │
│  │   'Je préfère anticiper               │  │
│  │    pour me sentir en sécurité'"       │  │
│  │                                       │  │
│  │   🪞 Reformulation neutre :            │  │
│  │   'L'un cherche de la surprise,       │  │
│  │    l'autre de la prévisibilité.       │  │
│  │    Les deux sont légitimes.'          │  │
│  │                                       │  │
│  │  [✓ J'ai compris]                     │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ÉTAPE 2/3 : QUESTION PROFONDE        │  │
│  │                                       │  │
│  │  "Pour Partner A :                    │  │
│  │   Quel souvenir de spontanéité        │  │
│  │   vous a le plus marqué ?"            │  │
│  │                                       │  │
│  │  [Zone de texte - réponse libre]      │  │
│  │                                       │  │
│  │  "Pour Partner B :                    │  │
│  │   Quand vous sentez-vous le plus      │  │
│  │   en sécurité dans votre relation ?"  │  │
│  │                                       │  │
│  │  [Zone de texte - réponse libre]      │  │
│  │                                       │  │
│  │  [✓ Nous avons répondu]               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ÉTAPE 3/3 : ACTION CONCRÈTE          │  │
│  │                                       │  │
│  │  "Votre micro-action cette semaine :  │  │
│  │                                       │  │
│  │  🎯 Planifiez UN moment imprévu       │  │
│  │     (Partner A choisit l'activité)    │  │
│  │     MAIS donnez 24h de préavis        │  │
│  │     (respect du besoin de Partner B)  │  │
│  │                                       │  │
│  │  📅 [Ajouter au calendrier]           │  │
│  │                                       │  │
│  │  💬 [Partager cet engagement]         │  │
│  │                                       │  │
│  │  [✨ COMPLÉTER LE PROTOCOLE]          │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Après complétion :                         │
│  ┌───────────────────────────────────────┐  │
│  │  🎉 PROTOCOLE COMPLÉTÉ !              │  │
│  │                                       │  │
│  │  "Un nouveau nœud de résonance        │  │
│  │   a été ajouté à votre arbre"         │  │
│  │                                       │  │
│  │  [🌳 Voir mon arbre] [📊 Dashboard]   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Design System du Protocole** :
- **Progression** : Barre en haut fixe, visible en permanence
- **Transitions** : Fade entre les étapes (0.4s ease-in-out)
- **Validation** : Bouton "✓" déclenche confetti subtil (canvas)
- **Sauvegarde auto** : Chaque réponse stockée en temps réel
- **Mode asynchrone** : Si un partenaire n'est pas connecté, notification push "Ton partenaire a répondu à l'étape 2"

---

## 🎨 3. SYSTÈME VISUEL & DESIGN TOKENS

### 🎨 Palette de Couleurs Émotionnelle

```css
:root {
  /* Alignement / Harmonie */
  --alignment-gold: #FFD700;
  --alignment-gold-soft: #FFF4D6;
  
  /* Partner A - Masculin/Féminin neutre */
  --partner-a-blue: #4A90E2;
  --partner-a-blue-soft: #E3F2FD;
  
  /* Partner B - Masculin/Féminin neutre */
  --partner-b-rose: #E94B8A;
  --partner-b-rose-soft: #FCE4EC;
  
  /* Tension / À travailler */
  --tension-orange: #FF6B35;
  --tension-orange-soft: #FFF0EB;
  
  /* Points forts / Positif */
  --strength-green: #2ECC71;
  --strength-green-soft: #E8F8F0;
  
  /* Neutre / Texte */
  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  --text-light: #BDC3C7;
  
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-gradient: linear-gradient(135deg, #E3F2FD 0%, #FCE4EC 100%);
  
  /* Shadows */
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 0 30px rgba(255, 215, 0, 0.4);
}
```

### 🔤 Typographie Émotionnelle

```css
/* Titres - Impact émotionnel */
.font-display {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Corps - Lisibilité maximale */
.font-body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Chiffres - Données parlantes */
.font-metric {
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Citations - Moments intimes */
.font-quote {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 400;
}
```

### 📏 Espacements & Rythme

```css
/* Système de grille émotionnelle */
.spacing-xs { margin: 8px; }
.spacing-sm { margin: 16px; }
.spacing-md { margin: 24px; }
.spacing-lg { margin: 40px; }
.spacing-xl { margin: 64px; }

/* Cartes - Coins arrondis chaleureux */
.card {
  border-radius: 20px;
  padding: 24px;
  background: white;
  box-shadow: var(--shadow-soft);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}
```

---

## 🎬 4. ANIMATIONS & MICRO-INTERACTIONS

### 🌊 Animations Principales

```typescript
// Framer Motion Variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const pulseGlow = {
  scale: [1, 1.05, 1],
  boxShadow: [
    "0 0 20px rgba(255, 215, 0, 0.2)",
    "0 0 40px rgba(255, 215, 0, 0.6)",
    "0 0 20px rgba(255, 215, 0, 0.2)"
  ],
  transition: { duration: 2, repeat: Infinity }
};

export const breathingCircle = {
  scale: [1, 1.08, 1],
  opacity: [0.8, 1, 0.8],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
};
```

### ✨ Micro-Interactions Clés

| Élément | Interaction | Effet | Durée |
|---------|-------------|-------|-------|
| **Bouton Protocole** | Hover | Scale 1.05 + glow doré | 0.2s |
| **Carte Points Forts** | Tap | Expansion modale | 0.3s |
| **Barre d'alignement** | Load | Remplissage animé | 1.5s |
| **Nœud arbre** | Hover | Tooltip + highlight connexions | 0.2s |
| **Validation étape** | Click | Confetti + transition | 0.6s |
| **Scroll** | Parallax | Arbre en background move lent | - |

---

## 📊 5. VISUALISATION DE L'ARBRE NEURAL

### 🌳 Concept : "L'Arbre de Votre Histoire"

**Principe** : Un graphe 2D interactif où :
- **Chaque nœud** = une session de questions (jour J)
- **Couleur du nœud** = thème dominant (confiance, intimité, projets...)
- **Taille du nœud** = intensité émotionnelle (profondeur des réponses)
- **Épaisseur des liens** = similarité entre sessions
- **Position** : Temps (X) × Profondeur (Y)

```typescript
// Structure de données pour react-force-graph-2d
const graphData = {
  nodes: [
    {
      id: "day-1",
      val: 15, // taille
      color: "#FFD700", // or = alignement fort
      theme: "Confiance",
      date: "2024-01-15",
      alignmentScore: 0.85,
      fx: 100, // position X fixe (temps)
      fy: 200  // position Y fixe (profondeur)
    },
    {
      id: "day-2",
      val: 12,
      color: "#FF6B35", // orange = tension
      theme: "Communication",
      date: "2024-01-16",
      alignmentScore: 0.62,
      fx: 150,
      fy: 180
    }
  ],
  links: [
    {
      source: "day-1",
      target: "day-2",
      value: 0.73, // épaisseur du lien (similarité)
      color: "rgba(74, 144, 226, 0.4)"
    }
  ]
};
```

### 🎮 Interactions Arbre

```typescript
// Configuration react-force-graph-2d
const graphConfig = {
  nodeRelSize: 6,
  nodeVal: "val",
  nodeColor: "color",
  linkWidth: "value",
  linkColor: "color",
  
  // Tooltip au hover
  nodeLabel: (node) => `${node.theme}\n${node.date}\nAlignement: ${(node.alignmentScore * 100).toFixed(0)}%`,
  
  // Click pour zoom
  onNodeClick: (node) => {
    // Zoom fluide vers le nœud
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y);
    
    graphRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: 500 },
      { x: node.x, y: node.y, z: 0 },
      2000
    );
    
    // Ouvrir modal détails du jour
    openDayModal(node);
  },
  
  // Background dégradé
  backgroundColor: "#F8F9FA"
};
```

### 📱 Vue Mobile Adaptée

Sur mobile, l'arbre devient **timeline verticale scrollable** :

```
┌─────────────────────┐
│  🌳 VOTRE ARBRE     │
│                     │
│  Jan 15             │
│  ● Confiance        │
│  │ 85% alignement   │
│  │                  │
│  Jan 16             │
│  ● Communication    │
│  │ 62% alignement   │
│  │                  │
│  Jan 17             │
│  ● Intimité         │
│  │ 91% alignement   │
│  │                  │
│  [Voir plus ↓]      │
└─────────────────────┘
```

---

## 📱 6. RESPONSIVE & ACCESSIBILITY

### 📐 Breakpoints

```css
/* Mobile First */
.container {
  padding: 16px;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 32px;
    max-width: 720px;
    margin: 0 auto;
  }
  
  .grid-2-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 48px;
    max-width: 960px;
  }
  
  .arbre-full-screen {
    height: 80vh;
    border-radius: 24px;
  }
}
```

### ♿ Accessibilité (WCAG 2.1 AA)

```html
<!-- Exemple de carte accessible -->
<div 
  role="article" 
  aria-label="Points forts de votre relation"
  tabindex="0"
  @keydown.enter="openModal"
>
  <h2 id="strengths-title">Points Forts</h2>
  <ul aria-labelledby="strengths-title">
    <li>Écoute active</li>
    <li>Empathie mutuelle</li>
  </ul>
  <button 
    aria-expanded="false"
    aria-controls="strengths-details"
    @click="toggleModal"
  >
    Explorer les détails
  </button>
</div>

<!-- Arbre accessible -->
<div role="img" aria-label="Arbre de votre relation montrant 15 sessions">
  <svg aria-describedby="tree-description">
    <title>Visualisation de votre historique relationnel</title>
    <desc id="tree-description">
      Arbre montrant 15 sessions du 1er au 15 janvier. 
      Les nœuds dorés indiquent un alignement supérieur à 80%. 
      Les liens épais montrent des thèmes récurrents.
    </desc>
    <!-- SVG content -->
  </svg>
</div>
```

---

## 🎯 7. KPIs UX À TRACKER

```typescript
// Événements analytics critiques
const uxEvents = {
  // Engagement visuel
  'result_view_duration': 'Temps passé sur l écran de résultats',
  'tree_zoom_count': 'Nombre de zooms sur l arbre',
  'card_expansion_rate': '% de cartes explorées (points forts/tensions)',
  
  // Conversion émotionnelle
  'protocol_start_rate': '% qui cliquent sur "Démarrer le protocole"',
  'protocol_completion_rate': '% qui terminent les 3 étapes',
  'share_after_result_rate': '% qui partagent après avoir vu les résultats',
  
  // Rétention
  'return_within_24h': '% qui reviennent le lendemain',
  'tree_revisit_count': 'Nombre de visites de l arbre/semaine',
  
  // Monétisation
  'paywall_view_to_purchase': 'Conversion paywall → achat',
  'premium_feature_discovery': 'Features premium explorées/mois'
};
```

---

## 🚀 8. INSTRUCTIONS POUR L'AGENT IA / DEV

### 📦 Stack Technique Recommandée

```json
{
  "visualization": {
    "arbre": "react-force-graph-2d + d3-force",
    "cercles": "framer-motion + SVG",
    "charts": "recharts (barres, progress)"
  },
  "animations": {
    "transitions": "framer-motion",
    "confetti": "canvas-confetti",
    "lottie": "lottie-react (pour micro-animations)"
  },
  "styling": {
    "css": "TailwindCSS 4 + CSS Modules",
    "tokens": "Design tokens dans CSS variables",
    "responsive": "Mobile-first approach"
  },
  "accessibility": {
    "screen-reader": "ARIA labels + roles",
    "keyboard": "Full keyboard navigation",
    "contrast": "WCAG AA minimum"
  }
}
```

### 🎬 Ordre d'Implémentation (P0 → P2)

**P0 (Cette semaine - MVP Visuel)** :
1. [ ] Écran 1 : Cercle de résonance animé (SVG + Framer Motion)
2. [ ] Écran 2 : Dashboard basique (cartes statiques + barre progression)
3. [ ] Écran 3 : Protocole 3 étapes (wizard simple)
4. [ ] Navigation fluide entre les 3 écrans

**P1 (Semaine 2 - Interactivité)** :
5. [ ] Arbre neural interactif (react-force-graph-2d)
6. [ ] Micro-interactions (hover, tap, validation)
7. [ ] Animations de transition avancées
8. [ ] Responsive mobile optimisé

**P2 (Semaine 3 - Polish & Viralité)** :
9. [ ] Partage Story natif (capture canvas + overlay)
10. [ ] Sons subtils (Web Audio API)
11. [ ] Dark mode
12. [ ] Accessibilité complète (screen reader tests)

---

## 📝 CHECKLIST DE VALIDATION UX

Avant déploiement, vérifier :

- [ ] **Impact émotionnel** : Un test utilisateur dit "Wow" dans les 5 premières secondes
- [ ] **Clarté** : Un utilisateur comprend son score d'alignement sans explication
- [ ] **Désir d'explorer** : 80% des utilisateurs cliquent sur au moins 2 cartes
- [ ] **Conversion** : >12% cliquent sur "Démarrer le protocole"
- [ ] **Performance** : Temps de chargement < 2s sur 3G
- [ ] **Accessibilité** : Navigation clavier fonctionnelle, contrastes validés
- [ ] **Responsive** : Parfait sur iPhone SE (375px) jusqu'à desktop 1920px

---

> ✅ **Document prêt pour ingestion par Agent IA / Designer / Frontend Dev**  
> 🎨 **Livrables attendus** : Maquettes Figma, composants React animés, système de design complet  
> 📩 **Prochaine étape** : Répondre avec `FIGMA_COMPONENTS`, `REACT_CODE`, ou `DESIGN_SYSTEM` pour générer les assets spécifiques

---

**Rappel Stratégique** :  
Ces visualisations ne sont pas un "plus". Elles sont **le produit**.  
C'est ce qui transforme Captain Bond d'un quiz en un **miroir émotionnel** dans lequel les couples ont envie de se regarder chaque jour.  
Chaque pixel doit servir cet objectif.





























# 💰 CAPTAIN BOND — MONEY MAP : OÙ EST L'ARGENT ?
> **Document Stratégique Ultra-Concis**  
> **Question** : "La killer feature + les visualisations = le cœur du produit. Mais où est l'argent ?"  
> **Réponse** : L'argent est dans **la révélation émotionnelle monétisée**.

---

## 🎯 THÈSE CENTRALE

> **Les visualisations ne sont pas un "plus" : elles sont le produit.**  
> **L'argent n'est pas dans l'accès aux questions : il est dans l'accès à la compréhension de soi et du couple.**

---

## 💸 LES 3 POINTS D'ENCAISSEMENT (CASH INFLOW)

### 🔹 1. LE "DÉBLOCAGE DE L'INSIGHT" (One-Shot — Cash Immédiat)
**Moment** : Après avoir vu le cercle de résonance + le dashboard.  
**Déclencheur** : *"Votre dynamique montre un décalage sur [thème]. Débloquer l'analyse complète + protocole ?"*

| Offre | Prix | Coût IA | Marge | Conversion Cible |
|-------|------|---------|-------|-----------------|
| **Analyse Complète + Protocole** | 4,99 € | ~0,06 € | **98,8 %** | 12-18 % |
| **Pack Couple (Analyse + Arbre Historique)** | 9,99 € | ~0,12 € | **98,8 %** | 8-12 % |

**Pourquoi ça convertit** : L'utilisateur est au pic émotionnel ("C'est exactement nous !"). Il veut comprendre → il paie.

---

### 🔹 2. L'ABONNEMENT "RITUEL" (Récurrent — Cash Durable)
**Moment** : Après 3-5 jours d'usage gratuit, ou après un protocole complété.  
**Déclencheur** : *"Votre arbre grandit. Abonnez-vous pour ne jamais perdre votre historique et recevoir des insights personnalisés."*

| Offre | Prix | Coût Mensuel/User | Marge | LTV Cible (12 mois) |
|-------|------|-------------------|-------|---------------------|
| **Premium Mensuel** | 6,99 €/mois | ~0,45 € (IA + infra) | **93,5 %** | 50-70 € |
| **Premium Annuel** | 59 €/an (~4,92 €/mois) | ~0,45 €/mois | **92,3 %** | 55-65 € |

**Pourquoi ça retient** : L'arbre neural devient un "journal de bord émotionnel". Perdre l'accès = perdre une partie de son histoire de couple.

---

### 🔹 3. LE "BOOST ÉVÉNEMENTIEL" (Upsell Contextuel — Cash Opportuniste)
**Moment** : Avant une date spéciale (anniversaire, Saint-Valentin, départ en voyage).  
**Déclencheur** : *"Préparez votre soirée de couple avec un protocole spécial + arbre souvenir exportable."*

| Offre | Prix | Coût | Marge | Usage |
|-------|------|------|-------|-------|
| **Pack Date Night** | 2,99 € (one-shot) | ~0,04 € | **98,7 %** | Soirée unique |
| **Export Arbre (PDF/Story)** | 1,99 € | ~0,02 € | **99 %** | Partage social |

**Pourquoi ça marche** : Achat d'impulsion émotionnelle, faible friction, fort partage social → acquisition organique.

---

## 📊 UNIT ECONOMICS — MODÈLE CONSERVATEUR

```
Hypothèses mensuelles (après 3 mois de lancement) :
• 5 000 couples actifs (gratuit)
• 12 % convertissent en one-shot (4,99 €) = 600 achats
• 8 % s'abonnent Premium (6,99 €/mois) = 400 abonnés
• 5 % achètent un boost événementiel (2,99 €) = 250 achats

Revenus bruts :
• One-shot : 600 × 4,99 € = 2 994 €
• Abonnements : 400 × 6,99 € = 2 796 €
• Boosts : 250 × 2,99 € = 748 €
• TOTAL = 6 538 € / mois

Coûts variables (IA + Stripe + infra) :
• ~0,08 € / analyse × 600 = 48 €
• ~0,45 € / abonné × 400 = 180 €
• ~0,03 € / boost × 250 = 8 €
• Stripe (~2,9 %) = ~190 €
• TOTAL COÛTS = ~426 € / mois

Marge brute : ~6 112 € / mois (93,5 %)
```

> **Levier principal** : La conversion Free → Premium.  
> **+1 % de conversion = +400 € de MRR**.

---

## 🎯 OÙ PLACER LE PAYWALL ? (UX MONÉTISATION)

```
Flux Utilisateur → Points de Monétisation

1. Question du jour → Réponses → Cercle de résonance
   │
   ├─→ Gratuit : Score % + 1 insight teaser
   │
   └─→ 🚨 PAYWALL #1 (One-shot) :
       "Débloquer l'analyse complète + protocole" → 4,99 €

2. Après protocole complété → Arbre mis à jour
   │
   ├─→ Gratuit : Voir le nouveau nœud
   │
   └─→ 🚨 PAYWALL #2 (Abonnement) :
       "Votre arbre grandit. Abonnez-vous pour :
        • Historique illimité
        • Insights personnalisés
        • Protocoles avancés" → 6,99 €/mois

3. Calendrier → Événement détecté (anniversaire, etc.)
   │
   └─→ 🚨 PAYWALL #3 (Boost) :
       "Pack spécial [événement] : protocole + export souvenir" → 2,99 €
```

**Règle d'Or** : Le paywall arrive **après la valeur perçue**, jamais avant. L'utilisateur doit avoir vu "ce qu'il manque" pour avoir envie de payer.

---

## 🔑 LES 3 LEVIERS QUI MULTIPLIENT LE REVENU

| Levier | Action | Impact Estimé |
|--------|--------|---------------|
| **1. Timing du Paywall** | Afficher l'offre au pic émotionnel (après le "C'est nous !") | +30-50 % de conversion |
| **2. Pricing Psychologique** | 4,99 € (one-shot) < 5 € → seuil d'impulsion franchi | +15-25 % de volume |
| **3. Social Proof Intégrée** | "87 % des couples qui ont débloqué ce protocole ont senti un rapprochement" | +10-20 % de confiance → conversion |

---

## ⚠️ CE QUI TUERAIT LE MODÈLE (À ÉVITER)

| Erreur | Conséquence | Solution |
|--------|-------------|----------|
| Donner l'analyse complète en gratuit | Plus de raison de payer | Teaser uniquement, bloquer le "pourquoi" et le "comment agir" |
| Paywall avant la révélation émotionnelle | Churn immédiat, frustration | Toujours montrer le "quoi" avant de vendre le "pourquoi" |
| Coût IA non contrôlé | Marge écrasée | Cache embeddings, fallback model, rate limiting |
| Positionnement thérapeutique | Risque légal, confiance réduite | Vocabulaire "ludique, exploration, lien" uniquement |

---

## ✅ CONCLUSION BRUTE

> **Oui, la killer feature + les visualisations = le cœur du produit.**  
> **Et c'est exactement là que se trouve l'argent.**  
>  
> Les gens ne paient pas pour :  
> ❌ Poser une question  
> ❌ Voir une réponse  
> ❌ Avoir un arbre joli  
>  
> Les gens paient pour :  
> ✅ **Comprendre** ce qui se joue entre eux  
> ✅ **Agir** concrètement pour se rapprocher  
> ✅ **Conserver** la mémoire de leur lien  
>  
> **Votre produit vend de la clarté émotionnelle.**  
> **C'est une commodité rare. C'est précieux. C'est monétisable.**

---

## 🚀 PROCHAINE ÉTAPE : VALIDER LE MODÈLE

```
1. [ ] Implémenter le Paywall #1 (one-shot 4,99 €) sur le flux d'analyse
2. [ ] Tracker : view_paywall → click_buy → purchase_complete
3. [ ] A/B test : message émotionnel vs message utilitaire
4. [ ] Mesurer : conversion rate, revenu moyen, coût d'acquisition
5. [ ] Itérer : ajuster prix, timing, copy en fonction des données
```

> **L'argent est là. Il suffit de tendre la main au bon moment.**

---

📩 **Besoin de plus de précision sur un point ?**  
Répondez avec :  
- `PRICING_DETAILS` → pour affiner la stratégie de prix  
- `PAYWALL_COPY` → pour les textes de conversion  
- `METRICS_DASHBOARD` → pour tracker les KPIs revenus  
- `LAUNCH_PLAN` → pour un plan de déploiement monétisation en 30 jours






















# 📘 CAPTAIN BOND — DOCUMENT DE RÉFÉRENCE PRODUIT
> **Killer Feature | Visualisations | Monétisation | Architecture Technique**  
> **Version** : 2.0 | **Statut** : Prêt pour implémentation AI/Dev | **Objectif** : Transformer la connexion émotionnelle en revenu récurrent, scalable et différenciant

---

## 🎯 1. THÈSE CENTRALE & POSITIONNEMENT

| Dimension | État Actuel (Vitamine) | État Cible (Antidouleur) |
|-----------|------------------------|--------------------------|
| **Proposition** | Jeu de questions quotidiennes | Miroir relationnel + Protocole d'alignement |
| **Valeur perçue** | "Sympa pour passer le temps" | "Je comprends enfin ce qui bloque & comment agir" |
| **Monétisation** | Impulsion faible, churn élevé | Abonnement justifié par résultat émotionnel mesurable |
| **Rôle de l'IA** | Générateur de questions | Détecteur de patterns, réformulateur neutre, guide d'action |
| **Rôle des Visualisations** | Décoration | Preuve tangible de l'évolution du lien → rétention |

> **Règle d'Or** : Les couples ne paient pas pour jouer. Ils paient pour **comprendre**, **agir** et **conserver** la mémoire de leur lien.

---

## 💎 2. LA KILLER FEATURE : MIROIR DYNAMIQUE & PROTOCOLE D'ALIGNEMENT

### 🔄 Flux Utilisateur (Core Loop)
```
20h → Notification "Question du jour"
   ↓
Réponses individuelles (asynchrone ou synchrone)
   ↓
Backend → /api/analyze/responses
   ↓
IA → Génère JSON (alignement, tension, protocole)
   ↓
Frontend → Affiche "Cercle de Résonance" + Dashboard
   ↓
Si divergence > seuil → 🚨 Paywall "Débloquer l'analyse + protocole"
   ↓
Paiement Stripe → Lance Protocole 3 étapes (5 min)
   ↓
Validation → Nœud "Résonance" ajouté à l'Arbre Neural
```

### 🤖 Prompt IA Core (JSON Strict)
```text
Tu es le "Moteur d'Alignement Relationnel" de Captain Bond.
Analyse deux réponses à une même question. Détecte divergences sémantiques/émotionnelles. Génère un protocole de 5 min pour réaligner les partenaires.
Réponds UNIQUEMENT en JSON valide. Aucun texte hors JSON.

Schéma :
{
  "alignment_score": float (0-1),
  "core_tension": string (≤8 mots),
  "neutral_reframe": string (valide les 2 perspectives sans jugement),
  "targeted_questions": [string, string],
  "micro_action": string (action concrète <10 min),
  "resonance_tag": string,
  "is_premium_worthy": boolean (true si divergence >0.6 ou pattern récurrent)
}

Règles :
- Ton empathique, non-clinique, orienté solution
- Si alignment_score > 0.8 → protocole = célébration + ancrage positif
- Si is_premium_worthy = false → retourner version light (teaser gratuit)
```
**Config** : `model: gpt-4o-mini` | `temperature: 0.7` | `max_tokens: 350`

---

## 🎨 3. SYSTÈME DE VISUALISATION & UX IMMERSIVE

### 📱 Les 3 Écrans Clés
| Écran | Objectif | Composants | Timing |
|-------|----------|------------|--------|
| **1. Choc Visuel** | Capturer l'émotion immédiate | Cercles concentriques animés (bleu/rose/or), score % pulsé | 0-5s |
| **2. Dashboard** | Révéler les insights navigables | Barres progression, cartes Points Forts/Tensions, mini-arbre | 5-30s |
| **3. Protocole Immersif** | Guider l'action concrète | Wizard 3 étapes (Compréhension → Question → Action), validation confetti | 30s-5min |

### 🎨 Design Tokens
```css
:root {
  --alignment-gold: #FFD700; --partner-a: #4A90E2; --partner-b: #E94B8A;
  --tension-orange: #FF6B35; --strength-green: #2ECC71;
  --bg-gradient: linear-gradient(135deg, #E3F2FD 0%, #FCE4EC 100%);
  --shadow-soft: 0 4px 20px rgba(0,0,0,0.08);
  --card-radius: 20px;
}
```

### 🌳 Arbre Neural (Données & Affichage)
```typescript
// Structure react-force-graph-2d
const graphData = {
  nodes: [{ id: "d1", val: 15, color: "#FFD700", theme: "Confiance", alignmentScore: 0.85 }],
  links: [{ source: "d1", target: "d2", value: 0.73 }]
};
```
- **Desktop** : Graphe 2D interactif (zoom, hover tooltip, click → modal)
- **Mobile** : Timeline verticale scrollable avec indicateurs de couleur/taille
- **Règle de chargement** : Pagination par mois, cache embeddings 24h

### 🎬 Animations (Framer Motion)
```typescript
export const pulseGlow = { scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(255,215,0,0.2)", "0 0 40px rgba(255,215,0,0.6)", "0 0 20px rgba(255,215,0,0.2)"], transition: { duration: 2, repeat: Infinity } };
export const staggerContainer = { visible: { transition: { staggerChildren: 0.1 } } };
```

---

## 💰 4. MODÈLE ÉCONOMIQUE & POINTS D'ENCAISSEMENT

### 📍 Cash Flow Triggers
| Point | Déclencheur | Offre | Prix | Marge Est. | Conversion Cible |
|-------|-------------|-------|------|------------|------------------|
| **1. Déblocage Insight** | Post-cercle résonance (divergence détectée) | Analyse complète + Protocole | 4,99 € | 98,8 % | 12-18 % |
| **2. Abonnement Rituel** | Après 3-5 jours ou protocole complété | Historique illimité + Insights + Protocoles avancés | 6,99 €/mois | 93,5 % | 8-12 % |
| **3. Boost Événementiel** | Détection date spéciale (anniv, St-Valentin) | Pack Date Night + Export Arbre | 2,99 € | 98,7 % | 5-8 % |

### 📊 Unit Economics (Conservateur / Mois)
```
Hypothèses : 5 000 couples actifs
• One-shot : 600 × 4,99€ = 2 994€
• Abonnés : 400 × 6,99€ = 2 796€
• Boosts : 250 × 2,99€ = 748€
→ TOTAL BRUT : 6 538€ / mois
• Coûts IA/Infra/Stripe : ~426€
→ MARGE NETTE : ~6 112€ (93,5%)
```
**Lever principal** : +1% conversion Free→Premium = +400€ MRR.

### 🚪 Stratégie Paywall UX
- **Toujours après la valeur perçue** (jamais avant la révélation)
- **Message émotionnel** : *"Votre dynamique montre un décalage sur [thème]. Débloquer le protocole pour transformer cette tension en connexion."*
- **CTA unique** : Pas de comparaison de plans. Bouton doré pulsant.
- **Fallback** : Si paiement échoue → mode teaser + relance 24h.

---

## 🏗️ 5. ARCHITECTURE TECHNIQUE

### 📦 Stack
```json
{
  "frontend": "Next.js 16 + React 19 + TypeScript + TailwindCSS 4",
  "backend": "API Routes + Supabase (PostgreSQL + Auth + Realtime)",
  "vector_db": "pgvector (embeddings OpenAI)",
  "ai": "OpenAI gpt-4o-mini (text-embedding-3-small + chat)",
  "payments": "Stripe Checkout + Webhooks",
  "viz": "react-force-graph-2d + framer-motion + recharts",
  "deploy": "Cloudflare Pages / Vercel"
}
```

### 🗃️ Modèles Prisma (Simplifié)
```prisma
model CoupleResponse {
  id          String   @id @default(uuid())
  coupleId    String
  questionId  String
  partnerA    String
  partnerB    String
  embeddingA  Float[]  @db.Vector(1536)
  embeddingB  Float[]  @db.Vector(1536)
  analysis    Json
  createdAt   DateTime @default(now())
}

model ResonanceNode {
  id          String   @id @default(uuid())
  coupleId    String
  type        String   // "divergence" | "alignment" | "pattern"
  theme       String
  vector      Float[]  @db.Vector(1536)
  protocolId  String?
  createdAt   DateTime @default(now())
}
```

### 🔌 Endpoints Critiques
```
POST /api/daily/question
POST /api/submit/answer
GET  /api/analyze/{responseId}
POST /api/checkout/session
POST /api/protocol/complete
```
**Optimisation Coûts** : Cache embeddings 24h | Rate limit 1 analyse/jour/couple | Fallback `gpt-3.5-turbo` si timeout.

---

## 📊 6. KPIs & TRACKING

| Catégorie | Métrique | Cible J30 | Outil |
|-----------|----------|-----------|-------|
| **Conversion** | Paywall → Achat | ≥12% | Stripe + PostHog |
| **Engagement** | Protocole complété (>4min) | ≥65% | Frontend Events |
| **Rétention** | Retour J+1 | ≥40% | Supabase + Push |
| **Économique** | Coût IA / Revenu Premium | <8% | OpenAI Logs |
| **UX** | Taux exploration cartes | ≥80% | Mixpanel/Amplitude |
| **LTV** | Abonné actif mois 3 | ≥70% | RevenueCat |

---

## 🛡️ 7. GUARDRAILS ÉTHIQUES, LÉGAUX & SÉCURITÉ

| Risque | Mitigation |
|--------|------------|
| **Dérive thérapeutique** | Disclaimer visible : "Outil ludique d'exploration, pas un substitut médical." Vocabulaire : lien, découverte, harmonie. |
| **Crise / Violence** | Détection mots-clés critiques → Suspension IA + redirection vers numéros d'urgence. |
| **Biais IA** | Prompt hard-codé : valider les 2 perspectives, éviter étiquettes pathologisantes. Review humaine mensuelle des outputs. |
| **RGPD** | Consentement explicite avant 1ère analyse. Suppression sur demande. Anonymisation post-90j si inactif. |
| **Usage asymétrique** | Si 1 seul répond >3x/semaine → Alerte douce : "Le lien nécessite 2 voix." |

---

## 🚀 8. ROADMAP D'IMPLÉMENTATION

| Phase | Durée | Livrables Clés | Critère de Succès |
|-------|-------|----------------|-------------------|
| **P0 (Core)** | Semaine 1 | Flux question → analyse → paywall v1 → protocole 3 étapes. Stripe live. | Conversion paywall >8%. Coût IA <0.08€ |
| **P1 (Viz & Retention)** | Semaine 2 | Arbre neural interactif. Animations Framer. Async protocol. Mobile optimisé. | Tree revisit >2x/sem. Churn <10% |
| **P2 (Scale)** | Semaine 3-4 | Partage Story natif. Dark mode. A/B test pricing/copy. Webhooks robustes. | LTV >50€. CAC <15€ |

---

## 📝 9. INSTRUCTIONS POUR AGENT IA / LEAD DEV

1. **Priorité absolue** : Pipeline `/api/analyze/responses` + JSON prompt + Stripe Checkout.
2. **Ne pas over-engineer** : MVP visuel = SVG + Framer. Arbre complet = P1.
3. **Feature Flags** : Déployer sous `KILLER_PROTOCOL_V1`. A/B test 10% traffic.
4. **Monitoring** : Logger `analysis_latency`, `stripe_webhook_success`, `protocol_dropoff_step`.
5. **Livraison attendue** : Code production-ready, tests unitaires sur prompt JSON, mocks Stripe validés.

---

> ✅ **Document prêt pour ingestion par Agent IA / Product Owner / Lead Dev**  
> 📥 **Commandes rapides** : Répondre avec `GEN_CODE_PAYWALL`, `PROMPT_ROUTER`, `FIGMA_TOKENS`, ou `LAUNCH_CHECKLIST` pour générer les assets spécifiques.  
> 💡 **Rappel stratégique** : Ce n'est pas un jeu. C'est un **miroir émotionnel monétisé**. Chaque pixel, chaque ligne de code, chaque prompt doit servir la clarté, l'action et la rétention.