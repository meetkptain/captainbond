# Rituels Couple Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a calm, therapist-guided couple ritual system (3 fixed weekly rituals: Monday/Wednesday/Friday) into the existing couple dashboard, with background Neural Tree growth and no gamification.

**Architecture:** Extend the existing `DailyQuestion` model with theme, intensity, ritual action, and therapist guide fields. Add a lightweight `CoupleThemeCycle` tracker. Generate rituals via a scheduled service three times per week. Update the couple dashboard UI to emphasize calm, emotional reconnection rather than scores or streaks.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma/Supabase, Zod, Tailwind, Vitest, Playwright.

---

## Files to Create or Modify

| File | Responsibility |
|------|----------------|
| `prisma/schema.prisma` | Add `theme`, `intensity`, `ritualAction`, `therapistGuide` to `DailyQuestion`; add `CoupleThemeCycle` model. |
| `prisma/migrations/20260702120000_add_themed_rituals/migration.sql` | Migration for schema changes. |
| `prisma/seed.ts` or `prisma/seeds/ritualQuestions.ts` | Seed 24 base ritual questions with themes and guides. |
| `src/lib/db/types.ts` | Update TypeScript types for `DailyQuestion` and add `CoupleThemeCycle`. |
| `src/lib/db/repositories/dailyQuestionRepository.ts` | Add repository helpers for rituals and cycle tracking. |
| `src/lib/db/repositories/coupleThemeCycleRepository.ts` | Repository for `CoupleThemeCycle` CRUD. |
| `src/services/ritualService.ts` | Core service: theme rotation, question generation, cooldown logic. |
| `src/services/__tests__/ritualService.test.ts` | Unit tests for ritual generation logic. |
| `src/app/api/couple/daily/route.ts` | Enrich GET to return current ritual with theme and guide. |
| `src/app/api/couple/daily/answer/route.ts` | Submit/update answer for current user. |
| `src/app/api/couple/daily/skip/route.ts` | Already exists; adjust if needed for new fields. |
| `src/app/api/couple/daily/route.test.ts` | API tests for ritual retrieval and answer. |
| `src/app/api/couple/daily/answer/route.test.ts` | API tests for answer submission. |
| `src/components/couple/ThemeLabel.tsx` | Soft theme badge component. |
| `src/components/couple/RitualCard.tsx` | Question + answer input + skip option. |
| `src/components/couple/RevealCard.tsx` | Both answers + therapist guide + optional ritual. |
| `src/components/couple/WeeklyRecap.tsx` | Soft Sunday recap component. |
| `src/app/(distanciel)/couple/page.tsx` | Integrate new components, reduce visual noise. |
| `e2e/couple-ritual.spec.ts` | E2E test for happy path and skip path. |

---

## Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add fields to `DailyQuestion`**

Find the `DailyQuestion` model and add these fields before the closing `}`:

```prisma
  // New fields for themed rituals
  theme             String?   // e.g. "RECONNECTION", "COMMUNICATION", "INTIMACY", "SHARED_PROJECT"
  intensity         Int       @default(1) // 1 = light, 2 = deep, 3 = vulnerable
  ritualAction      String?   // optional, pressure-free micro-action
  therapistGuide    String?   // post-reveal conversation guide
```

- [ ] **Step 2: Add `CoupleThemeCycle` model**

Append this model to the schema file:

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

- [ ] **Step 3: Run migration locally**

```bash
cd /Users/nicolasvirin/Desktop/toto/mescodes/captainbond
npx prisma migrate dev --name add_themed_rituals
```

Expected output: migration created and applied successfully.

- [ ] **Step 4: Regenerate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(couple): add themed ritual fields and CoupleThemeCycle model"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `src/lib/db/types.ts`

- [ ] **Step 1: Update `DailyQuestion` type**

Find the `DailyQuestion` interface and add:

```ts
  theme?: string | null;
  intensity: number;
  ritualAction?: string | null;
  therapistGuide?: string | null;
```

- [ ] **Step 2: Add `CoupleThemeCycle` type**

Add this interface near the other couple-related types:

```ts
export interface CoupleThemeCycle {
  id: string;
  coupleId: string;
  currentTheme: string;
  weekNumber: number;
  startedAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/types.ts
git commit -m "feat(couple): update types for themed rituals"
```

---

## Task 3: Add Repository Helpers

**Files:**
- Modify: `src/lib/db/repositories/dailyQuestionRepository.ts`
- Create: `src/lib/db/repositories/coupleThemeCycleRepository.ts`

### Part A: DailyQuestionRepository

- [ ] **Step 1: Add `getCurrentRitual` function**

Append to `src/lib/db/repositories/dailyQuestionRepository.ts`:

```ts
export async function getCurrentRitual(coupleId: string): Promise<DailyQuestion | null> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .gte('releasedAt', startOfToday.toISOString())
    .order('releasedAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as DailyQuestion | null;
}
```

- [ ] **Step 2: Add `listRecentRituals` function**

Append:

```ts
export async function listRecentRituals(coupleId: string, limit = 14): Promise<DailyQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from('DailyQuestion')
    .select('*')
    .eq('coupleId', coupleId)
    .order('releasedAt', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DailyQuestion[];
}
```

