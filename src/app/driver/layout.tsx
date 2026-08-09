import type { Metadata, Viewport } from 'next';
import { DriverNav } from './driver-nav';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Fahrer', template: '%s · Fahrer' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // The driver screens are used one-handed in a van; keep the browser chrome
  // out of the way where the platform supports it.
  viewportFit: 'cover',
};

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['driver', 'staff', 'admin']);

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/25">
      <main id="main" className="flex-1 pb-24">
        {children}
      </main>
      <DriverNav name={user.fullName || user.email || 'Fahrer'} />
    </div>
  );
}
