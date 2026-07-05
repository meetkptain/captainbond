'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';
import { imposteurManifest } from '@/game-modes/imposteur';
import { mostLikelyToManifest } from '@/game-modes/most-likely-to';
import type { ThemedQuestion } from '@/lib/presentiel/theme';
import { ActivePlayStage } from './ActivePlayStage';
import { PassPhoneStage } from './PassPhoneStage';
import { ThemeChoiceStage } from './ThemeChoiceStage';

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
  roomCode?: string;
  onVoteComplete?: (votedPlayerId: string) => void;
  isMuted?: boolean;
  // New props for Host rotation and Theme selection
  questions?: ThemedQuestion[];
  currentQuestionIndex?: number;
  onSelectQuestion?: (selectedIndex: number) => void;
}

export function TalkingStick({
  players,
  currentPlayerIndex,
  onNext,
  question,
  onSkip,
  showSkip = false,
  modeId = '',
  roomCode = '',
  onVoteComplete,
  isMuted = false,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
}: TalkingStickProps) {
  const [stage, setStage] = useState<'pass' | 'theme' | 'active'>('pass');
  const prevPlayerIndexRef = useRef(currentPlayerIndex);
  const { play: playSynthesizedSound } = useAudioSynthesis();

  useEffect(() => {
    if (currentPlayerIndex !== prevPlayerIndexRef.current) {
      prevPlayerIndexRef.current = currentPlayerIndex;
      setStage('pass');
    }
  }, [currentPlayerIndex]);

  if (!players || players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const isFirstPlayer = currentPlayerIndex === 0;
  const isImposteur = modeId === imposteurManifest.id;
  const isVoteMode = modeId === mostLikelyToManifest.id;
  const hasChoices = questions && questions.length > (currentQuestionIndex ?? 0) + 1;
  const canChooseTheme = isFirstPlayer && hasChoices && !!onSelectQuestion && !isImposteur && !isVoteMode;

  const handleReady = () => {
    playSynthesizedSound('chime', isMuted);
    if (canChooseTheme) {
      setStage('theme');
    } else {
      setStage('active');
    }
  };

  const handleKeepCurrentQuestion = () => {
    playSynthesizedSound('chime', isMuted);
    setStage('active');
  };

  const handleSelectQuestion = (selectedIndex: number) => {
    playSynthesizedSound('chime', isMuted);
    if (onSelectQuestion) {
      onSelectQuestion(selectedIndex);
    }
    setStage('active');
  };

  return (
    <>
      {stage === 'pass' && (
        <PassPhoneStage
          currentPlayer={currentPlayer}
          isFirstPlayer={isFirstPlayer}
          isImposteur={isImposteur}
          onReady={handleReady}
        />
      )}
      {stage === 'theme' && (
        <ThemeChoiceStage
          currentPlayer={currentPlayer}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          onKeepCurrentQuestion={handleKeepCurrentQuestion}
          onSelectQuestion={handleSelectQuestion}
        />
      )}
      {stage === 'active' && (
        <ActivePlayStage
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          question={question}
          modeId={modeId}
          roomCode={roomCode}
          isMuted={isMuted}
          onNext={onNext}
          onSkip={onSkip}
          showSkip={showSkip}
          onVoteComplete={onVoteComplete}
        />
      )}
    </>
  );
}
