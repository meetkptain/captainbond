import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://captainbond.com';

export const metadata: Metadata = {
  title: 'Organiser une soirée jeux inoubliable : le guide ultime | Captain Bond',
  description:
    'Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d\'invités, choix des jeux par taille de groupe, astuces d\'organisation et étiquette du parfait hôte.',
  alternates: {
    canonical: `${siteUrl}/fr/blog/organiser-soiree-jeux`,
    languages: {
      'x-default': `${siteUrl}/blog/how-to-host-game-night`,
      'en': `${siteUrl}/blog/how-to-host-game-night`,
      'fr': `${siteUrl}/fr/blog/organiser-soiree-jeux`,
    },
  },
  other: {
    'datePublished': '2025-07-02',
    'dateModified': new Date().toISOString().split('T')[0],
  },
  openGraph: {
    title: 'Organiser une soirée jeux inoubliable : le guide ultime',
    description:
      'Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d\'invités, choix des jeux par taille de groupe, astuces d\'organisation et étiquette du parfait hôte.',
    url: `${siteUrl}/fr/blog/organiser-soiree-jeux`,
    siteName: 'Captain Bond',
    images: [
      {
        url: `${siteUrl}/og/blog-game-night-fr.webp`,
        width: 1200,
        height: 630,
        alt: 'Organiser une soirée jeux inoubliable : le guide ultime',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organiser une soirée jeux inoubliable : le guide ultime',
    description:
      'Planifiez, animez et concluez une soirée jeux dont on parlera encore longtemps. Liste d\'invités, choix des jeux par taille de groupe, astuces d\'organisation et étiquette du parfait hôte.',
    images: [`${siteUrl}/og/blog-game-night-fr.webp`],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Combien de personnes inviter à une soirée jeux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le nombre idéal est de 4 à 8 joueurs. Les petits groupes fonctionnent mieux pour les jeux de stratégie, les groupes plus nombreux sont parfaits pour les jeux d\'ambiance en équipes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels jeux choisir pour une soirée jeux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleurs jeux s\'adaptent à la taille et à l\'énergie du groupe. Les jeux d\'ambiance comme Codenames conviennent à 4–8 joueurs, les jeux de stratégie comme Catan brillent à 3–4, et les jeux coopératifs comme Pandemic réunissent 2–4 joueurs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels snacks servir pendant une soirée jeux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Privilégiez les aliments qui ne laissent pas de traces grasses sur les cartes ou les plateaux : bâtonnets de légumes, pop-corn, bretzels, mini-sandwichs et boissons avec couvercle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps doit durer une soirée jeux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comptez 3 à 4 heures en tout. Commencez par un jeu d\'échauffement court (15–20 min), enchaînez avec le jeu principal (45–90 min) et terminez par un jeu léger.',
      },
    },
    {
      '@type': 'Question',
      name: 'Que faire si quelqu\'un ne connaît pas les règles ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Désignez une personne qui lit les règles à l\'avance. Faites un tour de pratique et encouragez les questions sans jugement.',
      },
    },
  ],
};

