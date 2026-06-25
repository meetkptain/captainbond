import Link from 'next/link';

export const metadata = {
  title: 'Politique de confidentialité | Captain Bond',
  description: 'Comment Captain Bond traite vos données.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-neon-purple hover:underline text-sm font-mono mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        
        <h1 className="text-3xl font-black text-white mb-6">Politique de confidentialité</h1>
        
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Nature du service</h2>
            <p>
              Captain Bond est un <strong>jeu de société numérique</strong>. Il n&apos;est pas un outil médical, diagnostique ou thérapeutique. Les profils générés à la fin des parties sont des expériences de divertissement basées sur vos réponses en jeu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Données collectées</h2>
            <p>
              Nous collectons uniquement les données nécessaires au fonctionnement du jeu :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Votre prénom (choisi par vous dans la salle)</li>
              <li>Vos réponses aux questions du jeu</li>
              <li>Un email généré automatiquement si vous effectuez un achat</li>
            </ul>
          </section>

          <section id="finalite">
            <h2 className="text-lg font-bold text-white mb-2">3. Utilisation des données</h2>
            <p>
              Vos réponses servent uniquement à :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Faire fonctionner le jeu en temps réel</li>
              <li>Générer un profil ludique à la fin de la partie</li>
              <li>Gérer vos achats (Pass 24h, Dossier Classifié)</li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais vos données. Nous ne les utilisons pas à des fins de profilage publicitaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Durée de conservation</h2>
            <p>
              Les réponses aux questions sont conservées pendant la durée de la partie, puis anonymisées ou supprimées dans un délai de 90 jours maximum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Vos droits</h2>
            <p>
              Vous pouvez à tout moment : passer une question, quitter la partie, ou nous contacter pour demander la suppression de vos données à l&apos;adresse <a href="mailto:privacy@captainbond.com" className="text-neon-purple hover:underline">privacy@captainbond.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Paiements</h2>
            <p>
              Les paiements sont sécurisés par Stripe. Captain Bond ne stocke jamais vos coordonnées bancaires.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
