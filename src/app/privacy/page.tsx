'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const content = {
  fr: {
    backBtn: "← Retour à l'accueil",
    title: "Politique de confidentialité",
    sec1Title: "1. Nature du service",
    sec1Text: "Captain Bond est un jeu de société numérique. Il n'est pas un outil médical, diagnostique ou thérapeutique. Les profils générés à la fin des parties sont des expériences de divertissement basées sur vos réponses en jeu.",
    sec2Title: "2. Données collectées",
    sec2Text: "Nous collectons uniquement les données nécessaires au fonctionnement du jeu :",
    sec2List: [
      "Votre prénom (choisi par vous dans la salle)",
      "Vos réponses aux questions du jeu",
      "Un email généré automatiquement si vous effectuez un achat"
    ],
    sec3Title: "3. Utilisation des données",
    sec3Text: "Vos réponses servent uniquement à :",
    sec3List: [
      "Faire fonctionner le jeu en temps réel",
      "Générer un profil ludique à la fin de la partie",
      "Gérer vos achats (Pass 24h, Dossier Classifié)"
    ],
    sec3Text2: "Nous ne vendons jamais vos données. Nous ne les utilisons pas à des fins de profilage publicitaire.",
    sec4Title: "4. Durée de conservation",
    sec4Text: "Les réponses aux questions sont conservées pendant la durée de la partie, puis anonymisées ou supprimées dans un délai de 90 jours maximum.",
    sec5Title: "5. Vos droits",
    sec5Text: "Vous pouvez à tout moment : passer une question, quitter la partie, ou nous contacter pour demander la suppression de vos données à l'adresse ",
    sec6Title: "6. Paiements",
    sec6Text: "Les paiements sont sécurisés par Stripe. Captain Bond ne stocke jamais vos coordonnées bancaires."
  },
  en: {
    backBtn: "← Back to Home",
    title: "Privacy Policy",
    sec1Title: "1. Nature of the service",
    sec1Text: "Captain Bond is a digital board game. It is not a medical, diagnostic or therapeutic tool. The profiles generated at the end of the games are entertainment experiences based on your in-game answers.",
    sec2Title: "2. Collected Data",
    sec2Text: "We only collect data necessary for the game operation:",
    sec2List: [
      "Your first name (chosen by you in the room)",
      "Your answers to the game questions",
      "An automatically generated email if you make a purchase"
    ],
    sec3Title: "3. Data Usage",
    sec3Text: "Your answers are only used to:",
    sec3List: [
      "Operate the game in real time",
      "Generate a playful profile at the end of the game",
      "Manage your purchases (24h Pass, Classified File)"
    ],
    sec3Text2: "We never sell your data. We do not use it for advertising profiling purposes.",
    sec4Title: "4. Retention Period",
    sec4Text: "Answers to questions are kept for the duration of the game, then anonymized or deleted within a maximum of 90 days.",
    sec5Title: "5. Your Rights",
    sec5Text: "You can at any time: skip a question, leave the game, or contact us to request the deletion of your data at ",
    sec6Title: "6. Payments",
    sec6Text: "Payments are secured by Stripe. Captain Bond never stores your banking details."
  }
};

export default function PrivacyPage({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];
  const homePath = lang === 'fr' ? '/fr' : '/';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href={homePath} className="text-indigo-400 hover:underline text-sm font-mono mb-8 inline-block">
          {t.backBtn}
        </Link>
        
        <h1 className="text-3xl font-black text-white mb-6">{t.title}</h1>
        
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec1Title}</h2>
            <p>{t.sec1Text}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec2Title}</h2>
            <p>{t.sec2Text}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {t.sec2List.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="finalite">
            <h2 className="text-lg font-bold text-white mb-2">{t.sec3Title}</h2>
            <p>{t.sec3Text}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {t.sec3List.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">{t.sec3Text2}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec4Title}</h2>
            <p>{t.sec4Text}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec5Title}</h2>
            <p>
              {t.sec5Text}
              <a href="mailto:privacy@captainbond.com" className="text-indigo-400 hover:underline">
                privacy@captainbond.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t.sec6Title}</h2>
            <p>{t.sec6Text}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
