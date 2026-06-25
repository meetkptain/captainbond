'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // The client-side Supabase client automatically handles the OAuth code exchange
    // and saves the session to localStorage. Once done, we redirect to the dashboard or home.
    const next = searchParams.get('next') ?? '/';
    
    // We give a small delay to ensure Supabase client processes the token
    const timer = setTimeout(() => {
      router.replace(next);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Connexion en cours</h3>
          <p className="text-xs text-slate-400 font-medium">Finalisation de la liaison de votre compte...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
