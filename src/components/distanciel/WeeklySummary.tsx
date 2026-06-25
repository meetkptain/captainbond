'use client';

interface WeeklySummaryProps {
  onClose: () => void;
  partnerName: string;
  resonanceScore?: number;
  streakDays?: number;
  peakResonanceQuestion?: string;
  peakResonanceScore?: number;
  aiAnalysisText?: string;
}

export function WeeklySummary({
  onClose,
  partnerName,
  resonanceScore = 86,
  streakDays = 12,
  peakResonanceQuestion = "Comment définirais-tu notre complicité en 3 mots ?",
  peakResonanceScore = 96,
  aiAnalysisText = `Cette semaine, votre couple a fait preuve d'une profonde connexion émotionnelle, notamment en explorant des thématiques d'intimité et d'enfance. Vos réponses partagent des valeurs communes de sécurité et d'écoute bienveillante, avec une résonance sémantique particulièrement élevée sur les questions vulnérables. Continuez à nourrir cette belle complicité !`,
}: WeeklySummaryProps) {
  
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-lg p-8 bg-slate-900/90 backdrop-blur-lg rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] text-slate-100 flex flex-col gap-6 relative print:border-none print:shadow-none print:bg-white print:text-slate-950">
        
        {/* Close Button (hidden in print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-pointer transition-all print:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-3xl print:text-5xl">🏆</span>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent print:text-slate-950 print:bg-none print:text-3xl">
            RÉSUMÉ HEBDOMADAIRE
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase font-mono print:text-slate-500">
            Votre connexion avec {partnerName}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center print:border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Résonance Moyenne
            </span>
            <span className="text-3xl font-black text-amber-400 font-mono print:text-slate-900">
              {resonanceScore}%
            </span>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center print:border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Série Active
            </span>
            <span className="text-3xl font-black text-amber-400 font-mono print:text-slate-900">
              🔥 {streakDays} j
            </span>
          </div>
        </div>

        {/* Peak Resonance Node */}
        <div className="p-5 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border border-amber-500/10 rounded-2xl space-y-2 print:border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌟</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Nœud d&apos;Or de la Semaine ({peakResonanceScore}%)
            </span>
          </div>
          <p className="text-sm font-medium text-slate-250 italic leading-relaxed print:text-slate-800">
            &quot;{peakResonanceQuestion}&quot;
          </p>
        </div>

        {/* AI Analysis */}
        <div className="space-y-2">
          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Analyse du DJ IA
          </h4>
          <p className="text-sm text-slate-350 leading-relaxed font-sans print:text-slate-700">
            {aiAnalysisText}
          </p>
        </div>

        {/* Actions (hidden in print) */}
        <div className="flex gap-4 mt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-750 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Sauvegarder en PDF
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm rounded-2xl cursor-pointer transition-all shadow-md shadow-amber-500/10 flex items-center justify-center"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
