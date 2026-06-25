# 🚀 PLAN DE PIVOT & REFACTORING : CAPTAIN BOND

> **Date :** 17 Juin 2026  
> **Statut :** En cours de transition  
> **Objet :** Nettoyage complet du projet (ex-KOZÉ) pour aligner la technique sur la vision "Captain Bond".

---

## 1. 🧭 LA NOUVELLE VISION

**Captain Bond** n'est plus un simple jeu de soirée culturel.  
C'est une **plateforme universelle de connexion humaine** (Human Connection Accelerator).

*   **Mission :** Utiliser la technologie pour faciliter des interactions authentiques, profondes et mémorables.
*   **Cible :** Tout le monde (B2C : amis/couples, B2B : team building).
*   **Positionnement :** "Anti-Tech" (la tech s'efface devant l'humain).
*   **Langues :** Bilingue natif **EN / FR** dès le MVP, prêt pour l'expansion globale.

---

## 2. 🔄 STRATÉGIE DU PIVOT (Ce qui change)

| Aspect | Avant (KOZÉ) | Maintenant (Captain Bond) |
|--------|--------------|---------------------------|
| **Cœur du produit** | Divertissement, Culture Réunionnaise, Compétition. | Connexion émotionnelle, Vulnérabilité, Résonance. |
| **Modes de jeu** | Vrai/Faux, Quiz, Débat (axés culture locale). | **ZNS** (Icebreaker), **nsoiré** (Fun), **Paroifs** (Créatif), **Chill** (Détente), **Profond** (Intime). |
| **Rythme** | Rapide, "Party Game" classique. | Modulé par un algorithme "DJ Émotionnel" (accélère ou ralentit). |
| **Identité** | "Captainbond.com" (Marque floue). | **Captain Bond** (Marque forte, universelle). |
| **Contenu** | Questions statiques sur la Réunion. | Contenu dynamique : Histoires perso, Déclarations, Bluff, et questions culturelles adaptatives. |

---

## 3. 🧹 PLAN DE NETTOYAGE (Action Immédiate)

Pour repartir sur des bases saines, voici les fichiers à manipuler. **Ne supprimez rien sans l'archiver d'abord.**

### 📂 A. Archivage (Déplacer dans `archive_koze/`)
Ces éléments ne servent plus la nouvelle vision mais restent intéressants pour l'historique.

