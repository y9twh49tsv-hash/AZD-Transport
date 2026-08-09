import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Printer } from 'lucide-react';
import {
  AssignmentPanel,
  DangerPanel,
  EditPanel,
  PaymentPanel,
  PickupPanel,
  QrPreview,
  SealPanel,
  StatusPanel,
} from './shipment-actions';
import { PaymentBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { renderShipmentQr, scanUrl } from '@/lib/qr';
import { cityName, countryLabels } from '@/config/regions';
import { formatCents, formatWeight } from '@/lib/pricing';
import { formatDate, formatDateTime } from '@/lib/utils';
import { statusMeta, type ShipmentStatus } from '@/lib/shipment-status';
import { whatsappLink } from '@/lib/notifications/whatsapp';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function ShipmentDetailPage({ params }: Props) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createServerSupabase();

  const { data: shipment } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!shipment) notFound();

  const [
    { data: events },
    { data: seals },
    { data: drivers },
    { data: trips },
    { data: tripLink },
    { data: pickup },
    { data: payments },
    { data: audit },
  ] = await Promise.all([
    supabase
      .from('tracking_events')
      .select('id, status, occurred_at, location, public_message, internal_note, created_by')
      .eq('shipment_id', id)
      .order('occurred_at', { ascending: false }),
    supabase
      .from('security_seals')
      .select('id, seal_number, sealed_at, note, is_active')
      .eq('shipment_id', id)
      .order('sealed_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['driver', 'staff', 'admin'])
      .eq('is_active', true)
      .order('full_name'),
    supabase
      .from('trips')
      .select('id, code, origin_city, destination_city, departure_date, status')
      .not('status', 'eq', 'COMPLETED')
      .order('departure_date', { ascending: true }),
    supabase.from('trip_shipments').select('trip_id').eq('shipment_id', id).maybeSingle(),
    supabase
      .from('pickup_assignments')
      .select('id, scheduled_date, time_window_start, time_window_end, status, note, driver_id')
      .eq('shipment_id', id)
      .order('created_at', { ascending: false })
      .maybeSingle(),
    supabase
      .from('payments')
      .select('id, amount_cents, method, received_at, note')
      .eq('shipment_id', id)
      .order('received_at', { ascending: false }),
    supabase
      .from('audit_logs')
      .select('id, action, field, old_value, new_value, actor_label, actor_role, created_at')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const activeSeal = (seals ?? []).find((s) => s.is_active);
  const qrSvg = await renderShipmentQr(shipment.scan_token, { width: 200 });
  const url = scanUrl(shipment.scan_token);

  const driverOptions = (drivers ?? []).map((d) => ({
    id: d.id,
    name: `${d.full_name ?? 'Ohne Namen'}${d.role !== 'driver' ? ` (${d.role})` : ''}`,
  }));

  const tripOptions = (trips ?? []).map((t) => ({
    id: t.id,
    code: t.code,
    label: `${t.code} · ${cityName(t.origin_city)} → ${cityName(t.destination_city)} · ${formatDate(t.departure_date)}`,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/sendungen"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zurück zur Liste
      </Link>

      {/* Header */}
      <header className="surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                {shipment.tracking_number}
              </h1>
              <StatusBadge status={shipment.status} />
              <PaymentBadge status={shipment.payment_status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·{' '}
              {formatWeight(shipment.weight_kg)} · {shipment.piece_count} Gepäckstücke · gebucht am{' '}
              {formatDateTime(shipment.created_at)}
            </p>
            {shipment.shipment_type === 'bulky' && (
              <p className="mt-1 text-sm font-medium text-accent">
                Sperrgut · Pauschalpreis (kein Kilopreis)
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/sendungen/${id}/label`} target="_blank">
              <Button size="sm" variant="outline">
                <Printer aria-hidden />
                Label drucken
              </Button>
            </Link>
            <Link href={`/tracking/${shipment.tracking_number}`} target="_blank">
              <Button size="sm" variant="ghost">
                <ExternalLink aria-hidden />
                Kundenansicht
              </Button>
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Gesamtpreis</dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums">
              {formatCents(shipment.price_total_cents)}
            </dd>
            <dd className="text-xs text-muted-foreground">
              Transport {formatCents(shipment.price_base_cents)}
              {shipment.pickup_fee_cents > 0 &&
                ` + Abholung ${formatCents(shipment.pickup_fee_cents)}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Sicherheitsnummer</dt>
            <dd className="mt-0.5 font-mono text-base font-semibold">
              {activeSeal?.seal_number ?? '—'}
            </dd>
            {activeSeal && (
              <dd className="text-xs text-muted-foreground">
                versiegelt am {formatDate(activeSeal.sealed_at)}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Abholung</dt>
            <dd className="mt-0.5 text-base font-semibold">
              {shipment.pickup_requested ? 'Ja' : 'Nein'}
            </dd>
            {pickup && (
              <dd className="text-xs text-muted-foreground">
                {formatDate(pickup.scheduled_date)}
                {pickup.time_window_start && ` · ${pickup.time_window_start.slice(0, 5)}`}
                {pickup.time_window_end && `–${pickup.time_window_end.slice(0, 5)}`}
              </dd>
            )}
          </div>
        </dl>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Parties */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PartyCard
              title="Absender"
              name={`${shipment.sender_first_name} ${shipment.sender_last_name}`}
              phone={shipment.sender_phone}
              email={shipment.sender_email}
              address={shipment.sender_address}
              postalCode={shipment.sender_postal_code}
              city={shipment.sender_city}
              country={countryLabels[shipment.sender_country]}
            />
            <PartyCard
              title="Empfänger"
              name={`${shipment.recipient_first_name} ${shipment.recipient_last_name}`}
              phone={shipment.recipient_phone}
              address={shipment.recipient_address}
              city={shipment.recipient_city}
              country={countryLabels[shipment.recipient_country]}
            />
          </div>

          {/* Content */}
          <section className="surface p-5">
            <h2 className="font-semibold">Inhalt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Art">{shipment.content_type ?? '—'}</Row>
              <Row label="Beschreibung">{shipment.description ?? '—'}</Row>
              <Row label="Gewicht">{formatWeight(shipment.weight_kg)}</Row>
              <Row label="Gepäckstücke">{shipment.piece_count}</Row>
            </dl>
            {shipment.internal_notes && (
              <div className="mt-4 rounded-xl bg-sand/10 p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Interne Notiz
                </p>
                <p className="mt-1 whitespace-pre-wrap">{shipment.internal_notes}</p>
              </div>
            )}
          </section>

          {/* Tracking history */}
          <section className="surface">
            <h2 className="border-b border-border p-5 font-semibold">Trackinghistorie</h2>
            <ol className="divide-y divide-border">
              {(events ?? []).map((event) => {
                const meta = statusMeta[event.status as ShipmentStatus];
                const Icon = meta?.icon;
                return (
                  <li key={event.id} className="flex gap-4 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      {Icon && <Icon className="size-4" aria-hidden />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{meta?.label ?? event.status}</p>
                      {event.public_message && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{event.public_message}</p>
                      )}
                      {event.internal_note && (
                        <p className="mt-1 rounded-lg bg-sand/10 px-2 py-1 text-xs text-muted-foreground">
                          Intern: {event.internal_note}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(event.occurred_at)}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  </li>
                );
              })}
              {(events ?? []).length === 0 && (
                <li className="p-5 text-sm text-muted-foreground">Noch keine Ereignisse.</li>
              )}
            </ol>
          </section>

          {/* Payments */}
          {(payments ?? []).length > 0 && (
            <section className="surface">
              <h2 className="border-b border-border p-5 font-semibold">Zahlungen</h2>
              <ul className="divide-y divide-border">
                {(payments ?? []).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <p className="font-medium">{formatCents(payment.amount_cents)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.method} · {formatDateTime(payment.received_at)}
                        {payment.note && ` · ${payment.note}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Audit trail */}
          <section className="surface">
            <h2 className="border-b border-border p-5 font-semibold">Änderungsprotokoll</h2>
            {(audit ?? []).length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Keine Änderungen protokolliert.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {(audit ?? []).map((entry) => (
                  <li key={entry.id} className="p-4">
                    <p>
                      <span className="font-medium">{entry.action}</span>
                      {entry.field && (
                        <span className="text-muted-foreground">
                          {' '}
                          — {entry.field}: {entry.old_value ?? '—'} → {entry.new_value ?? '—'}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.actor_label ?? entry.actor_role ?? 'System'} ·{' '}
                      {formatDateTime(entry.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column — actions */}
        <div className="space-y-6">
          <QrPreview svg={qrSvg} scanUrl={url} />

          <StatusPanel shipmentId={id} currentStatus={shipment.status} />

          <SealPanel shipmentId={id} currentSeal={activeSeal?.seal_number} />

          <AssignmentPanel
            shipmentId={id}
            drivers={driverOptions}
            trips={tripOptions}
            currentDriverId={shipment.assigned_driver_id}
            currentTripId={tripLink?.trip_id ?? null}
          />

          <PickupPanel
            shipmentId={id}
            drivers={driverOptions}
            scheduledDate={pickup?.scheduled_date ?? shipment.pickup_date}
          />

          <EditPanel
            shipmentId={id}
            weightKg={shipment.weight_kg}
            pieceCount={shipment.piece_count}
            priceTotalCents={shipment.price_total_cents}
            paymentStatus={shipment.payment_status}
            internalNotes={shipment.internal_notes}
          />

          <PaymentPanel shipmentId={id} priceTotalCents={shipment.price_total_cents} />

          <DangerPanel shipmentId={id} />
        </div>
      </div>
    </div>
  );
}

function PartyCard({
  title,
  name,
  phone,
  email,
  address,
  postalCode,
  city,
  country,
}: {
  title: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  postalCode?: string | null;
  city: string;
  country: string;
}) {
  return (
    <section className="surface p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <p className="mt-2 font-semibold">{name}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {address}
        <br />
        {postalCode} {city}
        <br />
        {country}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`tel:${phone.replace(/\s/g, '')}`}>
          <Button size="sm" variant="outline">
            {phone}
          </Button>
        </a>
        <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost">
            WhatsApp
          </Button>
        </a>
      </div>
      {email && (
        <a
          href={`mailto:${email}`}
          className="mt-2 block break-all text-sm text-primary hover:underline"
        >
          {email}
        </a>
      )}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
