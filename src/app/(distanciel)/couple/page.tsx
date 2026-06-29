'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ResonanceCircle } from '@/components/couple/ResonanceCircle';
import { ProtocolWizard } from '@/components/couple/ProtocolWizard';
import { SyncDropCountdown } from '@/components/couple/SyncDropCountdown';
import { CouchMode } from '@/components/couple/CouchMode';
import { CoupleLanding } from '@/components/couple/CoupleLanding';
import { TotemView } from '@/components/couple/TotemView';
import { MiniTotemOrbe } from '@/components/couple/MiniTotemOrbe';
import { TimeCapsulePanel } from '@/components/couple/TimeCapsulePanel';
import { MonthlyReportCard } from '@/components/couple/MonthlyReportCard';
import { DetoxChallenge } from '@/components/couple/DetoxChallenge';
import { Icon } from '@/components/Icon';
import { api, ApiClientError } from '@/lib/api/client';
import { getCurrentUser } from '@/lib/supabase-auth';
import { AuthModal } from '@/components/AuthModal';
import './couple.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyQuestionData {
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
}

interface AnalysisData {
  alignmentScore: number;
  resonanceInsight: string;
  partnerAProfile: { traits: string[] };
  partnerBProfile: { traits: string[] };
  actionSuggestion: string;
}

interface CouplePortraitData {
  id: string;
  month: string;
  alignmentTrend: number;
  coupleDynamic?: Record<string, unknown> | null;
}

interface CoupleData {
  id: string;
  user1Id: string;
  user2Id: string;
}

interface PortraitResponse {
  couple: CoupleData;
  dailyQuestions: DailyQuestionData[];
  portraits: CouplePortraitData[];
  totemState?: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getScoreClass(score: number): string {
  if (score >= 0.75) return 'timeline-score-high';
  if (score >= 0.5) return 'timeline-score-medium';
  return 'timeline-score-low';
}

function getScoreLabel(score: number): string {
  if (score >= 0.85) return 'Fusion';
  if (score >= 0.7) return 'Résonance';
  if (score >= 0.5) return 'Équilibre';
  return 'Exploration';
}

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function CoupleDashboard({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const router = useRouter();

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
  const [totemState, setTotemState] = useState<any | null>(null);
  const [moodEnergy, setMoodEnergy] = useState(3);
  const [moodStress, setMoodStress] = useState(1);
  const [moodFeeling, setMoodFeeling] = useState('');
  const [submittingMood, setSubmittingMood] = useState(false);

  // Derived
  const todayQuestion = useMemo(() => dailyQuestions[0] ?? null, [dailyQuestions]);
  const pastQuestions = useMemo(() => dailyQuestions.slice(1), [dailyQuestions]);

  const isUser1 = useMemo(
    () => couple && userId ? couple.user1Id === userId : false,
    [couple, userId]
  );

  const partnerName = useMemo(() => {
    if (!couple || !userId) return 'Partenaire';
    return isUser1 ? 'Partenaire B' : 'Partenaire A';
  }, [couple, userId, isUser1]);

  const myName = useMemo(() => {
    return isUser1 ? 'Partenaire A' : 'Partenaire B';
  }, [isUser1]);

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
    return isUser1 ? !!(todayQuestion as any).user1Mood : !!(todayQuestion as any).user2Mood;
  }, [todayQuestion, isUser1]);

