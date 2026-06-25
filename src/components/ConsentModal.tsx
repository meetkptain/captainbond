'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/Icon';

interface ConsentModalProps {
  playerName?: string;
  onAccept: () => void;
  onDecline?: () => void;
}

export function ConsentModal({ playerName, onAccept, onDecline }: ConsentModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-8 text-center">
        <div className="flex justify-center mb-4">
          <Icon name="lock" className="w-12 h-12 text-white/80" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">
          {playerName ? `Bienvenue, ${playerName}` : 'Avant de commencer'}
        </h2>

        <div className="text-left space-y-4 text-slate-300 text-sm mb-8">
          <p>
            <strong className="text-white">Captain Bond est un jeu de société.</strong> Il est conçu pour créer du lien et de la conversation entre amis ou en couple.
          </p>
          <p>
            À la fin de la partie, nous générons un <strong className="text-white">profil ludique</strong> basé sur vos réponses. Ce profil est une expérience de divertissement, <strong className="text-white">pas un diagnostic médical, psychologique ou relationnel</strong>.
          </p>
          <p>
            Vos réponses sont stockées temporairement pour le déroulement du jeu. Vous pouvez <strong className="text-white">passer votre tour</strong> à tout moment si une question vous met mal à l&apos;aise.
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
            J&apos;ai compris que Captain Bond est un jeu de divertissement et j&apos;accepte le calcul de mon profil ludique.
          </span>
        </label>

        <button
          onClick={onAccept}
          disabled={!accepted}
          className="cb-btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Entrer dans la salle
        </button>

        {onDecline && (
          <button
            onClick={onDecline}
            className="mt-3 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            Jouer sans profil
          </button>
        )}

        <p className="text-slate-600 text-xs mt-4">
          En continuant, vous acceptez notre{' '}
          <a href="/privacy#finalite" target="_blank" className="text-neon-purple hover:underline">
            Politique de confidentialité
          </a>.
        </p>
      </div>
    </div>
  );
}
