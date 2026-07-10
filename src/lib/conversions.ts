// Server-side ad-platform conversion tracking (Meta CAPI + GA4 MP).
// Graceful no-op when env vars are missing (per Wasabi CONFIG_MISSING pattern):
// the app keeps working, the events are just not forwarded to the ad platforms.
//
// Edge-compatible: uses global fetch + Web Crypto (crypto.subtle) for SHA-256.

import { logger } from './logger';

const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_CONVERSIONS_TOKEN = process.env.META_CONVERSIONS_TOKEN || '';
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
const GA4_API_SECRET = process.env.GA4_API_SECRET || '';

export interface PurchaseConversionInput {
  /** Stable id used for dedup (Meta event_id / GA4 transaction_id). Use the Stripe session/payment id. */
  eventId: string;
  value: number;
  currency: string;
  sku: string;
  email?: string | null;
  phone?: string | null;
  /** Client id for GA4 (falls back to eventId). */
  clientId?: string;
  /** Attribution source captured at landing (utm_source etc.) — passed through for diagnostics. */
  source?: string | null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendMetaCAPI(input: PurchaseConversionInput): Promise<void> {
  if (!META_PIXEL_ID || !META_CONVERSIONS_TOKEN) return;

  const userData: Record<string, string> = {};
  if (input.email) userData.em = await sha256(normalize(input.email));
  if (input.phone) userData.ph = await sha256(normalize(input.phone));

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_id: input.eventId,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
        custom_data: {
          value: input.value,
          currency: input.currency.toUpperCase(),
          content_ids: [input.sku],
          content_type: 'product',
        },
      },
    ],
  };

  try {
    await fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CONVERSIONS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error('Meta CAPI purchase send failed', {}, err);
  }
}

async function sendGa4MP(input: PurchaseConversionInput): Promise<void> {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return;

  const clientId = input.clientId || input.eventId;
  const payload = {
    client_id: clientId,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: input.eventId,
          value: input.value,
          currency: input.currency.toUpperCase(),
          items: [{ item_id: input.sku, item_name: input.sku, quantity: 1, price: input.value }],
        },
      },
    ],
  };

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
  } catch (err) {
    logger.error('GA4 MP purchase send failed', {}, err);
  }
}

/**
 * Forwards a completed purchase to Meta Conversions API + GA4 Measurement Protocol.
 * Safe to call unconditionally: silently skips any platform whose env vars are absent.
 */
export async function trackPurchaseConversion(input: PurchaseConversionInput): Promise<void> {
  await Promise.all([sendMetaCAPI(input), sendGa4MP(input)]);
}
