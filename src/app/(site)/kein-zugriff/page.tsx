import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionUser } from '@/lib/auth';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t('noAccess.metaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function NoAccessPage() {
  const t = await getT();
  const user = await getSessionUser();

  return (
    <div className="container flex max-w-lg flex-col items-center py-20 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t('noAccess.title')}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {t('noAccess.text')}
        {user && <> {t('noAccess.signedInAs', { role: t(`roles.${user.role}`) })}</>}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t('noAccess.askAdmin')}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button block className="sm:w-auto">
            {t('bulky.toHome')}
          </Button>
        </Link>
        <Link href="/konto">
          <Button variant="outline" block className="sm:w-auto">
            {t('noAccess.toAccount')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
