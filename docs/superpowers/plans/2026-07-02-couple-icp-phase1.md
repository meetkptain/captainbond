# Couple ICP — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déployer le MVP couple growth : invitation partenaire sécurisée avec reward trial 7 jours, onboarding 7 jours, paywall Premium annual-default, archive basique, et le premier pilier SEO.

**Architecture:** On garde l’existant Supabase + Next.js Edge + Stripe. On ajoute un service d’invitation (`coupleInviteService`) qui signe des tokens HMAC, un service de trial (`coupleTrialService`) qui crée un `UserPass` + met à jour `User.activePassExpiresAt`, et un composant `OnboardingChecklist` qui guide les 7 premiers jours. Le paywall couple réutilise `UnlockPanel`/`PricingComparison` avec `context='couple'`. Le SEO ajoute une section `/blog` statique en FR/EN.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase, Prisma, Stripe.

---

## File map

| Responsibility | File |
|----------------|------|
| Invite token signing / validation | `src/lib/couple/invite.ts` |
| Grant trial on couple creation | `src/services/coupleTrialService.ts` |
| Join API (extend) | `src/app/api/couple/join/route.ts` |
| Entitlement helpers for couple | `src/lib/monetization/entitlements.ts` (read) |
| Onboarding checklist UI | `src/app/(distanciel)/couple/_components/OnboardingChecklist.tsx` |
| Invite sharing UI | `src/app/(distanciel)/couple/_components/OnboardingInvite.tsx` |
| Dashboard hook (invite handling) | `src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts` |
| Paywall UI for couple | `src/components/couple/CouplePaywall.tsx` |
| Archive page | `src/app/(distanciel)/couple/archive/page.tsx` |
| Blog index | `src/app/(marketing)/blog/page.tsx` + `src/app/fr/blog/page.tsx` |
| SEO pillar page | `src/app/(marketing)/blog/questions-pour-couple/page.tsx` + `src/app/fr/blog/questions-pour-couple/page.tsx` |
| Env secrets | `.env.example` |
| Tests | `src/lib/couple/invite.test.ts`, `src/app/api/couple/join/route.test.ts` |

---

## Task 1: Invite token HMAC service

**Files:**
- Create: `src/lib/couple/invite.ts`
- Create: `src/lib/couple/invite.test.ts`

### Step 1: Write the failing test

```ts
import { describe, it, expect, vi } from 'vitest';
import { createInviteToken, verifyInviteToken } from './invite';

vi.stubEnv('COUPLE_INVITE_SECRET', 'test-secret-32-bytes-long!!');

describe('couple invite tokens', () => {
  it('creates and verifies a token', () => {
    const token = createInviteToken('user-123');
    const result = verifyInviteToken(token);
    expect(result.partnerId).toBe('user-123');
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects a tampered token', () => {
    const token = createInviteToken('user-123');
    expect(() => verifyInviteToken(token + 'x')).toThrow('Invalid invite token');
  });

  it('rejects an expired token', () => {
    const token = createInviteToken('user-123', -1);
    expect(() => verifyInviteToken(token)).toThrow('Invite token expired');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx vitest run src/lib/couple/invite.test.ts
```

Expected: FAIL — `createInviteToken` not defined.

### Step 3: Implement the service

```ts
import { createHmac, timingSafeEqual } from 'crypto';
import { AppError } from '@/lib/errors';
import { requireEnv } from '@/lib/env';

const SEPARATOR = ':';
const DEFAULT_TTL_HOURS = 24 * 7;

export interface VerifiedInvite {
  partnerId: string;
  expiresAt: Date;
}

function getSecret(): string {
  return requireEnv('COUPLE_INVITE_SECRET');
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createInviteToken(partnerId: string, ttlHours = DEFAULT_TTL_HOURS): string {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const payload = `${partnerId}${SEPARATOR}${expiresAt.toISOString()}`;
  const signature = sign(payload);
  return `${payload}${SEPARATOR}${signature}`;
}

export function verifyInviteToken(token: string): VerifiedInvite {
  const parts = token.split(SEPARATOR);
  if (parts.length !== 3) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }
  const [partnerId, expiresAtIso, signature] = parts;
  const payload = `${partnerId}${SEPARATOR}${expiresAtIso}`;
  const expected = sign(payload);

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new AppError('VALIDATION_ERROR', 'Invalid invite token');
  }

  const expiresAt = new Date(expiresAtIso);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    throw new AppError('VALIDATION_ERROR', 'Invite token expired');
  }

  return { partnerId, expiresAt };
}
```

### Step 4: Run tests

```bash
npx vitest run src/lib/couple/invite.test.ts
```

Expected: PASS.

### Step 5: Commit