### Part B: CoupleThemeCycleRepository

- [ ] **Step 3: Create repository file**

Create `src/lib/db/repositories/coupleThemeCycleRepository.ts`:

```ts
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CoupleThemeCycle } from '../types';

const THEMES = ['RECONNECTION', 'COMMUNICATION', 'INTIMACY', 'SHARED_PROJECT'] as const;

export function getThemeForWeek(weekNumber: number): string {
  return THEMES[(weekNumber - 1) % THEMES.length];
}

export async function getCoupleThemeCycle(coupleId: string): Promise<CoupleThemeCycle | null> {
  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .select('*')
    .eq('coupleId', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data as CoupleThemeCycle | null;
}

export async function createCoupleThemeCycle(coupleId: string): Promise<CoupleThemeCycle> {
  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .insert({ coupleId, currentTheme: THEMES[0], weekNumber: 1 })
    .select()
    .single();
  if (error) throw error;
  return data as CoupleThemeCycle;
}

export async function advanceCoupleThemeCycle(cycle: CoupleThemeCycle): Promise<CoupleThemeCycle> {
  const nextDay = cycle.weekNumber >= 4 && cycle.dayOfWeek >= 3 ? 1 : (cycle.dayOfWeek ?? 1) + 1;
  const nextWeek = nextDay === 1 ? (cycle.weekNumber % THEMES.length) + 1 : cycle.weekNumber;
  const nextTheme = getThemeForWeek(nextWeek);

  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .update({ currentTheme: nextTheme, weekNumber: nextWeek, dayOfWeek: nextDay })
    .eq('id', cycle.id)
    .select()
    .single();
  if (error) throw error;
  return data as CoupleThemeCycle;
}
```

Wait — the schema in Task 1 does not include `dayOfWeek`. Remove that field from the repository or add it to the schema. For simplicity, remove `dayOfWeek` and track only week number, since rituals are fixed Mon/Wed/Fri and the scheduler handles the schedule.

Revised `advanceCoupleThemeCycle`:

```ts
export async function advanceCoupleThemeCycle(cycle: CoupleThemeCycle): Promise<CoupleThemeCycle> {
  const nextWeek = (cycle.weekNumber % THEMES.length) + 1;
  const nextTheme = getThemeForWeek(nextWeek);

  const { data, error } = await supabaseAdmin
    .from('CoupleThemeCycle')
    .update({ currentTheme: nextTheme, weekNumber: nextWeek })
    .eq('id', cycle.id)
    .select()
    .single();
  if (error) throw error;
  return data as CoupleThemeCycle;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/repositories/dailyQuestionRepository.ts src/lib/db/repositories/coupleThemeCycleRepository.ts
git commit -m "feat(couple): add ritual and theme cycle repositories"
```

---

## Task 4: Create Ritual Generation Service

**Files:**
- Create: `src/services/ritualService.ts`
- Create: `src/services/__tests__/ritualService.test.ts`

- [ ] **Step 1: Create the service**

Create `src/services/ritualService.ts`:

```ts
import { AppError } from '@/lib/errors';
import { DailyQuestion, Couple } from '@/lib/db/types';
import {
  createDailyQuestion,
  getCurrentRitual,
  listRecentRituals,
} from '@/lib/db/repositories/dailyQuestionRepository';
import {
  getCoupleThemeCycle,
  createCoupleThemeCycle,
  advanceCoupleThemeCycle,
  getThemeForWeek,
} from '@/lib/db/repositories/coupleThemeCycleRepository';
import { supabaseAdmin } from '@/lib/supabase-admin';

const RITUAL_DAYS = [1, 3, 5]; // Monday, Wednesday, Friday

export function isRitualDay(date: Date): boolean {
  return RITUAL_DAYS.includes(date.getDay());
}

export function getTodayNoon(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value ?? now.getFullYear();
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return new Date(`${year}-${month}-${day}T12:00:00`);
}

export async function getOrCreateThemeCycle(coupleId: string): Promise<{ id: string; weekNumber: number; currentTheme: string }> {
  const existing = await getCoupleThemeCycle(coupleId);
  if (existing) return existing;
  return createCoupleThemeCycle(coupleId);
}

export async function pickQuestionForTheme(theme: string, intensity: number): Promise<{ id: string; text: string; intensity: number; suggestedAction?: string | null; therapistGuide?: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('Question')
    .select('id, text, intensity, suggestedAction, therapistGuide')
    .eq('theme', theme)
    .eq('intensity', intensity)
    .limit(50);

  if (error) throw error;
  const questions = (data ?? []) as Array<{ id: string; text: string; intensity: number; suggestedAction?: string | null; therapistGuide?: string | null }>;

  if (questions.length === 0) {
    throw new AppError('NOT_FOUND', `No question found for theme ${theme} intensity ${intensity}`);
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

export function pickIntensity(recentRituals: DailyQuestion[]): number {
  const last = recentRituals[0];
  if (last && last.intensity >= 3) return 2;
  // Mostly light (1), sometimes deep (2), rarely vulnerable (3)
  const roll = Math.random();
  if (roll < 0.6) return 1;
  if (roll < 0.9) return 2;
  return 3;
}

export async function generateRitualForCouple(couple: Couple, now: Date = new Date()): Promise<DailyQuestion> {
  if (!isRitualDay(now)) {
    throw new AppError('BAD_REQUEST', 'Today is not a ritual day');
  }

  const existingToday = await getCurrentRitual(couple.id);
  if (existingToday) {
    return existingToday;
  }

  const cycle = await getOrCreateThemeCycle(couple.id);
  const theme = getThemeForWeek(cycle.weekNumber);
  const recentRituals = await listRecentRituals(couple.id, 7);
  const intensity = pickIntensity(recentRituals);
  const question = await pickQuestionForTheme(theme, intensity);

  const ritual = await createDailyQuestion({
    coupleId: couple.id,
    questionId: question.id,
    customText: question.text,
    theme,
    intensity,
    ritualAction: question.suggestedAction,
    therapistGuide: question.therapistGuide,
    releasedAt: getTodayNoon(couple.timezone).toISOString(),
  });

  await advanceCoupleThemeCycle(cycle);

  return ritual;
}
```

