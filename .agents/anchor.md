# Session: Social Media Foundations + Shorts/Reels Pipeline

## Goal
Poser les fondations sociales de Captain Bond (liens footer, métadonnées, partage) + construire la pipeline de production vidéo pour Shorts/Reels/TikTok.

## Progress
### Done
- **Social links footer**: Instagram, TikTok, YouTube, X dans LandingLayout.tsx
- **twitter:site + twitter:creator** dans le root layout
- **JSON-LD sameAs** : 4 réseaux ajoutés (était : GitHub uniquement)
- **ShareSheet** : bouton X/Twitter share intent ajouté
- **Pipeline vidéo** : scripts/render_video.py (Pillow + FFmpeg), test render ✅
- **Build 71/71** ✅, push main

### In Progress / Blocked
- Production des 5 vraies vidéos Shorts/Reels → bloqué OpenAI API key (pas encore configurée dans .env)
- Phase 2 : optimiser OG/twitter meta sur toutes les pages filles

## Key Decisions
- Footer links > header (header nav déjà plein). Social proof visible mais pas intrusive.
- Utiliser Twitter/X share intent plutôt que l'API Twitter (pas de dépendance OAuth)
- Pipeline vidéo custom (Pillow + FFmpeg) plutôt que Remotion — plus rapide pour du texte + background

## Next Steps
1. Ajouter `OPENAI_API_KEY=sk-...` dans `.env` → lancer génération assets + TTS
2. Production des 5 vidéos (Party 3x + Couple 2x)
3. Optimiser twitter:site sur toutes les landing pages filles
4. Embed Instagram/TikTok sur landing page (preuve sociale)

## Relevant Files
- `src/components/landing/LandingLayout.tsx` : footer avec 4 liens sociaux
- `src/app/layout.tsx` : twitter:site/creator + sameAs enrichi
- `src/components/ShareSheet.tsx` : X share intent ajouté
- `scripts/render_video.py` : pipeline vidéo Pillow + FFmpeg
- `docs/AUDIT_GAME_DESIGN_UX_MARKET_2026-06-20.md` : social proof score 3/10 (amélioré)
