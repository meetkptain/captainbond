import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/services/dj-ia/djEngine', () => ({
  updateDJQuestionFeedback: vi.fn().mockResolvedValue(undefined),
}));

import { updateDJQuestionFeedback } from '@/services/dj-ia/djEngine';

describe('POST /api/dj/feedback', () => {
  it('rejects invalid body with validation error', async () => {
    const req = new NextRequest('http://localhost/api/dj/feedback', {
      method: 'POST',
      body: JSON.stringify({ questionId: 'invalid-cuid', status: 'MAYBE' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('accepts valid body and triggers feedback update', async () => {
    const req = new NextRequest('http://localhost/api/dj/feedback', {
      method: 'POST',
      body: JSON.stringify({
        questionId: 'cldyuiop1000008l1abcd9999', // Valid cuid format
        status: 'ACCEPTED',
        feedback: 'Super ambiance',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updateDJQuestionFeedback).toHaveBeenCalledWith(
      'cldyuiop1000008l1abcd9999',
      'ACCEPTED',
      'Super ambiance'
    );
  });
});
