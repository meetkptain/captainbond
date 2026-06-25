# 📋 LES DOCUMENTS À FOURNIR À CLAUDE POUR CODAGENT

Pour qu'un agent IA comme Claude puisse **coder efficacement** ton jeu, il faut lui donner des documents **structurés, détaillés et techniques**. Voici la liste complète des livrables à préparer.

---

## 📁 ARCHITECTURE DES DOCUMENTS

```
📂 DOCS_KOZE/
├── 📄 01_SPEC_GENERALE.md (Vision, concept, marché)
├── 📄 02_UX_FLOW.md (Parcours utilisateur, écrans)
├── 📄 03_SPEC_TECHNIQUE.md (Stack, architecture, API)
├── 📄 04_BASE_DONNEES.md (Schéma SQL, modèles)
├── 📄 05_MODES_JEU.md (Règles détaillées de chaque mode)
├── 📄 06_UI_DESIGN.md (Wireframes, couleurs, composants)
├── 📄 07_API_ENDPOINTS.md (Routes backend)
├── 📄 08_WEBSOCKETS.md (Événements temps réel)
├── 📄 09_PAIEMENTS.md (Stripe, achats intégrés)
└── 📄 10_QUESTIONS.md (Base de données des questions)
```

---

## 📄 DOCUMENT 01 : SPEC_GENERALE.md

### Contenu à fournir

```markdown
# KOZÉ - Spécifications Générales

## Vision
"KOZÉ est un jeu de soirée où chaque joueur utilise son téléphone comme manette. 
L'écran principal (TV) affiche le jeu, les téléphones sont les contrôleurs."

## Marché cible
- Public : 18-50 ans, Réunionnais, francophones
- Contexte : Soirées entre amis, bars, associations

## Promesse unique
"Un jeu de soirée 100% culture réunionnaise, qui rassemble et fait rire."

## Modèle économique
- Freemium (3 modes gratuits)
- Achats intégrés (Pack Péi 2,99€, Pack Soirée 4,99€)
- Abonnement (Kozé+ 2,99€/mois)
- Kozé Pro (9,99€/mois pour bars/associations)

## Technologies
- Frontend : Next.js 14 (App Router)
- Backend : Node.js + Express
- Temps réel : Socket.io
- Base de données : PostgreSQL + Prisma
- Hébergement : Vercel (front) + Railway (back)
- Paiements : Stripe

## Modes de jeu (MVP - 3 premiers)
1. Vrai ou Fau
2. Le Grand Débat
3. Quiz Flash
```

---

## 📄 DOCUMENT 02 : UX_FLOW.md

### Contenu à fournir

