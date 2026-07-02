import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { getAuthenticatedUser } from '@/lib/auth/user';
import {
  getCouplePortraitData,
  listCouplesForPortraitUser,
} from '@/services/couplePortraitService';

export const runtime = 'edge';

const querySchema = z.object({
  coupleId: z.string().optional(),
  userId: z.string().optional(),
  list: z.string().optional(),
  timezone: z.string().optional(),
});

export const GET = withApiHandler({
  querySchema,
  async handler({ req, query }) {
    const logger = createLogger({ route: '/api/couple/portrait' });
    const authUser = await getAuthenticatedUser(req);
    const { coupleId, list, timezone } = query;

    if (list === 'true') {
      try {
        const couples = await listCouplesForPortraitUser(authUser.id);
        return NextResponse.json(couples || []);
      } catch (e) {
        logger.error('Échec du chargement des couples', { userId: authUser.id }, e);
        throw new AppError('INTERNAL_ERROR', 'Impossible de charger la liste des couples.');
      }
    }

    if (!coupleId) {
      throw new AppError('BAD_REQUEST', 'coupleId est requis.');
    }

    const data = await getCouplePortraitData(coupleId, authUser.id, timezone);
    return NextResponse.json(data);
  },
});
