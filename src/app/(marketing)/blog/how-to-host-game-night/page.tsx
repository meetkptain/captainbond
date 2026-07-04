import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'How to Host an Unforgettable Game Night: The Ultimate Guide | Captain Bond',
  description:
    'Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.',
  alternates: {
    canonical: `${siteUrl}/blog/how-to-host-game-night`,
    languages: {
      'x-default': `${siteUrl}/blog/how-to-host-game-night`,
      'en': `${siteUrl}/blog/how-to-host-game-night`,
      'fr': `${siteUrl}/fr/blog/organiser-soiree-jeux`,
    },
  },
  other: {
    'datePublished': '2025-07-01',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: 'How to Host an Unforgettable Game Night: The Ultimate Guide',
    description:
      'Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.',
    url: `${siteUrl}/blog/how-to-host-game-night`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-game-night-en.webp`,
        width: 1200,
        height: 630,
        alt: 'How to Host an Unforgettable Game Night: The Ultimate Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Host an Unforgettable Game Night: The Ultimate Guide',
    description:
      'Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.',
    images: [`${siteUrl}/og/blog-game-night-en.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many people should I invite to a game night?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The sweet spot is 4 to 8 players. Smaller groups work well for strategy games; larger groups are better for party games that support teams.',
      },
    },
    {
      '@type': 'Question',
      name: 'What games are best for a game night?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The best games match your group size and energy. Party games like Codenames work for 4–8 players, strategy games like Catan shine at 3–4, and cooperative games like Pandemic bring 2–4 players together.',
      },
    },
    {
      '@type': 'Question',
      name: 'What snacks should I serve at a game night?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Serve finger foods that do not leave greasy marks on cards or components: veggie platters, popcorn, pretzels, sliders, and drinks with lids.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should a game night last?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Plan for 3 to 4 hours total. Start with a short warm-up game (15–20 min), move to the main game (45–90 min), and end with a light closer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if someone does not know how to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Assign a rule explainer who reads the manual ahead of time. Keep the first round as a practice round, and encourage questions without judgment.',
      },
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Host an Unforgettable Game Night: The Ultimate Guide',
  description:
    'Plan, host and clean up a game night that people will talk about for weeks. Guest list tips, game selection by group size, setup tricks and hosting etiquette.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Guest list and planning',
      text:
        'Invite 4 to 8 guests one week ahead. Mention start and end times, ask about dietary restrictions and comfort with competitive games. Mix friend groups with at least two people who already know each other.',
    },
    {
      '@type': 'HowToStep',
      name: 'Game selection by group size',
      text:
        'Choose 2 or 3 games that match your group size. Start with a short warm-up game, move to the main attraction, and close with something light. Learn the rules beforehand and offer a practice round.',
    },
    {
      '@type': 'HowToStep',
      name: 'Setting the scene',
      text:
        'Prepare your space with good lighting, comfortable seating, a curated playlist, and finger foods that do not leave residue on game pieces. Keep snacks on a separate surface away from the game area.',
    },
    {
      '@type': 'HowToStep',
      name: 'Hosting like a pro',
      text:
        'Learn the rules beforehand, assign a rule explainer if needed, read the room to adjust energy levels, and give a 15-minute warning before the last game so guests can wrap up.',
    },
    {
      '@type': 'HowToStep',
      name: 'Cleanup and encore',
      text:
        'End the evening with a shared cleanup, take a photo of the scoreboard, and send a post-game message thanking everyone. Jot down notes on what worked for the next game night.',
    },
  ],
};

