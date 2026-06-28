'use client';

import type { Player } from './TalkingStick';
import { useTranslation } from '@/lib/i18n';

interface PassPhoneStageProps {
  currentPlayer: Player;
  isFirstPlayer: boolean;
  isImposteur: boolean;
  onReady: () => void;
}

export function PassPhoneStage(props: PassPhoneStageProps) {
  const { currentPlayer, isFirstPlayer, isImposteur, onReady } = props;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 p-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md max-w-md mx-auto shadow-xl w-full py-10 animate-[fadeIn_0.25s_ease-out]">
      <div className="relative">
        <span className="text-6xl block animate-bounce">👑</span>
        <span className="absolute -top-1 -right-2 text-2xl animate-pulse">📱</span>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block font-mono">
          {t('pass_title')} {isFirstPlayer ? t('pass_new_round') : ''}
        </span>
        <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight">
          {t('pass_instruction')}
        </h3>
        <div className="text-3xl font-extrabold text-white bg-slate-950 border border-slate-800 px-6 py-3.5 rounded-2xl inline-block mt-3 shadow-inner uppercase tracking-wide">
          {currentPlayer.name}
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed max-w-xs px-2">
        {isImposteur
          ? t('pass_secret_warning')
          : isFirstPlayer
            ? t('pass_theme_selection')
            : t('pass_ready_desc')}
      </p>

      <button
        onClick={onReady}
        className="mt-4 w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/15 active:scale-[0.98] border-none"
      >
        {t('pass_ready_btn')}
      </button>
    </div>
  );
}
