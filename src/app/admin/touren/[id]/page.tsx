import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge, TripStatusBadge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatCents, formatWeight } from '@/lib/pricing';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ShipmentStatus, TripStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createServerSupabase();

  const { data: trip } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
  if (!trip) notFound();

  const [{ data: capacity }, { data: links }, { data: vehicle }] = await Promise.all([
    supabase.from('trip_capacity').select('*').eq('trip_id', id).maybeSingle(),
    supabase.from('trip_shipments').select('shipment_id').eq('trip_id', id),
    trip.vehicle_id
      ? supabase.from('vehicles').select('plate, make, model, payload_kg').eq('id', trip.vehicle_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const shipmentIds = (links ?? []).map((l) => l.shipment_id);
  const { data: shipments } = shipmentIds.length
    ? await supabase
        .from('shipments')
        .select(
          'id, tracking_number, status, weight_kg, piece_count, price_total_cents, origin_city, destination_city, recipient_last_name',
        )
        .in('id', shipmentIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const max = Number(capacity?.max_payload_kg ?? trip.max_payload_kg ?? vehicle?.payload_kg ?? 0);
  const loaded = Number(capacity?.loaded_weight_kg ?? 0);
  const percent = max > 0 ? Math.min(100, Math.round((loaded / max) * 100)) : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/touren"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zurück zu den Touren
      </Link>

      <header className="surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-bold tracking-tight">{trip.code}</h1>
              <TripStatusBadge status={trip.status as TripStatus} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {cityName(trip.origin_city)} → {cityName(trip.destination_city)} · Abfahrt{' '}
              {formatDate(trip.departure_date)}
              {trip.planned_arrival_date && ` · Ankunft geplant ${formatDate(trip.planned_arrival_date)}`}
            </p>
            {vehicle && (
              <p className="mt-1 text-sm text-muted-foreground">
                Fahrzeug {vehicle.plate} · {[vehicle.make, vehicle.model].filter(Boolean).join(' ')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Auslastung</span>
            <span className="tabular-nums text-muted-foreground">
              {formatWeight(loaded)} / {max > 0 ? formatWeight(max) : '—'} · {percent} %
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percent > 90 ? 'bg-destructive' : percent > 70 ? 'bg-sand' : 'bg-primary',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {trip.notes && (
          <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
            {trip.notes}
          </p>
        )}
      </header>

      <section className="surface">
        <h2 className="border-b border-border p-5 font-semibold">
          Sendungen auf dieser Tour ({(shipments ?? []).length})
        </h2>

        {(shipments ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Noch keine Sendungen zugeordnet. Du weist sie in der jeweiligen Sendungsansicht unter
            „Zuweisung“ zu.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {(shipments ?? []).map((shipment) => (
              <li key={shipment.id}>
                <Link
                  href={`/admin/sendungen/${shipment.id}`}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {shipment.tracking_number}
                      </span>
                      <StatusBadge status={shipment.status as ShipmentStatus} withIcon={false} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·
                      Empfänger {shipment.recipient_last_name}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium tabular-nums">{formatWeight(shipment.weight_kg)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {shipment.piece_count} Stück · {formatCents(shipment.price_total_cents)}
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
