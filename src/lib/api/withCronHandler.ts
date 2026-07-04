import { NextResponse } from 'next/server';
import { AppError, isAppError } from '@/lib/errors';
import { acquireCronLock, releaseCronLock } from '@/lib/cron/lock';
import { createLogger } from '@/lib/logger';

export type CronHandler = () => Promise<Response>;

export interface WithCronHandlerOptions {
  handler: CronHandler;
  lockKey: string;
}



export function withCronHandler(options: WithCronHandlerOptions) {
  const { handler, lockKey } = options;
  return async function cronHandler(req: Request): Promise<Response> {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('Authorization');
    const expected = `Bearer ${cronSecret}`;

    if (!cronSecret || authHeader !== expected) {
      throw new AppError('UNAUTHORIZED', 'Accès réservé au scheduler.');
    }

    const lockAcquired = await acquireCronLock(lockKey);
    if (!lockAcquired) {
      return NextResponse.json({ success: true, reason: 'already_running' });
    }

    try {
      return await handler();
    } catch (error) {
      const logger = createLogger({ route: `cron:${lockKey}` });
      if (isAppError(error)) {
        logger.warn('Cron error', { code: error.code, message: error.message });
      } else {
        logger.error('Cron unexpected error', {}, error);
      }
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    } finally {
      await releaseCronLock(lockKey);
    }
  };
}
