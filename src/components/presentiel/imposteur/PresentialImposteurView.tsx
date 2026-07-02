'use client';

import { Player } from '../TalkingStick';
import { DeckQuestion } from '@/lib/presentiel/deck';
import { PresentialPhase } from '@/hooks/usePresentialRealtime';
import { ImposteurSetupView } from './ImposteurSetupView';
import { ImposteurVotingView } from './ImposteurVotingView';
import { ImposteurRevealView } from './ImposteurRevealView';

interface PresentialImposteurViewProps {
  players: Player[];
  currentQuestion: DeckQuestion;
  phase: PresentialPhase;
  imposteurIndex: number | null;
  setupPlayerIndex: number;
  imposteurSetupFinished: boolean;
  isHolding: boolean;
  setIsHolding: (value: boolean) => void;
  votingCountdown: number;
  isVotingCountdownActive: boolean;
  setVotingCountdown: (value: number) => void;
  setIsVotingCountdownActive: (value: boolean) => void;
  checkedVoters: Record<string, boolean>;
  toggleCheckedVoter: (playerId: string, checked: boolean) => void;
  spectatorVotes: Record<string, number>;
  handleReveal: () => Promise<void>;
  handleImposteurNext: () => void;
  advanceSetup: () => void;
}

export function PresentialImposteurView({
  players,
  currentQuestion,
  phase,
  imposteurIndex,
  setupPlayerIndex,
  imposteurSetupFinished,
  isHolding,
  setIsHolding,
  votingCountdown,
  isVotingCountdownActive,
  setVotingCountdown,
  setIsVotingCountdownActive,
  checkedVoters,
  toggleCheckedVoter,
  spectatorVotes,
  handleReveal,
  handleImposteurNext,
  advanceSetup,
}: PresentialImposteurViewProps) {
  if (!imposteurSetupFinished) {
    return (
      <ImposteurSetupView
        players={players}
        currentQuestion={currentQuestion}
        imposteurIndex={imposteurIndex}
        setupPlayerIndex={setupPlayerIndex}
        isHolding={isHolding}
        setIsHolding={setIsHolding}
        advanceSetup={advanceSetup}
      />
    );
  }

  if (phase === 'imposteur_voting') {
    return (
      <ImposteurVotingView
        votingCountdown={votingCountdown}
        isVotingCountdownActive={isVotingCountdownActive}
        setVotingCountdown={setVotingCountdown}
        setIsVotingCountdownActive={setIsVotingCountdownActive}
        handleReveal={handleReveal}
      />
    );
  }

  if (phase === 'imposteur_reveal') {
    return (
      <ImposteurRevealView
        players={players}
        currentQuestion={currentQuestion}
        imposteurIndex={imposteurIndex}
        checkedVoters={checkedVoters}
        toggleCheckedVoter={toggleCheckedVoter}
        spectatorVotes={spectatorVotes}
        handleImposteurNext={handleImposteurNext}
      />
    );
  }

  return null;
}
