import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getProfileByCouple,
  createProfileForCouple,
  updateProfile,
  createQuestion,
  getQuestionById,
  updateQuestion,
} from '../coupleDjRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'prof-1', coupleId: 'couple-1', roomId: null, mood: 'DEEP' }, error: null }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'prof-2', coupleId: 'couple-1', roomId: null, mood: 'CHILL' }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'prof-1', mood: 'SPICY' }, error: null }),
          })),
        })),
      })),
    })),
  },
}));

describe('coupleDjRepository', () => {
  it('fetches a DJ profile by couple scoped to couple context', async () => {
    const profile = await getProfileByCouple('couple-1');
    expect(profile).toMatchObject({ id: 'prof-1', coupleId: 'couple-1', roomId: null, mood: 'DEEP' });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('DJProfile');
  });

  it('creates a DJ profile for a couple', async () => {
    const profile = await createProfileForCouple('couple-1', { mood: 'CHILL' });
    expect(profile).toMatchObject({ id: 'prof-2', coupleId: 'couple-1', roomId: null, mood: 'CHILL' });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('DJProfile');
  });

  it('updates a DJ profile', async () => {
    const profile = await updateProfile('prof-1', { mood: 'SPICY' });
    expect(profile).toMatchObject({ id: 'prof-1', mood: 'SPICY' });
  });
});
