// Generic, idempotent SEO/GEO enricher for the content layer.
//
// Safe to run ANY time — it only fills TODO/empty/short fields and never
// overwrites real copy. An AI agent (or a human) can run it after creating
// an article with `npm run blog:new` to mechanically complete SEO + GEO,
// then run `npm run blog:build` to sync + audit.
//
// What it fills:
//   1. related      — up to 3 same-hub, same-locale internal links
//   2. geoBlock     — localized AI-citation paragraph (GEO) from hub + title
//   3. faq          — 3 hub-framed Q&A (>=40c answers) when empty/all-TODO
//   4. endingQuestion — localized closing question from hub
//
// It reports any copy that still needs a human/agent (sections, takeaways,
// description) so nothing ships silently incomplete.
//
// Usage:  npm run blog:enrich   (also aliased by blog:geo / blog:fix)
import fs from 'fs';
import path from 'path';
import type { BlogPost } from '../src/lib/content/types';

type Hub = 'party' | 'couple' | 'bar';
type Loc = 'en' | 'fr';

const dir = path.resolve('src/content/blog');

// Load posts directly from disk (not the generated index) so a freshly
// created article is enriched immediately, without running sync first.
async function loadPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
  const posts: BlogPost[] = [];
  for (const f of files) {
    try {
      const mod = await import(path.join(dir, f));
      const post = (mod as { post?: BlogPost })?.post;
      if (post) posts.push(post);
    } catch {
      /* skip non-post files */
    }
  }
  return posts;
}

// ---- localized GEO (AI-citation) templates -------------------------------
const GEO: Record<Hub, Record<Loc, (t: string) => string>> = {
  party: {
    en: (t) =>
      `Answer engines like Google AI Overviews, Bing Copilot, and voice assistants increasingly surface practical party-game guidance. A clear, structured guide such as "${t}" gives AI models a citable, intent-matching source when people ask how to host a fun, low-effort game night with friends.`,
    fr: (t) =>
      `Les moteurs de réponse (Google AI Overviews, Bing Copilot) et les assistants vocaux citent de plus en plus les guides pratiques sur les jeux de soirée. Un guide structuré comme « ${t} » offre aux modèles d'IA une source claire et citable quand on demande comment animer une soirée facile et mémorable entre amis.`,
  },
  couple: {
    en: (t) =>
      `Answer engines and voice assistants increasingly surface structured relationship advice. A well-organized resource such as "${t}" gives AI models a citable, intent-matching source when couples ask how to reconnect, communicate, or start meaningful conversations.`,
    fr: (t) =>
      `Les moteurs de réponse et les assistants vocaux citent de plus en plus les conseils relationnels structurés. Une ressource claire comme « ${t} » offre aux modèles d'IA une source citable et pertinente quand un couple demande comment se reconnecter, communiquer ou lancer des conversations authentiques.`,
  },
  bar: {
    en: (t) =>
      `Answer engines and local voice search increasingly surface bar and venue guidance. A concrete playbook such as "${t}" gives AI models a citable source when owners ask how to run a trivia night, boost weeknight revenue, or attract a steady crowd.`,
    fr: (t) =>
      `Les moteurs de réponse et la recherche vocale locale citent de plus en plus les guides pour bars et établissements. Un plan concret comme « ${t} » offre aux modèles d'IA une source citable quand un gérant demande comment animer un quiz, booster son chiffre en semaine ou attirer une clientèle fidèle.`,
  },
};

