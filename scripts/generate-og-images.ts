import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('public/og');
const FONT_BOLD = fs.readFileSync(path.resolve('scripts/Outfit-Bold.ttf')).toString('base64');
const FONT_REGULAR = fs.readFileSync(path.resolve('scripts/Outfit-Regular.ttf')).toString('base64');

interface OgImage {
  filename: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
}

const images: OgImage[] = [
  { filename: 'party-en.webp', title: 'Party Games', subtitle: 'Your TV is the board. Your phone is the controller.', gradient: ['#db2777', '#ea580c'] },
  { filename: 'pro-en.webp', title: 'Pro Solutions', subtitle: 'Interactive team building for bars & companies.', gradient: ['#4f46e5', '#0d9488'] },
  { filename: 'pro-fr.webp', title: 'Solutions Pro', subtitle: 'Team building interactif pour bars & entreprises.', gradient: ['#4f46e5', '#0d9488'] },
  { filename: 'soiree-fr.webp', title: 'Jeux de Soirée', subtitle: 'La TV devient plateau, les téléphones manettes.', gradient: ['#db2777', '#ea580c'] },
  { filename: 'blog-bar-revenue-en.webp', title: 'Bar Revenue Guide', subtitle: 'Boost your weekday business with trivia nights.', gradient: ['#d97706', '#dc2626'] },
  { filename: 'blog-bar-revenue-fr.webp', title: 'Chiffre d\'Affaires', subtitle: 'Augmentez votre activité en soirée quiz.', gradient: ['#d97706', '#dc2626'] },
  { filename: 'blog-couple-questions-guide-en.webp', title: 'Couple Questions', subtitle: 'The complete guide to deeper conversations.', gradient: ['#ec4899', '#7c3aed'] },
  { filename: 'blog-game-night-en.webp', title: 'Game Night Guide', subtitle: 'How to host an unforgettable evening.', gradient: ['#7c3aed', '#db2777'] },
  { filename: 'blog-game-night-fr.webp', title: 'Soirée Jeux', subtitle: 'Organisez une soirée inoubliable entre amis.', gradient: ['#7c3aed', '#db2777'] },
  { filename: 'blog-questions-couple-guide-fr.webp', title: 'Guide Questions Couple', subtitle: 'Le guide complet pour des conversations profondes.', gradient: ['#ec4899', '#7c3aed'] },
];

function svgTemplate(title: string, subtitle: string, g1: string, g2: string): string {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Outfit';
        src: url(data:font/truetype;base64,${FONT_BOLD}) format('truetype');
        font-weight: 700;
      }
      @font-face {
        font-family: 'Outfit';
        src: url(data:font/truetype;base64,${FONT_REGULAR}) format('truetype');
        font-weight: 400;
      }
      .title { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 72px; fill: #ffffff; }
      .subtitle { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 26px; fill: rgba(255,255,255,0.7); }
      .brand { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 14px; fill: rgba(255,255,255,0.4); letter-spacing: 4px; }
    </style>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${g1}" />
      <stop offset="100%" stop-color="${g2}" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.5)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Decorative circles (glassmorphism) -->
  <circle cx="1050" cy="80" r="280" fill="rgba(255,255,255,0.04)" />
  <circle cx="150" cy="550" r="220" fill="rgba(255,255,255,0.03)" />
  <circle cx="600" cy="630" r="350" fill="rgba(255,255,255,0.02)" />
  <circle cx="1100" cy="450" r="120" fill="rgba(255,255,255,0.05)" />
  <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.06)" />

  <!-- Decorative line top-right -->
  <line x1="950" y1="20" x2="1180" y2="20" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
  <line x1="980" y1="30" x2="1180" y2="30" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

  <!-- Brand -->
  <text x="80" y="70" class="brand">CAPTAIN BOND</text>

  <!-- Accent line -->
  <rect x="80" y="300" width="60" height="4" rx="2" fill="url(#accent)" />

  <!-- Title -->
  <text x="80" y="400" class="title">${escapeXml(title)}</text>

  <!-- Subtitle -->
  <text x="80" y="450" class="subtitle">${escapeXml(subtitle)}</text>

  <!-- Bottom decorative line -->
  <line x1="80" y1="560" x2="400" y2="560" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  <line x1="80" y1="570" x2="300" y2="570" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const img of images) {
    const svg = svgTemplate(img.title, img.subtitle, img.gradient[0], img.gradient[1]);
    const outPath = path.join(OUT_DIR, img.filename);

    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    console.log(`✅ ${img.filename}  ${(stats.size / 1024).toFixed(1)} KB`);
  }
}

main().catch(console.error);
