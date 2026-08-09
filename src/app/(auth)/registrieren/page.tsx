import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from './register-form';
import { SetupNotice } from '@/components/layout/setup-notice';
import { getSessionUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Registrieren',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect('/konto');

  return (
    <>
      <SetupNotice className="mb-6" />
      <RegisterForm />
    </>
  );
}
