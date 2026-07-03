# Couple ICP Soft Launch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the six Soft Launch fixes identified in the couple ICP audit to reduce pre-launch friction and ethical risks without delaying deployment.

**Architecture:** Minimal, surgical changes to existing React components and one utility file. No new backend endpoints. Preserve existing feature flags and behaviors for users who already have history.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest.

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/couple/onboarding.ts` | Onboarding step labels and current-day calculation. |
| `src/lib/couple/onboarding.test.ts` | Unit tests for onboarding steps. |
| `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx` | Layout, onboarding visibility, paywall placement. |
| `src/app/(distanciel)/couple/_components/StatsColumn.tsx` | Right-column widgets (totem, detox, recap, etc.). |
| `src/app/(distanciel)/couple/_components/TodayRitualCard.tsx` | Daily question flow, reveal countdown, protocol CTA. |
| `src/app/(distanciel)/couple/_components/OnboardingInvite.tsx` | Invite-link generation screen for the first user. |
| `src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts` | Dashboard state, derived names (`partnerName`, `myName`). |
| `src/app/(distanciel)/couple/archive/_components/ArchiveClient.tsx` | Archive/Journal page with Premium gating. |
| `src/components/couple/RevealCard.tsx` | Revealed answers card. |
| `src/components/couple/CouchMode.tsx` | Shared-screen answering mode. |
| `src/components/couple/ProtocolWizard.tsx` | Post-reveal protocol wizard. |

---

### Task 1: Onboarding — remove Premium day 7

**Files:**
- Modify: `src/lib/couple/onboarding.ts:21-30`
- Modify: `src/lib/couple/onboarding.test.ts`

**Goal:** Replace day 7 "Activer l'abo Premium" with a value step.

- [ ] **Step 1: Update the failing test**

In `src/lib/couple/onboarding.test.ts`, change the assertion for day 7:

```ts
expect(steps[6].title).toBe("Valider notre premier rituel hebdomadaire");
expect(steps[6].titleEn).toBe("Lock in our first weekly ritual");
```

Run: `npm run test -- --run src/lib/couple/onboarding.test.ts`
Expected: FAIL — title mismatch.

- [ ] **Step 2: Update the step label**

In `src/lib/couple/onboarding.ts`:

```ts
{ day: 7, title: "Valider notre premier rituel hebdomadaire", titleEn: "Lock in our first weekly ritual", done: completedDays.includes(7) },
```

Run: `npm run test -- --run src/lib/couple/onboarding.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/couple/onboarding.ts src/lib/couple/onboarding.test.ts
git commit -m "fix(couple): reframe day 7 onboarding as value milestone"
```

---

### Task 2: Dashboard — progressive disclosure of right-column widgets

**Files:**
- Modify: `src/app/(distanciel)/couple/_components/StatsColumn.tsx`
- Modify: `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx` (pass `currentDay` + revealed count)

**Goal:** Show only Totem/Vitality + a contextual placeholder on days 1-2; reveal other widgets once the couple has at least one revealed question or reaches day 3.

- [ ] **Step 1: Add a visibility gate prop**

In `src/app/(distanciel)/couple/_components/StatsColumn.tsx`, add a prop:

```ts
interface StatsColumnProps {
  currentDay: number;
  revealedCount: number;
}

export function StatsColumn({ currentDay, revealedCount }: StatsColumnProps) {
  const showAdvanced = currentDay >= 3 || revealedCount >= 1;
  // existing hook calls
}
```

- [ ] **Step 2: Wrap advanced widgets conditionally**

Keep these always visible:
- Totem view block (lines 23-32)
- Vitality card (lines 34-89)

Wrap these behind `showAdvanced`:
- Detox Challenge
- Weekly Recap
- Monthly Report Card
- Monthly Portrait
- Timeline (show placeholder copy when empty + not advanced)
- Neural Tree Link
- Time Capsule Panel

Example for Timeline placeholder:

```tsx
{!showAdvanced && pastQuestions.length === 0 && (
  <div className="couple-card">
    <div className="couple-label">Historique des Miroirs</div>
    <p className="text-sm text-slate-400">Votre histoire commence aujourd&apos;hui. Revenez après votre première révélation.</p>
  </div>
)}
{showAdvanced && (
  <div className="couple-card">
    <div className="couple-label">Historique des Miroirs</div>
    {/* existing timeline */}
  </div>
)}
```

- [ ] **Step 3: Pass props from dashboard view**

In `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx`:

```tsx
const revealedCount = useMemo(
  () => dailyQuestions.filter((q) => q.isRevealed).length,
  [dailyQuestions]
);
```

Then:

```tsx
<StatsColumn currentDay={currentDay} revealedCount={revealedCount} />
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(distanciel)/couple/_components/StatsColumn.tsx src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx
git commit -m "fix(couple): progressively disclose dashboard widgets"
```

---

### Task 3: Paywall — defer until value is proven

**Files:**
- Modify: `src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx:204-213`

**Goal:** Only render `CouplePaywall` after 3 revealed questions or day 7.

- [ ] **Step 1: Add a visibility condition**

```tsx
const showPaywall = useMemo(() => {
  if (!couple) return false;
  if (entitlements?.hasActivePass || entitlements?.hasActiveSubscription) return false;
  const revealedCount = dailyQuestions.filter((q) => q.isRevealed).length;
  return revealedCount >= 3 || currentDay >= 7;
}, [couple, entitlements, dailyQuestions, currentDay]);
```

- [ ] **Step 2: Replace the existing paywall condition**

```tsx
{showPaywall && (
  <section className="mt-8">
    <CouplePaywall ... />
  </section>
)}
```

- [ ] **Step 3: Verify build/tests**

Run: `npm run test -- --run && npm run build`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/app/(distanciel)/couple/_components/CoupleDashboardView.tsx
git commit -m "fix(couple): defer paywall until 3 reveals or day 7"
```

