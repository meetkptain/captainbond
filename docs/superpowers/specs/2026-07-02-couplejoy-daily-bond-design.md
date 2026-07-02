# Design Spec — Rituels Couple (CoupleJoy-inspired, version bienveillante)

## 1. Context & Goal

Captain Bond already has a strong couple experience: Daily Bond blind answers, Neural Tree, Monthly Report, Totem. CoupleJoy's strength is its **expert-backed, themed relationship curriculum** delivered as daily quizzes + micro-rituals.

This spec integrates a **light, therapist-guided ritual system** into the existing couple dashboard. The core idea is **less mechanics, more emotion**: no visible streaks, no scores, no badges. Just a weekly theme, three questions, and a short guided conversation after each reveal.

The Neural Tree keeps growing in the background as a long-term reflection tool, but it is **not central to the short-term experience**.

**Goal**: create a calm, emotionally safe space where couples reconnect 3 times a week, guided by a benevolent couple-therapist voice.

---

## 2. Concept & UX

### User-facing name
"**Rituels Couple**" (or keep "Daily Bond" if brand continuity matters).

### Rhythm

- **3 questions per week**: Monday, Wednesday, Friday at 12:00 (couple local time).
- Each question belongs to the **weekly theme**.
- Each partner answers **blindly**.
- **Reveal at 20:00** with both answers and a short therapist-written guide.
- No penalty for missing a day. No streak. No pushy notifications.

### Flow

1. **Monday 12:00**: question unlocks. Theme of the week is shown gently.
2. Each partner answers when they can.
3. **Monday 20:00**: reveal. Both answers visible. A "3 minutes together" guide appears.
4. The guide suggests a short, non-forced conversation.
5. Same rhythm Wednesday and Friday.
6. On Sunday, a soft weekly recap is available: "Cette semaine, vous avez exploré [theme]."

### UI Changes

- Couple dashboard header:
  - Soft theme label: "Cette semaine : Communication"
  - Small progress dots: Mon / Wed / Fri
  - No streak, no score, no numbers
- Question card:
  - Theme tag
  - Question text
  - Answer input
  - Skip option always visible: "Pas aujourd'hui"
- Post-reveal card:
  - Both answers
  - "3 minutes ensemble" — therapist guide
  - Optional micro-ritual: "Si vous le souhaitez, avant de dormir, dites à votre partenaire un merci concret."
- "Notre évolution" tab:
  - Neural Tree, accessible but not highlighted
  - Monthly recap (short, text-based)

### Differentiation from CoupleJoy

- Not a daily quiz. It is a **weekly emotional rhythm**.
- Not gamified. No scores, streaks, or badges.
- Therapist voice, not app-store game copy.
- Background Neural Tree for long-term reflection, not daily dopamine.

---

## 3. Architecture & Data Flow

### Database Changes

Extend `DailyQuestion` with the minimum needed.

```prisma
model DailyQuestion {
  id                String    @id @default(cuid())
  coupleId          String
  couple            Couple    @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  questionId        String?
  question          Question? @relation(fields: [questionId], references: [id])
  customText        String?
  releasedAt        DateTime  @default(now())
  isAnswered        Boolean   @default(false)
  user1Answer       String?
  user2Answer       String?
  revealedAt        DateTime?
  user1Answered     Boolean   @default(false)
  user2Answered     Boolean   @default(false)
  isRevealed        Boolean   @default(false)
  resonanceScore    Float?
  analysisJson      Json?
  analysisStatus    String    @default("PENDING")
  protocolOpened    Boolean   @default(false)
  user1Mood         Json?
  user2Mood         Json?
  isSkipped         Boolean   @default(false)
  isSafeZoneActive  Boolean   @default(false)

  // New fields
  theme             String?   // e.g. "RECONNECTION", "COMMUNICATION", "INTIMACY", "SHARED_PROJECT"
  intensity         Int       @default(1) // 1 = light, 2 = deep, 3 = vulnerable
  ritualAction      String?   // optional, pressure-free micro-action
  therapistGuide    String?   // post-reveal conversation guide
}
```

Add a lightweight cycle tracker:

```prisma
model CoupleThemeCycle {
  id           String   @id @default(cuid())
  coupleId     String   @unique
  currentTheme String
  weekNumber   Int      @default(1) // 1-4
  startedAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([coupleId])
}
```

### Generation Flow

A scheduled edge function or Vercel Cron runs Monday/Wednesday/Friday at 11:30 for each couple's timezone.

```ts
// src/services/dailyQuestionService.ts
export async function generateRitualQuestionForCouple(coupleId: string) {
  const cycle = await getOrCreateCoupleThemeCycle(coupleId);
  const theme = getThemeForWeek(cycle.weekNumber);
  const question = await pickQuestionForTheme(theme);

  await createDailyQuestion({
    coupleId,
    questionId: question.id,
    theme,
    intensity: question.intensity,
    ritualAction: question.suggestedAction,
    therapistGuide: question.therapistGuide,
    releasedAt: getTodayNoon(cycle.couple.timezone),
  });
}
```

