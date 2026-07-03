'use client';

import { useRouter } from 'next/navigation';
import { TotemView } from '@/components/couple/TotemView';
import { MiniTotemOrbe } from '@/components/couple/MiniTotemOrbe';
import { TimeCapsulePanel } from '@/components/couple/TimeCapsulePanel';
import { MonthlyReportCard } from '@/components/couple/MonthlyReportCard';
import { DetoxChallenge } from '@/components/couple/DetoxChallenge';
import { WeeklyRecap } from '@/components/couple/WeeklyRecap';
import { Icon } from '@/components/Icon';
import { useCoupleData, useDashboardUIState, useDashboardUISetters } from '../_hooks/useCoupleDashboardContext';
import { formatDate, getScoreClass, getScoreLabel } from '../_lib/helpers';

interface StatsColumnProps {
  currentDay: number;
  revealedCount: number;
}

export function StatsColumn({ currentDay, revealedCount }: StatsColumnProps) {
  const router = useRouter();
  const { couple, userId, totemState, streak, todayQuestion, dailyQuestions, pastQuestions, portraits } = useCoupleData();
  const showAdvanced = currentDay >= 3 || revealedCount >= 1;
  const { selectedQuestion } = useDashboardUIState();
  const { setSelectedQuestion, setShowProtocol } = useDashboardUISetters();

  return (
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

      {showAdvanced && (
        <>
          {/* Digital Detox Challenge */}
          {couple?.id && (
            <div className="couple-card">
              <DetoxChallenge coupleId={couple.id} />
            </div>
          )}

          {/* Weekly Recap (ritual theme, no score) */}
          {todayQuestion?.theme && (
            <WeeklyRecap
              theme={todayQuestion.theme}
              answeredCount={dailyQuestions.filter((q) => q.theme === todayQuestion.theme && q.user1Answered && q.user2Answered).length}
              totalCount={Math.max(1, dailyQuestions.filter((q) => q.theme === todayQuestion.theme).length)}
            />
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
        </>
      )}

      {/* Timeline */}
      <div className="couple-card">
        <div className="couple-label">Historique des Miroirs</div>

        {!showAdvanced && pastQuestions.length === 0 ? (
          <p className="text-sm text-slate-400">
            Votre histoire commence aujourd&apos;hui. Revenez après votre première révélation.
          </p>
        ) : pastQuestions.length === 0 ? (
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

      {showAdvanced && (
        <>
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
        </>
      )}
    </div>
  );
}