Note: `Couple` type must include `timezone`. Verify in `src/lib/db/types.ts` that `Couple` has `timezone: string`.

- [ ] **Step 2: Write failing tests**

Create `src/services/__tests__/ritualService.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isRitualDay,
  pickIntensity,
  getTodayNoon,
} from '@/services/ritualService';
import type { DailyQuestion } from '@/lib/db/types';

describe('ritualService', () => {
  describe('isRitualDay', () => {
    it('returns true for Monday', () => {
      expect(isRitualDay(new Date('2026-07-06'))).toBe(true); // Monday
    });
    it('returns true for Wednesday', () => {
      expect(isRitualDay(new Date('2026-07-08'))).toBe(true); // Wednesday
    });
    it('returns true for Friday', () => {
      expect(isRitualDay(new Date('2026-07-10'))).toBe(true); // Friday
    });
    it('returns false for Sunday', () => {
      expect(isRitualDay(new Date('2026-07-05'))).toBe(false); // Sunday
    });
  });

  describe('pickIntensity', () => {
    it('caps at 2 after an intensity-3 ritual', () => {
      const recent = [{ intensity: 3 }] as DailyQuestion[];
      expect(pickIntensity(recent)).toBe(2);
    });

    it('returns a valid intensity when no recent ritual', () => {
      const intensity = pickIntensity([]);
      expect([1, 2, 3]).toContain(intensity);
    });
  });

  describe('getTodayNoon', () => {
    it('returns noon in the given timezone', () => {
      const result = getTodayNoon('Europe/Paris');
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm run test -- src/services/__tests__/ritualService.test.ts --run
```

Expected: FAIL (module not found or function not exported).

- [ ] **Step 4: Run tests to verify they pass**

After implementing the service, run:

```bash
npm run test -- src/services/__tests__/ritualService.test.ts --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/ritualService.ts src/services/__tests__/ritualService.test.ts
git commit -m "feat(couple): add ritual generation service with tests"
```

---

## Task 5: Update Question Model Schema

**Files:**
- Modify: `prisma/schema.prisma`

The seed in Task 6 assumes `Question` has `theme`, `suggestedAction`, `therapistGuide`, and `intensity`. Add them first.

- [ ] **Step 1: Add fields to `Question` model**

Find the `Question` model and add:

```prisma
  theme           String?
  intensity       Int       @default(1)
  suggestedAction String?
  therapistGuide  String?
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_question_ritual_fields
```

- [ ] **Step 3: Regenerate client**

```bash
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(couple): add ritual fields to Question model"
```

---

## Task 6: Seed Base Ritual Questions

**Files:**
- Create: `prisma/seeds/ritualQuestions.ts`
- Modify: `prisma/seed.ts` (if it exists and should import the new seed)

- [ ] **Step 1: Create seed file**

Create `prisma/seeds/ritualQuestions.ts`:

```ts
export const ritualQuestions = [
  // RECONNECTION
  {
    text: 'Qu\'est-ce que ton/ta partenaire a fait récemment qui t\'a fait te sentir aimé(e) ?',
    theme: 'RECONNECTION',
    intensity: 1,
    suggestedAction: 'Avant de dormir, dites-vous un merci concret.',
    therapistGuide: 'Prenez 3 minutes. Chacun raconte un moment récent où ce geste a compté. Pas de jugement, juste écouter.',
  },
  {
    text: 'De quoi as-tu besoin en ce moment dans notre relation ?',
    theme: 'RECONNECTION',
    intensity: 2,
    suggestedAction: 'Demandez à votre partenaire : "Qu\'est-ce que je peux faire pour toi cette semaine ?"',
    therapistGuide: 'Écoutez sans chercher à résoudre. Le but est de comprendre, pas de réparer.',
  },
  {
    text: 'Quelle est une qualité de ton/ta partenaire que tu oublies trop souvent d\'apprécier ?',
    theme: 'RECONNECTION',
    intensity: 1,
    suggestedAction: 'Écrivez cette qualité dans un message vocal de 30 secondes.',
    therapistGuide: 'Partagez ce message avec sincérité. Recevoir une qualité perçue par l\'autre renforce le lien.',
  },
  {
    text: 'Quel petit rituel quotidien pourrait nous aider à nous sentir plus proches ?',
    theme: 'RECONNECTION',
    intensity: 1,
    suggestedAction: 'Choisissez ensemble un rituel et essayez-le demain.',
    therapistGuide: 'Un rituel ne doit pas être grand. Un café partagé, un câlin de 20 secondes, un mot doux suffisent.',
  },
  {
    text: 'Qu\'est-ce qui te fait te sentir seul(e) même quand nous sommes ensemble ?',
    theme: 'RECONNECTION',
    intensity: 2,
    suggestedAction: 'Aujourd\'hui, faites une activité ensemble sans téléphone pendant 15 minutes.',
    therapistGuide: 'Cette question demande du courage. Accordez-vous du temps pour en parler sans se défendre.',
  },
  {
    text: 'Quel souvenir récent ensemble te fait sourire ?',
    theme: 'RECONNECTION',
    intensity: 1,
    suggestedAction: 'Regardez une photo de ce moment ensemble ce soir.',
    therapistGuide: 'Revivre un souvenir positif ensemble active les mêmes émotions et renforce la connexion.',
  },

  // COMMUNICATION
  {
    text: 'Quand je te parle, qu\'est-ce qui t\'aide à te sentir vraiment entendu(e) ?',
    theme: 'COMMUNICATION',
    intensity: 1,
    suggestedAction: 'Pratiquez 5 minutes d\'écoute active : l\'un parle, l\'autre reformule.',
    therapistGuide: 'Reformuler ne signifie pas être d\'accord. Cela signifie : "J\'ai bien entendu ce que tu dis."',
  },
  {
    text: 'Quel sujet avons-nous tendance à éviter ? Pourquoi ?',
    theme: 'COMMUNICATION',
    intensity: 2,
    suggestedAction: 'Aujourd\'hui, abordez ce sujet pendant 10 minutes dans un lieu calme.',
    therapistGuide: 'Les sujets évités prennent de la place. Nommez-les doucement, sans obligation de tout résoudre.',
  },
  {
    text: 'Quelle est ta langue d\'amour principale en ce moment ?',
    theme: 'COMMUNICATION',
    intensity: 1,
    suggestedAction: 'Faites un geste dans la langue d\'amour de l\'autre aujourd\'hui.',
    therapistGuide: 'Les langages d\'amour évoluent. Ce qui comptait hier peut ne plus être le même aujourd\'hui.',
  },
  {
    text: 'Quand tu es en colère, comment peux-tu m\'aider à te comprendre ?',
    theme: 'COMMUNICATION',
    intensity: 2,
    suggestedAction: 'Inventez un mot-code pour dire "J\'ai besoin d\'une pause" sans agressivité.',
    therapistGuide: 'La colère cache souvent un besoin. Aider l\'autre à comprendre, c\'est désamorcer ensemble.',
  },
  {
    text: 'Quelle est une chose que j\'ai dite récemment qui t\'a touché(e) ?',
    theme: 'COMMUNICATION',
    intensity: 1,
    suggestedAction: 'Répétez cette phrase ou ce geste aujourd\'hui.',
    therapistGuide: 'Nommer ce qui touche encourage ce qui nous nourrit mutuellement.',
  },
  {
    text: 'Comment pourrions-nous mieux gérer un désaccord sans que personne ne se sente blessé ?',
    theme: 'COMMUNICATION',
    intensity: 2,
    suggestedAction: 'Écrivez ensemble une "règle d\'or" pour vos désaccords.',
    therapistGuide: 'Un désaccord n\'est pas une menace. C\'est une opportunité de mieux se connaître.',
  },

  // INTIMACY
  {
    text: 'Quel geste de tendresse te manque le plus en ce moment ?',
    theme: 'INTIMACY',
    intensity: 1,
    suggestedAction: 'Offrez ce geste aujourd\'hui, sans attendre de retour.',
    therapistGuide: 'La tendresse ne doit pas être transactionnelle. Un geste donné librement nourrit les deux.',
  },
  {
    text: 'Qu\'est-ce qui te met en confiance pour être vulnérable avec moi ?',
    theme: 'INTIMACY',
    intensity: 2,
    suggestedAction: 'Partagez un souvenir où vous vous êtes senti(e) en confiance avec l\'autre.',
    therapistGuide: 'La vulnérabilité grandit dans la confiance. Rappelez-vous ensemble ces moments.',
  },
  {
    text: 'Quelle est une petite attention qui te fait sentir désiré(e) ?',
    theme: 'INTIMACY',
    intensity: 1,
    suggestedAction: 'Faites cette attention aujourd\'hui.',
    therapistGuide: 'Le désir se nourrit de petites attentions répétées, pas seulement de grands moments.',
  },
  {
    text: 'Qu\'est-ce que l\'intimité signifie pour toi aujourd\'hui ?',
    theme: 'INTIMACY',
    intensity: 2,
    suggestedAction: 'Créez un moment de 15 minutes rien que pour vous deux, sans distraction.',
    therapistGuide: 'L\'intimité n\'est pas que physique. C\'est aussi le partage de ce qui est vrai.',
  },
  {
    text: 'Quel compliment aimeriez-vous entendre plus souvent ?',
    theme: 'INTIMACY',
    intensity: 1,
    suggestedAction: 'Dites ce compliment à voix haute aujourd\'hui.',
    therapistGuide: 'Les compliments sincères activent le système de récompense et renforcent le lien.',
  },
  {
    text: 'Qu\'est-ce qui te fait te sentir proche de moi physiquement ?',
    theme: 'INTIMACY',
    intensity: 2,
    suggestedAction: 'Partagez un câlin de 20 secondes minimum aujourd\'hui.',
    therapistGuide: 'Le contact physique libère de l\'oxytocine. Même un câlin long a un effet réel.',
  },

  // SHARED_PROJECT
  {
    text: 'Quel est un rêve que tu aimerais réaliser avec moi dans les 2 prochaines années ?',
    theme: 'SHARED_PROJECT',
    intensity: 1,
    suggestedAction: 'Notez ce rêve quelque part et discutez d\'une première petite étape.',
    therapistGuide: 'Un projet commun donne du sens à la relation. Même un petit rêve compte.',
  },
  {
    text: 'Quelles sont les 3 valeurs les plus importantes pour toi dans notre couple ?',
    theme: 'SHARED_PROJECT',
    intensity: 2,
    suggestedAction: 'Comparez vos listes et trouvez une valeur commune à célébrer cette semaine.',
    therapistGuide: 'Les valeurs partagées sont la boussole du couple. Nommez-les régulièrement.',
  },
  {
    text: 'Quelle est une tradition que nous devrions créer ensemble ?',
    theme: 'SHARED_PROJECT',
    intensity: 1,
    suggestedAction: 'Testez une première version de cette tradition ce week-end.',
    therapistGuide: 'Les traditions créent de l\'appartenance. Elles n\'ont pas besoin d\'être parfaites.',
  },
  {
    text: 'Quel est un défi que nous avons surmonté ensemble et dont nous pouvons être fiers ?',
    theme: 'SHARED_PROJECT',
    intensity: 1,
    suggestedAction: 'Racontez cette histoire à quelqu\'un ou écrivez-la ensemble.',
    therapistGuide: 'Se souvenir des défis surmontés renforce la confiance dans l\'avenir.',
  },
  {
    text: 'Comment imaginez-vous notre relation dans 10 ans ?',
    theme: 'SHARED_PROJECT',
    intensity: 2,
    suggestedAction: 'Dessinez ou écrivez une carte postale de votre vie dans 10 ans.',
    therapistGuide: 'Projeter ensemble active l\'engagement. Ce n\'est pas un contrat, c\'est une direction.',
  },
  {
    text: 'Quelle est une petite chose que nous pouvons améliorer ensemble ce mois-ci ?',
    theme: 'SHARED_PROJECT',
    intensity: 1,
    suggestedAction: 'Choisissez une action concrète et planifiez quand vous la ferez.',
    therapistGuide: 'L\'amélioration continue, même minime, crée un sentiment de progression partagée.',
  },
];
```