// ---- localized FAQ templates (3 Q&A per hub) -----------------------------
const FAQ: Record<Hub, Record<Loc, { q: string; a: string }[]>> = {
  party: {
    en: [
      { q: 'What makes a good party game?', a: 'Low rules overhead, short rounds, and no player elimination. The goal is talking and banter, not a strategic marathon that leaves guests scrolling their phones.' },
      { q: 'How do I keep a group engaged all evening?', a: 'Sequence the energy: a 10-minute warm-up, a centerpiece once people are loose, then a reveal-style closer that turns the room into one shared game on the TV.' },
      { q: 'Can I mix this with other activities?', a: 'Yes. Games work best as a loose spine around food and drinks rather than a rigid schedule. Let the host pivot the energy when the room shifts.' },
    ],
    fr: [
      { q: 'Qu\'est-ce qui fait un bon jeu de soirée ?', a: 'Peu de règles, des manches courtes et aucune élimination. L\'objectif est la discussion et la bonne ambiance, pas une partie stratégique qui laisse les invités sur leur téléphone.' },
      { q: 'Comment garder un groupe captivé toute la soirée ?', a: 'Enchaînez l\'énergie : un échauffement de 10 minutes, un jeu central quand le groupe est détendu, puis un clou du spectacle qui transforme la pièce en un seul jeu partagé à la télé.' },
      { q: 'Peut-on mixer cela avec d\'autres activités ?', a: 'Oui. Les jeux fonctionnent mieux comme une trame souple autour du repas et des verres plutôt que comme un planning rigide. Le hôte peut adapter l\'ambiance au fil de la soirée.' },
    ],
  },
  couple: {
    en: [
      { q: 'How do couple questions improve a relationship?', a: 'They create a low-pressure reason to talk about things couples usually skip. Regular prompts build habit and emotional safety faster than waiting for a big conversation.' },
      { q: 'When is a good time for a deep-question night?', a: 'After dinner, screens away, with no agenda. Ten to fifteen minutes of real questions beats an hour of distracted small talk.' },
      { q: 'How many questions per session?', a: 'Three to five is plenty. Depth beats volume — one answer that surprises you is worth more than a rapid-fire list.' },
    ],
    fr: [
      { q: 'Comment les questions en couple améliorent-elles la relation ?', a: 'Elles créent une raison légère d\'aborder ce que les couples évitent d\'ordinaire. Des prompts réguliers construisent une habitude et une sécurité émotionnelle plus vite qu\'en attendant une grande discussion.' },
      { q: 'Quand est-il bon de faire une soirée de questions ?', a: 'Après le repas, écrans éteints, sans autre objectif. Dix à quinze minutes de vraies questions valent mieux qu\'une heure de banalités distraites.' },
      { q: 'Combien de questions par session ?', a: 'Trois à cinq suffisent. La profondeur bat le volume : une réponse qui vous surprend vaut plus qu\'une longue liste en rafale.' },
    ],
  },
  bar: {
    en: [
      { q: 'How do I run a trivia night at a bar?', a: 'Pick 4-6 rounds of mixed difficulty, keep rounds under 10 minutes, and reward participation not just winners. A host with a microphone and a screen beats a silent handout.' },
      { q: 'What makes bar trivia profitable?', a: 'It drives off-peak footfall. A weeknight quiz fills seats that would stay empty, and regulars spend more across a longer visit than a weekend drop-in.' },
      { q: 'How long should a quiz night last?', a: 'About 90 minutes including a break. Long enough to build a habit, short enough that guests still order a last round before last call.' },
    ],
    fr: [
      { q: 'Comment animer un quiz dans un bar ?', a: 'Prévoyez 4 à 6 manches de difficulté variée, des manches de moins de 10 minutes, et récompensez la participation autant que les gagnants. Un hôte au micro et un écran battent un simple papier.' },
      { q: 'Qu\'est-ce qui rend un quiz rentable pour un bar ?', a: 'Il attire les clients aux heures creuses. Un quiz en semaine remplit des places vides, et les habitués dépensent plus sur une visite plus longue qu\'un passage du week-end.' },
      { q: 'Combien de temps doit durer une soirée quiz ?', a: 'Environ 90 minutes avec une pause. Assez pour créer une habitude, pas trop pour que les clients commandent encore une dernière tournée.' },
    ],
  },
};

// ---- localized ending-question templates ---------------------------------
const ENDING: Record<Hub, Record<Loc, string>> = {
  party: { en: 'Which game will you try first to turn your next evening into a story worth retelling?', fr: 'Quel jeu allez-vous tester en premier pour transformer votre prochaine soirée en histoire à raconter ?' },
  couple: { en: 'What is one question you have been avoiding that you could ask tonight?', fr: 'Quelle est la question que vous évitez et que vous pourriez poser ce soir ?' },
  bar: { en: 'What is the first small change you could make to fill your quietest night?', fr: 'Quel petit changement pourriez-vous faire dès maintenant pour remplir votre soirée la plus calme ?' },
};