```markdown
# KOZÉ - Parcours Utilisateur (UX Flow)

## Flow Principal

### 1. Écran d'accueil (TV)
```
┌─────────────────────────────────────┐
│           🎮 KOZÉ                   │
│                                     │
│     "Le jeu de soirée réunionnais"  │
│                                     │
│     ┌─────────────────────────┐    │
│     │   CRÉER UNE SALLE       │    │
│     └─────────────────────────┘    │
│                                     │
│     ┌─────────────────────────┐    │
│     │   REJOINDRE UNE SALLE   │    │
│     └─────────────────────────┘    │
└─────────────────────────────────────┘
```

### 2. Création d'une salle (TV)
```
┌─────────────────────────────────────┐
│   Votre code : 3K9A                │
│                                     │
│   Joueurs connectés :               │
│   👤 Jean-Pierre (Hôte)            │
│   👤 Marie                         │
│   👤 David                         │
│   👤 Sophie                        │
│                                     │
│   ⏳ En attente de joueurs...      │
│                                     │
│   ┌─────────────────────────┐    │
│   │   LANCER LA PARTIE      │    │
│   └─────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3. Écran téléphone (joueur)
```
┌─────────────────────────────────────┐
│   🏠 Salle : 3K9A                  │
│   👤 Jean-Pierre                   │
│   ⭐ 0 points                      │
│                                     │
│   En attente du début...           │
│                                     │
│   ┌─────────────────────────┐    │
│   │   PRÊT ?   OUI/NON      │    │
│   └─────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4. Flow d'une manche (mode Vrai ou Fau)

**Écran TV**
```
┌─────────────────────────────────────┐
│   ⏱️ 15 secondes                    │
│                                     │
│   "Le Piton de la Fournaise est    │
│    entré en éruption 12 fois       │
│    en 2025."                       │
│                                     │
│   ┌──────┐  ┌──────┐              │
│   │ VRAI │  │ FAUX │              │
│   └──────┘  └──────┘              │
│                                     │
│   ✅ 4 votes   ❌ 2 votes          │
└─────────────────────────────────────┘
```

**Écran téléphone**
```
┌─────────────────────────────────────┐
│   ⏱️ 12s                            │
│                                     │
│   "Le Piton de la Fournaise est    │
│    entré en éruption 12 fois       │
│    en 2025."                       │
│                                     │
│     ┌──────┐  ┌──────┐            │
│     │ VRAI │  │ FAUX │            │
│     └──────┘  └──────┘            │
│                                     │
│   ⭐ 0 points                      │
└─────────────────────────────────────┘
```

### 5. Révélation (TV)
```
┌─────────────────────────────────────┐
│   🎉 RÉVÉLATION !                   │
│                                     │
│   "Le Piton de la Fournaise est    │
│    entré en éruption 7 fois."      │
│                                     │
│   ✅ 4 bonnes réponses             │
│   ❌ 2 mauvaises réponses          │
│                                     │
│   📊 Classement :                   │
│   1. Marie  - 20 points            │
│   2. David  - 15 points            │
│   3. Sophie - 10 points            │
└─────────────────────────────────────┘
```

## Flow complet : Hôte → salle → joueurs → manche → révélation → score → prochaine manche
```

---

## 📄 DOCUMENT 03 : SPEC_TECHNIQUE.md

### Contenu à fournir

```markdown
# KOZÉ - Spécifications Techniques

## Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 14.x (App Router) |
| Backend | Node.js + Express | 20.x |
| Temps réel | Socket.io | 4.x |
| ORM | Prisma | 5.x |
| Base de données | PostgreSQL | 15.x |
| Authentification | JWT (pour hôtes) | - |
| Paiements | Stripe | - |
| Hébergement | Vercel (front) + Railway (back) | - |

## Structure des dossiers

```
kozé/
├── apps/
│   ├── web/                 # Next.js (TV + téléphone)
│   │   ├── app/
│   │   │   ├── page.tsx     # Accueil
│   │   │   ├── room/
│   │   │   │   └── [code]/
│   │   │   │       ├── page.tsx      # Écran TV
│   │   │   │       └── player/
│   │   │   │           └── page.tsx  # Écran téléphone
│   │   │   └── api/
│   │   │       └── ...
│   │   └── components/
│   │       ├── tv/          # Composants écran TV
│   │       ├── phone/       # Composants téléphone
│   │       └── shared/
│   └── backend/
│       ├── src/
│       │   ├── server.ts    # Serveur Express + Socket.io
│       │   ├── routes/
│       │   ├── controllers/
│       │   └── services/
│       └── prisma/
│           └── schema.prisma
```

## Variables d'environnement

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Architecture des salles

```typescript
// Une salle = une instance de jeu
interface Room {
  id: string          // Code à 4 lettres (ex: "3K9A")
  hostId: string
  players: Player[]
  status: 'waiting' | 'playing' | 'revealing' | 'ended'
  currentMode: Mode
  round: number
  scores: Record<string, number>
  questions: Question[]
}

// Un joueur
interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  score: number
  socketId: string
}

