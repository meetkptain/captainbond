# 🚀 GUIDE DE DÉMARRAGE ET DÉPLOIEMENT EN PRODUCTION (KOZÉ)

Ce guide décrit en détail les étapes pour mettre en production le jeu **KOZÉ**, configurer les services tiers (Supabase, Wasabi S3, Stripe, Google Gemini) et alimenter votre première banque de questions avec les thèmes, catégories et tags optimaux.

---

## 🗺️ 1. Architecture du Système en Production

```
                     ┌────────────────────────┐
                     │    CLOUDFLARE PAGES    │
                     │  (Edge workerd Engine) │
                     └─────┬────────────┬─────┘
                           │            │
            (API REST / Sockets)     (Pre-signed URL direct upload)
                           ▼            ▼
                 ┌───────────┐        ┌───────────┐
                 │  SUPABASE │        │ WASABI S3 │
                 │ (Database)│        │ (Storage) │
                 └───────────┘        └───────────┘
```

---

## 🗄️ 2. Étape 1 : Base de Données Supabase (Migrations & RLS)

Supabase sert de base de données PostgreSQL temps réel.

### A. Déployer le schéma de base de données
1. Récupérez la chaîne de connexion PostgreSQL de production dans le Dashboard Supabase (Settings -> Database -> **Connection string** -> Choose **Transaction Pooler** / port `6543`).
2. Ouvrez le fichier [.env.local](file:///c:/Users/Lenovo/Desktop/koze/.env.local) et modifiez la variable `DATABASE_URL` (décommentez la ligne de prod) :
   ```env
   DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[VOTRE_ID_SUPABASE].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
3. Exécutez la commande Prisma pour injecter le schéma dans votre base de production :
   ```powershell
   npx prisma db push
   ```

### B. Activer la Sécurité Row Level Security (RLS)
Pour empêcher les tricheurs d'écrire ou de modifier les scores et les questions, vous devez sécuriser la base de données :
1. Allez dans l'onglet **SQL Editor** de votre console Supabase.
2. Créez une nouvelle requête et collez-y l'intégralité du script de sécurité : [supabase_rls.sql](file:///c:/Users/Lenovo/Desktop/koze/supabase_rls.sql).
3. Cliquez sur **Run** pour appliquer les règles.

---

## 📦 3. Étape 2 : Configuration du Stockage Wasabi S3

Wasabi héberge les images associées aux questions.

1. Créez un bucket public sur Wasabi (ex: `koze-media-bucket`).
2. Allez dans les paramètres du bucket -> **CORS** et appliquez la règle suivante pour autoriser les chargements en direct depuis votre nom de domaine de production et localhost :
   ```xml
   <CORSConfiguration>
     <CORSRule>
       <AllowedOrigin>https://*.pages.dev</AllowedOrigin>
       <AllowedOrigin>https://votre-domaine-koze.re</AllowedOrigin>
       <AllowedOrigin>http://localhost:3000</AllowedOrigin>
       <AllowedMethod>PUT</AllowedMethod>
       <AllowedMethod>GET</AllowedMethod>
       <AllowedHeader>*</AllowedHeader>
       <MaxAgeSeconds>3000</MaxAgeSeconds>
     </CORSRule>
   </CORSConfiguration>
   ```

---

## 💳 4. Étape 3 : Liaison de Monétisation Stripe

KOZÉ permet de vendre des packs de questions premium.

1. Créez vos packs (ex: "Pack 18+ Volcan") en tant que **Produit** dans votre dashboard Stripe.
2. Créez un tarif associé (ex: `2.99 €` en paiement unique).
3. Récupérez l'identifiant du prix Stripe (ex: `price_1Qs...`) et configurez-le sur vos modèles de Packs dans Supabase.
4. Activez le webhook :
   - Allez dans Stripe -> Développeurs -> **Webhooks** -> Ajouter un point de terminaison.
   - URL d'envoi : `https://[votre-domaine].pages.dev/api/webhook`.
   - Événement à écouter : `checkout.session.completed`.
   - Copiez la clé secrète de signature (`whsec_...`) dans votre variable `STRIPE_WEBHOOK_SECRET`.

---

## ☁️ 5. Étape 4 : Déploiement sur Cloudflare Pages

1. Reliez votre dépôt de code (ex: GitHub) à votre projet **Cloudflare Pages**.
2. Renseignez les paramètres de compilation dans la console Cloudflare :
   - **Framework preset** : `Next.js` (ou `None` si manuel).
   - **Build command** : `npm run pages:build` (génère l'Edge Worker).
   - **Build output directory** : `.open-next` (génère la sortie compatible Pages).
3. Activez le support Node.js dans Cloudflare Pages (Paramètres du projet -> Fonctions -> Compatibilité -> Ajoutez le drapeau `nodejs_compat` dans les paramètres de compatibilité).
4. Renseignez les **Variables d'Environnement de Production** suivantes dans la console Cloudflare (Paramètres -> Variables d'environnement) :

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
ADMIN_PASSWORD="VotreMotDePasseDAdministrationFort"
WASABI_ACCESS_KEY_ID="VOTRE_ACCESS_KEY"
WASABI_SECRET_ACCESS_KEY="VOTRE_SECRET_KEY"
WASABI_BUCKET_NAME="koze-media-bucket"
WASABI_REGION="eu-central-1"
WASABI_ENDPOINT="https://s3.eu-central-1.wasabisys.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GEMINI_API_KEY="AIzaSy..."
GOOGLE_SHEETS_CSV_URL="https://docs.google.com/spreadsheets/d/e/VOTRE_ID_EXCEL/pub?output=csv"
ADMIN_SYNC_SECRET="votre_secret_sync_long_et_securise"
HMAC_IMPOSTEUR_SECRET="votre_secret_imposteur_long_et_aleatoire"
```

---

## 🎯 6. Étape 5 : Alimenter le Jeu (Thèmes, Tags & Questions)

Pour que KOZÉ soit attrayant dès son lancement, il vous faut une banque de questions structurée. 

### A. Guide de Structuration (Catégories et Tags)
Les catégories et tags permettent de filtrer les questions pour s'adapter à l'ambiance de la soirée.

#### 1. Les Catégories (Sémantiques SQL)
Le schéma Prisma impose l'une de ces 8 catégories :
*   `GENERAL` : Culture générale réunionnaise.
*   `HISTOIRE` : L'histoire de l'île (marronnage, colonisation, événements marquants).
*   `GEOGRAPHIE` : Les cirques, les remparts, le volcan, les sentiers.
*   `GASTRONOMIE` : Le rougail, les samoussas, le rhum arrangé, les cari.
*   `EXPRESSIONS` : Devinettes sur les proverbes créoles ("Kréol i koze").
*   `PERSONNALITES` : Personnalités locales (musiciens, sportifs, figures historiques).
*   `SPORT` : Le Grand Raid / Diagonale des Fous, football local.
*   `MUSIQUE` : Maloya, Séga, artistes péi.

#### 2. Les Tags Conseillés (Filtrage de Soirée)
Les tags s'injectent sous forme de tableau de chaînes de caractères (ex: `["18+", "touriste"]`). Voici la structure conseillée :
*   `"18+"` ou `"sexy"` : Questions épicées pour adultes (à activer via option de salon).
*   `"touriste"` : Idéal pour les gens de passage (questions faciles ou explicatives).
*   `"gramoun"` : Proverbes anciens ou culture pointue.
*   `"creole"` : Questions rédigées ou axées sur la langue créole.
*   `"rapide"` : Quiz ou défis à répondre en moins de 10 secondes.

---

### B. Méthodes d'Alimentation de la Banque

#### Méthode 1 : Alimentation IA via l'Admin Dashboard (Recommandé)
Vous pouvez générer des centaines de questions thématiques en quelques minutes sans écrire de code.
1. Connectez-vous sur votre dashboard à l'adresse `/admin` avec votre mot de passe administrateur.
2. Allez dans l'onglet **Générateur IA**.
3. Choisissez le mode de jeu (ex: `VRAI_FAUX` ou `DEBAT`).
4. Saisissez un prompt thématique (ex: *"Le rougail saucisse, le rhum et les fruits tropicaux de La Réunion"*).
5. Ajustez le nombre de questions et cliquez sur **Générer**.
6. Relisez et modifiez le texte des questions générées directement à l'écran.
7. Cliquez sur **Sauvegarder** pour les insérer instantanément en base.

#### Méthode 2 : Import CSV Collaboratif (Google Sheets)
Si vous travaillez avec des rédacteurs de contenu :
1. Créez un tableau Google Sheets avec ces colonnes exactes :
   `mode`, `text`, `correctAnswer`, `options`, `explanation`, `category`, `difficulty`, `isPremium`, `tags`
2. Exemple de ligne de données :
   - `mode` : `VRAI_FAUX`
   - `text` : `Le piton des Neiges est le point culminant de l'océan Indien.`
   - `correctAnswer` : `true`
   - `options` : *(laisser vide)*
   - `explanation` : `Il culmine à 3 070 mètres d'altitude.`
   - `category` : `GEOGRAPHIE`
   - `difficulty` : `1`
   - `isPremium` : `false`
   - `tags` : `touriste, geographie`
3. Publiez la feuille sur le web (Fichier -> Partager -> Publier sur le web -> Choisissez **Valeurs séparées par des virgules (.csv)**) et copiez l'URL.
4. Renseignez cette URL dans votre variable `GOOGLE_SHEETS_CSV_URL`.
5. Pour déclencher la synchronisation et écraser/ajouter les questions en production, envoyez une requête POST (ou ouvrez l'URL) sur :
   ```
   https://[votre-domaine].pages.dev/api/admin/sync?secret=[VOTRE_ADMIN_SYNC_SECRET]
   ```
   *(Le script edge téléchargera le CSV, le parsera et insérera le contenu dans Supabase en quelques millisecondes).*
