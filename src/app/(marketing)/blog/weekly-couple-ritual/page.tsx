import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'How to Create a Weekly Couple Ritual (20-Min Guide) | Captain Bond',
  description:
    'A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate. Step-by-step guide with science-backed benefits.',
  alternates: {
    canonical: `${siteUrl}/blog/weekly-couple-ritual`,
    languages: {
      'x-default': `${siteUrl}/blog/weekly-couple-ritual`,
      'en': `${siteUrl}/blog/weekly-couple-ritual`,
      'fr': `${siteUrl}/fr/blog/rituel-couple-hebdomadaire`,
    },
  },
  other: {
    'datePublished': '2025-07-01',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: 'How to Create a Weekly Couple Ritual (20-Min Guide)',
    description:
      'A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate.',
    url: `${siteUrl}/blog/weekly-couple-ritual`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-weekly-ritual-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Weekly Couple Ritual guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Create a Weekly Couple Ritual (20-Min Guide)',
    description:
      'A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate.',
    images: [`${siteUrl}/og/blog-weekly-ritual-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a weekly couple ritual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A weekly couple ritual is a dedicated, recurring time slot where partners intentionally connect — no phones, no agenda, just focused attention on each other.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should a weekly couple ritual be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Twenty minutes is the sweet spot. Long enough to go deeper than surface talk, short enough to fit into busy schedules and avoid fatigue.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do you talk about during a couple ritual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use conversation cards, question decks, or a simple check-in format. Topics range from fun and light to deep and emotional, depending on your mood.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a weekly ritual help a struggling relationship?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A consistent ritual rebuilds trust, improves communication, and creates emotional safety — but serious issues may also need professional support.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best day for a couple ritual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sunday evening works for many couples because the week is winding down. The best day is whichever one you can reliably protect from other commitments.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should we use questions or just talk freely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Both work. Guided questions prevent the conversation from drifting into logistics. Free talk is fine if you naturally avoid the grocery-list trap.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do we start a weekly couple ritual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pick a day, set a timer for 20 minutes, remove distractions, and use a simple format: check-in, a few questions, and a gratitude exchange.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if we miss a week?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Missing a week is fine. The goal is consistency over perfection. Just pick it back up the next week without guilt.',
      },
    },
  ],
};

const directAnswerSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Weekly Couple Ritual Definition',
  description:
    'A weekly couple ritual is a dedicated, recurring time slot where partners intentionally connect without distractions to strengthen their relationship.',
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Weekly Couple Ritual (20-Min Guide)',
  description:
    'A simple 20-minute weekly ritual that keeps your relationship connected, intentional, and intimate. Step-by-step guide with science-backed benefits.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Pick a weekly slot and protect it',
      text:
        'Choose a day and time you can realistically keep. Put it in both calendars and treat it as seriously as a doctor\'s appointment. If something urgent comes up, reschedule within the same week.',
    },
    {
      '@type': 'HowToStep',
      name: 'Remove every distraction',
      text:
        'Put phones in another room, turn off the TV, and silence notifications. The mere presence of a phone reduces conversation quality and empathy.',
    },
    {
      '@type': 'HowToStep',
      name: 'Choose a conversation format',
      text:
        'Use a three-part check-in: share a high and low from the week, pick a conversation starter question, and exchange gratitude. A structured format prevents surface-level conversation.',
    },
    {
      '@type': 'HowToStep',
      name: 'Take turns speaking and listening',
      text:
        'Use a simple token system: whoever holds the object speaks while the other only listens. No cross-talk, no advice, no interrupting. Switch after one round.',
    },
    {
      '@type': 'HowToStep',
      name: 'End with gratitude',
      text:
        'In the final two minutes, each person shares one specific thing they appreciated about their partner this week. Gratitude rewires your brain to notice what is working in the relationship.',
    },
  ],
};

export default function WeeklyCoupleRitualArticlePage() {
  const publishedDate = 'July 1, 2025';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...directAnswerSchema,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/weekly-couple-ritual` },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <header className="mb-10">
          <time className="text-sm text-slate-400" dateTime="2025-07-01">
            {publishedDate}
          </time>
          <h1 >
            How to Create a Weekly Couple Ritual (20-Min Guide)
          </h1>
          <p>
            A weekly couple ritual is a dedicated, recurring time slot — no phones, no agenda, just
            twenty minutes of focused attention on each other. It is the single most effective
            practice to keep a relationship out of autopilot and into intention.
          </p>
          <p>
            Based on data from 1,200+ Captain Bond couple sessions, couples who use structured
            question decks report measurably stronger connection over time.
          </p>
        </header>

        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          The quality of a relationship is not determined by how much time you spend together, but
          by how present you are during the time you have.
        </blockquote>

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

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Key Takeaways</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li>
              A dedicated 20-minute weekly slot prevents relationships from drifting into
              transactional mode.
            </li>
            <li>
              Removing distractions — phones off, no TV — is the single highest-impact change you
              can make.
            </li>
            <li>
              Alternating speaker-listener roles creates balanced participation and deeper
              understanding.
            </li>
            <li>
              Ending with a gratitude exchange rewires your brain to notice what is working in the
              relationship.
            </li>
            <li>
              Consistency matters more than duration. Twenty minutes every week beats two hours once
              a month.
            </li>
          </ul>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Why a weekly ritual changes everything</h2>
          <p>
            Relationships do not fail because of one big fight. They erode gradually — through
            thousands of small moments when one partner reaches for connection and the other is
            distracted. The research is clear: couples who maintain shared rituals report higher
            relationship satisfaction, better communication, and greater emotional intimacy.
            Research from the Gottman Institute shows that couples who engage in structured
            conversations at least once a week report 20% higher relationship satisfaction. A 2023
            study in the Journal of Social and Personal Relationships found that couples who ask
            each other novel questions report higher intimacy levels.
          </p>
          <p>
            A weekly ritual is not another item on your to-do list. It is a container that protects
            your connection from the gravitational pull of logistics. It says: this relationship
            matters enough to appear on the calendar.
          </p>
          <p>
            The best part? You do not need candles, music, or a script. You just need twenty minutes
            and the willingness to turn toward each other instead of the nearest screen.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Step 1: Pick a weekly slot and protect it</h2>
          <p>
            Choose a day and time that you can realistically keep. Sunday evening is popular because
            the weekend is winding down and the work week has not started yet. Tuesday morning might
            work better for shift workers. There is no wrong answer — only the one you defend.
          </p>
          <p>
            Put it in both calendars. Treat it as seriously as a doctor's appointment. If something
            urgent comes up, reschedule within the same week rather than skipping entirely. The
            ritual is the commitment; the slot is just its address.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Step 2: Remove every distraction</h2>
          <p>
            This is the highest-impact step. Phones go in another room — not face down on the table.
            The TV stays off. Notifications are silenced. If you have children, wait until they are
            asleep or arrange a sitter.
          </p>
          <p>
            Research shows that the mere presence of a phone — even face down and silent — reduces
            conversation quality and empathy. Your partner deserves your full attention for twenty
            minutes. Nothing is more important in that window.
          </p>
          <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
            The mere presence of a phone reduces conversation quality. Your partner deserves the
            same attention you give a notification.
          </blockquote>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Step 3: Choose a conversation format</h2>
          <p>
            Having a structure prevents the dreaded &ldquo;So, how was your week?&rdquo; dead end.
            The simplest format is a three-part check-in:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li>
              <strong>High and low:</strong> Each person shares one highlight and one challenge from
              the week.
            </li>
            <li>
              <strong>One question:</strong> Pick a conversation starter from a deck, an app, or a
              list you keep. The question can be light, deep, or somewhere in between.
            </li>
            <li>
              <strong>Gratitude:</strong> Each person names one thing they appreciated about their
              partner this week.
            </li>
          </ul>
          <p>
            Captain Bond couple mode generates fresh questions every session, so you never run out
            of material. The app handles the structure; you focus on each other.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Step 4: Take turns speaking and listening</h2>
          <p>
            The most common mistake couples make in conversations is interrupting to problem-solve.
            When your partner shares something difficult, your instinct is to fix it. Resist that
            instinct for twenty minutes.
          </p>
          <p>
            Use a simple token system: whoever holds the object speaks; the other person only
            listens. No cross-talk, no advice, no &ldquo;That reminds me of the time…&rdquo; Switch
            after one round. This alone will transform your conversations.
          </p>
          <p>
            Listening without fixing communicates something profound: I trust you to handle your own
            life. I am here to witness, not to manage.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Step 5: End with gratitude</h2>
          <p>
            The final two minutes are the most important. Each person shares one specific thing they
            appreciated about their partner this week. &ldquo;You made me laugh when I was
            stressed&rdquo; or &ldquo;I noticed you handled the call with my mom really
            gracefully.&rdquo;
          </p>
          <p>
            Gratitude is a muscle. The more you practice it, the more your brain automatically scans
            for what is working instead of what is missing. Over time, this rewires the emotional
            climate of your entire relationship.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">A final thought</h2>
          <p>
            You do not need the perfect ritual. You need the courage to start and the discipline to
            protect it. Twenty minutes, once a week, no phones, full attention. That is it. That is
            enough to change the trajectory of your relationship.
          </p>
          <p>
            Start this week. Pick a day. Set a timer. Turn toward each other. Everything else is
            practice.
          </p>
        </section>

        <section className="article-block">
          <p>
            These questions work best when both partners are willing and have time for an
            uninterrupted conversation. If one partner is resistant or tired, start with the lighter
            sections and build up gradually — the goal is connection, not completion.
          </p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-2">Make it effortless with Captain Bond</h3>
          <p className="text-slate-200 leading-relaxed mb-4">
            Captain Bond couple mode gives you fresh conversation questions every week, a built-in
            timer, and a structured format — so you never have to improvise your ritual. Start today
            and build the habit that protects your connection.
          </p>
          <Link
            href="/couple"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Try Captain Bond couple mode
          </Link>
        </aside>
      </article>
    </>
  );
}
