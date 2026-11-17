import { describe, it, expect, vi, beforeEach } from 'vitest';

// Plain closure state instead of vi.fn(): the route only needs $queryRaw to
// resolve or reject, so we avoid spy bookkeeping around the rejected promise.
let dbError: Error | null = null;

vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: async () => {
      if (dbError) throw dbError;
      return [{ '?column?': 1 }];
    },
  },
}));

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  beforeEach(() => {
    dbError = null;
  });

  it('returns 200 when the database answers', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 without leaking error details when the database fails', async () => {
    dbError = new Error('connect ECONNREFUSED secret-host:5432');
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ status: 'unavailable' });
    expect(JSON.stringify(body)).not.toContain('secret-host');
  });
});
