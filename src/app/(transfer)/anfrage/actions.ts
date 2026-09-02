'use server';

import { unstable_rethrow } from 'next/navigation';
import { getEmailAdapter } from '@/lib/notifications/email';
import { siteConfig } from '@/config/site';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import type { SendResult } from '@/lib/notifications/types';
import {
  buildRequestLine,
  buildRequestMessage,
  transferRequestSchema,
} from '@/lib/transfer-request';

export type RequestResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

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

  // Derselbe Text, den auch die WhatsApp-Nachricht trägt — aus einer Funktion,
  // damit die beiden Wege nicht auseinanderlaufen können.
  const body = buildRequestMessage(data);

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
    /*
      Beide Wege gleichzeitig, nicht nacheinander: der Kunde wartet auf die
      Antwort, und zwei Netzabrufe hintereinander verdoppeln die Wartezeit
      ohne Gewinn. `allSettled`, damit ein Fehler auf einem Weg den anderen
      nicht mitreißt.
    */
    const [email, whatsapp] = await Promise.allSettled([
      getEmailAdapter().send({
        to: siteConfig.requestInbox,
        subject,
        text: body,
        html,
        // Antworten gehen direkt an die Kundschaft, nicht an den Versanddienst.
        replyTo: data.email ?? undefined,
      }),
      sendWhatsAppNotification(buildRequestLine(data)),
    ]);

    const delivered = (channel: PromiseSettledResult<SendResult>, name: string): boolean => {
      if (channel.status === 'rejected') {
        console.error(`[anfrage] ${name} hat geworfen:`, channel.reason);
        return false;
      }
      if (channel.value.skipped) {
        console.warn(`[anfrage] ${name} nicht eingerichtet:`, channel.value.error);
        return false;
      }
      if (!channel.value.ok) {
        console.error(`[anfrage] ${name} fehlgeschlagen:`, channel.value.error);
        return false;
      }
      return true;
    };

    const emailDelivered = delivered(email, 'E-Mail');
    const whatsappDelivered = delivered(whatsapp, 'WhatsApp');

    /*
      Ein Weg genügt. Bewusst nicht beide verlangen: solange die Anfrage
      irgendwo ankommt, wo sie gelesen wird, ist sie zugestellt — und dem
      Kunden einen Fehler zu zeigen, weil einer von zwei Kanälen klemmt, würde
      genau die Anfrage kosten, die schon da ist.

      Kommt sie nirgends an, wird das auch so gesagt. Einen Erfolg zu
      quittieren, den es nicht gibt, ist die eine Stelle, an der jemand auf
      eine Antwort wartet, die nie kommt.
    */
    if (!emailDelivered && !whatsappDelivered) {
      return {
        ok: false,
        error:
          'Die Anfrage konnte gerade nicht übermittelt werden. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
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
