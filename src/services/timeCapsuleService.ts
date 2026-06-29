import { AppError } from '@/lib/errors';
import {
  listTimeCapsules,
  createTimeCapsule,
  unlockDueCapsules,
} from '@/lib/db/repositories/timeCapsuleRepository';
import { TimeCapsule } from '@/lib/db/types';

// Durées de verrouillage prédéfinies
export const CAPSULE_DURATIONS = {
  ONE_MONTH: 30,
  THREE_MONTHS: 90,
  SIX_MONTHS: 180,
  ONE_YEAR: 365,
} as const;

export async function getCapsules(coupleId: string): Promise<TimeCapsule[]> {
  // Vérifier et déverrouiller les capsules échues avant de retourner
  await unlockDueCapsules(coupleId);
  return listTimeCapsules(coupleId);
}

export async function sealCapsule(
  coupleId: string,
  senderId: string,
  content: string,
  daysUntilUnlock: number
): Promise<TimeCapsule> {
  if (!content.trim()) {
    throw new AppError('BAD_REQUEST', 'Le contenu de la capsule ne peut pas être vide.');
  }
  if (content.length > 2000) {
    throw new AppError('BAD_REQUEST', 'Le contenu est limité à 2000 caractères.');
  }
  if (daysUntilUnlock < 1 || daysUntilUnlock > 365) {
    throw new AppError('BAD_REQUEST', 'La durée doit être comprise entre 1 et 365 jours.');
  }

  const unlocksAt = new Date();
  unlocksAt.setDate(unlocksAt.getDate() + daysUntilUnlock);

  return createTimeCapsule({
    coupleId,
    senderId,
    content,
    unlocksAt: unlocksAt.toISOString(),
  });
}
