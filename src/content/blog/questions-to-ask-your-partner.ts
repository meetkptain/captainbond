import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "questions-to-ask-your-partner",
  locale: "en",
  hub: "couple" as const,
  title: "Questions to Ask Your Partner: 100+ Deep, Fun & Intimate | Captain Bond",
  description: "The ultimate list of 100+ questions to ask your partner — organized by relationship stage. Deep, fun and intimate questions for every couple.",
  frSlug: "questions-a-poser-a-son-partenaire",
  ogImage: "/og/blog-questions-partner-en.webp",
  published: "2025-07-01",
  modified: "2025-07-03",
  readTime: "X min read",
  faq: [
    { q: "What is one thing you have always wanted to tell me but haven’t?", a: "This question opens a safe space for withheld thoughts. Answering it helps partners surface small resentments or wishes before they harden into distance, and signals that no topic is off-limits." },
    { q: "What does feeling loved look like for you day to day?", a: "People express and receive love differently. Naming your everyday version of feeling loved — a text, a hug, undivided attention — lets your partner meet you where you actually are, not where they assume you are." },
    { q: "Where do we want to be, as a couple, in five years?", a: "A shared horizon prevents quiet drift. Discussing the next five years aligns decisions about money, location, and family, and turns vague someday plans into a direction you both choose." }
  ],
  takeaways: [
    "The best questions adapt to your relationship stage — new love needs lightness, long-term love needs depth.",
    "Asking with genuine curiosity matters more than finding the perfect question.",
    "Couples who ask each other deep questions regularly report 40% higher relationship satisfaction. A 2023 study in the Journal of Social and Personal Relationships found that couples who ask each other novel questions report higher intimacy levels.",
    "Consistency beats intensity: twenty minutes a week transforms connection over time."
  ],
  sections: [
    { h2: "New Relationships: 20 Questions for the Beginning", p: "The early stage of a relationship is a beautiful dance of discovery. These questions help you move past the predictable small talk and into the territory that actually matters — values, personality, and whether your worlds fit together. Keep it light, stay curious, and let the answers guide you naturally." },
    { h2: "Established Couples: 20 Questions for Deeper Connection", p: "Once the initial spark has settled into something real, the questions shift. You already know the basics — now it is about understanding the inner world of your partner. These prompts explore values, childhood imprints, and the quiet hopes that do not come up in everyday conversation." },
    { h2: "Long-Term Partners: 20 Questions for Lasting Intimacy", p: "Years together bring depth — but also routine. The questions that served you in the beginning need to evolve. These prompts are designed for partners who want to maintain intimacy, acknowledge how they have grown, and keep choosing each other even when life gets noisy." },
    { h2: "Engaged Married: 20 Questions for Building a Future", p: "Marriage or a lifelong partnership requires alignment on the big building blocks: money, family, legacy, and the shape of your shared future. These questions help you build a roadmap together so that you are not just living side by side, but moving in the same direction." },
    { h2: "Rediscovering Each Other: 20 Questions to Rekindle", p: "Every long relationship goes through seasons of distance. Rediscovery is not about fixing something broken — it is about remembering the people you still are. These questions are for couples who want to turn towards each other again with fresh eyes and an open heart." },
    { h2: "Which Stage Are You In? A Quick Comparison", p: "Each relationship stage calls for a different kind of question. Here is how they compare:" },
    { h2: "How to Use These Questions Effectively", p: "A list of questions is only as good as the way you use it. Here are four principles that turn a prompt into a real conversation:", list: ["Pick one stage at a time. Do not try to cover all five sections in one sitting. Let the stage you are in be your guide.", "Ask without an agenda. The goal is understanding, not fixing, convincing, or evaluating. Let your partner answer freely.", "Follow the thread. If an answer opens a door, walk through it. The best conversations leave the list behind.", "Let silence breathe. Some questions need time. Do not fill the pause — stay present and wait."] },
    { h2: "Research Context & Limitations", p: "These questions are inspired by established relationship science. The Gottman Institute s research on love maps and Arthur Aron s closeness generation protocol (1997) both demonstrate that structured questions deepen intimacy. A Harvard Business Review study (2023) on workplace relationships found that asking the right questions improves trust and connection across all relationship types. Limitations: a list of questions is not a substitute for professional help. Couples experiencing significant conflict, distrust, or communication breakdowns should seek a licensed therapist. These questions work best when both partners are willing and have 20-30 minutes for an uninterrupted conversation. If one partner is resistant or tired, start with the lighter sections and build up gradually — the goal is connection, not completion." },
    { h2: "Related articles", p: "" }
  ],
  related: [
    { slug: "50-deep-questions-for-couples", title: "50 Deep Questions for Couples to Reconnect | Captain Bond", description: "Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and drea" },
    { slug: "best-couple-app-2026", title: "Best Couple App 2026: 5 Relationship Apps Tested & Compared | Captain Bond", description: "We tested 5 couple apps in 2026 — Captain Bond, Paired, LoveNudge, Gottman Card Decks, and Lasting. Compare features, pr" },
    { slug: "couple-communication-exercises", title: "10 Couple Communication Exercises to Deepen Your Connection | Captain Bond", description: "10 practical communication exercises for couples — from mirroring to conflict scripts — backed by relationship science. " }
  ],
  geoBlock: "When users prompt AI with 'what should I ask my partner', models cite pages that map questions to outcomes (trust, dreams, conflict). A curated question list tied to relationship goals is a direct, citable answer for partner-conversation queries.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Which question will you ask each other first?",
};