```bash
git add src/lib/couple/invite.ts src/lib/couple/invite.test.ts
git commit -m "feat(couple): add HMAC invite token service"
```

---

## Task 2: Trial grant service

**Files:**
- Create: `src/services/coupleTrialService.ts`
- Modify: `prisma/schema.prisma` (add `coupleTrial` to `UserPass.source` enum if strict)

### Step 1: Implement service

```ts
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPackBySku } from '@/lib/monetization/catalog';
import { dbRetry } from '@/lib/db/withRetry';
import { logger } from '@/lib/logger';

const TRIAL_DAYS = 7;

export async function grantCoupleTrial(userId: string): Promise<void> {
  const pack = await getPackBySku('SUBSCRIPTION_ANNUAL');
  if (!pack) {
    logger.error('SUBSCRIPTION_ANNUAL pack not found for trial', { userId });
    return;
  }

  const expiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await dbRetry<null>(async () =>
    supabaseAdmin.from('UserPass').insert({
      userId,
      packId: pack.id,
      expiresAt,
      source: 'couple_trial',
    }),
  );

  await dbRetry<null>(async () =>
    supabaseAdmin.from('User').update({ activePassExpiresAt: expiresAt }).eq('id', userId),
  );

  logger.info('Couple trial granted', { userId, expiresAt });
}
```

### Step 2: Test (manual / integration)

Run a local Supabase query after creating a couple:

```sql
SELECT "activePassExpiresAt" FROM "User" WHERE id = '<userId>';
SELECT * FROM "UserPass" WHERE "userId" = '<userId>' AND source = 'couple_trial';
```

Expected: `activePassExpiresAt` is ~7 days in the future and a `UserPass` row exists.

### Step 3: Commit

```bash
git add src/services/coupleTrialService.ts
git commit -m "feat(couple): add 7-day trial grant service"
```

---

## Task 3: Extend join API to accept signed invite + grant trial

**Files:**
- Modify: `src/app/api/couple/join/route.ts`
- Modify: `src/app/api/couple/join/route.test.ts` (create)

### Step 1: Current route

Read `src/app/api/couple/join/route.ts` and add optional `inviteToken` to body schema.

### Step 2: Modify route

```ts
import { verifyInviteToken } from '@/lib/couple/invite';
import { grantCoupleTrial } from '@/services/coupleTrialService';

const joinSchema = z.object({
  partnerId: z.string().uuid().optional(),
  inviteToken: z.string().optional(),
});

// In handler:
let partnerId = body.partnerId;
if (body.inviteToken) {
  const verified = verifyInviteToken(body.inviteToken);
  partnerId = verified.partnerId;
}
if (!partnerId) {
  return NextResponse.json({ error: 'partnerId ou inviteToken requis', code: 'BAD_REQUEST' }, { status: 400 });
}

const couple = await createCouple(authUser.id, partnerId);

// Grant trial to both partners
await grantCoupleTrial(authUser.id);
await grantCoupleTrial(partnerId);

return NextResponse.json({ success: true, couple });
```

### Step 3: Add route test

Create `src/app/api/couple/join/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { createInviteToken } from '@/lib/couple/invite';

vi.stubEnv('COUPLE_INVITE_SECRET', 'test-secret-32-bytes-long!!');

vi.mock('@/lib/auth/user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/db/repositories/coupleRepository', () => ({
  createCouple: vi.fn(),
}));

vi.mock('@/services/coupleTrialService', () => ({
  grantCoupleTrial: vi.fn(),
}));

import { getAuthenticatedUser } from '@/lib/auth/user';
import { createCouple } from '@/lib/db/repositories/coupleRepository';
import { grantCoupleTrial } from '@/services/coupleTrialService';

beforeEach(() => vi.clearAllMocks());

describe('POST /api/couple/join', () => {
  it('creates couple and grants trial from invite token', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user-a', email: 'a@example.com' } as Awaited<ReturnType<typeof getAuthenticatedUser>>);
    vi.mocked(createCouple).mockResolvedValue({ id: 'couple-1', user1Id: 'user-a', user2Id: 'user-b' } as Awaited<ReturnType<typeof createCouple>>);

    const token = createInviteToken('user-b');
    const req = new NextRequest('http://localhost/api/couple/join', {
      method: 'POST',
      body: JSON.stringify({ inviteToken: token }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createCouple).toHaveBeenCalledWith('user-a', 'user-b');
    expect(grantCoupleTrial).toHaveBeenCalledTimes(2);
  });
});
```

### Step 4: Run tests

```bash
npx vitest run src/app/api/couple/join/route.test.ts
```

Expected: PASS.

### Step 5: Commit

