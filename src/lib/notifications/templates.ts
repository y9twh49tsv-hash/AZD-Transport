import { brand, appUrl } from '@/config/brand';
import { cityName } from '@/config/regions';
import type { EmailMessage, NotificationTemplate } from './types';

export type ShipmentNotificationContext = {
  trackingNumber: string;
  recipientName?: string | null;
  customerFirstName?: string | null;
  originCity: string;
  destinationCity: string;
  weightKg?: number | null;
  pieceCount?: number | null;
  priceTotalCents?: number | null;
  sealNumber?: string | null;
  extra?: string | null;
};

export type BulkyNotificationContext = {
  reference: string;
  contactFirstName?: string | null;
  itemType: string;
  quotedPriceCents?: number | null;
  quoteNote?: string | null;
  offerUrl?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function euro(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}

function trackingUrl(trackingNumber: string): string {
  return `${appUrl()}/tracking/${encodeURIComponent(trackingNumber)}`;
}

/**
 * A deliberately plain, table-free HTML shell. It renders identically in
 * Gmail, Apple Mail and Outlook, and degrades to the text part everywhere else.
 */
function wrap(title: string, bodyLines: string[], cta?: { label: string; url: string }): string {
  const paragraphs = bodyLines
    .map((line) => `<p style="margin:0 0 16px;line-height:1.6;">${line}</p>`)
    .join('');

  const button = cta
    ? `<p style="margin:28px 0 0;">
         <a href="${escapeHtml(cta.url)}"
            style="display:inline-block;background:#0a5341;color:#ffffff;text-decoration:none;
                   padding:14px 24px;border-radius:12px;font-weight:600;">
           ${escapeHtml(cta.label)}
         </a>
       </p>`
    : '';

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px;background:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;padding:32px;">
    <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#0a5341;font-weight:700;margin-bottom:8px;">
      ${escapeHtml(brand.name)}
    </div>
    <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
    ${paragraphs}
    ${button}
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0 16px;">
    <p style="margin:0;font-size:12px;color:#78716c;line-height:1.6;">
      ${escapeHtml(brand.name)} · ${escapeHtml(brand.address.street)}, ${escapeHtml(brand.address.zip)} ${escapeHtml(brand.address.city)}<br>
      ${escapeHtml(brand.email)} · ${escapeHtml(brand.phone)}
    </p>
  </div>
</body></html>`;
}

function greeting(name?: string | null): string {
  return name ? `Hallo ${name},` : 'Hallo,';
}

/**
 * Builds subject + text + html for a shipment event.
 * The tracking number is the only identifier in the message — no addresses.
 */
export function buildShipmentEmail(
  template: NotificationTemplate,
  to: string,
  ctx: ShipmentNotificationContext,
): EmailMessage {
  const route = `${cityName(ctx.originCity)} → ${cityName(ctx.destinationCity)}`;
  const url = trackingUrl(ctx.trackingNumber);
  const hello = greeting(ctx.customerFirstName);

  const copy: Record<string, { subject: string; lines: string[] }> = {
    booking_confirmation: {
      subject: `Sendung ${ctx.trackingNumber} wurde gebucht`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> wurde gebucht.`,
        `<strong>Route:</strong> ${escapeHtml(route)}<br>` +
          (ctx.weightKg ? `<strong>Gewicht:</strong> ${ctx.weightKg} kg<br>` : '') +
          (ctx.pieceCount ? `<strong>Gepäckstücke:</strong> ${ctx.pieceCount}<br>` : '') +
          (ctx.priceTotalCents != null
            ? `<strong>Preis:</strong> ${euro(ctx.priceTotalCents)}`
            : ''),
        'Bitte notiere dir deine Sendungsnummer — damit kannst du jederzeit den Status abfragen.',
      ],
    },
    pickup_scheduled: {
      subject: `Abholung für ${ctx.trackingNumber} ist geplant`,
      lines: [
        hello,
        `die Abholung deiner Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> ist eingeplant.`,
        ctx.extra ? escapeHtml(ctx.extra) : 'Wir melden uns kurz vorher bei dir.',
      ],
    },
    picked_up: {
      subject: `Sendung ${ctx.trackingNumber} wurde abgeholt`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> wurde abgeholt.`,
        ctx.sealNumber
          ? `Sie ist mit der Sicherheitsnummer <strong>${escapeHtml(ctx.sealNumber)}</strong> versiegelt.`
          : 'Sie ist jetzt auf dem Weg in unser Depot.',
      ],
    },
    departed: {
      subject: `Sendung ${ctx.trackingNumber} ist unterwegs nach Marokko`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> hat Deutschland verlassen und ist unterwegs nach Marokko.`,
        `<strong>Route:</strong> ${escapeHtml(route)}`,
      ],
    },
    arrived_morocco: {
      subject: `Sendung ${ctx.trackingNumber} ist in Marokko angekommen`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> ist in Marokko angekommen.`,
        'Wir bereiten jetzt die Zustellung vor.',
      ],
    },
    out_for_delivery: {
      subject: `Sendung ${ctx.trackingNumber} ist in Zustellung`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> ist in Zustellung.`,
        'Bitte stelle sicher, dass der Empfänger telefonisch erreichbar ist.',
      ],
    },
    delivered: {
      subject: `Sendung ${ctx.trackingNumber} wurde zugestellt`,
      lines: [
        hello,
        `deine Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> wurde zugestellt.`,
        'Vielen Dank für dein Vertrauen!',
      ],
    },
    exception: {
      subject: `Rückfrage zu Sendung ${ctx.trackingNumber}`,
      lines: [
        hello,
        `zu deiner Sendung <strong>${escapeHtml(ctx.trackingNumber)}</strong> gibt es eine Rückfrage.`,
        ctx.extra ? escapeHtml(ctx.extra) : 'Wir melden uns telefonisch bei dir.',
      ],
    },
  };

  const entry = copy[template] ?? copy.booking_confirmation;

  const text = [
    entry.subject,
    '',
    ...entry.lines.map((line) => line.replace(/<[^>]+>/g, '')),
    '',
    `Sendung verfolgen: ${url}`,
    '',
    `${brand.name} · ${brand.email}`,
  ].join('\n');

  return {
    to,
    subject: entry.subject,
    text,
    html: wrap(entry.subject, entry.lines, { label: 'Sendung verfolgen', url }),
    replyTo: brand.email,
  };
}

