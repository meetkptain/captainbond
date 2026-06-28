'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

const TESTIMONIALS_DICT = {
  fr: [
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
  ],
  en: [
    {
      name: 'Lucy',
      age: '28 y/o',
      text: 'We laughed all night long. The Imposter mode changed everything, we found out we were great liars.',
      mode: 'Imposter',
    },
    {
      name: 'Thomas',
      age: '31 y/o',
      text: 'Perfect for pre-drinks with friends. Everyone got how to play in under 2 minutes.',
      mode: 'Icebreaker',
    },
    {
      name: 'Ines & Max',
      age: 'Couple',
      text: 'The Date Night session was truly different. We talked about things we would never dare bring up otherwise.',
      mode: 'Date Night',
    },
  ]
};

export function Testimonials({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  const [lang, setLang] = useState<'fr' | 'en'>(defaultLang);
  const [recentRoom, setRecentRoom] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  useEffect(() => {
    api.get<{ totalRooms: number }>('/api/public/stats')
      .then((data) => {
        if (data.totalRooms > 0) {
          const suffix = lang === 'fr' 
            ? `${data.totalRooms.toLocaleString('fr-FR')} soirées créées · nouvelle partie toutes les quelques minutes`
            : `${data.totalRooms.toLocaleString('en-US')} games created · new game every few minutes`;
          setRecentRoom(suffix);
        }
      })
      .catch(() => setRecentRoom(null));
  }, [lang]);

  const tList = TESTIMONIALS_DICT[lang];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {recentRoom && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {recentRoom}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tList.map((t) => (
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
            <span className="text-[10px] font-mono text-neon-purple uppercase tracking-wider">
              {lang === 'fr' ? 'Mode' : 'Mode'} {t.mode}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
