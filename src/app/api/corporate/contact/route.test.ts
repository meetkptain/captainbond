import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const createLead = vi.fn();

vi.mock('@/services/leadService', () => ({
  createLead: (...args: unknown[]) => createLead(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  createLead.mockResolvedValue(undefined);
});

describe('POST /api/corporate/contact', () => {
  it('stores a corporate lead with explicit source', async () => {
    const req = new NextRequest('http://localhost/api/corporate/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jean Dupont',
        company: 'Acme',
        email: 'jean@acme.com',
        participants: 50,
        date: '2026-09-01',
        estimatedPrice: 1750,
        formula: 'facilitator',
        source: 'corporate',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'corporate',
        name: 'Jean Dupont',
        email: 'jean@acme.com',
        company: 'Acme',
      }),
    );
  });

  it('stores a bar kit request with inferred source', async () => {
    const req = new NextRequest('http://localhost/api/corporate/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Marie',
        company: 'Le Bistro',
        email: 'marie@bistro.com',
        formula: 'BAR_KIT_REQUEST',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'bar_kit',
        formula: 'BAR_KIT_REQUEST',
      }),
    );
  });

  it('rejects missing required fields', async () => {
    const req = new NextRequest('http://localhost/api/corporate/contact', {
      method: 'POST',
      body: JSON.stringify({ email: 'only@email.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(createLead).not.toHaveBeenCalled();
  });
});
