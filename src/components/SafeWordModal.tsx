'use client';

import { Icon } from '@/components/Icon';

interface SafeWordModalProps {
  onClose: () => void;
  onSkip: () => void;
  onLeave: () => void;
}

export function SafeWordModal({ onClose, onSkip, onLeave }: SafeWordModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass-panel p-8 text-center">
        <div className="flex justify-center mb-4">
          <Icon name="alert" className="w-14 h-14 text-white/80" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Vous avez le contrôle</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          Si une question vous met mal à l&apos;aise, vous pouvez passer votre tour ou quitter la partie à tout moment. 
          Captain Bond est un jeu — pas une obligation.
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={onSkip} className="cb-btn-secondary w-full py-4">
            Passer mon tour
          </button>
          <button onClick={onLeave} className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors">
            Quitter la partie
          </button>
          <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-300 transition-colors mt-2">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
