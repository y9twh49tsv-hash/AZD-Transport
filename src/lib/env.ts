import { z } from 'zod';

/**
 * Environment access with fail-fast validation.
 *
 * Public variables are inlined by Next at build time, so they must be read as
 * literal `process.env.NEXT_PUBLIC_*` expressions — never through a dynamic
 * key.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL muss eine gültige URL sein'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt'),
});

let cachedPublic: z.infer<typeof publicSchema> | null = null;

export function publicEnv() {
  if (cachedPublic) return cachedPublic;

  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error(
      `Supabase ist nicht konfiguriert (${missing}). ` +
        'Lege eine .env.local nach dem Vorbild von .env.example an.',
    );
  }

  cachedPublic = parsed.data;
  return cachedPublic;
}

/** True when the app has enough configuration to talk to Supabase at all. */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Server-only. Throws if imported into a client bundle, which would leak the
 * key that bypasses every row level security policy.
 */
export function serviceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY darf niemals im Browser verwendet werden.');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.length < 20) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY fehlt. Trage ihn in .env.local bzw. in den Vercel ' +
        'Environment Variables ein (nur Server, niemals mit NEXT_PUBLIC_ Präfix).',
    );
  }
  return key;
}
