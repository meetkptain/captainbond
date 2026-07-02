import { PrismaClient } from '@prisma/client';
import { ritualQuestions } from './ritualQuestions';

export async function seedRitualQuestions(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const q of ritualQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        text: q.text,
        theme: q.theme,
        intensityLevel: q.intensityLevel,
        suggestedAction: q.suggestedAction,
        therapistGuide: q.therapistGuide,
      },
      create: {
        id: q.id,
        mode: 'DATE_NIGHT',
        text: q.text,
        category: q.theme,
        intensityLevel: q.intensityLevel,
        theme: q.theme,
        suggestedAction: q.suggestedAction,
        therapistGuide: q.therapistGuide,
        isPremium: false,
        isTimed: false,
        tags: ['couple', 'ritual', q.theme.toLowerCase()],
        audiences: ['couple'],
      },
    });
    inserted++;
  }
  console.log(`✅ ${inserted} ritual questions seeded.`);
}
