import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { insertWebhookEventIfNotExists } from '../webhookEventRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: { rpc: vi.fn() },
}));

describe('insertWebhookEventIfNotExists', () => {
  it('returns inserted=true on new event', async () => {
    (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: true, error: null });

    const result = await insertWebhookEventIfNotExists('evt_1', 'checkout.session.completed', { id: 'evt_1' });

    expect(result.inserted).toBe(true);
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('insert_webhook_event_if_not_exists', {
      p_stripe_event_id: 'evt_1',
      p_event_type: 'checkout.session.completed',
      p_payload: { id: 'evt_1' },
    });
  });

  it('returns inserted=false when event already exists', async () => {
    (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: false, error: null });

    const result = await insertWebhookEventIfNotExists('evt_1', 'checkout.session.completed', { id: 'evt_1' });

    expect(result.inserted).toBe(false);
  });

  it('throws on rpc error', async () => {
    (supabaseAdmin.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: new Error('db error') });

    await expect(insertWebhookEventIfNotExists('evt_1', 'checkout.session.completed', {})).rejects.toThrow('db error');
  });
});
