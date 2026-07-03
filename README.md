# Captain Bond

> **The Human Connection Accelerator.**
> Pas juste un jeu. Une experience de lien authentique.

## Vision

Captain Bond est concu pour briser la glace et creer des connexions profondes, que ce soit entre amis, en couple ou en equipe. L'application guide les joueurs a travers differentes intensites emotionnelles : du rire de l'Apero a la vulnerabilite du face a face. Notre philosophie est de **supprimer la friction technique** (zero ecriture, zero clavier) pour maximiser le regard et la voix.

## Les 4 Modes de Jeu

| Mode | Ambiance | Joueurs | Mecanique Principale |
| :--- | :--- | :--- | :--- |
| **Icebreaker** | Legere, Absurde | 3-8 | Le **Tribunal Social**. Zero ecriture, on vote sur les prenoms de ses amis avec un podium en fin de round. |
| **Spicy** | Clivante, Tension | 3-8 | Dilemmes moraux absurdes (A/B). Separer la piece en deux. |
| **Deep Connection** | Vulnerabilite, Intime | 3-6 | Le **Confessionnal de Poche**. On "Tease" une histoire en 5 mots max. La TV s'eteint pour ecouter celui qui a le Spotlight. |
| **Date Night** | Flirt, Profond | 2 | Le **Face a Face Asymetrique**. La TV est eteinte. L'Hote controle. Jauge de maintien (Hold to proceed), mode veille (Bougie). |

## Mode Couple — Rituels Quotidiens

Le mode couple transforme l'application en experience quotidienne enrichie :

| Feature | Description | Cron |
|---------|-------------|------|
| **Rituel 20h** | Question profonde a 11h, reponses revelees simultanement a 20h | Lun/Mer/Ven |
| **Push Notifications** | Alertes quand le rituel est disponible et quand c'est l'heure de reveler | Lun/Mer/Ven |
| **Shared Reveal** | Compte a rebours 3-2-1 synchronise pour decouvrir les reponses | En temps reel |
| **Weekly AI Recap** | Resumé hebdomadaire genere par Gemini (theme, insight, lecon) | Dimanche |
| **Heatmap Confiance** | 5 axes : vulnerabilite, communication, conflit, desir, projets | Lundi |
| **Arbre de Resonance** | Progression mensuelle de l'arbre semantique du couple | 1er du mois |

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js (App Router), TailwindCSS |
| **Base de donnees** | PostgreSQL (Supabase) + Prisma ORM |
| **Temps reel** | Supabase Realtime |
| **IA** | Gemini 1.5 Flash (generation questions, recaps, analyse) |
| **Stockage** | Wasabi S3 (images, audio) |
| **Hébergement** | Cloudflare Pages (app) + Cloudflare Workers (crons) |
| **Monetisation** | Stripe (subscriptions, one-shot) |

## Lancement Rapide

```bash
# 1. Installation
npm install

# 2. Configuration
cp .env.example .env.local
# Remplir les variables dans .env.local

# 3. Base de donnees
npx prisma db push
npx prisma generate

# 4. Lancement
npm run dev
```

## Deploiement

Voir `docs/DEPLOYMENT.md` pour le guide complet.

```bash
# Build
npm run build

# Deploy sur Cloudflare Pages
npx wrangler pages deploy .next

# Deploy worker crons
cd workers/cron-trigger
npx wrangler deploy
```

## Documentation

| Document | Contenu |
|----------|---------|
| `docs/ARCHITECTURE.md` | Vue d'ensemble technique |
| `docs/COUPLE_FEATURES.md` | Detail des features couple (P1-P4) |
| `docs/DEPLOYMENT.md` | Guide de deploiement |
| `docs/MANIFESTO.md` | Philosophie produit |
| `docs/GAME_DESIGN.md` | Mecaniques de jeu |
| `docs/CONTENT_GUIDELINES.md` | Guidelines contenu |
| `docs/GAME_MODES.md` | Detail des modes de jeu |
| `PLAN_STRATEGIQUE.md` | Plan strategique 12 mois |
