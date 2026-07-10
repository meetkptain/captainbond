// Fix remaining gaps after migration:
//  1) Real FAQ (3 Q&A >=40c) for 4 articles whose legacy had no faqSchema.
//  2) Correct-locale `related` for the anomalous questions-pour-couple EN/FR pair.
import fs from 'fs';
import path from 'path';
import { allPosts } from '../src/content/blog';

const DIR = path.resolve(process.cwd(), 'src/content/blog');

// ---- 1) Real FAQ per file (localized) ----
const FAQ: Record<string, { q: string; a: string }[]> = {
  'questions-to-ask-your-partner.ts': [
    { q: 'What is one thing you have always wanted to tell me but haven’t?', a: 'This question opens a safe space for withheld thoughts. Answering it helps partners surface small resentments or wishes before they harden into distance, and signals that no topic is off-limits.' },
    { q: 'What does feeling loved look like for you day to day?', a: 'People express and receive love differently. Naming your everyday version of feeling loved — a text, a hug, undivided attention — lets your partner meet you where you actually are, not where they assume you are.' },
    { q: 'Where do we want to be, as a couple, in five years?', a: 'A shared horizon prevents quiet drift. Discussing the next five years aligns decisions about money, location, and family, and turns vague someday plans into a direction you both choose.' },
  ],
  'questions-a-poser-a-son-partenaire.ts': [
    { q: 'Quelle est une chose que tu as toujours voulu me dire sans jamais oser ?', a: 'Cette question ouvre un espace sûr pour les pensées retenues. Y répondre aide à sortir les petites rancunes ou envies avant qu’elles ne deviennent de la distance, et montre qu’aucun sujet n’est tabou.' },
    { q: 'À quoi ressemble le fait de te sentir aimé au quotidien ?', a: 'On exprime et reçoit l’amour différemment. Nommer ta version quotidienne du sentiment d’être aimé — un message, une étreinte, une attention pleine — permet à l’autre de te rencontrer là où tu es vraiment.' },
    { q: 'Où voulons-nous en être, en tant que couple, dans cinq ans ?', a: 'Un horizon commun évite la dérive silencieuse. En discuter aligne les choix d’argent, de lieu et de famille, et transforme les « un jour » vagues en une direction choisie à deux.' },
  ],
  'questions-to-build-intimacy.ts': [
    { q: 'What small daily moment makes you feel closest to me?', a: 'Intimacy is built in ordinary moments, not grand gestures. Identifying the small daily instant that brings you close helps both partners protect it and repeat it on purpose.' },
    { q: 'When have you felt most emotionally safe with me?', a: 'Naming the moments of emotional safety shows your partner exactly what builds trust. It turns an abstract feeling into a repeatable behavior they can lean into.' },
    { q: 'What can I do this week to help you feel more connected?', a: 'Intimacy grows from specific asks, not general intentions. A concrete request for the week turns connection from a hope into an action you can both follow through on.' },
  ],
  'questions-pour-construire-intimite.ts': [
    { q: 'Quel petit moment du quotidien te rapproche le plus de moi ?', a: 'L’intimité se construit dans les moments ordinaires, pas dans les grands gestes. Identifier ce petit instant quotidien aide à le protéger et à le reproduire volontairement.' },
    { q: 'Quand t’es-tu senti(e) le plus en sécurité émotionnellement avec moi ?', a: 'Nommer les moments de sécurité émotionnelle montre à l’autre ce qui crée la confiance. Cela transforme un sentiment flou en comportement répétable.' },
    { q: 'Que puis-je faire cette semaine pour te sentir plus connecté(e) ?', a: 'L’intimité naît de demandes précises, pas d’intentions vagues. Une requête concrète pour la semaine transforme la connexion en action suivie à deux.' },
  ],
};

const TODO_FAQ = /faq:\s*\[\s*\{ q: 'TODO question', a: 'TODO answer' \}(,\s*\{ q: 'TODO question', a: 'TODO answer' \}){2}\s*],/;

// ---- 2) Related for anomalous pair (correct locale) ----
function relEntry(slug: string, locale: 'en' | 'fr') {
  const p = allPosts.find((x) => x.slug === slug && x.locale === locale);
  if (!p) throw new Error(`related target not found: ${locale}/${slug}`);
  return { slug: p.slug, title: p.title, description: p.description };
}
const EN_REL = ['50-deep-questions-for-couples', 'best-couple-app-2026', 'couple-communication-exercises'].map((s) => relEntry(s, 'en'));
const FR_REL = ['50-questions-profondes-couple', 'meilleure-application-couple-2026', 'exercices-communication-couple'].map((s) => relEntry(s, 'fr'));

function relStr(arr: { slug: string; title: string; description: string }[]): string {
  const items = arr
    .map((r) => `    { slug: ${JSON.stringify(r.slug)}, title: ${JSON.stringify(r.title)}, description: ${JSON.stringify(r.description)} }`)
    .join(',\n');
  return `related: [\n${items}\n  ],`;
}

let faqFilled = 0;
for (const [file, faq] of Object.entries(FAQ)) {
  const fp = path.join(DIR, file);
  let src = fs.readFileSync(fp, 'utf8');
  if (!TODO_FAQ.test(src)) {
    console.error(`⚠️  ${file}: TODO faq block not found, skipping`);
    continue;
  }
  const faqStr = faq.map((f) => `    { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} }`).join(',\n');
  src = src.replace(TODO_FAQ, `faq: [\n${faqStr}\n  ],`);
  fs.writeFileSync(fp, src);
  faqFilled++;
}

// Anomalous EN file: empty related -> EN entries
const enPath = path.join(DIR, 'questions-pour-couple-en.ts');
let enSrc = fs.readFileSync(enPath, 'utf8');
enSrc = enSrc.replace(/related:\s*\[\s*],/, relStr(EN_REL));
fs.writeFileSync(enPath, enSrc);

// Anomalous FR file: wrong-locale related -> FR entries
const frPath = path.join(DIR, 'questions-pour-couple.ts');
let frSrc = fs.readFileSync(frPath, 'utf8');
frSrc = frSrc.replace(/related:\s*\[[\s\S]*?],/, relStr(FR_REL));
fs.writeFileSync(frPath, frSrc);

console.log(`✅ FAQ filled: ${faqFilled}/4 | anomalous pair related fixed (EN=${EN_REL.length}, FR=${FR_REL.length})`);
