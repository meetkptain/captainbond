# Migration — Monétisation robuste v2

Cette migration doit être appliquée sur la base Supabase avant le déploiement.

## 1. Appliquer le SQL

1. Ouvrir le **SQL Editor** du projet Supabase.
2. Copier-coller le contenu de `prisma/migrations/20260618_monetization_v2/migration.sql`.
3. Exécuter.

Le script fait :
- Création des enums `SubscriptionStatus`, `PurchaseStatus`, `ProductType`
- Ajout des colonnes sur `Pack`, `User`, `Purchase`, `Room`
- Création des tables `UserPass` et `UserPack`
- Migration des achats legacy (`pass-24h`, `profile`) vers des vrais packs
- Seed du catalogue officiel v2 (Pass 24h à 2,99€, Dossier à 9,99€, Abo annuel, Lifetime, etc.)

## 2. Configurer Stripe

Dans le **Stripe Dashboard** :

1. Créer les produits suivants :
   - Pass 24h — 2,99€
   - Pass Week-end — 4,99€
   - Dossier Classifié — 9,99€
   - Dossier Couple — 14,99€
   - Captain Bond Premium Annuel — 39,99€ (recurring, yearly)
   - Captain Bond Premium Mensuel — 7,99€ (recurring, monthly)
   - Captain Bond Lifetime — 69,99€

2. Copier les **Price IDs** (`price_xxx`) dans la table `Pack` :

```sql
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'PASS_24H';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'PASS_WEEKEND';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'PROFILE';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'PROFILE_COUPLE';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'SUBSCRIPTION_ANNUAL';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'SUBSCRIPTION_MONTHLY';
UPDATE "Pack" SET "stripePriceId" = 'price_xxx' WHERE sku = 'LIFETIME';
```

3. Configurer le webhook Stripe :
   - Endpoint : `https://<ton-domaine>/api/webhook`
   - Événements :
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
     - `charge.refunded`

## 3. Variables d'environnement

S'assurer que `.env.local` contient :

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://captainbond.com
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=...
NEXT_PUBLIC_POSTHOG_KEY=phc_...  # optionnel
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # optionnel
```

## 4. Déploiement

```bash
npm run build
npm run pages:deploy
```

## 5. Vérification post-déploiement

1. Créer une room
2. Choisir le mode `DEEP_CONNECTION` ou `DATE_NIGHT`
3. Vérifier que le paywall s'affiche
4. Payer avec une carte de test Stripe (`4242 4242 4242 4242`)
5. Vérifier que le mode est débloqué
6. Terminer la partie
7. Vérifier que le Dossier est débloqué (ou accessible si Pass actif)
8. Vérifier que le webhook a bien enregistré l'achat dans `Purchase`
