import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import { uuidSchema } from '@/lib/schemas/api';
import { endRoomByAdmin } from '@/services/adminService';
import { adminActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const endRoomSchema = z.object({
  roomId: uuidSchema,
});

export const POST = withApiHandler({
  bodySchema: endRoomSchema,
  rateLimit: adminActionLimiter,
  async handler({ req, body }) {
    await requireAdminSession(req);
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    await endRoomByAdmin(body.roomId);
    return NextResponse.json({ success: true });
  },
});
