import { describe, expect, it } from 'vitest';
import { atLeast, canUseDriverApp, hasRole, homeRouteFor, isAdmin, isStaff } from './roles';
import type { UserRole } from '@/lib/supabase/database.types';

const user = (role: UserRole, isActive = true) => ({ role, isActive });

describe('role permissions', () => {
  it('gives a customer no back-office access whatsoever', () => {
    const customer = user('customer');
    expect(isStaff(customer)).toBe(false);
    expect(isAdmin(customer)).toBe(false);
    expect(canUseDriverApp(customer)).toBe(false);
    expect(hasRole(customer, ['staff', 'admin'])).toBe(false);
  });

  it('lets a driver into the driver app but not the back office', () => {
    const driver = user('driver');
    expect(canUseDriverApp(driver)).toBe(true);
    expect(isStaff(driver)).toBe(false);
    expect(isAdmin(driver)).toBe(false);
  });

  it('lets staff into the back office and the driver app, but not admin-only areas', () => {
    const staff = user('staff');
    expect(isStaff(staff)).toBe(true);
    expect(canUseDriverApp(staff)).toBe(true);
    expect(isAdmin(staff)).toBe(false);
  });

  it('gives an admin everything', () => {
    const admin = user('admin');
    expect(isStaff(admin)).toBe(true);
    expect(isAdmin(admin)).toBe(true);
    expect(canUseDriverApp(admin)).toBe(true);
  });

  it('denies everything to a signed-out visitor', () => {
    expect(isStaff(null)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(canUseDriverApp(null)).toBe(false);
    expect(hasRole(null, ['customer'])).toBe(false);
    expect(atLeast(null, 'customer')).toBe(false);
  });

  it('denies everything to a deactivated account, whatever its role', () => {
    for (const role of ['customer', 'driver', 'staff', 'admin'] as UserRole[]) {
      const deactivated = user(role, false);
      expect(hasRole(deactivated, [role]), role).toBe(false);
      expect(isStaff(deactivated), role).toBe(false);
      expect(isAdmin(deactivated), role).toBe(false);
      expect(canUseDriverApp(deactivated), role).toBe(false);
      expect(atLeast(deactivated, 'customer'), role).toBe(false);
    }
  });
});

describe('role ranking', () => {
  it('orders customer < driver < staff < admin', () => {
    expect(atLeast(user('admin'), 'staff')).toBe(true);
    expect(atLeast(user('staff'), 'driver')).toBe(true);
    expect(atLeast(user('driver'), 'customer')).toBe(true);
    expect(atLeast(user('driver'), 'staff')).toBe(false);
    expect(atLeast(user('customer'), 'driver')).toBe(false);
    expect(atLeast(user('staff'), 'admin')).toBe(false);
  });
});

describe('landing route after sign-in', () => {
  it('sends each role to the right place', () => {
    expect(homeRouteFor(user('admin'))).toBe('/admin');
    expect(homeRouteFor(user('staff'))).toBe('/admin');
    expect(homeRouteFor(user('driver'))).toBe('/driver');
    expect(homeRouteFor(user('customer'))).toBe('/konto');
    expect(homeRouteFor(null)).toBe('/konto');
  });
});
