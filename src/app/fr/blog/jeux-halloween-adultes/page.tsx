import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Jeux d\'Halloween pour Adultes : 10+ Jeux pour une Soirée d\'Enfer | Captain Bond',
  description:
    'Les meilleurs jeux d\'Halloween pour adultes : icebreakers effrayants, concours de costumes et jeux en groupe. Pas d\'appli, que du fun.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/jeux-halloween-adultes`,
    languages: {
      'x-default': `${siteUrl}/blog/halloween-party-games-adults`,
      'en': `${siteUrl}/blog/halloween-party-games-adults`,
      'fr': `${siteUrl}/fr/blog/jeux-halloween-adultes`,
    },
  },
  other: { datePublished: '2025-07-04', dateModified: new Date().toISOString().split('T')[0] },
  openGraph: {
    title: 'Jeux d\'Halloween pour Adultes',
    description: '10+ jeux d\'Halloween pour adultes.',
    url: `${siteUrl}/fr/blog/jeux-halloween-adultes`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/blog-halloween-fr.webp`, width: 1200, height: 630, alt: 'Jeux Halloween adultes' }],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'Jeux d\'Halloween pour Adultes', description: '10+ jeux d\'Halloween pour adultes.', images: [`${siteUrl}/og/blog-halloween-fr.webp`] },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Quels sont les meilleurs jeux d\'Halloween pour adultes ?', acceptedAnswer: { '@type': 'Answer', text: 'Les meilleurs jeux d\'Halloween pour adultes combinent l\'ambiance de la fête avec des mécaniques participatives : icebreakers à thème, concours de costumes interactifs, jeux de déduction et quiz horrifiques.' } },
    { '@type': 'Question', name: 'Comment organiser une soirée Halloween jeux ?', acceptedAnswer: { '@type': 'Answer', text: 'Utilisez un grand écran pour afficher le jeu, les smartphones comme manettes. Alternez icebreaker, quiz et jeux d\'ambiance. Prévoyez des récompenses pour les meilleurs costumes.' } },
    { '@type': 'Question', name: 'Faut-il une appli pour jouer à Halloween ?', acceptedAnswer: { '@type': 'Answer', text: 'Non. Les jeux modernes fonctionnent dans le navigateur du téléphone via un QR code. Pas de téléchargement, pas de compte.' } },
    { '@type': 'Question', name: 'Combien de joueurs pour une soirée Halloween ?', acceptedAnswer: { '@type': 'Answer', text: 'Les jeux sur téléphone avec affichage TV supportent de 2 à 50+ joueurs. Idéal pour les soirées Halloween de toutes tailles.' } },
    { '@type': 'Question', name: 'Quels thèmes Halloween fonctionnent le mieux ?', acceptedAnswer: { '@type': 'Answer', text: 'Les thèmes populaires incluent : films d\'horreur, légendes urbaines, costumes cultes, et quiz sur l\'histoire d\'Halloween.' } },
  ],
};

export default function JeuxHalloween() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <h1 className="text-4xl font-black text-white mb-4">Jeux d&apos;Halloween pour Adultes : 10+ Idées pour une Soirée d&apos;Enfer</h1>
        <p className="text-slate-400 text-sm mb-8">Publié le 4 juillet 2025</p>

        <section className="article-block">
          <h2 >Pourquoi les jeux d&apos;Halloween pour adultes cartonnent</h2>
          <p>Les jeux d&apos;Halloween pour adultes désignent des activités ludiques thématisées autour de la fête d&apos;Halloween, conçues pour un public adulte avec des ambiances allant du léger frisson à l&apos;humour noir. Contrairement aux versions pour enfants, ils misent sur l&apos;interactivité sociale, la créativité et une dose de compétition bienveillante.</p>
          <p>Selon Statista, les dépenses Halloween aux États-Unis ont atteint 12,2 milliards de dollars en 2024, dont 4,4 milliards pour les décorations et les fêtes. La tendance montre que les adultes de 25 à 40 ans représentent la tranche qui dépense le plus pour organiser des soirées thématiques.</p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">Les jeux d&apos;Halloween pour adultes transforment une soirée costumée en expérience interactive où tout le monde participe, pas seulement les extravertis.</blockquote>
        </section>

        <section className="article-block">
          <h2 >10+ Jeux d&apos;Halloween pour adultes</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/10"><h3 >1. Icebreaker d&apos;Halloween</h3><p>Des questions sur le thème de l&apos;horreur, des films cultes et des peurs irrationnelles. Chacun répond depuis son téléphone, les réponses s&apos;affichent sur la TV. 10-50+ joueurs.</p></div>
            <div className="p-4 rounded-xl border border-white/10"><h3 >2. Quiz films d&apos;horreur</h3><p>Citadelle, Hitchcock, Slasher — testez les connaissances de vos invités. Questions à choix multiples avec réponses en temps réel.</p></div>
            <div className="p-4 rounded-xl border border-white/10"><h3 >3. Concours de costumes interactif</h3><p>Chaque participant montre son costume, les autres votent anonymement depuis leur téléphone. Catégories : le plus effrayant, le plus créatif, le plus drôle.</p></div>
            <div className="p-4 rounded-xl border border-white/10"><h3 >4. Imposteur Halloween</h3><p>Version thématisée du jeu de déduction. L&apos;imposteur ne connaît pas le film d&apos;horreur secret. Les autres doivent le démasquer.</p></div>
            <div className="p-4 rounded-xl border border-white/10"><h3 >5. Spooky Speed Dating</h3><p>Questions rapides en duo, le groupe vote pour les meilleures réponses. Version courte et rythmée pour briser la glace.</p></div>
          </div>
        </section>

        <section className="article-block">
          <h2 >Conseils pour une soirée Halloween réussie</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li><strong>Décorez l&apos;écran</strong> — fond d&apos;écran Halloween, lumières tamisées</li>
            <li><strong>Prévoyez des lots</strong> — meilleur costume, meilleur score, meilleure réplique</li>
            <li><strong>Créez un playlist halloween</strong> — musique d&apos;ambiance entre les rounds</li>
            <li><strong>Alternez les jeux</strong> — 15-20 minutes par jeu, 3-4 jeux par soirée</li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >Note sur le contenu pour adultes</h2>
          <p>Ces jeux sont conçus pour un public adulte (18+). Certains thèmes peuvent aborder l&apos;horreur, le frisson et des sujets matures avec humour. Adaptez la sélection des jeux à votre groupe.</p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10 mb-12">
          <h3 >Préparez votre soirée Halloween</h3>
          <p className="text-slate-200 mb-4">Captain Bond a tous les jeux dont vous avez besoin : icebreaker, quiz, imposteur. La TV devient le plateau, les téléphones les manettes.</p>
          <Link href="/fr/soiree" className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors">Lancer une soirée Halloween &rarr;</Link>
        </aside>

        <section className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold mb-6">Articles connexes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/fr/blog/meilleurs-jeux-soiree-adulte-2026" className="group">
              <p className="font-semibold text-white">Meilleurs jeux de soirée 2026</p>
              <p className="text-sm text-slate-400 mt-1">Notre sélection complète</p>
            </Link>
            <Link href="/fr/blog/organiser-soiree-jeux" className="group">
              <p className="font-semibold text-white">Organiser une soirée jeux</p>
              <p className="text-sm text-slate-400 mt-1">Guide complet</p>
            </Link>
            <Link href="/fr/blog/jeux-brise-glace-adultes" className="group">
              <p className="font-semibold text-white">Jeux brise-glace</p>
              <p className="text-sm text-slate-400 mt-1">Briser la glace en groupe</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
