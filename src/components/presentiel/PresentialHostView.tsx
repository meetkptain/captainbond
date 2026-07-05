'use client';

import { useState, useCallback } from 'react';
import { useAudioSynthesis, isPresentialSound } from '@/hooks/useAudioSynthesis';
import { usePresentialRealtime } from '@/hooks/usePresentialRealtime';
import { Paywall } from './Paywall';
import { PresentialImposteurView } from './imposteur';
import { PresentialQuestionView } from './PresentialQuestionView';
import { PresentialEndGameView } from './PresentialEndGameView';
import { QRCodeModal } from './QRCodeModal';
import { SafeWordModal } from '@/components/SafeWordModal';
import { Player } from './TalkingStick';

interface PresentialHostViewProps {
  roomCode: string;
  hostId: string;
  hostToken: string;
  players: Player[];
  modeId: string;
  onExit: () => void;
}

export function PresentialHostView({
  roomCode,
  hostId,
  hostToken,
  players,
  modeId,
  onExit
}: PresentialHostViewProps) {
  // UI state
  const [showQRModal, setShowQRModal] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSafeWord, setShowSafeWord] = useState(false);

  const { play: playSynthesizedSound } = useAudioSynthesis();

  const triggerLocalEmoji = useCallback((emoji: string) => {
    const id = crypto.randomUUID();
    const x = 10 + Math.random() * 80;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  }, []);

  const handleTriggerSound = useCallback((soundType: string) => {
    if (isPresentialSound(soundType)) {
      playSynthesizedSound(soundType, isMuted);
    }
  }, [playSynthesizedSound, isMuted]);

  const handleTriggerJoker = useCallback((targetPlayerName: string) => {
    playSynthesizedSound('joker_bell', isMuted);
    setToastMessage(`🕊️ Joker Solidaire activé par un ange gardien pour ${targetPlayerName} !`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, [playSynthesizedSound, isMuted]);

  const handleInjectDeck = useCallback((senderName: string) => {
    setToastMessage(`🌴 ${senderName} injecte son deck de souvenirs !`);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  const game = usePresentialRealtime({
    roomCode,
    hostId,
    hostToken,
    players,
    modeId,
    onTriggerSound: handleTriggerSound,
    onTriggerEmoji: triggerLocalEmoji,
    onTriggerJoker: handleTriggerJoker,
    onInjectDeck: handleInjectDeck,
    onExit,
  });

  const {
    questions,
    currentQuestionIndex,
    currentPlayerIndex,
    phase,
    loading,
    error,
    imposteurIndex,
    imposteurSetupFinished,
    setupPlayerIndex,
    isHolding,
    setIsHolding,
    checkedVoters,
    toggleCheckedVoter,
    votingCountdown,
    isVotingCountdownActive,
    setVotingCountdown,
    setIsVotingCountdownActive,
    spectatorVotes,
    scores,
    isGameEnded,
    entitlements,
    handleNext,
    handleReveal,
    handleSkip,
    handleExit,
    handlePlayerFinished,
    handleVoteComplete,
    handleImposteurNext,
    restartGame,
    advanceSetup,
    swapQuestion,
  } = game;

  const hasAccess = !!(entitlements?.accessibleModes?.includes('*') || entitlements?.accessibleModes?.includes(modeId));
  const isPremiumMode = modeId === 'DEEP_CONNECTION' || modeId === 'DATE_NIGHT';
  const shouldBlock = isPremiumMode && !hasAccess && currentQuestionIndex >= 3;

  const handleSafeWordSkip = useCallback(() => {
    handleSkip();
    setShowSafeWord(false);
  }, [handleSkip]);

  const handleSafeWordLeave = useCallback(() => {
    setShowSafeWord(false);
    handleExit();
  }, [handleExit]);

  if (shouldBlock) {
    return (
      <Paywall
        roomCode={roomCode}
        hostId={hostId}
        currentRound={currentQuestionIndex}
        freeQuestionsLimit={3}
        onExit={onExit}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-[400px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-400">Préparation de l&apos;ambiance...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-[400px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-200">Une erreur est survenue</h3>
        <p className="text-sm text-slate-400">
          {error || 'Aucune question disponible pour ce mode.'}
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
        >
          Retour
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handlePlayerSkipped = () => {
    setToastMessage(`Joker utilisé par ${players[currentPlayerIndex].name}. Aucun jugement, la parole est libre !`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    handleSkip();
  };

  let screen: 'imposteur' | 'end' | 'question';
  if (modeId === 'IMPOSTEUR' && !imposteurSetupFinished) {
    screen = 'imposteur';
  } else if (phase === 'imposteur_voting' || phase === 'imposteur_reveal') {
    screen = 'imposteur';
  } else if (isGameEnded) {
    screen = 'end';
  } else {
    screen = 'question';
  }

  switch (screen) {
    case 'imposteur':
      return (
        <PresentialImposteurView
          players={players}
          currentQuestion={currentQuestion}
          phase={phase}
          imposteurIndex={imposteurIndex}
          setupPlayerIndex={setupPlayerIndex}
          imposteurSetupFinished={imposteurSetupFinished}
          isHolding={isHolding}
          setIsHolding={setIsHolding}
          votingCountdown={votingCountdown}
          isVotingCountdownActive={isVotingCountdownActive}
          setVotingCountdown={setVotingCountdown}
          setIsVotingCountdownActive={setIsVotingCountdownActive}
          checkedVoters={checkedVoters}
          toggleCheckedVoter={toggleCheckedVoter}
          spectatorVotes={spectatorVotes}
          handleReveal={handleReveal}
          handleImposteurNext={handleImposteurNext}
          advanceSetup={advanceSetup}
        />
      );
    case 'end':
      return (
        <PresentialEndGameView
          roomCode={roomCode}
          players={players}
          modeId={modeId}
          scores={scores}
          onRestart={restartGame}
          onExit={handleExit}
        />
      );
    default:
      return (
        <>
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowSafeWord(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer border border-slate-600/50"
            >
              ⏸ Pause
            </button>
          </div>
          {showSafeWord && (
            <SafeWordModal
              onClose={() => setShowSafeWord(false)}
              onSkip={handleSafeWordSkip}
              onLeave={handleSafeWordLeave}
            />
          )}
          <PresentialQuestionView
            roomCode={roomCode}
            modeId={modeId}
            players={players}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            currentPlayerIndex={currentPlayerIndex}
            phase={phase}
            scores={scores}
            hasAccess={hasAccess}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            floatingEmojis={floatingEmojis}
            toastMessage={toastMessage}
            onShowQRModal={() => setShowQRModal(true)}
            handleNext={handleNext}
            handlePlayerFinished={handlePlayerFinished}
            handlePlayerSkipped={handlePlayerSkipped}
            handleExit={handleExit}
            handleVoteComplete={handleVoteComplete}
            swapQuestion={swapQuestion}
          />
          <QRCodeModal
            roomCode={roomCode}
            open={showQRModal}
            onClose={() => setShowQRModal(false)}
          />
        </>
      );
  }
}