*   [ ] `starter_questions.md` (Questions 100% locales Réunion)
*   [ ] `blueprint.md` (Ancienne roadmap KOZÉ)
*   [ ] `docs/OLD_GAME_DESIGN.md` (S'il existe)
*   [ ] Tous les assets visuels mentionnant "Kozé" ou "974" dans les `public/`

### 📝 B. Documentation (À réécrire)
*   [ ] **`README.md`** : Remplacer par la nouvelle identité Captain Bond (voir contenu ci-dessous).
*   [ ] **`GETTING_STARTED.md`** : Mettre à jour les commandes et explications pour le nouveau schéma.
*   [ ] **`ENV`** : Renommer `NEXT_PUBLIC_KOZE_...` en `NEXT_PUBLIC_CB_...` ou générique.

### 💻 C. Technique & Code (Refactoring)
*   [ ] **`prisma/schema.prisma`** : Mettre à jour l'enum `GameMode` (voir section 4).
*   [ ] **`package.json`** : Mettre à jour `name` et `description`.
*   [ ] **Structure i18n** : Créer les dossiers `messages/en.json` et `messages/fr.json` pour préparer le bilinguisme.

> ⚠️ **IMPORTANT : NE PAS SUPPRIMER LE CODE DES MODES EXISTANTS**
> Les mécaniques `VRAI_FAUX`, `QUIZ_FLASH`, `DEBAT`, `IMPOSTEUR` sont conservées ! 
> On ne supprime pas les fichiers `src/game-modes/vrai_faux/`, etc. 
> On les **réaffecte** aux nouveaux modes (ZNS, Chill, etc.).

---

## 4. 🎮 MATRICE DES MODES (Conservation & Adaptation)

### Principe Clé : Séparer la MÉCANIQUE du CONTENU
*   **Mécanique (Code)** : `VRAI_FAUX`, `QUIZ`, etc. → **ON GARDE** (c'est solide et testé).
*   **Contenu (Questions)** : Culture locale → **ON CHANGE** pour du contenu universel/émotionnel.
*   **Contexte (Mode)** : L'ambiance (ZNS, Chill, Profond) détermine quel type de questions on charge.

| Mécanique Technique (Code) | Ancien Usage (KOZÉ) | **Nouveau Usage (Captain Bond)** | Modes Ciblés (Ambiance) |
|----------------------------|---------------------|----------------------------------|-------------------------|
| **`VRAI_FAUX`** | Quiz culture locale | **Anecdotes Perso** & Idées reçues légères | ZNS, Chill |
| **`QUIZ_FLASH`** | Savoir général / local | **Pop Culture** & Sondages rapides ("Qui a déjà...?") | ZNS, nsoiré |
| **`DEBAT`** | Opinion politique/locale | **Sujets légers / "Hot takes"** (Pizza ananas...) | nsoiré, Paroifs |
| **`IMPOSTEUR`** | Bluff simple | **Mentir sur soi** (2 vérités, 1 mensonge) | Paroifs, nsoiré |
| *(Nouveau)* **`HISTOIRE`** | N/A | **Storytelling guidé** (Raconter un souvenir) | Profond, Chill |
| *(Nouveau)* **`CONFESSION`** | N/A | **Révélation anonyme** ou vulnérabilité | Profond |
| *(Nouveau)* **`SILENCE`** | N/A | **Moment contemplatif** (Regard, respiration) | Chill, Profond |

### Mise à jour du Schema Prisma (`schema.prisma`)

L'enum `GameMode` doit refléter les **mécaniques techniques disponibles**, pas juste l'ambiance.

```prisma
enum GameMechanic {
  // --- MÉCANIQUES HÉRITÉES (KOZÉ) - À CONSERVER ---
  VRAI_FAUX     // Simple, efficace, parfait pour le Chill
  QUIZ_FLASH    // Rapide, dynamique, parfait pour ZNS
  DEBAT         // Interaction, parfait pour nsoiré/Paroifs
  IMPOSTEUR     // Bluff, parfait pour Paroifs/nsoiré

  // --- NOUVELLES MÉCANIQUES (CAPTAIN BOND) ---
  HISTOIRE      // Storytelling pour le mode Profond/Chill
  CONFESSION    // Révélation pour le mode Profond
  SILENCE       // Moment contemplatif pour le mode Chill/Profond
}

// L'ambiance (ZNS, Chill, etc.) est gérée soit par :
// 1. Un champ `GameMode` séparé (si on veut filtrer par ambiance)
// 2. Soit par le "Pack" de questions sélectionné par l'utilisateur
```

> **Note :** On peut avoir un mode "Chill" qui utilise la mécanique `VRAI_FAUX` avec des questions douces, ou un mode "ZNS" qui utilise `QUIZ_FLASH` avec des questions énergiques.

---

## 5. 🌍 STRATÉGIE INTERNATIONALE (i18n)

### Priorité : Bilingue EN/FR natif dès le MVP

**Structure des fichiers de traduction :**
```
messages/
├── en.json
└── fr.json
```

**Exemple de contenu (`messages/fr.json`) :**
```json
{
  "app": {
    "title": "Captain Bond",
    "slogan": "L'accélérateur de lien humain"
  },
  "modes": {
    "zns": { "name": "ZNS", "desc": "Zones de Non-Silence - Brise-glace énergique" },
    "nsoire": { "name": "nsoiré", "desc": "La soirée classique, fun et inclusive" },
    "paroifs": { "name": "Paroifs", "desc": "Créatif, décalé, surprenant" },
    "chill": { "name": "Chill", "desc": "Détente, histoires, respiration" },
    "profond": { "name": "Profond", "desc": "Connexion intime et vulnérabilité" }
  },
  "mechanics": {
    "vrai_faux": "Vrai ou Faux",
    "quiz_flash": "Quiz Flash",
    "debat": "Débat",
    "imposteur": "Imposteur"
  }
}
```

**Règle d'or pour le contenu :**
*   Les noms des modes (`ZNS`, `Paroifs`) restent en créole/français (ce sont des **marques**).
*   Les descriptions et le contenu des questions sont **localisés**, pas juste traduits mot-à-mot.

---

## 6. 🚀 PROCHAINES ÉTAPES (To-Do List)

### Étape 1 : Le Grand Nettoyage (30 min)
1.  Créer le dossier `archive_koze`.
2.  Déplacer les fichiers obsolètes (`starter_questions.md`, `blueprint.md`, etc.).
3.  Lancer le script de mise à jour de `README.md` (voir annexe).

### Étape 2 : Mise à jour du Schéma DB (30 min)
1.  Modifier `schema.prisma` pour inclure les mécaniques héritées + nouvelles.
2.  Ajouter le champ `intensityLevel` (1-3) et `tags`[] à la table `Question`.
3.  Pousser la migration : `npx prisma db push`.

### Étape 3 : Préparation de l'International (i18n) (1h)
1.  Installer la librairie de trad (`npm install next-intl`).
2.  Configurer `i18n.ts` et `middleware.ts` pour la détection de langue.
3.  Créer `messages/en.json` et `messages/fr.json` avec les clés de base.
4.  Traduire l'interface principale (boutons, titres, modes).

### Étape 4 : Premier Test "Captain Bond" (1h)
1.  Créer une room de test en mode "Chill".
2.  Vérifier qu'une question "Vrai/Faux" (anecdote perso, FR) s'affiche correctement.
3.  Changer la langue en EN et vérifier que l'interface et la question se traduisent.
4.  Tester le basculement vers un mode "Profond" avec une mécanique `HISTOIRE`.

---

## 📎 ANNEXE : CONTENU DU NOUVEAU README.md

Copiez ce contenu pour remplacer votre `README.md` actuel.

```markdown
# Captain Bond 🤝

> **The Human Connection Accelerator.**  
> Pas juste un jeu. Une expérience de lien authentique.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)]()
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)]()
[![Cloudflare](https://img.shields.io/badge/Edge-Deployment-F38020?logo=cloudflare)]()

## 🧭 Vision

Captain Bond est conçu pour briser la glace et créer des connexions profondes, que ce soit entre amis, en couple ou en équipe. 
L'application guide les joueurs à travers différentes intensités émotionnelles : du **Chill** détendu au **Profond** transformateur.

## 🎮 Les Modes (Ambiances)

| Mode | Ambiance | Mécaniques Utilisées | Usage |
| :--- | :--- | :--- | :--- |
| **ZNS** | 🔥 Énergie | `QUIZ_FLASH`, `VRAI_FAUX` | Icebreaker, rapide, fun |
| **nsoiré** | 🎉 Classique | `DEBAT`, `IMPOSTEUR`, `QUIZ` | Le cœur du réacteur, rire, interaction |
| **Paroifs** | 🎨 Créatif | `IMPOSTEUR`, `DEBAT`, `HISTOIRE` | Absurde, bluff, imagination |
| **Chill** | 🌿 Détente | `VRAI_FAUX`, `HISTOIRE`, `SILENCE` | Calme, histoires, respiration |
| **Profond** | 💫 Intime | `HISTOIRE`, `CONFESSION`, `SILENCE` | Vulnérabilité, confessions, vérité |

> 💡 **Note :** Les modes définissent l'ambiance et le type de questions. Les mécaniques (Vrai/Faux, Quiz...) sont les outils techniques réutilisés pour créer ces ambiances.

## 🌍 International

L'application est bilingue **Français / Anglais** nativement.
La langue est détectée automatiquement ou sélectionnable manuellement.

## 🛠️ Stack Technique

*   **Frontend** : Next.js 14+ (App Router), TailwindCSS, Framer Motion
*   **Backend** : Serverless Functions (Cloudflare), Supabase (Postgres + Realtime)
*   **Langues** : Bilingue EN / FR natif (`next-intl`)
*   **Déploiement** : Cloudflare Pages
*   **Base de données** : Prisma ORM + PostgreSQL

## 🚀 Getting Started

```bash
# 1. Installation
npm install

# 2. Configuration (Copier .env.example vers .env.local)
cp .env.example .env.local

# 3. Base de données
npx prisma db push

# 4. Lancement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour commencer.

## 📚 Documentation

*   [📜 Le Manifeste](./docs/MANIFESTO.md) — Notre philosophie "anti-tech pro-humain"
*   [🎮 Game Design](./docs/GAME_DESIGN.md) — Les règles implémentées dans le code
*   [🎭 Modes de Jeu](./docs/GAME_MODES.md) — Détail des ambiances ZNS, nsoiré, etc.
*   [✍️ Guidelines Contenu](./docs/CONTENT_GUIDELINES.md) — Comment écrire des questions qui connectent
*   [🚀 Plan de Pivot](./PIVOT_PLAN.md) — Ce document : feuille de route du refactoring

## 🤝 Contribuer

Nous recherchons des "Question Writers" et des facilitateurs d'expérience. 
Lisez [CONTRIBUTING.md](./CONTRIBUTING.md) pour commencer.
```

---

> 💡 **Rappel Final** : Le pivot Captain Bond, c'est garder la **solidité technique** de KOZÉ (les mécaniques de jeu) et y injecter une **âme nouvelle** (la connexion humaine). On ne jette pas le moteur, on change la destination.
