'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function MobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur transition-all duration-300 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <p className="font-semibold text-white">Try Captain Bond free</p>
          <p className="text-xs text-slate-400">3 free cards, no app needed</p>
        </div>
        <Link
          href="/party"
          className="inline-flex items-center gap-1 rounded-lg bg-neon-purple px-4 py-2 text-sm font-bold text-white hover:bg-neon-purple/90 transition-colors active:scale-95"
        >
          Start
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
