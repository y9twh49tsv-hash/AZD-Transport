import { afterEach, describe, expect, it } from 'vitest';
import { isSupabaseConfigured, serviceRoleProblems, supabaseConfigProblems } from './env';

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL';
const ANON_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

/** Shapes Supabase actually issues — structure only, no real key. */
const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYyJ9.c2lnbmF0dXJlLXBsYWNlaG9sZGVy';
const PUBLISHABLE = 'sb_publishable_AbCdEfGhIjKlMnOpQrSt';
const SECRET = 'sb_secret_AbCdEfGhIjKlMnOpQrSt';

function set(url?: string, anon?: string, service?: string) {
  for (const [key, value] of [
    [URL_KEY, url],
    [ANON_KEY, anon],
    [SERVICE_KEY, service],
  ] as const) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => set(undefined, undefined, undefined));

describe('supabaseConfigProblems', () => {
  it('accepts both key formats Supabase issues', () => {
    set('https://abcdefgh.supabase.co', JWT);
    expect(supabaseConfigProblems()).toEqual([]);

    set('https://abcdefgh.supabase.co', PUBLISHABLE);
    expect(supabaseConfigProblems()).toEqual([]);
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('reports every missing variable by name', () => {
    set(undefined, undefined);
    expect(supabaseConfigProblems()).toEqual([
      expect.stringContaining(URL_KEY),
      expect.stringContaining(ANON_KEY),
    ]);
  });

  /**
   * The failure this whole check exists for. A placeholder copied out of a
   * set-up guide is a non-empty string, so a presence check calls it
   * configured — and then every page renders, every database call fails, and
   * nothing says why.
   */
  it.each([
    '<anon / publishable key>',
    'DEIN_ANON_KEY',
    'your-anon-key-here',
    'xxxxxxxxxxxxxxxxxxxxxxxx',
    'changeme',
  ])('rejects the placeholder %j instead of calling it configured', (placeholder) => {
    set('https://abcdefgh.supabase.co', placeholder);
    expect(isSupabaseConfigured()).toBe(false);
    expect(supabaseConfigProblems()).toEqual([expect.stringContaining(ANON_KEY)]);
  });

  it('never echoes the key itself, only the variable name', () => {
    set('https://abcdefgh.supabase.co', 'geheimes-versehen-12345');
    const reported = supabaseConfigProblems().join(' ');
    expect(reported).toContain(ANON_KEY);
    expect(reported).not.toContain('geheimes-versehen-12345');
  });

  it('rejects a URL that is not a URL', () => {
    set('ptdzsoitwheaoteggqys', JWT);
    expect(supabaseConfigProblems()).toEqual([expect.stringContaining(URL_KEY)]);
  });
});

describe('serviceRoleProblems', () => {
  it('accepts both key formats', () => {
    set(undefined, undefined, JWT);
    expect(serviceRoleProblems()).toEqual([]);

    set(undefined, undefined, SECRET);
    expect(serviceRoleProblems()).toEqual([]);
  });

  it('rejects a placeholder and a missing value alike', () => {
    set(undefined, undefined, '<service_role / secret key>');
    expect(serviceRoleProblems()).toEqual([expect.stringContaining(SERVICE_KEY)]);

    set(undefined, undefined, undefined);
    expect(serviceRoleProblems()).toEqual([expect.stringContaining(SERVICE_KEY)]);
  });

  it('does not accept a publishable key where the secret one belongs', () => {
    // Mixing the two up puts a key with no privileges on the server paths that
    // legitimately need to bypass row level security.
    set(undefined, undefined, PUBLISHABLE);
    expect(serviceRoleProblems()).toEqual([expect.stringContaining(SERVICE_KEY)]);
  });
});
