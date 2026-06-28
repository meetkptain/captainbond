'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LandingLayoutProps {
  children: React.ReactNode;
  variant?: 'soiree' | 'couple' | 'corporate';
}

const dict = {
  fr: {
    couple: "Espace Couple",
    teamBuilding: "Team Building",
    vault: "Coffre Privé",
    privacy: "Confidentialité",
    backParty: "← Retour Soirée",
    back: "← Retour",
    rights: "CAPTAIN BOND © 2026 — Tous droits réservés."
  },
  en: {
    couple: "Couple Space",
    teamBuilding: "Team Building",
    vault: "Secret Vault",
    privacy: "Privacy Policy",
    backParty: "← Back to Party",
    back: "← Back",
    rights: "CAPTAIN BOND © 2026 — All rights reserved."
  }
};

export function LandingLayout({ children, variant = 'soiree' }: LandingLayoutProps) {
  const router = useRouter();
  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const isFr = window.location.pathname.startsWith('/fr');
      setLang(isFr ? 'fr' : 'en');
    }
  }, []);

  const t = dict[lang];

  const getLocalizedPath = (path: string) => {
    return lang === 'fr' ? `/fr${path}` : path;
  };

  const getEnglishEquivalentPath = () => {
    if (currentPath === '/fr') return '/';
    if (currentPath.startsWith('/fr/')) return currentPath.replace('/fr', '');
    return currentPath || '/';
  };

  const getFrenchEquivalentPath = () => {
    if (currentPath === '/') return '/fr';
    if (currentPath.startsWith('/fr')) return currentPath;
    return `/fr${currentPath}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <header className="w-full border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link
            href={getLocalizedPath('/')}
            className="text-xl font-black tracking-tight text-white hover:text-white/90 transition-colors cursor-pointer"
          >
            CAPTAIN BOND
          </Link>

          <nav className="flex items-center gap-6">
            {variant === 'soiree' && (
              <>
                <Link
                  href={getLocalizedPath('/couple')}
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {t.couple}
                </Link>
                <Link
                  href={getLocalizedPath('/corporate')}
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {t.teamBuilding}
                </Link>
                <Link
                  href={getLocalizedPath('/vault')}
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {t.vault}
                </Link>
                <Link
                  href={getLocalizedPath('/privacy')}
                  className="text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  {t.privacy}
                </Link>
              </>
            )}

            {variant === 'couple' && (
              <button
                onClick={() => router.push(getLocalizedPath('/'))}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                {t.backParty}
              </button>
            )}

            {variant === 'corporate' && (
              <button
                onClick={() => router.push(getLocalizedPath('/'))}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                {t.back}
              </button>
            )}

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              {lang === 'fr' ? (
                <>
                  <span className="text-xs font-black text-amber-400">FR</span>
                  <span className="text-white/20 text-xs">|</span>
                  <a
                    href={getEnglishEquivalentPath()}
                    hrefLang="en"
                    className="text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    EN
                  </a>
                </>
              ) : (
                <>
                  <a
                    href={getFrenchEquivalentPath()}
                    hrefLang="fr"
                    className="text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    FR
                  </a>
                  <span className="text-white/20 text-xs">|</span>
                  <span className="text-xs font-black text-amber-400">EN</span>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-mono text-white/40">
            {t.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
