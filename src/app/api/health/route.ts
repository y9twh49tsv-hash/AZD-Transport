import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Health check for the container host (Railway `healthcheckPath`, Docker
 * HEALTHCHECK, uptime monitoring).
 *
 * Deliberately does NOT touch the database: a hiccup at Supabase must not make
 * Railway believe the app is dead and restart it in a loop. It only reports
 * whether the process is up and whether its configuration is complete.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      configured: isSupabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
