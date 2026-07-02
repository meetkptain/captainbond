'use client';

interface QRCodeModalProps {
  roomCode: string;
  open: boolean;
  onClose: () => void;
}

export function QRCodeModal({ roomCode, open, onClose }: QRCodeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center relative space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="space-y-1">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-widest font-mono">Rejoindre le salon</span>
          <h3 className="text-xl font-black text-slate-200">Spectateur Interactif</h3>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed">
            Rendez-vous sur votre téléphone sur :
          </p>
          <p className="text-lg font-black text-white tracking-wide">
            captainbond.com
          </p>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Et entrez le code secret :
          </p>
          <p className="text-3xl font-mono font-black text-amber-400 tracking-widest bg-amber-500/10 py-2.5 rounded-xl border border-amber-500/20">
            {roomCode}
          </p>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed">
          Friction zéro : pas besoin de créer de compte ni d&apos;entrer de prénom. Flashez ou tapez pour buzzer la table !
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer border border-slate-700 text-sm"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
