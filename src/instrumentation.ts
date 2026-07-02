import { validateEnv, getPublicEnvSummary } from '@/lib/env';
import { logger } from '@/lib/logger';

export function register() {
  validateEnv();

  logger.info('Koze server boot', {
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    integrations: getPublicEnvSummary(),
  });
}