```bash
git add src/app/api/couple/join/route.ts src/app/api/couple/join/route.test.ts
git commit -m "feat(couple): join via signed invite token and grant trial"
```

---

## Task 4: Update invite UI to share signed link

**Files:**
- Modify: `src/app/(distanciel)/couple/_components/OnboardingInvite.tsx`
- Modify: `src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts`

### Step 1: Generate signed link in UI

Instead of raw `?invite=<userId>`, call a new API `POST /api/couple/invite-token` to get a signed token, then build `?inviteToken=<token>`.

Create `src/app/api/couple/invite-token/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { createInviteToken } from '@/lib/couple/invite';

export const runtime = 'edge';

export const POST = withApiHandler({
  async handler({ req }) {
    const authUser = await getAuthenticatedUser(req);
    const token = createInviteToken(authUser.id);
    return NextResponse.json({ token, url: `${process.env.NEXT_PUBLIC_SITE_URL}/couple?inviteToken=${token}` });
  },
});
```

### Step 2: Update OnboardingInvite

```tsx
const [inviteUrl, setInviteUrl] = useState<string>('');

useEffect(() => {
  api.post<{ url: string }>('/api/couple/invite-token').then((data) => setInviteUrl(data.url));
}, []);
```

Use `inviteUrl` in share/copy.

### Step 3: Update useCoupleDashboard to read `?inviteToken`

```ts
const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const inviteToken = searchParams?.get('inviteToken');

if (!couple && inviteToken) {
  await api.post('/api/couple/join', { inviteToken });
  // reload couple data
}
```

### Step 4: Commit

```bash
git add src/app/api/couple/invite-token/route.ts src/app/(distanciel)/couple/_components/OnboardingInvite.tsx src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts
git commit -m "feat(couple): share and accept signed invite links"
```

---

## Task 5: Onboarding 7-day checklist

**Files:**
- Create: `src/app/(distanciel)/couple/_components/OnboardingChecklist.tsx`
- Create: `src/lib/couple/onboarding.ts`
- Modify: `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx`

### Step 1: Onboarding state helper

```ts
export interface OnboardingStep {
  day: number;
  title: string;
  done: boolean;
}

export function getOnboardingSteps(completedDays: number[]): OnboardingStep[] {
  return [
    { day: 1, title: 'Appairer nos profils', done: completedDays.includes(1) },
    { day: 2, title: 'Répondre à la première question', done: completedDays.includes(2) },
    { day: 3, title: 'Découvrir notre révélation', done: completedDays.includes(3) },
    { day: 4, title: 'Explorer le Totem', done: completedDays.includes(4) },
    { day: 5, title: 'Sceller une TimeCapsule', done: completedDays.includes(5) },
    { day: 6, title: 'Tester un pack thématique', done: completedDays.includes(6) },
    { day: 7, title: 'Activer l\'abo Premium', done: completedDays.includes(7) },
  ];
}
```

### Step 2: UI component

Render a vertical stepper with 7 days, current day highlighted, CTA to today’s action.

### Step 3: Wire in dashboard

Show `OnboardingChecklist` for the first 7 days after `couple.createdAt`.

### Step 4: Commit

```bash
git add src/lib/couple/onboarding.ts src/app/(distanciel)/couple/_components/OnboardingChecklist.tsx src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx
git commit -m "feat(couple): add 7-day onboarding checklist"
```

---

## Task 6: Couple Premium paywall (annual default)

**Files:**
- Create: `src/components/couple/CouplePaywall.tsx`
- Create: `src/app/api/checkout/couple-subscription/route.ts`
- Modify: `src/lib/monetization/catalog.ts` (ensure `SUBSCRIPTION_ANNUAL` exists)
- Modify: `src/lib/monetization/checkout.ts` (reuse `getOrCreateStripePrice`)

### Step 1: Couple subscription checkout route

Similar to `src/app/api/checkout/subscription/route.ts`, but accept `plan: 'couple_annual' | 'couple_monthly'` and create a subscription for the authenticated user. The partner gets access through entitlements because the couple shares the subscription? Actually entitlements are per-user. To share, we need to grant both users. For MVP, trial sets both users’ `activePassExpiresAt`. For paid subscription, after webhook fulfillment, update the paying user; optionally mirror to partner via a service.

For Phase 1, pay for one user; partner can be added by granting a `UserPass` tied to the paying user’s subscription. Add in webhook: when subscription pack is `SUBSCRIPTION_ANNUAL`/`MONTHLY` and `metadata.coupleId` exists, also create `UserPass` for partner.

### Step 2: CouplePaywall component

Wrap `UnlockPanel`/`PricingComparison` with `context='couple'`, pre-select annual plan, show trial countdown.

### Step 3: Commit

