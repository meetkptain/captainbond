import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateUserEntitlements } from '@/lib/monetization/entitlements';
import { grantCoupleTrial } from '../coupleTrialService';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/monetization/entitlements', () => ({
  invalidateUserEntitlements: vi.fn(),
}));

function buildFrom() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
  };
}

describe('coupleTrialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation(() => buildFrom());
  });

  it('grants a trial when none exists', async () => {
    const fromMock = buildFrom();
    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation(() => fromMock);

    await grantCoupleTrial('user-1');

    expect(fromMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        source: 'couple_trial',
      }),
      expect.objectContaining({ onConflict: 'userId,source' }),
    );
    expect(fromMock.update).toHaveBeenCalledWith(expect.objectContaining({ activePassExpiresAt: expect.any(String) }));
    expect(invalidateUserEntitlements).toHaveBeenCalledWith('user-1');
  });

  it('skips when a couple_trial pass already exists', async () => {
    const userPassMock = buildFrom();
    userPassMock.maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'pass-1' }, error: null });
    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'UserPass') return userPassMock;
      return buildFrom();
    });

    await grantCoupleTrial('user-1');

    expect(userPassMock.upsert).not.toHaveBeenCalled();
    expect(userPassMock.update).not.toHaveBeenCalled();
    expect(invalidateUserEntitlements).not.toHaveBeenCalled();
  });
});
