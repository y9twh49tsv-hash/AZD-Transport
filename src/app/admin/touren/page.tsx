import Link from 'next/link';
import { Route as RouteIcon } from 'lucide-react';
import { TripForm } from './trip-form';
import { TripStatusBadge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TripStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  const supabase = await createServerSupabase();

  const [{ data: trips }, { data: capacities }, { data: vehicles }, { data: drivers }] =
    await Promise.all([
      supabase
        .from('trips')
        .select(
          'id, code, status, origin_city, destination_city, departure_date, planned_arrival_date, vehicle_id, driver_id, max_payload_kg, notes',
        )
        .order('departure_date', { ascending: false })
        .limit(60),
      supabase.from('trip_capacity').select('*'),
      supabase.from('vehicles').select('id, plate, make, model, payload_kg').order('plate'),
      supabase.from('profiles').select('id, full_name').eq('role', 'driver').eq('is_active', true),
    ]);

  const capacityByTrip = new Map((capacities ?? []).map((c) => [c.trip_id, c]));
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v]));
  const driverById = new Map((drivers ?? []).map((d) => [d.id, d.full_name ?? 'Fahrer']));

  const vehicleOptions = (vehicles ?? []).map((v) => ({
    id: v.id,
    label: `${v.plate} · ${[v.make, v.model].filter(Boolean).join(' ')} · ${formatWeight(v.payload_kg)}`,
  }));
  const driverOptions = (drivers ?? []).map((d) => ({ id: d.id, label: d.full_name ?? 'Fahrer' }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Touren</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auslastung und Planung deiner Transporte
          </p>
        </div>
        <TripForm vehicles={vehicleOptions} drivers={driverOptions} />
      </header>

      {(trips ?? []).length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <RouteIcon className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Noch keine Touren</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege deine erste Tour an, um Sendungen zuzuordnen und die Auslastung zu sehen.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {(trips ?? []).map((trip) => {
            const capacity = capacityByTrip.get(trip.id);
            const vehicle = trip.vehicle_id ? vehicleById.get(trip.vehicle_id) : null;
            const max = Number(capacity?.max_payload_kg ?? trip.max_payload_kg ?? vehicle?.payload_kg ?? 0);
            const loaded = Number(capacity?.loaded_weight_kg ?? 0);
            const free = Math.max(0, max - loaded);
            const percent = max > 0 ? Math.min(100, Math.round((loaded / max) * 100)) : 0;

            return (
              <li key={trip.id} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/touren/${trip.id}`}
                      className="font-mono text-lg font-bold hover:underline"
                    >
                      {trip.code}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {cityName(trip.origin_city)} → {cityName(trip.destination_city)}
                    </p>
                  </div>
                  <TripStatusBadge status={trip.status as TripStatus} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Abfahrt</dt>
                    <dd className="font-medium">{formatDate(trip.departure_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Geplante Ankunft</dt>
                    <dd className="font-medium">{formatDate(trip.planned_arrival_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Fahrzeug</dt>
                    <dd className="font-medium">{vehicle?.plate ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Fahrer</dt>
                    <dd className="font-medium">
                      {trip.driver_id ? (driverById.get(trip.driver_id) ?? '—') : '—'}
                    </dd>
                  </div>
                </dl>

                {/* Capacity — internal information only */}
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">Auslastung</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatWeight(loaded)} / {max > 0 ? formatWeight(max) : '—'}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        percent > 90 ? 'bg-destructive' : percent > 70 ? 'bg-sand' : 'bg-primary',
                      )}
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                    {percent} % ausgelastet · {formatWeight(free)} frei ·{' '}
                    {capacity?.shipment_count ?? 0} Sendungen
                  </p>
                </div>

                {trip.notes && (
                  <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                    {trip.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Auslastungsdaten sind ausschließlich intern — sie erscheinen nirgends in der Kundenansicht.
      </p>
    </div>
  );
}
