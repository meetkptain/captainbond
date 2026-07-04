'use client';

import { useState } from 'react';
import { ThemeLabel } from './ThemeLabel';

export interface RitualCardProps {
  id: string;
  theme: string;
  questionText: string;
  intensity?: number;
  hasAnswered: boolean;
  partnerHasAnswered: boolean;
  onSubmit: (answer: string) => void | Promise<void>;
  onSkip: () => void | Promise<void>;
  disabled?: boolean;
}

export function RitualCard({
  theme,
  questionText,
  hasAnswered,
  partnerHasAnswered,
  onSubmit,
  onSkip,
  disabled = false,
}: RitualCardProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setAnswer('');
    } finally {
      setSubmitting(false);
    }
  };

  if (hasAnswered) {
    return (
      <div className="couple-card couple-card-premium">
        <div className="flex items-center justify-between mb-4">
          <ThemeLabel theme={theme} />
          <span className="text-xs text-slate-400">
            {partnerHasAnswered ? 'Votre partenaire a répondu' : 'En attente de votre partenaire'}
          </span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          Votre réponse est scellée. La révélation aura lieu à 20h.
        </p>
      </div>
    );
  }

  return (
    <div className="couple-card couple-card-premium">
      <div className="flex items-center justify-between mb-4">
        <ThemeLabel theme={theme} />
        {partnerHasAnswered && (
          <span className="text-xs text-emerald-400">Votre partenaire a déjà répondu</span>
        )}
      </div>

      <div className="question-display mb-4">
        <p className="question-text">{questionText}</p>
      </div>

      <textarea
        className="answer-textarea"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Écrivez votre réponse en toute sincérité… Votre partenaire ne la verra qu'à 20h."
        maxLength={2000}
        disabled={disabled || submitting}
      />

      <div className="flex flex-col gap-3 mt-4">
        <button
          className="answer-submit"
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting || disabled}
        >
          {submitting ? (
            <span className="couple-spinner" />
          ) : (
            <>Sceller ma réponse</>
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={disabled || submitting}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            minHeight: '44px',
          }}
        >
          Pas aujourd&apos;hui — passer cette question
        </button>
      </div>
    </div>
  );
}
