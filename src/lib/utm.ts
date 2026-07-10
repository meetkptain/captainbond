// UTM scheme — single source of truth for campaign attribution.
// Naming convention: utm_source / utm_medium / utm_campaign / utm_content / utm_term
// all lowercase, hyphenated. Known mediums enumerated for validation.

export const UTM_MEDIUMS = [
  'organic',
  'cpc',
  'social',
  'email',
  'influencer',
  'referral',
  'affiliate',
  'qr',
  'push',
] as const;

export type UtmMedium = (typeof UTM_MEDIUMS)[number];

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

const UTM_KEYS: (keyof UtmParams)[] = ['source', 'medium', 'campaign', 'content', 'term'];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build a UTM query string from structured params. Unknown medium is coerced to 'referral'. */
export function buildUtm(params: UtmParams): string {
  const out = new URLSearchParams();
  if (params.source) out.set('utm_source', slugify(params.source));
  if (params.medium) {
    const medium = slugify(params.medium);
    out.set('utm_medium', UTM_MEDIUMS.includes(medium as UtmMedium) ? medium : 'referral');
  }
  if (params.campaign) out.set('utm_campaign', slugify(params.campaign));
  if (params.content) out.set('utm_content', slugify(params.content));
  if (params.term) out.set('utm_term', slugify(params.term));
  const qs = out.toString();
  return qs ? `?${qs}` : '';
}

/** Parse UTM params from a URLSearchParams / Record. Returns only present, valid keys. */
export function parseUtm(search: URLSearchParams | Record<string, string>): UtmParams {
  const get = (k: string): string | null =>
    search instanceof URLSearchParams ? search.get(k) : (search[k] ?? null);

  const result: UtmParams = {};
  for (const key of UTM_KEYS) {
    const raw = get(`utm_${key}`);
    if (raw && raw.trim()) {
      const value = slugify(raw);
      if (key === 'medium' && !UTM_MEDIUMS.includes(value as UtmMedium)) continue;
      result[key] = value;
    }
  }
  return result;
}

/** True when the search params contain at least utm_source. */
export function hasUtm(search: URLSearchParams | Record<string, string>): boolean {
  const src = search instanceof URLSearchParams ? search.get('utm_source') : search['utm_source'];
  return Boolean(src && src.trim());
}
