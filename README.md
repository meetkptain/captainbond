# Captain Bond 🤝

> **The Human Connection Accelerator.**  
> Pas juste un jeu. Une expérience de lien authentique.

## 🧭 Vision

Captain Bond est conçu pour briser la glace et créer des connexions profondes, que ce soit entre amis, en couple ou en équipe. 
L'application guide les joueurs à travers différentes intensités émotionnelles : du rire de l'Apéro à la vulnérabilité du face à face. Notre philosophie est de **supprimer la friction technique** (zéro écriture, zéro clavier) pour maximiser le regard et la voix.

## 🎮 Les 4 Modes de Jeu

| Mode | Ambiance | Joueurs | Mécanique Principale |
| :--- | :--- | :--- | :--- |
| **🧊 Icebreaker** | Légère, Absurde | 3-8 | Le **Tribunal Social**. Zéro écriture, on vote sur les prénoms de ses amis avec un podium en fin de round. |
| **🌶️ Spicy** | Clivante, Tension | 3-8 | Dilemmes moraux absurdes (A/B). Séparer la pièce en deux. |
| **🕳️ Deep Connection** | Vulnérabilité, Intime | 3-6 | Le **Confessionnal de Poche**. On "Tease" une histoire en 5 mots max. La TV s'éteint pour écouter celui qui a le Spotlight. |
| **🍷 Date Night** | Flirt, Profond | 2 | Le **Face à Face Asymétrique**. La TV est éteinte. L'Hôte contrôle. Jauge de maintien (Hold to proceed), mode veille (Bougie). |

## 🧠 Le "DJ Émotionnel" (Algorithme)

Fini l'aléatoire. Captain Bond possède un algorithme de jeu ("Le DJ") qui compose des montagnes russes émotionnelles. 
Chaque question est tagguée par son intensité (1 à 3). **La Règle de Refroidissement** garantit que l'application ne posera jamais deux questions trop profondes d'affilée pour ne pas étouffer l'ambiance.

## 🛠️ Stack Technique

*   **Frontend** : Next.js 14+ (App Router), TailwindCSS
*   **Base de données** : PostgreSQL + Prisma ORM
*   **Temps Réel** : Supabase Realtime

## 🚀 Lancement Rapide

```bash
# 1. Installation
npm install

# 2. Configuration (S'assurer d'avoir Postgres qui tourne)
cp .env.example .env.local

# 3. Base de données
npx prisma db push
npx tsx prisma/seed.ts

# 4. Lancement
npm run dev
```

## 📚 Documentation Architecture

Consultez le dossier `docs/` pour comprendre les choix techniques radicaux du projet :
*   `MANIFESTO.md` : Pourquoi l'UX doit forcer le joueur à poser son téléphone.
*   `GAME_DESIGN.md` : Les règles d'ingénierie sociale (Jauge de tension, asymétrie, limites de Dunbar).
*   `CONTENT_GUIDELINES.md` : Comment écrire pour la base de données (Intensité 1-3 et Tags).
*   `GAME_MODES.md` : Le détail technique des 4 modes de jeu.
