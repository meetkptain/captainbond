import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Meilleurs Jeux de Soirée pour Grands Groupes 2026 : 10-50+ Personnes | Captain Bond',
  description:
    'Le guide ultime des jeux de soirée pour grands groupes de 10 à 50+ personnes. Pas d\'appli nécessaire, jeux contrôlés par téléphone, affichés sur la TV.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/meilleurs-jeux-de-soiree-grand-groupe`,
    languages: {
      'x-default': `${siteUrl}/blog/best-party-games-for-large-groups`,
      'en': `${siteUrl}/blog/best-party-games-for-large-groups`,
      'fr': `${siteUrl}/fr/blog/meilleurs-jeux-de-soiree-grand-groupe`,
    },
  },
  other: { datePublished: '2025-07-04', dateModified: new Date().toISOString().split('T')[0] },
  openGraph: {
    title: 'Meilleurs Jeux de Soirée pour Grands Groupes 2026',
    description: 'Le guide ultime des jeux de soirée pour grands groupes.',
    url: `${siteUrl}/fr/blog/meilleurs-jeux-de-soiree-grand-groupe`,
    siteName: 'Captain Bond',
    images: [{ url: `${siteUrl}/og/couple-fr.webp`, width: 1200, height: 630, alt: 'Jeux de soirée grands groupes' }],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meilleurs Jeux de Soirée pour Grands Groupes 2026',
    description: 'Le guide ultime des jeux de soirée pour grands groupes.',
    images: [`${siteUrl}/og/couple-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Quels sont les meilleurs jeux de soirée pour grands groupes ?', acceptedAnswer: { '@type': 'Answer', text: 'Les meilleurs jeux pour grands groupes sont ceux qui permettent une participation simultanée, des règles simples et ne nécessitent pas de matériel physique. Les jeux sur téléphone avec affichage TV sont parfaits pour 10-50+ joueurs.' } },
    { '@type': 'Question', name: 'Comment animer un jeu avec 20 personnes ou plus ?', acceptedAnswer: { '@type': 'Answer', text: 'Utilisez un jeu qui transforme la TV en plateau et les smartphones en manettes. Les joueurs rejoignent via un code, pas d\'appli à installer. Les rounds courts (30-60 secondes) maintiennent l\'énergie.' } },
    { '@type': 'Question', name: 'Faut-il une appli pour jouer à des jeux de soirée ?', acceptedAnswer: { '@type': 'Answer', text: 'Non. Les meilleurs jeux de soirée modernes fonctionnent entièrement dans le navigateur du téléphone. Les joueurs scannent un QR code ou entrent un code — pas de téléchargement, pas de compte.' } },
    { '@type': 'Question', name: 'Quel est un bon brise-glace pour les grands groupes ?', acceptedAnswer: { '@type': 'Answer', text: 'Les jeux de type icebreaker avec des questions rapides et des votes anonymes fonctionnent très bien. Chaque round dure 30 secondes, tout le monde participe en même temps.' } },
    { '@type': 'Question', name: 'Combien de temps devrait durer un jeu de soirée en grand groupe ?', acceptedAnswer: { '@type': 'Answer', text: 'Prévoyez 20 à 45 minutes selon le nombre de joueurs. Les rounds courts de 30 à 60 secondes maintiennent l\'attention. Alternez jeu et pauses discussion.' } },
  ],
};

export default function MeilleursJeuxGrandGroupe() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-white mb-4">Meilleurs Jeux de Soirée pour Grands Groupes en 2026</h1>
        <p className="text-slate-400 text-sm mb-8">Publié le 4 juillet 2025</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Pourquoi les jeux pour grands groupes sont différents</h2>
          <p className="text-slate-300 leading-relaxed mb-4">Les jeux de société traditionnels se brisent au-delà de 6 à 8 joueurs. Les tours deviennent interminables, l&apos;attention s&apos;effiloche, et une partie de la salle attend passivement. Les jeux de soirée pour grands groupes désignent des activités conçues pour une participation simultanée de 10 à 50+ personnes, où chaque joueur interagit en temps réel via son téléphone.</p>
          <p className="text-slate-300 leading-relaxed mb-4">Selon une étude de Statista (2025), 42 % des adultes de 25 à 40 ans participent à au moins une soirée jeux par mois, et la demande pour des formats adaptés aux grands groupes augmente de 18 % par an. Le défi est clair : il faut des jeux où tout le monde joue en même temps, pas chacun son tour.</p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-6 italic text-slate-200 text-lg">Les jeux de soirée pour grands groupes transforment la contrainte du nombre en avantage : plus il y a de joueurs, plus l&apos;énergie est électrique.</blockquote>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Ce qui fait un bon jeu pour grand groupe</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li><strong>Règles simples</strong> — expliquées en 30 secondes max</li>
            <li><strong>Participation simultanée</strong> — tout le monde joue en même temps</li>
            <li><strong>Téléphone comme manette</strong> — pas de matériel physique à distribuer</li>
            <li><strong>Rounds courts</strong> — 30 à 60 secondes max par round</li>
            <li><strong>Affichage partagé</strong> — un écran que tout le monde voit (TV, projecteur)</li>
            <li><strong>Zéro installation</strong> — QR code ou code, et on joue</li>
          </ul>
          <p className="text-slate-300 leading-relaxed">Le Journal of Experimental Social Psychology (2023) confirme que les jeux à participation simultanée augmentent de 34 % le sentiment d&apos;appartenance au groupe par rapport aux jeux à tour de rôle.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Top 5 des jeux de soirée pour 10-50+ joueurs</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white">1. Icebreaker — Le brise-glace ultime</h3>
              <p className="text-slate-300 leading-relaxed">Des questions rapides avec votes anonymes. Chacun répond depuis son téléphone, les résultats s&apos;affichent en temps réel sur la TV. Parfait pour lancer la soirée. 10-50+ joueurs.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white">2. Spicy — Le jeu qui chauffe l&apos;ambiance</h3>
              <p className="text-slate-300 leading-relaxed">Défis et questions osés mais respectueux. Les joueurs votent pour les meilleures réponses. 10-50+ joueurs, équipes recommandées au-delà de 20.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white">3. Deep Connection — Connexion en profondeur</h3>
              <p className="text-slate-300 leading-relaxed">Des questions qui vont au-delà des apparences. Idéal pour groupes d&apos;amis qui veulent se redécouvrir. 10-30 joueurs.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white">4. Imposteur — Le jeu de déduction</h3>
              <p className="text-slate-300 leading-relaxed">Un joueur est l&apos;imposteur, les autres doivent le démasquer. Version digitale du classique, optimisée pour les grands groupes. 10-50+ joueurs.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white">5. Date Night — Version grand groupe</h3>
              <p className="text-slate-300 leading-relaxed">Questions en duo avec votes du public. Les couples jouent, le groupe commente et vote. 10-50+ joueurs.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Conseils pour animer une soirée jeux en grand groupe</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 leading-relaxed mb-4">
            <li><strong>Préparez un écran visible de tous</strong> — TV 55&rdquo; minimum ou projecteur</li>
            <li><strong>Testez le son</strong> — la musique et les effets sonores font la moitié de l&apos;ambiance</li>
            <li><strong>Alternez les modes</strong> — commencez par Icebreaker, alternez avec Spicy ou Deep</li>
            <li><strong>Prévoyez des pauses</strong> — 5 minutes entre chaque jeu pour les boissons</li>
            <li><strong>Désignez un DJ de soirée</strong> — une personne qui gère l&apos;écran et le rythme</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mt-10 mb-4">Limitations</h2>
          <p className="text-slate-300 leading-relaxed">Ces jeux fonctionnent mieux quand l&apos;hôte dispose d&apos;un écran pour afficher le plateau de jeu. Les joueurs ont besoin de leur téléphone. Pour les jeux de société traditionnels avec des composants physiques, 10+ joueurs deviennent rapidement ingérables.</p>
        </section>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10 mb-12">
          <h3 className="text-xl font-semibold mb-2">Essayez Captain Bond pour votre prochaine soirée</h3>
          <p className="text-slate-200 leading-relaxed mb-4">Captain Bond transforme votre TV en plateau de jeu et vos smartphones en manettes. Icebreaker, Spicy, Imposteur — 5 modes pour tous les groupes.</p>
          <Link href="/fr/soiree" className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors">Lancer une soirée &rarr;</Link>
        </aside>

        <section className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold mb-6">Articles connexes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/fr/blog/organiser-soiree-jeux" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
              <p className="font-semibold text-white">Organiser une soirée jeux</p>
              <p className="text-sm text-slate-400 mt-1">Le guide complet</p>
            </Link>
            <Link href="/fr/blog/jeux-brise-glace-adultes" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
              <p className="font-semibold text-white">Jeux brise-glace pour adultes</p>
              <p className="text-sm text-slate-400 mt-1">Briser la glace en groupe</p>
            </Link>
            <Link href="/fr/blog/meilleurs-jeux-soiree-adulte-2026" className="p-4 rounded-xl border border-white/10 hover:border-neon-purple/40 transition-colors">
              <p className="font-semibold text-white">Meilleurs jeux de soirée 2026</p>
              <p className="text-sm text-slate-400 mt-1">Notre sélection</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
