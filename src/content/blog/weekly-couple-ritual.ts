import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "weekly-couple-ritual",
  locale: "en",
  hub: "couple" as const,
  title: "How to Create a Weekly Couple Ritual (20-Min Guide) | Captain Bond",
  description: "A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate. Step-by-step guide with science-backed benefits.",
  frSlug: "rituel-couple-hebdomadaire",
  ogImage: "/og/blog-weekly-ritual-en.webp",
  published: "2025-07-01",
  modified: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: "What is a weekly couple ritual?", a: "A weekly couple ritual is a dedicated, recurring time slot where partners intentionally connect — no phones, no agenda, just focused attention on each other." },
    { q: "How long should a weekly couple ritual be?", a: "Twenty minutes is the sweet spot. Long enough to go deeper than surface talk, short enough to fit into busy schedules and avoid fatigue." },
    { q: "What do you talk about during a couple ritual?", a: "Use conversation cards, question decks, or a simple check-in format. Topics range from fun and light to deep and emotional, depending on your mood." },
    { q: "Can a weekly ritual help a struggling relationship?", a: "Yes. A consistent ritual rebuilds trust, improves communication, and creates emotional safety — but serious issues may also need professional support." },
    { q: "What is the best day for a couple ritual?", a: "Sunday evening works for many couples because the week is winding down. The best day is whichever one you can reliably protect from other commitments." },
    { q: "Should we use questions or just talk freely?", a: "Both work. Guided questions prevent the conversation from drifting into logistics. Free talk is fine if you naturally avoid the grocery-list trap." },
    { q: "How do we start a weekly couple ritual?", a: "Pick a day, set a timer for 20 minutes, remove distractions, and use a simple format: check-in, a few questions, and a gratitude exchange." },
    { q: "What if we miss a week?", a: "Missing a week is fine. The goal is consistency over perfection. Just pick it back up the next week without guilt." }
  ],
  takeaways: [
    'TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'
  ],
  sections: [
    { h2: "Why a weekly ritual changes everything", p: "Relationships do not fail because of one big fight. They erode gradually — through thousands of small moments when one partner reaches for connection and the other is distracted. The research is clear: couples who maintain shared rituals report higher relationship satisfaction, better communication, and greater emotional intimacy. Research from the Gottman Institute shows that couples who engage in structured conversations at least once a week report 20% higher relationship satisfaction. A 2023 study in the Journal of Social and Personal Relationships found that couples who ask each other novel questions report higher intimacy levels. A weekly ritual is not another item on your to-do list. It is a container that protects your connection from the gravitational pull of logistics. It says: this relationship matters enough to appear on the calendar. The best part? You do not need candles, music, or a script. You just need twenty minutes and the willingness to turn toward each other instead of the nearest screen." },
    { h2: "Step 1: Pick a weekly slot and protect it", p: "Choose a day and time that you can realistically keep. Sunday evening is popular because the weekend is winding down and the work week has not started yet. Tuesday morning might work better for shift workers. There is no wrong answer — only the one you defend. Put it in both calendars. Treat it as seriously as a doctor's appointment. If something urgent comes up, reschedule within the same week rather than skipping entirely. The ritual is the commitment; the slot is just its address." },
    { h2: "Step 2: Remove every distraction", p: "This is the highest-impact step. Phones go in another room — not face down on the table. The TV stays off. Notifications are silenced. If you have children, wait until they are asleep or arrange a sitter. Research shows that the mere presence of a phone — even face down and silent — reduces conversation quality and empathy. Your partner deserves your full attention for twenty minutes. Nothing is more important in that window." },
    { h2: "Step 3: Choose a conversation format", p: "Having a structure prevents the dreaded So, how was your week? dead end. The simplest format is a three-part check-in: Captain Bond couple mode generates fresh questions every session, so you never run out of material. The app handles the structure; you focus on each other.", list: ["High and low: Each person shares one highlight and one challenge from the week.", "One question: Pick a conversation starter from a deck, an app, or a list you keep. The question can be light, deep, or somewhere in between.", "Gratitude: Each person names one thing they appreciated about their partner this week."] },
    { h2: "Step 4: Take turns speaking and listening", p: "The most common mistake couples make in conversations is interrupting to problem-solve. When your partner shares something difficult, your instinct is to fix it. Resist that instinct for twenty minutes. Use a simple token system: whoever holds the object speaks; the other person only listens. No cross-talk, no advice, no That reminds me of the time… Switch after one round. This alone will transform your conversations. Listening without fixing communicates something profound: I trust you to handle your own life. I am here to witness, not to manage." },
    { h2: "Step 5: End with gratitude", p: "The final two minutes are the most important. Each person shares one specific thing they appreciated about their partner this week. You made me laugh when I was stressed or I noticed you handled the call with my mom really gracefully. Gratitude is a muscle. The more you practice it, the more your brain automatically scans for what is working instead of what is missing. Over time, this rewires the emotional climate of your entire relationship." },
    { h2: "A final thought", p: "You do not need the perfect ritual. You need the courage to start and the discipline to protect it. Twenty minutes, once a week, no phones, full attention. That is it. That is enough to change the trajectory of your relationship. Start this week. Pick a day. Set a timer. Turn toward each other. Everything else is practice." }
  ],
  related: [
    { slug: "50-deep-questions-for-couples", title: "50 Deep Questions for Couples to Reconnect | Captain Bond", description: "Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and drea" },
    { slug: "best-couple-app-2026", title: "Best Couple App 2026: 5 Relationship Apps Tested & Compared | Captain Bond", description: "We tested 5 couple apps in 2026 — Captain Bond, Paired, LoveNudge, Gottman Card Decks, and Lasting. Compare features, pr" },
    { slug: "couple-communication-exercises", title: "10 Couple Communication Exercises to Deepen Your Connection | Captain Bond", description: "10 practical communication exercises for couples — from mirroring to conflict scripts — backed by relationship science. " }
  ],
  geoBlock: "AI recommendations for 'couple habits that work' favor pages with repeatable, time-bound rituals. A weekly ritual guide with concrete steps is a citable framework for users seeking sustainable connection routines.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Which question will you ask each other first?",
};
