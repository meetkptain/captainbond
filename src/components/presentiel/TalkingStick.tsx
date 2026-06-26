'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';

export interface Player {
  id: string;
  name: string;
}

interface TalkingStickProps {
  players: Player[];
  currentPlayerIndex: number;
  onNext: () => void;
  question: string;
  onSkip?: () => void;
  showSkip?: boolean;
  modeId?: string;
  onVoteComplete?: (votedPlayerId: string) => void;
  isMuted?: boolean;
  // New props for Host rotation and Theme selection
  questions?: { text: string; tags?: string[] }[];
  currentQuestionIndex?: number;
  onSelectQuestion?: (selectedIndex: number) => void;
}

function getQuestionTheme(q: { text: string; tags?: string[] }): string {
  const text = q.text.toLowerCase();
  if (text.includes('rupture') || text.includes('rateau') || text.includes('râteau') || text.includes('ex ')) {
    return '💔 Amours & Ruptures';
  }
  if (text.includes('mensonge') || text.includes('menti') || text.includes('bluff') || text.includes('tromp')) {
    return '🤫 Mensonges & Secrets';
  }
  if (text.includes('soirée') || text.includes('fête') || text.includes('alcool') || text.includes('boire') || text.includes('party')) {
    return '🎉 Anecdotes de Soirée';
  }
  if (text.includes('boulot') || text.includes('travail') || text.includes('école') || text.includes('classe') || text.includes('prof') || text.includes('collègue')) {
    return '🎒 École & Travail';
  }
  if (text.includes('honte') || text.includes('pire') || text.includes('gênant') || text.includes('ridicule')) {
    return '😬 Moments Gênants';
  }
  if (q.tags?.includes('positive') || q.tags?.includes('compliment')) {
    return '✨ Compliments & Positif';
  }
  if (q.tags?.includes('date_safe') || text.includes('couple') || text.includes('rencontre') || text.includes('amour')) {
    return '👩‍❤️‍👨 Romance & Couple';
  }
  if (text.length > 80) {
    return '💬 Confidences Profondes';
  }
  return '🎲 Chill & Anecdotes';
}

