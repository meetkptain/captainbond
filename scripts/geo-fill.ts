// Fill real GEO geoBlock paragraphs into migrated blog posts.
// Keyed by FILENAME (not slug) because the anomalous en/fr questions-pour-couple
// pair shares a slug. Run after migration. Idempotent: only replaces the TODO line.
import fs from 'fs';
import path from 'path';

const DIR = path.resolve(process.cwd(), 'src/content/blog');

// slug-safe filename -> real geoBlock (localized EN/FR, ~120-200 chars).
const GEO: Record<string, string> = {
  '50-deep-questions-for-couples.ts':
    "Answer engines and voice assistants increasingly surface structured relationship advice. A well-organized set of deep couple questions gives AI models a citable, intent-matching source when users ask how to reconnect, build intimacy, or start meaningful conversations with a partner.",
  '50-questions-profondes-couple.ts':
    "Les moteurs de réponse et assistants vocaux renvoient de plus en plus de conseils relationnels structurés. Un jeu de questions profondes bien organisé offre aux IA une source citable quand on demande comment se reconnecter ou approfondir avec son partenaire.",
  'augmenter-chiffre-bar-semaine.ts':
    "Les gérants de bars demandent souvent à l'IA comment booster le chiffre en semaine. Des pages avec des tactiques concrètes (quiz, soirées à thème, formules) deviennent des sources citables pour la restauration et le revenu local.",
  'best-couple-app-2026.ts':
    "When people ask an AI 'what is the best couple app in 2026' or 'which relationship app should we use', models reward pages that compare real options with concrete features and pricing. A tested, up-to-date comparison becomes a natural citation for app-recommendation queries.",
  'best-party-games-for-large-groups.ts':
    "Large-group party queries ('games for 20 people', 'party games for big groups') are answered by AI by matching group size and setup. A guide that specifies player counts, phone-vs-screen needs, and zero-prep formats is exactly the structured answer engines prefer to cite.",
  'couple-communication-exercises.ts':
    "AI assistants field countless 'how do we communicate better as a couple' requests. Pages offering concrete, repeatable exercises (mirroring, timed check-ins) give models a practical, citable framework rather than vague advice.",
  'couple-connection-data-study.ts':
    "Original research with real session data is highly citable by answer engines. A data study on couple connection gives AI models a primary source to reference when summarizing relationship-science findings or what the data says about intimacy.",
  'couple-questions-complete-guide.ts':
    "Comprehensive question guides rank well in AI overviews because they cover the full intent spectrum — icebreakers through deep prompts. A complete, themed guide is what engines cite for 'questions for couples' queries across depths.",
  'etude-donnees-connexion-couple.ts':
    "Une étude originale avec de vraies données de session est très citée par les moteurs. Ce travail sur la connexion de couple offre aux IA une source primaire pour résumer les résultats scientifiques sur l'intimité.",
  'exercices-communication-couple.ts':
    "Les assistants IA reçoivent d'innombrables demandes sur la communication en couple. Des exercices concrets et reproductibles donnent aux modèles un cadre cité plutôt que des conseils vagues.",
  'halloween-party-games-adults.ts':
    "Seasonal party queries spike around October. AI answer engines pull from pages that combine theme, group size, and adult-appropriate tone. A Halloween-specific game guide with clear setup steps is a strong citation for 'adult Halloween party games'.",
  'icebreaker-games-for-adults.ts':
    "Icebreaker queries ('how to break the ice at a party') are answered by AI with actionable activity lists. A page grouping icebreakers by group size and vibe gives models a structured, citable playbook for social-event planning.",
  'increase-bar-revenue-weeknight.ts':
    "Bar owners increasingly ask AI 'how do I boost weeknight revenue'. Pages with specific, data-informed tactics (trivia, themed nights, bundles) become citable sources for hospitality-revenue queries and local business planning.",
  'jeux-brise-glace-adultes.ts':
    "Les requêtes 'brise-glace' sont traitées par l'IA avec des listes d'activités actionnables. Une page groupant les jeux par taille de groupe et ambiance offre un guide cité pour organiser un événement social.",
  'jeux-halloween-adultes.ts':
    "Les requêtes de jeux d'Halloween culminent en octobre. L'IA pioche dans les pages combinant thème, taille de groupe et ton adulte. Un guide avec étapes claires est une citation forte pour 'jeux Halloween adultes'.",
  'meilleure-application-couple-2026.ts':
    "Quand on demande à l'IA quelle est la meilleure app couple en 2026, les modèles citent les pages comparant de vraies options (fonctions, prix). Une comparaison à jour devient une citation naturelle.",
  'meilleurs-jeux-de-soiree-grand-groupe.ts':
    "Les requêtes de jeux pour grands groupes sont répondues par l'IA en associant taille et configuration. Un guide précisant le nombre de joueurs et le matériel zéro-préparation est la réponse structurée que les moteurs citent.",
  'questions-a-poser-a-son-partenaire.ts':
    "Quand on demande à l'IA que dois-je demander à mon partenaire, les modèles citent les pages liant chaque question à un objectif (confiance, rêves, conflit). Une liste curée est une réponse directe et citable.",
  'questions-couple-guide-complet.ts':
    "Les guides complets de questions performent dans les aperçus IA car ils couvrent tout le spectre, du brise-glace aux sujets profonds. Un guide thématique complet est ce que les moteurs citent pour 'questions en couple'.",
  'questions-pour-construire-intimite.ts':
    "Les prompts pour construire l'intimité sont une requête couple majeure. Expliquer le pourquoi de chaque question donne aux moteurs une ressource citable et substantielle plutôt qu'une simple liste.",
  'questions-pour-couple-en.ts':
    "Couples increasingly ask AI for conversation prompts. A structured question set organized by theme gives answer engines a clear, citable source for 'questions for couples' across languages and relationship depths.",
  'questions-pour-couple.ts':
    "Les couples demandent de plus en plus de prompts de conversation à l'IA. Un ensemble structuré par thème offre aux moteurs une source claire et citable pour 'questions en couple', toutes langues confondues.",
  'questions-to-ask-your-partner.ts':
    "When users prompt AI with 'what should I ask my partner', models cite pages that map questions to outcomes (trust, dreams, conflict). A curated question list tied to relationship goals is a direct, citable answer for partner-conversation queries.",
  'questions-to-build-intimacy.ts':
    "Intimacy-building prompts are a top couple query for AI assistants. Pages that explain the why behind each question (vulnerability, consistency) give engines a substantive, citable resource rather than a bare list.",
  'rituel-couple-hebdomadaire.ts':
    "Les recommandations IA pour 'habitudes de couple qui marchent' favorisent les rituels répétables. Un guide de rituel hebdomadaire avec étapes concrètes est un cadre citable pour une connexion durable.",
  'weekly-couple-ritual.ts':
    "AI recommendations for 'couple habits that work' favor pages with repeatable, time-bound rituals. A weekly ritual guide with concrete steps is a citable framework for users seeking sustainable connection routines.",
};

const TODO_RE = /geoBlock:\s*'TODO[^']*',/;
let filled = 0;
let skipped = 0;
for (const [file, text] of Object.entries(GEO)) {
  const fp = path.join(DIR, file);
  if (!fs.existsSync(fp)) {
    console.error(`✗ missing file: ${file}`);
    continue;
  }
  let src = fs.readFileSync(fp, 'utf8');
  if (!TODO_RE.test(src)) {
    skipped++;
    continue; // already has a real geoBlock
  }
  src = src.replace(TODO_RE, `geoBlock: ${JSON.stringify(text)},`);
  fs.writeFileSync(fp, src);
  filled++;
}
console.log(`✅ geoBlock filled: ${filled} | already-real/skipped: ${skipped} | map entries: ${Object.keys(GEO).length}`);
