import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import { adminActionLimiter } from '@/lib/rate-limit';
import { getPresignedUploadUrl } from '@/services/storageService';

export const runtime = 'edge';

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  fileType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/, 'Type MIME image requis'),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024, 'Fichier trop volumineux (max 10 Mo)'),
});

export const POST = withApiHandler({
  bodySchema: presignSchema,
  rateLimit: adminActionLimiter,
  async handler({ req, body }) {
    await requireAdminSession(req);
    const result = await getPresignedUploadUrl(body);
    return NextResponse.json(result);
  },
});
