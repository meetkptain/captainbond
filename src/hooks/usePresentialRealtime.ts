'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { CustomDeck, CustomQuestion } from '@/lib/custom-decks/types';
import { DeckQuestion, sequenceDeck, injectWildcards } from '@/lib/presentiel/deck';
import { Player } from '@/components/presentiel/TalkingStick';

function buildDeckFromCustom(
  customDeck: CustomDeck | { questions: CustomQuestion[] } | null | undefined,
  players: Player[],
  modeId: string
): DeckQuestion[] {
  const questions = customDeck?.questions;
  if (!questions?.length) return [];
  const presentNames = new Set(players.map((p) => p.name.toLowerCase()));
  return questions
    .filter((q) => q.isGeneric || q.involvedPlayers?.every((name) => presentNames.has(name.toLowerCase())))
    .map((q) => ({
      id: q.id,
      text: q.text,
      mode: modeId,
      intensityLevel: q.intensityLevel ?? 1,
      tags: q.isGeneric ? ['generic'] : [],
    }));
}

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

  const [questions, setQuestions] = useState<DeckQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<PresentialPhase>('question');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Entitlements
  const [entitlements, setEntitlements] = useState<{ accessibleModes?: string[] } | null>(null);

  // Load deck
  useEffect(() => {
    async function loadDeck() {
      try {
        const customDeckJson = typeof window !== 'undefined' ? sessionStorage.getItem('cb_active_custom_deck') : null;
        if (customDeckJson) {
          try {
            const customDeck: CustomDeck = JSON.parse(customDeckJson);
            const activeQuestions = buildDeckFromCustom(customDeck, players, modeId);

            if (activeQuestions.length > 0) {
              const targetSize = Math.min(activeQuestions.length, players.length * 3);
              const sequenced = sequenceDeck(activeQuestions);
              setQuestions(sequenced.slice(0, targetSize));
              sessionStorage.removeItem('cb_active_custom_deck');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to load custom deck:', e);
          }
        }

        const res = await fetch(
          `/api/questions/deck?roomCode=${roomCode}&hostId=${hostId}&hostToken=${hostToken}`
        );
        if (!res.ok) {
          throw new Error('Impossible de charger les questions');
        }
        const data = await res.json();

        let filtered: DeckQuestion[] = data.filter((q: DeckQuestion) => q.mode === modeId);

        if (modeId === 'DATE_NIGHT') {
          filtered = data.filter((q: DeckQuestion) => q.tags?.includes('date_safe'));
        } else if (modeId === 'FAMILY') {
          filtered = data.filter((q: DeckQuestion) => q.mode === modeId && q.tags?.includes('positive'));
        }

        if (filtered.length === 0) {
          filtered = data.filter((q: DeckQuestion) => q.mode === 'ICEBREAKER');
        }

        let preparedDeck = [...filtered];
        if (modeId !== 'IMPOSTEUR') {
          preparedDeck = injectWildcards(preparedDeck, players, modeId);
        } else {
          preparedDeck = sequenceDeck(preparedDeck);
        }

        const couplesJson = typeof window !== 'undefined' ? sessionStorage.getItem('cb_presentiel_couples') : null;
        if (couplesJson) {
          try {
            const couplesList: string[][] = JSON.parse(couplesJson);
            if (couplesList.length > 0) {
              const coupleQuestions: DeckQuestion[] = [];
              couplesList.forEach((c, idx) => {
                const pA = c[0];
                const pB = c[1];
                coupleQuestions.push({
                  id: `couple-q1-${idx}-${Date.now()}`,
                  text: `💖 COMPLICITÉ : ${pA} et ${pB}, quel est le plus beau souvenir de votre rencontre ? L'autre doit valider !`,
                  intensityLevel: 1,
                  tags: ['couple', 'positive'],
                  mode: modeId
                });
                coupleQuestions.push({
                  id: `couple-q2-${idx}-${Date.now()}`,
                  text: `💖 ALIGNEMENT : Si ${pA} devait citer le plus mignon petit défaut de ${pB} en un mot, est-ce que ${pB} devinerait le même ?`,
                  intensityLevel: 2,
                  tags: ['couple'],
                  mode: modeId
                });
              });
              if (coupleQuestions.length > 0) {
                if (preparedDeck.length >= 4) {
                  preparedDeck.splice(2, 0, coupleQuestions[0]);
                  if (coupleQuestions.length > 1) {
                    preparedDeck.splice(Math.min(preparedDeck.length, 5), 0, coupleQuestions[1]);
                  }
                } else {
                  preparedDeck.push(...coupleQuestions);
                }
              }
            }
          } catch (e) {
            console.error('Failed to parse couples for presential deck:', e);
          }
        }

        setQuestions(preparedDeck.slice(0, 6));

        const entitlementsRes = await fetch(
          `/api/me/entitlements?playerId=${hostId}&roomCode=${roomCode}`
        ).catch(() => null);

        if (entitlementsRes && entitlementsRes.ok) {
          const loadedEntitlements = await entitlementsRes.json();
          setEntitlements(loadedEntitlements);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des questions');
        setLoading(false);
      }
    }
    loadDeck();
  }, [roomCode, hostId, hostToken, modeId, players]);

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
  }, []);

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
  }, [currentQuestionIndex]);

  // Setup broadcast channel
  const channel = useMemo(() => {
    return supabase.channel(`room-events-${roomCode}`);
  }, [roomCode]);

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

  // Synchronization with spectator devices
  useEffect(() => {
    const broadcastState = () => {
      const { currentQuestionIndex, currentPlayerIndex, phase, questions, players, modeId } = stateRef.current;
      channel.send({
        type: 'broadcast',
        event: 'ROOM_STATE_UPDATE',
        payload: {
          currentQuestionText: modeId === 'IMPOSTEUR'
            ? "Chacun répond à sa question secrète à tour de rôle."
            : questions[currentQuestionIndex]?.text || '',
          currentPlayerName: players[currentPlayerIndex]?.name || '',
          phase,
          players,
          modeId
        }
      });
    };

    channel
      .on('broadcast', { event: 'REQUEST_ROOM_STATE' }, () => {
        broadcastState();
      })
      .on('broadcast', { event: 'TRIGGER_SOUND' }, ({ payload }) => {
        if (payload && typeof payload.soundType === 'string') {
          onTriggerSound?.(payload.soundType);
        }
      })
      .on('broadcast', { event: 'TRIGGER_EMOJI' }, ({ payload }) => {
        if (payload && typeof payload.emoji === 'string') {
          onTriggerEmoji?.(payload.emoji);
        }
      })
      .on('broadcast', { event: 'TRIGGER_JOKER_SOLIDAIRE' }, ({ payload }) => {
        if (payload && typeof payload.targetPlayerName === 'string') {
          onTriggerJoker?.(payload.targetPlayerName);
          handleSkip();
        }
      })
      .on('broadcast', { event: 'TRIGGER_GLOBAL_SKIP' }, () => {
        if (stateRef.current.questions.length > 1) {
          const nextIndex = (stateRef.current.currentQuestionIndex + 1) % stateRef.current.questions.length;
          swapQuestion(nextIndex);
          setCurrentPlayerIndex(0);
          setPhase('question');
          onTriggerSound?.('joker_bell');
        }
      })
      .on('broadcast', { event: 'SUBMIT_SPECTATOR_VOTE' }, ({ payload }) => {
        if (payload && typeof payload.suspectPlayerId === 'string') {
          setSpectatorVotes((prev) => ({
            ...prev,
            [payload.suspectPlayerId]: (prev[payload.suspectPlayerId] || 0) + 1
          }));
        }
      })
      .on('broadcast', { event: 'INJECT_CUSTOM_DECK' }, ({ payload }) => {
        if (payload && Array.isArray(payload.questions)) {
          const injectQuestions = buildDeckFromCustom(
            { questions: payload.questions as CustomQuestion[] },
            players,
            modeId
          );
          if (injectQuestions.length > 0) {
            setQuestions((prev) => [...prev, ...injectQuestions]);
            onInjectDeck?.(payload.senderName || 'Un spectateur', injectQuestions);
          }
        }
      })
      .subscribe();

    broadcastState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel, modeId, players, onTriggerSound, onTriggerEmoji, onTriggerJoker, onInjectDeck, handleSkip]);

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
