import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Package } from 'lucide-react';
import { QuoteForm } from './quote-form';
import { AttachmentGallery } from '@/components/admin/attachment-gallery';
import { BulkyStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase/server';
import { cityName, countryLabels } from '@/config/regions';
import { formatCents } from '@/lib/pricing';
import { formatDateTime } from '@/lib/utils';
import { appUrl } from '@/config/brand';
import { whatsappLink } from '@/lib/notifications/whatsapp';
import type { BulkyStatus } from '@/lib/shipment-status';

export const dynamic = 'force-dynamic';

export default async function BulkyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createServerSupabase();
  const { data: request } = await supabase
    .from('bulky_item_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!request) notFound();

  const [{ data: photos }, { data: shipment }] = await Promise.all([
    supabase
      .from('attachments')
      .select('id, caption, created_at')
      .eq('bulky_request_id', id)
      .order('created_at'),
    request.shipment_id
      ? supabase
          .from('shipments')
          .select('id, tracking_number')
          .eq('id', request.shipment_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const offerUrl = `${appUrl()}/angebot/${request.public_token}`;
  const dimensions =
    request.length_cm && request.width_cm && request.height_cm
      ? `${request.length_cm} × ${request.width_cm} × ${request.height_cm} cm`
      : '—';

  return (
    <div className="space-y-6">
      <Link
        href="/admin/sperrgut"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zurück zu den Anfragen
      </Link>

      <header className="surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-bold tracking-tight">{request.reference}</h1>
              <BulkyStatusBadge status={request.status as BulkyStatus} />
            </div>
            <p className="mt-2 text-lg font-semibold">{request.item_type}</p>
            <p className="text-sm text-muted-foreground">
              Eingegangen am {formatDateTime(request.created_at)}
            </p>
          </div>

          {shipment && (
            <Link href={`/admin/sendungen/${shipment.id}`}>
              <Button size="sm" variant="outline">
                <Package aria-hidden />
                Sendung {shipment.tracking_number}
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-semibold">Fotos vom Kunden</h2>
            <div className="mt-4">
              <AttachmentGallery attachments={photos ?? []} />
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="font-semibold">Angaben</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Gegenstand">{request.item_type}</Row>
              <Row label="Beschreibung">{request.item_description ?? '—'}</Row>
              <Row label="Gewicht (ca.)">
                {request.approx_weight_kg ? `${request.approx_weight_kg} kg` : '—'}
              </Row>
              <Row label="Maße (L × B × H)">{dimensions}</Row>
              <Row label="Route">
                {cityName(request.origin_city)} ({countryLabels[request.origin_country]}) →{' '}
                {cityName(request.destination_city)} ({countryLabels[request.destination_country]})
              </Row>
              <Row label="Abholung gewünscht">{request.pickup_requested ? 'Ja' : 'Nein'}</Row>
              <Row label="Anmerkungen">{request.notes ?? '—'}</Row>
            </dl>
          </section>

          <section className="surface p-5">
            <h2 className="font-semibold">Kontakt</h2>
            <p className="mt-2 font-medium">
              {request.contact_first_name} {request.contact_last_name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${request.phone.replace(/\s/g, '')}`}>
                <Button size="sm" variant="outline">
                  {request.phone}
                </Button>
              </a>
              <a href={whatsappLink(request.phone)} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost">
                  WhatsApp
                </Button>
              </a>
            </div>
            {request.email ? (
              <a
                href={`mailto:${request.email}`}
                className="mt-2 block break-all text-sm text-primary hover:underline"
              >
                {request.email}
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Keine E-Mail-Adresse angegeben.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <QuoteForm
            requestId={id}
            currentStatus={request.status as BulkyStatus}
            currentPriceCents={request.quoted_price_cents}
            currentNote={request.quote_note}
            hasEmail={!!request.email}
          />

          <section className="surface p-5">
            <h2 className="font-semibold">Angebotslink</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Über diesen Link sieht der Kunde sein Angebot und kann zusagen. Er enthält einen
              zufälligen Token und ist nicht erratbar.
            </p>
            <p className="mt-3 break-all rounded-lg bg-secondary p-3 font-mono text-xs">{offerUrl}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={offerUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  <ExternalLink aria-hidden />
                  Öffnen
                </Button>
              </a>
              <a
                href={whatsappLink(
                  request.phone,
                  `Hallo ${request.contact_first_name}, hier ist dein Angebot: ${offerUrl}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost">
                  Per WhatsApp senden
                </Button>
              </a>
            </div>
          </section>

          {request.quoted_price_cents != null && (
            <section className="surface p-5">
              <h2 className="font-semibold">Aktuelles Angebot</h2>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {formatCents(request.quoted_price_cents)}
              </p>
              {request.quoted_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  erstellt am {formatDateTime(request.quoted_at)}
                </p>
              )}
              {request.accepted_at && (
                <p className="mt-2 text-sm font-medium text-primary">
                  Angenommen am {formatDateTime(request.accepted_at)}
                </p>
              )}
              {request.rejected_at && (
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Abgelehnt am {formatDateTime(request.rejected_at)}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
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
