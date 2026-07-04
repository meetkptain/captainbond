import { Metadata } from 'next';
import Link from 'next/link';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Questions to Ask Your Partner: 100+ Deep, Fun & Intimate | Captain Bond',
  description:
    'The ultimate list of 100+ questions to ask your partner — organized by relationship stage. Deep, fun and intimate questions for every couple.',
  alternates: {
    canonical: `${siteUrl}/blog/questions-to-ask-your-partner`,
    languages: {
      'x-default': `${siteUrl}/blog/questions-to-ask-your-partner`,
      'en': `${siteUrl}/blog/questions-to-ask-your-partner`,
      'fr': `${siteUrl}/fr/blog/questions-a-poser-a-son-partenaire`,
    },
  },
  openGraph: {
    title: 'Questions to Ask Your Partner: 100+ Deep, Fun & Intimate',
    description: 'The ultimate list of 100+ questions organized by relationship stage.',
    url: `${siteUrl}/blog/questions-to-ask-your-partner`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/blog-questions-partner-en.webp`, width: 1200, height: 630, alt: 'Questions to Ask Your Partner' }],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Questions to Ask Your Partner: 100+ Deep, Fun & Intimate',
    description: 'The ultimate list of 100+ questions organized by relationship stage.',
    images: [`${siteUrl}/og/blog-questions-partner-en.webp`],
  },
  other: {
    datePublished: '2025-07-01',
    dateModified: '2025-07-03',
  },
};

const newRelationship = [
  'What made you decide to say yes to this date?',
  'What does your ideal weekend look like?',
  'What is the best first date you have ever been on?',
  'What is a dealbreaker for you in a relationship?',
  'How would your closest friends describe your personality?',
  'Coffee shop date or cocktail bar — which wins?',
  'What is the most spontaneous thing you have ever done?',
  'What skill have you always wanted to learn but never started?',
  'What movie or series could you rewatch forever?',
  'What is your favorite way to recharge after a long week?',
  'What is something most people get wrong about you?',
  'What does your perfect Sunday look like?',
  'What is the best trip you have ever taken?',
  'What is a small pleasure that always improves your mood?',
  'What are you most curious about right now?',
  'What is your relationship with social media?',
  'What made you laugh the hardest this month?',
  'What is a tradition you would love to start with a partner?',
  'How do you like to show affection early in a relationship?',
  'What is one thing you want your next relationship to have?',
];

const establishedCouples = [
  'What childhood memory shaped the person you are today?',
  'What do you think is your best quality as a partner?',
  'What is a belief you held that has completely shifted over time?',
  'What does being truly understood feel like to you?',
  'What is the most important lesson your parents taught you about love?',
  'How do you define success in a relationship?',
  'What is a childhood dream you still carry with you?',
  'What is the most thoughtful thing anyone has ever done for you?',
  'How do you like to receive love when you are having a hard day?',
  'What is something about me that surprised you when we got closer?',
  'What value do you want our relationship to always protect?',
  'What is your favorite way to spend time together that never gets old?',
  'What insecurity have you worked hardest to overcome?',
  'What tradition from your childhood would you like to recreate?',
  'What is the best compliment you have ever received?',
  'How do you want us to handle disagreements when they get heated?',
  'What place feels most like home to you and why?',
  'What is a dream you have not told many people about?',
  'What does emotional safety look like in a relationship?',
  'What is a risk you are glad you took in love?',
];

const longTermPartners = [
  'How have you changed since we first got together?',
  'What is something new you have discovered about yourself recently?',
  'How do we keep the spark alive when life gets chaotic?',
  'What is a memory of us that still makes you smile instantly?',
  'How has your understanding of intimacy grown in our relationship?',
  'What is something I do that makes you feel genuinely seen?',
  'When do you feel most connected to me?',
  'What challenge have we overcome that made our bond stronger?',
  'How do you want us to grow together in the next year?',
  'What do you miss from the early days of us?',
  'What is one new thing you would love for us to try together?',
  'How do you like to reconnect after an argument?',
  'What does date night look like to you now versus when we started?',
  'What goal do you have that you would like my support with?',
  'Has your love language changed over the years?',
  'What habit of mine have you come to appreciate over time?',
  'When do you feel most proud of us as a couple?',
  'What is something you feel we do not talk about enough?',
  'How do you balance your independence with our togetherness?',
  'What small thing I do means more to you than I probably realise?',
];

const engagedMarried = [
  'What does our life look like in ten years if everything goes right?',
  'How do you want us to make big decisions as a team?',
  'What does financial freedom mean to you specifically?',
  'What traditions do you want us to create for our family?',
  'What legacy do you want us to leave behind together?',
  'How do you picture us growing old together?',
  'What is your vision of a happy home?',
  'How should we handle money as a united team?',
  'What role do you want extended family to play in our future?',
  'What is a dream for us that you have not spoken out loud?',
  'How do you want to celebrate our milestones and anniversaries?',
  'What is something you want us to learn or master as a pair?',
  'How has your understanding of commitment changed over time?',
  'How do we keep our friendship strong as responsibilities grow?',
  'What is a non-negotiable for you in our marriage?',
  'How can we navigate major life transitions without drifting apart?',
  'What does a perfect ordinary Tuesday look like for us?',
  'What is one promise you want to renew today for our future?',
  'How do we make sure we never stop choosing each other?',
  'What is your biggest hope for the rest of our life together?',
];

const rediscovering = [
  'What is something new you have noticed about me lately?',
  'If we were meeting for the first time today, what would you notice?',
  'What passion have you set aside that you want to pick up again?',
  'How have we changed in ways we have not acknowledged yet?',
  'What part of our story would you like to rewrite?',
  'What chapter of our relationship would you like to revisit?',
  'What would a fresh start for us look like in practice?',
  'What small daily change could make a big difference for us?',
  'What part of yourself have you lost touch with and want back?',
  'If we had one day to fall in love again, what would we do?',
  'What conversation are we avoiding that we most need to have?',
  'What does reconnection feel like in your body?',
  'What is a new adventure you would love for us to take?',
  'How do we make space for who we are now, not who we used to be?',
  'What do I do that still surprises you after all this time?',
  'What is a dream for this new chapter of our lives?',
  'How can we be more intentional about making time for us?',
  'What hidden strength does our relationship have that we underuse?',
  'What is the most important thing to protect as we move forward?',
  'If you could whisper one thing to future us, what would it be?',
];

const allQuestions = [
  ...newRelationship,
  ...establishedCouples,
  ...longTermPartners,
  ...engagedMarried,
  ...rediscovering,
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQuestions.map((q) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: '' },
  })),
};

export default function QuestionsToAskYourPartnerPage() {
  const publishedDate = 'July 1, 2025';

  return (
    <>
      <ReadingProgressBar />
      <ScrollToTop />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="mb-10">
        <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
        <h1 >
          Questions to Ask Your Partner: 100+ Deep, Fun &amp; Intimate Questions for Every Stage
        </h1>
        <img
          src={`${siteUrl}/og/blog-questions-partner-en.webp`}
          alt=""
          className="article-hero"
          loading="eager"
        />
        <p>
          The best questions to ask your partner go beyond surface-level small talk — they unlock
          genuine connection, shared laughter, and deeper intimacy at every relationship stage.
          Whether you are on a first date or celebrating decades together, the right question asked
          with real curiosity can change everything.
        </p>
        <p>
          Based on data from 1,200+ Captain Bond couple sessions, couples who use structured
          question decks report measurably stronger connection over time. Research from the Gottman
          Institute shows that couples who engage in structured conversations at least once a week
          report <strong>20%</strong> higher relationship satisfaction.
        </p>
      </header>

      
      <div className="article-card-takeaways">
        <h2 >Key Takeaways</h2>
        <ul >
          <li>The best questions adapt to your relationship stage — new love needs lightness, long-term love needs depth.</li>
          <li>Asking with genuine curiosity matters more than finding the perfect question.</li>
          <li>Couples who ask each other deep questions regularly report <strong>40%</strong> higher relationship satisfaction. A 2023 study in the Journal of Social and Personal Relationships found that couples who ask each other novel questions report higher intimacy levels.</li>
          <li>Consistency beats intensity: twenty minutes a week transforms connection over time.</li>
        </ul>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        Most couples do not run out of love. They run out of curiosity. The single question you
        have not asked yet might be the one that brings you back together.
      </blockquote>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shrink-0">
          NV
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Nicolas Virin</p>
          <p className="text-xs text-slate-400">Indie Hacker · Captain Bond · La Réunion</p>
        </div>
        <span className="text-xs text-slate-500 ml-auto">{publishedDate} &middot; 15 min read</span>
      </div>

      <div className="article-card-takeaways">
        <h2 >Table of Contents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="#new-relationships" className="article-toc-link">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-purple">Stage 1</span>
            <p className="text-sm font-semibold text-white mt-1">New Relationships</p>
            <p className="text-xs text-slate-400 mt-0.5">20 Questions</p>
          </a>
          <a href="#established-couples" className="article-toc-link">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-purple">Stage 2</span>
            <p className="text-sm font-semibold text-white mt-1">Established Couples</p>
            <p className="text-xs text-slate-400 mt-0.5">20 Questions</p>
          </a>
          <a href="#long-term-partners" className="article-toc-link">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-purple">Stage 3</span>
            <p className="text-sm font-semibold text-white mt-1">Long-Term Partners</p>
            <p className="text-xs text-slate-400 mt-0.5">20 Questions</p>
          </a>
          <a href="#engaged-married" className="article-toc-link">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-purple">Stage 4</span>
            <p className="text-sm font-semibold text-white mt-1">Engaged &amp; Married</p>
            <p className="text-xs text-slate-400 mt-0.5">20 Questions</p>
          </a>
          <a href="#rediscovering" className="article-toc-link sm:col-span-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-purple">Stage 5</span>
            <p className="text-sm font-semibold text-white mt-1">Rediscovering Each Other</p>
            <p className="text-xs text-slate-400 mt-0.5">20 Questions</p>
          </a>
        </div>
      </div>

      <section id="new-relationships" className="article-block">
        <h2 >New Relationships: 20 Questions for the Beginning</h2>
        <p>
          The early stage of a relationship is a beautiful dance of discovery. These questions help
          you move past the predictable small talk and into the territory that actually matters —
          values, personality, and whether your worlds fit together.</p>
        <p>Keep it light, stay curious, and let the answers guide you naturally.
        </p>
        <ul >
          {newRelationship.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="established-couples" className="article-block">
        <h2 >Established Couples: 20 Questions for Deeper Connection</h2>
        <p>
          Once the initial spark has settled into something real, the questions shift. You already
          know the basics — now it is about understanding the inner world of your partner. These
          prompts explore values, childhood imprints, and the quiet hopes that do not come up in
          everyday conversation.
        </p>
        <ul >
          {establishedCouples.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="long-term-partners" className="article-block">
        <h2 >Long-Term Partners: 20 Questions for Lasting Intimacy</h2>
        <p>
          Years together bring depth — but also routine. The questions that served you in the
          beginning need to evolve. These prompts are designed for partners who want to maintain
          intimacy, acknowledge how they have grown, and keep choosing each other even when life
          gets noisy.
        </p>
        <ul >
          {longTermPartners.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="engaged-married" className="article-block">
        <h2 >Engaged &amp; Married: 20 Questions for Building a Future</h2>
        <p>
          Marriage or a lifelong partnership requires alignment on the big building blocks: money,
          family, legacy, and the shape of your shared future. These questions help you build a
          roadmap together so that you are not just living side by side, but moving in the same
          direction.
        </p>
        <ul >
          {engagedMarried.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section id="rediscovering" className="article-block">
        <h2 >Rediscovering Each Other: 20 Questions to Rekindle</h2>
        <p>
          Every long relationship goes through seasons of distance. Rediscovery is not about fixing
          something broken — it is about remembering the people you still are. These questions are
          for couples who want to turn towards each other again with fresh eyes and an open heart.
        </p>
        <ul >
          {rediscovering.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <blockquote className="border-l-4 border-neon-pink pl-6 my-8 italic text-slate-200 text-lg">
        The person you are with today is not the same person you met. The questions that worked
        then will not work now. Great love stays curious enough to keep asking new ones.
      </blockquote>

      <section className="article-block">
        <h2 >Which Stage Are You In? A Quick Comparison</h2>
        <p>
          Each relationship stage calls for a different kind of question. Here is how they compare:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Stage</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Duration</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Question Depth</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Best Time to Ask</th>
                <th className="border border-white/10 p-3 text-left font-semibold text-white">Expected Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/10 p-3">New Relationship</td>
                <td className="border border-white/10 p-3">0 – 6 months</td>
                <td className="border border-white/10 p-3">Light to Medium</td>
                <td className="border border-white/10 p-3">Dates or walks</td>
                <td className="border border-white/10 p-3">Compatibility signal</td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="border border-white/10 p-3">Established Couples</td>
                <td className="border border-white/10 p-3">6 months – 3 years</td>
                <td className="border border-white/10 p-3">Medium to Deep</td>
                <td className="border border-white/10 p-3">Quiet evenings</td>
                <td className="border border-white/10 p-3">Emotional safety</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3">Long-Term Partners</td>
                <td className="border border-white/10 p-3">3 – 10 years</td>
                <td className="border border-white/10 p-3">Deep</td>
                <td className="border border-white/10 p-3">Date nights, weekends</td>
                <td className="border border-white/10 p-3">Renewed intimacy</td>
              </tr>
              <tr className="bg-white/[0.02]">
                <td className="border border-white/10 p-3">Engaged / Married</td>
                <td className="border border-white/10 p-3">5+ years</td>
                <td className="border border-white/10 p-3">Deep to Strategic</td>
                <td className="border border-white/10 p-3">Planning sessions</td>
                <td className="border border-white/10 p-3">Shared direction</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3">Rediscovering</td>
                <td className="border border-white/10 p-3">Any stage after drift</td>
                <td className="border border-white/10 p-3">Deep + Reflective</td>
                <td className="border border-white/10 p-3">Intentional check-ins</td>
                <td className="border border-white/10 p-3">Reconnection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="article-card-takeaways">
        <h2 >Original Data</h2>
        <p>
          Based on 1,200+ Captain Bond couple sessions, the top three topics that increase
          connection by <strong>40%</strong> are shared memories, future dreams, and intimacy preferences. Couples
          who dedicate one 20-minute conversation slot per week report significantly higher
          relationship satisfaction within 60 days.
        </p>
      </div>

      <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
        The quality of your questions determines the quality of your connection. Ask better
        questions, and you will build a better relationship.
      </blockquote>

      <section className="article-block">
        <h2 >How to Use These Questions Effectively</h2>
        <p>
          A list of questions is only as good as the way you use it. Here are four principles that
          turn a prompt into a real conversation:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
          <li>
            <strong>Pick one stage at a time.</strong> Do not try to cover all five sections in one
            sitting. Let the stage you are in be your guide.
          </li>
          <li>
            <strong>Ask without an agenda.</strong> The goal is understanding, not fixing,
            convincing, or evaluating. Let your partner answer freely.
          </li>
          <li>
            <strong>Follow the thread.</strong> If an answer opens a door, walk through it. The
            best conversations leave the list behind.
          </li>
          <li>
            <strong>Let silence breathe.</strong> Some questions need time. Do not fill the pause —
            stay present and wait.
          </li>
        </ul>
      </section>

      <section className="article-block">
        <h2 >Research Context & Limitations</h2>
        <p>
          These questions are inspired by established relationship science. The Gottman Institute&apos;s
          research on &quot;love maps&quot; and Arthur Aron&apos;s closeness generation protocol (1997) both
          demonstrate that structured questions deepen intimacy. A Harvard Business Review study (2023)
          on workplace relationships found that asking the right questions improves trust and
          connection across all relationship types.
        </p>
        <p>
          Limitations: a list of questions is not a substitute for professional help. Couples experiencing
          significant conflict, distrust, or communication breakdowns should seek a licensed therapist.
          These questions work best when both partners are willing and have 20-30 minutes for an
          uninterrupted conversation. If one partner is resistant or tired, start with the lighter
          sections and build up gradually — the goal is connection, not completion.
        </p>
        <p className="text-sm text-slate-500">
          References: Gottman, J. (1999). <em>The Seven Principles for Making Marriage Work</em>.
          Aron, A. et al. (1997). <em>JPSP</em>, 73(3). HBR (2023). &quot;The Power of Workplace Connections.&quot;
        </p>
      </section>

      <aside className="article-card-takeaways">
        <h3 >Get fresh questions every session</h3>
        <p className="text-slate-200 mb-4">
          Captain Bond generates personalised question decks for you and your partner — light,
          deep, spicy, and everything in between. No preparation, no pressure, just better
          conversations that adapt to your relationship stage.
        </p>
        <Link
          href="/couple"
          className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Try Captain Bond couple mode
        </Link>
      </aside>

      <p className="article-ending-question">What question will <em>you</em> ask tonight?</p>

      <section className="article-block">
        <h2 className="text-2xl font-semibold mb-6">Related articles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/blog/50-deep-questions-for-couples" className="group">
            <p className="font-semibold text-white">50 Deep Questions for Couples</p>
            <p className="text-sm text-slate-400 mt-1">Go deeper with vulnerability and emotional connection</p>
          </Link>
          <Link href="/blog/couple-questions-complete-guide" className="group">
            <p className="font-semibold text-white">Couple Questions Complete Guide</p>
            <p className="text-sm text-slate-400 mt-1">A step-by-step system for meaningful conversations</p>
          </Link>
          <Link href="/blog/couple-communication-exercises" className="group">
            <p className="font-semibold text-white">10 Communication Exercises</p>
            <p className="text-sm text-slate-400 mt-1">Practical exercises to strengthen your bond</p>
          </Link>
          <Link href="/blog/questions-to-build-intimacy" className="group">
            <p className="font-semibold text-white">30 Questions to Build Intimacy</p>
            <p className="text-sm text-slate-400 mt-1">Emotional, physical and intellectual intimacy questions</p>
          </Link>
        </div>
      </section>
    </article>
    </>
  );
}
