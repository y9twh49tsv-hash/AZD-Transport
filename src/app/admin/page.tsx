import Link from 'next/link';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Euro,
  Package,
  Ship,
  Sofa,
  Warehouse,
  Weight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatCents, formatWeight } from '@/lib/pricing';
import { cityName } from '@/config/regions';
import { formatDate, formatRelative } from '@/lib/utils';
import { tripStatusLabels, type TripStatus } from '@/lib/shipment-status';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Stats = {
  shipments_today: number;
  open_pickups: number;
  in_transit: number;
  arrived_morocco: number;
  delivered_total: number;
  exceptions: number;
  unpaid: number;
  active_weight_kg: number;
  revenue_today_cents: number;
  revenue_week_cents: number;
  revenue_month_cents: number;
  open_bulky_requests: number;
};

const EMPTY_STATS: Stats = {
  shipments_today: 0,
  open_pickups: 0,
  in_transit: 0,
  arrived_morocco: 0,
  delivered_total: 0,
  exceptions: 0,
  unpaid: 0,
  active_weight_kg: 0,
  revenue_today_cents: 0,
  revenue_week_cents: 0,
  revenue_month_cents: 0,
  open_bulky_requests: 0,
};

export default async function AdminOverviewPage() {
  const supabase = await createServerSupabase();

  // One database round trip for all counters instead of a dozen queries.
  const [{ data: statsData }, { data: recent }, { data: trips }] = await Promise.all([
    supabase.rpc('admin_dashboard_stats'),
    supabase
      .from('shipments')
      .select(
        'id, tracking_number, status, origin_city, destination_city, weight_kg, price_total_cents, created_at, sender_last_name, sender_first_name',
      )
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('trips')
      .select('id, code, status, departure_date, origin_city, destination_city, max_payload_kg')
      .in('status', ['PLANNED', 'LOADING', 'DEPARTED', 'IN_TRANSIT'])
      .order('departure_date', { ascending: true })
      .limit(4),
  ]);

  const stats = (statsData as Stats | null) ?? EMPTY_STATS;

  // Capacity per trip comes from the view, which sums only non-cancelled loads.
  const tripIds = (trips ?? []).map((t) => t.id);
  const { data: capacities } = tripIds.length
    ? await supabase.from('trip_capacity').select('*').in('trip_id', tripIds)
    : { data: [] };

  const capacityByTrip = new Map((capacities ?? []).map((c) => [c.trip_id, c]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Übersicht</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stand: {formatDate(new Date())} · alle Zahlen in Echtzeit aus der Datenbank
        </p>
      </header>

      {stats.exceptions > 0 && (
        <Alert tone="error" title={`${stats.exceptions} Sendung(en) mit Problem`}>
          <Link href="/admin/sendungen?status=EXCEPTION" className="font-medium underline">
            Jetzt ansehen
          </Link>
        </Alert>
      )}

      {/* Operations */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Operativ
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Sendungen heute"
            value={stats.shipments_today}
            href="/admin/sendungen"
          />
          <StatCard
            icon={CalendarClock}
            label="Offene Abholungen"
            value={stats.open_pickups}
            href="/admin/abholungen"
            tone={stats.open_pickups > 0 ? 'accent' : 'default'}
          />
          <StatCard
            icon={Ship}
            label="Unterwegs"
            value={stats.in_transit}
            href="/admin/sendungen?status=IN_TRANSIT"
          />
          <StatCard
            icon={Warehouse}
            label="In Marokko"
            value={stats.arrived_morocco}
            href="/admin/sendungen?status=ARRIVED_MOROCCO"
          />
          <StatCard
            icon={CheckCircle2}
            label="Zugestellt (gesamt)"
            value={stats.delivered_total}
            href="/admin/sendungen?status=DELIVERED"
          />
          <StatCard
            icon={AlertTriangle}
            label="Probleme"
            value={stats.exceptions}
            href="/admin/sendungen?status=EXCEPTION"
            tone={stats.exceptions > 0 ? 'destructive' : 'default'}
          />
          <StatCard
            icon={Weight}
            label="Aktives Gesamtgewicht"
            value={formatWeight(stats.active_weight_kg)}
          />
          <StatCard
            icon={Sofa}
            label="Offene Sperrgut-Anfragen"
            value={stats.open_bulky_requests}
            href="/admin/sperrgut"
            tone={stats.open_bulky_requests > 0 ? 'accent' : 'default'}
          />
        </div>
      </section>

      {/* Money */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Umsatz
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Euro} label="Heute" value={formatCents(stats.revenue_today_cents)} />
          <StatCard icon={Euro} label="Diese Woche" value={formatCents(stats.revenue_week_cents)} />
          <StatCard icon={Euro} label="Dieser Monat" value={formatCents(stats.revenue_month_cents)} />
          <StatCard
            icon={Euro}
            label="Unbezahlte Sendungen"
            value={stats.unpaid}
            href="/admin/sendungen?bezahlt=nein"
            tone={stats.unpaid > 0 ? 'accent' : 'default'}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Latest shipments */}
        <section className="surface">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold">Neueste Sendungen</h2>
            <Link href="/admin/sendungen">
              <Button size="sm" variant="ghost">
                Alle ansehen
              </Button>
            </Link>
          </div>
          {(recent ?? []).length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Noch keine Sendungen vorhanden.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(recent ?? []).map((shipment) => (
                <li key={shipment.id}>
                  <Link
                    href={`/admin/sendungen/${shipment.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {shipment.tracking_number}
                        </span>
                        <StatusBadge status={shipment.status} withIcon={false} />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {shipment.sender_first_name} {shipment.sender_last_name} ·{' '}
                        {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·{' '}
                        {formatRelative(shipment.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCents(shipment.price_total_cents)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Trip capacity */}
        <section className="surface">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold">Auslastung der Touren</h2>
            <Link href="/admin/touren">
              <Button size="sm" variant="ghost">
                Alle Touren
              </Button>
            </Link>
          </div>
          {(trips ?? []).length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Keine aktiven Touren.{' '}
              <Link href="/admin/touren" className="font-medium text-primary underline">
                Tour anlegen
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {(trips ?? []).map((trip) => {
                const capacity = capacityByTrip.get(trip.id);
                const max = Number(capacity?.max_payload_kg ?? trip.max_payload_kg ?? 0);
                const loaded = Number(capacity?.loaded_weight_kg ?? 0);
                const percent = max > 0 ? Math.min(100, Math.round((loaded / max) * 100)) : 0;

                return (
                  <li key={trip.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/admin/touren/${trip.id}`}
                        className="font-mono text-sm font-semibold hover:underline"
                      >
                        {trip.code}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {tripStatusLabels[trip.status as TripStatus]} · Abfahrt{' '}
                        {formatDate(trip.departure_date)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cityName(trip.origin_city)} → {cityName(trip.destination_city)}
                    </p>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          percent > 90 ? 'bg-destructive' : percent > 70 ? 'bg-sand' : 'bg-primary',
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                      {formatWeight(loaded)} / {max > 0 ? formatWeight(max) : '—'}
                      {max > 0 && ` · ${percent} % ausgelastet`}
                      {capacity && ` · ${capacity.shipment_count} Sendungen`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone = 'default',
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  href?: string;
  tone?: 'default' | 'accent' | 'destructive';
}) {
  const content = (
    <div
      className={cn(
        'surface h-full p-4 transition-shadow',
        href && 'hover:shadow-lift',
        tone === 'accent' && 'border-accent/30 bg-accent/5',
        tone === 'destructive' && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'size-4',
            tone === 'accent'
              ? 'text-accent'
              : tone === 'destructive'
                ? 'text-destructive'
                : 'text-muted-foreground',
          )}
          aria-hidden
        />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
