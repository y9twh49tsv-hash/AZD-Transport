import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getSessionUser, homeRouteFor } from '@/lib/auth';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const dashboardHref = homeRouteFor(user);

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