export function buildBulkyEmail(
  template: 'bulky_received' | 'bulky_quote',
  to: string,
  ctx: BulkyNotificationContext,
): EmailMessage {
  const hello = greeting(ctx.contactFirstName);

  if (template === 'bulky_received') {
    const subject = `Deine Sperrgut-Anfrage ${ctx.reference}`;
    const lines = [
      hello,
      `wir haben deine Anfrage für <strong>${escapeHtml(ctx.itemType)}</strong> erhalten (Referenz ${escapeHtml(ctx.reference)}).`,
      'Wir prüfen sie und melden uns in der Regel innerhalb von 24 Stunden mit einem Festpreis.',
    ];
    return {
      to,
      subject,
      text: [subject, '', ...lines.map((l) => l.replace(/<[^>]+>/g, '')), '', `${brand.name} · ${brand.email}`].join('\n'),
      html: wrap(subject, lines),
      replyTo: brand.email,
    };
  }

  const subject = `Dein Angebot für ${ctx.itemType} (${ctx.reference})`;
  const lines = [
    hello,
    `wir haben deine Sperrgut-Anfrage geprüft und können <strong>${escapeHtml(ctx.itemType)}</strong> für dich transportieren.`,
    ctx.quotedPriceCents != null
      ? `<strong>Dein Festpreis: ${euro(ctx.quotedPriceCents)}</strong>`
      : '',
    ctx.quoteNote ? escapeHtml(ctx.quoteNote) : '',
  ].filter(Boolean);

  return {
    to,
    subject,
    text: [
      subject,
      '',
      ...lines.map((l) => l.replace(/<[^>]+>/g, '')),
      '',
      ctx.offerUrl ? `Angebot ansehen: ${ctx.offerUrl}` : '',
      '',
      `${brand.name} · ${brand.email}`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: wrap(
      subject,
      lines,
      ctx.offerUrl ? { label: 'Angebot ansehen', url: ctx.offerUrl } : undefined,
    ),
    replyTo: brand.email,
  };
}

/** Compact one-liner used for WhatsApp messages and share links. */
export function buildShipmentWhatsAppText(
  template: NotificationTemplate,
  ctx: ShipmentNotificationContext,
): string {
  const url = trackingUrl(ctx.trackingNumber);
  const messages: Partial<Record<NotificationTemplate, string>> = {
    booking_confirmation: `Deine Sendung ${ctx.trackingNumber} wurde gebucht.`,
    pickup_scheduled: `Die Abholung deiner Sendung ${ctx.trackingNumber} ist geplant.`,
    picked_up: `Deine Sendung ${ctx.trackingNumber} wurde abgeholt.`,
    departed: `Deine Sendung ${ctx.trackingNumber} ist unterwegs nach Marokko.`,
    arrived_morocco: `Deine Sendung ${ctx.trackingNumber} ist in Marokko angekommen.`,
    out_for_delivery: `Deine Sendung ${ctx.trackingNumber} ist in Zustellung.`,
    delivered: `Deine Sendung ${ctx.trackingNumber} wurde zugestellt.`,
    exception: `Zu deiner Sendung ${ctx.trackingNumber} gibt es eine Rückfrage.`,
  };

  return `${brand.name}: ${messages[template] ?? ''} Status: ${url}`.trim();
}

// --- Betriebsbenachrichtigung ------------------------------------------------

export type OperatorBookingContext = {
  trackingNumber: string;
  shipmentType: 'standard' | 'documents';
  priceTotalCents: number;
  originCity: string;
  destinationCity: string;
  weightKg: number;
  pieceCount: number;
  contentType: string;
  /** Abholung beim Kunden statt Abgabe bei uns. */
  pickupRequested: boolean;
  pickupDate?: string | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  /** Nur bei Abholung gefüllt — sonst kommt der Kunde zu uns. */
  pickupAddress?: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientCity: string;
};

/** "2026-08-14" → "14.08.2026" */
function germanDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return year && month && day ? `${day}.${month}.${year}` : iso;
}

