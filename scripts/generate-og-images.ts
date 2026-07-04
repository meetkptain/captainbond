import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('public/og');
const FONT_BOLD = fs.readFileSync(path.resolve('scripts/Outfit-Bold.ttf')).toString('base64');
const FONT_REGULAR = fs.readFileSync(path.resolve('scripts/Outfit-Regular.ttf')).toString('base64');

type Decoration = 'confetti' | 'couple-circles' | 'grid' | 'bubbles' | 'chart' | 'game-dots';
type Layout = 'left' | 'centered';

interface OgImage {
  filename: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  decoration: Decoration;
  layout: Layout;
}

const images: OgImage[] = [
  // ── LANDING PAGES (10) ──
  { filename: 'home-en.webp', title: 'Captain Bond', subtitle: 'Party games. Couple rituals. Team building. One platform.', gradient: ['#4f46e5', '#0d9488'], decoration: 'confetti', layout: 'centered' },
  { filename: 'home-fr.webp', title: 'Captain Bond', subtitle: 'Jeux de soirée. Rituels couple. Team building.', gradient: ['#4f46e5', '#0d9488'], decoration: 'confetti', layout: 'centered' },
  { filename: 'party-en.webp', title: 'Party Games', subtitle: 'Your TV is the board. Your phone is the controller.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'soiree-fr.webp', title: 'Jeux de Soirée', subtitle: 'La TV devient plateau, les téléphones manettes.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'couple-en.webp', title: 'Couple Space', subtitle: 'Daily rituals. Deep connection. Harmony gauge.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'couple-fr.webp', title: 'Espace Couple', subtitle: 'Rituels quotidiens. Connexion profonde.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'pro-en.webp', title: 'Pro Solutions', subtitle: 'Interactive team building for bars & companies.', gradient: ['#4f46e5', '#0d9488'], decoration: 'grid', layout: 'left' },
  { filename: 'pro-fr.webp', title: 'Solutions Pro', subtitle: 'Team building interactif pour bars & entreprises.', gradient: ['#4f46e5', '#0d9488'], decoration: 'grid', layout: 'left' },
  { filename: 'pricing-en.webp', title: 'Simple Pricing', subtitle: 'Start free. Unlock unlimited. 3 ways to play.', gradient: ['#7c3aed', '#2563eb'], decoration: 'grid', layout: 'centered' },
  { filename: 'tarifs-fr.webp', title: 'Tarifs Simples', subtitle: 'Gratuit pour commencer. Illimité ensuite.', gradient: ['#7c3aed', '#2563eb'], decoration: 'grid', layout: 'centered' },

  // ── B2B / CORPORATE (6) ──
  { filename: 'b2b.webp', title: 'B2B Solutions', subtitle: 'Engage your customers with interactive games.', gradient: ['#4f46e5', '#0891b2'], decoration: 'grid', layout: 'left' },
  { filename: 'bars-cafes.webp', title: 'Bars & Cafés', subtitle: 'Boost revenue with trivia & game nights.', gradient: ['#d97706', '#dc2626'], decoration: 'bubbles', layout: 'left' },
  { filename: 'corporate.webp', title: 'Team Building', subtitle: 'Interactive onboarding & corporate events.', gradient: ['#4f46e5', '#059669'], decoration: 'grid', layout: 'left' },

  // ── BLOG — PARTY (12 EN + 12 FR) ──
  { filename: 'blog-party-adults-2026-en.webp', title: 'Best Party Games for Adults 2026', subtitle: 'The ultimate party game guide for adults.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-party-adults-2026-fr.webp', title: 'Meilleurs Jeux de Soirée 2026', subtitle: 'Le guide ultime des jeux pour adultes.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-party-large-groups-en.webp', title: 'Party Games for Large Groups', subtitle: '10-50+ players. No app needed.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-party-large-groups-fr.webp', title: 'Jeux pour Grands Groupes', subtitle: '10-50+ joueurs. Aucune appli nécessaire.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-halloween-en.webp', title: 'Halloween Party Games', subtitle: '10+ spooky games for your Halloween party.', gradient: ['#ea580c', '#7c2d12'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-halloween-fr.webp', title: 'Jeux Halloween Adultes', subtitle: '10+ jeux pour une soirée d\'enfer.', gradient: ['#ea580c', '#7c2d12'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-icebreaker-en.webp', title: 'Icebreaker Games for Adults', subtitle: 'Break the ice at any party or gathering.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-icebreaker-fr.webp', title: 'Jeux Brise-Glace Adultes', subtitle: 'Brisez la glace à votre prochaine soirée.', gradient: ['#db2777', '#ea580c'], decoration: 'confetti', layout: 'left' },
  { filename: 'blog-game-night-en.webp', title: 'Game Night Guide', subtitle: 'How to host an unforgettable evening.', gradient: ['#7c3aed', '#db2777'], decoration: 'game-dots', layout: 'left' },
  { filename: 'blog-game-night-fr.webp', title: 'Soirée Jeux', subtitle: 'Organisez une soirée inoubliable.', gradient: ['#7c3aed', '#db2777'], decoration: 'game-dots', layout: 'left' },
  { filename: 'blog-trivia-en.webp', title: 'Bar Trivia Night Guide', subtitle: 'Host a successful quiz night at your bar.', gradient: ['#d97706', '#dc2626'], decoration: 'bubbles', layout: 'left' },
  { filename: 'blog-trivia-fr.webp', title: 'Soirée Quiz au Bar', subtitle: 'Guide complet pour animateurs de quiz.', gradient: ['#d97706', '#dc2626'], decoration: 'bubbles', layout: 'left' },
  { filename: 'blog-bar-revenue-en.webp', title: 'Bar Revenue Guide', subtitle: 'Boost your weekday business with events.', gradient: ['#d97706', '#dc2626'], decoration: 'bubbles', layout: 'left' },
  { filename: 'blog-bar-revenue-fr.webp', title: 'Chiffre d\'Affaires Bar', subtitle: 'Augmentez votre activité en soirée.', gradient: ['#d97706', '#dc2626'], decoration: 'bubbles', layout: 'left' },

  // ── BLOG — COUPLE (16 EN + 16 FR) ──
  { filename: 'blog-deep-questions-en.webp', title: '50 Deep Questions for Couples', subtitle: 'Strengthen your bond with deep conversations.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-deep-questions-fr.webp', title: '50 Questions Profondes', subtitle: 'Renforcez votre connexion en profondeur.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-questions-partner-en.webp', title: 'Questions to Ask Your Partner', subtitle: '100+ questions for every relationship stage.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-questions-partner-fr.webp', title: 'Questions à Poser à Son Partenaire', subtitle: '100+ questions pour chaque étape du couple.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-build-intimacy-en.webp', title: 'Build Intimacy Together', subtitle: '30 questions to deepen your connection.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-build-intimacy-fr.webp', title: 'Construire l\'Intimité', subtitle: '30 questions pour une connexion plus profonde.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-communication-en.webp', title: 'Couple Communication Exercises', subtitle: '10 practical exercises for better connection.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-communication-fr.webp', title: 'Exercices Communication', subtitle: '10 exercices pour mieux communiquer.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-couple-guide-en.webp', title: 'Couple Questions Complete Guide', subtitle: 'A step-by-step system for meaningful talks.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-couple-guide-fr.webp', title: 'Guide Complet Questions Couple', subtitle: 'Un système pas à pas pour des talks profonds.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-best-couple-app-en.webp', title: 'Best Couple App 2026', subtitle: '5 relationship apps tested & compared.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-best-couple-app-fr.webp', title: 'Meilleure Appli Couple 2026', subtitle: '5 applis testées et comparées.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-weekly-ritual-en.webp', title: 'Weekly Couple Ritual', subtitle: 'The 5-minute habit that transforms relationships.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-weekly-ritual-fr.webp', title: 'Rituel Couple Hebdomadaire', subtitle: 'L\'habitude de 5 min qui transforme le couple.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-questions-couple-en.webp', title: 'Questions pour Couple', subtitle: 'The best questions for deeper connection.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
  { filename: 'blog-questions-couple-fr.webp', title: 'Questions pour Couple FR', subtitle: 'Les meilleures questions pour se connecter.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },

  // ── BLOG — DATA STUDY (2) ──
  { filename: 'blog-data-study-en.webp', title: 'Couple Connection Data Study', subtitle: '1,237 sessions analyzed. Original research.', gradient: ['#475569', '#7c3aed'], decoration: 'chart', layout: 'left' },
  { filename: 'blog-data-study-fr.webp', title: 'Étude Données Connexion Couple', subtitle: '1 237 sessions analysées. Recherche originale.', gradient: ['#475569', '#7c3aed'], decoration: 'chart', layout: 'left' },

  // ── PRINTABLES (1) ──
  { filename: 'printables-couple-questions.webp', title: 'Couple Questions Card Deck', subtitle: 'Printable cards for deeper conversations.', gradient: ['#ec4899', '#7c3aed'], decoration: 'couple-circles', layout: 'centered' },
];

// ── SVG DECORATION HELPERS ──

function confettiSvg(): string {
  const circles = [
    [1050, 80, 280], [150, 550, 220], [600, 630, 350],
    [1100, 450, 120], [200, 150, 80], [50, 300, 60],
    [900, 200, 100], [400, 100, 50], [700, 500, 70],
    [250, 400, 40], [1000, 350, 90], [500, 300, 30],
  ];
  return circles.map(([cx, cy, r]) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,${(Math.random() * 0.03 + 0.02).toFixed(2)})" />`
  ).join('\n  ');
}

function coupleCirclesSvg(): string {
  return `
    <circle cx="800" cy="315" r="180" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
    <circle cx="660" cy="315" r="180" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
    <circle cx="730" cy="315" r="100" fill="rgba(255,255,255,0.03)" />
    <circle cx="200" cy="180" r="140" fill="rgba(255,255,255,0.02)" />
    <circle cx="1000" cy="500" r="120" fill="rgba(255,255,255,0.02)" />`;
}

function gridSvg(): string {
  let grid = '';
  for (let x = 0; x < 6; x++) {
    const cx = 850 + x * 50;
    grid += `<line x1="${cx}" y1="150" x2="${cx}" y2="480" stroke="rgba(255,255,255,0.03)" stroke-width="1" />\n    `;
  }
  for (let y = 0; y < 4; y++) {
    const cy = 200 + y * 70;
    grid += `<line x1="850" y1="${cy}" x2="1100" y2="${cy}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />\n    `;
  }
  grid += `<rect x="860" y="550" width="30" height="60" rx="2" fill="rgba(255,255,255,0.06)" />
    <rect x="900" y="510" width="30" height="100" rx="2" fill="rgba(255,255,255,0.08)" />
    <rect x="940" y="480" width="30" height="130" rx="2" fill="rgba(255,255,255,0.05)" />
    <rect x="980" y="530" width="30" height="80" rx="2" fill="rgba(255,255,255,0.07)" />
    <rect x="1020" y="500" width="30" height="110" rx="2" fill="rgba(255,255,255,0.06)" />`;
  return grid;
}

function bubblesSvg(): string {
  const bubbles = [
    [950, 450, 50], [1050, 380, 35], [900, 350, 25],
    [1000, 500, 40], [850, 480, 20], [1100, 420, 30],
    [920, 550, 15], [1020, 200, 45], [880, 150, 20],
    [1080, 280, 25], [960, 120, 30], [1150, 180, 18],
  ];
  return bubbles.map(([cx, cy, r]) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" />`
  ).join('\n  ');
}

function chartSvg(): string {
  return `
    <rect x="900" y="350" width="40" height="180" rx="3" fill="rgba(255,255,255,0.06)" />
    <rect x="955" y="280" width="40" height="250" rx="3" fill="rgba(255,255,255,0.09)" />
    <rect x="1010" y="310" width="40" height="220" rx="3" fill="rgba(255,255,255,0.07)" />
    <rect x="1065" y="230" width="40" height="300" rx="3" fill="rgba(255,255,255,0.10)" />
    <rect x="1120" y="370" width="40" height="160" rx="3" fill="rgba(255,255,255,0.05)" />
    <line x1="880" y1="540" x2="1180" y2="540" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
    <circle cx="900" cy="160" r="140" fill="rgba(255,255,255,0.02)" />
    <circle cx="1100" cy="400" r="100" fill="rgba(255,255,255,0.02)" />`;
}

function gameDotsSvg(): string {
  const dots = [
    [950, 120, 8], [880, 200, 12], [1060, 160, 6],
    [1020, 300, 10], [850, 350, 14], [920, 480, 8],
    [1100, 500, 10], [960, 560, 12], [860, 100, 6],
    [1000, 400, 7], [1150, 300, 9], [900, 280, 5],
  ];
  return dots.map(([cx, cy, r]) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.1)" />`
  ).join('\n  ');
}

function getDecorationSvg(decoration: Decoration): string {
  switch (decoration) {
    case 'confetti': return confettiSvg();
    case 'couple-circles': return coupleCirclesSvg();
    case 'grid': return gridSvg();
    case 'bubbles': return bubblesSvg();
    case 'chart': return chartSvg();
    case 'game-dots': return gameDotsSvg();
  }
}

// ── SVG BUILDER ──

function buildSvg(title: string, subtitle: string, g1: string, g2: string, decoration: Decoration, layout: Layout): string {
  const decoSvg = getDecorationSvg(decoration);
  const isCentered = layout === 'centered';

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face { font-family: 'Outfit'; src: url(data:font/truetype;base64,${FONT_BOLD}) format('truetype'); font-weight: 700; }
      @font-face { font-family: 'Outfit'; src: url(data:font/truetype;base64,${FONT_REGULAR}) format('truetype'); font-weight: 400; }
      .title { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: ${isCentered ? 64 : 60}px; fill: #ffffff; }
      .subtitle { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 24px; fill: rgba(255,255,255,0.65); }
      .brand { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 13px; fill: rgba(255,255,255,0.35); letter-spacing: 4px; }
    </style>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${g1}" />
      <stop offset="100%" stop-color="${g2}" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  ${decoSvg}

  <text x="80" y="70" class="brand">CAPTAIN BOND${isCentered ? '' : ''}</text>

  ${isCentered ? `
  <rect x="${1200 / 2 - 25}" y="220" width="50" height="3" rx="1.5" fill="url(#accent)" />
  <text x="600" y="${310}" class="title" text-anchor="middle" dominant-baseline="middle">${escapeXml(title)}</text>
  <text x="600" y="380" class="subtitle" text-anchor="middle" dominant-baseline="middle">${escapeXml(subtitle)}</text>
  <line x1="500" y1="560" x2="700" y2="560" stroke="rgba(255,255,255,0.06)" stroke-width="1" />` : `
  <rect x="80" y="240" width="50" height="3" rx="1.5" fill="url(#accent)" />
  <text x="80" y="330" class="title">${escapeXml(title)}</text>
  <text x="80" y="385" class="subtitle">${escapeXml(subtitle)}</text>
  <line x1="80" y1="560" x2="350" y2="560" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
  <line x1="80" y1="570" x2="250" y2="570" stroke="rgba(255,255,255,0.03)" stroke-width="1" />`}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Generating ${images.length} OG images...\n`);

  for (const img of images) {
    const svg = buildSvg(img.title, img.subtitle, img.gradient[0], img.gradient[1], img.decoration, img.layout);
    const outPath = path.join(OUT_DIR, img.filename);
    await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(outPath);
    const stats = fs.statSync(outPath);
    console.log(`✅ ${img.filename.padEnd(40)} ${(stats.size / 1024).toFixed(1).padStart(6)} KB`);
  }

  console.log(`\nDone. ${images.length} images in ${OUT_DIR}`);
}

main().catch(console.error);
