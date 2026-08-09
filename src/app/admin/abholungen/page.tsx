import Link from 'next/link';
import { CalendarClock, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { formatDate, todayIso } from '@/lib/utils';
import { whatsappLink } from '@/lib/notifications/whatsapp';
import type { ShipmentStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

type PickupRow = {
  id: string;
  scheduled_date: string;
  time_window_start: string | null;
  time_window_end: string | null;
  status: string;
  note: string | null;
  driver_id: string | null;
  shipment_id: string;
};

export default async function PickupsPage() {
  const supabase = await createServerSupabase();
  const today = todayIso();

  const { data: pickups } = await supabase
    .from('pickup_assignments')
    .select('id, scheduled_date, time_window_start, time_window_end, status, note, driver_id, shipment_id')
    .in('status', ['scheduled', 'en_route'])
    .order('scheduled_date', { ascending: true })
    .limit(200);

  const list = (pickups ?? []) as PickupRow[];
  const shipmentIds = list.map((p) => p.shipment_id);

  const { data: shipments } = shipmentIds.length
    ? await supabase
        .from('shipments')
        .select(
          'id, tracking_number, status, sender_first_name, sender_last_name, sender_phone, sender_address, sender_postal_code, sender_city, origin_city, destination_city, weight_kg, piece_count',
        )
        .in('id', shipmentIds)
    : { data: [] };

  const { data: drivers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'driver');

  const shipmentById = new Map((shipments ?? []).map((s) => [s.id, s]));
  const driverById = new Map((drivers ?? []).map((d) => [d.id, d.full_name ?? 'Fahrer']));

  const overdue = list.filter((p) => p.scheduled_date < today);
  const todays = list.filter((p) => p.scheduled_date === today);
  const upcoming = list.filter((p) => p.scheduled_date > today);

  const groups = [
    { title: 'Überfällig', items: overdue, tone: 'destructive' as const },
    { title: 'Heute', items: todays, tone: 'accent' as const },
    { title: 'Demnächst', items: upcoming, tone: 'default' as const },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Abholungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length} offene {list.length === 1 ? 'Abholung' : 'Abholungen'}
        </p>
      </header>

      {list.length === 0 && (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <CalendarClock className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Keine offenen Abholungen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Abholungen entstehen automatisch, wenn Kunden sie bei der Buchung anfordern.
          </p>
        </div>
      )}

      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <section key={group.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title} ({group.items.length})
            </h2>
            <ul className="mt-3 space-y-3">
              {group.items.map((pickup) => {
                const shipment = shipmentById.get(pickup.shipment_id);
                if (!shipment) return null;

                return (
                  <li
                    key={pickup.id}
                    className={
                      group.tone === 'destructive'
                        ? 'surface border-destructive/30 bg-destructive/5 p-4'
                        : group.tone === 'accent'
                          ? 'surface border-accent/30 bg-accent/5 p-4'
                          : 'surface p-4'
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/sendungen/${shipment.id}`}
                            className="font-mono text-sm font-semibold text-primary hover:underline"
                          >
                            {shipment.tracking_number}
                          </Link>
                          <StatusBadge status={shipment.status as ShipmentStatus} withIcon={false} />
                        </div>

                        <p className="mt-1.5 font-medium">
                          {shipment.sender_first_name} {shipment.sender_last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.sender_address}, {shipment.sender_postal_code}{' '}
                          {shipment.sender_city}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatWeight(shipment.weight_kg)} · {shipment.piece_count} Stück ·{' '}
                          {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)}
                        </p>
                        {pickup.note && (
                          <p className="mt-1.5 rounded-lg bg-secondary px-2 py-1 text-xs">
                            {pickup.note}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatDate(pickup.scheduled_date)}</p>
                        {pickup.time_window_start && (
                          <p className="text-xs text-muted-foreground">
                            {pickup.time_window_start.slice(0, 5)}
                            {pickup.time_window_end && `–${pickup.time_window_end.slice(0, 5)}`}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pickup.driver_id
                            ? (driverById.get(pickup.driver_id) ?? 'Fahrer')
                            : 'Kein Fahrer'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      <a href={`tel:${shipment.sender_phone.replace(/\s/g, '')}`}>
                        <Button size="sm" variant="outline">
                          <Phone aria-hidden />
                          {shipment.sender_phone}
                        </Button>
                      </a>
                      <a
                        href={whatsappLink(shipment.sender_phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="ghost">
                          WhatsApp
                        </Button>
                      </a>
                      <Link href={`/admin/sendungen/${shipment.id}`}>
                        <Button size="sm" variant="ghost">
                          Sendung öffnen
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