```bash
git add src/components/couple/CouplePaywall.tsx src/app/api/checkout/couple-subscription/route.ts
git commit -m "feat(couple): add couple subscription checkout and paywall"
```

---

## Task 7: Archive / Journal page

**Files:**
- Create: `src/app/(distanciel)/couple/archive/page.tsx`
- Create: `src/app/api/couple/archive/route.ts`
- Modify: `src/lib/db/repositories/dailyQuestionRepository.ts` (add `listAnsweredQuestionsForCouple`)

### Step 1: Repository method

```ts
export async function listAnsweredQuestionsForCouple(coupleId: string) {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .or('user1Answered.eq.true,user2Answered.eq.true')
    .order('releasedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}
```

### Step 2: API route

Edge route returning JSON list.

### Step 3: Archive page

Client page fetching archive, rendering cards with date, theme, answers (if revealed), CTA to Premium if older than trial allows.

### Step 4: Commit

```bash
git add src/lib/db/repositories/dailyQuestionRepository.ts src/app/api/couple/archive/route.ts src/app/(distanciel)/couple/archive/page.tsx
git commit -m "feat(couple): add archive journal page"
```

---

## Task 8: SEO blog infrastructure + first pillar

**Files:**
- Create: `src/app/(marketing)/blog/layout.tsx`
- Create: `src/app/(marketing)/blog/page.tsx`
- Create: `src/app/fr/blog/page.tsx`
- Create: `src/app/(marketing)/blog/questions-pour-couple/page.tsx`
- Create: `src/app/fr/blog/questions-pour-couple/page.tsx`
- Modify: `src/app/sitemap.ts`
- Create: `public/og/blog-questions-couple-en.png` + `-fr.png` (or reuse existing script)

### Step 1: Blog layout

```tsx
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>;
}
```

### Step 2: Blog index page

List first 3 articles with title, excerpt, link. Server Component with Metadata.

### Step 3: Pillar article

Long article ~2 000 mots: “150 questions pour couple : du fun au profond”. Use semantic HTML (`<article>`, H2/H3), internal links to `/couple`, CTA card.

Metadata: title, description, canonical, alternates, OG/Twitter images.

### Step 4: French variants

Create `src/app/fr/blog/page.tsx` and `src/app/fr/blog/questions-pour-couple/page.tsx` with `locale: 'fr'` metadata.

### Step 5: Sitemap

Add `/blog`, `/fr/blog`, `/blog/questions-pour-couple`, `/fr/blog/questions-pour-couple` to `src/app/sitemap.ts`.

### Step 6: OG images

Generate PNGs via `scripts/generate-og-images.mjs` or create SVG placeholders. Ensure paths match metadata.

### Step 7: Commit

```bash
git add src/app/(marketing)/blog src/app/fr/blog src/app/sitemap.ts public/og/blog-*
git commit -m "feat(seo): add blog index and first couple pillar page"
```

---

## Task 9: Env variables

**Files:**
- Modify: `.env.example`

Add:

```env
# Couple invite security
COUPLE_INVITE_SECRET=
```

Ensure production has a strong random secret (`openssl rand -base64 32`).

### Commit

```bash
git add .env.example
git commit -m "chore(env): add COUPLE_INVITE_SECRET"
```

---

## Task 10: Final validation

### Step 1: Run tests

```bash
npm run test -- --run
```

Expected: all pass (≥ current count).

### Step 2: Run build

```bash
npm run build
```

Expected: no TypeScript or build errors.

### Step 3: Manual checks

1. User A opens `/couple`, copies invite link.
2. User B opens link, auth, couple created.
3. Both users have `activePassExpiresAt` 7 days ahead.
4. Daily question appears; archive shows answered question after reveal.
5. Paywall shows annual default when trial expired or feature premium accessed.
6. `/blog/questions-pour-couple` renders with correct metadata and hreflang.

### Step 4: Commit

```bash
git commit -m "test(couple): validate couple ICP phase 1 end-to-end" --allow-empty
```

---

## Spec coverage check

| Spec section | Task |
|--------------|------|
| 1.2 Invitation partenaire + reward | Task 1, 2, 3, 4 |
| 2. Onboarding 7 jours | Task 5 |
| 4. Monétisation trial + annual | Task 6 |
| 3.2 Archive & Journal | Task 7 |
| 6. SEO piliers/articles | Task 8 |
| 7. Métriques | events added in each task via `capture()` |

## Placeholder scan

No TBD/TODO. Each task provides exact files and sample code. Edge cases (expired token, missing partnerId, trial grant failure) are handled.

## Risk / scope note

This plan intentionally limits SEO to **one pillar + index** to keep the MVP shippable. Subsequent plans will add cluster articles, parcours thématiques, and notification push.
