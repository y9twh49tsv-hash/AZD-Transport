import Link from 'next/link';
import { Filter, Package, X } from 'lucide-react';
import { PaymentBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName, cities, countryLabels, type CountryCode } from '@/config/regions';
import { formatCents, formatWeight } from '@/lib/pricing';
import { formatDate } from '@/lib/utils';
import {
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES,
  isShipmentStatus,
  paymentStatusLabels,
  statusLabel,
  type PaymentStatus,
} from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 40;

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  const result = Array.isArray(value) ? value[0] : value;
  return result?.trim() || undefined;
}

/** Escapes the PostgREST `or()` grammar so a search term cannot break out. */
function escapeFilterValue(value: string): string {
  return value.replace(/[,()\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const status = single(params, 'status');
  const paid = single(params, 'bezahlt');
  const country = single(params, 'land');
  const city = single(params, 'stadt');
  const from = single(params, 'von');
  const to = single(params, 'bis');
  const query = single(params, 'q');
  const page = Math.max(1, Number.parseInt(single(params, 'seite') ?? '1', 10) || 1);

  const supabase = await createServerSupabase();

  let request = supabase
    .from('shipments')
    .select(
      'id, tracking_number, status, payment_status, sender_first_name, sender_last_name, sender_phone, origin_city, destination_city, origin_country, destination_country, weight_kg, piece_count, price_total_cents, pickup_requested, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status && isShipmentStatus(status)) request = request.eq('status', status);
  if (paid === 'nein') request = request.eq('payment_status', 'unpaid');
  if (paid === 'ja') request = request.neq('payment_status', 'unpaid');
  if (country === 'DE' || country === 'MA') request = request.eq('origin_country', country);
  if (city) request = request.or(`origin_city.eq.${city},destination_city.eq.${city}`);
  if (from) request = request.gte('created_at', `${from}T00:00:00`);
  if (to) request = request.lte('created_at', `${to}T23:59:59`);

  if (query) {
    const safe = escapeFilterValue(query);
    if (safe) {
      request = request.or(
        `tracking_number.ilike.%${safe}%,sender_last_name.ilike.%${safe}%,sender_first_name.ilike.%${safe}%,recipient_last_name.ilike.%${safe}%,sender_phone.ilike.%${safe}%,recipient_phone.ilike.%${safe}%`,
      );
    }
  }

  const { data: shipments, count } = await request;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(status || paid || country || city || from || to || query);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { status, bezahlt: paid, land: country, stadt: city, von: from, bis: to, q: query, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const search = next.toString();
    return `/admin/sendungen${search ? `?${search}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sendungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? 'Sendung' : 'Sendungen'}
            {hasFilters && ' (gefiltert)'}
          </p>
        </div>
        {hasFilters && (
          <Link href="/admin/sendungen">
            <Button variant="ghost" size="sm">
              <X aria-hidden />
              Filter zurücksetzen
            </Button>
          </Link>
        )}
      </header>

      {/* Filters */}
      <form method="get" className="surface p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="size-4" aria-hidden />
          Filter
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Suche" name="q" defaultValue={query} placeholder="Nummer, Name, Telefon" />

          <FilterSelect label="Status" name="status" defaultValue={status}>
            <option value="">Alle</option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Bezahlt" name="bezahlt" defaultValue={paid}>
            <option value="">Alle</option>
            <option value="ja">Bezahlt</option>
            <option value="nein">Unbezahlt</option>
          </FilterSelect>

          <FilterSelect label="Startland" name="land" defaultValue={country}>
            <option value="">Alle</option>
            {(['DE', 'MA'] as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {countryLabels[c]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Stadt (Start oder Ziel)" name="stadt" defaultValue={city}>
            <option value="">Alle</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({countryLabels[c.country]})
              </option>
            ))}
          </FilterSelect>

          <FilterField label="Gebucht ab" name="von" type="date" defaultValue={from} />
          <FilterField label="Gebucht bis" name="bis" type="date" defaultValue={to} />

          <div className="flex items-end">
            <Button type="submit" block>
              Anwenden
            </Button>
          </div>
        </div>
      </form>

      {/* Table (desktop) / cards (mobile) */}
      {(shipments ?? []).length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Package className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Keine Sendungen gefunden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters ? 'Versuche es mit weniger Filtern.' : 'Sobald Kunden buchen, erscheinen sie hier.'}
          </p>
        </div>
      ) : (
        <>
          <div className="surface hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50 text-left">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <Th>Nummer</Th>
                  <Th>Kunde</Th>
                  <Th>Route</Th>
                  <Th className="text-right">Gewicht</Th>
                  <Th className="text-right">Stück</Th>
                  <Th className="text-right">Preis</Th>
                  <Th>Abholung</Th>
                  <Th>Status</Th>
                  <Th>Zahlung</Th>
                  <Th>Datum</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(shipments ?? []).map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-secondary/40">
                    <Td>
                      <Link
                        href={`/admin/sendungen/${s.id}`}
                        className="font-mono font-semibold text-primary hover:underline"
                      >
                        {s.tracking_number}
                      </Link>
                    </Td>
                    <Td>
                      <span className="block">
                        {s.sender_first_name} {s.sender_last_name}
                      </span>
                      <span className="block text-xs text-muted-foreground">{s.sender_phone}</span>
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {cityName(s.origin_city)} → {cityName(s.destination_city)}
                    </Td>
                    <Td className="text-right tabular-nums">{formatWeight(s.weight_kg)}</Td>
                    <Td className="text-right tabular-nums">{s.piece_count}</Td>
                    <Td className="text-right font-semibold tabular-nums">
                      {formatCents(s.price_total_cents)}
                    </Td>
                    <Td className="text-muted-foreground">{s.pickup_requested ? 'Ja' : 'Nein'}</Td>
                    <Td>
                      <StatusBadge status={s.status} withIcon={false} />
                    </Td>
                    <Td>
                      <PaymentBadge status={s.payment_status} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {formatDate(s.created_at)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {(shipments ?? []).map((s) => (
              <li key={s.id}>
                <Link href={`/admin/sendungen/${s.id}`} className="surface block p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{s.tracking_number}</span>
                    <StatusBadge status={s.status} withIcon={false} />
                  </div>
                  <p className="mt-1.5 text-sm">
                    {s.sender_first_name} {s.sender_last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cityName(s.origin_city)} → {cityName(s.destination_city)} ·{' '}
                    {formatWeight(s.weight_kg)} · {s.piece_count} Stück
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <PaymentBadge status={s.payment_status} />
                    <span className="font-semibold tabular-nums">
                      {formatCents(s.price_total_cents)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between gap-3" aria-label="Seitennavigation">
              <Link href={buildHref({ seite: String(Math.max(1, page - 1)) })} aria-disabled={page <= 1}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Zurück
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                Seite {page} von {totalPages}
              </span>
              <Link
                href={buildHref({ seite: String(Math.min(totalPages, page + 1)) })}
                aria-disabled={page >= totalPages}
              >
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                  Weiter
                </Button>
              </Link>
            </nav>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Zahlungsstatus:{' '}
        {PAYMENT_STATUSES.map((s) => paymentStatusLabels[s as PaymentStatus]).join(' · ')}
      </p>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className ?? ''}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ''}`}>{children}</td>;
}

function FilterField({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      />
    </label>
  );
}

function FilterSelect({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        {children}
      </select>
    </label>
  );
}
