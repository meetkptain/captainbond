import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { pingRedis } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';
import { withTimeout } from '@/lib/fetch';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface HealthChecks {
  supabase: 'ok' | 'error';
  upstash: 'ok' | 'error' | 'skipped';
  stripe: 'ok' | 'error';
  adminJwt: 'ok' | 'error';
  playerJwt: 'ok' | 'error';
}

let bootTime: number | null = null;

export async function GET(req: Request) {
  if (bootTime === null) {
    bootTime = Date.now();
  }

  const requestId = req.headers.get('x-request-id') || 'health-check';
  const logger = createLogger({ requestId, route: '/api/health' });

  const checks: Partial<HealthChecks> = {};

  try {
    const { error } = await supabaseAdmin.from('Room').select('id').limit(1);
    checks.supabase = error ? 'error' : 'ok';
    if (error) {
      logger.error('Supabase health check failed', {}, error);
    }
  } catch (e) {
    checks.supabase = 'error';
    logger.error('Supabase health check exception', {}, e);
  }

  try {
    checks.upstash = await pingRedis();
  } catch (e) {
    checks.upstash = 'error';
    logger.error('Upstash health check exception', {}, e);
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      checks.stripe = 'error';
    } else {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-05-27.dahlia',
        httpClient: Stripe.createFetchHttpClient(),
      });
      await withTimeout(stripe.customers.list({ limit: 0 }), 5000);
      checks.stripe = 'ok';
    }
  } catch (e) {
    checks.stripe = 'error';
    logger.error('Stripe health check failed', {}, e);
  }

  checks.adminJwt = process.env.ADMIN_JWT_SECRET ? 'ok' : 'error';
  checks.playerJwt = process.env.PLAYER_JWT_SECRET ? 'ok' : 'error';

  const allOk = Object.values(checks).every((c) => c === 'ok' || c === 'skipped');
  const status = allOk ? 200 : 503;

  const response = NextResponse.json(
    {
      status: allOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: bootTime ? Math.floor((Date.now() - bootTime) / 1000) : 0,
      checks,
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV || 'development',
    },
    { status }
  );

  response.headers.set('x-request-id', requestId);
  return response;
}
