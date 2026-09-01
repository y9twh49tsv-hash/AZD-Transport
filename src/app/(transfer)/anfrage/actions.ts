'use server';

import { unstable_rethrow } from 'next/navigation';
import { getEmailAdapter } from '@/lib/notifications/email';
import { siteConfig } from '@/config/site';
import { transferRequestSchema } from '@/lib/transfer-request';

export type RequestResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function line(label: string, value: string | null | undefined): string | null {
  return value ? `${label}: ${value}` : null;
}

/**
 * Nimmt eine Überführungsanfrage entgegen und schickt sie an den Betrieb.
 *
 * Bewusst ohne Datenbank. Eine Anfrage ist eine Nachricht, kein Auftrag — sie
 * enthält Name, Telefonnummer und Adressdaten, und die dauerhaft zu speichern,
 * bevor überhaupt ein Vertrag zustande kommt, wäre mehr Datenhaltung als
 * nötig. Kommt später eine Auftragsverwaltung, wird hier zusätzlich
 * gespeichert; die Struktur steht dem nicht im Weg.
 */
export async function submitTransferRequest(input: unknown): Promise<RequestResult> {
  const parsed = transferRequestSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: 'Bitte prüfen Sie Ihre Angaben.', fieldErrors };
  }

  const data = parsed.data;

  // Der Honigtopf ist ausgefüllt: ein automatischer Absender. Die Anfrage wird
  // verworfen, aber als Erfolg quittiert — wer es merkt, versucht es erneut.
  if (data.company) return { ok: true };

  const vehicle = [data.vehicleMake, data.vehicleModel].filter(Boolean).join(' ');

  const body = [
    `Abholort: ${data.pickupLocation}`,
    `Zielort: ${data.dropoffLocation}`,
    '',
    line('Fahrzeug', vehicle || null),
    `Fahrzeugtyp: ${data.vehicleType}`,
    `Zulassung: ${data.vehicleState}`,
    line('Fahrzeugwert', data.vehicleValue),
    '',
    line('Wunschtermin', data.preferredDate),
    `Termin flexibel: ${data.dateFlexible ? 'ja' : 'nein'}`,
    '',
    line('Bemerkungen', data.notes),
    '',
    `Name: ${data.name}`,
    line('Telefon', data.phone),
    line('E-Mail', data.email),
  ]
    .filter((entry) => entry !== null)
    .join('\n');

  const subject = `Überführungsanfrage: ${data.pickupLocation} → ${data.dropoffLocation}`;

  // Schlichtes HTML aus demselben Text — kein zweiter Satz, der auseinander
  // laufen kann. Der Textteil bleibt maßgeblich.
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917">${body
    .split('\n')
    .map((entry) =>
      entry
        ? `<p style="margin:0 0 6px">${entry.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`
        : '<div style="height:12px"></div>',
    )
    .join('')}</div>`;

  try {
    const result = await getEmailAdapter().send({
      to: siteConfig.requestInbox,
      subject,
      text: body,
      html,
      // Antworten gehen direkt an die Kundschaft, nicht an den Versanddienst.
      replyTo: data.email ?? undefined,
    });

    if (!result.ok && !result.skipped) {
      console.error('[anfrage] Versand fehlgeschlagen:', result.error);
      return {
        ok: false,
        error:
          'Die Anfrage konnte gerade nicht übermittelt werden. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
      };
    }

    // Kein konfigurierter Versanddienst: die Anfrage landet nur im
    // Serverprotokoll. Das als Erfolg zu quittieren wäre eine Lüge gegenüber
    // jemandem, der auf eine Antwort wartet.
    if (result.skipped) {
      console.warn('[anfrage] Kein E-Mail-Versand konfiguriert — Anfrage nur im Protokoll:', subject);
      return {
        ok: false,
        error:
          'Der Nachrichtenversand ist derzeit nicht verfügbar. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
      };
    }

    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error('[anfrage] Unerwarteter Fehler:', error);
    return {
      ok: false,
      error:
        'Es ist ein Fehler aufgetreten. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
    };
  }
}
