import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';
import { SetupNotice } from '@/components/layout/setup-notice';
import { getSessionUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Anmelden',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getSessionUser();
  const { next } = await searchParams;

  if (user) {
    redirect(user.role === 'admin' || user.role === 'staff' ? '/admin' : user.role === 'driver' ? '/driver' : '/konto');
  }

  // Only same-origin paths survive — see safeRedirect in actions.ts.
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : undefined;

  return (
    <>
      <SetupNotice className="mb-6" />
      <LoginForm next={safeNext} />
    </>
  );
}
