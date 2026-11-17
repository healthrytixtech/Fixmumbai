import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Never cache: a health check must reflect the current state of the app.
export const dynamic = 'force-dynamic';

/**
 * Liveness + readiness probe used by the prod deploy workflow.
 * Served at /pulse/api/health (basePath is /pulse).
 *
 * 200 -> app is up and the database answers a trivial query
 * 503 -> app is up but the database is unreachable
 *
 * Deliberately returns no internal details (error messages, versions, env).
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
}
