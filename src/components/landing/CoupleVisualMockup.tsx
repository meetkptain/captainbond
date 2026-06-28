'use client';

import React, { useState, useEffect } from 'react';

function PhoneMockup({
  title,
  children,
  variant = 'left',
}: {
  title: string;
  children: React.ReactNode;
  variant?: 'left' | 'right';
}) {
  return (
    <div
      className={`w-28 md:w-40 bg-[#0f1525] rounded-[1.5rem] border border-white/10 p-2 shadow-xl ${
        variant === 'left' ? 'rotate-[-4deg]' : 'rotate-[4deg]'
      }`}
    >
      <div className="w-full aspect-[9/19] bg-[#020617] rounded-[1.125rem] overflow-hidden flex flex-col">
        <div className="h-5 border-b border-white/5 flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-white/10" />
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <div className="text-[8px] md:text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
            {title}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function CoupleVisualMockup() {
  const [lang, setLang] = useState<'fr' | 'en'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/7] bg-[#0a0f1e] rounded-3xl border border-white/10 flex items-center justify-center gap-4 md:gap-8 overflow-hidden">
      <PhoneMockup title={lang === 'fr' ? "Partenaire A" : "Partner A"} variant="left">
        <div className="space-y-2">
          <div className="h-1.5 w-3/4 bg-white/10 rounded" />
          <div className="h-1.5 w-1/2 bg-white/10 rounded" />
          <div className="mt-3 h-16 bg-white/5 rounded-lg border border-white/10" />
        </div>
      </PhoneMockup>

      <div className="hidden md:flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
          {lang === 'fr' ? "Synchro 20h" : "Sync 8pm"}
        </span>
      </div>

      <PhoneMockup title={lang === 'fr' ? "Partenaire B" : "Partner B"} variant="right">
        <div className="space-y-2">
          <div className="h-1.5 w-3/4 bg-white/10 rounded" />
          <div className="h-1.5 w-1/2 bg-white/10 rounded" />
          <div className="mt-3 h-16 bg-white/5 rounded-lg border border-white/10" />
        </div>
      </PhoneMockup>
    </div>
  );
}
