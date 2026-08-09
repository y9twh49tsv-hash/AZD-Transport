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
