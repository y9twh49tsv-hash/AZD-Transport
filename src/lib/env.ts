import { z } from 'zod';

/**
 * Environment access with fail-fast validation.
 *
 * Public variables are inlined by Next at build time, so they must be read as
 * literal `process.env.NEXT_PUBLIC_*` expressions — never through a dynamic
 * key.
 */

/**
 * Supabase keys come in two shapes, and neither contains a space or an angle
 * bracket:
 *
 *   · the classic JWT — three base64url segments separated by dots, starting
 *     with `eyJ`
 *   · the newer API keys — `sb_publishable_…` and `sb_secret_…`
 *
 * Checking the shape catches the mistake that a mere presence check cannot:
 * a variable that was created but filled with the placeholder from a set-up
 * guide. The application then looks configured, renders every page, and fails
 * on every single database call — which is far harder to diagnose than an
 * honest "not configured".
 */
const JWT = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const PUBLISHABLE = /^sb_publishable_[A-Za-z0-9_-]{16,}$/;
const SECRET = /^sb_secret_[A-Za-z0-9_-]{16,}$/;

function isAnonKey(value: string): boolean {
  return JWT.test(value) || PUBLISHABLE.test(value);
}

function isServiceRoleKey(value: string): boolean {
  return JWT.test(value) || SECRET.test(value);
}

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL muss eine gültige URL sein, z. B. https://abcdefgh.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .refine(isAnonKey, {
      message:
        'NEXT_PUBLIC_SUPABASE_ANON_KEY sieht nicht nach einem Supabase-Schlüssel aus ' +
        '(erwartet: eyJ… oder sb_publishable_…). Steht dort noch ein Platzhalter?',
    }),
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

/**
 * What exactly is wrong with the configuration, in plain German.
 *
 * Never contains a key or part of one — the result is shown in the browser and
 * returned by /api/health.
 */
export function supabaseConfigProblems(): string[] {
  const problems: string[] = [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    problems.push('NEXT_PUBLIC_SUPABASE_URL fehlt');
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(url) && !url.startsWith('http')) {
    problems.push('NEXT_PUBLIC_SUPABASE_URL ist keine gültige Adresse');
  }

  if (!anon) {
    problems.push('NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt');
  } else if (!isAnonKey(anon)) {
    problems.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY ist kein Supabase-Schlüssel (erwartet eyJ… oder sb_publishable_…)',
    );
  }

  return problems;
}

/** True when the app has enough configuration to talk to Supabase at all. */
export function isSupabaseConfigured(): boolean {
  return supabaseConfigProblems().length === 0;
}

/**
 * Server-only. Throws if imported into a client bundle, which would leak the
 * key that bypasses every row level security policy.
 */
export function serviceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY darf niemals im Browser verwendet werden.');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY fehlt. Trage ihn in .env.local bzw. in den Environment ' +
        'Variables deines Hosters ein (nur Server, niemals mit NEXT_PUBLIC_ Präfix).',
    );
  }
  if (!isServiceRoleKey(key)) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY sieht nicht nach einem Supabase-Schlüssel aus ' +
        '(erwartet: eyJ… oder sb_secret_…). Steht dort noch ein Platzhalter aus einer Anleitung?',
    );
  }
  return key;
}

/**
 * Server-only counterpart to `supabaseConfigProblems()`. Kept separate because
 * the service-role key must never be read in a browser bundle.
 */
export function serviceRoleProblems(): string[] {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return ['SUPABASE_SERVICE_ROLE_KEY fehlt'];
  if (!isServiceRoleKey(key)) {
    return ['SUPABASE_SERVICE_ROLE_KEY ist kein Supabase-Schlüssel (erwartet eyJ… oder sb_secret_…)'];
  }
  return [];
}
