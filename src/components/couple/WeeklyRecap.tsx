'use client';

import React from 'react';
import { ThemeLabel } from './ThemeLabel';

export interface WeeklyRecapProps {
  theme: string;
  answeredCount: number;
  totalCount: number;
  className?: string;
}

export function WeeklyRecap({ theme, answeredCount, totalCount, className = '' }: WeeklyRecapProps) {
  const allAnswered = answeredCount >= totalCount;

  return (
    <div className={`couple-card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="couple-label">Cette semaine</div>
        <ThemeLabel theme={theme} />
      </div>

      <p className="text-slate-200 text-sm leading-relaxed mb-3">
        Vous avez exploré le thème <strong>{theme.toLowerCase().replace('_', ' ')}</strong> ensemble.
      </p>

      <div
        className="rounded-xl p-3 text-sm"
        style={{
          background: allAnswered ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
          border: allAnswered ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.08)',
          color: allAnswered ? '#34d399' : '#94a3b8',
        }}
      >
        {allAnswered
          ? `Vous avez partagé ${answeredCount} sur ${totalCount} rituels cette semaine. Un beau moment de reconnexion.`
          : `Vous avez partagé ${answeredCount} sur ${totalCount} rituels cette semaine. Chaque échange compte.`}
      </div>
    </div>
  );
}
