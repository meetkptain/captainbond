// Scaffold a paired EN/FR blog article (content layer) in ONE command.
// Creates src/content/blog/<slug>.ts and src/content/blog/<frSlug>.ts with
// valid BlogPost skeletons — the agent then fills the body fields.
//
// Usage:
//   npm run blog:new -- --en "How to Host a Game Night" \
//                      --fr "Comment organiser une soirée jeux" \
//                      --slug how-to-host-game-night \
//                      --frslug organiser-soiree-jeux \
//                      --hub party
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getArg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const en = getArg('en');
const fr = getArg('fr');
const slug = getArg('slug');
const frSlug = getArg('frslug');
const hub = (getArg('hub') || 'party') as 'party' | 'couple' | 'bar';

if (!en || !fr || !slug || !frSlug) {
  console.error('Missing args. Usage:');
  console.error(
    '  npm run blog:new -- --en "EN title" --fr "FR title" --slug en-slug --frslug fr-slug --hub party',
  );
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const dir = path.resolve('src/content/blog');

function file(slugVal: string, locale: 'en' | 'fr', title: string, counterpart: string): string {
  const og = `/og/blog-${slugVal}-${locale === 'en' ? 'en' : 'fr'}.webp`;
  const readTime = locale === 'en' ? 'X min read' : 'X min de lecture';
  return `import type { BlogPost } from '@/lib/content/types';

export const post: BlogPost = {
  slug: '${slugVal}',
  locale: '${locale}',
  title: ${JSON.stringify(title)},
  description: 'TODO 150-160 chars — hook + benefit',
  frSlug: '${counterpart}',
  ogImage: '${og}',
  published: '${today}',
  readTime: '${readTime}',
  hub: '${hub}',
  faq: [
    { q: 'TODO question 1', a: 'TODO answer 1' },
    { q: 'TODO question 2', a: 'TODO answer 2' },
    { q: 'TODO question 3', a: 'TODO answer 3' },
  ],
  takeaways: ['TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'],
  sections: [
    { h2: 'TODO section 1', p: 'TODO paragraph' },
    { h2: 'TODO section 2', p: 'TODO paragraph', list: ['TODO item', 'TODO item'] },
    { h2: 'TODO section 3', p: 'TODO paragraph', quote: 'TODO blockquote' },
  ],
  related: [],
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: '/party' },
  geoBlock: 'TODO GEO / AI-citation paragraph',
  endingQuestion: 'TODO ending question?',
};
`;
}

fs.writeFileSync(path.join(dir, `${slug}.ts`), file(slug, 'en', en, frSlug));
fs.writeFileSync(path.join(dir, `${frSlug}.ts`), file(frSlug, 'fr', fr, slug));
console.log(`✅ Created ${slug}.ts (en) + ${frSlug}.ts (fr).`);
console.log('   Auto-filling SEO/GEO (related / geoBlock / faq / endingQuestion)…');
try {
  execSync('npx tsx scripts/blog-enrich.ts', { stdio: 'inherit' });
} catch {
  console.warn('⚠️  Auto-enrich failed — run `npm run blog:enrich` manually.');
}
console.log('\nAgent: write ONLY `description`, `sections[].p`, `takeaways` (real copy).');
console.log('   Then: npm run blog:build   (sync + OG + audit)');
