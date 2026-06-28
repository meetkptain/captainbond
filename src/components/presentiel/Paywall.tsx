'use client';

import { useState, useEffect } from 'react';
import { UnlockPanel } from '@/components/UnlockPanel';
import { Icon } from '@/components/Icon';
import type { Pack } from '@/lib/monetization/catalog';
import { api } from '@/lib/api/client';
import { capture, AnalyticsEvents } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n';

interface PaywallProps {
  roomCode: string;
  hostId: string;
  onExit: () => void;
}

export function Paywall({ roomCode, hostId, onExit }: PaywallProps) {
  const [availablePacks, setAvailablePacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    capture(AnalyticsEvents.PAYWALL_SHOWN, { roomCode, hostId });
  }, [roomCode, hostId]);

  useEffect(() => {
    async function loadPacks() {
      try {
        const packs = await api.get<Pack[]>('/api/packs');
        setAvailablePacks(packs);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(t('paywall_error'));
        setLoading(false);
      }
    }
    loadPacks();
  }, [t]);

  return (
    <div className="flex flex-col items-center justify-between gap-6 p-6 max-w-lg mx-auto min-h-[520px] text-slate-100 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl text-center">
      <div className="flex flex-col items-center gap-4 mt-4 w-full">
        <div className="flex justify-center">
          <Icon name="sprout" className="w-14 h-14 text-amber-400" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          {t('paywall_title')}
        </h2>
        <p className="text-sm text-slate-400 max-w-sm px-4">
          {t('paywall_desc')}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-500/20 px-4 py-2 rounded-xl">
          {error}
        </p>
      ) : (
        <div className="w-full">
          <UnlockPanel
            roomCode={roomCode}
            playerId={hostId}
            packs={availablePacks}
            freeQuestionsUsed={3}
            freeQuestionsLimit={3}
            successUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomCode}`}
            cancelUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomCode}`}
            onCheckoutError={(msg) => setError(msg)}
          />
        </div>
      )}

      <button
        onClick={onExit}
        className="text-xs text-slate-500 hover:text-slate-400 font-semibold cursor-pointer hover:underline border-none bg-transparent"
      >
        {t('paywall_exit')}
      </button>
    </div>
  );
}
