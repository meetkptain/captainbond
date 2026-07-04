'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface ConsentModalProps {
  playerName?: string;
  onAccept: () => void;
  onDecline?: () => void;
  defaultLang?: 'fr' | 'en';
}

const content = {
  fr: {
    welcome: "Bienvenue",
    beforeStart: "Avant de commencer",
    paragraph1: "Captain Bond est un jeu de société. Il est conçu pour créer du lien et de la conversation entre amis ou en couple.",
    paragraph2: "À la fin de la partie, nous générons un profil ludique basé sur vos réponses. Ce profil est une expérience de divertissement, pas un diagnostic médical, psychologique ou relationnel.",
    paragraph3: "Vos réponses sont stockées temporairement pour le déroulement du jeu. Vous pouvez passer votre tour à tout moment si une question vous met mal à l'aise.",
    checkboxText: "J'ai compris que Captain Bond est un jeu de divertissement et j'accepte le calcul de mon profil ludique.",
    submitBtn: "Entrer dans la salle",
    declineBtn: "Jouer sans profil",
    footerPrefix: "En continuant, vous acceptez notre ",
    footerLink: "Politique de confidentialité",
  },
  en: {
    welcome: "Welcome",
    beforeStart: "Before you start",
    paragraph1: "Captain Bond is a board game. It is designed to create connections and conversation among friends or couples.",
    paragraph2: "At the end of the game, we generate a playful profile based on your answers. This profile is an entertainment experience, not a medical, psychological or relationship diagnosis.",
    paragraph3: "Your answers are stored temporarily for the game process. You can skip your turn at any time if a question makes you uncomfortable.",
    checkboxText: "I understand that Captain Bond is an entertainment game and I accept the calculation of my playful profile.",
    submitBtn: "Enter the Room",
    declineBtn: "Play without profile",
    footerPrefix: "By continuing, you accept our ",
    footerLink: "Privacy Policy",
  }
};

export function ConsentModal({ playerName, onAccept, onDecline, defaultLang = 'en' }: ConsentModalProps) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = content[lang];
  const privacyPath = lang === 'fr' ? '/fr/privacy#finalite' : '/privacy#finalite';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-8 text-center">
        <div className="flex justify-center mb-4">
          <Icon name="lock" className="w-12 h-12 text-white/80" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">
          {playerName ? `${t.welcome}, ${playerName}` : t.beforeStart}
        </h2>

        <div className="text-left space-y-4 text-slate-300 text-sm mb-8">
          <p>
            <strong className="text-white">{lang === 'fr' ? 'Captain Bond est un jeu de société.' : 'Captain Bond is a board game.'}</strong> {t.paragraph1.replace(/Captain Bond est un jeu de société.\s*/i, '')}
          </p>
          <p>
            {lang === 'fr' ? (
              <>À la fin de la partie, nous générons un <strong className="text-white">profil ludique</strong> basé sur vos réponses. Ce profil est une expérience de divertissement, <strong className="text-white">pas un diagnostic médical, psychologique ou relationnel</strong>.</>
            ) : (
              <>At the end of the game, we generate a <strong className="text-white">playful profile</strong> based on your answers. This profile is an entertainment experience, <strong className="text-white">not a medical, psychological or relationship diagnosis</strong>.</>
            )}
          </p>
          <p>
            {lang === 'fr' ? (
              <>Vos réponses sont stockées temporairement pour le déroulement du jeu. Vous pouvez <strong className="text-white">passer votre tour</strong> à tout moment si une question vous met mal à l&apos;aise.</>
            ) : (
              <>Your answers are stored temporarily for the game process. You can <strong className="text-white">skip your turn</strong> at any time if a question makes you uncomfortable.</>
            )}
          </p>
        </div>

        <label className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 accent-neon-purple"
          />
          <span className="text-slate-300 text-sm text-left">
            {t.checkboxText}
          </span>
        </label>

        <button
          onClick={onAccept}
          disabled={!accepted}
          className="cb-btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-center text-slate-950 font-bold"
        >
          {t.submitBtn}
        </button>

        {onDecline && (
          <button
            onClick={onDecline}
            className="mt-3 text-slate-500 text-sm hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer"
          >
            {t.declineBtn}
          </button>
        )}

        <p className="text-slate-600 text-xs mt-4">
          {t.footerPrefix}
          <a href={privacyPath} target="_blank" className="text-neon-purple hover:underline">
            {t.footerLink}
          </a>.
        </p>
      </div>
    </div>
  );
}
