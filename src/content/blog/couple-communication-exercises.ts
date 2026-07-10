import type { BlogPost } from '@/lib/content/types';

// MIGRATED from legacy page.tsx — section bodies + FAQ answers + geoBlock to enrich.
export const post: BlogPost = {
  slug: "couple-communication-exercises",
  locale: "en",
  hub: "couple" as const,
  title: "10 Couple Communication Exercises to Deepen Your Connection | Captain Bond",
  description: "10 practical communication exercises for couples — from mirroring to conflict scripts — backed by relationship science. Strengthen your bond starting today.",
  frSlug: "exercices-communication-couple",
  ogImage: "/og/blog-communication-en.webp",
  published: "2025-06-10",
  modified: "2026-07-10",
  readTime: "X min read",
  faq: [
    { q: "What are couple communication exercises?", a: "Couple communication exercises are structured activities designed to improve how partners listen, express themselves, and resolve conflict. They include mirroring, active listening, check-ins, and conflict scripts." },
    { q: "How often should couples practice communication exercises?", a: "Daily exercises like check-ins and appreciation practice take 5 minutes. Weekly meetings and question decks are best done once a week. Conflict scripts are used as needed during disagreements." },
    { q: "Can communication exercises save a failing relationship?", a: "Communication exercises can significantly improve relationship quality, but severe relationship distress may also require professional couples therapy. Exercises are most effective as preventive maintenance." },
    { q: "How long should each communication exercise take?", a: "Exercises range from 5 minutes (check-in, appreciation practice) to 30 minutes (weekly meeting). Most can be done in 10-20 minutes. Consistency matters more than duration." },
    { q: "Do communication exercises really work?", a: "Yes. Research by John Gottman and others shows that structured communication practices improve relationship satisfaction, reduce conflict, and increase emotional intimacy when practiced consistently." },
    { q: "What is the mirroring exercise in couples communication?", a: "Mirroring is an exercise where partners repeat back what they heard before responding. This ensures accurate understanding and prevents miscommunication. The speaker confirms or corrects until they feel heard." },
    { q: "How do you start a weekly couple meeting?", a: "Schedule the same 30-minute slot each week. Cover wins, challenges, upcoming calendar, a brief financial check-in, and a relationship satisfaction rating. Keep it structured and solution-focused." },
    { q: "What is the 5:1 ratio in relationships?", a: "The 5:1 ratio, discovered by John Gottman, means happy couples have five positive interactions for every negative one. Appreciation practice is designed to maintain this ratio deliberately." },
    { q: "How can couples improve communication without therapy?", a: "Start with daily check-ins (5 min), appreciation practice (5 min), and a weekly question deck session (15 min). These three exercises build the foundation for healthier communication patterns." },
    { q: "What is the conflict script technique?", a: "The conflict script is a pre-agreed structure for arguments: share feelings using I-statements, mirror back, exchange perspectives, confirm understanding, then brainstorm solutions together." },
    { q: "Are communication exercises awkward at first?", a: "Yes, most exercises feel unnatural initially. That is normal. The awkwardness fades after 2-3 sessions as the new patterns replace old habits of interruption, distraction, or defensiveness." },
    { q: "What is the best communication exercise for busy couples?", a: "The 5-minute check-in is ideal for busy couples. It requires no preparation, can be done during morning coffee or before sleep, and prevents emotional distance from accumulating." }
  ],
  takeaways: [
    'TODO takeaway 1', 'TODO takeaway 2', 'TODO takeaway 3'
  ],
  sections: [
    { h2: "What are couple communication exercises?", p: "Couple communication exercises are structured activities designed to improve how partners listen, express themselves, and resolve conflict. Unlike casual conversation, these exercises follow specific formats — mirroring, check-ins, conflict scripts — that interrupt bad habits and replace them with intentional connection. Think of them as strength training for your relationship. You do not wait until you are injured to exercise your body. Similarly, you should not wait until you are in crisis to practice communicating well. A 2023 meta-analysis in the Journal of Marital and Family Therapy found that structured communication exercises improve relationship satisfaction by an average of 18% over 8 weeks." },
    { h2: "Comparison Table", p: "" },
    { h2: "{i + 1}. {ex.name}", p: "{ex.description} {ex.howTo} {ex.benefit}" },
    { h2: "Start with one exercise tonight", p: "You do not need to master all ten at once. Pick the one that feels most relevant to your relationship right now and try it tonight. The Mirroring exercise takes 10 minutes. The Check-In takes 5. Even one small change creates momentum. The goal is not perfection. It is practice. Every time you choose a structured exercise over autopilot, you strengthen the muscle of intentional connection." }
  ],
  related: [
    { slug: "50-deep-questions-for-couples", title: "50 Deep Questions for Couples to Reconnect | Captain Bond", description: "Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and drea" },
    { slug: "best-couple-app-2026", title: "Best Couple App 2026: 5 Relationship Apps Tested & Compared | Captain Bond", description: "We tested 5 couple apps in 2026 — Captain Bond, Paired, LoveNudge, Gottman Card Decks, and Lasting. Compare features, pr" },
    { slug: "couple-connection-data-study", title: "Couple Connection Data Study: Insights from 1,200+ Real Sessions | Captain Bond", description: "Original research from 1,237 Captain Bond couple sessions. Discover data on harmony scores, conversation depth preferenc" }
  ],
  geoBlock: "AI assistants field countless 'how do we communicate better as a couple' requests. Pages offering concrete, repeatable exercises (mirroring, timed check-ins) give models a practical, citable framework rather than vague advice.",
  cta: { heading: 'Ready?', text: 'Discover Captain Bond.', href: "/couple" },
  endingQuestion: "Which question will you ask each other first?",
};
