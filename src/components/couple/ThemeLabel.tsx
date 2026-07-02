'use client';

import React from 'react';

interface ThemeLabelProps {
  theme: string;
  className?: string;
}

const THEME_LABELS: Record<string, { fr: string; en: string; color: string }> = {
  RECONNECTION: {
    fr: 'Reconnexion',
    en: 'Reconnection',
    color: '#818cf8', // indigo-400
  },
  COMMUNICATION: {
    fr: 'Communication',
    en: 'Communication',
    color: '#34d399', // emerald-400
  },
  INTIMACY: {
    fr: 'Intimité',
    en: 'Intimacy',
    color: '#f472b6', // pink-400
  },
  SHARED_PROJECT: {
    fr: 'Projet commun',
    en: 'Shared project',
    color: '#fbbf24', // amber-400
  },
};

export function ThemeLabel({ theme, className = '' }: ThemeLabelProps) {
  const config = THEME_LABELS[theme] ?? { fr: theme, en: theme, color: '#94a3b8' };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${className}`}
      style={{
        background: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      {config.fr}
    </span>
  );
}