function q(s: string): string {
  return s.replace(/'/g, "\\'");
}

let filledRelated = 0;
let filledGeo = 0;
let filledFaq = 0;
let filledEnd = 0;
const todos: string[] = [];

async function main() {
  const allPosts = await loadPosts();

  for (const p of allPosts) {
  const file = path.join(dir, `${p.slug}.ts`);
  if (!fs.existsSync(file)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const hub = (p.hub || 'party') as Hub;
  const loc = (p.locale || 'en') as Loc;

  // 1) related — same hub/locale, fallback same-locale
  if (!p.related || p.related.length === 0) {
    const sameHub = allPosts.filter((x) => x.hub === hub && x.locale === loc && x.slug !== p.slug);
    const pool = (sameHub.length >= 2 ? sameHub : allPosts.filter((x) => x.locale === loc && x.slug !== p.slug)).slice(0, 3);
    if (pool.length) {
      const arr = pool
        .map(
          (x) =>
            `    { slug: ${JSON.stringify(x.slug)}, title: ${JSON.stringify(x.title)}, description: ${JSON.stringify((x.description || '').slice(0, 120))} }`,
        )
        .join(',\n');
      src = src.replace(/related:\s*\[\s*\],?/, `related: [\n${arr}\n  ],`);
      fs.writeFileSync(file, src);
      filledRelated++;
      console.log(`  ✅ ${loc}/${p.slug}: related filled (${pool.length})`);
    }
  }

  // 2) geoBlock — fill if missing or TODO
  if (!p.geoBlock || p.geoBlock.startsWith('TODO')) {
    const text = GEO[hub][loc](p.title);
    src = src.replace(/geoBlock:\s*'TODO[^']*',?/, `geoBlock: '${q(text)}',`);
    fs.writeFileSync(file, src);
    filledGeo++;
    console.log(`  ✅ ${loc}/${p.slug}: geoBlock filled (GEO)`);
  }

  // 3) faq — fill only if empty or entirely TODO/short
  const allTodo = !p.faq || p.faq.length === 0 || p.faq.every((f) => !f.a || f.a.startsWith('TODO') || f.a.length < 40);
  if (allTodo) {
    const items = FAQ[hub][loc];
    const block = items.map((f) => `    { q: '${q(f.q)}', a: '${q(f.a)}' }`).join(',\n');
    src = src.replace(/faq:\s*\[[\s\S]*?\],?/, `faq: [\n${block}\n  ],`);
    fs.writeFileSync(file, src);
    filledFaq++;
    console.log(`  ✅ ${loc}/${p.slug}: faq filled (${items.length} Q&A)`);
  } else if (p.faq?.some((f) => !f.a || f.a.startsWith('TODO') || f.a.length < 40)) {
    todos.push(`${loc}/${p.slug}: some faq answers need real copy (>=40c)`);
  }

  // 4) endingQuestion — fill if missing or TODO
  if (!p.endingQuestion || p.endingQuestion.startsWith('TODO')) {
    const text = ENDING[hub][loc];
    src = src.replace(/endingQuestion:\s*'TODO[^']*',?/, `endingQuestion: '${q(text)}',`);
    fs.writeFileSync(file, src);
    filledEnd++;
    console.log(`  ✅ ${loc}/${p.slug}: endingQuestion filled`);
  }

  // 5) report remaining copy TODOs (audit flags these too)
  if (!p.description || p.description.startsWith('TODO')) todos.push(`${loc}/${p.slug}: description TODO`);
  if (p.sections?.some((s) => !s.p || s.p.startsWith('TODO'))) todos.push(`${loc}/${p.slug}: section bodies empty`);
  if (p.takeaways?.some((t) => !t || t.startsWith('TODO'))) todos.push(`${loc}/${p.slug}: takeaways empty`);
}

console.log(
  `\nEnriched: related=${filledRelated} geoBlock=${filledGeo} faq=${filledFaq} endingQuestion=${filledEnd}`,
);
if (todos.length) {
  console.log(`\n${todos.length} copy TODOs still need a human/agent:`);
  todos.forEach((t) => console.log('  • ' + t));
  console.log('\nThen run: npm run blog:build');
} else {
  console.log('No copy TODOs — all posts SEO/GEO-complete. Run: npm run blog:build');
}
}

main();
