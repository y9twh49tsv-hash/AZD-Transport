import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, PackageSearch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { requireUser } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatCents, formatWeight } from '@/lib/pricing';
import { formatDate, formatRelative } from '@/lib/utils';
import { roleLabels } from '@/lib/shipment-status';
import { SignOutButton } from '@/components/layout/sign-out-button';

export const metadata: Metadata = {
  title: 'Mein Konto',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await requireUser();

  // Deliberately the *user-scoped* client: row level security decides what is
  // returned, so this query can only ever see the caller's own shipments.
  const supabase = await createServerSupabase();
  const { data: shipments } = await supabase
    .from('shipments')
    .select(
      'id, tracking_number, status, origin_city, destination_city, weight_kg, piece_count, price_total_cents, payment_status, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(50);

  const list = shipments ?? [];

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mein Konto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Angemeldet als {user.fullName || user.email} · {roleLabels[user.role]}
          </p>
        </div>
        <SignOutButton />
      </header>

      {(user.role === 'admin' || user.role === 'staff' || user.role === 'driver') && (
        <Alert tone="info" title="Du hast erweiterte Rechte" className="mt-6">
          <div className="mt-2 flex flex-wrap gap-2">
            {(user.role === 'admin' || user.role === 'staff') && (
              <Link href="/admin">
                <Button size="sm" variant="outline">
                  Zum Dashboard
                  <ArrowRight aria-hidden />
                </Button>
              </Link>
            )}
            <Link href="/driver">
              <Button size="sm" variant="outline">
                Zur Fahreransicht
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Meine Sendungen</h2>
          <Link href="/buchen">
            <Button size="sm">
              <Plus aria-hidden />
              Neue Sendung
            </Button>
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="surface mt-5 p-8 text-center">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Package className="size-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold">Noch keine Sendungen</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Sendungen, die du mit dieser E-Mail-Adresse buchst, erscheinen hier automatisch. Ältere
              Buchungen ohne Konto findest du über die Sendungsverfolgung.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/buchen">
                <Button block className="sm:w-auto">
                  Sendung buchen
                </Button>
              </Link>
              <Link href="/tracking">
                <Button variant="outline" block className="sm:w-auto">
                  <PackageSearch aria-hidden />
                  Sendung suchen
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {list.map((shipment) => (
              <li key={shipment.id}>
                <Link
                  href={`/tracking/${shipment.tracking_number}`}
                  className="surface flex flex-wrap items-center gap-4 p-4 transition-shadow hover:shadow-lift sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-semibold">
                        {shipment.tracking_number}
                      </span>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·{' '}
                      {formatWeight(shipment.weight_kg)} · {shipment.piece_count} Stück
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Gebucht am {formatDate(shipment.created_at)} · zuletzt aktualisiert{' '}
                      {formatRelative(shipment.updated_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatCents(shipment.price_total_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.payment_status === 'unpaid' ? 'offen' : 'bezahlt'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
