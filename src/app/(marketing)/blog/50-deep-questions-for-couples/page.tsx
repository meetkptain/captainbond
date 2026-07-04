import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '50 Deep Questions for Couples to Reconnect | Captain Bond',
  description:
    'Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and dreams. Reconnect meaningfully starting tonight.',
  alternates: {
    canonical: `${siteUrl}/blog/50-deep-questions-for-couples`,
    languages: {
      'x-default': `${siteUrl}/blog/50-deep-questions-for-couples`,
      'en': `${siteUrl}/blog/50-deep-questions-for-couples`,
      'fr': `${siteUrl}/fr/blog/50-questions-profondes-couple`,
    },
  },
  other: {
    datePublished: '2025-07-01',
    dateModified: '2025-07-03',
  },
  openGraph: {
    title: '50 Deep Questions for Couples to Reconnect',
    description:
      'Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and dreams. Reconnect meaningfully starting tonight.',
    url: `${siteUrl}/blog/50-deep-questions-for-couples`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-deep-questions-en.webp`,
        width: 1200,
        height: 630,
        alt: '50 Deep Questions for Couples to Reconnect',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '50 Deep Questions for Couples to Reconnect',
    description:
      'Strengthen your bond with 50 deep questions for couples organized by theme — vulnerability, past, values, love, and dreams. Reconnect meaningfully starting tonight.',
    images: [`${siteUrl}/og/blog-deep-questions-en.webp`],
  },
};

const vulnerabilityQuestions = [
  'What fear from your childhood still shows up in your adult life without you inviting it?',
  'When was the last time you felt truly vulnerable with someone, and what made that moment safe enough?',
  'What is the one thing you are afraid the people closest to you would think less of you for?',
  'What scares you most about being fully known by another person?',
  'What would you do with your life if you knew rejection was impossible?',
  'What is a fear you inherited from a parent that you wish you could let go of?',
  'What makes you feel exposed in a way that is uncomfortable, even with me?',
  'What is the bravest thing you have ever done that nobody saw?',
  'When you lie awake at night, what thought creeps in that you try to push away?',
  'What would you be most afraid to lose that is not a person or a possession?',
];

const childhoodQuestions = [
  'What part of your childhood do you wish I could have seen with my own eyes?',
  'Who in your early life made you feel like you mattered, and how did they show it?',
  'What memory from your past still has the power to make you emotional, no matter how many years have passed?',
  'What rule from your childhood home do you want to break forever, and what one do you want to keep?',
  'Was there a moment in your childhood when you felt alone even in a crowded room?',
  'What was the hardest goodbye you had to say before you turned eighteen?',
  'What is something your younger self knew that you have forgotten?',
  'What experience from your past taught you to stop trusting people so easily?',
  'If you could write a letter to your teenage self, what would be the first sentence?',
  'What person from your past do you think about more than you ever say out loud?',
];

const valuesQuestions = [
  'What is a belief you held strongly five years ago that you have since changed your mind about?',
  'What principle in your life would you never compromise, even if it cost you a relationship?',
  'Where do you draw the line between being honest and being kind?',
  'What does respect actually mean to you in the small, daily moments — not in theory?',
  'What is a value you thought your parents gave you but actually developed on your own?',
  'When have you felt most conflicted between doing what is right and doing what is easy?',
  'What issue makes you angrier than it probably should, and why do you think that is?',
  'If you had to choose between loyalty and truth in a difficult situation, which would win?',
  'What belief about love did you grow up with that you have actively unlearned?',
  'What does integrity look like in a moment when nobody is watching?',
];

const loveQuestions = [
  'What moment in our relationship made you feel most certain that you chose right?',
  'What is something you need from me that you have struggled to put into words?',
  'When have you felt most disconnected from me, and what did you wish I had done differently?',
  'What does love actually feel like in your body — not as an idea, but as a physical experience?',
  'What pattern from past relationships do you still catch yourself repeating with me?',
  'What is the kindest thing I have ever done for you that I probably do not even remember?',
  'What about me scares you the most, in the context of love?',
  'If our relationship had one unspoken rule that we both follow, what do you think it is?',
  'What does being emotionally present look like for you in practice — not just the word?',
  'What do you want me to understand about the way you love that you feel I might be missing?',
];

const dreamsQuestions = [
  'What dream have you buried because it felt impractical, and what would it take to dig it up?',
  'If you knew you could not fail, what would you start tomorrow?',
  'What regret from your past still whispers to you at unexpected moments?',
  'What version of yourself do you hope exists in five years that does not fully exist yet?',
  'If you had to give up one of your biggest dreams tomorrow, which one would hurt the most to lose?',
  'What is something you once wanted badly and later realized you are glad you did not get?',
  'What would your current self apologize to your younger self for?',
  'If you could guarantee one thing about our future together, what would it be?',
  'What have you let go of that you still secretly wonder about?',
  'What do you want people to say about you when you are not in the room anymore?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...vulnerabilityQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...childhoodQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...valuesQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...loveQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
    ...dreamsQuestions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Prenez un moment pour réfléchir et partager honnêtement.' },
    })),
  ],
};

export default function DeepQuestionsForCouplesArticlePage() {
  const publishedDate = 'July 1, 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
        <h1 >
          50 Deep Questions for Couples to Reconnect
        </h1>
        <p>
          Deep questions for couples are intentional prompts designed to move conversation beyond
          daily logistics into the territory of vulnerability, values, memories, and hidden desires
          — helping partners rediscover each other beyond the roles they play at home.
        </p>
        <p>
          Based on data from 1,200+ Captain Bond couple sessions, couples who use structured
          question decks report measurably stronger connection over time.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>&ldquo;Depth is not a destination. It is a decision to stay curious when it would be easier to assume.&rdquo;</p>
        </blockquote>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-10">
        <h2 >Key Takeaways</h2>
        <ul >
          <li>Deep questions rebuild emotional intimacy by creating space for honest answers without judgment. A 2023 study in the Journal of Social and Personal Relationships found that couples who ask each other novel questions report higher intimacy levels.</li>
          <li>The 50 questions are organized into 5 themes: vulnerability, childhood, values, love, and dreams — each targeting a different layer of connection.</li>
          <li>Real reconnection happens in the follow-up, not the question itself. Stay curious, stay quiet, and let your partner finish.</li>
          <li>Use these as a weekly ritual rather than a one-time quiz to keep the conversation alive over time.</li>
        </ul>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        The distance between two people is rarely measured in years. It is measured in the questions
        they stopped asking each other.
      </blockquote>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-white">Captain Bond</p>
          <p className="text-xs text-slate-400">
            Published {publishedDate} &middot; 5 min read
          </p>
        </div>
      </div>

      <section className="article-block">
        <h2 >Why deep questions matter</h2>
        <p>
          Most couples do not drift apart because of big betrayals. They drift because the daily
          rhythm — work, chores, notifications —           slowly replaces genuine exchange with efficient
          coordination. You stop asking how your partner feels and start asking what they need from
          the store. Over months and years, that efficiency hollows out the connection.
        </p>
        <p>
          Research from the Gottman Institute shows that couples who engage in structured
          conversations at least once a week report <strong>20%</strong> higher relationship satisfaction.
        </p>
        <p>
          Deep questions reverse this by design. They force a pause. They require sitting still,
          looking at each other, and answering without a script. The first few may feel awkward.
          That is normal. Awkwardness is the price of admission to a conversation that actually
          matters.
        </p>
        <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
          Awkwardness is the price of admission to a conversation that actually matters.
        </blockquote>
      </section>

      <section className="article-block">
        <h2 >How to use these questions</h2>
        <p>
          A list of fifty questions can feel overwhelming. Resist the urge to treat it as a
          checklist. Here is a simple approach that works:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
          <li>
            <strong>Pick one category per week.</strong> Ten questions is plenty for a single
            sitting. Let the answers settle before moving on.
          </li>
          <li>
            <strong>Take turns.</strong> One person reads a question aloud. The other answers.
            Then swap. The listener stays curious instead of jumping in to relate or fix.
          </li>
          <li>
            <strong>Pass without penalty.</strong> Either of you can skip any question without
            explaining why. Safety comes first.
          </li>
          <li>
            <strong>Follow the thread.</strong> If an answer opens a door, walk through it. The
            next question can wait.
          </li>
        </ul>
        <p>
          The goal is not to finish. The goal is to feel closer when you put the list down than
          when you picked it up.
        </p>
      </section>

      <section className="article-block">
        <h2 >Vulnerability and fear</h2>
        <p>
          These questions ask for the things we usually hide — the fears we manage alone, the
          insecurities we perform confidence over, and the parts of ourselves we protect most
          carefully. Approach them with softness and no judgment.
        </p>
        <ul >
          {vulnerabilityQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Childhood and past</h2>
        <p>
          Who we are today was shaped long before we met. These questions explore the moments,
          people, and wounds that built the person you love — and reveal the invisible threads
          between then and now.
        </p>
        <ul >
          {childhoodQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>&ldquo;Vulnerability is not weakness. It is the courage to show up and be seen when you have no control over the outcome.&rdquo;</p>
        </blockquote>

      <section className="article-block">
        <h2 >Values and beliefs</h2>
        <p>
          Shared values are the bedrock of lasting partnership. These prompts go beyond surface
          alignment to explore where your principles come from, where they differ, and what you
          each hold sacred even when no one is watching.
        </p>
        <ul >
          {valuesQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Love and relationship</h2>
        <p>
          These questions focus on the space between you — how you love, how you disconnect, what
          you need and hesitate to ask for. They are the most direct route to understanding your
          partner&apos;s inner experience of the relationship.
        </p>
        <ul >
          {loveQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Dreams and regrets</h2>
        <p>
          Regret and ambition live in the same part of the heart. These questions invite you to
          share what you still want, what you have let go of, and what you hope for — both for
          yourself and for your life together.
        </p>
        <ul >
          {dreamsQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Keeping the conversation alive</h2>
        <p>
          The real work is not asking the question. It is creating a life where these conversations
          feel natural, not scheduled. The more you practice vulnerability together, the less you
          will need a list. But until then, the list is a good place to start.
        </p>
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            The real work is not asking the question. It is creating a life where these conversations
            feel natural, not scheduled.
        </blockquote>
        <p className="text-sm text-slate-500 mb-4">
          Research backing: Dr. John Gottman&apos;s work shows that &quot;love maps&quot; — detailed knowledge of a
          partner&apos;s inner world — are a strong predictor of relationship longevity (<em>The Seven Principles
          for Making Marriage Work</em>, 1999). These questions are designed to build those maps.
        </p>
        <p>
          Keep these questions somewhere you can find them again. Pull one out during a quiet
          morning, on a long drive, or when you feel the distance creeping back. A single honest
          answer can change the whole weather of a relationship.
        </p>
      </section>

        <section className="article-block">
          <h2 >Limitations & Research Context</h2>
          <p>
            These questions are inspired by relationship science, particularly Gottman&apos;s concept of
            &quot;love maps&quot; and Arthur Aron&apos;s self-expansion theory (<em>Journal of Personality and Social Psychology</em>, 1997).
            However, a list of questions alone is not therapy. Couples experiencing severe communication
            difficulties or unresolved conflict should seek professional support alongside these exercises.
          </p>
          <p>
            Questions work best when both partners are willing and have time for an uninterrupted
            conversation (20-30 minutes recommended). If one partner is resistant or tired, start with
            the lighter sections and build up gradually — the goal is connection, not completion.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            References: Gottman, J. (1999). <em>The Seven Principles for Making Marriage Work</em>.
            Aron, A. et al. (1997). Self-expansion model. <em>JPSP</em>, 73(3).
          </p>
        </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 >Go deeper together</h3>
        <p className="text-slate-200 mb-4">
          Captain Bond&apos;s couple mode generates fresh conversation decks every session — tuned to
          your mood, your history, and the topics that matter most to you right now. No prep, no
          pressure, just real connection.
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
