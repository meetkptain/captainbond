# Plan — Acquisition & Multi-Vertical (post-Constellation)

## Contexte
Constellation Double livrée + mergée (PR #2 : M1 seed, M2 rituel, M3 party→couple, build gate fix). CI rouge (17 tests préexistants hors scope) bloque le déploiement Cloudflare. Vision produit : connecter les gens **multi-vertical** ; acquisition couple **directe** souhaitée ; **solo-entry** comme entonnoir smart.

## Expert Growth Engineer — verdict
- **Solo-entry = move le plus smart** : acquérir 1 personne (CAC bas) → invite-loop → couple. Résout le chicken-egg (on n'acquiert plus le couple entier).
- **Paid couple seul (15–30€) NON ROI** vs LTV~32€ (sub 7,99 × 4 mois × D30 0,4). Pour LTV:CAC≥3 → **CAC≤10€**. Donc : organique Remotion (angle couple) + invite-loop = CAC≈0.
- **Cartes Découverte** = carburant solo (DAU entre rituels, étoiles individuelles).
- **M3 party→couple** = pont bonus (CAC≈0), pas le pilier.

## Roadmap cohérente

### Phase 0 — Unblock deploy (prérequis)
- Classer les 17 tests rouges (env manquante CI vs vrai bug).
- Si env : `npm test` non-bloquant OU secrets CI. Sinon : fix.
- Valider `next build` + `pages:build` verts → déploy.

### Phase 1 — Solo-entry funnel (PRIORITÉ)
- **Self tree** (`userId`) + fusion en arbre couple à l'invite (ses étoiles = sa moitié du double).
- **Cartes Découverte** : prompts solo verbatim, cadence 10–14j, hors rituel.
- **Vue ciel solo** : progression « ton ciel grandit » (raison de revenir).
- **Invite-loop** : CTA « invite pour voir vos 2 ciels s'aligner ».

### Phase 2 — Acquisition couple directe
- Creative Remotion angle couple (CTA = resonance/constellation).
- ASO « couple app / relationship questions ».
- Paid UA initiateur **seulement si test valide CAC≤10€**.

### Phase 3 — Multi-vertical
- **Pro Bar** (B2B léger, même moteur Tree, salle = groupe).
- **Corporate / Team** (phase 3, 800–1500€, gros ticket).

## Garde (metrics)
- Solo→invite activation **≥50%** (sinon CAC double).
- D30 ≥40% · Trial→Paid ≥25% · R3 (party→couple) ≥5%.
- LTV:CAC ≥3.

## Hors scope maintenant
- Corporate (2027) · DJ IA (phase 2) · Cartes Découverte en pause si DAU solo suffisant.

## Ordre d'exécution
Phase 0 → Phase 1 (lever acquisition smart) → Phase 2 (boost) → Phase 3.
