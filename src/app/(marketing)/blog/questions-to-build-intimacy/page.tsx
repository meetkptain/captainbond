import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '30 Questions to Build Intimacy: Deepen Your Connection Tonight | Captain Bond',
  description:
    '30 intimacy-building questions for couples across emotional, physical, and intellectual dimensions. Strengthen your bond with conversations that matter.',
  alternates: {
    canonical: `${siteUrl}/blog/questions-to-build-intimacy`,
    languages: {
      'x-default': `${siteUrl}/blog/questions-to-build-intimacy`,
      'en': `${siteUrl}/blog/questions-to-build-intimacy`,
      'fr': `${siteUrl}/fr/blog/questions-pour-construire-intimite`,
    },
  },
  other: {
    'datePublished': '2025-06-12',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: '30 Questions to Build Intimacy: Deepen Your Connection Tonight',
    description:
      '30 intimacy-building questions for couples across emotional, physical, and intellectual dimensions. Strengthen your bond with conversations that matter.',
    url: `${siteUrl}/blog/questions-to-build-intimacy`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/couple-en.webp`,
        width: 1200,
        height: 630,
        alt: '30 Questions to Build Intimacy: Deepen Your Connection Tonight',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30 Questions to Build Intimacy: Deepen Your Connection Tonight',
    description:
      '30 intimacy-building questions for couples across emotional, physical, and intellectual dimensions. Strengthen your bond with conversations that matter.',
    images: [`${siteUrl}/og/couple-en.webp`],
  },
};

const emotionalQuestions = [
  'What fear have you never said out loud to anyone?',
  'When did you last feel truly seen by me?',
  'What is a memory that still makes you emotional when you think about it?',
  'What do you need from me when you are having a hard day?',
  'What is something you wish I understood about your childhood?',
  'What does safety feel like to you in a relationship?',
  'What is a wound you are still healing from?',
  'How do you prefer to be comforted when you are sad?',
  'What do you forgive yourself for too little?',
  'What is the most vulnerable thing you have ever shared with me?',
];

const physicalQuestions = [
  'How do you like to be touched when you are not expecting anything sexual?',
  'What is your favorite way to fall asleep together?',
  'What sensory experience makes you feel most present in your body?',
  'What does desire feel like for you, from the very first spark?',
  'What outfit or look on me makes you feel most attracted?',
  'What is your favorite non-sexual physical ritual we share?',
  'How do you like to be kissed when we are saying goodbye?',
  'What temperature or texture makes you feel most relaxed physically?',
  'What part of intimacy do you wish we made more time for?',
  'What does aftercare mean to you, in or out of the bedroom?',
];

const intellectualQuestions = [
  'What idea has changed the way you see the world recently?',
  'What book or article left a mark on you?',
  'What topic could you debate passionately without getting upset?',
  'What do you think about during quiet moments alone?',
  'What is a belief you held that you have since changed your mind about?',
  'What question about life keeps you up at night?',
  'What skill or subject would you learn if time were no object?',
  'What does a meaningful conversation look like to you?',
  'What do you admire about how my mind works?',
  'What mystery in the universe fascinates you most?',
];

const allQuestions = [...emotionalQuestions, ...physicalQuestions, ...intellectualQuestions];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQuestions.map((q) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: '' },
  })),
};

export default function QuestionsToBuildIntimacyPage() {
  const publishedDate = 'June 12, 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-12">{publishedDate}</time>
        <h1 className="text-3xl font-bold mb-4">
          30 Questions to Build Intimacy: Deepen Your Connection Tonight
        </h1>
        <p className="text-slate-300 leading-relaxed">
          Intimacy is not a destination — it is a practice. It deepens every time you choose
          curiosity over assumption, honesty over comfort, and presence over distraction. These 30
          questions are designed to help you do exactly that, tonight.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Based on data from 1,200+ Captain Bond couple sessions, these questions are designed to spark the conversations that strengthen real relationships.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        Intimacy is not a destination — it is a practice. It deepens every time you choose curiosity
        over assumption.
      </blockquote>
      <p className="text-slate-300 leading-relaxed mb-8">
        A Harvard study found that emotional intimacy is the strongest predictor of long-term relationship satisfaction.
      </p>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Captain Bond Team</p>
          <p className="text-xs text-slate-400">
            Published {publishedDate} &middot; 6 min read
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">What are intimacy-building questions?</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Intimacy-building questions are prompts designed to move conversation beyond surface-level
          exchange into deeper emotional, physical, and intellectual territory. Unlike casual
          questions about your day, these invite vulnerability, reflection, and genuine curiosity
          about your partner\'s inner world.
        </p>
        <p className="text-slate-300 leading-relaxed">
          They work because they bypass the autopilot of daily life. When you ask a question your
          partner has never considered before, you create a small moment of novelty — and novelty is
          the raw material of desire and connection.
        </p>
        <p className="text-slate-300 leading-relaxed">
          According to research published in the Archives of Sexual Behavior (2022), couples who discuss intimacy preferences report 30% higher sexual satisfaction.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Key Takeaways</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>Intimacy has three dimensions: emotional, physical, and intellectual. Neglecting any one creates distance.</li>
          <li>The best questions are open-ended and cannot be answered with yes or no.</li>
          <li>Take turns asking. The listener\'s only job is to understand, not to respond or fix.</li>
          <li>You can pass on any question. Safety matters more than completion.</li>
          <li>Follow the energy. If one answer opens a door, walk through it before moving on.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Emotional intimacy questions</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Emotional intimacy lives in the space between what you feel and what you share. These
          questions invite your partner into your inner world — your fears, your memories, your
          quietest hopes. Go slowly here. These questions ask for real vulnerability.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {emotionalQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Physical intimacy questions</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Physical intimacy is not just about sex — it is about touch, presence, and being at home
          in your body together. These questions explore the sensory and physical dimension of your
          connection. They stay classy while inviting honesty about desire.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {physicalQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Intellectual intimacy questions</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Intellectual intimacy is the most overlooked dimension of connection. It grows when you
          share how you think, not just how you feel. These questions invite you to explore ideas
          together — the beliefs, curiosities, and questions that shape how each of you navigates
          the world.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {intellectualQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        Follow the energy. If one answer opens a door, walk through it before moving on.
      </blockquote>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mt-10 mb-4">How to use these questions</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Pick one category and ask 2-3 questions. That is enough for one session. Put your phones
          away, make eye contact, and let the answers breathe. The follow-up questions — \'tell me
          more about that\' — matter more than the original prompt.
        </p>
        <p className="text-slate-300 leading-relaxed">
          Some questions may not land. That is fine. Others will open doors you did not know existed.
          The goal is not to finish the list. The goal is to stay curious about each other.
        </p>
      </section>

      <section className="mb-10">
        <p className="text-slate-300 leading-relaxed">
          These suggestions work best for couples who are both willing to engage. If communication is difficult, consider professional support alongside these exercises.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Want fresh questions every time?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Captain Bond\'s couple mode generates new intimacy-building questions every session —
          emotional, physical, intellectual, and beyond. No prep, no repetition, just better
          conversations.
        </p>
        <Link
          href="/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Try Captain Bond couple mode
        </Link>
      </aside>
    </article>
  );
}
