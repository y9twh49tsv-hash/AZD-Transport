import { notFound } from 'next/navigation';
import { PrintButton } from './print-button';
import { createServerSupabase } from '@/lib/supabase/server';
import { renderShipmentQr } from '@/lib/qr';
import { brand } from '@/config/brand';
import { cityName, countryFlags, countryLabels } from '@/config/regions';
import { formatWeight } from '@/lib/pricing';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Printable A6 shipping label.
 *
 * Deliberately minimal: tracking number, QR code, route, recipient first and
 * last name, piece count, weight and the seal number. No phone number, no
 * address, no price — a label travels through many hands.
 */
export default async function LabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ intern?: string; von?: string }>;
}) {
  const { id } = await params;
  const { intern, von } = await searchParams;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createServerSupabase();
  const { data: shipment } = await supabase
    .from('shipments')
    .select(
      'id, tracking_number, scan_token, origin_city, origin_country, destination_city, destination_country, recipient_first_name, recipient_last_name, recipient_phone, recipient_city, weight_kg, piece_count, created_at',
    )
    .eq('id', id)
    .maybeSingle();

  if (!shipment) notFound();

  const { data: seal } = await supabase
    .from('security_seals')
    .select('seal_number')
    .eq('shipment_id', id)
    .eq('is_active', true)
    .maybeSingle();

  const qrSvg = await renderShipmentQr(shipment.scan_token, { width: 320 });

  // Internal labels may carry the recipient phone number; customer-facing ones never do.
  const isInternal = intern === '1';

  // One label per piece: /label?von=2 prints "2/3".
  const pieceIndex = Number.parseInt(von ?? '1', 10);
  const currentPiece =
    Number.isFinite(pieceIndex) && pieceIndex >= 1 && pieceIndex <= shipment.piece_count
      ? pieceIndex
      : 1;

  return (
    <div className="min-h-dvh bg-secondary/40 p-6 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-[105mm] flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Versandlabel</h1>
          <p className="text-sm text-muted-foreground">
            Format A6 · {isInternal ? 'internes Label (mit Telefonnummer)' : 'Kundenlabel'}
          </p>
        </div>
        <PrintButton
          shipmentId={id}
          pieceCount={shipment.piece_count}
          currentPiece={currentPiece}
          isInternal={isInternal}
        />
      </div>

      {/* A6 = 105 × 148 mm */}
      <article className="mx-auto flex h-[148mm] w-[105mm] flex-col border border-black bg-white p-[6mm] text-black print:border-0">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-black pb-[3mm]">
          <div>
            <p className="text-[15pt] font-extrabold leading-none tracking-tight">{brand.name}</p>
            <p className="mt-[1mm] text-[7pt] uppercase tracking-[0.12em]">
              {countryLabels.DE} ↔ {countryLabels.MA}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[7pt] uppercase tracking-wide">Stück</p>
            <p className="text-[13pt] font-bold leading-none">
              {currentPiece}/{shipment.piece_count}
            </p>
          </div>
        </header>

        {/* Tracking number */}
        <div className="mt-[3mm]">
          <p className="text-[7pt] uppercase tracking-[0.12em]">Sendungsnummer</p>
          <p className="font-mono text-[17pt] font-bold leading-tight tracking-tight">
            {shipment.tracking_number}
          </p>
        </div>

        {/* Route + QR */}
        <div className="mt-[3mm] flex items-start gap-[4mm]">
          <div className="min-w-0 flex-1">
            <p className="text-[7pt] uppercase tracking-[0.12em]">Route</p>
            <p className="mt-[1mm] text-[11pt] font-bold leading-tight">
              {countryFlags[shipment.origin_country]} {cityName(shipment.origin_city)}
            </p>
            <p className="text-[11pt] leading-none">↓</p>
            <p className="text-[11pt] font-bold leading-tight">
              {countryFlags[shipment.destination_country]} {cityName(shipment.destination_city)}
            </p>
          </div>

          <div
            className="w-[26mm] shrink-0 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>

        {/* Recipient */}
        <div className="mt-[3mm] border-t border-black pt-[2mm]">
          <p className="text-[7pt] uppercase tracking-[0.12em]">Empfänger</p>
          <p className="text-[12pt] font-bold leading-tight">
            {shipment.recipient_first_name} {shipment.recipient_last_name}
          </p>
          <p className="text-[9pt] leading-tight">{shipment.recipient_city}</p>
          {isInternal && (
            <p className="mt-[1mm] font-mono text-[9pt] leading-tight">
              {shipment.recipient_phone}
            </p>
          )}
        </div>

        {/* Facts */}
        <div className="mt-auto grid grid-cols-2 gap-[2mm] border-t-2 border-black pt-[2mm] text-[8pt]">
          <div>
            <p className="uppercase tracking-wide">Gewicht</p>
            <p className="text-[11pt] font-bold leading-tight">{formatWeight(shipment.weight_kg)}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Sicherheitsnummer</p>
            <p className="font-mono text-[10pt] font-bold leading-tight">
              {seal?.seal_number ?? '—'}
            </p>
          </div>
        </div>

        <p className="mt-[2mm] text-[6.5pt] leading-tight">
          Gebucht am {formatDate(shipment.created_at)} · Statusabfrage über die Sendungsnummer auf{' '}
          {brand.name}
        </p>
      </article>

      <p className="no-print mx-auto mt-6 max-w-[105mm] text-xs leading-relaxed text-muted-foreground">
        Drucke auf A6-Etiketten oder auf A4 und schneide zu. Der QR-Code führt auf eine geschützte
        interne Seite — er enthält keine Kundendaten.
      </p>
    </div>
  );
}