---

### Task 4: Archive — 14-day free window

**Files:**
- Modify: `src/app/(distanciel)/couple/archive/_components/ArchiveClient.tsx:35-44`

**Goal:** Questions from the last 14 days remain readable without Premium; older entries stay locked.

- [ ] **Step 1: Update the lock helper**

```ts
function getIsLocked(
  isPremiumActive: boolean,
  entitlements: EntitlementsPayload | null,
  releasedAt?: string | null
): boolean {
  if (isPremiumActive) return false;
  // 14-day free archive window
  if (releasedAt) {
    const released = new Date(releasedAt).getTime();
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    if (released >= cutoff) return false;
  }
  // Fallback to pass expiry if available
  const expiresAt = entitlements?.passExpiresAt;
  if (!expiresAt) return true;
  return new Date(releasedAt || Date.now()).getTime() < new Date(expiresAt).getTime();
}
```

- [ ] **Step 2: Update the empty-state copy**

In the locked overlay and bottom CTA, change "Activez Premium pour relire cette entrée" to "Activez Premium pour explorer l'historique complet".

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(distanciel)/couple/archive/_components/ArchiveClient.tsx
git commit -m "fix(couple): 14-day free archive window"
```

---

### Task 5: Names — propagate partner first names

**Files:**
- Modify: `src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts:140-144`
- Modify: `src/app/(distanciel)/couple/_components/TodayRitualCard.tsx:103-106`
- Modify: `src/components/couple/RevealCard.tsx:22-23`
- Modify: `src/components/couple/CouchMode.tsx:19-20`
- Modify: `src/components/couple/ProtocolWizard.tsx` (search for hard-coded labels)

**Goal:** Replace generic labels with actual first names from the couple data.

- [ ] **Step 1: Extend the portrait response type**

In `useCoupleDashboard.ts`, the `PortraitResponse` currently only includes `couple`, `dailyQuestions`, etc. The API `/api/couple/portrait` already returns `user1Name` and `user2Name` — confirm by reading `src/app/api/couple/portrait/route.ts`. If not, add them to the API response.

Assuming the API returns them, update the type:

```ts
interface PortraitResponse {
  couple: CoupleData;
  dailyQuestions: DailyQuestionData[];
  portraits: CouplePortraitData[];
  entitlements: Entitlements | null;
  timeCapsules: TimeCapsuleData[];
  totemState?: PageTotemState | null;
  user1Name?: string | null;
  user2Name?: string | null;
}
```

- [ ] **Step 2: Store names in state and derive partnerName/myName**

```ts
const [user1Name, setUser1Name] = useState<string | null>(null);
const [user2Name, setUser2Name] = useState<string | null>(null);
```

In `fetchData`:

```ts
setUser1Name(data.user1Name ?? null);
setUser2Name(data.user2Name ?? null);
```

Replace lines 140-144:

```ts
const partnerName = useMemo(() => {
  if (!couple || !userId) return 'Ton partenaire';
  return isUser1 ? (user2Name || 'Ton partenaire') : (user1Name || 'Ton partenaire');
}, [couple, userId, isUser1, user1Name, user2Name]);

const myName = useMemo(() => {
  return isUser1 ? (user1Name || 'Vous') : (user2Name || 'Vous');
}, [isUser1, user1Name, user2Name]);
```

Expose `user1Name` and `user2Name` in the hook return and in `CoupleDashboardProvider`/`useCoupleData`.

- [ ] **Step 3: Update RevealCard callers**

In `TodayRitualCard.tsx`, pass `myName` and `partnerName` to `RevealCard`:

```tsx
<RevealCard
  ...
  myName={myName}
  partnerName={partnerName}
