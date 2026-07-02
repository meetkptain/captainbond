import { describe, it, expect, vi } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getProfileByRoom, createProfileForRoom, updateProfile, createQuestion, getQuestionById, updateQuestion } from '../roomDjRepository';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'prof-1', roomId: 'room-1', coupleId: null, mood: 'DEEP' }, error: null }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'prof-2', roomId: 'room-1', coupleId: null, mood: 'CHILL' }, error: null }),
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

describe('roomDjRepository', () => {
  it('fetches a DJ profile by room scoped to room context', async () => {
    const profile = await getProfileByRoom('room-1');
    expect(profile).toMatchObject({ id: 'prof-1', roomId: 'room-1', coupleId: null, mood: 'DEEP' });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('DJProfile');
  });

  it('creates a DJ profile for a room', async () => {
    const profile = await createProfileForRoom('room-1', { mood: 'CHILL' });
    expect(profile).toMatchObject({ id: 'prof-2', roomId: 'room-1', coupleId: null, mood: 'CHILL' });
    expect(supabaseAdmin.from).toHaveBeenCalledWith('DJProfile');
  });

  it('updates a DJ profile', async () => {
    const profile = await updateProfile('prof-1', { mood: 'SPICY' });
    expect(profile).toMatchObject({ id: 'prof-1', mood: 'SPICY' });
  });
});
