import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedCoupleUser } from '@/lib/auth/couple';
import { AppError } from '@/lib/errors';
import { dbRetry } from '@/lib/db/withRetry';
import { Couple, DailyQuestion } from '@/lib/db/types';

export const runtime = 'edge';

const bodySchema = z.object({
  coupleId: z.string().min(1),
  dailyQuestionId: z.string().min(1),
  mood: z.object({
    energy: z.number().min(1).max(5),
    stress: z.number().min(1).max(5),
    feeling: z.string().optional(),
  }),
});

const GRATITUDE_PROMPT = "Micro-gratitude : partagez une petite attention ou une qualité que vous appréciez particulièrement chez votre partenaire aujourd'hui.";

export const POST = withApiHandler({
  bodySchema,
  async handler({ req, body }) {
    if (!body) {
      throw new AppError('BAD_REQUEST', 'Corps de requête manquant');
    }
    const authUser = await getAuthenticatedCoupleUser(req);
    const { coupleId, dailyQuestionId, mood } = body;

    // Verify couple membership
    const { data: couple, error: coupleError } = await dbRetry<Couple>(async () =>
      supabaseAdmin
        .from('Couple')
        .select('*')
        .eq('id', coupleId)
        .single()
    );

    if (coupleError || !couple || (couple.user1Id !== authUser.id && couple.user2Id !== authUser.id)) {
      throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
    }

    // Fetch the daily question
    const { data: dailyQuestion, error: dqError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .select('*')
        .eq('id', dailyQuestionId)
        .single()
    );

    if (dqError || !dailyQuestion) {
      throw new AppError('NOT_FOUND', 'Question quotidienne introuvable.');
    }

    const isUser1 = couple.user1Id === authUser.id;
    const moodUpdate: Record<string, any> = {};

    if (isUser1) {
      moodUpdate.user1Mood = mood;
    } else {
      moodUpdate.user2Mood = mood;
    }

    // Update DailyQuestion with this user's mood
    const { data: updatedMoodDQ, error: updateMoodError } = await dbRetry<DailyQuestion>(async () =>
      supabaseAdmin
        .from('DailyQuestion')
        .update(moodUpdate)
        .eq('id', dailyQuestionId)
        .select()
        .single()
    );

    if (updateMoodError || !updatedMoodDQ) {
      throw new AppError('INTERNAL_ERROR', 'Impossible de sauvegarder la météo émotionnelle.');
    }

    // Check if both moods are now submitted and adapt question accordingly
    const otherMood = isUser1 ? updatedMoodDQ.user2Mood : updatedMoodDQ.user1Mood;
    let finalDQ = updatedMoodDQ;

    if (mood && otherMood) {
      const activeMood = mood as any;
      const partnerMood = otherMood as any;

      const stressGap = Math.abs(activeMood.stress - partnerMood.stress);
      const energyGap = Math.abs(activeMood.energy - partnerMood.energy);

      let customText: string | null = null;

      if (activeMood.stress >= 4 || partnerMood.stress >= 4 || activeMood.energy <= 2 || partnerMood.energy <= 2) {
        // Cas 1: stress élevé ou forte fatigue → micro-gratitude
        customText = GRATITUDE_PROMPT;
      } else if (stressGap >= 3 || energyGap >= 3) {
        // Cas 2: grand écart de météo → message d'empathie et d'écoute active
        const isActiveLower = activeMood.stress > partnerMood.stress;
        customText = isActiveLower
          ? "Ton partenaire semble traverser un moment plus difficile que toi. Prends un instant pour lui demander comment tu peux l'alléger ce soir — sans obligation de réponse."
          : "Tu traverses un moment plus tendu que ton partenaire. Partage-lui une chose simple dont tu aurais besoin ce soir — confort, silence ou présence.";
      }

      if (customText) {
        const { data: updatedCustomText, error: textUpdateError } = await dbRetry<DailyQuestion>(async () =>
          supabaseAdmin
            .from('DailyQuestion')
            .update({
              customText,
              questionId: null
            })
            .eq('id', dailyQuestionId)
            .select()
            .single()
        );
        if (!textUpdateError && updatedCustomText) {
          finalDQ = updatedCustomText;
        }
      }
    }

    const moodGapDetected = (() => {
      if (!mood || !(updatedMoodDQ.user1Mood || updatedMoodDQ.user2Mood)) return false;
      const otherM = isUser1 ? updatedMoodDQ.user2Mood : updatedMoodDQ.user1Mood;
      if (!otherM) return false;
      const a = mood as any;
      const b = otherM as any;
      return Math.abs(a.stress - b.stress) >= 3 || Math.abs(a.energy - b.energy) >= 3;
    })();

    return NextResponse.json({ success: true, dailyQuestion: finalDQ, moodGapDetected });
  },
});
