import { NextResponse } from 'next/server';
import { appUrl } from '@/config/brand';
import { serviceRoleProblems, supabaseConfigProblems } from '@/lib/env';

/**
 * Health check for the container host (Railway `healthcheckPath`, Docker
 * HEALTHCHECK, uptime monitoring).
 *
 * Deliberately does NOT touch the database: a hiccup at Supabase must not make
 * Railway believe the app is dead and restart it in a loop. It only reports
 * whether the process is up and whether its configuration is complete.
 *
 * `commit` and `publicUrl` answer the question that comes up after every change
 * to the environment variables: is the running container actually the build I
 * think it is, and did it pick up the domain? Neither value is secret — the
 * commit is public in the repository, the URL is the address you called.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const commit =
    process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  // Benennt das Problem, statt nur "nicht konfiguriert" zu melden. Enthält nie
  // einen Schlüssel oder Teile davon — nur den Namen der Variablen und was an
  // ihr nicht stimmt.
  const problems = [...supabaseConfigProblems(), ...serviceRoleProblems()];

  return NextResponse.json(
    {
      status: 'ok',
      configured: problems.length === 0,
      ...(problems.length > 0 && { problems }),
      commit: commit ? commit.slice(0, 7) : null,
      publicUrl: appUrl(),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