// Une question
interface Question {
  id: string
  mode: 'VRAI_FAUX' | 'DEBAT' | 'QUIZ_FLASH'
  text: string
  correctAnswer: string | boolean
  options?: string[]
  explanation?: string
  category: string
  difficulty: 1 | 2 | 3
}
```

## Résumé technique
- Next.js 14 avec App Router pour le frontend
- Socket.io pour la synchronisation temps réel
- PostgreSQL + Prisma pour la persistance
- Stripe pour les paiements
- Architecture modulaire pour faciliter l'ajout de nouveaux modes
```

---

## 📄 DOCUMENT 04 : BASE_DONNEES.md

### Contenu à fournir

```markdown
# KOZÉ - Modèle de Base de Données

## Schéma Prisma

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Une salle de jeu
model Room {
  id           String    @id @default(cuid())
  code         String    @unique // Code à 4 lettres
  hostId       String
  status       RoomStatus @default(WAITING)
  currentMode  String?
  round        Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  players      Player[]
  scores       Score[]
}

enum RoomStatus {
  WAITING
  PLAYING
  REVEALING
  ENDED
}

// Un joueur
model Player {
  id        String   @id @default(cuid())
  name      String
  isHost    Boolean  @default(false)
  isReady   Boolean  @default(false)
  socketId  String
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id])
  
  scores    Score[]
  responses Response[]
}

// Score d'un joueur
model Score {
  id        String   @id @default(cuid())
  playerId  String
  player    Player   @relation(fields: [playerId], references: [id])
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id])
  points    Int      @default(0)
  updatedAt DateTime @updatedAt
}

// Une question
model Question {
  id             String   @id @default(cuid())
  mode           ModeType
  text           String
  correctAnswer  String   // "true", "false", ou la réponse textuelle
  options        String[] // Pour les QCM
  explanation    String?  // Explication de la réponse
  category       Category
  difficulty     Int      @default(1)
  isPremium      Boolean  @default(false) // Payant ou gratuit
  packId         String?  // Si lié à un pack
  createdAt      DateTime @default(now())
  
  pack           Pack?    @relation(fields: [packId], references: [id])
}

enum ModeType {
  VRAI_FAUX
  DEBAT
  QUIZ_FLASH
  IMPOSTEUR
  BAC_A_SABLE
  CADAVRE_EXQUIS
  GAGE
  PHOTO
  MIME
  ENQUETE
}

enum Category {
  HISTOIRE
  GEOGRAPHIE
  GASTRONOMIE
  EXPRESSIONS
  PERSONNALITES
  SPORT
  MUSIQUE
  GENERAL
}

// Un pack de contenu (achat intégré)
model Pack {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float    // 2.99, 4.99, etc.
  stripePriceId String? // Pour Stripe
  isSubscription Boolean @default(false)
  isPro       Boolean  @default(false) // Pack pro B2B
  questions   Question[]
  createdAt   DateTime @default(now())
}

// Un achat
model Purchase {
  id          String   @id @default(cuid())
  playerId    String
  packId      String
  pack        Pack     @relation(fields: [packId], references: [id])
  amount      Float
  stripePaymentId String
  createdAt   DateTime @default(now())
}

// Une réponse de joueur
model Response {
  id         String   @id @default(cuid())
  playerId   String
  player     Player   @relation(fields: [playerId], references: [id])
  roomId     String
  questionId String
  answer     String
  isCorrect  Boolean?
  timestamp  DateTime @default(now())
}
```

## Relations clés
- Une Room a plusieurs Players
- Un Player a plusieurs Scores
- Un Pack a plusieurs Questions
- Un Player peut avoir plusieurs Purchases
```

---

## 📄 DOCUMENT 05 : MODES_JEU.md

### Contenu à fournir

```markdown
# KOZÉ - Détail des Modes de Jeu (MVP)

## Mode 1 : Vrai ou Fau

