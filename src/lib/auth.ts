import 'server-only';

import { redirect, unstable_rethrow } from 'next/navigation';
import { cache } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { hasRole as hasRoleFor } from '@/lib/roles';
import type { UserRole } from '@/lib/supabase/database.types';

export type SessionUser = {
  id: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
};

/**
 * The signed-in user together with the role from `profiles`.
 *
 * The role is always read from the database — never from user metadata, which
 * a client can influence during sign-up.
 *
 * `cache()` de-duplicates the lookup within a single request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Without configuration there is no session. Pages render their setup hint
  // instead of the whole app crashing.
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createServerSupabase();

    // getUser() re-validates the JWT with the auth server; getSession() alone
    // would trust a cookie that could have been tampered with.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, phone, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      // Auth user without a profile row: treat as the least privileged role.
      return {
        id: user.id,
        email: user.email ?? null,
        role: 'customer',
        fullName: null,
        phone: null,
        isActive: true,
      };
    }

    return {
      id: user.id,
      email: user.email ?? null,
      role: profile.role,
      fullName: profile.full_name,
      phone: profile.phone,
      isActive: profile.is_active,
    };
  } catch (error) {
    /**
     * Next signals control flow through thrown errors — reading cookies during
     * a static render, `redirect()`, `notFound()`. Swallowing those would mean
     * a page that needs a session could be prerendered as "logged out" and then
     * served from the cache to someone who is signed in. `unstable_rethrow` is
     * the documented way to let the framework's own errors pass through; it
     * returns without doing anything for a genuine failure.
     */
    unstable_rethrow(error);

    /**
     * Reaching the auth server can fail for reasons that have nothing to do
     * with the visitor: a wrong project URL, an expired key, a Supabase
     * outage, a DNS hiccup on the host.
     *
     * None of those may take down the public website. Every caller treats a
     * null result as "not signed in", which degrades the site to its logged-out
     * state — the price calculator, tracking and the legal pages keep working,
     * and the protected areas still redirect to the login page.
     *
     * The message goes to the server log (Railway → Deploy Logs) so the real
     * cause is diagnosable; it never reaches the browser.
     */
    console.error(
      '[auth] Session konnte nicht gelesen werden — Besucher wird als abgemeldet behandelt:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
});

// The permission rules themselves live in `roles.ts` — pure, dependency-free
// and unit tested. This module only adds the request-scoped plumbing.
export { atLeast, canUseDriverApp, hasRole, homeRouteFor, isAdmin, isStaff } from '@/lib/roles';

/**
 * Guard for pages and server actions. Redirects to the login page (or to a
 * "no access" page for a signed-in user with the wrong role) instead of
 * rendering anything.
 */
export async function requireRole(
  roles: UserRole[],
  redirectTo = '/login',
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(`${redirectTo}?next=${encodeURIComponent('/')}`);
  }
  if (!hasRoleFor(user, roles)) {
    redirect('/kein-zugriff');
  }
  return user;
}

export async function requireUser(redirectTo = '/login'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Same checks as `requireRole`, but throws instead of redirecting — for API
 * route handlers and server actions that return a result object.
 */
export class AuthorizationError extends Error {
  constructor(message = 'Kein Zugriff.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function assertRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError('Nicht angemeldet.');
  if (!hasRoleFor(user, roles)) throw new AuthorizationError('Keine Berechtigung.');
  return user;
}