/**
 * Die Nachricht an den Betrieb, wenn eine Buchung eingeht.
 *
 * Bewusst eine andere Mail als die Kundenbestätigung: hier stehen genau die
 * Angaben, die für die Disposition zählen — vor allem, ob abgeholt werden muss
 * oder der Kunde vorbeikommt. Adressen und Telefonnummern dürfen hier stehen,
 * denn der Empfänger ist der Betrieb selbst, nicht die Öffentlichkeit.
 *
 * `whatsappUrl` öffnet den Chat mit dem Kunden mit einem Tippen. Das ist die
 * WhatsApp-Verknüpfung, die ohne Meta-Geschäftskonto funktioniert — eine
 * automatisch *gesendete* WhatsApp-Nachricht setzt die Cloud API mit
 * genehmigter Vorlage voraus.
 */
export function buildOperatorBookingEmail(
  to: string,
  ctx: OperatorBookingContext,
  whatsappUrl: string,
): EmailMessage {
  const art = ctx.shipmentType === 'documents' ? 'Dokumente' : 'Paket';
  const route = `${cityName(ctx.originCity)} → ${cityName(ctx.destinationCity)}`;

  const abholung = ctx.pickupRequested
    ? `Abholung beim Kunden${ctx.pickupDate ? ` am ${germanDate(ctx.pickupDate)}` : ''}`
    : 'Kunde bringt die Sendung vorbei';

  const subject = ctx.pickupRequested
    ? `Abholung: ${ctx.trackingNumber} (${art}, ${route})`
    : `Abgabe: ${ctx.trackingNumber} (${art}, ${route})`;

  // Die wichtigste Zeile zuerst — in der Benachrichtigung auf dem Handy ist
  // oft nur der Betreff und die erste Zeile zu sehen.
  const lines = [
    `<strong>${escapeHtml(abholung)}</strong>`,
    ctx.pickupRequested && ctx.pickupAddress
      ? `Adresse: ${escapeHtml(ctx.pickupAddress)}`
      : `Annahmestelle: ${escapeHtml(brand.address.street)}, ${escapeHtml(brand.address.zip)} ${escapeHtml(brand.address.city)}`,
    `Sendung: <strong>${escapeHtml(ctx.trackingNumber)}</strong> · ${escapeHtml(art)} · ${escapeHtml(route)}`,
    ctx.shipmentType === 'documents'
      ? `Inhalt: ${escapeHtml(ctx.contentType)}`
      : `Inhalt: ${escapeHtml(ctx.contentType)} · ${ctx.pieceCount} Stück · ${String(ctx.weightKg).replace('.', ',')} kg`,
    `Preis: <strong>${euro(ctx.priceTotalCents)}</strong>`,
    `Absender: ${escapeHtml(ctx.senderName)} · ${escapeHtml(ctx.senderPhone)} · ${escapeHtml(ctx.senderEmail)}`,
    `Empfänger: ${escapeHtml(ctx.recipientName)} · ${escapeHtml(ctx.recipientPhone)} · ${escapeHtml(cityName(ctx.recipientCity))}`,
  ];

  const text = [
    abholung,
    ctx.pickupRequested && ctx.pickupAddress
      ? `Adresse: ${ctx.pickupAddress}`
      : `Annahmestelle: ${brand.address.street}, ${brand.address.zip} ${brand.address.city}`,
    '',
    `Sendung: ${ctx.trackingNumber} (${art})`,
    `Route: ${route}`,
    ctx.shipmentType === 'documents'
      ? `Inhalt: ${ctx.contentType}`
      : `Inhalt: ${ctx.contentType}, ${ctx.pieceCount} Stück, ${String(ctx.weightKg).replace('.', ',')} kg`,
    `Preis: ${euro(ctx.priceTotalCents)}`,
    '',
    `Absender: ${ctx.senderName}, ${ctx.senderPhone}, ${ctx.senderEmail}`,
    `Empfänger: ${ctx.recipientName}, ${ctx.recipientPhone}, ${cityName(ctx.recipientCity)}`,
    '',
    `WhatsApp mit dem Kunden: ${whatsappUrl}`,
    `Im Dashboard: ${appUrl()}/admin/sendungen`,
  ].join('\n');

  return {
    to,
    subject,
    text,
    html: wrap(subject, lines, { label: 'WhatsApp mit dem Kunden öffnen', url: whatsappUrl }),
  };
}