### Règles
1. Une affirmation s'affiche sur l'écran TV
2. Chaque joueur vote Vrai ou Faux sur son téléphone (20s)
3. Les votes sont affichés en temps réel (anonymes)
4. La réponse est révélée
5. Les joueurs ayant juste marquent 10 points

### États de la manche
- `QUESTION` : Affichage de la question, timer de 20s
- `VOTING` : Les joueurs votent
- `REVEALING` : Révélation de la réponse
- `SCORING` : Mise à jour des scores
- `NEXT` : Passage à la question suivante

### Données
```typescript
interface VraiFauQuestion {
  id: string
  affirmation: string
  reponse: boolean
  explication: string
  categorie: string
}
```

### Événements Socket.io
- `vote:true` / `vote:false` → Envoi du vote
- `question:reveal` → Révélation de la réponse
- `score:update` → Mise à jour des scores

---

## Mode 2 : Le Grand Débat

### Règles
1. Une question clivante s'affiche
2. Chaque joueur tape un argument sur son téléphone (30s)
3. Les arguments sont affichés sur l'écran TV (anonymes)
4. Les joueurs votent pour le meilleur argument (20s)
5. Le gagnant reçoit 20 points

### Données
```typescript
interface DebatQuestion {
  id: string
  question: string
  categorie: string
}
```

### Événements Socket.io
- `debate:submit` → Soumission d'un argument
- `debate:vote` → Vote pour un argument
- `debate:winner` → Annonce du gagnant

---

## Mode 3 : Quiz Flash

### Règles
1. Une question à choix multiple s'affiche
2. Les joueurs répondent le plus vite possible (15s)
3. Le plus rapide avec la bonne réponse gagne 15 points
4. Les autres avec la bonne réponse gagnent 5 points

### Données
```typescript
interface QuizFlashQuestion {
  id: string
  question: string
  choix: string[] // 4 choix
  reponse: number // index de la bonne réponse
  categorie: string
}
```

### Événements Socket.io
- `flash:answer` → Soumission d'une réponse avec timestamp
- `flash:results` → Résultats de la manche
```

---

## 📄 DOCUMENT 06 : UI_DESIGN.md

### Contenu à fournir

```markdown
# KOZÉ - Design System

## Couleurs

| Rôle | Couleur | Code Hex | Utilisation |
|------|---------|----------|-------------|
| Primaire | Vert tropical | #1B6B3A | Fond, éléments principaux |
| Secondaire | Jaune soleil | #F4C430 | Boutons, accents |
| Accent | Rouge volcan | #D32F2F | Alertes, timers |
| Accent | Bleu lagon | #1E90FF | Éléments aquatiques |
| Clair | Blanc chaleureux | #FDF5E6 | Textes, fonds |
| Sombre | Noir profond | #1A1A1A | Textes, contrastes |

## Typographie

| Usage | Police | Taille | Poids |
|-------|--------|--------|-------|
| Titres | Poppins | 48px | 700 |
| Sous-titres | Poppins | 24px | 600 |
| Textes | Inter | 16px | 400 |
| Petits textes | Inter | 14px | 400 |
| Boutons | Poppins | 18px | 600 |

## Composants TV

### Écran d'accueil
```
┌─────────────────────────────────────────────────┐
│  🎮 KOZÉ                                       │
│                                                 │
│  "Le jeu de soirée réunionnais"                │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐             │
│  │ CRÉER UNE   │  │ REJOINDRE   │             │
│  │ SALLE       │  │ UNE SALLE   │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
```

### Écran de salle
```
┌─────────────────────────────────────────────────┐
│  🔑 Code : 3K9A                               │
│                                                 │
│  👤 Jean-Pierre (Hôte)                         │
│  👤 Marie                                      │
│  👤 David                                      │
│  👤 Sophie                                     │
│  👤 ...                                        │
│                                                 │
│  [ LANCER LA PARTIE ]                          │
└─────────────────────────────────────────────────┘
```

## Composants Téléphone

