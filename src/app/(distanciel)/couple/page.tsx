'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import { ResonanceCircle } from '@/components/couple/ResonanceCircle';
import { ProtocolWizard } from '@/components/couple/ProtocolWizard';
import { SyncDropCountdown } from '@/components/couple/SyncDropCountdown';
import { CouchMode } from '@/components/couple/CouchMode';
import { CoupleLanding } from '@/components/couple/CoupleLanding';
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
export default function CoupleDashboard() {
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

  const streak = useMemo(() => calculateStreak(dailyQuestions), [dailyQuestions]);

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (coupleId: string) => {
    try {
      const data = await api.get<PortraitResponse>(
        `/api/couple/portrait?coupleId=${coupleId}`
      );
      setCouple(data.couple);
      setDailyQuestions(data.dailyQuestions);
      setPortraits(data.portraits);

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
        <CoupleLanding onStartAuth={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
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
          <button className="couple-back-link" onClick={() => router.push('/')}>
            <Icon name="arrowLeft" className="w-3 h-3 inline mr-1" /> Retour
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

                  {/* Answer Phase: Not yet answered */}
                  {!hasMyAnswer && !submitted && todayQuestion && (
                    <div className="answer-area">
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
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="smartphone" className="w-4 h-4 inline mr-1" />
                          Jouer ensemble sur cet écran (Couch Mode)
                        </button>
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
                        color: 'rgba(226, 232, 240, 0.8)',
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

            {/* Streak Card */}
            <div className="couple-card">
              <div className="couple-stat">
                <div>
                  <div className="couple-label">Série de Connexion</div>
                  <div className="couple-stat-value">
                    <Icon name="flame" className="w-6 h-6 inline" /> {streak} Jours
                  </div>
                </div>
                <div
                  className="couple-stat-icon"
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                  }}
                >
                  <Icon name="heart" className="w-5 h-5" />
                </div>
              </div>
            </div>

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
                          isRevealed ? 'timeline-dot-revealed' :
                          isPending ? 'timeline-dot-pending' :
                          'timeline-dot-sealed'
                        }`}>
                          <Icon
                            name={isRevealed ? 'sparkles' : isPending ? 'hourglass' : 'lock'}
                            className="w-4 h-4"
                          />
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
          </div>
        </div>
      </div>
    </div>
  );
}
