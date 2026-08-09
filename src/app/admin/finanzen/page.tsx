import Link from 'next/link';
import { Euro, TrendingUp } from 'lucide-react';
import { PaymentBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatCents } from '@/lib/pricing';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cityName } from '@/config/regions';

export const dynamic = 'force-dynamic';

type Stats = {
  revenue_today_cents: number;
  revenue_week_cents: number;
  revenue_month_cents: number;
  unpaid: number;
};

export default async function FinancePage() {
  const supabase = await createServerSupabase();

  const [{ data: statsData }, { data: unpaid }, { data: payments }] = await Promise.all([
    supabase.rpc('admin_dashboard_stats'),
    supabase
      .from('shipments')
      .select(
        'id, tracking_number, sender_first_name, sender_last_name, price_total_cents, payment_status, created_at, origin_city, destination_city',
      )
      .eq('payment_status', 'unpaid')
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: true })
      .limit(50),
    supabase
      .from('payments')
      .select('id, shipment_id, amount_cents, method, received_at, note')
      .order('received_at', { ascending: false })
      .limit(30),
  ]);

  const stats = (statsData as Stats | null) ?? {
    revenue_today_cents: 0,
    revenue_week_cents: 0,
    revenue_month_cents: 0,
    unpaid: 0,
  };

  const openTotal = (unpaid ?? []).reduce((sum, s) => sum + s.price_total_cents, 0);

  // Resolve tracking numbers for the payment ledger in one extra query.
  const shipmentIds = [...new Set((payments ?? []).map((p) => p.shipment_id))];
  const { data: paidShipments } = shipmentIds.length
    ? await supabase.from('shipments').select('id, tracking_number').in('id', shipmentIds)
    : { data: [] };
  const trackingById = new Map((paidShipments ?? []).map((s) => [s.id, s.tracking_number]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Finanzen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Umsätze und offene Posten. Stornierte Sendungen sind überall herausgerechnet.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={Euro} label="Umsatz heute" value={formatCents(stats.revenue_today_cents)} />
        <Card icon={Euro} label="Umsatz Woche" value={formatCents(stats.revenue_week_cents)} />
        <Card icon={TrendingUp} label="Umsatz Monat" value={formatCents(stats.revenue_month_cents)} />
        <Card
          icon={Euro}
          label="Offene Forderungen"
          value={formatCents(openTotal)}
          hint={`${(unpaid ?? []).length} Sendungen`}
          tone="accent"
        />
      </div>

      <section className="surface">
        <h2 className="border-b border-border p-5 font-semibold">Unbezahlte Sendungen</h2>
        {(unpaid ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Alles bezahlt — keine offenen Posten.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {(unpaid ?? []).map((shipment) => (
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
                      <PaymentBadge status={shipment.payment_status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shipment.sender_first_name} {shipment.sender_last_name} ·{' '}
                      {cityName(shipment.origin_city)} → {cityName(shipment.destination_city)} ·
                      gebucht {formatDate(shipment.created_at)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatCents(shipment.price_total_cents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface">
        <h2 className="border-b border-border p-5 font-semibold">Letzte Zahlungseingänge</h2>
        {(payments ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Noch keine Zahlungen erfasst.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(payments ?? []).map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/sendungen/${payment.shipment_id}`}
                    className="font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {trackingById.get(payment.shipment_id) ?? 'Sendung'}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {payment.method} · {formatDateTime(payment.received_at)}
                    {payment.note && ` · ${payment.note}`}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatCents(payment.amount_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="surface p-5">
        <h2 className="font-semibold">Online-Zahlung</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Die Datenstruktur ist bereits auf Online-Zahlungen vorbereitet: jede Sendung hat einen
          Zahlungsstatus, und Zahlungen werden in einer eigenen Tabelle als Einzelposten geführt.
          Für eine echte Anbindung (z. B. Stripe oder PayPal) muss nur ein Webhook ergänzt werden,
          der eine Zeile in <code className="rounded bg-secondary px-1 text-xs">payments</code>{' '}
          schreibt und den Status auf „Online bezahlt“ setzt.
        </p>
        <Link href="/admin/sendungen?bezahlt=nein" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Offene Sendungen ansehen
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: typeof Euro;
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <div
      className={`surface p-4 ${tone === 'accent' ? 'border-accent/30 bg-accent/5' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`size-4 ${tone === 'accent' ? 'text-accent' : 'text-muted-foreground'}`}
          aria-hidden
        />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