### Écran de vote (Vrai ou Fau)
```
┌─────────────────────────────────────────────────┐
│  ⏱️ 12s                                        │
│                                                 │
│  "Le Piton de la Fournaise est entré           │
│   en éruption 12 fois en 2025."               │
│                                                 │
│  ┌──────┐  ┌──────┐                           │
│  │ VRAI │  │ FAUX │                           │
│  └──────┘  └──────┘                           │
│                                                 │
│  ⭐ 0 points                                   │
└─────────────────────────────────────────────────┘
```

## Animations
- Confettis pour les bonnes réponses
- Secousse pour les mauvaises réponses
- Transition en fondu entre les manches
- Barre de progression pour le timer
```

---

## 📄 DOCUMENT 07 : API_ENDPOINTS.md

### Contenu à fournir

```markdown
# KOZÉ - API Endpoints

## Routes REST

### Salles
```
POST   /api/rooms          → Créer une salle
GET    /api/rooms/:code    → Récupérer une salle
POST   /api/rooms/:code/join → Rejoindre une salle
POST   /api/rooms/:code/start → Démarrer la partie
POST   /api/rooms/:code/next → Question suivante
```

### Joueurs
```
POST   /api/players        → Créer un joueur
GET    /api/players/:id    → Récupérer un joueur
PUT    /api/players/:id    → Mettre à jour un joueur
```

### Questions
```
GET    /api/questions      → Récupérer les questions
GET    /api/questions/:id  → Récupérer une question
GET    /api/questions/random?mode=... → Question aléatoire
```

### Packs (Achats)
```
GET    /api/packs          → Liste des packs disponibles
POST   /api/packs/:id/buy  → Acheter un pack (Stripe)
GET    /api/packs/:id/check → Vérifier si déjà acheté
```

### Scores
```
GET    /api/scores/:roomId → Classement d'une salle
```

## Routes Socket.io

### Événements du client (joueur → serveur)
```typescript
// Rejoindre une salle
socket.emit('join-room', { roomCode: '3K9A', playerName: 'Jean-Pierre' })

// Être prêt
socket.emit('player-ready', { roomCode: '3K9A', isReady: true })

// Voter (Vrai ou Fau)
socket.emit('vote', { roomCode: '3K9A', value: true })

// Répondre (Débat)
socket.emit('debate-answer', { roomCode: '3K9A', text: '...' })

// Répondre (Quiz Flash)
socket.emit('flash-answer', { roomCode: '3K9A', answer: 'B', timestamp: Date.now() })
```

### Événements du serveur (serveur → joueurs)
```typescript
// Nouvelle question
socket.emit('new-question', { question: {...}, timer: 20 })

// Votes mis à jour
socket.emit('votes-update', { votes: { true: 4, false: 2 } })

// Révélation
socket.emit('reveal', { answer: true, explanation: '...' })

// Scores mis à jour
socket.emit('scores-update', { scores: [{name: 'Marie', points: 20}] })

// Fin de partie
socket.emit('game-over', { winner: 'Marie', scores: [...] })
```
```

---

## 📄 DOCUMENT 08 : WEBSOCKETS.md

### Contenu à fournir

```markdown
# KOZÉ - Architecture WebSocket

## Diagramme de communication

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  HÔTE    │────▶│          │◀────│ JOUEUR 1 │
│  (TV)    │     │  SOCKET  │     │ (Tel)   │
└──────────┘     │  SERVER  │     └──────────┘
                 │          │     ┌──────────┐
┌──────────┐     │          │────▶│ JOUEUR 2 │
│  HÔTE    │────▶│          │     │ (Tel)   │
│  (Bureau)│     └──────────┘     └──────────┘
└──────────┘
```

## Gestion des salles (rooms)

```typescript
// Le serveur maintient un état des salles
const rooms = new Map<string, RoomState>()

