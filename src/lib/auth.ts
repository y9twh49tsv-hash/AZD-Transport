import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
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
});

const roleRank: Record<UserRole, number> = { customer: 0, driver: 1, staff: 2, admin: 3 };

export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
  if (!user || !user.isActive) return false;
  return roles.includes(user.role);
}

/** Staff and admins share back-office access; admins additionally get settings. */
export function isStaff(user: SessionUser | null): boolean {
  return hasRole(user, ['staff', 'admin']);
}

export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, ['admin']);
}

/** Drivers plus everybody above them may use the driver screens. */
export function canUseDriverApp(user: SessionUser | null): boolean {
  return hasRole(user, ['driver', 'staff', 'admin']);
}

export function atLeast(user: SessionUser | null, role: UserRole): boolean {
  if (!user || !user.isActive) return false;
  return roleRank[user.role] >= roleRank[role];
}

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
  if (!hasRole(user, roles)) {
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
  if (!hasRole(user, roles)) throw new AuthorizationError('Keine Berechtigung.');
  return user;
}
