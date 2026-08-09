import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { TrackingResult } from '@/components/tracking/tracking-result';
import { TrackingSearch } from '@/components/tracking/tracking-search';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { fetchPublicTracking } from '@/lib/tracking-server';
import { normaliseTrackingNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const trackingNumber = normaliseTrackingNumber(decodeURIComponent(number));
  return {
    title: `Sendung ${trackingNumber}`,
    description: 'Aktueller Status deiner Sendung zwischen Deutschland und Marokko.',
    // A tracking number is not a secret, but it should not end up in a search index.
    robots: { index: false, follow: false },
  };
}

/** Always rendered fresh — the status can change at any moment. */
export const dynamic = 'force-dynamic';

export default async function TrackingDetailPage({ params }: Props) {
  const { number } = await params;
  const trackingNumber = normaliseTrackingNumber(decodeURIComponent(number));
  const lookup = await fetchPublicTracking(trackingNumber);

  return (
    <div className="container max-w-3xl py-8 sm:py-12">
      <Link
        href="/tracking"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Andere Sendung suchen
      </Link>

      <div className="mt-6">
        {lookup.state === 'found' && <TrackingResult data={lookup.data} />}

        {lookup.state === 'not_found' && (
          <NotFound trackingNumber={trackingNumber} message={t('tracking.notFound')} />
        )}

        {lookup.state === 'invalid' && (
          <NotFound
            trackingNumber={trackingNumber}
            message="Das sieht nicht nach einer gültigen Sendungsnummer aus. Sie hat die Form MC-260809-0042."
          />
        )}

        {lookup.state === 'rate_limited' && (
          <Alert tone="warning" title="Zu viele Abfragen">
            Bitte warte {lookup.retryAfterSeconds} Sekunden und versuche es dann erneut.
          </Alert>
        )}

        {lookup.state === 'unconfigured' && (
          <Alert tone="warning" title="Sendungsverfolgung noch nicht verfügbar">
            Die Datenbankverbindung ist noch nicht eingerichtet. Bitte hinterlege die
            Supabase-Zugangsdaten in <code className="font-mono text-xs">.env.local</code>.
          </Alert>
        )}
      </div>
    </div>
  );
}

function NotFound({ trackingNumber, message }: { trackingNumber: string; message: string }) {
  return (
    <div className="surface p-6 text-center sm:p-10">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">Sendung nicht gefunden</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
      {trackingNumber && (
        <p className="mt-3 font-mono text-sm text-muted-foreground">Gesucht: {trackingNumber}</p>
      )}

      <div className="mx-auto mt-8 max-w-md text-left">
        <TrackingSearch initialValue={trackingNumber} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Nummer verlegt?{' '}
        <Link href="/kontakt" className="font-medium text-primary underline">
          Schreib uns
        </Link>{' '}
        — wir finden deine Sendung.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button variant="ghost">Zur Startseite</Button>
      </Link>
    </div>
  );
}
