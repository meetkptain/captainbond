'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

const TESTIMONIALS = [
  {
    name: 'Lucie',
    age: '28 ans',
    text: 'On a ri toute la soirée. Le mode Imposteur a tout changé, on s’est découvert des talents de menteur.',
    mode: 'Imposteur',
  },
  {
    name: 'Thomas',
    age: '31 ans',
    text: 'Parfait pour un apéro entre amis. En 2 minutes tout le monde a compris comment jouer.',
    mode: 'Icebreaker',
  },
  {
    name: 'Inès & Max',
    age: 'Couple',
    text: 'La soirée Date Night était vraiment différente. On a parlé de choses qu’on n’oserait jamais aborder autrement.',
    mode: 'Date Night',
  },
];

export function Testimonials() {
  const [recentRoom, setRecentRoom] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ totalRooms: number }>('/api/public/stats')
      .then((data) => {
        if (data.totalRooms > 0) {
          setRecentRoom(`${data.totalRooms.toLocaleString('fr-FR')} soirées créées`);
        }
      })
      .catch(() => setRecentRoom(null));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {recentRoom && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {recentRoom} · nouvelle partie toutes les quelques minutes
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-sm font-bold text-white">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.age}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">“{t.text}”</p>
            <span className="text-[10px] font-mono text-neon-purple uppercase tracking-wider">Mode {t.mode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
