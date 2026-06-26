import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler } from '../withApiHandler';
import { AppError } from '@/lib/errors';

function createRequest({
  method = 'POST',
  url = 'http://localhost/api/test',
  body,
}: {
  method?: string;
  url?: string;
  body?: unknown;
} = {}): NextRequest {
  const request = new Request(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  });
  return new NextRequest(request);
}

describe('withApiHandler', () => {
  it('returns the handler response', async () => {
    const handler = withApiHandler({
      bodySchema: z.object({ hello: z.string() }),
      async handler({ body }) {
        return NextResponse.json({ received: body });
      },
    });

    const req = createRequest({ body: { hello: 'world' } });
    const res = await handler(req);
    const json = await res.json();
    expect(json.received).toEqual({ hello: 'world' });
    expect(res.status).toBe(200);
  });

  it('validates the body with Zod', async () => {
    const handler = withApiHandler({
      bodySchema: z.object({ name: z.string().min(1) }),
      async handler({ body }) {
        if (!body) {
          return NextResponse.json({ error: 'Corps de requête manquant' }, { status: 400 });
        }
        return NextResponse.json({ name: body.name });
      },
    });

    const req = createRequest({ body: { name: '' } });
    const res = await handler(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.details).toBeDefined();
  });

  it('validates query parameters', async () => {
    const handler = withApiHandler({
      querySchema: z.object({ page: z.coerce.number().min(1) }),
      async handler({ query }) {
        return NextResponse.json({ page: query.page });
      },
    });

    const req = createRequest({ method: 'GET', url: 'http://localhost/api/test?page=0' });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('handles AppError with the correct status', async () => {
    const handler = withApiHandler({
      async handler() {
        throw new AppError('NOT_FOUND', 'Resource not found');
      },
    });

    const req = createRequest({ method: 'GET' });
    const res = await handler(req);
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
    expect(json.error).toBe('Resource not found');
  });

  it('masks unexpected errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = withApiHandler({
      async handler() {
        throw new Error('secret bug');
      },
    });

    const req = createRequest({ method: 'GET' });
    const res = await handler(req);
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.code).toBe('INTERNAL_ERROR');
    expect(json.error).toBe('Une erreur interne est survenue');
    consoleSpy.mockRestore();
  });

  it('enforces rate limits', async () => {
    const rateLimit = async () => ({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const handler = withApiHandler({
      rateLimit,
      async handler() {
        return NextResponse.json({ ok: true });
      },
    });

    const req = createRequest();
    const res = await handler(req);
    expect(res.status).toBe(429);
  });
});
