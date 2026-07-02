'use client';

import { Player } from './TalkingStick';
import { EndGameSummary } from './EndGameSummary';

interface PresentialEndGameViewProps {
  roomCode: string;
  players: Player[];
  modeId: string;
  scores: Record<string, number>;
  onRestart: () => void;
  onExit: () => void;
}

export function PresentialEndGameView({
  roomCode,
  players,
  modeId,
  scores,
  onRestart,
  onExit,
}: PresentialEndGameViewProps) {
  return (
    <EndGameSummary
      roomCode={roomCode}
      players={players}
      modeId={modeId}
      scores={scores}
      onRestart={onRestart}
      onExit={onExit}
    />
  );
}
