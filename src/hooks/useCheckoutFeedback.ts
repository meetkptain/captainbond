'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

export type CheckoutProduct = 'pass' | 'profile';

export interface UseCheckoutFeedbackOptions {
  roomCode: string;
  playerId: string | null;
  refreshEntitlements: () => Promise<void>;
  onPaid?: (product: CheckoutProduct) => void;
  paidProduct?: CheckoutProduct | null;
}

export interface UseCheckoutFeedbackResult {
  paidMessage: string | null;
  isVisible: boolean;
  clearPaidMessage: () => void;
}

const CHECKOUT_MESSAGES: Record<CheckoutProduct, string> = {
  pass: '🎉 Pass 24h activé ! Tous les modes sont débloqués.',
  profile: '🎉 Dossier débloqué ! Retournez à la fin de partie pour le voir.',
};

const AUTO_DISMISS_MS = 5000;

function getPaidProductFromUrl(): CheckoutProduct | null {
  if (typeof window === 'undefined') return null;
  const paid = new URLSearchParams(window.location.search).get('paid');
  return paid === 'pass' || paid === 'profile' ? paid : null;
}

export function useCheckoutFeedback({
  roomCode,
  playerId,
  refreshEntitlements,
  onPaid,
  paidProduct,
}: UseCheckoutFeedbackOptions): UseCheckoutFeedbackResult {
  const [paidMessage, setPaidMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef(refreshEntitlements);
  const onPaidRef = useRef(onPaid);
  const reportedRef = useRef<Set<CheckoutProduct>>(new Set());

  useEffect(() => {
    refreshRef.current = refreshEntitlements;
    onPaidRef.current = onPaid;
  });

  const clearPaidMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPaidMessage(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !playerId) return;

    const paid = paidProduct ?? getPaidProductFromUrl();
    if (!paid) return;

    let isCurrent = true;

    if (!reportedRef.current.has(paid)) {
      onPaidRef.current?.(paid);
      reportedRef.current.add(paid);
    }

    refreshRef
      .current()
      .then(() => {
        if (!isCurrent) return;
        setPaidMessage(CHECKOUT_MESSAGES[paid]);
        window.history.replaceState({}, '', `/room/${roomCode}/player`);
        timeoutRef.current = setTimeout(() => setPaidMessage(null), AUTO_DISMISS_MS);
      })
      .catch((err: unknown) => {
        logger.error('Failed to refresh entitlements after checkout', { roomCode, playerId }, err);
      });

    return () => {
      isCurrent = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [roomCode, playerId, paidProduct]);

  return {
    paidMessage,
    isVisible: paidMessage !== null,
    clearPaidMessage,
  };
}
