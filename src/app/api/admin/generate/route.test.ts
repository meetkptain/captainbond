import { describe, it, expect, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth/admin', () => ({
  requireAdminSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/questionService', () => ({
  generateQuestions: vi.fn().mockResolvedValue([]),
}));

describe('POST /api/admin/generate', () => {
  beforeAll(() => {
    process.env.ADMIN_JWT_SECRET = 'admin-jwt-secret-32-chars-long!!';
  });

  it('rejects invalid body with validation error', async () => {
    const req = new NextRequest('http://localhost/api/admin/generate', {
      method: 'POST',
      body: JSON.stringify({ theme: '', count: 100, mode: '', category: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('accepts valid body', async () => {
    const req = new NextRequest('http://localhost/api/admin/generate', {
      method: 'POST',
      body: JSON.stringify({ theme: 'Test', count: 5, mode: 'VRAI_FAUX', category: 'GENERAL' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