### Intensity Cooldown

No two consecutive intensity-3 questions within the same week. If Monday is intensity 3, Wednesday is capped at intensity 2.

### API Endpoints

Extend existing couple daily API:

- `GET /api/couple/daily` — returns the current ritual question, theme, therapist guide (only after reveal).
- `POST /api/couple/daily/answer` — submit or update answer.
- `POST /api/couple/daily/skip` — explicitly skip today's question.
- `GET /api/couple/themes` — history of themes (for "Notre évolution" tab).

All endpoints use `withApiHandler` + Zod + edge runtime.

### Frontend Components

- `ThemeLabel` — soft badge for current weekly theme.
- `RitualCard` — question + answer input + skip option.
- `RevealCard` — both answers + therapist guide + optional ritual.
- `WeeklyRecap` — Sunday-available soft summary.
- Update `CoupleDashboard` to reduce visual noise and emphasize calm.

---

## 4. Long-Term Reflection (Neural Tree)

The Neural Tree is **not a daily mechanic**. It grows silently in the background.

- Each completed ritual contributes to the couple's Tree.
- Each weekly theme colors a branch.
- Users discover the Tree through a secondary "Notre évolution" tab.
- No notifications about Tree growth. No badges.

The Tree becomes a **mirror for later self-evaluation**, not a daily reward.

---

## 5. Content & Ethics

### Question Bank Structure

4 themes, 6 questions per theme, 2 intensity levels = 48 base questions.

Themes:

1. **Reconnection** — presence, gratitude, needs.
2. **Communication** — listening, conflict, love languages.
3. **Intimacy** — desire, touch, vulnerability.
4. **Shared Project** — values, dreams, future.

Each question has:

- `theme`
- `intensity` (1-2; intensity 3 is rare and always optional)
- `text` (fr + en)
- `suggestedAction` (optional, pressure-free)
- `therapistGuide` (fr + en, post-reveal)

### Therapist Guide Examples

- "Prenez 3 minutes. Chacun raconte un moment récent où ce geste a compté. Pas de jugement, juste écouter."
- "Si vous le souhaitez, avant de dormir, dites à votre partenaire un merci concret."
- "Aucune obligation de résoudre quoi que ce soit. Le but est simplement de vous entendre."

### Ethics & Safety

- Skip option always visible and non-judgmental.
- Intensity 3 questions are rare and explicitly framed as optional.
- Disclaimer: "Captain Bond n'est pas un outil thérapeutique."
- Content reviewed/approved by a clinical psychologist.
- No guilt language. No "vous avez manqué 2 jours". No streaks.

---

## 6. Testing Strategy

### Unit Tests

- `src/services/__tests__/dailyQuestionService.test.ts`
  - Theme rotation cycles correctly.
  - Generation happens only on Mon/Wed/Fri.
  - No duplicate ritual for same couple/day.
  - Cooldown rule prevents two intensity-3 questions in a week.

### API Tests

- `src/app/api/couple/daily/route.test.ts`
  - Returns current ritual with theme and guide.
- `src/app/api/couple/daily/skip/route.test.ts`
  - Skip marks question as skipped without penalties.

### E2E Tests

- `e2e/couple-ritual.spec.ts`
  - Couple answers a ritual question.
  - Simulated reveal at 20h shows therapist guide.
  - Skip flow works without error.

---

## 7. Metrics & Success

- % couples answering at least 2 rituals per week.
- % rituals answered by both partners.
- Time spent in post-reveal guide screen.
- 7-day and 30-day couple retention.
- Conversion free → couple subscription (monthly/annual).
- **Anti-metric**: daily active users is not the goal. Quality of reconnection is.

---

## 8. Open Questions / Risks

- **Content creation**: 48 questions + therapist guides require quality copywriting and clinical review.
- **Notifications**: optional, gentle reminders only. Too many notifications kill the calm experience.
- **Timezone handling**: generation must respect each couple's timezone.
- **CoupleJoy similarity**: keep differentiation through rhythm (3x/week), tone (therapist), and absence of gamification.

---

## 9. Implementation Scope (MVP)

1. Extend `DailyQuestion` schema and run migration.
2. Add `CoupleThemeCycle` schema.
3. Seed 24 base questions (4 themes × 6 questions × 1 intensity).
4. Implement generation service for Mon/Wed/Fri schedule.
5. Update couple dashboard UI (theme label, ritual card, reveal card, weekly recap).
6. Add `/api/couple/daily/skip` endpoint.
7. Add unit + API tests.
8. E2E test for happy path and skip path.

Out of MVP:
- Full 48-question bank with intensity 2.
- Neural Tree thematic branches.
- Monthly text recap.
- Push notifications.