export default function GameNightArticlePage() {
  const publishedDate = 'July 1, 2025';

  return (
    <>
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <header className="mb-10">
          <time className="text-sm text-slate-400" dateTime="2025-07-01">{publishedDate}</time>
          <h1 className="text-3xl font-bold mb-4">
            How to Host an Unforgettable Game Night: The Ultimate Guide
          </h1>
          <p >
            A great game night does not happen by accident. It starts with the right guest list,
            the right games, and a host who knows how to keep the energy flowing. Whether you are
            planning a casual evening with friends or a competitive tournament, this guide walks you
            through every step —             from invitation to cleanup — so your game night becomes the one
            everyone hopes to be invited to.
          </p>
          <p >
            Based on feedback from 10,000+ Captain Bond players, the most successful game nights combine good company with the right interactive format.
          </p>
        </header>

        <section className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 p-6 rounded-2xl border border-white/10 my-8 text-center">
          <p className="text-slate-200 italic">&ldquo;A great host does not need a perfect setup. They need a warm welcome and the willingness to adapt.&rdquo;</p>
          <p className="text-xs text-slate-500 mt-2">&mdash; Captain Bond</p>
        </section>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-semibold mb-3">Key Takeaways</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed">
            <li>Invite 4–8 guests for the best group dynamics and game compatibility.</li>
            <li>Select 2–3 games that match your group size, energy level, and time budget.</li>
            <li>Prep the space, snacks, and audio beforehand so you can host instead of scramble.</li>
            <li>Keep the mood inclusive: explain rules clearly, rotate turns fairly, and read the room.</li>
            <li>End on a high note with a short, light game and a clear wrap-up signal.</li>
          </ul>
        </div>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">1. Guest list and planning</h2>
          <p >
            The guest list is the foundation of every great game night. Too few people and the
            energy falls flat. Too many and the evening turns into chaos. The sweet spot is 4 to 8
            players — enough for team-based party games, small enough for strategy titles.
          </p>
          <p >
            Send invitations at least one week ahead. Mention the start and end time — game nights
            that "go until late" often lose people who need to leave early. Ask about dietary
            restrictions and competitive comfort. Some friends love cutthroat Settlers of Catan;
            others prefer cooperative games where nobody gets eliminated.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            The best game nights feel like a conversation that happens to have a scoreboard. The
            guest list matters more than the game collection.
          </blockquote>
          <p >
            According to a 2024 Statista report, the global board games market is projected to reach $30 billion by 2028, with party games as the fastest-growing segment.
          </p>
          <p >
            If you are mixing friend groups, aim for at least two people who already know each
            other. This gives the evening a warm anchor and helps quieter guests find their footing.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">2. Game selection by group size</h2>
          <p >
            Choosing the right games is half the battle. You want a mix that fits your group size,
            time available, and the energy level you are aiming for. Here is a quick comparison to
            help you decide:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold">Game type</th>
                  <th className="text-left py-3 px-4 font-semibold">Players</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Party games (Codenames, Pictionary)</td>
                  <td className="py-3 px-4">4–8</td>
                  <td className="py-3 px-4">30–60 min</td>
                  <td className="py-3 px-4">Large groups, mixed energy</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Strategy games (Catan, Ticket to Ride)</td>
                  <td className="py-3 px-4">3–5</td>
                  <td className="py-3 px-4">60–120 min</td>
                  <td className="py-3 px-4">Engaged, competitive groups</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Cooperative games (Pandemic, Forbidden Island)</td>
                  <td className="py-3 px-4">2–4</td>
                  <td className="py-3 px-4">45–90 min</td>
                  <td className="py-3 px-4">Teams, inclusive play</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Card games (Exploding Kittens, Uno)</td>
                  <td className="py-3 px-4">2–6</td>
                  <td className="py-3 px-4">15–30 min</td>
                  <td className="py-3 px-4">Warm-up, cool-down, casual</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Deduction games (Werewolf, Secret Hitler)</td>
                  <td className="py-3 px-4">5–10</td>
                  <td className="py-3 px-4">20–45 min</td>
                  <td className="py-3 px-4">Large groups, social energy</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p >
            Plan for 2 or 3 games per evening. Start with a short warm-up (15–20 minutes), move to
            your main attraction (45–90 minutes), and close with something light. This arc keeps
            energy high and avoids the mid-game slump.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">3. Setting the scene</h2>
          <p >
            Your space sets the tone. A good setup makes games easier to play and conversations
            easier to have. Here is how to prepare:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li>
              <strong>Lighting.</strong> Bright enough to read cards, warm enough to feel cozy.
              Avoid glare on glossy boards.
            </li>
            <li>
              <strong>Seating.</strong> Make sure every player has a clear view of the game surface.
              Low coffee tables work for card games; dining tables are better for board games.
            </li>
            <li>
              <strong>Audio.</strong> A curated playlist (instrumental, no lyrics to distract) at
              low volume fills silence without competing with conversation.
            </li>
            <li>
              <strong>Snacks and drinks.</strong> Serve finger foods that do not leave residue on
              game pieces: veggie sticks, popcorn, pretzels, sliders. Provide coasters and lids on
              drinks.
            </li>
          </ul>
          <p >
            Do not forget a dedicated surface for snacks so they stay away from the game area. A
            side table or kitchen island works perfectly.
          </p>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">4. Hosting like a pro</h2>
          <p >
            The best hosts do not play — they facilitate. Or rather, they play while keeping one eye
            on the room. Your job is to ensure everyone feels included, understands the rules, and
            has fun.
          </p>
          <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
            A great host does not win every game. They make sure everyone wants to stay for the next
            one.
          </blockquote>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li>
              <strong>Learn the rules beforehand.</strong> Read the manual and, if possible, play a
              practice round. Nothing kills momentum like flipping through pages mid-game.
            </li>
            <li>
              <strong>Assign a rule explainer.</strong> If you have a guest who loves teaching
              games, let them take the lead. Otherwise, you handle it — keep it short and offer a
              practice round.
            </li>
            <li>
              <strong>Read the room.</strong> If one player is getting crushed, suggest a team
              variation or a cooperative pivot. If the group is restless, switch games early.
            </li>
            <li>
              <strong>Manage the clock.</strong> Give a 15-minute warning before the last game so
              guests can wrap up without rushing.
            </li>
          </ul>
        </section>

        <section className="article-block">
          <h2 className="text-2xl font-semibold mt-10 mb-4">5. Cleanup and encore</h2>
          <p >
            A great game night ends as smoothly as it starts. When you call the last game, give
            everyone a few minutes to finish their turn, take a photo of the scoreboard, and help
            pack up. A shared cleanup signals that the evening is over without awkwardness.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            The best sign of a successful game night? Guests asking "When is the next one?" before
            they walk out the door.
          </blockquote>
          <p >
            After everyone leaves, jot down a quick note of what worked and what did not. Which
            games got the most laughs? Was the group too big or too small? These notes make your
            next game night even better.
          </p>
          <p >
            A post-game group chat message — thanking everyone and teasing the next date — keeps
            the momentum alive. Your friends will be looking forward to the next invitation before
            the week is over.
          </p>
        </section>

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

        <p >
          These suggestions work best for adult groups looking for social fun. For very large groups (50+) or corporate settings, consider dedicated team building platforms.
        </p>

        <section className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 p-6 rounded-2xl border border-white/10 my-8 text-center">
          <p className="text-slate-200 italic">&ldquo;The best game nights end with guests asking when the next one is — before they walk out the door.&rdquo;</p>
          <p className="text-xs text-slate-500 mt-2">&mdash; Captain Bond</p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-2">Ready for game night?</h3>
          <p className="text-slate-200 leading-relaxed mb-4">
            Captain Bond makes it easy to invite friends, share game picks, and keep the good times
            rolling. No spreadsheets, no group chat chaos — just party planning that works.
          </p>
          <Link
            href="/party"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Plan your party
          </Link>
        </aside>
      </article>
    </>
  );
}
