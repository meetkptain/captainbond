'use client';

import { Suspense } from 'react';
import { DashboardContent } from '@/app/room/[code]/dashboard/page';

export default function FrenchDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
        </div>
      }
    >
      <DashboardContent defaultLang="fr" />
    </Suspense>
  );
}
