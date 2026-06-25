'use client';

import React from 'react';

interface EndGameConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function EndGameConfirmationModal({ onConfirm, onCancel }: EndGameConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-950 border border-white/10 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-black text-white mb-2">Terminer la soirée ?</h2>
        <p className="text-slate-400 text-sm mb-6">
          Vous allez révéler les profils et clore la partie. Cette action est définitive pour cette salle.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
          >
            Terminer la soirée
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-colors border border-white/10"
          >
            Continuer à jouer
          </button>
        </div>
      </div>
    </div>
  );
}
