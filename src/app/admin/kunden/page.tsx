import Link from 'next/link';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { countryLabels } from '@/config/regions';
import { formatDate } from '@/lib/utils';
import { whatsappLink } from '@/lib/notifications/whatsapp';

export const dynamic = 'force-dynamic';

function escapeFilterValue(value: string): string {
  return value.replace(/[,()\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const supabase = await createServerSupabase();

  let request = supabase
    .from('customers')
    .select('id, first_name, last_name, email, phone, city, country, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100);

  if (query) {
    const safe = escapeFilterValue(query);
    if (safe) {
      request = request.or(
        `last_name.ilike.%${safe}%,first_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`,
      );
    }
  }

  const { data: customers, count } = await request;
  const list = customers ?? [];

  // Shipment counts per customer, resolved in one extra query.
  const ids = list.map((c) => c.id);
  const { data: shipments } = ids.length
    ? await supabase.from('shipments').select('customer_id').in('customer_id', ids)
    : { data: [] };

  const shipmentCount = new Map<string, number>();
  for (const row of shipments ?? []) {
    if (row.customer_id) {
      shipmentCount.set(row.customer_id, (shipmentCount.get(row.customer_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kunden</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count ?? list.length} {(count ?? list.length) === 1 ? 'Kunde' : 'Kunden'}
        </p>
      </header>

      <form method="get" className="surface flex flex-wrap gap-3 p-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Name, Telefon oder E-Mail"
          className="min-h-10 flex-1 rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        <Button type="submit">Suchen</Button>
        {query && (
          <Link href="/admin/kunden">
            <Button variant="ghost">Zurücksetzen</Button>
          </Link>
        )}
      </form>

      {list.length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Users className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Keine Kunden gefunden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kundendatensätze entstehen automatisch bei jeder Buchung.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((customer) => (
            <li key={customer.id} className="surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.city ?? '—'}
                    {customer.country && ` · ${countryLabels[customer.country]}`}
                    {' · Kunde seit '}
                    {formatDate(customer.created_at)}
                  </p>
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="mt-1 block break-all text-sm text-primary hover:underline"
                    >
                      {customer.email}
                    </a>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {shipmentCount.get(customer.id) ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Sendungen</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                <a href={`tel:${customer.phone.replace(/\s/g, '')}`}>
                  <Button size="sm" variant="outline">
                    {customer.phone}
                  </Button>
                </a>
                <a href={whatsappLink(customer.phone)} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost">
                    WhatsApp
                  </Button>
                </a>
                <Link href={`/admin/sendungen?q=${encodeURIComponent(customer.last_name)}`}>
                  <Button size="sm" variant="ghost">
                    Sendungen anzeigen
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
