'use client';

import { useState } from 'react';

interface CouchModeProps {
  questionText: string;
  submitting: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: (answerA: string, answerB: string) => Promise<void>;
  onCancel: () => void;
  partnerAName?: string;
  partnerBName?: string;
}

export function CouchMode({
  questionText,
  submitting,
  onSubmit,
  onCancel,
  partnerAName = 'Partenaire A',
  partnerBName = 'Partenaire B'
}: CouchModeProps) {
  const [step, setStep] = useState<'intro' | 'partnerA' | 'transition' | 'partnerB'>('intro');
  const [answerA, setAnswerA] = useState('');
  const [, setAnswerB] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleNextToTransition = () => {
    if (!currentAnswer.trim()) return;
    setAnswerA(currentAnswer.trim());
    setCurrentAnswer('');
    setStep('transition');
  };

  const handleStartPartnerB = () => {
    setStep('partnerB');
  };

  const handleFinalSubmit = async () => {
    if (!currentAnswer.trim() || !answerA.trim()) return;
    const finalAnswerB = currentAnswer.trim();
    setAnswerB(finalAnswerB);
    await onSubmit(answerA, finalAnswerB);
  };

  return (
    <div className="couch-mode-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      width: '100%',
      animation: 'reveal-entrance 0.5s ease-out forwards'
    }}>
      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem'
        }}>
          <span>📱</span> COUCH MODE (ÉCRAN PARTAGÉ)
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          disabled={submitting}
        >
          Annuler
        </button>
      </div>

      {step === 'intro' && (
        <div className="couch-step-card" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '3rem' }}>🤝</span>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f1f5f9' }}>Jouer sur le même téléphone</h3>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(148, 163, 184, 0.7)', lineHeight: 1.5, maxWidth: '20rem' }}>
            Répondez à tour de rôle à la question du jour en vous passant l&apos;appareil. Les réponses restent masquées jusqu&apos;à la révélation.
          </p>
          <button
            onClick={() => setStep('partnerA')}
            className="answer-submit"
            style={{ width: '100%', marginTop: '0.5rem', alignSelf: 'center' }}
          >
            Commencer ➔
          </button>
        </div>
      )}

      {step === 'partnerA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'rgba(244, 63, 94, 0.03)',
            border: '1px solid rgba(244, 63, 94, 0.1)',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '0.8125rem',
            color: '#fda4af',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            👤 Tour de {partnerAName} • Ne regarde pas, {partnerBName} ! 🤫
          </div>

          <div className="question-display">
            <p className="question-text">{questionText}</p>
          </div>

          <textarea
            className="answer-textarea"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={`Écris ta réponse sincère ici, ${partnerAName}...`}
            maxLength={2000}
            disabled={submitting}
          />

          <button
            className="answer-submit"
            onClick={handleNextToTransition}
            disabled={!currentAnswer.trim() || submitting}
            style={{ width: '100%' }}
          >
            Valider & Masquer ma réponse 🔐
          </button>
        </div>
      )}

      {step === 'transition' && (
        <div className="couch-step-card" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '1.25rem',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            animation: 'sealed-float 3s ease-in-out infinite'
          }}>
            🔄
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              Passe le téléphone à {partnerBName}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(148, 163, 184, 0.7)', lineHeight: 1.5 }}>
              La réponse de {partnerAName} a été chiffrée et mise en sécurité.
            </p>
          </div>
          <button
            onClick={handleStartPartnerB}
            className="answer-submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--couple-sky, #38bdf8), var(--couple-purple, #8b5cf6))'
            }}
          >
            Je suis {partnerBName} ➔
          </button>
        </div>
      )}

      {step === 'partnerB' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.03)',
            border: '1px solid rgba(56, 189, 248, 0.1)',
            borderRadius: '1rem',
            padding: '1rem',
            fontSize: '0.8125rem',
            color: '#bae6fd',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            👤 Tour de {partnerBName} • La réponse de {partnerAName} est scellée 🔒
          </div>

          <div className="question-display">
            <p className="question-text">{questionText}</p>
          </div>

          <textarea
            className="answer-textarea"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={`Écris ta réponse sincère ici, ${partnerBName}...`}
            maxLength={2000}
            disabled={submitting}
          />

          <button
            className="answer-submit"
            onClick={handleFinalSubmit}
            disabled={!currentAnswer.trim() || submitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--couple-rose) 0%, var(--couple-amber) 100%)'
            }}
          >
            {submitting ? (
              <span className="couple-spinner" style={{ margin: '0 auto' }} />
            ) : (
              'Sceller nos deux réponses 🔐'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
