import type { Metadata } from 'next';
import { AdminShell } from './admin-shell';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Verwaltung', template: '%s · Verwaltung' },
  robots: { index: false, follow: false },
};

/**
 * Guards the entire back office. `requireRole` redirects anyone who is not
 * staff or admin, so no admin page needs to repeat the check — and every
 * mutation checks the role again in its server action.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['staff', 'admin']);

  return (
    <AdminShell role={user.role} name={user.fullName || user.email || 'Team'}>
      {children}
    </AdminShell>
  );
}
