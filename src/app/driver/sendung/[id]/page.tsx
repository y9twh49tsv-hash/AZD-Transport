import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Navigation, Phone } from 'lucide-react';
import { DriverForm } from './driver-form';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { formatDateTime } from '@/lib/utils';
import { statusMeta, type ShipmentStatus } from '@/lib/shipment-status';
import { whatsappLink } from '@/lib/notifications/whatsapp';

export const dynamic = 'force-dynamic';

export default async function DriverShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // The user-scoped client applies row level security, so a driver simply gets
  // nothing back for a shipment that is not theirs.
  const supabase = await createServerSupabase();
  const { data: shipment } = await supabase
    .from('shipments')
    .select(
      'id, tracking_number, status, weight_kg, piece_count, content_type, description, origin_city, destination_city, pickup_requested, pickup_date, sender_first_name, sender_last_name, sender_phone, sender_address, sender_postal_code, sender_city, recipient_first_name, recipient_last_name, recipient_phone, recipient_address, recipient_city',
    )
    .eq('id', id)
    .maybeSingle();

  if (!shipment) notFound();

  const [{ data: seal }, { data: events }] = await Promise.all([
    supabase
      .from('security_seals')
      .select('seal_number')
      .eq('shipment_id', id)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('tracking_events')
      .select('id, status, occurred_at, location')
      .eq('shipment_id', id)
      .order('occurred_at', { ascending: false })
      .limit(5),
  ]);

  const pickupAddress = `${shipment.sender_address}, ${shipment.sender_postal_code ?? ''} ${shipment.sender_city}`;
  const deliveryAddress = `${shipment.recipient_address}, ${shipment.recipient_city}`;

  // Whether this stop is a pickup or a delivery decides which contact to show.
  const isPickupPhase = ['BOOKED', 'PICKUP_SCHEDULED'].includes(shipment.status);
  const contactName = isPickupPhase
    ? `${shipment.sender_first_name} ${shipment.sender_last_name}`
    : `${shipment.recipient_first_name} ${shipment.recipient_last_name}`;
  const contactPhone = isPickupPhase ? shipment.sender_phone : shipment.recipient_phone;
  const contactAddress = isPickupPhase ? pickupAddress : deliveryAddress;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link
        href="/driver"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zurück
      </Link>

      <header className="surface mt-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">{shipment.tracking_number}</span>
          <StatusBadge status={shipment.status as ShipmentStatus} />
        </div>

        <p className="mt-3 text-lg font-bold leading-tight">{contactName}</p>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">{contactAddress}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>
            <Button variant="outline" block className="min-h-12 flex-col gap-0.5 text-xs">
              <Phone className="!size-5" aria-hidden />
              Anrufen
            </Button>
          </a>
          <a href={whatsappLink(contactPhone)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" block className="min-h-12 flex-col gap-0.5 text-xs">
              <MessageCircle className="!size-5" aria-hidden />
              WhatsApp
            </Button>
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" block className="min-h-12 flex-col gap-0.5 text-xs">
              <Navigation className="!size-5" aria-hidden />
              Navigation
            </Button>
          </a>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Gewicht</dt>
            <dd className="font-semibold">{formatWeight(shipment.weight_kg)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Gepäckstücke</dt>
            <dd className="font-semibold">{shipment.piece_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Route</dt>
            <dd className="font-semibold">
              {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Sicherheitsnummer</dt>
            <dd className="font-mono font-semibold">{seal?.seal_number ?? '—'}</dd>
          </div>
        </dl>

        {(shipment.content_type || shipment.description) && (
          <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm">
            {shipment.content_type}
            {shipment.description && ` · ${shipment.description}`}
          </p>
        )}
      </header>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Status aktualisieren
        </h2>
        <DriverForm
          shipmentId={id}
          currentStatus={shipment.status as ShipmentStatus}
          weightKg={shipment.weight_kg}
          pieceCount={shipment.piece_count}
          currentSeal={seal?.seal_number ?? null}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Letzte Schritte
        </h2>
        <ul className="surface divide-y divide-border">
          {(events ?? []).map((event) => (
            <li key={event.id} className="flex items-center justify-between gap-3 p-3.5 text-sm">
              <span className="font-medium">
                {statusMeta[event.status as ShipmentStatus]?.label ?? event.status}
              </span>
              <span className="shrink-0 text-right text-xs text-muted-foreground">
                {formatDateTime(event.occurred_at)}
                {event.location && (
                  <>
                    <br />
                    {event.location}
                  </>
                )}
              </span>
            </li>
          ))}
          {(events ?? []).length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Noch keine Ereignisse.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