interface RoomState {
  code: string
  hostId: string
  players: Player[]
  status: 'waiting' | 'playing' | 'revealing'
  currentMode: Mode
  currentQuestion: Question
  scores: Record<string, number>
  votes: Record<string, any>
}
```

## Flow complet d'une manche (Vrai ou Fau)

```typescript
// 1. Hôte demande une question
host.emit('next-question', { roomCode: '3K9A' })

// 2. Serveur sélectionne une question
server -> hôte: 'question-selected', { question: {...} }
server -> joueurs: 'new-question', { question: {...}, timer: 20 }

// 3. Joueurs votent
joueur.emit('vote', { roomCode: '3K9A', value: true })
server -> tous: 'votes-update', { votes: { true: 4, false: 2 } }

// 4. Timer fini
server -> tous: 'reveal', { answer: true, explanation: '...' }

// 5. Scores mis à jour
server -> tous: 'scores-update', { scores: [...] }
```

## Gestion des déconnexions

```typescript
// Quand un joueur se déconnecte
socket.on('disconnect', () => {
  // Retirer le joueur de la salle
  // Si c'est l'hôte, transférer le rôle ou fermer la salle
  // Notifier les autres joueurs
})
```

## Sécurité
- Validation des codes de salle (4 lettres/majuscules)
- Limite de 8 joueurs par salle
- Temps d'inactivité (5 min) → fermeture automatique
- Rate limiting sur les événements
```

---

## 📄 DOCUMENT 09 : PAIEMENTS.md

### Contenu à fournir

```markdown
# KOZÉ - Paiements avec Stripe

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  FRONT   │────▶│  BACKEND │────▶│  STRIPE  │
│  Next.js │     │  Express │     │  API     │
└──────────┘     └──────────┘     └──────────┘
```

## Produits Stripe

### Produits (Packs)
```typescript
// Créé côté serveur Stripe
const products = {
  'pack-pei': {
    name: 'Pack Péi',
    description: '5 modes de jeu + 150 questions',
    price: 2.99,
    currency: 'eur'
  },
  'pack-soiree': {
    name: 'Pack Soirée',
    description: 'Tous les modes + 500 questions',
    price: 4.99,
    currency: 'eur'
  },
  'koze-plus': {
    name: 'Kozé+ Abonnement',
    description: 'Accès illimité à tout',
    price: 2.99,
    currency: 'eur',
    recurring: 'month'
  },
  'koze-pro': {
    name: 'Kozé Pro',
    description: 'Version pour bars et associations',
    price: 9.99,
    currency: 'eur',
    recurring: 'month'
  }
}
```

## Flow d'achat

### 1. Création de la session de paiement
```typescript
// Frontend
const createCheckout = async (packId: string) => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ packId })
  })
  const { sessionId } = await response.json()
  
  // Rediriger vers Stripe Checkout
  const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  await stripe.redirectToCheckout({ sessionId })
}

// Backend (API Route)
app.post('/api/checkout', async (req, res) => {
  const { packId } = req.body
  const product = products[packId]
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.name,
          description: product.description
        },
        unit_amount: product.price * 100,
        ...(product.recurring && {
          recurring: { interval: product.recurring }
        })
      },
      quantity: 1,
    }],
    mode: product.recurring ? 'subscription' : 'payment',
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      packId,
      playerId: req.user.id
    }
  })
  
  res.json({ sessionId: session.id })
})
```

### 2. Webhook Stripe (confirmation de paiement)
```typescript
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string
  const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { packId, playerId } = session.metadata
    
    // Enregistrer l'achat en base de données
    await prisma.purchase.create({
      data: {
        playerId,
        packId,
        amount: session.amount_total / 100,
        stripePaymentId: session.id
      }
    })
    
    // Débloquer le contenu pour le joueur
    await unlockContent(playerId, packId)
  }
  
  if (event.type === 'invoice.paid') {
    // Gérer le renouvellement d'abonnement
  }
  
  res.json({ received: true })
})
```

