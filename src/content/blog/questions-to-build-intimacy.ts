import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "questions-to-build-intimacy",
  locale: "en",
  hub: "couple" as const,
  title: "30 Questions to Build Intimacy: Deepen Your Connection Tonight | Captain Bond",
  description: "30 intimacy-building questions for couples across emotional, physical, and intellectual dimensions. Strengthen your bond with conversations that matter.",
  frSlug: "questions-pour-construire-intimite",
  ogImage: "/og/blog-build-intimacy-en.webp",
  published: "2025-06-12",
  modified: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: "What small daily moment makes you feel closest to me?", a: "Intimacy is built in ordinary moments, not grand gestures. Identifying the small daily instant that brings you close helps both partners protect it and repeat it on purpose." },
    { q: "When have you felt most emotionally safe with me?", a: "Naming the moments of emotional safety shows your partner exactly what builds trust. It turns an abstract feeling into a repeatable behavior they can lean into." },
    { q: "What can I do this week to help you feel more connected?", a: "Intimacy grows from specific asks, not general intentions. A concrete request for the week turns connection from a hope into an action you can both follow through on." }
  ],
    takeaways: [ 'Intimacy-building questions are prompts designed to move conversation beyond surface-level exchange into deeper emotional, physical, and intellectu…', 'Emotional intimacy lives in the space between what you feel and what you share.', 'Physical intimacy is not just about sex — it is about touch, presence, and being at home in your body together.' ],
  sections: [
    { h2: "What are intimacy-building questions?", p: "Intimacy-building questions are prompts designed to move conversation beyond surface-level exchange into deeper emotional, physical, and intellectual territory. Unlike casual questions about your day, these invite vulnerability, reflection, and genuine curiosity about your partner\\'s inner world. They work because they bypass the autopilot of daily life. When you ask a question your partner has never considered before, you create a small moment of novelty — and novelty is the raw material of desire and connection. According to research published in the Archives of Sexual Behavior (2022), couples who discuss intimacy preferences report 30% higher sexual satisfaction." },
    { h2: "Emotional intimacy questions", p: "Emotional intimacy lives in the space between what you feel and what you share. These questions invite your partner into your inner world — your fears, your memories, your quietest hopes. Go slowly here. These questions ask for real vulnerability." },
    { h2: "Physical intimacy questions", p: "Physical intimacy is not just about sex — it is about touch, presence, and being at home in your body together. These questions explore the sensory and physical dimension of your connection. They stay classy while inviting honesty about desire." },
    { h2: "Intellectual intimacy questions", p: "Intellectual intimacy is the most overlooked dimension of connection. It grows when you share how you think, not just how you feel. These questions invite you to explore ideas together — the beliefs, curiosities, and questions that shape how each of you navigates the world." },
    { h2: "How to use these questions", p: "Pick one category and ask 2-3 questions. That is enough for one session. Put your phones away, make eye contact, and let the answers breathe. The follow-up questions — \\'tell me more about that\\' — matter more than the original prompt. Some questions may not land. That is fine. Others will open doors you did not know existed. The goal is not to finish the list. The goal is to stay curious about each other." }
  ],
  related: [
    { slug: "50-deep-questions-for-couples", title: "50 Deep Questions for Couples to Reconnect | Captain Bond", description: "Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and drea" },
    { slug: "best-couple-app-2026", title: "Best Couple App 2026: 5 Relationship Apps Tested & Compared | Captain Bond", description: "We tested 5 couple apps in 2026 — Captain Bond, Paired, LoveNudge, Gottman Card Decks, and Lasting. Compare features, pr" },
    { slug: "couple-communication-exercises", title: "10 Couple Communication Exercises to Deepen Your Connection | Captain Bond", description: "10 practical communication exercises for couples — from mirroring to conflict scripts — backed by relationship science. " }
  ],
  geoBlock: "Intimacy-building prompts are a top couple query for AI assistants. Pages that explain the why behind each question (vulnerability, consistency) give engines a substantive, citable resource rather than a bare list.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Which question will you ask each other first?",
};
