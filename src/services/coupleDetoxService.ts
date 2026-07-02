import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { requireCoupleMembership } from '@/lib/auth/coupleMembership';
import {
  updateDetoxSession,
  DetoxAction,
} from '@/lib/db/repositories/totemRepository';
import { TotemState } from '@/lib/db/types';

export interface DetoxInput {
  coupleId: string;
  action: DetoxAction;
  durationMinutes?: number;
}

export async function handleCoupleDetox(
  req: NextRequest,
  input: DetoxInput
): Promise<TotemState> {
  const authUser = await getAuthenticatedUser(req);
  await requireCoupleMembership(input.coupleId, authUser.id);
  return updateDetoxSession(input.coupleId, input.action, input.durationMinutes);
}
