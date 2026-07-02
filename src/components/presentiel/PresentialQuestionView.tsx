'use client';

import { Player } from './TalkingStick';
import { DeckQuestion } from '@/lib/presentiel/deck';
import { PresentialPhase } from '@/hooks/usePresentialRealtime';
import { HourglassTimer } from './HourglassTimer';
import { TalkingStick } from './TalkingStick';
import { DiscussionPhase } from './DiscussionPhase';

interface PresentialQuestionViewProps {
  roomCode: string;
  modeId: string;
  players: Player[];
  questions: DeckQuestion[];
  currentQuestionIndex: number;
  currentPlayerIndex: number;
  phase: PresentialPhase;
  scores: Record<string, number>;
  hasAccess: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  floatingEmojis: Array<{ id: string; emoji: string; x: number }>;
  toastMessage: string | null;
  onShowQRModal: () => void;
  handleNext: () => Promise<void>;
  handlePlayerFinished: () => void;
  handlePlayerSkipped: () => void;
  handleExit: () => void;
  handleVoteComplete: (votedPlayerId: string) => void;
  swapQuestion: (selectedIndex: number) => void;
}

export function PresentialQuestionView({
  roomCode,
  modeId,
  players,
  questions,
  currentQuestionIndex,
  currentPlayerIndex,
  phase,
  scores,
  hasAccess,
  isMuted,
  onToggleMute,
  floatingEmojis,
  toastMessage,
  onShowQRModal,
  handleNext,
  handlePlayerFinished,
  handlePlayerSkipped,
  handleExit,
  handleVoteComplete,
  swapQuestion,
}: PresentialQuestionViewProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const isPremiumMode = modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT';

  let duration = 60;
  if (modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT') {
    duration = 180;
  } else if (modeId === 'SPICY') {
    duration = 90;
  }

  if (phase === 'discussion') {
    return (
      <DiscussionPhase
        onResume={handleNext}
        topic={modeId === 'IMPOSTEUR' ? "Débattez pour trouver qui est l'imposteur ce soir !" : undefined}
        scores={scores}
        players={players}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative">
      <style>{`
        .floating-emoji {
          position: absolute;
          bottom: 0;
          font-size: 2.5rem;
          pointer-events: none;
          z-index: 50;
          animation: floatUp 2s ease-out forwards;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { opacity: 1; transform: translateY(-30px) scale(1.3); }
          100% { transform: translateY(-350px) scale(0.9); opacity: 0; }
        }
      `}</style>

      {floatingEmojis.map(item => (
        <span
          key={item.id}
          className="floating-emoji"
          style={{ left: `${item.x}%` }}
        >
          {item.emoji}
        </span>
      ))}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-amber-500/95 backdrop-blur-md text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-400 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-xl">🕊️</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center w-full px-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
            Mode : {modeId.replace('_', ' ')}
          </span>
          <button
            onClick={onShowQRModal}
            className="px-2.5 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.05)]"
          >
            <span>📱 captainbond.com</span>
            <span className="font-mono bg-amber-500/10 px-1 rounded text-[10px] tracking-wider font-extrabold">{roomCode}</span>
          </button>
        </div>
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
            </svg>
          )}
        </button>
      </div>

      <HourglassTimer
        duration={duration}
        mode="automatic"
        onComplete={handlePlayerFinished}
        isMuted={isMuted}
      />

      {isPremiumMode && !hasAccess && currentQuestionIndex === 1 && (
        <div className="w-full bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-center text-amber-300 font-medium text-xs animate-pulse z-10 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          🎴 Encore 1 carte gratuite. Débloquez tous les modes et profils sur vos téléphones !
        </div>
      )}

      <TalkingStick
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        onNext={handlePlayerFinished}
        question={
          modeId === 'IMPOSTEUR'
            ? "Chacun répond à sa question secrète à tour de rôle."
            : currentQuestion.text
        }
        onSkip={handlePlayerSkipped}
        showSkip={modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT' || modeId === 'SPICY'}
        modeId={modeId}
        onVoteComplete={handleVoteComplete}
        isMuted={isMuted}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onSelectQuestion={swapQuestion}
      />

      {!hasAccess && (
        <div className="w-full text-center space-y-1.5 my-2">
          <p className="text-xs text-slate-400 font-medium">
            Carte gratuite {Math.min(currentQuestionIndex + 1, 3)}/3
          </p>
          <div className="w-28 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${(Math.min(currentQuestionIndex + 1, 3) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleExit}
        className="text-xs text-slate-500 hover:text-slate-400 font-semibold text-center cursor-pointer hover:underline mt-1"
      >
        Quitter la partie
      </button>
    </div>
  );
}
