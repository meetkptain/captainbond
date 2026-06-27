'use client';

import { useEffect, useRef } from 'react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';
import { mostLikelyToManifest } from '@/game-modes/most-likely-to';
import type { Player } from './TalkingStick';
import { useVoteCountdown } from './useVoteCountdown';

interface ActivePlayStageProps {
  players: Player[];
  currentPlayerIndex: number;
  question: string;
  modeId?: string;
  isMuted?: boolean;
  onNext: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  onVoteComplete: (votedPlayerId: string) => void;
}

export function ActivePlayStage({
  players,
  currentPlayerIndex,
  question,
  modeId = '',
  isMuted = false,
  onNext,
  onSkip,
  showSkip = false,
  onVoteComplete,
}: ActivePlayStageProps) {
  const { voteState, countdown, start, reset } = useVoteCountdown();
  const { play: playSynthesizedSound } = useAudioSynthesis();
  const previousVoteStateRef = useRef(voteState);

  useEffect(() => {
    if (voteState === 'reveal' && previousVoteStateRef.current !== 'reveal') {
      playSynthesizedSound('gong', isMuted);
    }
    previousVoteStateRef.current = voteState;
  }, [voteState, isMuted, playSynthesizedSound]);

  useEffect(() => {
    reset();
  }, [currentPlayerIndex, reset]);

  const currentPlayer = players[currentPlayerIndex];
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
  const isVoteMode = modeId === mostLikelyToManifest.id;

  const handleVote = (playerId: string) => {
    onVoteComplete(playerId);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-6 p-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md max-w-md mx-auto shadow-xl w-full animate-[fadeIn_0.25s_ease-out]">
      <div className="text-center flex flex-col gap-2">
        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
          Bâton de parole actif
        </span>
        <h3 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent uppercase animate-[pulse_3s_infinite]">
          {currentPlayer.name}
        </h3>
      </div>

      {/* Styled Physical Stick Simulation Box */}
      <div className="w-full h-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-full shadow-inner relative overflow-hidden my-2">
        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
      </div>

      {voteState === 'idle' && (
        <div className="text-center bg-slate-800/40 border border-slate-700/30 px-5 py-4 rounded-2xl w-full max-w-sm">
          <p className="text-xs text-slate-400 mb-1.5">Question en cours :</p>
          <p className="text-base font-semibold text-slate-200 italic leading-relaxed">
            &quot;{question}&quot;
          </p>
        </div>
      )}

      {voteState === 'countdown' && (
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider animate-pulse">
            Préparez-vous à pointer...
          </span>
          <div className="text-6xl font-black text-amber-400 font-mono animate-[ping_1s_infinite]">
            {countdown}
          </div>
        </div>
      )}

      {voteState === 'reveal' && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-3xl font-black text-amber-400 tracking-wide uppercase animate-bounce">
            👉 POINTEZ !
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs text-slate-400 text-center font-semibold uppercase tracking-wider">
              Qui a reçu le plus de votes ?
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleVote(p.id)}
                  className="py-3 px-2 bg-slate-800/60 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/50 hover:border-amber-400 rounded-xl text-sm font-bold transition-all text-slate-200 cursor-pointer shadow-sm text-center truncate active:scale-[0.97]"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Player Pass Toast (Only if not in voting/countdown reveal) */}
      {voteState === 'idle' && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>Ensuite :</span>
          <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
            {nextPlayer.name}
          </span>
        </div>
      )}

      {/* Action CTA */}
      {voteState === 'idle' && (
        <div className="flex flex-col gap-2.5 w-full">
          {isVoteMode ? (
            <button
              onClick={start}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-base rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-[0.98]"
            >
              <span>🗳️ Lancer le Vote Physique</span>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-100 font-bold text-base rounded-2xl transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-2 group shadow-md"
            >
              <span>J&apos;ai répondu</span>
              <span className="text-slate-400 group-hover:text-amber-400 transition-colors">
                → Passer à {nextPlayer.name}
              </span>
            </button>
          )}

          {showSkip && onSkip && (
            <button
              onClick={onSkip}
              className="w-full py-2.5 bg-slate-900/60 hover:bg-slate-850 active:bg-slate-900 text-slate-400 hover:text-amber-400/90 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-800/60 flex items-center justify-center gap-1.5"
            >
              <span>🃏</span>
              <span>Utiliser un Joker (Passer)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
