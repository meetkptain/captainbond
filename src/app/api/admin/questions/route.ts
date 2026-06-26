import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { requireAdminSession } from '@/lib/auth/admin';
import {
  getQuestionsList,
  addQuestion,
  addQuestionsBulk,
  patchQuestion,
  removeQuestion,
} from '@/services/questionService';
import {
  questionCreateSchema,
  questionBulkCreateSchema,
  questionUpdateSchema,
} from '@/lib/schemas/api';
import { adminActionLimiter } from '@/lib/rate-limit';

export const runtime = 'edge';

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  mode: z.string().optional(),
});

const deleteQuerySchema = z.object({
  id: z.string().uuid(),
});

export const GET = withApiHandler({
  querySchema: listQuerySchema,
  rateLimit: adminActionLimiter,
  async handler({ req, query }) {
    await requireAdminSession(req);
    const result = await getQuestionsList(query);
    return NextResponse.json({ success: true, ...result });
  },
});

const bulkOrSingleQuestionSchema = z.union([questionCreateSchema, questionBulkCreateSchema]);

export const POST = withApiHandler({
  bodySchema: bulkOrSingleQuestionSchema,
  rateLimit: adminActionLimiter,
  async handler({ req, body }) {
    await requireAdminSession(req);
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (Array.isArray(body)) {
      const questions = await addQuestionsBulk(body);
      return NextResponse.json({ success: true, count: questions.length, questions });
    }

    const question = await addQuestion(body);
    return NextResponse.json({ success: true, question });
  },
});

export const PUT = withApiHandler({
  bodySchema: questionUpdateSchema,
  rateLimit: adminActionLimiter,
  async handler({ req, body }) {
    await requireAdminSession(req);
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant', code: 'BAD_REQUEST' }, { status: 400 });
    }
    const { id, ...updates } = body;
    const question = await patchQuestion(id, updates);
    return NextResponse.json({ success: true, question });
  },
});

export const DELETE = withApiHandler({
  querySchema: deleteQuerySchema,
  rateLimit: adminActionLimiter,
  async handler({ req, query }) {
    await requireAdminSession(req);
    await removeQuestion(query.id);
    return NextResponse.json({ success: true, message: 'Question supprimée avec succès.' });
  },
});
