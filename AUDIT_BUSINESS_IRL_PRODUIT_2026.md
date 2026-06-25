# Audit Produit / Business / IRL — Captain Bond
## Par un panel d'experts qui savent se faire arger en 2026

> Date : juin 2026  
> Méthode : analyse codebase + veille marché + retours d'expérience apps sociales/jeux IRL

---

## 🎯 Verdict global (cash, sans langue de bois)

**Captain Bond a le cœur solide, le timing de marché parfait, mais il n'est pas encore un produit qui "marche" en 2026.**

Ce qui va dans le bon sens :
- Asymétrie TV/téléphone bien pensée
- Pricing du Pass 24h à 2,99€ bien calibré
- Webhooks Stripe réels, pas de mock
- Monétisation hybride (pass / abo / lifetime / profils / room-scope)
- QR code dans le lobby
- Consentement RGPD déplacé avant le prénom et persisté serveur
- Vocabulaire thérapeutique largement nettoyé

Ce qui bloque ou fait fuir de l'argent dès maintenant :
- **Bug de production** : `reveal` et `next-round` utilisent un `gameEnginesRegistry` qui ne contient que `IMPOSTEUR`. Les 4 autres modes vont crasher ou avoir un roundDuration faux.
- **Incohérence de prix critique** : config 1,99€/2,99€, catalogue Stripe 9,99€/14,99€, UI hardcodée 9,99€/14,99€.
- **Paywall brutal** après 3 questions sans jauge, sans préparation, sans upsell abonnement.
- **Seul l'hôte peut débloquer la room** : en soirée, c'est souvent celui qui paie le moins.
- **Aucune stratégie de distribution** : le produit ne se vendra pas tout seul.
- **Onboarding quasi inexistant** : un nouveau joueur ne comprend pas son rôle en 10s.
- **Pas de rétention cross-session** : aucune raison de revenir après la soirée.

**Verdict : c'est un MVP technique prometteur, pas un produit prêt à scale. Encore 2-3 semaines de polish P0 + 1 mois de distribution IRL pour valider que des inconnus paient.**

---

## 🚨 P0 — Bloquants (à fixer avant toute acquisition payante)

### 1. Bug `gameEnginesRegistry` — crash en production
**Problème** : `src/game-modes/engines.ts` ne registre que `IMPOSTEUR`.  
`src/app/api/room/reveal/route.ts` ligne 114 et `src/app/api/room/next-round/route.ts` ligne 207 l'utilisent.

**Conséquence** :
- Icebreaker / Spicy / Deep / Date Night : `reveal` retourne 500 `"Game mode X is not registered"`
- `roundDuration` retourne 30s fallback pour tous les modes sauf Imposteur (heureusement UI gère `isUntimed` pour Deep/Date Night)

**Fix** : supprimer `gameEnginesRegistry` et utiliser `getServerGameMode` de `@/game-modes/manifests` partout. Les engines de Icebreaker/Spicy/Deep/Date Night sont triviaux (validateResponse true, calculateScores vide).

**Fichiers** : `src/game-modes/engines.ts`, `src/app/api/room/reveal/route.ts`, `src/app/api/room/next-round/route.ts`

---

### 2. Incohérence prix catastrophique
**Problème** : 3 sources de vérité contradictoires.

| Source | Dossier individuel | Dossier couple |
|---|---|---|
| `MONETIZATION_CONFIG` | 1,99€ | 2,99€ |
| `catalog.ts` (fallback) | 9,99€ | 14,99€ |
| Stripe Checkout (via catalog) | 9,99€ | 14,99€ |
| UI `ClassifiedDossierPlayer.tsx` | 9,99€ hardcodé | 14,99€ hardcodé |

**Conséquence** : A/B testing impossible, bugs de pricing à venir, confusion produit.

**Décision à prendre** :
- **Option A (volume / early-stage)** : Dossier 4,99€, Couple 9,99€ → aligner config + catalogue + UI.
- **Option B (value / premium)** : Garder 9,99€/14,99€ → supprimer `MONETIZATION_CONFIG` ou le synchroniser.

**Recommandation** : Option A. Un produit nouveau doit d'abord prouver sa valeur. 9,99€ pour un PDF/écran en fin de soirée tue la conversion. Tester 4,99€/9,99€ dès le lancement.

**Fichiers** : `src/lib/config/monetization.ts`, `src/lib/monetization/catalog.ts`, `src/components/endgame/ClassifiedDossierPlayer.tsx`

---

### 3. Paywall brutal après 3 questions
**Problème** : `FREE_QUESTIONS_LIMIT = 3` dans `next-round`. Pas de jauge visible. Pas de préparation au tour 2. Paywall unique (Pass 24h) sans upsell abonnement.

**Conséquence** : choc utilisateur en pleine soirée, churn immédiat, conversion tuée.

