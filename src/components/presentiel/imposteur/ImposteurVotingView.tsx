'use client';

import { ImposteurScreen } from './ImposteurScreen';

interface ImposteurVotingViewProps {
  votingCountdown: number;
  isVotingCountdownActive: boolean;
  setVotingCountdown: (value: number) => void;
  setIsVotingCountdownActive: (value: boolean) => void;
  handleReveal: () => Promise<void>;
}

export function ImposteurVotingView({
  votingCountdown,
  isVotingCountdownActive,
  setVotingCountdown,
  setIsVotingCountdownActive,
  handleReveal,
}: ImposteurVotingViewProps) {
  return (
    <ImposteurScreen stripeColor="#3b82f6">
      <div className="flex flex-col gap-4 mt-6 z-10 w-full">
        <span className="text-xs text-blue-400 font-bold uppercase tracking-widest font-mono">Désignation physique</span>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Le Vote du Tribunal</h2>
        <div className="h-px bg-slate-800 w-24 mx-auto my-2"></div>
        <p className="text-slate-400 text-xs leading-relaxed px-4">
          Préparez-vous à désigner l&apos;Imposteur du doigt. Au gong, tout le monde pointe son suspect en même temps !
        </p>
      </div>

      <div className="my-8 flex flex-col items-center justify-center z-10">
        {votingCountdown > 0 ? (
          <div className="text-8xl font-black text-blue-400 animate-ping">
            {votingCountdown}
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center animate-bounce">
            <span className="text-7xl">👇</span>
            <span className="text-4xl font-black text-emerald-400 uppercase tracking-widest animate-pulse">POINTEZ !</span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3 z-10">
        {votingCountdown > 0 && !isVotingCountdownActive && (
          <button
            onClick={() => {
              setVotingCountdown(3);
              setIsVotingCountdownActive(true);
            }}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-2xl transition-all cursor-pointer shadow-lg"
          >
            Lancer le compte à rebours
          </button>
        )}

        {votingCountdown === 0 && (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-slate-950 font-extrabold text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            Révéler l&apos;Imposteur
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </ImposteurScreen>
  );
}
