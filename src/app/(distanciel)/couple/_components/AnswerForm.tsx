'use client';

import { Icon } from '@/components/Icon';
import { useCoupleData, useDashboardActions, useDashboardUIState, useDashboardUISetters } from '../_hooks/useCoupleDashboardContext';

export function AnswerForm() {
  const { todayQuestion } = useCoupleData();
  const { answer, submitting } = useDashboardUIState();
  const { setAnswer, setIsCouchMode } = useDashboardUISetters();
  const { submitAnswer, skipQuestion, toggleSafeZone } = useDashboardActions();

  const question = todayQuestion;
  if (!question) return null;

  const handleCouchMode = () => {
    setIsCouchMode(true);
    setAnswer('');
  };

  return (
    <div className="answer-area">
      {!!question.isSafeZoneActive && (
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
          onClick={() => submitAnswer()}
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
          onClick={handleCouchMode}
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
            onClick={() => toggleSafeZone(!question.isSafeZoneActive)}
            style={{
              background: 'transparent',
              border: question.isSafeZoneActive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(251, 191, 36, 0.25)',
              color: question.isSafeZoneActive ? '#ef4444' : '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 600,
              minHeight: '44px',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <Icon name="alert" className="w-3.5 h-3.5 inline mr-1 align-middle" />
            {question.isSafeZoneActive ? "Couper Safe Zone" : "Safe Zone (Pause)"}
          </button>

          <button
            type="button"
            onClick={skipQuestion}
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
  );
}
