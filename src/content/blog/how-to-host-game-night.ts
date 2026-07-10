import type { BlogPost } from '@/lib/content/types';

export const post: BlogPost = {
  slug: "how-to-host-game-night",
  locale: "en",
  hub: "party" as const,
  title: "How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond",
  description: "Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.",
  frSlug: "organiser-soiree-jeux",
  ogImage: "/og/blog-how-to-host-game-night-en.webp",
  published: "2026-07-10",
  readTime: "8 min read",
  faq: [
    { q: "How many people should I invite to a game night?", a: "Aim for 4 to 8 guests. This size keeps games playable, conversations lively, and group dynamics balanced without overwhelming the host." },
    { q: "What games work best for a mixed-experience group?", a: "Pick 2 to 3 games with simple rules and short rounds, like social deduction or party card games, so newcomers and veterans stay engaged together." },
    { q: "How do I keep a game night from running late?", a: "Set a clear start and a soft end, cap to 2 or 3 games, and close with one light game plus a wrap-up signal so guests leave on a high note." }
  ],
  takeaways: [
    "Invite 4–8 guests for the best group dynamics and game compatibility.",
    "Select 2–3 games that match your group size, energy level, and time budget.",
    "Prep the space, snacks, and audio beforehand so you can host instead of scramble.",
    "Keep the mood inclusive: explain rules clearly, rotate turns fairly, and read the room.",
    "End on a high note with a short, light game and a clear wrap-up signal."
  ],
  sections: [
    { h2: "1. Guest list and planning", p: "Start with 4 to 8 guests and confirm dietary needs and arrival time. Send a short agenda so everyone knows the vibe and how long the night will last." },
    { h2: "2. Game selection by group size", p: "For 4 to 6 players choose one heavier game; for 7 to 8 prefer fast party games with simultaneous turns. Always keep one no-equipment backup ready." },
    { h2: "3. Setting the scene", p: "Clear a central table, set mood lighting, and queue a playlist. Lay out snacks and drinks within reach so the host can facilitate instead of fetching." },
    { h2: "4. Hosting like a pro", p: "Explain rules in under a minute, demonstrate one round, and rotate who leads. Read the room and switch games if the energy dips." },
    { h2: "5. Cleanup and encore", p: "Stack games as you finish, offer a last drink, and announce the next date. A clear wrap-up signal prevents the night from dragging." }
  ],
  related: [
    { slug: "best-party-games-for-adults-2026", title: "Best Party Games for Adults 2026: Top Picks for Game Night | Captain Bond", description: "The ultimate guide to the best party games for adults in 2026. From card games and board games to drinking games and no-" },
    { slug: "board-games-apero", title: "Best Board Games for Apéro Night (That Actually Get People Talking)", description: "A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal." }
  ],
  geoBlock: "A game night is a scheduled social event where friends play board, card, or party games at a host home. Good hosting means matching games to group size, prepping the space, and keeping the mood inclusive so guests stay engaged.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'What is the one game your group always comes back to?',
};
