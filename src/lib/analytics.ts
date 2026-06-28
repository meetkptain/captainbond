// Analytics minimal basé sur l'API REST PostHog
// Fonctionne côté client et côté serveur (Edge-compatible)

import { logger } from './logger';

declare global {
  interface Window {
    __CAPTAIN_BOND_USER_ID__?: string;
  }
}

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');

// Génère un ID anonyme stable pour la session courante (côté client)
function getAnonymousId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'captainbond_analytics_id';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

export function getDistinctId(): string {
  if (typeof window === 'undefined') return 'server';
  // Plus tard, quand Supabase Auth sera actif, on utilisera l'ID user authentifié
  return window.__CAPTAIN_BOND_USER_ID__ || getAnonymousId();
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    window.__CAPTAIN_BOND_USER_ID__ = userId;
  }
  capture('$identify', {
    $set: properties || {},
    $distinct_id: userId,
    $anon_distinct_id: getAnonymousId(),
  });
}

export function capture(event: string, properties: Record<string, unknown> = {}) {
  if (!POSTHOG_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Analytics event captured', { event, properties });
    }
    return;
  }

  const payload = {
    api_key: POSTHOG_API_KEY,
    event,
    properties: {
      distinct_id: getDistinctId(),
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  const promise = fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (typeof window === 'undefined') {
    // Côté serveur : attendre la promesse pour ne pas perdre l'event
    promise.catch((err) => logger.error('Analytics server error', {}, err));
  } else {
    // Côté client : fire-and-forget
    promise.catch(() => {});
  }
}

export async function captureServer(event: string, properties: Record<string, unknown> = {}) {
  if (!POSTHOG_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Analytics server event captured', { event, properties });
    }
    return;
  }

  const payload = {
    api_key: POSTHOG_API_KEY,
    event,
    properties: {
      distinct_id: properties.distinct_id || 'server',
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error('Analytics server error', {}, err);
  }
}

// Events métier prédéfinis
export const AnalyticsEvents = {
  ROOM_CREATED: 'room_created',
  PLAYER_JOINED: 'player_joined',
  MODE_SELECTED: 'mode_selected',
  PAYWALL_SHOWN: 'paywall_shown',
  CHECKOUT_INITIATED: 'checkout_initiated',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  PROFILE_SHARED: 'profile_shared',
  QUESTION_ANSWERED: 'question_answered',
  SAFE_WORD_TRIGGERED: 'safe_word_triggered',
  GAME_ENDED: 'game_ended',
} as const;
