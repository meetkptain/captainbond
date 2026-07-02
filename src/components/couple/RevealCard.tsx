'use client';

import React from 'react';
import { ThemeLabel } from './ThemeLabel';

export interface RevealCardProps {
  theme: string;
  questionText: string;
  myAnswer: string;
  partnerAnswer: string;
  myName?: string;
  partnerName?: string;
  therapistGuide?: string | null;
  ritualAction?: string | null;
}

export function RevealCard({
  theme,
  questionText,
  myAnswer,
  partnerAnswer,
  myName = 'Vous',
  partnerName = 'Votre partenaire',
  therapistGuide,
  ritualAction,
}: RevealCardProps) {
  return (
    <div className="couple-card couple-card-premium">
      <div className="mb-4">
        <ThemeLabel theme={theme} />
      </div>

      <div className="question-display mb-6">
        <p className="question-text">{questionText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs font-semibold text-slate-400 mb-2">{myName}</div>
          <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{myAnswer}</p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs font-semibold text-slate-400 mb-2">{partnerName}</div>
          <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{partnerAnswer}</p>
        </div>
      </div>

      {therapistGuide && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <div className="text-xs font-semibold text-purple-300 mb-2">3 minutes ensemble</div>
          <p className="text-slate-200 text-sm leading-relaxed">{therapistGuide}</p>
        </div>
      )}

      {ritualAction && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
        >
          <div className="text-xs font-semibold text-emerald-300 mb-2">Micro-rituel (optionnel)</div>
          <p className="text-slate-200 text-sm leading-relaxed">{ritualAction}</p>
        </div>
      )}
    </div>
  );
}
