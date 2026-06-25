import { request } from '@playwright/test';

export async function isSupabaseHealthy(): Promise<boolean> {
  const context = await request.newContext();
  try {
    const response = await context.get('/api/health');
    if (!response.ok()) return false;
    const body = await response.json();
    return body.checks?.supabase === 'ok';
  } catch {
    return false;
  } finally {
    await context.dispose();
  }
}
