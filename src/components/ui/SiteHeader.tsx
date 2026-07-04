'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: { en: 'Blog', fr: 'Blog' }, href: '/blog' },
  { label: { en: 'Party', fr: 'Soirée' }, href: '/party' },
  { label: { en: 'Couple', fr: 'Couple' }, href: '/couple' },
  { label: { en: 'Pro', fr: 'Pro' }, href: '/pro' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isFr = window.location.pathname.startsWith('/fr');
    setLang(isFr ? 'fr' : 'en');
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-black tracking-tight text-white">CAPTAIN BOND</span>
          <div className="h-6 w-12" />
        </div>
      </header>
    );
  }

  const localizedHref = (path: string) => (lang === 'fr' ? `/fr${path}` : path);

  const enPath = () => {
    const p = window.location.pathname;
    if (p === '/fr') return '/';
    if (p.startsWith('/fr/')) return p.replace('/fr', '');
    return p || '/';
  };

  const frPath = () => {
    const p = window.location.pathname;
    if (p === '/') return '/fr';
    if (p.startsWith('/fr')) return p;
    return `/fr${p}`;
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={localizedHref('/')}
          className="text-lg font-black tracking-tight text-white hover:text-white/90 transition-colors"
        >
          CAPTAIN BOND
        </Link>

        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = pathname === localizedHref(link.href) || pathname.startsWith(localizedHref(link.href) + '/');
            return (
              <Link
                key={link.href}
                href={localizedHref(link.href)}
                className={`px-3 py-3 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple ${
                  isActive ? 'text-amber-400 font-bold' : 'text-white/70 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label[lang]}
              </Link>
            );
          })}

          <div className="flex items-center gap-2 border-l border-white/10 ml-3 pl-3">
            <LanguageToggle lang={lang} enPath={enPath()} frPath={frPath()} />
          </div>
        </nav>

        <button
          className="md:hidden p-2 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur">
          <nav className="flex flex-col px-4 py-3 space-y-1" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === localizedHref(link.href) || pathname.startsWith(localizedHref(link.href) + '/');
              return (
                <Link
                  key={link.href}
                  href={localizedHref(link.href)}
                  onClick={closeMenu}
                  className={`px-3 py-3 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple ${
                    isActive ? 'text-amber-400 font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label[lang]}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 pt-3 pb-2 border-t border-white/10 mt-2">
              <LanguageToggle lang={lang} enPath={enPath()} frPath={frPath()} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LanguageToggle({ lang, enPath, frPath }: { lang: 'fr' | 'en'; enPath: string; frPath: string }) {
  return (
    <>
      {lang === 'fr' ? (
        <>
          <span className="text-sm font-bold text-amber-400" aria-current="true">FR</span>
          <span className="text-white/20 text-xs">|</span>
          <a
            href={enPath}
            hrefLang="en"
            className="text-sm font-medium text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple rounded-sm"
          >
            EN
          </a>
        </>
      ) : (
        <>
          <a
            href={frPath}
            hrefLang="fr"
            className="text-sm font-medium text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple rounded-sm"
          >
            FR
          </a>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-sm font-bold text-amber-400" aria-current="true">EN</span>
        </>
      )}
    </>
  );
}
