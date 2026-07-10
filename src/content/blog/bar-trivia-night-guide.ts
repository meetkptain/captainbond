import type { BlogPost } from '@/lib/content/types';

export const post: BlogPost = {
  slug: "bar-trivia-night-guide",
  locale: "en",
  hub: "bar" as const,
  title: "Bar Trivia Night Guide: How to Host a Successful Quiz Night | Captain Bond",
  description: "The complete guide to hosting a trivia night at your bar or pub. Boost weekday revenue, engage customers, and keep them coming back with interactive trivia games.",
  frSlug: "guide-soiree-quiz-bar",
  ogImage: "/og/blog-bar-trivia-night-guide-en.webp",
  published: "2026-07-10",
  readTime: "7 min read",
  faq: [
    { q: "How much can a trivia night increase bar revenue?", a: "A weekly trivia night typically lifts weeknight footfall by 20 to 40 percent by drawing a loyal crowd on slow nights, with guests ordering across two to three hours." },
    { q: "Is digital or paper trivia better for a bar?", a: "Digital trivia scales to many teams and auto-scores, while paper builds a tactile pub feel. Most venues start paper then move digital as attendance grows." },
    { q: "How do I promote a bar trivia night?", a: "Post a recurring weekly slot on socials, partner with local groups, and offer a small prize. Consistency on the same night builds a habitual crowd." }
  ],
  takeaways: [
    "How to Increase Bar Revenue on Weeknights (No Extra Staff)",
    "Best Party Games for Adults 2026: Top Picks for Game Night",
    "Run trivia on the same weeknight weekly to build a loyal habitual crowd."
  ],
  sections: [
    { h2: "Why trivia nights boost bar revenue", p: "Trivia fills the slowest nights of the week. A regular crowd stays two to three hours, orders food and drinks between rounds, and turns empty seats into predictable revenue." },
    { h2: "How to plan your trivia night: a step-by-step guide", p: "Pick one fixed weeknight, build 4 to 5 rounds of mixed difficulty, assign a host, and set a simple scoring rule. Rehearse the flow once before opening the doors." },
    { h2: "Digital vs traditional trivia: which is better for bars?", p: "Digital scales to many teams and scores instantly; paper feels authentic and needs no tech. Start paper, then adopt a digital tool once teams regularly exceed ten." },
    { h2: "Promoting your trivia night", p: "Announce the same slot every week on socials, recruit local clubs and offices, and offer a modest prize. Repetition is what converts first-timers into regulars." },
    { h2: "Measuring success", p: "Track headcount, average spend per team, and return rate week over week. A growing core of repeat teams is the clearest signal your night is working." }
  ],
  related: [
    { slug: "best-party-games-for-adults-2026", title: "Best Party Games for Adults 2026: Top Picks for Game Night | Captain Bond", description: "The ultimate guide to the best party games for adults in 2026. From card games and board games to drinking games and no-" },
    { slug: "board-games-apero", title: "Best Board Games for Apéro Night (That Actually Get People Talking)", description: "A curated shortlist of apéro-friendly board games — low rules, high banter, perfect for warm-ups before the real reveal." },
    { slug: "how-to-host-game-night", title: "How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond", description: "Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group siz" }
  ],
  geoBlock: "A bar trivia night is a hosted quiz event at a pub or bar where teams answer question rounds for prizes. It boosts weeknight revenue, increases dwell time, and turns first-time visitors into regulars through a recurring social habit.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/party" },
  endingQuestion: 'What night of the week would fill your empty seats?',
};
