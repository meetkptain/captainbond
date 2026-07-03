'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api, ApiClientError } from '@/lib/api/client';
import { getCurrentUser } from '@/lib/supabase-auth';
import { Entitlements } from '@/lib/monetization/entitlements';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DailyQuestionData {
  id: string;
  coupleId: string;
  questionId?: string | null;
  customText?: string | null;
  releasedAt: string;
  isAnswered: boolean;
  user1Answer?: string | null;
  user2Answer?: string | null;
  user1Answered: boolean;
  user2Answered: boolean;
  isRevealed: boolean;
  resonanceScore?: number | null;
  analysisJson?: AnalysisData | null;
  analysisStatus: 'PENDING' | 'COMPUTED' | 'REVEALED' | 'EXPIRED';
  question?: { text: string } | null;
  theme?: string | null;
  intensity?: number;
  ritualAction?: string | null;
  therapistGuide?: string | null;
  isSafeZoneActive?: boolean;
  user1Mood?: Record<string, unknown> | null;
  user2Mood?: Record<string, unknown> | null;
}

export interface AnalysisData {
  alignmentScore: number;
  resonanceInsight: string;
  partnerAProfile: { traits: string[] };
  partnerBProfile: { traits: string[] };
  actionSuggestion: string;
}

export interface CouplePortraitData {
  id: string;
  month: string;
  alignmentTrend: number;
  coupleDynamic?: Record<string, unknown> | null;
}

export interface CoupleData {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt?: string;
  user1Name?: string | null;
  user2Name?: string | null;
}

export interface TimeCapsuleData {
  id: string;
  coupleId: string;
  senderId: string;
  content: string;
  createdAt?: string;
  unlocksAt: string;
  isUnlocked: boolean;
}

interface PortraitResponse {
  couple: CoupleData;
  dailyQuestions: DailyQuestionData[];
  portraits: CouplePortraitData[];
  entitlements: Entitlements | null;
  timeCapsules: TimeCapsuleData[];
  totemState?: PageTotemState | null;
}

