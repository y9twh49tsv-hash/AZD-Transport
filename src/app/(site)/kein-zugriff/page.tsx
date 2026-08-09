import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionUser } from '@/lib/auth';
import { roleLabels } from '@/lib/shipment-status';

export const metadata: Metadata = {
  title: 'Kein Zugriff',
  robots: { index: false, follow: false },
};

export default async function NoAccessPage() {
  const user = await getSessionUser();

  return (
    <div className="container flex max-w-lg flex-col items-center py-20 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Kein Zugriff</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Für diesen Bereich fehlt deinem Konto die nötige Berechtigung.
        {user && (
          <>
            {' '}
            Du bist angemeldet als <strong className="text-foreground">{roleLabels[user.role]}</strong>.
          </>
        )}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Wenn du hier arbeiten solltest, bitte einen Admin, dir die passende Rolle zuzuweisen.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button block className="sm:w-auto">
            Zur Startseite
          </Button>
        </Link>
        <Link href="/konto">
          <Button variant="outline" block className="sm:w-auto">
            Zu meinem Konto
          </Button>
        </Link>
      </div>
    </div>
  );
}