- [ ] **Step 2: Create seed runner**

Create `prisma/seeds/runRitualSeeds.ts`:

```ts
import { PrismaClient } from '@prisma/client';
import { ritualQuestions } from './ritualQuestions';

const prisma = new PrismaClient();

async function main() {
  for (const q of ritualQuestions) {
    await prisma.question.upsert({
      where: { id: `ritual-${q.theme}-${q.text.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `ritual-${q.theme}-${q.text.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
        text: q.text,
        mode: 'DATE_NIGHT',
        category: q.theme,
        intensity: q.intensity,
        theme: q.theme,
        suggestedAction: q.suggestedAction,
        therapistGuide: q.therapistGuide,
        isPremium: false,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Note: Verify that `Question` model supports `theme`, `suggestedAction`, `therapistGuide`, `intensity` fields. If not, add them to schema first.

- [ ] **Step 3: Run seed**

```bash
npx ts-node prisma/seeds/runRitualSeeds.ts
```

Expected: 24 questions inserted.

- [ ] **Step 4: Commit**

```bash
git add prisma/seeds/
git commit -m "feat(couple): seed 24 base ritual questions"
```

---

## Task 7: Update Couple Daily API

**Files:**
- Create: `src/app/api/couple/daily/route.ts`
- Create: `src/app/api/couple/daily/answer/route.ts`
- Modify: `src/app/api/couple/skip/route.ts` (if needed)

### Part A: GET /api/couple/daily

- [ ] **Step 1: Create route file**

Create `src/app/api/couple/daily/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple, DailyQuestion } from '@/lib/db/types';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().min(1),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId } = query;

    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin.from('Couple').select('*').eq('id', coupleId).single()
    );

    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const { data: ritual, error } = await dbRetry<DailyQuestion | null>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .select('*')
        .eq('coupleId', coupleId)
        .gte('releasedAt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('releasedAt', { ascending: false })
        .limit(1)
        .maybeSingle()
    );

    if (error) throw error;

    const isUser1 = couple.user1Id === authUser.id;
    const hasAnswered = isUser1 ? ritual?.user1Answered : ritual?.user2Answered;
    const partnerAnswered = isUser1 ? ritual?.user2Answered : ritual?.user1Answered;

    return NextResponse.json({
      ritual,
      me: { hasAnswered },
      partner: { hasAnswered: partnerAnswered },
      isRevealed: ritual?.isRevealed ?? false,
    });
  },
});
```

### Part B: POST /api/couple/daily/answer

- [ ] **Step 2: Create answer route**

Create `src/app/api/couple/daily/answer/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple, DailyQuestion } from '@/lib/db/types';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  answer: z.string().min(1, 'La réponse ne peut pas être vide'),
});

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, dailyQuestionId, answer } = body;

    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin.from('Couple').select('*').eq('id', coupleId).single()
    );

    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    const { data: dailyQuestion, error: dqError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin.from('DailyQuestion').select('*').eq('id', dailyQuestionId).single()
    );

    if (dqError || !dailyQuestion) {
      throw new AppError('NOT_FOUND', 'Rituel introuvable.');
    }

    if (dailyQuestion.coupleId !== coupleId) {
      throw new AppError('FORBIDDEN', 'Ce rituel ne correspond pas à votre couple.');
    }

    const isUser1 = couple.user1Id === authUser.id;
    const updates: Partial<DailyQuestion> = isUser1
      ? { user1Answer: answer, user1Answered: true }
      : { user2Answer: answer, user2Answered: true };

    updates.isAnswered = (isUser1 ? true : dailyQuestion.user2Answered) && (isUser1 ? dailyQuestion.user1Answered : true);

    const { data: updated, error: updateError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update(updates)
        .eq('id', dailyQuestionId)
        .select()
        .single()
    );

    if (updateError || !updated) {
      throw new AppError('INTERNAL_ERROR', 'Impossible d\'enregistrer la réponse.');
    }

    return NextResponse.json({ success: true, dailyQuestion: updated });
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/couple/daily/ src/app/api/couple/daily/answer/
git commit -m "feat(couple): add daily ritual GET and answer endpoints"
```

---

## Task 8: API Tests

**Files:**
- Create: `src/app/api/couple/daily/route.test.ts`
- Create: `src/app/api/couple/daily/answer/route.test.ts`

- [ ] **Step 1: Test GET /api/couple/daily**

Create `src/app/api/couple/daily/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/auth/couple', () => ({
  getAuthenticatedCoupleUser: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('GET /api/couple/daily', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ritual for authenticated couple member', async () => {
    const { getAuthenticatedCoupleUser } = await import('@/lib/auth/couple');
    const { supabaseAdmin } = await import('@/lib/supabase-admin');

    vi.mocked(getAuthenticatedCoupleUser).mockResolvedValue({ id: 'user-1' } as any);

    const coupleData = { id: 'couple-1', user1Id: 'user-1', user2Id: 'user-2', timezone: 'Europe/Paris' };
    const ritualData = {
      id: 'dq-1',
      coupleId: 'couple-1',
      theme: 'RECONNECTION',
      intensity: 1,
      user1Answered: true,
      user2Answered: false,
      isRevealed: false,
    };

    let callCount = 0;
    vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
      callCount++;
      if (callCount === 1) {
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: coupleData, error: null }) }) }),
        } as any;
      }
      return {
        select: () => ({
          eq: () => ({
            gte: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: () => Promise.resolve({ data: ritualData, error: null }),
                }),
              }),
            }),
          }),
        }),
      } as any;
    });

    const req = new Request('http://localhost/api/couple/daily?coupleId=couple-1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ritual.theme).toBe('RECONNECTION');
    expect(json.me.hasAnswered).toBe(true);
    expect(json.partner.hasAnswered).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test -- src/app/api/couple/daily/route.test.ts --run
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/couple/daily/route.test.ts src/app/api/couple/daily/answer/route.test.ts
git commit -m "test(couple): add ritual API tests"
```

---

## Task 9: Create UI Components

**Files:**
- Create: `src/components/couple/ThemeLabel.tsx`
- Create: `src/components/couple/RitualCard.tsx`
- Create: `src/components/couple/RevealCard.tsx`
- Create: `src/components/couple/WeeklyRecap.tsx`

### ThemeLabel

- [ ] **Step 1: Create component**

Create `src/components/couple/ThemeLabel.tsx`:

```tsx
'use client';

import React from 'react';

const THEME_LABELS: Record<string, { fr: string; en: string }> = {
  RECONNECTION: { fr: 'Reconnexion', en: 'Reconnection' },
  COMMUNICATION: { fr: 'Communication', en: 'Communication' },
  INTIMACY: { fr: 'Intimité', en: 'Intimacy' },
  SHARED_PROJECT: { fr: 'Projet commun', en: 'Shared Project' },
};

interface Props {
  theme: string;
  lang: 'fr' | 'en';
}

export function ThemeLabel({ theme, lang }: Props) {
  const label = THEME_LABELS[theme]?.[lang] ?? theme;
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10">
      {lang === 'fr' ? 'Cette semaine' : 'This week'} : {label}
    </span>
  );
}
```

### RitualCard

- [ ] **Step 2: Create component**

Create `src/components/couple/RitualCard.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import type { DailyQuestion } from '@/lib/db/types';