export interface PageTotemState {
  fusionState?: {
    status?: string;
    energy?: number;
  };
  streakDays?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateStreak(questions: DailyQuestionData[]): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const q of questions) {
    const qDate = new Date(q.releasedAt);
    qDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - qDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === streak && q.isAnswered) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCoupleDashboard() {
  // State
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestionData[]>([]);
  const [portraits, setPortraits] = useState<CouplePortraitData[]>([]);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DailyQuestionData | null>(null);
  const [revealAnimation, setRevealAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCouchMode, setIsCouchMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [totemState, setTotemState] = useState<PageTotemState | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsuleData[]>([]);
  const [moodEnergy, setMoodEnergy] = useState(3);
  const [moodStress, setMoodStress] = useState(1);
  const [moodFeeling, setMoodFeeling] = useState('');
  const [submittingMood, setSubmittingMood] = useState(false);

  // Refs for one-shot auto-join
  const isJoiningRef = useRef(false);
  const hasJoinedRef = useRef(false);

  // Derived
  const todayQuestion = useMemo(() => dailyQuestions[0] ?? null, [dailyQuestions]);
  const pastQuestions = useMemo(() => dailyQuestions.slice(1), [dailyQuestions]);

  const isUser1 = useMemo(
    () => (couple && userId ? couple.user1Id === userId : false),
    [couple, userId]
  );

  const partnerName = useMemo(() => {
    if (!couple) return 'Ton partenaire';
    return isUser1
      ? couple.user2Name?.trim() || 'Ton partenaire'
      : couple.user1Name?.trim() || 'Ton partenaire';
  }, [couple, isUser1]);

  const myName = useMemo(() => {
    if (!couple) return 'Toi';
    return isUser1
      ? couple.user1Name?.trim() || 'Toi'
      : couple.user2Name?.trim() || 'Toi';
  }, [couple, isUser1]);

  const hasMyAnswer = useMemo(() => {
    if (!todayQuestion) return false;
    return isUser1 ? todayQuestion.user1Answered : todayQuestion.user2Answered;
  }, [todayQuestion, isUser1]);

  const hasPartnerAnswer = useMemo(() => {
    if (!todayQuestion) return false;
    return isUser1 ? todayQuestion.user2Answered : todayQuestion.user1Answered;
  }, [todayQuestion, isUser1]);

  const bothAnswered = hasMyAnswer && hasPartnerAnswer;

  const hasMyMood = useMemo(() => {
    if (!todayQuestion) return false;
    return isUser1 ? !!todayQuestion.user1Mood : !!todayQuestion.user2Mood;
  }, [todayQuestion, isUser1]);

  const streak = useMemo(() => calculateStreak(dailyQuestions), [dailyQuestions]);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async (coupleId: string) => {
    try {
      const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
      const data = await api.get<PortraitResponse>(
        `/api/couple/portrait?coupleId=${encodeURIComponent(coupleId)}&timezone=${encodeURIComponent(tz)}`
      );
      setCouple(data.couple);
      setDailyQuestions(data.dailyQuestions);
      setPortraits(data.portraits);
      setEntitlements(data.entitlements ?? null);
      setTimeCapsules(data.timeCapsules ?? []);
      if (data.totemState) {
        setTotemState(data.totemState);
      }

      // Check if today's question just got revealed
      const today = data.dailyQuestions[0];
      if (today?.isRevealed && today.analysisStatus === 'REVEALED') {
        setRevealAnimation(true);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Impossible de charger les données du couple.');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setUserId(null);
          setLoading(false);
          return;
        }
        if (!cancelled) {
          setUserId(user.id);
          // Find the user's couple
          const couples = await api.get<CoupleData[]>(
            `/api/couple/portrait?userId=${encodeURIComponent(user.id)}&list=true`
          );

          if (couples.length > 0) {
            await fetchData(couples[0].id);
          } else {
            // Check if we have a signed invite token or a raw invite id to auto-couple
            const params = new URLSearchParams(window.location.search);
            const inviteToken = params.get('inviteToken');
            const inviteId = params.get('invite');

            if (inviteToken) {
              if (isJoiningRef.current || hasJoinedRef.current) return;
              isJoiningRef.current = true;
              try {
                const joinRes = await api.post<{ success: boolean; couple: CoupleData }>(
                  '/api/couple/join',
                  { inviteToken }
                );
                if (joinRes.success && joinRes.couple) {
                  hasJoinedRef.current = true;
                  window.history.replaceState({}, document.title, window.location.pathname);
                  await fetchData(joinRes.couple.id);
                  return;
                }
              } catch (joinErr) {
                console.error('Failed to auto-accept invite token', joinErr);
                if (joinErr instanceof ApiClientError) {
                  setError(`Le lien d'invitation n'a pas pu être utilisé : ${joinErr.message}`);
                } else {
                  setError("Le lien d'invitation n'a pas pu être utilisé. Vérifiez le lien ou demandez-en un nouveau.");
                }
              } finally {
                isJoiningRef.current = false;
              }
            } else if (inviteId && inviteId !== user.id) {
              if (isJoiningRef.current || hasJoinedRef.current) return;
              isJoiningRef.current = true;
              try {
                const joinRes = await api.post<{ success: boolean; couple: CoupleData }>(
                  '/api/couple/join',
                  { partnerId: inviteId }
                );
                if (joinRes.success && joinRes.couple) {
                  hasJoinedRef.current = true;
                  window.history.replaceState({}, document.title, window.location.pathname);
                  await fetchData(joinRes.couple.id);
                  return;
                }
              } catch (joinErr) {
                console.error('Failed to auto-couple', joinErr);
                if (joinErr instanceof ApiClientError) {
                  setError(`L'invitation n'a pas pu être acceptée : ${joinErr.message}`);
                } else {
                  setError("L'invitation n'a pas pu être acceptée. Vérifiez le lien ou demandez-en un nouveau.");
                }
              } finally {
                isJoiningRef.current = false;
              }
            } else {
              setError('Aucun espace couple trouvé. Invitez votre partenaire pour commencer.');
            }
          }
        }
      } catch {
        if (!cancelled) setError('Impossible de récupérer votre espace couple.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  // ─── Submit Answer ──────────────────────────────────────────────────────────
  const submitAnswer = useCallback(
    async (submittedAnswer?: string) => {
      const answerText = (submittedAnswer ?? answer).trim();
      if (!answerText || !todayQuestion || !couple || !userId) return;

      setSubmitting(true);
      try {
        await api.post('/api/couple/analyze', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id,
          userId,
          answer: answerText,
        });

        // Vibration haptique brève de confirmation
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }

        setSubmitted(true);
        setAnswer('');
        await fetchData(couple.id);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Une erreur est survenue lors de l\'envoi.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [answer, todayQuestion, couple, userId, fetchData]
  );

  const submitCouchAnswers = useCallback(
    async (answerAVal: string, answerBVal: string) => {
      if (!answerAVal.trim() || !answerBVal.trim() || !todayQuestion || !couple || !userId) return;

      setSubmitting(true);
      setError(null);
      try {
        // Couch mode only submits the currently authenticated partner's answer.
        await api.post('/api/couple/analyze', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id,
          userId,
          answer: answerAVal.trim(),
        });

        setSubmitted(true);
        setAnswer('');
        setIsCouchMode(false);
        await fetchData(couple.id);

        setError(
          "Ta réponse est enregistrée. Demande à ton partenaire de se connecter (ou d'ouvrir ce lien avec son compte) pour ajouter sa réponse."
        );
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Impossible de sceller les réponses.');
        }
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [todayQuestion, couple, userId, fetchData]
  );

  const submitMood = useCallback(async () => {
    if (!todayQuestion || !couple || submittingMood) return;
    setSubmittingMood(true);
    try {
      await api.post('/api/couple/mood', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        mood: {
          energy: moodEnergy,
          stress: moodStress,
          feeling: moodFeeling.trim() || undefined,
        },
      });
      await fetchData(couple.id);
    } catch (err) {
      console.error('Failed to submit mood', err);
      setError('Impossible d\'envoyer votre humeur.');
    } finally {
      setSubmittingMood(false);
    }
  }, [todayQuestion, couple, submittingMood, moodEnergy, moodStress, moodFeeling, fetchData]);

  const skipQuestion = useCallback(async () => {
    if (!todayQuestion || !couple || submitting) return;
    if (
      confirm(
        'Passer définitivement cette question ? Elle sera marquée comme passée sans affecter votre totem.'
      )
    ) {
      setSubmitting(true);
      try {
        await api.post('/api/couple/skip', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id,
        });
        setAnswer('');
        await fetchData(couple.id);
      } catch (err) {
        console.error('Failed to skip question', err);
        setError('Impossible de passer la question.');
      } finally {
        setSubmitting(false);
      }
    }
  }, [todayQuestion, couple, submitting, fetchData]);

  const toggleSafeZone = useCallback(
    async (activate: boolean) => {
      if (!todayQuestion || !couple || submitting) return;
      setSubmitting(true);
      try {
        await api.post('/api/couple/safezone', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id,
          action: activate ? 'ACTIVATE' : 'DEACTIVATE',
        });
        await fetchData(couple.id);
      } catch (err) {
        console.error('Failed to toggle safe zone', err);
        setError('Impossible de modifier la Safe Zone.');
      } finally {
        setSubmitting(false);
      }
    },
    [todayQuestion, couple, submitting, fetchData]
  );

  // ─── Reveal Handler ─────────────────────────────────────────────────────────
  const triggerReveal = useCallback(() => {
    if (couple) {
      setRevealAnimation(true);
      fetchData(couple.id);
    }
  }, [couple, fetchData]);

  const revealNow = useCallback(async () => {
    if (!todayQuestion || !couple || !userId) return;
    setSubmitting(true);
    try {
      await api.post('/api/couple/reveal', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
      });
      setRevealAnimation(true);
      await fetchData(couple.id);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Impossible de révéler la réponse maintenant.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [todayQuestion, couple, userId, fetchData]);

  return {
    loading,
    userId,
    couple,
    dailyQuestions,
    portraits,
    answer,
    setAnswer,
    submitting,
    submitted,
    showProtocol,
    setShowProtocol,
    selectedQuestion,
    setSelectedQuestion,
    revealAnimation,
    setRevealAnimation,
    error,
    isCouchMode,
    setIsCouchMode,
    showAuthModal,
    setShowAuthModal,
    totemState,
    entitlements,
    timeCapsules,
    moodEnergy,
    setMoodEnergy,
    moodStress,
    setMoodStress,
    moodFeeling,
    setMoodFeeling,
    submittingMood,
    // derived
    todayQuestion,
    pastQuestions,
    isUser1,
    partnerName,
    myName,
    hasMyAnswer,
    hasPartnerAnswer,
    bothAnswered,
    hasMyMood,
    streak,
    // callbacks
    submitAnswer,
    submitCouchAnswers,
    submitMood,
    skipQuestion,
    toggleSafeZone,
    triggerReveal,
    revealNow,
  };
}