## Vérification des achats

```typescript
// Frontend - Vérifier si un pack est acheté
const hasPurchased = async (packId: string) => {
  const response = await fetch(`/api/packs/${packId}/check`)
  const { owned } = await response.json()
  return owned
}

// Backend
app.get('/api/packs/:packId/check', async (req, res) => {
  const { packId } = req.params
  const playerId = req.user.id
  
  const purchase = await prisma.purchase.findFirst({
    where: { playerId, packId }
  })
  
  res.json({ owned: !!purchase })
})
```

## Gestion des abonnements

```typescript
// Annuler un abonnement
app.post('/api/subscription/cancel', async (req, res) => {
  const playerId = req.user.id
  
  // Récupérer le stripeCustomerId du joueur
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  })
  
  // Récupérer tous les abonnements du client
  const subscriptions = await stripe.subscriptions.list({
    customer: player.stripeCustomerId
  })
  
  // Annuler à la fin de la période en cours
  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: true
  })
  
  res.json({ cancelled: true })
})
```

## Sécurité
- Utiliser **Checkout** Stripe (pas de manipulation des cartes côté front)
- Webhooks signés (vérifier la signature Stripe)
- Stocker seulement le `stripeCustomerId` et `stripePaymentId`
- Ne jamais stocker d'informations de carte bancaire
```

---

## 📄 DOCUMENT 10 : QUESTIONS.md

### Contenu à fournir

```markdown
# KOZÉ - Base de Questions

## Structure

```typescript
interface Question {
  id: string
  mode: 'VRAI_FAUX' | 'DEBAT' | 'QUIZ_FLASH' | 'IMPOSTEUR'
  text: string
  correctAnswer: string | boolean | number
  options?: string[] // Pour Quiz Flash
  explanation?: string // Explication
  category: 'HISTOIRE' | 'GEOGRAPHIE' | 'GASTRONOMIE' | 'EXPRESSIONS' | 'PERSONNALITES'
  difficulty: 1 | 2 | 3
  isPremium: boolean
}
```

## Questions Gratuites (50)

### Histoire (10 questions)
```typescript
// Vrai ou Fau
{
  text: "La Réunion a été découverte par des explorateurs portugais.",
  correctAnswer: true,
  explanation: "Les Portugais ont découvert l'île au XVIe siècle, avant qu'elle ne devienne française.",
  category: "HISTOIRE",
  difficulty: 1
}
{
  text: "L'esclavage a été aboli à La Réunion en 1848.",
  correctAnswer: true,
  explanation: "L'abolition de l'esclavage a été proclamée le 20 décembre 1848.",
  category: "HISTOIRE",
  difficulty: 1
}
// ... 8 autres
```

### Géographie (10 questions)
```typescript
{
  text: "Le plus haut sommet de La Réunion est le Piton de la Fournaise.",
  correctAnswer: false,
  explanation: "Le plus haut sommet est le Piton des Neiges (3070m). Le Piton de la Fournaise fait 2632m.",
  category: "GEOGRAPHIE",
  difficulty: 2
}
// ... 9 autres
```

### Gastronomie (10 questions)
```typescript
{
  text: "Le rougail saucisse se mange traditionnellement avec du riz blanc.",
  correctAnswer: true,
  explanation: "Le rougail saucisse est un plat emblématique, servi avec du riz blanc.",
  category: "GASTRONOMIE",
  difficulty: 1
}
// ... 9 autres
```

### Expressions créoles (10 questions)
```typescript
// Quiz Flash
{
  mode: "QUIZ_FLASH",
  text: "Que signifie l'expression 'Ala !' ?",
  options: ["Bonjour", "Au revoir", "Oh là là !", "Merci"],
  correctAnswer: 2, // 'Oh là là !'
  category: "EXPRESSIONS",
  difficulty: 1
}
// ... 9 autres
```

