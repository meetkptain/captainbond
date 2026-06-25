'use client';

import React from 'react';
import { BADGE_DEFINITIONS } from '@/services/statsService';

interface BadgeTrayProps {
  badges: string[];
  archetypes: string[];
}

export function BadgeTray({ badges, archetypes }: BadgeTrayProps) {
  const earned = badges
    .map((id) => BADGE_DEFINITIONS[id])
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {archetypes.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Archétypes débloqués</h3>
          <div className="flex flex-wrap gap-2">
            {archetypes.map((slug) => (
              <span
                key={slug}
                className="px-3 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-sm font-bold"
              >
                {slug.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Badges</h3>
        {earned.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Jouez une partie pour débloquer votre premier badge.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {earned.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
              >
                <span className="text-2xl">{badge.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{badge.name}</p>
                  <p className="text-xs text-slate-400">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