**Fix** :
1. Afficher "Carte gratuite X/3" dans le header TV + controller.
2. Au tour 2, bandeau : "Encore 1 carte gratuite. Passez en soirée premium pour débloquer Deep, Date Night et les profils."
3. Paywall multi-offres : Pass 24h 2,99€ / Premium mensuel 7,99€ / Annuel 39,99€.

**Fichiers** : `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`, `src/app/api/room/next-round/route.ts`

---

### 4. Seul l'hôte peut payer pour la room
**Problème** : `next-round` ne vérifie que `hostPlayer.userId` + room pass. Un joueur non-hôte qui paie ne débloque pas la room.

**Conséquence** : friction sociale. L'hôte est souvent celui qui a déjà fourni la TV/bière. Le vrai payeur est un autre joueur.

**Fix** : dans `next-round`, vérifier si **l'un des joueurs de la room** a un pass actif OU si la room a un pass actif. Le bouton "Débloquer" doit fonctionner pour tout le monde.

**Fichiers** : `src/app/api/room/next-round/route.ts`, `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`

---

### 5. Limites de joueurs non appliquées au lancement d'un round
**Problème** : `set-mode` vérifie min/max, mais `next-round` ne vérifie rien. Si l'hôte change de mode en cours de route ou si des joueurs partent, Date Night peut se lancer à 1 ou 8 joueurs.

**Fix** : ajouter une vérification min/max joueurs dans `next-round` avant de tirer la carte.

**Fichier** : `src/app/api/room/next-round/route.ts`

---

### 6. Aucun onboarding
**Problème** : un nouvel hôte crée une room et ne sait pas quoi faire. Un nouveau joueur rejoint et ne comprend pas que son téléphone est une manette.

**Fix** : micro-onboarding 3 slides :
- Hôte : "1. Posez cette page devant la TV. 2. Les joueurs scannent le QR. 3. Vous tirez les cartes."
- Joueur : "Scannez le QR. Tapez votre prénom. Regardez la TV, répondez sur votre téléphone."

**Fichiers** : `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`, `src/app/join/[code]/page.tsx`

---

### 7. Safe word / pause globale absente
**Problème** : sur du contenu émotionnel/intime, aucun garde-fou visible. Risque d'expérience gênante en soirée, surtout avec alcool.

**Fix** : bouton "Pause / Je passe" permanent dans le controller joueur + TV. Une question passée = nouvelle question automatique.

**Fichiers** : `src/app/room/[code]/player/page.tsx`, `src/app/room/[code]/page.tsx`

---

## 💰 P1 — Fuites de revenus (à fixer dans les 2 semaines suivantes)

### 8. Pass Week-end invisible
Existe dans `catalog.ts` (4,99€) mais aucun bouton ne le vend. Pourtant c'est un upsell naturel vendredi/samedi.

**Fichiers** : `src/app/room/[code]/page.tsx`, `src/app/room/[code]/player/page.tsx`, nouvelle route `src/app/api/checkout/weekend/route.ts`

### 9. Lifetime à 69,99€ sans limite
Cappe le LTV. A remplacer par une offre de lancement limitée (100 premiers) ou supprimer purement.

**Fichier** : `src/lib/monetization/catalog.ts`

### 10. Aucun upsell abonnement dans le paywall
Le paywall ne propose que le Pass 24h. On rate la conversion en abonnement.

**Fichiers** : `src/app/room/[code]/page.tsx`, `src/components/endgame/ClassifiedDossierPlayer.tsx`

### 11. "Test solo" mal nommé
Le bouton "Test solo" sur la landing oriente vers un usage solitaire. Renommer "Voir la démo" ou "Essayer seul".

**Fichier** : `src/app/page.tsx`

### 12. Achats non récupérables sur un autre device
L'User est créé avec un email temporel `player-xxx@captainbond.com`. L'utilisateur ne peut pas récupérer ses achats ailleurs.

**Fix** : après un achat, forcer un modal "Sauvegarder avec mon email / Google / Apple".

**Fichiers** : `src/lib/monetization/checkout.ts`, `src/app/room/[code]/player/page.tsx`, `src/components/AuthModal.tsx`

### 13. Landing page : promesse encore trop abstraite
"Le DJ de votre soirée" est mieux qu'avant, mais en 5 secondes on ne comprend pas que c'est :
- Un jeu autour d'une TV
- Avec des téléphones comme manettes
- Qui pose des questions selon l'ambiance

**Fix** : ajouter un GIF/vidéo 6s montrant TV + téléphones + question + réaction. Reformuler le hero : "Le jeu qui pose les bonnes questions à votre soirée."

**Fichier** : `src/app/page.tsx`

---

## 🚀 P2 — Distribution IRL & Scale (à lancer dès que P0 corrigés)

### 14. Aucun canal d'acquisition
Captain Bond ne se vendra pas tout seul. Il faut un plan de distribution offline.

**Canaux à prioriser** :
1. Bars / cafés / rooftops (soirées thématiques, créneaux creux)
2. EVJF / EVG (pack personnalisé 150-500€)
3. Team-building entreprise (atelier 90 min 800-1 500€)
4. Speed-friending / dîners entre inconnus

