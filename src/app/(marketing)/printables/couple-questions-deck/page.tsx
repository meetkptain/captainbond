import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Printable Couple Questions Card Deck | Captain Bond',
  description: 'Free printable card deck with 36 questions for couples. Cut and play.',
  alternates: {
    canonical: `${siteUrl}/printables/couple-questions-deck`,
  },
  openGraph: {
    title: 'Printable Couple Questions Card Deck | Captain Bond',
    description: 'Free printable card deck with 36 questions for couples. Cut and play.',
    url: `${siteUrl}/printables/couple-questions-deck`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/printables-couple-questions.webp`,
        width: 1200,
        height: 630,
        alt: 'Printable Couple Questions Card Deck',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Printable Couple Questions Card Deck | Captain Bond',
    description: 'Free printable card deck with 36 questions for couples. Cut and play.',
    images: [`${siteUrl}/og/printables-couple-questions.webp`],
  },
};

const questions = [
  {
    category: 'Fun & Light',
    items: [
      "What's the most embarrassing song on your playlist?",
      'If you could instantly master any skill, what would it be?',
      "What's your go-to comfort food?",
      "What's the worst movie you secretly love?",
      'If you were a superhero, what would your power be?',
      "What's the most useless talent you have?",
      "What's your guilty pleasure TV show?",
      'If you could swap lives with a celebrity for a day, who?',
      "What's the funniest thing that happened to you this month?",
    ],
  },
  {
    category: 'Getting-to-Know',
    items: [
      "What's a childhood memory that shaped who you are?",
      "What's something you've never told anyone in a relationship?",
      "What's your idea of a perfect day?",
      "What's a dream you've had since you were young?",
      "What's the most important lesson life has taught you?",
      "What's one thing you want to learn in the next year?",
      "What's your favorite way to spend a weekend?",
      "What's a book or movie that changed your perspective?",
      "What's something about yourself you're most proud of?",
    ],
  },
  {
    category: 'Deep & Emotional',
    items: [
      'When did you last cry and why?',
      "What's your biggest fear in a relationship?",
      'What does love mean to you in three words?',
      "What's a wound you're still healing from?",
      "What's something you wish people understood about you?",
      'What moment in your life changed you the most?',
      "What's the hardest thing you've ever had to say?",
      'What makes you feel truly safe?',
      'If you could say one thing to your younger self, what?',
    ],
  },
  {
    category: 'Intimate',
    items: [
      "What's your favorite way to be touched?",
      "What's something new you'd like to try together?",
      'What turns you on the most mentally?',
      "What's your love language?",
      "What's a fantasy you've never shared?",
      "What's the most intimate moment we've shared?",
      'What do you find most attractive about me?',
      'How do you feel closest to me?',
      "What's one thing you want more of in our relationship?",
    ],
  },
];

export default function CoupleQuestionsDeckPage() {
  return (
    <>
      <style>{`
        @media print {
          nav, header, footer, .no-print { display: none !important; }
          body { background: white !important; }
          .page-break { page-break-after: always; }
          .print-card {
            border: 2px dashed #374151 !important;
            background: white !important;
            color: black !important;
            break-inside: avoid;
          }
          .print-label {
            background: #e5e7eb !important;
            color: #374151 !important;
          }
          .print-intro, .print-title { color: black !important; }
          .print-instructions { color: #4b5563 !important; }
        }
        @page {
          margin: 0.5in;
          size: A4;
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-white print:bg-white print:text-black">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="no-print mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Printable Couple Questions Card Deck</h1>
            <p className="text-slate-300 text-lg">
              Print, cut, and start a conversation. 36 questions for couples in 4 categories.
            </p>
            <button
              onClick={() => window.print()}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Print Deck
            </button>
          </div>

          <div className="print-intro text-center mb-8 print:block hidden">
            <h1 className="text-2xl font-bold print-title">Couple Questions Card Deck</h1>
            <p className="print-instructions mt-2">
              Print on A4 or letter, cut along dashed lines, fold, and keep in a jar.
            </p>
          </div>

          <div className="no-print mb-6 p-4 bg-slate-800 rounded-lg">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-400 mb-2">Instructions</h2>
            <p className="text-slate-300 text-sm">
              Print on A4 or letter paper. Cut along the dashed lines. Fold each card and keep them in a jar.
              Draw one card whenever you want to start a conversation with your partner.
            </p>
          </div>

          {questions.map((section, si) => (
            <div key={section.category} className={`mb-12 ${si < questions.length - 1 ? 'page-break' : ''}`}>
              <h2 className="text-xl font-bold mb-6 text-indigo-300 print-title">
                {section.category}
                <span className="text-sm font-normal text-slate-400 ml-2 print:hidden">
                  ({section.items.length} cards)
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {section.items.map((q, qi) => (
                  <div
                    key={qi}
                    className="print-card rounded-lg p-4 flex flex-col justify-between min-h-[140px] border-2 border-dashed border-slate-600 bg-slate-900 print:bg-white"
                  >
                    <p className="text-sm print:text-black text-slate-100">
                      {q}
                    </p>
                    <span className="print-label mt-2 text-xs font-medium text-indigo-400 print:text-gray-600 self-start px-2 py-0.5 rounded bg-indigo-900/30 print:bg-gray-100">
                      {section.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="no-print mt-12 text-center text-sm text-slate-500 border-t border-slate-800 pt-6">
            <p>
              Made with 💙 by{' '}
              <a href="https://captainbond.com" className="text-indigo-400 hover:underline">
                Captain Bond
              </a>{' '}
              — Interactive party games, couple rituals & team building.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
