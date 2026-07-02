'use client';

import { CoupleDashboardProvider } from './_hooks/useCoupleDashboardContext';
import { CoupleDashboardView } from './_components/CoupleDashboardView';
import './couple.css';

export default function CoupleDashboard({ defaultLang = 'en' }: { defaultLang?: 'fr' | 'en' }) {
  return (
    <CoupleDashboardProvider>
      <CoupleDashboardView defaultLang={defaultLang} />
    </CoupleDashboardProvider>
  );
}