interface Props {
  ritual: DailyQuestion;
  hasAnswered: boolean;
  lang: 'fr' | 'en';
  onSubmit: (answer: string) => void;
  onSkip: () => void;
}

export function RitualCard({ ritual, hasAnswered, lang, onSubmit, onSkip }: Props) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-950/50 border border-white/10 rounded-2xl p-6 space-y-4">
      <p className="text-xs text-white/50 uppercase tracking-wider">
        {lang === 'fr' ? 'Rituel du jour' : 'Today\'s ritual'}
      </p>
      <h2 className="text-xl font-medium text-white leading-relaxed">
        {ritual.customText ?? ritual.question?.text}
      </h2>
      {hasAnswered ? (
        <p className="text-sm text-green-400">
          {lang === 'fr' ? 'Votre réponse est enregistrée. Révélation à 20h.' : 'Your answer is saved. Reveal at 8 PM.'}
        </p>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={240}
            placeholder={lang === 'fr' ? 'Écris ta réponse ici...' : 'Write your answer here...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple min-h-[120px]"
          />
          <div className="flex gap-3">
            <button
              onClick={() => onSubmit(answer)}
              disabled={!answer.trim()}
              className="flex-1 bg-neon-purple text-white font-medium py-3 rounded-xl disabled:opacity-40"
            >
              {lang === 'fr' ? 'Enregistrer ma réponse' : 'Save my answer'}
            </button>
            <button
              onClick={onSkip}
              className="px-4 text-sm text-white/50 hover:text-white"
            >
              {lang === 'fr' ? 'Pas aujourd\'hui' : 'Not today'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### RevealCard

- [ ] **Step 3: Create component**

Create `src/components/couple/RevealCard.tsx`:

```tsx
'use client';

import React from 'react';
import type { DailyQuestion } from '@/lib/db/types';

interface Props {
  ritual: DailyQuestion;
  partnerName: string;
  lang: 'fr' | 'en';
}

export function RevealCard({ ritual, partnerName, lang }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto bg-slate-950/50 border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">{lang === 'fr' ? 'Toi' : 'You'}</p>
          <p className="text-white">{ritual.user1Answer}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">{partnerName}</p>
          <p className="text-white">{ritual.user2Answer}</p>
        </div>
      </div>

      {ritual.therapistGuide && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">
            {lang === 'fr' ? '3 minutes ensemble' : '3 minutes together'}
          </p>
          <p className="text-sm text-amber-100 leading-relaxed">{ritual.therapistGuide}</p>
        </div>
      )}

      {ritual.ritualAction && (
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
            {lang === 'fr' ? 'Rituel optionnel' : 'Optional ritual'}
          </p>
          <p className="text-sm text-white/80">{ritual.ritualAction}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/couple/ThemeLabel.tsx src/components/couple/RitualCard.tsx src/components/couple/RevealCard.tsx
git commit -m "feat(couple): add ritual UI components"
```

---

## Task 10: Integrate into Couple Dashboard

**Files:**
- Modify: `src/app/(distanciel)/couple/page.tsx`

- [ ] **Step 1: Import new components**

Add at the top:

```tsx
import { ThemeLabel } from '@/components/couple/ThemeLabel';
import { RitualCard } from '@/components/couple/RitualCard';
import { RevealCard } from '@/components/couple/RevealCard';
```

- [ ] **Step 2: Add ritual data fetching**

Inside the main component, add state and fetch:

```tsx
const [ritual, setRitual] = useState<DailyQuestionData | null>(null);
const [ritualLoading, setRitualLoading] = useState(true);

useEffect(() => {
  if (!couple) return;
  api.get<{ ritual: DailyQuestionData; me: { hasAnswered: boolean }; partner: { hasAnswered: boolean }; isRevealed: boolean }>(`/api/couple/daily?coupleId=${couple.id}`)
    .then((data) => {
      setRitual(data.ritual);
      setHasAnswered(data.me.hasAnswered);
      setPartnerAnswered(data.partner.hasAnswered);
      setIsRevealed(data.isRevealed);
    })
    .catch(console.error)
    .finally(() => setRitualLoading(false));
}, [couple]);
```

- [ ] **Step 3: Determine partner name**

Add near other derived values:

```tsx
const partnerName = couple?.user1Id === userId ? partner2Name : partner1Name;
```

(Assume `partner1Name` and `partner2Name` are already fetched or hardcoded as fallback.)

- [ ] **Step 4: Render ritual section**

Replace or add in the JSX:

```tsx
{!ritualLoading && ritual && (
  <section className="py-8">
    <div className="flex justify-center mb-6">
      <ThemeLabel theme={ritual.theme ?? 'RECONNECTION'} lang={language as 'fr' | 'en'} />
    </div>
    {isRevealed ? (
      <RevealCard
        ritual={ritual}
        partnerName={partnerName}
        lang={language as 'fr' | 'en'}
      />
    ) : (
      <RitualCard
        ritual={ritual}
        hasAnswered={hasAnswered}
        lang={language as 'fr' | 'en'}
        onSubmit={async (answer) => {
          await api.post('/api/couple/daily/answer', {
            coupleId: couple?.id,
            dailyQuestionId: ritual.id,
            answer,
          });
          setHasAnswered(true);
        }}
        onSkip={async () => {
          await api.post('/api/couple/skip', {
            coupleId: couple?.id,
            dailyQuestionId: ritual.id,
          });
        }}
      />
    )}
  </section>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(distanciel)/couple/page.tsx
git commit -m "feat(couple): integrate ritual components into dashboard"
```

---

## Task 11: Scheduler for Ritual Generation

**Files:**
- Create: `src/app/api/cron/rituals/route.ts`
- Modify: `vercel.json` (if exists)

- [ ] **Step 1: Create cron route**

Create `src/app/api/cron/rituals/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateRitualForCouple, isRitualDay } from '@/services/ritualService';
import { Couple } from '@/lib/db/types';

export const runtime = 'edge';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  if (!isRitualDay(now)) {
    return NextResponse.json({ generated: 0, reason: 'not a ritual day' });
  }

  const { data: couples, error } = await supabaseAdmin.from('Couple').select('*');
  if (error || !couples) {
    return NextResponse.json({ error: 'Failed to fetch couples' }, { status: 500 });
  }

  let generated = 0;
  for (const couple of couples as Couple[]) {
    try {
      await generateRitualForCouple(couple, now);
      generated++;
    } catch (e) {
      console.error(`Failed to generate ritual for couple ${couple.id}`, e);
    }
  }

  return NextResponse.json({ generated });
}
```

- [ ] **Step 2: Configure Vercel cron**

Create or update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/rituals",
      "schedule": "30 11 * * 1,3,5"
    }
  ]
}
```

- [ ] **Step 3: Add CRON_SECRET to env**

Add to `.env.example`:

```
CRON_SECRET=your-random-secret
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/rituals/route.ts vercel.json .env.example
git commit -m "feat(couple): add ritual generation cron"
```

---

## Task 12: E2E Test

**Files:**
- Create: `e2e/couple-ritual.spec.ts`

- [ ] **Step 1: Create E2E spec**

Create `e2e/couple-ritual.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { createCouple, cleanupCouple } from './fixtures/api';
import { isSupabaseHealthy } from './fixtures/health';

test.describe('couple ritual', () => {
  test.beforeAll(async () => {
    const healthy = await isSupabaseHealthy();
    test.skip(!healthy, 'Supabase not healthy — skipping couple ritual E2E tests');
  });

  test('couple can answer a ritual and see reveal', async ({ browser }) => {
    const couple = await createCouple('RitualTest');

    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();

    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();

    try {
      await page1.goto(`/couple?userId=${couple.user1Id}`);
      await page2.goto(`/couple?userId=${couple.user2Id}`);

      await expect(page1.locator('text=Rituel du jour')).toBeVisible({ timeout: 5000 });
      await expect(page2.locator('text=Rituel du jour')).toBeVisible({ timeout: 5000 });

      await page1.locator('textarea').fill('Ma réponse 1');
      await page1.locator('button:has-text("Enregistrer ma réponse")').click();

      await page2.locator('textarea').fill('Ma réponse 2');
      await page2.locator('button:has-text("Enregistrer ma réponse")').click();

      await expect(page1.locator('text=Révélation à 20h')).toBeVisible();
      await expect(page2.locator('text=Révélation à 20h')).toBeVisible();
    } finally {
      await ctx1.close();
      await ctx2.close();
      await cleanupCouple(couple.coupleId);
    }
  });

  test('couple can skip a ritual without error', async ({ browser }) => {
    const couple = await createCouple('RitualSkip');
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    try {
      await page.goto(`/couple?userId=${couple.user1Id}`);
      await expect(page.locator('text=Pas aujourd\'hui')).toBeVisible({ timeout: 5000 });
      await page.locator('text=Pas aujourd\'hui').click();
      await expect(page.locator('text=Rituel du jour')).not.toBeVisible();
    } finally {
      await ctx.close();
      await cleanupCouple(couple.coupleId);
    }
  });
});
```

Note: `createCouple` and `cleanupCouple` fixtures may need to be added to `e2e/fixtures/api.ts` if they don't exist.

- [ ] **Step 2: Commit**

```bash
git add e2e/couple-ritual.spec.ts
git commit -m "test(couple): add ritual E2E tests"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run unit tests**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no new errors introduced.

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "chore(couple): final fixes for rituels couple"
```

---

## Self-Review Checklist

- [ ] Spec coverage: every section of the design doc maps to at least one task.
- [ ] No placeholders: every task has code, commands, and expected output.
- [ ] Type consistency: `DailyQuestion`, `CoupleThemeCycle`, and `Question` types match across files.
- [ ] Tests: unit, API, and E2E tests included.
- [ ] Security: cron endpoint protected by `CRON_SECRET`.
- [ ] Ethics: skip option always visible, no guilt language in UI.
