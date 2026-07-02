import { getCoupleById } from '@/lib/db/repositories/coupleRepository';
import { AppError } from '@/lib/errors';

export async function requireCoupleMembership(coupleId: string, userId: string): Promise<void> {
  const couple = await getCoupleById(coupleId);
  if (!couple || (couple.user1Id !== userId && couple.user2Id !== userId)) {
    throw new AppError('FORBIDDEN', 'Vous ne faites pas partie de ce couple.');
  }
}
