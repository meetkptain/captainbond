import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateUniqueRoomCode } from '../roomCodeRepository';
import { AppError } from '@/lib/errors';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => mockFrom()),
  },
}));

describe('generateUniqueRoomCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates 4-char codes from allowed alphabet', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        })),
      })),
    });

    const code = await generateUniqueRoomCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
  });

  it('retries when the generated code already exists', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'room-1' } }),
          })),
        })),
      })
      .mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          })),
        })),
      });

    const code = await generateUniqueRoomCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it('throws ROOM_CODE_COLLISION after exhausting attempts', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'room-1' } }),
        })),
      })),
    });

    await expect(generateUniqueRoomCode(3)).rejects.toThrow(
      new AppError('ROOM_CODE_COLLISION', 'Could not generate a unique room code')
    );
    expect(mockFrom).toHaveBeenCalledTimes(3);
  });
});