/>
```

In `StatsColumn.tsx`, `TodayRitualCard.tsx`, `CouchMode.tsx`, and `ProtocolWizard.tsx`, consume `myName`/`partnerName` from `useCoupleData()` or props instead of hard-coded strings.

For `CouchMode`, pass:

```tsx
<CouchMode
  ...
  partnerAName={myName}
  partnerBName={partnerName}
/>
```

- [ ] **Step 4: Update ProtocolWizard**

Search for "Partenaire A", "Partenaire B", "Vous", "votre partenaire" and replace with props. Add optional props if needed:

```ts
interface ProtocolWizardProps {
  ...
  partnerAName?: string;
  partnerBName?: string;
}
```

Pass them from `TodayRitualCard`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/(distanciel)/couple/_hooks/useCoupleDashboard.ts src/app/(distanciel)/couple/_hooks/useCoupleDashboardContext.tsx src/app/(distanciel)/couple/_components/TodayRitualCard.tsx src/components/couple/RevealCard.tsx src/components/couple/CouchMode.tsx src/components/couple/ProtocolWizard.tsx
# include any API route change if needed
git commit -m "fix(couple): use partner first names across dashboard"
```

---

### Task 6: Reveal — optional early reveal

**Files:**
- Modify: `src/app/(distanciel)/couple/_components/TodayRitualCard.tsx:89-96`
- Optional: `src/components/couple/SyncDropCountdown.tsx`

**Goal:** When both partners have answered but the reveal time has not arrived, offer an immediate reveal CTA.

- [ ] **Step 1: Replace the sealed countdown block**

Find:

```tsx
{/* Both answered but sealed */}
{bothAnswered && !todayQuestion?.isRevealed && (
  <SyncDropCountdown
    targetHour={20}
    isReady={true}
    partnerName={partnerName}
    onRevealTime={triggerReveal}
  />
)}
```

Replace with:

```tsx
{bothAnswered && !todayQuestion?.isRevealed && (
  <div className="flex flex-col items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
    <p className="text-sm text-slate-300">Vous avez tous les deux répondu.</p>
    <button
      className="couple-action-btn"
      onClick={triggerReveal}
    >
      Révéler maintenant ✨
    </button>
    <p className="text-xs text-slate-500">ou attendre la révélation à 20h00</p>
  </div>
)}
```

- [ ] **Step 2: Verify the waiting-for-partner state still uses countdown**

Ensure `(hasMyAnswer || submitted) && !bothAnswered` still renders `SyncDropCountdown` with `isReady={false}`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(distanciel)/couple/_components/TodayRitualCard.tsx
git commit -m "feat(couple): allow early reveal when both partners answered"
```

---

### Task 7: Invite — solo pre-ritual while waiting for partner

**Files:**
- Modify: `src/app/(distanciel)/couple/_components/OnboardingInvite.tsx`

**Goal:** After the invite link is generated, give the user a constructive action instead of leaving them in a dead end.

- [ ] **Step 1: Add a secondary CTA**

After the "Copier le lien" button, add:

```tsx
<button
  className="couple-action-btn"
  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
  onClick={() => router.push('/couple?draft=true')}
>
  Répondre à la première question en solo 📝
</button>
<p className="text-xs text-slate-500 text-center">
  Votre réponse restera privée jusqu&apos;à ce que votre partenaire rejoigne l&apos;espace.
</p>
```

- [ ] **Step 2: Handle the draft flag in the dashboard hook**

In `useCoupleDashboard.ts`, detect `?draft=true` and set a local state to show a contextual banner or allow answering before the couple exists. For this soft launch, a simple redirect to `/couple` with a toast/info message is acceptable; the important part is the CTA itself.

If keeping it minimal, the CTA can simply `router.push('/couple')` and the existing error state will invite the partner. Adjust copy to:

```tsx
onClick={() => router.push('/couple')}
```

with label "Découvrir mon premier rituel".

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(distanciel)/couple/_components/OnboardingInvite.tsx
git commit -m "fix(couple): add solo pre-ritual cta to invite screen"
```

---

## Final Validation

- [ ] Run full test suite: `npm run test -- --run`
- [ ] Run production build: `npm run build`
- [ ] Manual smoke tests:
  - Fresh user sees only question + vitality card on day 1.
  - Paywall hidden until 3 reveals or day 7.
  - Archive shows last 14 days unlocked without Premium.
  - Day 7 onboarding label is "Valider notre premier rituel hebdomadaire".
  - Reveal card shows first names.
  - Both answered → "Révéler maintenant" appears.
  - Invite screen offers a solo CTA.

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Dashboard allégé jour 1-2 | Task 2 |
| Paywall différé (3 révélations ou J+7) | Task 3 |
| Archive 14 jours gratuits | Task 4 |
| Jour 7 onboarding reformulé | Task 1 |
| Prénoms propagés | Task 5 |
| Révélation anticipée | Task 6 |
| Pré-rituel solo | Task 7 |
