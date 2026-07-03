'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface PushConsentBannerProps {
  onEnable: () => Promise<void>;
  onDismiss: () => void;
}

/**
 * Bannière de consentement pour les push notifications.
 * S'affiche après le 2ème rituel complété pour ne pas brusquer l'utilisateur.
 */
export function PushConsentBanner({ onEnable, onDismiss }: PushConsentBannerProps) {
  const [enabling, setEnabling] = useState(false);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await onEnable();
    } finally {
      setEnabling(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(99, 102, 241, 0.08)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      borderRadius: '0.75rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon name="sparkles" className="w-4 h-4 text-indigo-400" />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe' }}>
          Ne manquez plus votre rituel
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
        Recevez une notification quand votre question du jour est disponible et à l&apos;heure de révéler.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleEnable}
          disabled={enabling}
          style={{
            flex: 1,
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#c7d2fe',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          {enabling ? 'Activation...' : 'Activer'}
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#64748b',
            fontSize: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

/**
 * Hook pour gérer le consentement push.
 * Vérifie si l'utilisateur a déjà donné son consentement et gère l'abonnement.
 */
export function usePushConsent(userId: string | null, completedRituals: number) {
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('push_consent');
    if (consent === 'granted') {
      setHasConsent(true);
      return;
    }

    if (completedRituals >= 2 && !consent) {
      setShowBanner(true);
    }
  }, [completedRituals]);

  const enablePush = async () => {
    if (!userId) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await fetch('/api/couple/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
        timezone,
      }),
    });

    localStorage.setItem('push_consent', 'granted');
    setHasConsent(true);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    localStorage.setItem('push_consent', 'dismissed');
    setShowBanner(false);
  };

  return { showBanner, hasConsent, enablePush, dismissBanner };
}
