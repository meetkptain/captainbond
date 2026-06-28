'use client';

import React, { useState, useEffect } from 'react';

export function SoireeVisualMockup() {
  const [lang, setLang] = useState<'fr' | 'en'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/8] bg-[#0a0f1e] rounded-3xl border border-white/10 p-6 md:p-10 overflow-hidden">
      {/* TV Screen */}
      <div className="absolute inset-4 md:inset-8 bg-[#020617] rounded-2xl border border-white/10 flex flex-col">
        {/* TV header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Table ABC1
          </span>
        </div>

        {/* TV content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-lg md:text-2xl font-black text-white leading-tight">
              {lang === 'fr' 
                ? 'Quel est le souvenir à deux qui vous fait encore sourire ?' 
                : 'What memory of the two of you still makes you smile?'}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-white/50 font-mono">
              <span>Mode Deep Connection</span>
            </div>
          </div>
        </div>

        {/* QR Code corner */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col items-center gap-2">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg p-2">
            <div className="w-full h-full grid grid-cols-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-[1px] ${
                    [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 23, 24].includes(i)
                      ? 'bg-[#020617]'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-[9px] font-mono text-white/40 uppercase">
            {lang === 'fr' ? 'Scan pour rejoindre' : 'Scan to join'}
          </span>
        </div>
      </div>

      {/* Phone 1 */}
      <div className="absolute -bottom-2 -left-2 md:bottom-4 md:left-4 w-16 md:w-24 bg-[#0f1525] rounded-[1.25rem] border border-white/10 p-1.5 shadow-xl rotate-[-6deg]">
        <div className="w-full aspect-[9/19] bg-[#020617] rounded-[0.875rem] overflow-hidden flex flex-col">
          <div className="h-4 border-b border-white/5 flex items-center justify-center">
            <div className="w-6 h-1 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 p-2 flex flex-col justify-center gap-1.5">
            <div className="h-1.5 w-3/4 bg-white/10 rounded" />
            <div className="h-6 bg-white/5 rounded-lg" />
            <div className="h-6 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Phone 2 */}
      <div className="absolute -top-2 -right-2 md:top-4 md:right-8 w-16 md:w-24 bg-[#0f1525] rounded-[1.25rem] border border-white/10 p-1.5 shadow-xl rotate-[6deg]">
        <div className="w-full aspect-[9/19] bg-[#020617] rounded-[0.875rem] overflow-hidden flex flex-col">
          <div className="h-4 border-b border-white/5 flex items-center justify-center">
            <div className="w-6 h-1 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 p-2 flex flex-col justify-center gap-1.5">
            <div className="h-1.5 w-2/3 bg-white/10 rounded" />
            <div className="h-6 bg-white/5 rounded-lg" />
            <div className="h-6 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Phone 3 */}
      <div className="absolute bottom-0 right-8 md:bottom-8 md:right-16 w-14 md:w-20 bg-[#0f1525] rounded-[1rem] border border-white/10 p-1 shadow-xl rotate-[3deg]">
        <div className="w-full aspect-[9/19] bg-[#020617] rounded-[0.75rem] overflow-hidden flex flex-col">
          <div className="h-3 border-b border-white/5 flex items-center justify-center">
            <div className="w-4 h-0.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 p-1.5 flex flex-col justify-center gap-1">
            <div className="h-1 w-3/4 bg-white/10 rounded" />
            <div className="h-4 bg-white/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