  const streak = useMemo(() => calculateStreak(dailyQuestions), [dailyQuestions]);

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (coupleId: string) => {
    try {
      const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
      const data = await api.get<PortraitResponse>(
        `/api/couple/portrait?coupleId=${coupleId}&timezone=${encodeURIComponent(tz)}`
      );
      setCouple(data.couple);
      setDailyQuestions(data.dailyQuestions);
      setPortraits(data.portraits);
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
            `/api/couple/portrait?userId=${user.id}&list=true`
          ).catch(() => [] as CoupleData[]);

          if (couples.length > 0) {
            await fetchData(couples[0].id);
          } else {
            // Check if we have an invite parameter to auto-couple
            const params = new URLSearchParams(window.location.search);
            const inviteId = params.get('invite');
            if (inviteId && inviteId !== user.id) {
              try {
                const joinRes = await api.post<{ success: boolean; couple: CoupleData }>('/api/couple/join', { partnerId: inviteId });
                if (joinRes.success && joinRes.couple) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  await fetchData(joinRes.couple.id);
                  return;
                }
              } catch (joinErr) {
                console.error('Failed to auto-couple', joinErr);
              }
            }
            setError('Aucun espace couple trouvé. Invitez votre partenaire pour commencer.');
          }
        }
      } catch {
        if (!cancelled) setError('Erreur de connexion.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [router, fetchData]);

  // ─── Submit Answer ────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !todayQuestion || !couple || !userId) return;

    setSubmitting(true);
    try {
      await api.post('/api/couple/analyze', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        userId,
        answer: answer.trim(),
      });
      
      // Vibration haptique brève de confirmation (Pro-Max check)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      setSubmitted(true);
      setAnswer('');
      // Refresh data
      await fetchData(couple.id);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCouchAnswers = async (answerAVal: string, answerBVal: string) => {
    if (!answerAVal.trim() || !answerBVal.trim() || !todayQuestion || !couple) return;

    setSubmitting(true);
    setError(null);
    try {
      // 1. Submit Partner A's answer
      await api.post('/api/couple/analyze', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        userId: couple.user1Id,
        answer: answerAVal.trim(),
      });

      // 2. Submit Partner B's answer
      await api.post('/api/couple/analyze', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        userId: couple.user2Id,
        answer: answerBVal.trim(),
      });

      setSubmitted(true);
      setAnswer('');
      setIsCouchMode(false);
      await fetchData(couple.id);
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
  };

  const handlePassQuestion = async () => {
    if (!todayQuestion || !couple || submitting) return;
    if (confirm("Passer cette question ? Un nouveau sujet sera tiré pour vous deux.")) {
      setSubmitting(true);
      try {
        await api.post('/api/couple/pass', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id
        });
        setAnswer('');
        await fetchData(couple.id);
      } catch (err) {
        console.error('Failed to pass question', err);
        alert('Impossible de passer la question.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmitMood = async () => {
    if (!todayQuestion || !couple || submittingMood) return;
    setSubmittingMood(true);
    try {
      await api.post('/api/couple/mood', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        mood: {
          energy: moodEnergy,
          stress: moodStress,
          feeling: moodFeeling.trim() || undefined
        }
      });
      await fetchData(couple.id);
    } catch (err) {
      console.error('Failed to submit mood', err);
      alert('Impossible d\'enregistrer votre météo émotionnelle.');
    } finally {
      setSubmittingMood(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!todayQuestion || !couple || submitting) return;
    if (confirm("Passer définitivement cette question ? Elle sera marquée comme passée sans affecter votre totem.")) {
      setSubmitting(true);
      try {
        await api.post('/api/couple/skip', {
          coupleId: couple.id,
          dailyQuestionId: todayQuestion.id
        });
        setAnswer('');
        await fetchData(couple.id);
      } catch (err) {
        console.error('Failed to skip question', err);
        alert('Impossible de passer la question.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleToggleSafeZone = async (activate: boolean) => {
    if (!todayQuestion || !couple || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/api/couple/safezone', {
        coupleId: couple.id,
        dailyQuestionId: todayQuestion.id,
        action: activate ? 'ACTIVATE' : 'DEACTIVATE'
      });
      await fetchData(couple.id);
    } catch (err) {
      console.error('Failed to toggle safe zone', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reveal Handler ──────────────────────────────────────────────────────
  const handleRevealTime = useCallback(() => {
    if (couple) {
      setRevealAnimation(true);
      fetchData(couple.id);
    }
  }, [couple, fetchData]);

  // ─── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="couple-page">
        <BackgroundOrbs />
        <div className="couple-container">
          <div className="couple-empty">
            <div className="couple-spinner" />
            <p className="couple-empty-text">Chargement de votre espace couple…</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Public Landing Page if not authenticated ───────────────────
  if (!userId) {
    return (
      <>
        <CoupleLanding defaultLang={defaultLang} onStartAuth={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // ─── Render: Onboarding Invite ───────────────────────────────────────────
  if (error && error.includes('Aucun espace couple') && !couple) {
    const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/couple?invite=${userId}` : '';
    return (
      <div className="couple-page">
        <BackgroundOrbs />
        <div className="couple-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="couple-card couple-empty" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
            <span className="couple-empty-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
              <Icon name="heart" className="w-8 h-8 text-purple-400" />
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '1.25rem', marginBottom: '0.5rem' }}>Créez votre Espace Couple</h2>
            <p className="couple-empty-text" style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Envoyez ce lien magique à votre partenaire. Une fois qu&apos;il l&apos;aura ouvert, votre espace de connexion partagé sera créé.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                color: '#cbd5e1',
                fontFamily: 'monospace',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                textAlign: 'left'
              }}>
                {inviteLink}
              </div>
              <button
                className="couple-action-btn"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                  alert('Lien copié ! Envoyez-le à votre partenaire.');
                }}
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copier le lien
              </button>
              <button
                className="couple-action-btn"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.8 }}
                onClick={() => router.push('/')}
              >
                Retour à l&apos;accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (error && !couple) {
    return (
      <div className="couple-page">
        <BackgroundOrbs />
        <div className="couple-container">
          <div className="couple-card couple-empty">
            <span className="couple-empty-icon">
              <Icon name="heartCrack" className="w-8 h-8" />
            </span>
            <p className="couple-empty-text">{error}</p>
            <button className="couple-action-btn" onClick={() => router.push('/')}>
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Question Text ────────────────────────────────────────────────
  const questionText = todayQuestion?.question?.text ?? todayQuestion?.customText ?? 'Aucune question aujourd\'hui';

  return (
    <div className="couple-page">
      <BackgroundOrbs />

      <div className="couple-container">
        {/* Header */}
        <header className="couple-header">
          <div className="couple-brand">
            <span className="couple-brand-name">CAPTAIN BOND</span>
            <span className="couple-badge">Espace Couple</span>
          </div>
          <button className="couple-back-link min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200" onClick={() => router.push('/')}>
            <Icon name="arrowLeft" className="w-4 h-4 mr-1 text-slate-300" /> <span className="text-slate-300 text-sm font-medium">Retour</span>
          </button>
        </header>

        {/* Greeting */}
        <section className="couple-greeting">
          <h1>Miroir Relationnel</h1>
          <p>Votre rendez-vous quotidien pour comprendre, ressentir et grandir ensemble.</p>
        </section>

        {/* Main Grid */}
        <div className="couple-grid">

          {/* ═══ Left Column: Today's Ritual ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Today's Question Card */}
            <div className="couple-card couple-card-premium">
              {isCouchMode ? (
                <CouchMode
                  questionText={questionText}
                  submitting={submitting}
                  onSubmit={handleSubmitCouchAnswers}
                  onCancel={() => {
                    setIsCouchMode(false);
                    setAnswer('');
                  }}
                  partnerAName="Partenaire A"
                  partnerBName="Partenaire B"
                />
              ) : (
                <>
                  <div className="couple-label">Question du jour</div>

                  <div className="question-display">
                    <p className="question-text">{questionText}</p>
                  </div>

                  {/* Mood Phase: Pick daily weather first */}
                  {!hasMyAnswer && !submitted && todayQuestion && !hasMyMood && (
                    <div className="mood-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', padding: '1rem 0' }}>
                      <div style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                        <p style={{ fontSize: '0.8125rem', color: '#c084fc', margin: 0, lineHeight: 1.5 }}>
                          <strong>Météo Émotionnelle :</strong> Partagez brièvement votre état du jour. Si vous êtes stressé ou fatigué, le rituel s&apos;adaptera automatiquement avec des questions plus douces ou des gratitudes.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Niveau d&apos;énergie : {moodEnergy} / 5</label>
                        <input type="range" min="1" max="5" value={moodEnergy} onChange={(e) => setMoodEnergy(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
                          <span>Épuisé(e)</span>
                          <span>Plein d&apos;énergie</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Niveau de stress : {moodStress} / 5</label>
                        <input type="range" min="1" max="5" value={moodStress} onChange={(e) => setMoodStress(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
                          <span>Zen</span>
                          <span>Très stressé(e)</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Comment te sens-tu aujourd&apos;hui ? (optionnel)</label>
                        <input type="text" className="answer-textarea" style={{ minHeight: '44px', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} value={moodFeeling} onChange={(e) => setMoodFeeling(e.target.value)} placeholder="ex: fatigué(e), joyeux(se), distrait(e)..." />
                      </div>

                      <button className="answer-submit" onClick={handleSubmitMood} disabled={submittingMood}>
                        {submittingMood ? <span className="couple-spinner" /> : "Enregistrer ma météo"}
                      </button>
                    </div>
                  )}

                  {/* Answer Phase: Answer question if mood submitted */}
                  {!hasMyAnswer && !submitted && todayQuestion && hasMyMood && (
                    <div className="answer-area">
                      {/* Safe Zone Alert if active */}
                      {!!(todayQuestion as any).isSafeZoneActive && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          marginBottom: '1.25rem',
                          fontSize: '0.8125rem',
                          color: '#f87171',
                          lineHeight: 1.5
                        }}>
                          <Icon name="heartCrack" className="w-5 h-5 inline mr-2 text-red-400 align-middle" />
                          <strong style={{ color: '#ef4444' }}>Mode Safe Zone Activé :</strong> Communiquez avec bienveillance. Si la tension monte, n&apos;hésitez pas à passer la question sans pénalité.
                        </div>
                      )}

                      <textarea
                        className="answer-textarea"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Écrivez votre réponse en toute sincérité… Votre partenaire ne la verra qu'à 20h."
                        maxLength={2000}
                        disabled={submitting}
                      />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', width: '100%' }}>
                        <button
                          className="answer-submit"
                          onClick={handleSubmitAnswer}
                          disabled={!answer.trim() || submitting}
                        >
                          {submitting ? (
                            <span className="couple-spinner" />
                          ) : (
                            <>
                              Sceller ma réponse <Icon name="lock" className="w-4 h-4 inline" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsCouchMode(true);
                            setAnswer('');
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            color: '#cbd5e1',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            minHeight: '44px',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="smartphone" className="w-4 h-4 inline mr-1" />
                          Jouer ensemble sur cet écran (Couch Mode)
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSafeZone(!(todayQuestion as any).isSafeZoneActive)}
                            style={{
                              background: 'transparent',
                              border: (todayQuestion as any).isSafeZoneActive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(251, 191, 36, 0.25)',
                              color: (todayQuestion as any).isSafeZoneActive ? '#ef4444' : '#fbbf24',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              minHeight: '44px',
                              padding: '0.5rem',
                              borderRadius: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon name="alert" className="w-3.5 h-3.5 inline mr-1 align-middle" />
                            {(todayQuestion as any).isSafeZoneActive ? "Couper Safe Zone" : "Safe Zone (Pause)"}
                          </button>

                          <button
                            type="button"
                            onClick={handleSkipQuestion}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              minHeight: '44px',
                              padding: '0.5rem',
                              borderRadius: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon name="heartCrack" className="w-3.5 h-3.5 inline mr-1 align-middle" />
                            Passer la question (Skip)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submitted: Waiting for partner */}
                  {(hasMyAnswer || submitted) && !bothAnswered && (
                    <SyncDropCountdown
                      targetHour={20}
                      isReady={false}
                      partnerName={partnerName}
                      onRevealTime={handleRevealTime}
                    />
                  )}

                  {/* Both answered but sealed */}
                  {bothAnswered && !todayQuestion?.isRevealed && (
                    <SyncDropCountdown
                      targetHour={20}
                      isReady={true}
                      partnerName={partnerName}
                      onRevealTime={handleRevealTime}
                    />
                  )}

                  {/* Revealed: Show Resonance */}
                  {todayQuestion?.isRevealed && todayQuestion.analysisJson && (
                    <div className={revealAnimation ? 'reveal-container' : ''}>
                      <ResonanceCircle
                        resonanceScore={todayQuestion.resonanceScore ?? 0}
                        partnerAName={myName}
                        partnerBName={partnerName}
                        isRevealed={true}
                        isAnimating={revealAnimation}
                      />

                      {/* Insight */}
                      <div style={{
                        textAlign: 'center',
                        padding: '1rem 0',
                        color: '#f1f5f9', // Slate-100 for higher contrast against dark backdrop
                        fontStyle: 'italic',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                      }}>
                        {(todayQuestion.analysisJson as AnalysisData).resonanceInsight}
                      </div>

                      {/* Protocol CTA */}
                      {(todayQuestion.resonanceScore ?? 1) < 0.65 && !showProtocol && (
                        <button
                          className="couple-action-btn"
                          onClick={() => {
                            setSelectedQuestion(todayQuestion);
                            setShowProtocol(true);
                          }}
                        >
                          <Icon name="lock" className="w-4 h-4" /> Débloquer le Protocole d&apos;Alignement
                        </button>
                      )}

                      {(todayQuestion.resonanceScore ?? 0) >= 0.65 && !showProtocol && (
                        <button
                          className="couple-action-btn"
                          onClick={() => {
                            setSelectedQuestion(todayQuestion);
                            setShowProtocol(true);
                          }}
                          style={{ opacity: 0.8 }}
                        >
                          <Icon name="sparkles" className="w-4 h-4" /> Explorer le Protocole d&apos;Alignement
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Protocol Wizard (expanded) */}
            {showProtocol && selectedQuestion && couple && (
              <div className="couple-card">
                <ProtocolWizard
                  coupleId={couple.id}
                  dailyQuestionId={selectedQuestion.id}
                  analysisData={selectedQuestion.analysisJson as AnalysisData}
                  onComplete={() => setShowProtocol(false)}
                />
              </div>
            )}

            {/* Resonance Circle for sealed state */}
            {todayQuestion && !todayQuestion.isRevealed && bothAnswered && (
              <div className="couple-card" style={{ display: 'flex', justifyContent: 'center' }}>
                <ResonanceCircle
                  resonanceScore={0}
                  partnerAName={myName}
                  partnerBName={partnerName}
                  isRevealed={false}
                  isAnimating={false}
                />
              </div>
            )}
          </div>

          {/* ═══ Right Column: Stats & Timeline ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Totem: Orbe individuel + Sphère de Fusion */}
            {couple && userId && (
              <div className="couple-card couple-card-premium">
                <div className="couple-label">Votre Totem de Couple</div>
                <TotemView
                  coupleId={couple.id}
                  userId={userId}
                  user1Id={couple.user1Id}
                />
              </div>
            )}

             {/* Tamagotchi Vitality Card */}
             <div className="couple-card">
               <div className="couple-stat" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div className="couple-label">Vitalité du Totem</div>
                     <div className="couple-stat-value" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       {totemState?.fusionState?.status === 'SLEEPING' ? (
                         <>
                           <Icon name="sprout" className="w-5 h-5 text-indigo-400" />
                           <span style={{ color: '#818cf8' }}>En Sommeil</span>
                         </>
                       ) : (
                         <>
                           <Icon name="sparkles" className="w-5 h-5 text-green-400" />
                           <span style={{ color: '#34d399' }}>Éveillé</span>
                         </>
                       )}
                     </div>
                   </div>
                   <div
                     className="couple-stat-icon"
                     style={{
                       background: totemState?.fusionState?.status === 'SLEEPING' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                       border: totemState?.fusionState?.status === 'SLEEPING' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(52, 211, 153, 0.2)',
                     }}
                   >
                     <Icon name={totemState?.fusionState?.status === 'SLEEPING' ? 'sprout' : 'heart'} className="w-5 h-5" />
                   </div>
                 </div>

                 {/* Energy progress bar */}
                 <div style={{ width: '100%' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                     <span>Énergie du compagnon</span>
                     <span>{Math.round((totemState?.fusionState?.energy ?? 1.0) * 100)}%</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                     <div
                       style={{
                         width: `${(totemState?.fusionState?.energy ?? 1.0) * 100}%`,
                         height: '100%',
                         background: totemState?.fusionState?.status === 'SLEEPING' ? '#818cf8' : '#34d399',
                         borderRadius: '3px',
                         transition: 'width 0.3s ease'
                       }}
                     />
                   </div>
                 </div>

                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                   <span>Rituels accomplis :</span>
                   <strong>{totemState?.streakDays ?? streak} jours</strong>
                 </div>
               </div>
             </div>

            {/* Digital Detox Challenge */}
            {couple?.id && (
              <div className="couple-card">
                <DetoxChallenge coupleId={couple.id} />
              </div>
            )}

            {/* Monthly Resonance Report */}
            {couple?.id && (
              <div className="couple-card">
                <MonthlyReportCard coupleId={couple.id} />
              </div>
            )}

            {/* Monthly Portrait */}
            {portraits.length > 0 && (
              <div className="couple-card">
                <div className="couple-label">Portrait du Mois</div>
                <div className="couple-stat">
                  <div>
                    <div className="couple-stat-value" style={{ fontSize: '1.25rem' }}>
                      {portraits[0].month}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(148, 163, 184, 0.6)',
                      marginTop: '0.25rem'
                    }}>
                      Tendance : <Icon name={portraits[0].alignmentTrend > 0 ? 'trendingUp' : 'trendingDown'} className="w-3 h-3 inline" />
                      {' '}{Math.round(portraits[0].alignmentTrend * 100)}%
                    </div>
                  </div>
                  <div
                    className="couple-stat-icon"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <Icon name="brain" className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="couple-card">
              <div className="couple-label">Historique des Miroirs</div>

              {pastQuestions.length === 0 ? (
                <div className="couple-empty">
                  <span className="couple-empty-icon">
                    <Icon name="sprout" className="w-8 h-8" />
                  </span>
                  <p className="couple-empty-text">
                    Votre histoire commence aujourd&apos;hui. Chaque jour révèle un nouveau miroir.
                  </p>
                </div>
              ) : (
                <div className="timeline-list">
                  {pastQuestions.map((q) => {
                    const qText = q.question?.text ?? q.customText ?? '—';
                    const isRevealed = q.isRevealed;
                    const isPending = !q.isAnswered;

                    return (
                      <div
                        key={q.id}
                        className={`timeline-item ${selectedQuestion?.id === q.id ? 'timeline-item-active' : ''}`}
                        onClick={() => {
                          if (isRevealed && q.analysisJson) {
                            setSelectedQuestion(q);
                            setShowProtocol(true);
                          }
                        }}
                      >
                        <div className={`timeline-dot ${
                          isRevealed ? 'timeline-dot-revealed-orbe' :
                          isPending ? 'timeline-dot-pending' :
                          'timeline-dot-sealed'
                        }`}
                        style={isRevealed ? { background: 'transparent', border: 'none', padding: 0 } : undefined}
                        >
                          {isRevealed ? (
                            <MiniTotemOrbe score={q.resonanceScore ?? 0.8} hue={Math.round((q.resonanceScore ?? 0.8) * 360)} size={36} />
                          ) : (
                            <Icon
                              name={isPending ? 'hourglass' : 'lock'}
                              className="w-4 h-4"
                            />
                          )}
                        </div>
                        <div className="timeline-info">
                          <div className="timeline-date">{formatDate(q.releasedAt)}</div>
                          <div className="timeline-question">{qText}</div>
                          {isRevealed && q.resonanceScore != null && (
                            <span className={`timeline-score ${getScoreClass(q.resonanceScore)}`}>
                              {Math.round(q.resonanceScore * 100)}% — {getScoreLabel(q.resonanceScore)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Neural Tree Link */}
            <div className="couple-card">
              <div className="couple-label">Arbre Neural</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Icon name="tree" className="w-8 h-8" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(226, 232, 240, 0.9)' }}>
                    {dailyQuestions.filter(q => q.isRevealed).length} Nœuds révélés
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.5)' }}>
                    Explorez la carte de votre connexion
                  </div>
                </div>
              </div>
              <button
                className="couple-action-btn"
                onClick={() => router.push('/tree')}
                style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                Explorer l&apos;Arbre Neural <Icon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>

            {/* Time Capsule */}
            {couple?.id && userId && (
              <div className="couple-card">
                <TimeCapsulePanel coupleId={couple.id} userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
