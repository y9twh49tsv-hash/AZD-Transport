import Link from 'next/link';
import { ChevronRight, Package, PackageCheck, QrCode, Truck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSessionUser } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { formatDate, todayIso } from '@/lib/utils';
import type { ShipmentStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function DriverHomePage() {
  const user = await getSessionUser();
  const supabase = await createServerSupabase();
  const today = todayIso();

  // Row level security limits all of this to the shipments this driver is
  // responsible for — staff and admins see everything.
  const [{ data: pickups }, { data: shipments }] = await Promise.all([
    supabase
      .from('pickup_assignments')
      .select('id, shipment_id, scheduled_date, time_window_start, time_window_end, status, note')
      .lte('scheduled_date', today)
      .in('status', ['scheduled', 'en_route'])
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('shipments')
      .select(
        'id, tracking_number, status, weight_kg, piece_count, origin_city, destination_city, sender_first_name, sender_last_name, sender_address, sender_city, sender_phone, recipient_first_name, recipient_last_name, recipient_address, recipient_city, recipient_phone, pickup_date',
      )
      .not('status', 'in', '("DELIVERED","CANCELLED")')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const allShipments = shipments ?? [];
  const shipmentById = new Map(allShipments.map((s) => [s.id, s]));

  const pickupList = (pickups ?? [])
    .map((pickup) => ({ pickup, shipment: shipmentById.get(pickup.shipment_id) }))
    .filter((entry): entry is { pickup: NonNullable<typeof pickups>[number]; shipment: (typeof allShipments)[number] } => !!entry.shipment);

  const onBoard = allShipments.filter((s) =>
    ['PICKED_UP', 'LOADED', 'DEPARTED_GERMANY', 'IN_TRANSIT'].includes(s.status),
  );

  const toDeliver = allShipments.filter((s) =>
    ['AT_MOROCCO_HUB', 'OUT_FOR_DELIVERY', 'ARRIVED_MOROCCO'].includes(s.status),
  );

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
          Hallo {user?.fullName?.split(' ')[0] ?? 'Fahrer'}
        </h1>
      </header>

      <Link href="/driver/scan" className="block">
        <Button size="lg" block className="min-h-16 text-base">
          <QrCode className="!size-6" aria-hidden />
          QR-Code scannen
        </Button>
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat label="Abholungen" value={pickupList.length} />
        <Stat label="Im Fahrzeug" value={onBoard.length} />
        <Stat label="Zustellungen" value={toDeliver.length} />
      </div>

      <Section
        title="Heutige Abholungen"
        icon={Truck}
        count={pickupList.length}
        empty="Für heute sind keine Abholungen geplant."
      >
        {pickupList.map(({ pickup, shipment }) => (
          <ShipmentRow
            key={pickup.id}
            id={shipment.id}
            trackingNumber={shipment.tracking_number}
            status={shipment.status as ShipmentStatus}
            title={`${shipment.sender_first_name} ${shipment.sender_last_name}`}
            subtitle={`${shipment.sender_address}, ${shipment.sender_city}`}
            meta={[
              formatWeight(shipment.weight_kg),
              `${shipment.piece_count} Stück`,
              pickup.time_window_start
                ? `${pickup.time_window_start.slice(0, 5)}${pickup.time_window_end ? `–${pickup.time_window_end.slice(0, 5)}` : ''}`
                : formatDate(pickup.scheduled_date),
            ].join(' · ')}
            note={pickup.note}
          />
        ))}
      </Section>

      <Section
        title="Im Fahrzeug"
        icon={Package}
        count={onBoard.length}
        empty="Aktuell keine Sendungen im Fahrzeug."
      >
        {onBoard.map((shipment) => (
          <ShipmentRow
            key={shipment.id}
            id={shipment.id}
            trackingNumber={shipment.tracking_number}
            status={shipment.status as ShipmentStatus}
            title={`${cityName(shipment.origin_city)} → ${cityName(shipment.destination_city)}`}
            subtitle={`Empfänger: ${shipment.recipient_first_name} ${shipment.recipient_last_name}`}
            meta={`${formatWeight(shipment.weight_kg)} · ${shipment.piece_count} Stück`}
          />
        ))}
      </Section>

      <Section
        title="Zustellungen"
        icon={PackageCheck}
        count={toDeliver.length}
        empty="Keine offenen Zustellungen."
      >
        {toDeliver.map((shipment) => (
          <ShipmentRow
            key={shipment.id}
            id={shipment.id}
            trackingNumber={shipment.tracking_number}
            status={shipment.status as ShipmentStatus}
            title={`${shipment.recipient_first_name} ${shipment.recipient_last_name}`}
            subtitle={`${shipment.recipient_address}, ${shipment.recipient_city}`}
            meta={`${formatWeight(shipment.weight_kg)} · ${shipment.piece_count} Stück`}
          />
        ))}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-3 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: typeof Truck;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {title}
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
          {count}
        </span>
      </h2>
      {count === 0 ? (
        <p className="surface p-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2.5">{children}</ul>
      )}
    </section>
  );
}

function ShipmentRow({
  id,
  trackingNumber,
  status,
  title,
  subtitle,
  meta,
  note,
}: {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  title: string;
  subtitle: string;
  meta: string;
  note?: string | null;
}) {
  return (
    <li>
      <Link href={`/driver/sendung/${id}`} className="surface flex items-center gap-3 p-4 active:bg-secondary">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {trackingNumber}
            </span>
            <StatusBadge status={status} withIcon={false} />
          </div>
          <p className="mt-1 font-semibold leading-tight">{title}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{subtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
          {note && (
            <p className="mt-1.5 rounded-lg bg-sand/15 px-2 py-1 text-xs">{note}</p>
          )}
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
