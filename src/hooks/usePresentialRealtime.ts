'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { DeckQuestion } from '@/lib/presentiel/deck';
import { Player } from '@/components/presentiel/TalkingStick';
import { usePresentialDeck } from './usePresentialDeck';
import { usePresentialBroadcast } from './usePresentialBroadcast';

export interface UsePresentialRealtimeInput {
  roomCode: string;
  hostId: string;
  hostToken: string;
  players: Player[];
  modeId: string;
  onTriggerSound?: (soundType: string) => void;
  onTriggerEmoji?: (emoji: string) => void;
  onTriggerJoker?: (targetPlayerName: string) => void;
  onInjectDeck?: (senderName: string, questions: DeckQuestion[]) => void;
  onExit?: () => void;
}

export type PresentialPhase = 'question' | 'imposteur_voting' | 'imposteur_reveal' | 'discussion';

export interface UsePresentialRealtimeOutput {
  questions: DeckQuestion[];
  currentQuestionIndex: number;
  currentPlayerIndex: number;
  phase: PresentialPhase;
  loading: boolean;
  error: string | null;
  imposteurIndex: number | null;
  imposteurSetupFinished: boolean;
  setupPlayerIndex: number;
  isHolding: boolean;
  setIsHolding: (value: boolean) => void;
  checkedVoters: Record<string, boolean>;
  toggleCheckedVoter: (playerId: string, checked: boolean) => void;
  votingCountdown: number;
  isVotingCountdownActive: boolean;
  setVotingCountdown: (value: number) => void;
  setIsVotingCountdownActive: (value: boolean) => void;
  spectatorVotes: Record<string, number>;
  scores: Record<string, number>;
  isGameEnded: boolean;
  entitlements: { accessibleModes?: string[] } | null;
  handleNext: () => Promise<void>;
  handleReveal: () => Promise<void>;
  handleSkip: () => void;
  handleExit: () => void;
  handlePlayerFinished: () => void;
  handleVoteComplete: (votedPlayerId: string) => void;
  handleImposteurNext: () => void;
  restartGame: () => void;
  advanceSetup: () => void;
  swapQuestion: (selectedIndex: number) => void;
}

