import { describe, it, expect, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/auth/admin', () => ({
  requireAdminSession: vi.fn().mockImplementation(() => {
    throw new AppError('UNAUTHORIZED', 'Session admin manquante');
  }),
}));

describe('POST /api/storage/presign', () => {
  beforeAll(() => {
    process.env.ADMIN_JWT_SECRET = 'admin-jwt-secret-32-chars-long!!';
  });

  it('rejects unauthenticated requests', async () => {
    const req = new NextRequest('http://localhost/api/storage/presign', {
      method: 'POST',
      body: JSON.stringify({ filename: 'test.jpg', fileType: 'image/jpeg', fileSize: 1024 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
