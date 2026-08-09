import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getSessionUser } from '@/lib/auth';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const dashboardHref =
    user?.role === 'admin' || user?.role === 'staff'
      ? '/admin'
      : user?.role === 'driver'
        ? '/driver'
        : '/konto';

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader isSignedIn={!!user} dashboardHref={dashboardHref} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