export default function SoireeJeuxArticlePage() {
  const publishedDate = '2 juillet 2025';

  return (
    <>
      <article className="max-w-3xl mx-auto px-4 py-12 article-body text-slate-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <header className="mb-10">
          <time className="text-sm text-slate-400" dateTime="2025-07-02">{publishedDate}</time>
          <h1 >
            Organiser une soirée jeux inoubliable : le guide ultime
          </h1>
          <p>
            Une grande soirée jeux ne tient pas du hasard. Elle commence par les bonnes personnes,
            les bons jeux et un hôte qui sait garder l'énergie au beau fixe. Que vous prépariez une
            soirée décontractée entre amis ou un tournoi compétitif, ce guide vous accompagne à
            chaque étape —             de l'invitation au rangement — pour que votre soirée devienne celle où
            tout le monde espère être invité.
          </p>
          <p>
            Basé sur les retours de 10 000+ joueurs Captain Bond, les soirées les plus réussies combinent une bonne compagnie avec le bon format interactif.
          </p>
        </header>

        <div className="article-card-takeaways">
          <h2 className="text-lg font-semibold mb-3">Points clés à retenir</h2>
          <ul >
            <li>Invitez 4 à 8 personnes pour une dynamique de groupe optimale.</li>
            <li>Choisissez 2 à 3 jeux adaptés à la taille du groupe, à l'ambiance et au temps disponible.</li>
            <li>Préparez l'espace, les snacks et l'ambiance sonore à l'avance pour profiter de la soirée.</li>
            <li>Restez inclusif : expliquez les règles clairement, faites tourner les tours et lisez la salle.</li>
            <li>Terminez sur une note positive avec un jeu court et un signal de fin clair.</li>
          </ul>
        </div>

        <section className="article-block">
          <h2 >1. Liste d'invités et planification</h2>
          <p>
            La liste d'invités est le socle de toute bonne soirée jeux. Trop peu de monde et
            l'énergie retombe. Trop de monde et la soirée vire au chaos. Le nombre idéal se situe
            entre 4 et 8 joueurs — assez pour former des équipes, assez peu pour les jeux de
            stratégie.
          </p>
          <p>
            Envoyez les invitations au moins une semaine à l'avance. Indiquez les horaires de début
            et de fin — les soirées qui "durent jusqu'à tard" perdent souvent ceux qui doivent
            partir tôt. Demandez s'il y a des restrictions alimentaires et quel est le rapport à la
            compétition. Certains adorent les parties acharnées de Catan ; d'autres préfèrent les
            jeux coopératifs où personne n'est éliminé.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            Les meilleures soirées jeux ressemblent à une conversation qui a le bon goût d'être
            ponctuée d'un score. La liste d'invités compte plus que la collection de jeux.
          </blockquote>
          <p>
            Selon un rapport Statista 2024, le marché mondial des jeux de société devrait atteindre 30 milliards de dollars d&apos;ici 2028.
          </p>
          <p>
            Si vous mélangez des groupes d'amis, assurez-vous qu'au moins deux personnes se
            connaissent déjà. Cela crée un point d'attache chaleureux et aide les invités plus
            réservés à trouver leurs repères.
          </p>
        </section>

        <section className="article-block">
          <h2 >2. Choix des jeux par taille de groupe</h2>
          <p>
            Bien choisir ses jeux, c'est déjà gagner la moitié de la bataille. Vous voulez une
            sélection adaptée à la taille du groupe, au temps disponible et à l'ambiance visée.
            Voici un tableau comparatif pour vous aider :
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold">Type de jeu</th>
                  <th className="text-left py-3 px-4 font-semibold">Joueurs</th>
                  <th className="text-left py-3 px-4 font-semibold">Durée</th>
                  <th className="text-left py-3 px-4 font-semibold">Idéal pour</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Jeux d'ambiance (Codenames, Pictionary)</td>
                  <td className="py-3 px-4">4–8</td>
                  <td className="py-3 px-4">30–60 min</td>
                  <td className="py-3 px-4">Groupes nombreux, ambiance variée</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Jeux de stratégie (Catan, Ticket to Ride)</td>
                  <td className="py-3 px-4">3–5</td>
                  <td className="py-3 px-4">60–120 min</td>
                  <td className="py-3 px-4">Groupes engagés et compétitifs</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Jeux coopératifs (Pandemic, Forbidden Island)</td>
                  <td className="py-3 px-4">2–4</td>
                  <td className="py-3 px-4">45–90 min</td>
                  <td className="py-3 px-4">Équipes, jeu inclusif</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Jeux de cartes (Exploding Kittens, Uno)</td>
                  <td className="py-3 px-4">2–6</td>
                  <td className="py-3 px-4">15–30 min</td>
                  <td className="py-3 px-4">Échauffement, apéro, fin de soirée</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4">Jeux de déduction (Loup-Garou, Secret Hitler)</td>
                  <td className="py-3 px-4">5–10</td>
                  <td className="py-3 px-4">20–45 min</td>
                  <td className="py-3 px-4">Grands groupes, ambiance sociale</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Prévoyez 2 ou 3 jeux par soirée. Commencez par un échauffement court (15–20 minutes),
            enchaînez avec le jeu principal (45–90 minutes) et terminez par quelque chose de léger.
            Cet arc maintient l'énergie et évite le coup de mou du milieu de soirée.
          </p>
        </section>

        <section className="article-block">
          <h2 >3. Préparer le terrain</h2>
          <p>
            Votre espace donne le ton. Un bon agencement rend les jeux plus faciles et les
            conversations plus naturelles. Voici comment vous préparer :
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li>
              <strong>Éclairage.</strong> Assez lumineux pour lire les cartes, assez chaleureux
              pour être cosy. Évitez les reflets sur les plateaux brillants.
            </li>
            <li>
              <strong>Assise.</strong> Assurez-vous que chaque joueur voit bien la surface de jeu.
              Les tables basses fonctionnent pour les cartes ; les tables à manger sont meilleures
              pour les jeux de plateau.
            </li>
            <li>
              <strong>Son.</strong> Une playlist choisie (instrumentale, sans paroles) à volume
              doux remplit le silence sans concurrencer les conversations.
            </li>
            <li>
              <strong>Snacks et boissons.</strong> Servez des aliments qui ne laissent pas de
              traces : bâtonnets de légumes, pop-corn, bretzels, mini-sandwichs. Prévoyez des
              sous-verres et des couvercles.
            </li>
          </ul>
          <p>
            N'oubliez pas une surface dédiée aux snacks, éloignée de la zone de jeu. Une table
            d'appoint ou un îlot de cuisine fait parfaitement l'affaire.
          </p>
        </section>

        <section className="article-block">
          <h2 >4. Animer en professionnel</h2>
          <p>
            Les meilleurs hôtes ne jouent pas — ils facilitent. Ou plutôt, ils jouent tout en
            gardant un œil sur la pièce. Votre mission : veiller à ce que tout le monde se sente
            inclus, comprenne les règles et s'amuse.
          </p>
          <blockquote className="border-l-4 border-neon-pink pl-6 my-6 italic text-slate-200">
            Un bon hôte ne gagne pas toutes les parties. Il fait en sorte que tout le monde ait
            envie de rester pour la suivante.
          </blockquote>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-4">
            <li>
              <strong>Apprenez les règles à l'avance.</strong> Lisez le livret et, si possible,
              faites un tour d'essai. Rien ne tue l'ambiance comme des pages qu'on feuillette en
              pleine partie.
            </li>
            <li>
              <strong>Désignez un explicateur.</strong> Si un invité adore enseigner les jeux,
              laissez-le prendre les rênes. Sinon, faites-le vous-même — soyez concis et proposez
              un tour d'essai.
            </li>
            <li>
              <strong>Lisez la salle.</strong> Si un joueur se fait écraser, proposez une variante
              en équipe ou une option coopérative. Si le groupe s'agite, changez de jeu plus tôt.
            </li>
            <li>
              <strong>Gérez le chrono.</strong> Donnez un avertissement 15 minutes avant le
              dernier jeu pour que chacun termine sans stress.
            </li>
          </ul>
        </section>

        <section className="article-block">
          <h2 >5. Rangement et prochaine session</h2>
          <p>
            Une bonne soirée jeux se termine aussi bien qu'elle commence. Quand vous annoncez la
            dernière partie, laissez quelques minutes à chacun pour finir son tour, prenez une photo
            du score et aidez à ranger. Un rangement collectif signale que la soirée est terminée
            sans gêne.
          </p>
          <blockquote className="border-l-4 border-neon-purple pl-6 my-8 italic text-slate-200 text-lg">
            Le meilleur signe d'une soirée jeux réussie ? Les invités qui demandent "C'est pour
            quand la prochaine ?" avant même d'avoir passé la porte.
          </blockquote>
          <p>
            Après le départ de tout le monde, notez rapidement ce qui a fonctionné et ce qui peut
            être amélioré. Quels jeux ont fait le plus rire ? Le groupe était-il trop grand ou trop
            petit ? Ces notes rendront votre prochaine soirée encore meilleure.
          </p>
          <p>
            Un message dans le groupe — pour remercier les invités et teasing la prochaine date —
            entretient la dynamique. Vos amis attendront la prochaine invitation avec impatience
            avant même la fin de la semaine.
          </p>
        </section>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-lg">
            CB
          </div>
          <div>
            <p className="font-semibold text-white">Captain Bond</p>
            <p className="text-xs text-slate-400">
              Publié le {publishedDate} &middot; 6 min de lecture
            </p>
          </div>
        </div>

        <p>
          Ces suggestions fonctionnent mieux pour des groupes d&apos;adultes en recherche de fun social. Pour les très grands groupes (50+) ou les contextes professionnels, envisagez des plateformes dédiées de team building.
        </p>

        <aside className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-6 rounded-2xl border border-white/10">
          <h3 >Prêt pour la soirée jeux ?</h3>
          <p className="text-slate-200 mb-4">
            Captain Bond vous simplifie la vie : invitez vos amis, partagez vos jeux préférés et
            gardez le fil de l'organisation. Finis les tableurs et les fils de messages sans fin —
            une organisation de soirée qui marche vraiment.
          </p>
          <Link
            href="/fr/soiree"
            className="inline-block bg-white text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Organiser ma soirée
          </Link>
        </aside>
      </article>
    </>
  );
}
