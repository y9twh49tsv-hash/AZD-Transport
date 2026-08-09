import Link from 'next/link';
import { ChevronRight, SearchX } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { escapeFilterValue, normaliseTrackingNumber } from '@/lib/utils';
import type { ShipmentStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function DriverSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const raw = q?.trim() ?? '';

  const supabase = await createServerSupabase();

  let results: Array<{
    id: string;
    tracking_number: string;
    status: string;
    weight_kg: number;
    piece_count: number;
    origin_city: string;
    destination_city: string;
    recipient_first_name: string;
    recipient_last_name: string;
  }> = [];

  if (raw) {
    const trackingNumber = normaliseTrackingNumber(raw);
    // Row level security keeps this to the driver's own shipments.
    let request = supabase
      .from('shipments')
      .select(
        'id, tracking_number, status, weight_kg, piece_count, origin_city, destination_city, recipient_first_name, recipient_last_name',
      )
      .limit(25);

    if (/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(trackingNumber)) {
      request = request.eq('tracking_number', trackingNumber);
    } else {
      const safe = escapeFilterValue(raw);
      request = request.or(
        `sender_last_name.ilike.%${safe}%,recipient_last_name.ilike.%${safe}%,sender_phone.ilike.%${safe}%,recipient_phone.ilike.%${safe}%`,
      );
    }

    const { data } = await request;
    results = data ?? [];
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Sendung suchen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nummer, Nachname oder Telefonnummer
        </p>
      </header>

      <form method="get" className="surface flex flex-col gap-3 p-4">
        <label htmlFor="driver-q" className="sr-only">
          Suchbegriff
        </label>
        <input
          id="driver-q"
          name="q"
          defaultValue={raw}
          placeholder="MC-260809-0042"
          autoCapitalize="characters"
          autoComplete="off"
          className="min-h-14 w-full rounded-xl border border-input bg-card px-4 font-mono text-lg focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        <Button type="submit" block className="min-h-14">
          Suchen
        </Button>
      </form>

      {raw && results.length === 0 && (
        <div className="surface mt-5 p-6 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <SearchX className="size-5" aria-hidden />
          </span>
          <p className="mt-3 font-semibold">Nichts gefunden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prüfe die Schreibweise. Du siehst hier nur Sendungen, für die du zuständig bist.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {results.map((shipment) => (
            <li key={shipment.id}>
              <Link
                href={`/driver/sendung/${shipment.id}`}
                className="surface flex items-center gap-3 p-4 active:bg-secondary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {shipment.tracking_number}
                    </span>
                    <StatusBadge status={shipment.status as ShipmentStatus} withIcon={false} />
                  </div>
                  <p className="mt-1 font-semibold leading-tight">
                    {shipment.recipient_first_name} {shipment.recipient_last_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·{' '}
                    {formatWeight(shipment.weight_kg)} · {shipment.piece_count} Stück
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
