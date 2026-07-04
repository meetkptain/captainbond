'use client';

import { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/ui/SiteHeader';

interface LandingLayoutProps {
  children: React.ReactNode;
  variant?: string;
}

const dict = {
  fr: { rights: "CAPTAIN BOND © 2026 — Tous droits réservés." },
  en: { rights: "CAPTAIN BOND © 2026 — All rights reserved." }
};

export function LandingLayout({ children }: LandingLayoutProps) {
  const [lang, setLang] = useState<'fr' | 'en'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = dict[lang];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#020617] text-white">
      <SiteHeader />
      <main>{children}</main>
      <footer className="w-full border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-mono text-white/40">{t.rights}</p>
        </div>
      </footer>
    </div>
  );
}