/**
 * Was Meta als Vorlagen-Parameter durchlässt.
 *
 * Die Cloud API weist eine Nachricht ab, deren Parameter Zeilenumbrüche,
 * Tabulatoren oder mehr als vier aufeinanderfolgende Leerzeichen enthält
 * („Parameter text cannot have new-line/tab characters or more than 4
 * consecutive spaces"). Das ist keine Formatierungsfrage, sondern der
 * Unterschied zwischen zugestellt und abgelehnt — und es fällt sonst erst
 * beim ersten echten Versand auf, lange nach dem Einrichten.
 */
function whatsappParameter(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
}

/**
 * Dieselbe Meldung als WhatsApp-Text.
 *
 * Eine einzige Zeile, mit „·" getrennt: Meta erlaubt in einem
 * Vorlagen-Parameter keine Zeilenumbrüche (siehe `whatsappParameter`). Die
 * Reihenfolge bleibt trotzdem die des Betriebs — zuerst die Frage, ob
 * hingefahren werden muss, denn in der Benachrichtigung auf dem Sperrbildschirm
 * ist oft nur der Anfang zu lesen.
 */
export function buildOperatorBookingWhatsAppText(ctx: OperatorBookingContext): string {
  const art = ctx.shipmentType === 'documents' ? 'Dokumente' : 'Paket';
  const kopf = ctx.pickupRequested
    ? `ABHOLUNG${ctx.pickupDate ? ` am ${germanDate(ctx.pickupDate)}` : ''}`
    : 'ABGABE bei uns';

  return whatsappParameter(
    [
      `${kopf} — ${ctx.trackingNumber}`,
      ctx.pickupRequested && ctx.pickupAddress ? ctx.pickupAddress : null,
      `${art} · ${cityName(ctx.originCity)} → ${cityName(ctx.destinationCity)} · ${euro(ctx.priceTotalCents)}`,
      `${ctx.senderName} · ${ctx.senderPhone}`,
    ]
      .filter(Boolean)
      .join(' · '),
  );
}
