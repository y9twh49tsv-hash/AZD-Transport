import type { UserRole } from '@/lib/supabase/database.types';

/**
 * Pure role logic, deliberately free of any server imports so it can be unit
 * tested and reused on both sides of the wire.
 *
 * `src/lib/auth.ts` builds the request-scoped guards on top of this.
 */

export type RoleHolder = {
  role: UserRole;
  isActive: boolean;
} | null;

const roleRank: Record<UserRole, number> = {
  customer: 0,
  driver: 1,
  staff: 2,
  admin: 3,
};

/** A deactivated account has no permissions at all, whatever its role says. */
export function hasRole(user: RoleHolder, roles: UserRole[]): boolean {
  if (!user || !user.isActive) return false;
  return roles.includes(user.role);
}

/** Staff and admins share back-office access. */
export function isStaff(user: RoleHolder): boolean {
  return hasRole(user, ['staff', 'admin']);
}

export function isAdmin(user: RoleHolder): boolean {
  return hasRole(user, ['admin']);
}

/** Drivers plus everybody above them may use the driver screens and scan QR codes. */
export function canUseDriverApp(user: RoleHolder): boolean {
  return hasRole(user, ['driver', 'staff', 'admin']);
}

export function atLeast(user: RoleHolder, role: UserRole): boolean {
  if (!user || !user.isActive) return false;
  return roleRank[user.role] >= roleRank[role];
}

/** Where a user lands after signing in. */
export function homeRouteFor(user: RoleHolder): string {
  if (isStaff(user)) return '/admin';
  if (canUseDriverApp(user)) return '/driver';
  return '/konto';
}
