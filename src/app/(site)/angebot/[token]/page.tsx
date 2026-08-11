import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, FileText, Package, XCircle } from 'lucide-react';
import { OfferActions } from './offer-actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { formatCents } from '@/lib/pricing';
import { cityName, countryFlags } from '@/config/regions';
import { formatDate } from '@/lib/utils';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t('offer.metaTitle'),
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

/**
 * Token-protected quote page.
 *
 * The 40-character token in the URL is the only credential. It is looked up
 * server-side and only the fields the customer already provided (plus our
 * price) are rendered — no internal notes, no other requests.
 */
export default async function OfferPage({ params }: Props) {
  const t = await getT();
  const { token } = await params;

  if (!/^[a-f0-9]{16,64}$/.test(token) || !isSupabaseConfigured()) {
    notFound();
  }

  const supabase = createAdminClient();
  const { data: request } = await supabase
    .from('bulky_item_requests')
    // Must stay a single string literal: the Supabase client infers the row
    // type from it, and a concatenated expression collapses to `unknown`.
    .select(
      'reference, status, item_type, item_description, approx_weight_kg, length_cm, width_cm, height_cm, origin_country, origin_city, destination_country, destination_city, pickup_requested, quoted_price_cents, quote_note, quoted_at, contact_first_name, shipment_id',
    )
    .eq('public_token', token)
    .maybeSingle();

  if (!request) notFound();

  let trackingNumber: string | null = null;
  if (request.shipment_id) {
    const { data: shipment } = await supabase
      .from('shipments')
      .select('tracking_number')
      .eq('id', request.shipment_id)
      .maybeSingle();
    trackingNumber = shipment?.tracking_number ?? null;
  }

  const dimensions =
    request.length_cm && request.width_cm && request.height_cm
      ? `${request.length_cm} × ${request.width_cm} × ${request.height_cm} cm`
      : null;

  return (
    <div className="container max-w-2xl py-10 sm:py-16">
      <header>
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary-muted text-primary">
          <FileText className="size-6" aria-hidden />
        </span>
        <p className="mt-5 text-sm font-medium text-muted-foreground">
          {t('offer.reference', { reference: request.reference })}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {t('offer.greeting', { name: request.contact_first_name })}
        </h1>
      </header>

      <div className="surface mt-8 overflow-hidden">
        <div className="corridor-gradient border-b border-border p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t('offer.fixedPrice')}</p>
          <p className="mt-2 text-5xl font-bold tracking-tight tabular-nums">
            {request.quoted_price_cents != null ? formatCents(request.quoted_price_cents) : '—'}
          </p>
          {request.quoted_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t('offer.createdOn', { date: formatDate(request.quoted_at) })}
            </p>
          )}
        </div>

        <dl className="divide-y divide-border">
          <Row label={t('offer.rowItem')}>{request.item_type}</Row>
          {request.item_description && (
            <Row label={t('booking.descriptionLabel')}>{request.item_description}</Row>
          )}
          <Row label={t('common.route')}>
            {countryFlags[request.origin_country]} {cityName(request.origin_city)}
            <span className="mx-2 text-muted-foreground">→</span>
            {cityName(request.destination_city)} {countryFlags[request.destination_country]}
          </Row>
          {request.approx_weight_kg && (
            <Row label={t('offer.rowWeightApprox')}>{request.approx_weight_kg} kg</Row>
          )}
          {dimensions && <Row label={t('offer.rowDimensions')}>{dimensions}</Row>}
          <Row label={t('common.pickup')}>
            {request.pickup_requested ? t('offer.pickupIncluded') : t('common.nope')}
          </Row>
        </dl>

        {request.quote_note && (
          <div className="border-t border-border bg-secondary/40 p-5 text-sm leading-relaxed text-muted-foreground">
            {request.quote_note}
          </div>
        )}
      </div>

      <div className="mt-8">
        {request.status === 'QUOTED' && <OfferActions token={token} />}

        {request.status === 'ACCEPTED' && (
          <Alert tone="success" title={t('offer.acceptedTitle')} icon={false}>
            <span className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>
                {t('offer.acceptedText')}
                {trackingNumber && (
                  <>
                    {' '}
                    {t('offer.acceptedNumber')}{' '}
                    <span className="font-mono font-semibold text-foreground">{trackingNumber}</span>
                  </>
                )}
                {t('offer.acceptedFollowUp')}
              </span>
            </span>
          </Alert>
        )}

        {request.status === 'REJECTED' && (
          <Alert tone="warning" title={t('offer.rejectedTitle')} icon={false}>
            <span className="flex items-start gap-2.5">
              <XCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span>{t('offer.rejectedText')}</span>
            </span>
          </Alert>
        )}

        {(request.status === 'NEW' || request.status === 'IN_REVIEW') && (
          <Alert tone="info" title={t('offer.pendingTitle')}>
            {t('offer.pendingText')}
          </Alert>
        )}
      </div>

      {trackingNumber && (
        <Link href={`/tracking/${trackingNumber}`} className="mt-6 inline-block">
          <Button variant="outline">
            <Package aria-hidden />
            {t('common.trackShipment')}
          </Button>
        </Link>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 p-4 sm:px-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
