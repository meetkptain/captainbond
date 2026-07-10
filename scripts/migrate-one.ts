// Migrate ONE legacy blog article (EN + its FR counterpart) into the
// content layer. The script reads the JSX, extracts metadata + faqSchema +
// takeaways + section prose, writes BlogPost data files, then DELETES the
// legacy page.tsx routes (to avoid slug collision with the [slug] SSG route).
//
// Robustness guarantees:
//   - published/modified are PRESERVED from legacy `other.datePublished/.dateModified`
//     (never reset to today) so Google's freshness signals stay accurate.
//   - ogImage is taken from the real legacy openGraph/twitter image path
//     (slug-based guessing breaks the already-generated OG files).
//   - section prose (<p>/<li>) is extracted, not just <h2> headings,
//     so migrated articles keep their body content.
//
// Usage: npm run blog:migrate -- <enSlug> <frSlug> <hub>
//   e.g. npm run blog:migrate -- how-to-host-game-night organiser-soiree-jeux party
import fs from 'fs';
import path from 'path';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';
const ROOT = process.cwd();

type BlogLocale = 'en' | 'fr';

function read(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function extractMeta(src: string): Record<string, any> {
  const m = src.match(/export const metadata(?::\s*[A-Za-z]+)?\s*=\s*(\{[\s\S]*?\n\})/);
  if (!m) throw new Error('metadata not found');
  const objText = m[1];
  const code = `const siteUrl = '${SITE}';\nconst metadata = ${objText};\nreturn metadata;`;
  return new Function('process', code)(process) as Record<string, any>;
}

function extractFaq(src: string): { q: string; a: string }[] {
  const m = src.match(/const faqSchema\s*=\s*(\{[\s\S]*?\n\})/);
  if (!m) return [];
  // faqSchema often maps external question arrays (e.g. `${name}Questions.map(...)`).
  // Collect every top-level string-array const so the schema eval can resolve them.
  const scope: Record<string, any> = {};
  for (const am of src.matchAll(/const\s+(\w+)\s*=\s*\[([\s\S]*?)\]\s*;/g)) {
    const name = am[1];
    const body = am[2];
    if (!/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/.test(body)) continue; // only string-element arrays
    try {
      const arr = new Function(`return [${body}];`)();
      if (Array.isArray(arr)) scope[name] = arr;
    } catch {
      /* ignore non-array / dynamic bodies */
    }
  }
  const code = `const faqSchema = ${m[1]};\nreturn faqSchema;`;
  let schema: any;
  try {
    schema = new Function(...Object.keys(scope), code)(...Object.values(scope));
  } catch {
    return [];
  }
  const ents = schema?.mainEntity ?? [];
  return ents
    .map((e: any) => ({ q: String(e.question ?? e.name ?? '').trim(), a: String(e.acceptedAnswer?.text ?? e.answer ?? '').trim() }))
    .filter((f: any) => f.q && f.a);
}

function extractTakeaways(src: string): string[] {
  const block = src.match(/article-card-takeaways[\s\S]*?<\/ul>/);
  if (!block) return [];
  return [...block[0].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1])).filter(Boolean);
}

function strip(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSections(src: string): { h2: string; p?: string; list?: string[] }[] {
  const blocks = [...src.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/g)];
  return blocks
    .map((b) => {
      const inner = b[1];
      const hm = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      const h2 = hm ? strip(hm[1]) : '';
      if (!h2 || /key takeaways|why it matters/i.test(h2)) return null;
      const ps = [...inner.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => strip(m[1])).filter(Boolean);
      const lis = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1])).filter(Boolean);
      const p = ps.join(' ');
      return { h2, p: p || undefined, list: lis.length ? lis : undefined };
    })
    .filter((s): s is { h2: string; p?: string; list?: string[] } => !!s);
}

// Real OG path from legacy metadata (openGraph.images[0].url or twitter.images[0]).
function extractOg(meta: any, fallback: string): string {
  const og = meta?.openGraph?.images?.[0];
  let url: string | undefined = typeof og === 'string' ? og : og?.url;
  if (!url && Array.isArray(meta?.twitter?.images) && meta.twitter.images[0]) {
    const t = meta.twitter.images[0];
    url = typeof t === 'string' ? t : t?.url;
  }
  if (!url) return fallback;
  try {
    url = new URL(url).pathname;
  } catch {
    url = url.replace(/^https?:\/\/[^/]+/, '');
  }
  return url.startsWith('/') ? url : '/' + url;
}

function hubGuess(slug: string): 'party' | 'couple' | 'bar' {
  if (/couple|intim|relation|partenaire|rituel/.test(slug)) return 'couple';
  if (/bar|trivia|ca[f]e|resto/.test(slug)) return 'bar';
  return 'party';
}

