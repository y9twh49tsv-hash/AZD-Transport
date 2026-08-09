import { Truck } from 'lucide-react';
import { VehicleForm } from './vehicle-form';
import { Badge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatWeight } from '@/lib/pricing';
import { vehicleStatusLabels, type VehicleStatus } from '@/lib/shipment-status';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const statusTone: Record<VehicleStatus, string> = {
  available: 'bg-primary-muted text-primary border-primary/20',
  on_trip: 'bg-sand/15 text-sand-foreground border-sand/30',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/25',
};

export default async function VehiclesPage() {
  const supabase = await createServerSupabase();
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate, make, model, gross_weight_kg, payload_kg, cargo_volume_m3, status, notes')
    .order('plate');

  const list = vehicles ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Fahrzeuge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length} {list.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}
          </p>
        </div>
        <VehicleForm />
      </header>

      {list.length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Truck className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Noch keine Fahrzeuge</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege deine Fahrzeuge an, damit du sie Touren zuordnen und die Auslastung berechnen kannst.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((vehicle) => (
            <li key={vehicle.id} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-bold">{vehicle.plate}</p>
                  <p className="text-sm text-muted-foreground">
                    {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>
                <Badge className={cn(statusTone[vehicle.status as VehicleStatus])}>
                  {vehicleStatusLabels[vehicle.status as VehicleStatus]}
                </Badge>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Nutzlast</dt>
                  <dd className="font-semibold tabular-nums">{formatWeight(vehicle.payload_kg)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Zul. Gesamtgewicht</dt>
                  <dd className="tabular-nums">
                    {vehicle.gross_weight_kg ? formatWeight(vehicle.gross_weight_kg) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Laderaum</dt>
                  <dd className="tabular-nums">
                    {vehicle.cargo_volume_m3 ? `${vehicle.cargo_volume_m3} m³` : '—'}
                  </dd>
                </div>
              </dl>

              {vehicle.notes && (
                <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                  {vehicle.notes}
                </p>
              )}

              <div className="mt-4">
                <VehicleForm
                  initial={{
                    id: vehicle.id,
                    plate: vehicle.plate,
                    make: vehicle.make ?? '',
                    model: vehicle.model ?? '',
                    grossWeightKg: vehicle.gross_weight_kg?.toString() ?? '',
                    payloadKg: vehicle.payload_kg.toString(),
                    cargoVolumeM3: vehicle.cargo_volume_m3?.toString() ?? '',
                    status: vehicle.status,
                    notes: vehicle.notes ?? '',
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
