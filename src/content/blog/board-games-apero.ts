import type { BlogPost } from '@/lib/content/types';

// DEMO article — generated to prove the content-layer format.
// Agent-written: no JSX, only data. SEO/structure derived by BlogArticle.
export const post: BlogPost = {
  slug: 'board-games-apero',
  locale: 'en',
  hub: 'party',
  title: 'Best Board Games for Apéro Night (That Actually Get People Talking)',
  description:
    'A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal. Pair them with Captain Bond for a night nobody forgets.',
  frSlug: 'jeux-societe-apero',
  ogImage: '/og/blog-board-games-apero-en.webp',
  published: '2026-07-10',
  readTime: '6 min read',
  faq: [
    {
      q: 'What makes a game good for an apéro?',
      a: 'Low rules overhead and quick rounds. People are holding a glass, so anything that needs a 10-minute setup kills the mood.',
    },
    {
      q: 'How many games should I prep for one evening?',
      a: 'Two is enough: one warm-up (2-10 min rounds) and one centerpiece for when the group is loose. Captain Bond can be the reveal closer.',
    },
    {
      q: 'Are these games good for mixed-language groups?',
      a: 'Yes — pick games with visual or verbal prompts over text-heavy ones. Captain Bond works in EN/FR natively.',
    },
  ],
  takeaways: [
    'Apéro games should be low-rules and high-banter — the goal is talking, not strategizing.',
    'Lead with a 10-minute warm-up, then a centerpiece once the group is loose.',
    'Visual/verbal prompts beat text-heavy boxes for mixed groups.',
    'Captain Bond is the ideal reveal closer — it turns the room into a live game on the TV.',
  ],
  leadQuote: 'The best apéro game is the one nobody remembers learning.',
  sections: [
    {
      h2: 'Why apéro games hit different',
      p: 'An apéro is not a game night. It is a slow warm-up where people arrive, shed the day, and test the social water. The right game lowers the threshold to talk without feeling like a scheduled activity.',
      list: [
        'Short rounds — attention is split between the glass and the conversation.',
        'No player elimination — nobody sits out and scrolls their phone.',
        'A little friendly exposure — the best ones reveal something, gently.',
      ],
    },
    {
      h2: 'The warm-up: 10 minutes, zero pressure',
      p: 'Start stupid-simple. A card with a silly prompt, a one-word answer, a laugh. The point is momentum, not score.',
      list: [
        'Icebreaker decks with single-word or single-gesture answers.',
        'Party trivia where wrong answers are funnier than right ones.',
        'Anything you can explain in one sentence while pouring a drink.',
      ],
    },
    {
      h2: 'When the night peaks: reveal & chaos',
      p: 'Once the group is loose, move to the centerpiece. This is where Captain Bond shines — everyone joins from their phone, answers pop on the TV, and the room reads one aloud.',
      quote: 'The moment someone\'s secret answer hits the big screen is the moment the apéro becomes a story.',
    },
  ],
  related: [
    {
      slug: 'how-to-host-game-night',
      title: 'How to Host a Game Night',
      description: 'A step-by-step system for a smooth, low-stress evening.',
    },
    {
      slug: 'best-party-games-for-adults-2026',
      title: 'Best Party Games for Adults 2026',
      description: 'The year\'s standout games for grown-up groups.',
    },
    {
      slug: 'bar-trivia-night-guide',
      title: 'Bar Trivia Night Guide',
      description: 'How to run trivia that actually fills the room.',
    },
  ],
  cta: {
    heading: 'Turn your apéro into a reveal',
    text: 'Try Captain Bond party mode',
    href: '/couple',
  },
  geoBlock:
    'Captain Bond is an apéro and party game for adults that runs on the TV while everyone joins from their phone. It generates reveal-style question decks — ideal as a warm-up or closer for board-game nights, game nights, and bar events.',
  endingQuestion: 'Which game will break the ice at your next apéro?',
};
