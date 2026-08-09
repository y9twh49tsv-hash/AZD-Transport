import Link from 'next/link';
import { Sofa } from 'lucide-react';
import { BulkyStatusBadge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName } from '@/config/regions';
import { formatCents } from '@/lib/pricing';
import { formatRelative } from '@/lib/utils';
import type { BulkyStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function BulkyRequestsPage() {
  const supabase = await createServerSupabase();

  const { data: requests } = await supabase
    .from('bulky_item_requests')
    .select(
      'id, reference, status, item_type, approx_weight_kg, origin_city, destination_city, contact_first_name, contact_last_name, phone, quoted_price_cents, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const list = requests ?? [];
  const open = list.filter((r) => r.status === 'NEW' || r.status === 'IN_REVIEW');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sperrgut-Anfragen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {open.length} offen · {list.length} insgesamt
        </p>
      </header>

      {list.length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Sofa className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Noch keine Anfragen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Anfragen aus dem Formular „Sperrgut anfragen“ landen hier.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((request) => (
            <li key={request.id}>
              <Link
                href={`/admin/sperrgut/${request.id}`}
                className="surface flex flex-wrap items-center gap-4 p-4 transition-shadow hover:shadow-lift"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{request.reference}</span>
                    <BulkyStatusBadge status={request.status as BulkyStatus} />
                  </div>
                  <p className="mt-1.5 font-medium">{request.item_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.contact_first_name} {request.contact_last_name} · {request.phone} ·{' '}
                    {cityName(request.origin_city)} → {cityName(request.destination_city)}
                    {request.approx_weight_kg && ` · ca. ${request.approx_weight_kg} kg`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {request.quoted_price_cents != null
                      ? formatCents(request.quoted_price_cents)
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(request.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
