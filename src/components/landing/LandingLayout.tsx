'use client';

import { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/ui/SiteHeader';

interface LandingLayoutProps {
  children: React.ReactNode;
  variant?: string;
}

const dict = {
  fr: { rights: "CAPTAIN BOND © 2026 — Tous droits réservés.", social: "Nous suivre" },
  en: { rights: "CAPTAIN BOND © 2026 — All rights reserved.", social: "Follow us" }
};

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/captainbond.app', icon: '📷' },
  { label: 'TikTok', href: 'https://tiktok.com/@captainbond', icon: '🎵' },
  { label: 'YouTube', href: 'https://youtube.com/@captainbond', icon: '▶️' },
  { label: 'X', href: 'https://x.com/captainbond_app', icon: '𝕏' },
];

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
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs font-mono text-white/40 text-center">{t.rights}</p>
        </div>
      </footer>
    </div>
  );
}
