import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { AppError, isAppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

export interface ApiContext<TBody = unknown, TQuery = Record<string, string | undefined>> {
  req: NextRequest;
  body: TBody;
  query: TQuery;
}

export type ApiHandler<TBody = unknown, TQuery = Record<string, string | undefined>> = (
  ctx: ApiContext<TBody, TQuery>
) => Response | NextResponse | Promise<Response | NextResponse>;

export interface RateLimitCheck {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export type RateLimiter = (req: NextRequest) => Promise<RateLimitCheck>;

export interface WithApiHandlerOptions<
  TBody = unknown,
  TQuery = Record<string, string | undefined>
> {
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  rateLimit?: RateLimiter;
  handler: ApiHandler<TBody, TQuery>;
}

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}

function attachRequestId(response: Response | NextResponse, requestId: string): Response | NextResponse {
  response.headers.set('x-request-id', requestId);
  return response;
}

export function withApiHandler<
  TBody = unknown,
  TQuery = Record<string, string | undefined>
>(options: WithApiHandlerOptions<TBody, TQuery>) {
  return async function handler(req: NextRequest): Promise<Response | NextResponse> {
    const start = Date.now();
    const requestId = req.headers.get('x-request-id') || 'unknown';
    const route = req.nextUrl.pathname;
    const method = req.method;
    const logger = createLogger({ requestId, route, method });

    try {
      logger.debug('API request started');

      // Rate limiting
      if (options.rateLimit) {
        const limit = await options.rateLimit(req);
        if (!limit.success) {
          const response = NextResponse.json(
            {
              error: 'Trop de requêtes. Veuillez réessayer plus tard.',
              code: 'RATE_LIMITED',
            },
            { status: 429 }
          );
          response.headers.set('X-RateLimit-Limit', String(limit.limit));
          response.headers.set('X-RateLimit-Remaining', String(limit.remaining));
          response.headers.set('X-RateLimit-Reset', String(limit.reset));
          return attachRequestId(response, requestId);
        }
      }

      // Query validation
      let query: TQuery = {} as TQuery;
      if (options.querySchema) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
        const parsed = options.querySchema.safeParse(searchParams);
        if (!parsed.success) {
          logger.warn('Query validation failed', { errors: formatZodErrors(parsed.error) });
          return attachRequestId(
            NextResponse.json(
              {
                error: 'Paramètres invalides',
                code: 'VALIDATION_ERROR',
                details: formatZodErrors(parsed.error),
              },
              { status: 400 }
            ),
            requestId
          );
        }
        query = parsed.data;
      }

      // Body validation (only when a schema is provided)
      let body: TBody = undefined as unknown as TBody;
      if (options.bodySchema && req.method !== 'GET') {
        let rawBody: unknown;
        try {
          rawBody = await req.json();
        } catch {
          return attachRequestId(
            NextResponse.json(
              { error: 'Corps de requête JSON invalide', code: 'BAD_REQUEST' },
              { status: 400 }
            ),
            requestId
          );
        }

        const parsed = options.bodySchema.safeParse(rawBody);
        if (!parsed.success) {
          logger.warn('Body validation failed', { errors: formatZodErrors(parsed.error) });
          return attachRequestId(
            NextResponse.json(
              {
                error: 'Données invalides',
                code: 'VALIDATION_ERROR',
                details: formatZodErrors(parsed.error),
              },
              { status: 400 }
            ),
            requestId
          );
        }
        body = parsed.data;
      }

      const response = await options.handler({ req, body, query });
      const duration = Date.now() - start;
      logger.info('API request completed', { status: response.status, durationMs: duration });
      return attachRequestId(response, requestId);
    } catch (error) {
      const duration = Date.now() - start;
      if (isAppError(error)) {
        logger.warn('API request failed', {
          status: error.status,
          code: error.code,
          durationMs: duration,
        }, error);
        return attachRequestId(
          NextResponse.json(
            {
              error: error.message,
              code: error.code,
              details: error.details,
            },
            { status: error.status }
          ),
          requestId
        );
      }

      logger.error('API unexpected error', { durationMs: duration }, error);

      return attachRequestId(
        NextResponse.json(
          {
            error: 'Une erreur interne est survenue',
            code: 'INTERNAL_ERROR',
          },
          { status: 500 }
        ),
        requestId
      );
    }
  };
}