export function usePresentialRealtime(input: UsePresentialRealtimeInput): UsePresentialRealtimeOutput {
  const { roomCode, hostId, hostToken, players, modeId, onTriggerSound, onTriggerEmoji, onTriggerJoker, onInjectDeck, onExit } = input;

  const { questions, setQuestions, loading, error, entitlements } = usePresentialDeck({
    roomCode,
    hostId,
    hostToken,
    players,
    modeId,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<PresentialPhase>('question');

  // Imposteur state
  const [imposteurIndex, setImposteurIndex] = useState<number | null>(null);
  const [setupState, setSetupState] = useState({ index: 0, finished: false });
  const [isHolding, setIsHolding] = useState(false);
  const [checkedVoters, setCheckedVoters] = useState<Record<string, boolean>>({});
  const [votingCountdown, setVotingCountdown] = useState(3);
  const [isVotingCountdownActive, setIsVotingCountdownActive] = useState(false);

  // Spectator state
  const [spectatorVotes, setSpectatorVotes] = useState<Record<string, number>>({});

  // Scores & game state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isGameEnded, setIsGameEnded] = useState(false);

  // Handle Imposteur selection on new question
  useEffect(() => {
    if (modeId === 'IMPOSTEUR' && players.length > 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      requestAnimationFrame(() => {
        setImposteurIndex(randomIndex);
        setSetupState({ index: 0, finished: false });
        setIsHolding(false);
      });
    }
  }, [currentQuestionIndex, modeId, players]);

  const handlePlayerFinished = useCallback(() => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      if (modeId === 'IMPOSTEUR') {
        setPhase('imposteur_voting');
        setVotingCountdown(3);
        setIsVotingCountdownActive(true);
        setCheckedVoters({});
      } else {
        setPhase('discussion');
      }
      capture(AnalyticsEvents.QUESTION_ANSWERED, {
        roomCode,
        modeId,
        questionIndex: currentQuestionIndex,
      });
    }
  }, [currentPlayerIndex, players, modeId, currentQuestionIndex, roomCode]);

  const handleSkip = useCallback(() => {
    handlePlayerFinished();
  }, [handlePlayerFinished]);

  const handleVoteComplete = useCallback((votedPlayerId: string) => {
    setScores((prev) => ({
      ...prev,
      [votedPlayerId]: (prev[votedPlayerId] || 0) + 1
    }));
    handlePlayerFinished();
  }, [handlePlayerFinished]);

  const handleNextQuestion = useCallback(() => {
    setPhase('question');
    setCurrentPlayerIndex(0);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsGameEnded(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleNext = useCallback(async () => {
    handleNextQuestion();
  }, [handleNextQuestion]);

  const handleReveal = useCallback(async () => {
    setPhase('imposteur_reveal');
  }, []);

  const handleImposteurNext = useCallback(() => {
    const imposteurPlayer = players[imposteurIndex!];
    const newPoints: Record<string, number> = {};

    const correctVoterIds = Object.entries(checkedVoters)
      .filter(([, guessedCorrectly]) => guessedCorrectly)
      .map(([voterId]) => voterId);

    players.forEach(p => {
      if (p.id !== imposteurPlayer.id && correctVoterIds.includes(p.id)) {
        newPoints[p.id] = 1;
      }
    });

    if (correctVoterIds.length === 0) {
      newPoints[imposteurPlayer.id] = 2;
    }

    setScores((prev) => {
      const updated = { ...prev };
      Object.entries(newPoints).forEach(([pid, pts]) => {
        updated[pid] = (updated[pid] || 0) + pts;
      });
      return updated;
    });

    handleNextQuestion();
  }, [checkedVoters, imposteurIndex, players, handleNextQuestion]);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  const restartGame = useCallback(() => {
    setIsGameEnded(false);
    setCurrentQuestionIndex(0);
    setCurrentPlayerIndex(0);
    setPhase('question');
    setScores({});
    setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, [setQuestions]);

  const advanceSetup = useCallback(() => {
    setIsHolding(false);
    setSetupState((prev) => {
      const next = prev.index + 1;
      if (next >= players.length) {
        return { ...prev, finished: true };
      }
      return { ...prev, index: next };
    });
  }, [players.length]);

  const toggleCheckedVoter = useCallback((playerId: string, checked: boolean) => {
    setCheckedVoters((prev) => ({ ...prev, [playerId]: checked }));
  }, []);

  const swapQuestion = useCallback((selectedIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const temp = updated[currentQuestionIndex];
      updated[currentQuestionIndex] = updated[selectedIndex];
      updated[selectedIndex] = temp;
      return updated;
    });
  }, [currentQuestionIndex, setQuestions]);

  // Setup broadcast channel
  const stateRef = useRef({
    currentQuestionIndex,
    currentPlayerIndex,
    phase,
    questions,
    players,
    modeId,
  });

  useEffect(() => {
    stateRef.current = { currentQuestionIndex, currentPlayerIndex, phase, questions, players, modeId };
  }, [currentQuestionIndex, currentPlayerIndex, phase, questions, players, modeId]);

  const broadcastCallbacks = useMemo(() => ({
    onTriggerSound,
    onTriggerEmoji,
    onTriggerJoker,
    onInjectDeck,
  }), [onTriggerSound, onTriggerEmoji, onTriggerJoker, onInjectDeck]);

  const broadcastActions = useMemo(() => ({
    skip: handleSkip,
    swapQuestion,
    setCurrentPlayerIndex,
    setPhase,
    setQuestions,
    setSpectatorVotes,
  }), [handleSkip, swapQuestion, setCurrentPlayerIndex, setPhase, setQuestions, setSpectatorVotes]);

  usePresentialBroadcast({
    roomCode,
    modeId,
    players,
    stateRef,
    callbacks: broadcastCallbacks,
    actions: broadcastActions,
  });

  // Handle Imposteur Voting Countdown
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (phase === 'imposteur_voting' && isVotingCountdownActive && votingCountdown > 0) {
      timerId = setTimeout(() => {
        setVotingCountdown((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'imposteur_voting' && isVotingCountdownActive && votingCountdown === 0) {
      onTriggerSound?.('gong');
      requestAnimationFrame(() => {
        setIsVotingCountdownActive(false);
      });
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [phase, isVotingCountdownActive, votingCountdown, onTriggerSound]);

  return {
    questions,
    currentQuestionIndex,
    currentPlayerIndex,
    phase,
    loading,
    error,
    imposteurIndex,
    imposteurSetupFinished: setupState.finished,
    setupPlayerIndex: setupState.index,
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
  };
}
