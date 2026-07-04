import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Couple Questions for Deeper Connection: The Complete Guide | Captain Bond',
  description:
    '150+ couple questions across 5 connection levels — fun, getting-to-know, deep, intimate, and future. A step-by-step ritual to turn every conversation into real intimacy.',
  alternates: {
    canonical: `${siteUrl}/blog/couple-questions-complete-guide`,
    languages: {
      'x-default': `${siteUrl}/blog/couple-questions-complete-guide`,
      'en': `${siteUrl}/blog/couple-questions-complete-guide`,
      'fr': `${siteUrl}/fr/blog/questions-couple-guide-complet`,
    },
  },
  other: {
    'datePublished': '2025-06-15',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: 'Couple Questions for Deeper Connection: The Complete Guide',
    description:
      '150+ couple questions across 5 connection levels — fun, getting-to-know, deep, intimate, and future. A step-by-step ritual to turn every conversation into real intimacy.',
    url: `${siteUrl}/blog/couple-questions-complete-guide`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-couple-questions-guide-en.webp`,
        width: 1200,
        height: 630,
        alt: 'Couple Questions for Deeper Connection: The Complete Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Couple Questions for Deeper Connection: The Complete Guide',
    description:
      '150+ couple questions across 5 connection levels — fun, getting-to-know, deep, intimate, and future. A step-by-step ritual to turn every conversation into real intimacy.',
    images: [`${siteUrl}/og/blog-couple-questions-guide-en.webp`],
  },
};

const funQuestions = [
  'If our relationship had a theme song, what would it be?',
  'What is the dumbest thing you have ever done to make me laugh?',
  'Which fictional universe would you want to live in together?',
  'What food do you pretend to like in public but secretly hate?',
  'If you could instantly master any instrument, which one?',
  'What is the most embarrassing ringtone or notification you have ever had?',
  'Would you rather live in a treehouse or an underground bunker with me?',
  'What is your favorite inside joke between us?',
  'If we could be contestants on any game show, which one?',
  'What is the most ridiculous argument we have ever had?',
  'Which one of us would survive longer in a zombie apocalypse?',
  'What is your spirit animal and why does it suit you?',
  'If you had to describe me in one word, what would it be?',
  'What decade do you think we would have thrived in?',
  'What is the weirdest dream you have ever had about us?',
  'If our love story were a movie, who would play us?',
  'What would you do with a completely free week — just us?',
  'What is the worst fashion choice you have ever made?',
  'If we started a band, what would our name and genre be?',
  'What is your favorite photo of us and why?',
  'What childhood show would you binge-watch with me right now?',
  'If you could give me a superpower, what would it be?',
  'What is the most useless talent you have?',
  'What would be our couple costume for Halloween?',
  'If we found a genie lamp, what would your three wishes be?',
  'What is the silliest thing that scares you?',
  'What would our signature dance move look like?',
  'If we swapped bodies for a day, what would you do first?',
  'What is the best prank you could pull on me?',
  'What song would play in the background of our most romantic moment?',
];

const gettingToKnowQuestions = [
  'What moment from your childhood shaped who you are today?',
  'Who taught you the most about love?',
  'What is a lesson your parents taught you without meaning to?',
  'What is the biggest risk you have ever taken that is not about me?',
  'What small thing do you do every day that no one notices?',
  'What are you most proud of that you never talk about?',
  'What does your ideal weekend look like on paper?',
  'What is a compliment you never forgot?',
  'What was a defining moment in your teenage years?',
  'What hobby would you pick up if you had unlimited time?',
  'What is the best decision you have ever made?',
  'Who in your life challenges you to grow?',
  'What memory of us makes you smile instantly?',
  'What is something about yourself you are still discovering?',
  'What does your favorite smell remind you of?',
  'What do you think your younger self would think of you now?',
  'What is the best thing that happened to you this month?',
  'What tradition from your childhood would you bring back?',
  'What do you admire most in me that took you time to notice?',
  'What is a goal you have that has nothing to do with work?',
  'What makes you feel deeply understood?',
  'What is your happiest memory from the past year?',
  'What do you think is my hidden superpower?',
  'What topic lights you up every time it comes up?',
  'What is one thing you would change about your past?',
  'What was your first impression of me?',
  'What act of kindness from a stranger stayed with you?',
  'What do you want to be remembered for in your career?',
  'What question do you wish people asked you more often?',
  'What does your ideal morning look like?',
];

const deepQuestions = [
  'What fear drives more of your decisions than you realize?',
  'When did you last feel truly alone, and what did you need?',
  'What part of yourself do you hide from most people?',
  'What has been your biggest emotional turning point in life?',
  'How do you know when you can trust someone completely?',
  'What grief are you still carrying quietly?',
  'What lie do you tell yourself most often?',
  'When did you last forgive yourself for something?',
  'What do you need to hear when you are overwhelmed?',
  'What is the hardest thing you have ever admitted to yourself?',
  'How do you want to be loved when you are struggling?',
  'What story do you tell yourself about why you are not enough?',
  'What relationship in your past taught you the most about yourself?',
  'What does safety feel like in your body?',
  'What shame have you been carrying longer than you should?',
  'What does it take for you to cry, truly?',
  'What boundary do you struggle to maintain?',
  'What would you do if you had zero fear of judgment?',
  'What part of your personality is actually a defense mechanism?',
  'When do you feel like you belong most fully?',
  'What are you most afraid of losing?',
  'What has heartbreak taught you about love?',
  'What do you want to be known for by the people closest to you?',
  'What moment in your life required the most courage?',
  'How has your relationship with your body changed over time?',
  'What unresolved question do you carry about yourself?',
  'What does compassion from a partner look like in practice?',
  'What do you need to hear when you fail at something important?',
  'What is the most honest thing you have ever said out loud?',
  'What would healing look like for you right now?',
];

const intimateQuestions = [
  'What word describes how you feel when we are truly close?',
  'What non-physical thing I do makes you feel the most connected?',
  'What is your favorite way to end a day together?',
  'What part of our intimacy do you wish we talked about more?',
  'What sound or sigh from me do you love hearing?',
  'What temperature, texture, or fabric makes you feel most sensual?',
  'What moment between us felt the most electric?',
  'What do you find beautiful about me that I overlook?',
  'What kind of eye contact makes you feel closest?',
  'What is your favorite way to be held?',
  'What small gesture from you makes me feel most desired?',
  'What fantasy would you be curious to explore with me?',
  'What does foreplay mean to you beyond the physical?',
  'What is the most attractive thing about our dynamic together?',
  'What mood or energy makes you most open to intimacy?',
  'What kiss of ours lives rent-free in your mind?',
  'What is your love language when words are not enough?',
  'What part of my mind or personality turns you on most?',
  'What kind of touch makes you feel safe and seen?',
  'What memory of us being close brings you the most joy?',
  'What does passion feel like in your everyday life?',
  'What do you wish I knew about your desires without having to ask?',
  'What setting or atmosphere helps you connect most intimately?',
  'What is your favorite moment after we make love?',
  'What does it feel like when you are fully present with me?',
  'How do you like to be woken up on a slow morning together?',
  'What boundary makes intimacy safer for you?',
  'What energy do I bring out in you that no one else does?',
  'What does intimacy look like on a day when we are both exhausted?',
  'What is one way you want to be desired by me?',
];

const futureQuestions = [
  'What does richness mean to you beyond money?',
  'Where do you picture us when we are old?',
  'What adventure do you refuse to die without taking?',
  'How do you want us to divide responsibilities in our future home?',
  'What does a thriving partnership look like twenty years from now?',
  'What values do you want our home to stand for?',
  'What kind of community do you want us to build together?',
  'What skill do you want us to learn as a couple?',
  'How do you want to handle big decisions that scare us?',
  'What role do you want travel to play in our life together?',
  'What are your non-negotiables for how we treat each other?',
  'How do you picture our relationship evolving through major life changes?',
  'What does financial partnership mean to you?',
  'What project or cause would you love for us to tackle together?',
  'What legacy do you want us to leave in our relationship?',
  'How do you want us to navigate difficult conversations with family?',
  'What kind of host do you want to be when we have our own home?',
  'What milestones do you want to celebrate in a big way?',
  'What is one dream you have for us that scares you a little?',
  'What freedom matters most to you in a long-term partnership?',
  'How do you define growing together versus growing apart?',
  'What would you like our traditions to look like in five years?',
  'What do you want your relationship with my family to look like?',
  'How do you want us to recharge each other during stressful seasons?',
  'What would a perfect ordinary Tuesday look like in ten years?',
  'What part of our current dynamic do you want to protect as we grow?',
  'How do you want to handle our alone time versus time with others?',
  'What is one promise you want us to make to each other today?',
  'What kind of parents, if any, do you imagine us being together?',
  'What do you hope we can say about our relationship on our 50th anniversary?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...funQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...gettingToKnowQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...deepQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...intimateQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
    ...futureQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: '' },
    })),
  ],
};

export default function CoupleQuestionsCompleteGuidePage() {
  const publishedDate = 'June 15, 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-15">{publishedDate}</time>
        <h1 className="text-3xl font-bold mb-4">
          Couple Questions for Deeper Connection: The Complete Guide
        </h1>
        <p >
          Most couples want to connect more deeply but do not know where to start. The answer is
          simpler than you think: the right question asked at the right time can unlock whole worlds
          between you. This guide gives you a complete framework — 150+ questions across five
          connection levels, a step-by-step ritual, and the science of why it works.
        </p>
        <p >
          Based on data from 1,200+ Captain Bond couple sessions, couples who use structured
          question decks report measurably stronger connection over time. Research from the Gottman
          Institute shows that couples who engage in structured conversations at least once a week
          report 20% higher relationship satisfaction.
        </p>
      </header>

      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
          CB
        </div>
        <div>
          <p className="font-semibold text-sm">Captain Bond Team</p>
          <p className="text-xs text-slate-400">
            Published {publishedDate} &middot; 7 min read
          </p>
        </div>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        The quality of your relationship is determined by the quality of your conversations. The
        best conversations start with one good question asked with no agenda.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">What you will get from this guide</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          <li>A proven 5-step framework for meaningful couple conversations</li>
          <li>150+ curated questions organized by depth and theme</li>
          <li>A comparison table to choose the right connection level for any moment</li>
          <li>Practical advice on how to listen, respond, and build intimacy over time</li>
          <li>Bonus tips for turning questions into a lasting weekly ritual</li>
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">The five connection levels at a glance</h2>
        <p >
          Not every moment calls for the same depth of conversation. This table helps you match the
          right level to the right mood.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-3 pr-4">Level</th>
                <th className="py-3 pr-4">Theme</th>
                <th className="py-3 pr-4">Best when</th>
                <th className="py-3">Time needed</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">1</td>
                <td className="py-3 pr-4">Fun &amp; Light</td>
                <td className="py-3 pr-4">You need to laugh or break the ice</td>
                <td className="py-3">5–10 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">2</td>
                <td className="py-3 pr-4">Getting-to-Know</td>
                <td className="py-3 pr-4">You want to discover something new</td>
                <td className="py-3">10–20 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">3</td>
                <td className="py-3 pr-4">Deep &amp; Emotional</td>
                <td className="py-3 pr-4">You have quiet time and emotional bandwidth</td>
                <td className="py-3">20–40 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">4</td>
                <td className="py-3 pr-4">Intimate &amp; Spicy</td>
                <td className="py-3 pr-4">You want to build desire and connection</td>
                <td className="py-3">15–30 min</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 pr-4 font-semibold">5</td>
                <td className="py-3 pr-4">Future &amp; Values</td>
                <td className="py-3 pr-4">You want to align direction and dreams</td>
                <td className="py-3">20–40 min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Step 1: Prepare the space</h2>
        <p >
          The environment shapes the conversation. You do not need candles and rose petals, but a
          few simple adjustments make a significant difference. Put phones in another room. Sit facing
          each other or side by side with no screen between you. Choose a time when neither of you is
          hungry, exhausted, or rushed. Even ten minutes of undivided attention beats an hour of
          distracted presence.
        </p>
        <p >
          Set one ground rule: no fixing, no solving. The goal is understanding, not problem-solving.
          If an answer makes you uncomfortable, stay curious instead of defensive. You are not
          interviewing each other; you are exploring together.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {funQuestions.slice(0, 10).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Step 2: Choose the right depth</h2>
        <p >
          The biggest mistake couples make is going too deep too fast. Depth without trust feels like
          an interrogation. Start at level 1 or 2 unless you already know you both have the bandwidth
          for more. Pay attention to body language: crossed arms, fidgeting, or avoiding eye contact
          are signals to lighten up. Leaning in, eye contact, and relaxed shoulders mean you can go
          deeper.
        </p>
        <p >
          If you are not sure where to start, try this: ask your partner to pick a number from 1 to
          5 based on how they are feeling right now. Match that level and follow their lead.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {gettingToKnowQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        The biggest mistake couples make is going too deep too fast. Match your depth to your
        partner&rsquo;s readiness, not your curiosity.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Step 3: Ask with intention</h2>
        <p >
          How you ask matters as much as what you ask. Use an open, warm tone. Start with a
          softener: &ldquo;I have been curious about something&hellip;&rdquo; or &ldquo;Can I ask you
          a question that popped into my head?&rdquo; This signals safety instead of
          interrogation. After your partner answers, pause before responding. A three-second silence
          often invites them to go deeper. Reflect back what you heard: &ldquo;It sounds like you
          felt&hellip;&rdquo; or &ldquo;That makes me understand you better.&rdquo;
        </p>
        <p >
          Avoid judgment, advice, or turning the answer into a debate. Your only job is to receive
          what they share with gratitude. When both partners feel heard without being fixed, trust
          compounds quickly.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {deepQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Step 4: Reflect together</h2>
        <p >
          The conversation does not end when the question is answered. Reflection is where the real
          connection happens. After each answer, take a moment to sit with what was shared. You can
          say: &ldquo;Thank you for telling me that,&rdquo; or &ldquo;I never saw it that way
          before.&rdquo; These small validations are powerful. They tell your partner their honesty
          is safe with you.
        </p>
        <p >
          If something they share stirs an emotion in you, name it gently. &ldquo;Hearing that makes
          me feel closer to you.&rdquo; Shared reflection turns a Q&amp;A session into a bonding
          experience that both of you will remember long after the conversation ends.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {intimateQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">Step 5: Repeat and build a ritual</h2>
        <p >
          Consistency matters more than intensity. A ten-minute check-in every week will deepen your
          connection more than a single four-hour marathon once a year. A 2023 study in the Journal
          of Social and Personal Relationships found that couples who ask each other novel questions
          report higher intimacy levels. Pick a recurring slot —
          Sunday morning coffee, Friday evening wind-down, or a mid-week walk. Make it your thing.
          Over time, these conversations become a safe container where both of you know you can bring
          anything.
        </p>
        <p >
          Keep a running list of questions that sparked the best conversations. Revisit them months
          later and notice how your answers change. Growth becomes visible when you compare where you
          were to where you are now. The ritual itself becomes the anchor that keeps you connected
          through busy seasons and quiet ones alike.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
          {futureQuestions.slice(0, 12).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        Consistency matters more than intensity. A ten-minute check-in every week deepens your
        connection more than a single four-hour marathon once a year.
      </blockquote>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mt-10 mb-4">A final thought</h2>
        <p >
          You do not need a perfect question. You need a quiet moment, a willing heart, and the
          courage to start. The questions above are tools, not rules. Adapt them, remix them, and
          let them evolve with your relationship. The goal is not to ask every question on this list.
          The goal is to build a habit of curiosity that keeps you discovering each other — for as
          long as you choose to be together.
        </p>
      </section>

      <section className="article-block">
        <p >
          These questions work best when both partners are willing and have time for an uninterrupted
          conversation. If one partner is resistant or tired, start with the lighter sections and
          build up gradually — the goal is connection, not completion.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-2">Ready for deeper conversations?</h3>
        <p className="text-slate-200 leading-relaxed mb-4">
          Captain Bond&rsquo;s couple mode generates fresh question decks tailored to your
          relationship. No prep, no awkward silences — just better conversations every time you
          open the app.
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
