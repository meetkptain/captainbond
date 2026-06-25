'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LandingLayoutProps {
  children: React.ReactNode;
  variant?: 'soiree' | 'couple' | 'corporate';
}

export function LandingLayout({ children, variant = 'soiree' }: LandingLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <header className="w-full border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-white hover:text-white/90 transition-colors cursor-pointer"
          >
            CAPTAIN BOND
          </Link>

          <nav className="flex items-center gap-6">
            {variant === 'soiree' && (
              <>
                <Link
                  href="/couple"
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Espace Couple
                </Link>
                <Link
                  href="/corporate"
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Team Building
                </Link>
                <Link
                  href="/vault"
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Coffre Privé
                </Link>
                <Link
                  href="/privacy"
                  className="text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Confidentialité
                </Link>
              </>
            )}

            {variant === 'couple' && (
              <button
                onClick={() => router.push('/')}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                ← Retour Soirée
              </button>
            )}

            {variant === 'corporate' && (
              <button
                onClick={() => router.push('/')}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                ← Retour
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-mono text-white/40">
            CAPTAIN BOND © 2026 — Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