function buildPost(
  slug: string,
  locale: BlogLocale,
  meta: any,
  faq: any[],
  take: string[],
  sec: any[],
  counterpart: string,
  hub: string,
): string {
  const today = new Date().toISOString().slice(0, 10);
  // PRESERVE real dates — never reset to today.
  const published = meta?.other?.datePublished || meta?.datePublished || today;
  const modified = meta?.other?.dateModified || meta?.dateModified || published;
  const og = extractOg(meta, `/og/blog-${slug}-${locale === 'en' ? 'en' : 'fr'}.webp`);
  const readTime = locale === 'en' ? 'X min read' : 'X min de lecture';

  const faqStr = faq.length
    ? faq.map((f) => `    { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} }`).join(',\n')
    : `    { q: 'TODO question', a: 'TODO answer' },\n    { q: 'TODO question', a: 'TODO answer' },\n    { q: 'TODO question', a: 'TODO answer' }`;
  const takeStr = take.length
    ? take.map((t) => `    ${JSON.stringify(t)}`).join(',\n')
    : `    'TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'`;
  const secStr = sec.length
    ? sec
        .map((s) => {
          const list = s.list?.length ? `, list: [${s.list.map((l: string) => JSON.stringify(l)).join(', ')}]` : '';
          return `    { h2: ${JSON.stringify(s.h2)}, p: ${JSON.stringify(s.p ?? '')}${list} }`;
        })
        .join(',\n')
    : `    { h2: 'TODO section', p: 'TODO paragraph' }`;

  return `import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: ${JSON.stringify(slug)},
  locale: ${JSON.stringify(locale)},
  hub: ${JSON.stringify(hub)} as const,
  title: ${JSON.stringify(meta.title ?? 'TODO')},
  description: ${JSON.stringify(meta.description ?? 'TODO')},
  frSlug: ${JSON.stringify(counterpart)},
  ogImage: ${JSON.stringify(og)},
  published: ${JSON.stringify(published)},
  modified: ${JSON.stringify(modified)},
  readTime: ${JSON.stringify(readTime)},
  faq: [
${faqStr}
  ],
  takeaways: [
${takeStr}
  ],
  sections: [
${secStr}
  ],
  related: [],
  geoBlock: 'TODO: write a 40+ char paragraph tuned for AI search / answer engines.',
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: ${JSON.stringify(hub === 'couple' ? '/couple' : '/party')} },
  endingQuestion: 'TODO ending question?',
};
`;
}

const [enSlug, frSlug, hubArg] = process.argv.slice(2);
if (!enSlug || !frSlug) {
  console.error('Usage: npm run blog:migrate -- <enSlug> <frSlug> <hub?>');
  process.exit(1);
}
const hub = (hubArg as any) || hubGuess(enSlug);

const enFile = path.join(ROOT, `src/app/(marketing)/blog/${enSlug}/page.tsx`);
const frFile = path.join(ROOT, `src/app/fr/blog/${frSlug}/page.tsx`);
if (!fs.existsSync(enFile)) {
  console.error(`EN file missing: ${enFile}`);
  process.exit(1);
}

const enMeta = extractMeta(read(enFile));
const frMeta = fs.existsSync(frFile) ? extractMeta(read(frFile)) : enMeta;
const enFaq = extractFaq(read(enFile));
const frFaq = fs.existsSync(frFile) ? extractFaq(read(frFile)) : enFaq;
const enTake = extractTakeaways(read(enFile));
const frTake = fs.existsSync(frFile) ? extractTakeaways(read(frFile)) : enTake;
const enSec = extractSections(read(enFile));
const frSec = fs.existsSync(frFile) ? extractSections(read(frFile)) : enSec;

const dir = path.join(ROOT, 'src/content/blog');
// Same slug for EN+FR (legacy anomaly) would collide on filename — suffix EN with "-en".
const enOut = enSlug === frSlug ? `${enSlug}-en.ts` : `${enSlug}.ts`;
fs.writeFileSync(
  path.join(dir, enOut),
  buildPost(enSlug, 'en', enMeta, enFaq, enTake, enSec, frSlug, hub),
);
fs.writeFileSync(
  path.join(dir, `${frSlug}.ts`),
  buildPost(frSlug, 'fr', frMeta, frFaq, frTake, frSec, enSlug, hub),
);

// Remove legacy routes to avoid slug collision with the [slug] SSG route.
fs.rmSync(path.dirname(enFile), { recursive: true, force: true });
fs.rmSync(path.dirname(frFile), { recursive: true, force: true });

console.log(
  `✅ Migrated ${enSlug} (en, ${enFaq.length} faq, ${enSec.length} sections) + ${frSlug} (fr) | published=${enMeta?.other?.datePublished ?? '?'}`,
);
console.log('   Run: npm run blog:build  (then enrich geoBlock + FAQ answers + related)');