### Personnalités (10 questions)
```typescript
{
  text: "Danyèl Waro est un célèbre chanteur de maloya.",
  correctAnswer: true,
  explanation: "Danyèl Waro est un chanteur et musicien de maloya, figure emblématique de la culture réunionnaise.",
  category: "PERSONNALITES",
  difficulty: 1
}
// ... 9 autres
```

## Questions Premium (Pack Péi - 150)

### Catégories supplémentaires
- Histoire approfondie (30 questions)
- Géographie détaillée (30 questions)
- Gastronomie avancée (30 questions)
- Expressions créoles rares (30 questions)
- Personnalités locales (30 questions)

## Questions Premium (Pack Soirée - 500)

### Toutes les catégories × 100 questions
- HISTOIRE : 100 questions
- GEOGRAPHIE : 100 questions
- GASTRONOMIE : 100 questions
- EXPRESSIONS : 100 questions
- PERSONNALITES : 100 questions
```

---

## ✅ CHECKLIST : CE QUE TU DOIS FOURNIR À CLAUDE

| Document | Contenu | Statut |
| :--- | :--- | :--- |
| **01_SPEC_GENERALE.md** | Vision, concept, marché, technos | ✅ Prêt |
| **02_UX_FLOW.md** | Parcours utilisateur, écrans détaillés | ✅ Prêt |
| **03_SPEC_TECHNIQUE.md** | Stack, structure, variables d'environnement | ✅ Prêt |
| **04_BASE_DONNEES.md** | Schéma Prisma complet | ✅ Prêt |
| **05_MODES_JEU.md** | Règles détaillées des 3 modes MVP | ✅ Prêt |
| **06_UI_DESIGN.md** | Couleurs, typo, composants, wireframes | ✅ Prêt |
| **07_API_ENDPOINTS.md** | Routes REST + événements Socket | ✅ Prêt |
| **08_WEBSOCKETS.md** | Architecture temps réel, flow | ✅ Prêt |
| **09_PAIEMENTS.md** | Stripe, webhooks, abonnements | ✅ Prêt |
| **10_QUESTIONS.md** | 50 questions gratuites + structure | ✅ Prêt |

---

## 🚀 COMMENT UTILISER CES DOCUMENTS

### Étape 1 : Copier-coller dans un projet
Crée un dossier `docs/` dans ton projet et mets tous ces fichiers.

### Étape 2 : Demander à Claude de coder
**Prompt exemple :**
> *"Claude, je veux coder le jeu KOZÉ. J'ai mis tous les docs dans le dossier docs/. Commence par le backend : crée le serveur Express avec Socket.io et la gestion des salles. Utilise Prisma pour la base de données."*

### Étape 3 : Itérer
- Demande d'abord le **backend** (API + WebSockets)
- Ensuite le **frontend TV** (Next.js)
- Ensuite le **frontend téléphone** (React)
- Enfin les **paiements** (Stripe)

### Étape 4 : Tester
- Utilise les docs pour vérifier que Claude respecte les specs
- Corrige les écarts
- Itère jusqu'à ce que le jeu fonctionne

---

## 📋 RÉSUMÉ EXÉCUTIF

| Ce que tu donnes à Claude | Ce que Claude te rend |
| :--- | :--- |
| 10 documents structurés | Un code fonctionnel |
| Spécifications précises | Un backend Express + Socket.io |
| Design UI/UX | Un frontend Next.js (TV + téléphone) |
| Modèle de données | Une base PostgreSQL + Prisma |
| Règles des modes | Des modes de jeu jouables |
| Structure des paiements | Stripe intégré |

---

## 🔥 PROCHAINE ÉTAPE

**Prêt à commencer ?**

1. **Copie ces 10 documents dans un dossier `docs/`**
2. **Dis-moi si tu veux que je les complète** (ajouter des détails, des exemples)
3. **Ou commence à coder avec Claude**

**Dis-moi ce que tu veux faire maintenant !** 🚀🇷🇪