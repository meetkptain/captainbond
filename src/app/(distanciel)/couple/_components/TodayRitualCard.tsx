'use client';

import { SyncDropCountdown } from '@/components/couple/SyncDropCountdown';
import { CouchMode } from '@/components/couple/CouchMode';
import { RitualCard } from '@/components/couple/RitualCard';
import { RevealCard } from '@/components/couple/RevealCard';
import { ResonanceCircle } from '@/components/couple/ResonanceCircle';
import { ProtocolWizard } from '@/components/couple/ProtocolWizard';
import { Icon } from '@/components/Icon';
import { AnalysisData } from '../_hooks/useCoupleDashboard';
import { useCoupleData, useDashboardActions, useDashboardUIState, useDashboardUISetters } from '../_hooks/useCoupleDashboardContext';
import { MoodForm } from './MoodForm';
import { AnswerForm } from './AnswerForm';

export function TodayRitualCard() {
  const { couple, todayQuestion, isUser1, partnerName, myName, hasMyAnswer, hasPartnerAnswer, bothAnswered, hasMyMood } = useCoupleData();
  const {
    submitting,
    submitted,
    isCouchMode,
    showProtocol,
    selectedQuestion,
    revealAnimation,
  } = useDashboardUIState();
  const { setAnswer, setIsCouchMode, setShowProtocol, setSelectedQuestion } = useDashboardUISetters();
  const { submitAnswer, submitCouchAnswers, skipQuestion, triggerReveal, revealNow } = useDashboardActions();

  const questionText = todayQuestion?.question?.text ?? todayQuestion?.customText ?? 'Aucune question aujourd\'hui';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Today&apos;s Question Card */}
      <div className="couple-card couple-card-premium">
        {isCouchMode ? (
          <CouchMode
            questionText={questionText}
            submitting={submitting}
            onSubmit={submitCouchAnswers}
            onCancel={() => {
              setIsCouchMode(false);
              setAnswer('');
            }}
            partnerAName={myName}
            partnerBName={partnerName}
          />
        ) : (
          <>
            <div className="couple-label">Question du jour</div>

            <div className="question-display">
              <p className="question-text">{questionText}</p>
            </div>

            {/* Mood Phase: Pick daily weather first */}
            {!hasMyAnswer && !submitted && todayQuestion && !hasMyMood && (
              <MoodForm />
            )}

            {/* Answer Phase: themed ritual card or legacy answer form */}
            {!hasMyAnswer && !submitted && todayQuestion && hasMyMood && todayQuestion.theme && (
              <RitualCard
                id={todayQuestion.id}
                theme={todayQuestion.theme}
                questionText={questionText}
                intensity={todayQuestion.intensity}
                hasAnswered={hasMyAnswer}
                partnerHasAnswered={hasPartnerAnswer}
                onSubmit={submitAnswer}
                onSkip={skipQuestion}
                disabled={submitting}
              />
            )}

            {!hasMyAnswer && !submitted && todayQuestion && hasMyMood && !todayQuestion.theme && (
              <AnswerForm />
            )}

            {/* Submitted: Waiting for partner */}
            {(hasMyAnswer || submitted) && !bothAnswered && (
              <SyncDropCountdown
                targetHour={20}
                isReady={false}
                partnerName={partnerName}
                onRevealTime={triggerReveal}
              />
            )}

            {/* Both answered but sealed */}
            {bothAnswered && !todayQuestion?.isRevealed && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                  <Icon name="lock" className="w-4 h-4" />
                  Vos réponses sont scellées
                </div>
                <p className="text-sm text-slate-400">
                  Vous avez tous les deux répondu. Révélez votre résonance quand vous le souhaitez.
                </p>
                <button
                  className="couple-action-btn"
                  onClick={revealNow}
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 100%)',
                    borderColor: 'transparent',
                  }}
                >
                  {submitting ? (
                    <span className="couple-spinner" style={{ margin: '0 auto' }} />
                  ) : (
                    <>
                      <Icon name="sparkles" className="w-4 h-4" />
                      Révéler maintenant
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Revealed: Show ritual reveal card (themed, score hidden) */}
            {todayQuestion?.isRevealed && todayQuestion.theme && (
              <RevealCard
                theme={todayQuestion.theme}
                questionText={questionText}
                myAnswer={isUser1 ? todayQuestion.user1Answer ?? '' : todayQuestion.user2Answer ?? ''}
                partnerAnswer={isUser1 ? todayQuestion.user2Answer ?? '' : todayQuestion.user1Answer ?? ''}
                myName="Vous"
                partnerName={partnerName}
                therapistGuide={todayQuestion.therapistGuide}
                ritualAction={todayQuestion.ritualAction}
              />
            )}

            {/* Revealed: Legacy resonance view (kept for non-ritual questions) */}
            {todayQuestion?.isRevealed && !todayQuestion.theme && todayQuestion.analysisJson && (
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
                  color: '#f1f5f9',
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
            partnerAName={myName}
            partnerBName={partnerName}
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
  );
}
