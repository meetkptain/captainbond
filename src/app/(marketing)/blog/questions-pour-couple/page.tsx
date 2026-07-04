import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: '150 Questions for Couples: From Fun to Deep | Captain Bond',
  description:
    'A curated list of couple questions covering fun, intimacy, values and future dreams — plus a simple ritual to turn them into real connection.',
  alternates: {
    canonical: `${siteUrl}/blog/questions-pour-couple`,
    languages: {
      'x-default': `${siteUrl}/blog/questions-pour-couple`,
      'en': `${siteUrl}/blog/questions-pour-couple`,
      'fr': `${siteUrl}/fr/blog/questions-pour-couple`,
    },
  },
  other: {
    'datePublished': '2025-06-01',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: '150 Questions for Couples: From Fun to Deep',
    description:
      'A curated list of couple questions covering fun, intimacy, values and future dreams — plus a simple ritual to turn them into real connection.',
    url: `${siteUrl}/blog/questions-pour-couple`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-questions-couple-en.webp`,
        width: 1200,
        height: 630,
        alt: '150 Questions for Couples: From Fun to Deep',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '150 Questions for Couples: From Fun to Deep',
    description:
      'A curated list of couple questions covering fun, intimacy, values and future dreams — plus a simple ritual to turn them into real connection.',
    images: [`${siteUrl}/og/blog-questions-couple-en.webp`],
  },
};

const funQuestions = [
  'What song immediately makes you dance, no matter where you are?',
  'Which fictional character would you want as a roommate?',
  'Pineapple on pizza: yes, no, or only if no one is watching?',
  'If you could have any superpower for one day, what would it be?',
  'What was your most ridiculous childhood fear?',
  'Which meal could you eat every day for a month without getting bored?',
  'If we could teleport this weekend, where would we go?',
  'What is the worst movie you secretly love?',
  'Cats or dogs — and has your answer changed over time?',
  'What is your guiltiest-pleasure TV show?',
  'If you were a cocktail, what would you be called?',
  'What is the funniest thing that happened to you this week?',
  'Would you rather speak every language or play every instrument?',
  'What random skill do you wish you had?',
  'Which celebrity would you want to have dinner with?',
  'What is your favorite smell and why does it matter to you?',
  'If you had to wear one outfit forever, what would it be?',
  'What board game brings out your competitive side?',
  'What is the weirdest food combination you actually enjoy?',
  'If our life had a sitcom title, what would it be?',
  'What is your hidden talent?',
  'Beach vacation or mountain cabin?',
  'What app do you use way more than you would like to admit?',
  'If you could rename yourself, what name would you pick?',
  'What is your go-to karaoke song?',
  'Which season matches your personality best?',
  'What is the most impulsive thing you have ever bought?',
  'If you could switch lives with someone for a week, who would it be?',
  'What is your favorite sound in the world?',
  'What emoji best describes you today?',
];

const gettingToKnowQuestions = [
  'What did you want to be when you were ten years old?',
  'Who was your first real role model?',
  'What family tradition do you want to keep alive?',
  'What memory always makes you smile, no matter how many times you recall it?',
  'How did your parents show love when you were growing up?',
  'What is the best advice you have ever received?',
  'What book changed your perspective on life?',
  'What is your proudest non-work achievement?',
  'What does a perfect Sunday look like for you?',
  'What is something people often misunderstand about you?',
  'What value would you never compromise, even under pressure?',
  'When do you feel most like yourself?',
  'What is your earliest vivid memory?',
  'What friendship taught you the most about trust?',
  'What place feels most like home to you?',
  'What is a dream you have not told many people about?',
  'How do you recharge after a hard week?',
  'What is your love language, and how do you like to receive it?',
  'What small thing instantly improves your day?',
  'What are you genuinely grateful for today?',
  'What topic could you talk about for hours without preparing?',
  'What is a risk you are glad you took?',
  'What does success mean to you outside of your career?',
  'What tradition would you like us to start together?',
  'What is your favorite memory of us so far?',
  'What do you admire most in your closest friends?',
  'What makes you feel safe enough to be fully honest?',
  'What is something you learned the hard way?',
  'What are you curious about right now?',
  'What is one thing you hope never changes about you?',
];

const deepQuestions = [
  'What fear have you never said out loud?',
  'When did you first feel truly understood by another person?',
  'What part of your past has shaped you the most?',
  'How do you process grief when it shows up?',
  'What does vulnerability mean to you in practice?',
  'What is a wound you are still quietly healing?',
  'When do you feel lonely even with other people around?',
  'What do you need when you are sad but rarely ask for?',
  'What is your biggest insecurity, and where does it come from?',
  'How has your definition of love changed over the years?',
  'What are you most afraid to fail at?',
  'What moment in life made you grow up quickly?',
  'What do you wish your younger self had known?',
  'How do you express anger, and how do you wish you expressed it?',
  'What does forgiveness look like for you?',
  'What recurring dream or hope do you carry inside you?',
  'When was the last time you cried, and what moved you?',
  'What do you believe about trust after it has been broken?',
  'What makes you feel deeply seen?',
  'What is something you judge yourself for?',
  'How do you want to be remembered by the people you love?',
  'What would you do if you were not afraid?',
  'What do you need more of in our relationship?',
  'What is your relationship with your own emotions?',
  'What has heartbreak taught you about yourself?',
  'What does emotional safety feel like in your body?',
  'What boundary are you learning to set more clearly?',
  'What truth have you been avoiding, even from yourself?',
  'What gives your life a sense of meaning?',
  'What do you want to be celebrated for?',
];

const intimateQuestions = [
  'What is your favorite way to be touched non-sexually?',
  'What smell or sound instantly relaxes you?',
  'What is something I do that makes you feel genuinely desired?',
  'What time of day do you feel most connected to your body?',
  'What fantasy would you feel safe sharing with me?',
  'What does seduction mean to you beyond the physical?',
  'What outfit makes you feel most confident?',
  'What is your favorite memory of us being close?',
  'What kind of compliment genuinely turns you on?',
  'What is one thing you would like to try together?',
  'How do you most like to be kissed?',
  'What is your favorite part of my body, and why?',
  'What mood or setting helps you feel most romantic?',
  'What is a turn-on for you that has nothing to do with touch?',
  'What song puts you in the mood?',
  'What do you find sexy about my mind?',
  'What does aftercare look like for you?',
  'What is your favorite way to wake up together?',
  'What boundary around intimacy matters most to you?',
  'What is a secret wish you have for our relationship?',
  'What texture or temperature do you love being surrounded by?',
  'What do you daydream about when you think of us?',
  'What is one word that describes our chemistry?',
  'What kind of date makes you feel closest afterward?',
  'What is something you would like me to do more often?',
  'What is your favorite way to say goodnight?',
  'What fantasy location would you want to be intimate in?',
  'What is the most attractive quality someone can have?',
  'What does passion mean to you beyond the bedroom?',
  'What is one thing you want me to know about your desire?',
];

const futureQuestions = [
  'What does your ideal life look like in five years?',
  'Where would you like to live if money were no object?',
  'What kind of parent would you want to be, if at all?',
  'How do you feel about money and freedom?',
  'What role does faith or spirituality play in your life?',
  'What cause would you dedicate your life to?',
  'How do you want us to handle conflict as a team?',
  'What does a healthy partnership look like to you?',
  'What adventures are on your bucket list?',
  'How important is community to you?',
  'What legacy do you want to leave behind?',
  'What does retirement look like in your dreams?',
  'How do you want to celebrate milestones together?',
  'What are your non-negotiables in a relationship?',
  'What skills do you want to learn together?',
  'How do you picture our holidays in ten years?',
  'What kind of home feels right to you?',
  'What does work-life balance mean for our future?',
  'How do you want to support each other\'s dreams?',
  'What traditions from your past do you want to carry forward?',
  'What would financial security feel like for you?',
  'How do you want to grow old together?',
  'What is your stance on honesty versus kindness?',
  'What role should extended family play in our lives?',
  'What would a perfect ordinary week look like?',
  'What values do you want to model?',
  'How do you want to handle change when it arrives?',
  'What shared goal genuinely excites you?',
  'What does commitment mean to you?',
  'What is one promise you want to make to us?',
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...funQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Take a moment to reflect and share honestly.' },
    })),
    ...gettingToKnowQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Take a moment to reflect and share honestly.' },
    })),
    ...deepQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Take a moment to reflect and share honestly.' },
    })),
    ...intimateQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Take a moment to reflect and share honestly.' },
    })),
    ...futureQuestions.slice(0, 15).map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: 'Take a moment to reflect and share honestly.' },
    })),
  ],
};

export default function QuestionsForCoupleArticlePage() {
  const publishedDate = 'June 1, 2025';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-06-01">{publishedDate}</time>
        <h1 >
          150 Questions for Couples: From Fun to Deep
        </h1>
        <p>
          The best conversations rarely happen by accident. They start with a single question asked
          with curiosity, patience and no agenda. Whether you are newly dating or have shared
          decades, the right question can pull you out of autopilot and remind you why you chose
          each other.
        </p>
      </header>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        Most couples do not run out of love; they run out of novelty. The simplest technology for
        reversing that drift is a single honest question asked with no agenda.
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

      <div className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-8 rounded-2xl border border-white/10 text-center mb-10">
        <p className="text-lg md:text-xl font-semibold text-white mb-2">
          &ldquo;Couples who ask each other meaningful questions every week report
          significantly higher relationship satisfaction.&rdquo;
        </p>
        <p className="text-sm text-white/60">&mdash; The Gottman Institute</p>
      </div>

      <section className="article-block">
        <h2 >Why questions matter for couples</h2>
        <p>
          Most couples do not run out of love; they run out of novelty. Daily logistics — groceries,
          bills, schedules — crowd out the deeper conversations that once came naturally. Questions
          are the simplest technology for reversing that drift. They create a pocket of attention
          where your partner becomes interesting again, not because they changed, but because you
          decided to look closer.
        </p>
        <p>
          A good question does not demand a perfect answer. It invites honesty. It gives permission
          to say the thing that normally stays quiet. Over time, these small disclosures become the
          fabric of intimacy: the feeling that someone knows you, not just the version you perform
          for the world.
        </p>
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>&ldquo;Love is not about finding the right person, but creating a right relationship through the questions you dare to ask.&rdquo;</p>
        </blockquote>
        <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
          A good question does not demand a perfect answer. It invites the thing that normally stays
          quiet.
        </blockquote>
        <p>
          This is what makes questions the cheapest, most powerful tool in any relationship. They
          require no app, no subscription, no special setting — just two people and the willingness
          to be curious about each other again.
        </p>
      </section>

      <section className="article-block">
        <h2 >How to use this list</h2>
        <p>
          Quantity is not the goal. Connection is. Here is a simple ritual that makes the most of
          these prompts:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
          <li>
            <strong>Pick a weekly slot.</strong> Twenty minutes is enough. Put phones in another
            room.
          </li>
          <li>
            <strong>One person asks, the other answers.</strong> Then swap roles. The listener stays
            curious instead of problem-solving.
          </li>
          <li>
            <strong>Create a safety zone.</strong> Either of you can pass on any question without
            explaining why.
          </li>
          <li>
            <strong>Follow the energy.</strong> If an answer opens a door, walk through it instead of
            rushing to the next prompt.
          </li>
        </ul>
        <p>
          The prompts below are grouped by theme and intensity. You do not need to answer all 150 in
          one night. Dip in, skip around, and come back when the moment feels right. If you want
          hundreds more prompts generated for you, the Captain Bond couple mode builds fresh
          question decks every session.
        </p>
      </section>

      <section className="article-block">
        <h2 >Fun and light questions</h2>
        <p>
          Use these when you want to laugh, remember that you enjoy each other, or break a tense
          mood. Playfulness is underrated glue in long-term relationships.
        </p>
        <ul >
          {funQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>&ldquo;Playfulness is the shortest distance between two hearts.&rdquo;</p>
        </blockquote>

      <section className="article-block">
        <h2 >Getting-to-know-you questions</h2>
        <p>
          Even partners who have been together for years can discover new rooms in each other. These
          prompts explore history, values and the small details that make a person feel unique.
        </p>
        <ul >
          {gettingToKnowQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Deep and emotional questions</h2>
        <p>
          Go here when the house is quiet, you both have bandwidth, and you want to feel genuinely
          close. These questions ask for vulnerability, so take them slowly and without pressure.
        </p>
        <ul >
          {deepQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >Intimate and spicy questions</h2>
        <p>
          Desire starts in the mind. These prompts stay classy while inviting you to talk about
          attraction, touch and what makes you feel wanted. Use them to build anticipation and
          clarity at the same time.
        </p>
        <ul >
          {intimateQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          <p>&ldquo;Desire and direction — when you know where you are going and who you are going with, intimacy finds its way.&rdquo;</p>
        </blockquote>

      <section className="article-block">
        <h2 >Future and values questions</h2>
        <p>
          Shared direction is what turns chemistry into partnership. These questions help you
          calibrate where you are heading and what you each need along the way.
        </p>
        <ul >
          {futureQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="article-block">
        <h2 >A final thought</h2>
        <p>
          You do not need the perfect question. You need the courage to ask and the patience to
          listen.
        </p>
        <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
          You do not need the perfect question. You need the courage to ask and the patience to
          listen.
        </blockquote>
        <p>
          The list above is a starting point. The real magic happens in the follow-up, the
          pause, the laugh, the awkward silence you sit through together. Keep a few favorites in
          your back pocket and pull them out when life starts to feel transactional. Your
          relationship will thank you.
        </p>
      </section>

      <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
        <h3 >Want more questions without the work?</h3>
        <p className="text-slate-200 mb-4">
          Captain Bond’s couple mode generates fresh question decks for you — light, deep, spicy
          and everything in between. No prep, no pressure, just better conversations.
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