export function TalkingStick({
  players,
  currentPlayerIndex,
  onNext,
  question,
  onSkip,
  showSkip = false,
  modeId = '',
  onVoteComplete,
  isMuted = false,
  questions,
  currentQuestionIndex,
  onSelectQuestion
}: TalkingStickProps) {
  const [voteState, setVoteState] = useState<'idle' | 'countdown' | 'reveal'>('idle');
  const [countdown, setCountdown] = useState(3);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { play: playSynthesizedSound } = useAudioSynthesis();

  // Stage: 'pass' (holding screen), 'theme' (theme choice for player 0), 'active' (question view)
  const [stage, setStage] = useState<'pass' | 'theme' | 'active'>('pass');

  const [prevPlayerIndex, setPrevPlayerIndex] = useState(currentPlayerIndex);
  if (currentPlayerIndex !== prevPlayerIndex) {
    setPrevPlayerIndex(currentPlayerIndex);
    setVoteState('idle');
    setStage('pass');
  }

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  if (!players || players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayer = players[nextPlayerIndex];

  const startVoteCountdown = () => {
    setVoteState('countdown');
    setCountdown(3);
    
    let currentCount = 3;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        playSynthesizedSound('gong', isMuted);
        setVoteState('reveal');
        setCountdown(0);
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  };

  const isVoteMode = modeId === 'MOST_LIKELY_TO';

  // --- STAGE 1: PASS PHONE ---
  if (stage === 'pass') {
    const isFirstPlayer = currentPlayerIndex === 0;
    const isImposteur = modeId === 'IMPOSTEUR';
    
    return (
      <div className="flex flex-col items-center justify-center text-center gap-6 p-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md max-w-md mx-auto shadow-xl w-full py-10 animate-[fadeIn_0.25s_ease-out]">
        <div className="relative">
          <span className="text-6xl block animate-bounce">👑</span>
          <span className="absolute -top-1 -right-2 text-2xl animate-pulse">📱</span>
        </div>
        
        <div className="space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block font-mono">
            Meneur de Tour {isFirstPlayer ? '• Nouveau Tour' : ''}
          </span>
          <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight">
            Passez le téléphone à
          </h3>
          <div className="text-3xl font-extrabold text-white bg-slate-950 border border-slate-800 px-6 py-3.5 rounded-2xl inline-block mt-3 shadow-inner uppercase tracking-wide">
            {currentPlayer.name}
          </div>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed max-w-xs px-2">
          {isImposteur 
            ? "Attention : ce mode contient des rôles secrets ! Cachez l'écran aux autres."
            : isFirstPlayer 
            ? "Tu es le premier joueur de cette manche : tu vas pouvoir choisir la thématique !"
            : "Prends l'appareil et prépare-toi à répondre."}
        </p>

        <button
          onClick={() => {
            playSynthesizedSound('chime', isMuted);
            const hasChoices = questions && questions.length > (currentQuestionIndex ?? 0) + 1;
            const canChooseTheme = isFirstPlayer && hasChoices && modeId !== 'IMPOSTEUR' && modeId !== 'MOST_LIKELY_TO';
            
            if (canChooseTheme) {
              setStage('theme');
            } else {
              setStage('active');
            }
          }}
          className="mt-4 w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-base rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/15 active:scale-[0.98]"
        >
          👍 J&apos;ai le téléphone en main !
        </button>
      </div>
    );
  }

  // --- STAGE 2: CHOOSE THEME ---
  if (stage === 'theme') {
    const hasChoices = questions && questions.length > (currentQuestionIndex ?? 0) + 1;
    const qA = hasChoices ? questions[currentQuestionIndex!] : null;
    const qB = hasChoices ? questions[currentQuestionIndex! + 1] : null;
    
    const themeA = qA ? getQuestionTheme(qA) : '🎲 Thème A';
    let themeB = qB ? getQuestionTheme(qB) : '🎲 Thème B';
    
    if (themeA === themeB) {
      themeB = themeB + ' (Alternative)';
    }

    return (
      <div className="flex flex-col items-center justify-between gap-6 p-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md max-w-md mx-auto shadow-xl w-full text-center animate-[fadeIn_0.25s_ease-out]">
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono">👑 Choix de Thématique</span>
          <h3 className="text-xl font-black text-white tracking-tight uppercase">
            {currentPlayer.name}, choisis le thème
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed px-2 mt-1">
            Sélectionne l&apos;ambiance de la question qui sera posée à toute la table.
          </p>
        </div>

        <div className="w-full space-y-3 my-4">
          <button
            onClick={() => {
              playSynthesizedSound('chime', isMuted);
              setStage('active');
            }}
            className="w-full py-4 px-5 bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-400 rounded-2xl text-left font-bold transition-all text-slate-200 cursor-pointer shadow-md flex justify-between items-center group active:scale-[0.98]"
          >
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-500 group-hover:text-slate-950 font-bold uppercase font-mono mb-0.5">Option A</span>
              <span className="text-base font-extrabold">{themeA}</span>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
          </button>

          <button
            onClick={() => {
              playSynthesizedSound('chime', isMuted);
              if (onSelectQuestion) {
                onSelectQuestion(currentQuestionIndex! + 1);
              }
              setStage('active');
            }}
            className="w-full py-4 px-5 bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-400 rounded-2xl text-left font-bold transition-all text-slate-200 cursor-pointer shadow-md flex justify-between items-center group active:scale-[0.98]"
          >
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-500 group-hover:text-slate-950 font-bold uppercase font-mono mb-0.5">Option B</span>
              <span className="text-base font-extrabold">{themeB}</span>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 italic">
          Le thème choisi s&apos;appliquera à tous les joueurs de ce tour.
        </div>
      </div>
    );
  }

  // --- STAGE 3: ACTIVE PLAY ---
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
              {players.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (onVoteComplete) {
                      onVoteComplete(p.id);
                    } else {
                      onNext();
                    }
                  }}
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
              onClick={startVoteCountdown}
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