### 15. Kit IRL minimal manquant
Pour un pilote de 30 jours, il faut :
- Landing `/soiree-[ville]` avec UTM
- QR codes trackés par établissement (`?ref=bar-x`)
- Script hôte 60 secondes
- Micro-onboarding intégré
- Jauge freemium visible
- Bouton partage natif WhatsApp/SMS

### 16. Pas de viral loop optimisé
- Partage Story existe mais nécessite capture d'écran manuelle.
- Pas de bouton "Inviter sur WhatsApp".
- Pas de referral / code promo.
- Pas de #CaptainBondReveal.

### 17. Pas de rétention cross-session
- Pas d'historique de parties
- Pas de collection d'archétypes
- Pas de "Rejouer avec ce groupe"
- Pas de weekly push

### 18. Pas de mode "table unique" sans TV
Beaucoup d'apéros n'ont pas de TV. Friction d'usage réelle.

---

## 📊 Stack de prix recommandé 2026

| Offre | Prix actuel | Prix recommandé | Justification |
|---|---|---|---|
| Pass 24h | 2,99€ | **2,99€** ✅ | Anchor price parfait, ne pas toucher |
| Pass Week-end | 4,99€ | **4,99€** ✅ | Upsell naturel, à exposer |
| Dossier individuel | 9,99€ | **4,99€** | Volume > marge au démarrage |
| Dossier couple | 14,99€ | **9,99€** | Seuil d'impulsion pour un couple |
| Abo mensuel | 7,99€ | **7,99€** ✅ | Aligné marché |
| Abo annuel | 39,99€ | **39,99€** ✅ | Bonne perception |
| Lifetime | 69,99€ | **69,99€ limité** | Offre de lancement seulement |
| Pack événement B2B | — | **29,99€/soirée** | Marché team-building/EVG |
| Atelier entreprise | — | **800-1 500€** | Fort ARPU |

---

## 🗓 Plan d'action 30 jours

### Semaine 1 — P0 (critique)
- [ ] Fix `gameEnginesRegistry` → utiliser `getServerGameMode`
- [ ] Aligner les prix (config + catalogue + UI)
- [ ] Ajouter vérification min/max dans `next-round`
- [ ] Permettre à n'importe quel joueur de payer pour la room
- [ ] Ajouter jauge "Carte gratuite X/3"
- [ ] Ajouter micro-onboarding hôte + joueur
- [ ] Ajouter bouton pause / safe word

### Semaine 2 — Paywall & conversion
- [ ] Refaire le paywall multi-offres (Pass / Mensuel / Annuel)
- [ ] Exposer le Pass Week-end
- [ ] Préparer le paywall au tour 2
- [ ] Limiter ou retirer le Lifetime
- [ ] Ajouter sauvegarde compte après achat
- [ ] Refaire landing avec vidéo/GIF 6s

### Semaine 3 — Viralité & distribution
- [ ] Bouton "Inviter sur WhatsApp" dans le lobby
- [ ] Partage Story natif (pas capture d'écran)
- [ ] QR codes trackés par établissement
- [ ] Landing `/soiree-[ville]`
- [ ] Script hôte 60s

### Semaine 4 — Pilote IRL
- [ ] 3 bars, 6 soirées, 1 ville
- [ ] Objectif : 50+ rooms, 5-7 joueurs/room, 8%+ conversion Pass, 15%+ partages story
- [ ] Collecter feedback verbal NPS > 7

---

## 🎯 KPIs à tracker dès le lancement

| KPI | Cible J30 | Où le mesurer |
|---|---|---|
| Rooms créées/semaine | 100+ | Supabase `Room` |
| Joueurs par room (médiane) | 5-7 | Supabase `Player` |
| Taux de conversion Pass 24h | > 8% | Stripe + `Purchase` |
| Taux de conversion Dossier | > 15% des fin de partie | Stripe + `Purchase` |
| Partages Story / room | > 15% | Analytics + manuel |
| Revenu/semaine | 200-500€ | Stripe |
| NPS verbal | > 7 | Question sur place |

---

## ⚡ Top 5 quick wins

1. **Fixer le bug `gameEnginesRegistry`** — sinon rien ne marche en production.
2. **Aligner les prix** — décision immédiate : 4,99€ / 9,99€.
3. **Jauge "Carte gratuite X/3"** — baisse le choc du paywall.
4. **N'importe qui peut payer** — augmente la conversion sociale.
5. **Ajouter un bouton WhatsApp** dans le lobby — premier canal d'acquisition gratuit.

---

## 💬 Mot de la fin

> "Captain Bond n'est pas encore un business. C'est un MVP avec un timing de fou. Mais en 2026, un bon produit ne suffit pas : il faut une distribution, une monétisation sans friction, et un onboarding qui transforme le premier contact en 'wow' en 10 secondes. Vous avez les 3 à portée de main."
