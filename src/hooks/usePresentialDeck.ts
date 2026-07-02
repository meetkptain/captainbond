'use client';

import { useState, useEffect } from 'react';
import { CustomDeck, CustomQuestion } from '@/lib/custom-decks/types';
import { DeckQuestion, sequenceDeck, injectWildcards } from '@/lib/presentiel/deck';
import { Player } from '@/components/presentiel/TalkingStick';

export function buildDeckFromCustom(
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

export interface UsePresentialDeckInput {
  roomCode: string;
  hostId: string;
  hostToken: string;
  players: Player[];
  modeId: string;
}

export interface UsePresentialDeckOutput {
  questions: DeckQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<DeckQuestion[]>>;
  loading: boolean;
  error: string | null;
  entitlements: { accessibleModes?: string[] } | null;
}

export function usePresentialDeck(input: UsePresentialDeckInput): UsePresentialDeckOutput {
  const { roomCode, hostId, hostToken, players, modeId } = input;

  const [questions, setQuestions] = useState<DeckQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<{ accessibleModes?: string[] } | null>(null);

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

  return {
    questions,
    setQuestions,
    loading,
    error,
    entitlements,
  };
}
