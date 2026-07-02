import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'og');
fs.mkdirSync(OUT_DIR, { recursive: true });

const images = [
  { file: 'home-en.png', title: 'Captain Bond', subtitle: 'The DJ of Your Party', bg: '#0f172a', accent: '#a855f7' },
  { file: 'home-fr.png', title: 'Captain Bond', subtitle: 'Le DJ de ta soirée', bg: '#0f172a', accent: '#a855f7' },
  { file: 'couple-en.png', title: 'Captain Bond — Couple', subtitle: 'Deep connection for two', bg: '#312e81', accent: '#ec4899' },
  { file: 'couple-fr.png', title: 'Captain Bond — Couple', subtitle: 'Connexion profonde à deux', bg: '#312e81', accent: '#ec4899' },
  { file: 'corporate.png', title: 'Captain Bond — Team Building', subtitle: 'Interactive giant-screen icebreaker', bg: '#1e1b4b', accent: '#f59e0b' },
  { file: 'bars-cafes.png', title: 'Captain Bond — Bars & Cafés', subtitle: 'Fill your bar on weeknights', bg: '#1e1b4b', accent: '#6366f1' },
  { file: 'b2b.png', title: 'Captain Bond Pro', subtitle: 'Turn spaces into real connections', bg: '#020617', accent: '#ec4899' },
];

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

for (const img of images) {
  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${img.bg}"/>
  <rect width="1200" height="12" fill="${img.accent}"/>
  <text x="600" y="270" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(img.title)}</text>
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="36" fill="#e2e8f0" text-anchor="middle">${escapeXml(img.subtitle)}</text>
  <text x="600" y="560" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">captainbond.com</text>
</svg>
  `.trim();

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(OUT_DIR, img.file));

  console.log('Generated', img.file);
}
