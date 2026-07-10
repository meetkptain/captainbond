// Client-side UTM capture: persists first-touch UTM to a cookie and forwards it
// to PostHog as a persistent attribution property. Call once on landing/join mount.
// First-touch wins (we never overwrite an existing captured UTM).

import { parseUtm, hasUtm, type UtmParams } from './utm';
import { identify } from './analytics';

const UTM_COOKIE = 'cb_utm';

export function readStoredUtm(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(UTM_COOKIE);
    return raw ? (JSON.parse(raw) as UtmParams) : null;
  } catch {
    return null;
  }
}

/** Call on page mount. Captures first-touch UTM and identifies the user with it. */
export function captureUtmOnLoad(): UtmParams | null {
  if (typeof window === 'undefined') return null;

  const existing = readStoredUtm();
  if (existing && existing.source) return existing;

  const params = parseUtm(new URLSearchParams(window.location.search));
  if (!hasUtm(new URLSearchParams(window.location.search))) return existing;

  try {
    window.localStorage.setItem(UTM_COOKIE, JSON.stringify(params));
  } catch {
    /* ignore quota / privacy errors */
  }

  if (params.source) {
    identify(`anon_${window.localStorage.getItem('captainbond_analytics_id') || 'unknown'}`, {
      utm_source: params.source,
      utm_medium: params.medium,
      utm_campaign: params.campaign,
      utm_content: params.content,
      utm_term: params.term,
    });
  }
  return params;
}
