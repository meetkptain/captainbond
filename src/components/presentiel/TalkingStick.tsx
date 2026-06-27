'use client';

import { useEffect, useState } from 'react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';
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
  onVoteComplete?: (votedPlayerId: string) => void;
  isMuted?: boolean;
  // New props for Host rotation and Theme selection
  questions?: { text: string; tags?: string[] }[];
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
  onVoteComplete,
  isMuted = false,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
}: TalkingStickProps) {
  const [stage, setStage] = useState<'pass' | 'theme' | 'active'>('pass');
  const [prevPlayerIndex, setPrevPlayerIndex] = useState(currentPlayerIndex);
  const { play: playSynthesizedSound } = useAudioSynthesis();

  useEffect(() => {
    if (currentPlayerIndex !== prevPlayerIndex) {
      requestAnimationFrame(() => {
        setPrevPlayerIndex(currentPlayerIndex);
        setStage('pass');
      });
    }
  }, [currentPlayerIndex, prevPlayerIndex]);

  if (!players || players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
  const isFirstPlayer = currentPlayerIndex === 0;
  const isImposteur = modeId === 'IMPOSTEUR';
  const isVoteMode = modeId === 'MOST_LIKELY_TO';
  const hasChoices = questions && questions.length > (currentQuestionIndex ?? 0) + 1;
  const canChooseTheme = isFirstPlayer && hasChoices && !isImposteur && !isVoteMode;

  const handleReady = () => {
    playSynthesizedSound('chime', isMuted);
    if (canChooseTheme) {
      setStage('theme');
    } else {
      setStage('active');
    }
  };

  const handleProceed = () => {
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
          nextPlayer={nextPlayer}
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
          onProceed={handleProceed}
          onSelectQuestion={handleSelectQuestion}
        />
      )}
      {stage === 'active' && (
        <ActivePlayStage
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          question={question}
          modeId={modeId}
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
