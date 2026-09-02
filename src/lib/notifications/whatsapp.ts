import 'server-only';
import type { SendResult } from './types';
import { siteConfig } from '@/config/site';

/**
 * Die Betriebsmeldung über WhatsApp.
 *
 * Zweck: Wenn jemand das Anfrageformular abschickt, soll die Anfrage ohne
 * weiteres Zutun auf dem Telefon des Betriebs landen. Der Weg über wa.me
 * verlangt, dass der Kunde am Ende auf „Senden" tippt — wer das nicht tut, ist
 * verloren. Dieser Weg hier braucht ihn nicht.
 *
 * Ruhend, bis WHATSAPP_PHONE_NUMBER_ID und WHATSAPP_ACCESS_TOKEN gesetzt sind.
 * Ohne sie meldet der Versand `skipped` und die Anfrage geht wie bisher nur per
 * E-Mail hinaus.
 *
 * ⚠ Die Nummer, die hier sendet, ist eine reine Servernummer. Sie lässt sich
 * nicht gleichzeitig in der WhatsApp-App auf dem Telefon benutzen. Gedacht ist
 * der Aufbau so: die bekannte Kundennummer (`siteConfig.whatsapp`) bleibt in
 * der WhatsApp Business App und empfängt diese Meldungen, eine zweite Nummer
 * liegt in der Cloud API und verschickt sie.
 */

/**
 * Die Version der Graph-API in der Adresse.
 *
 * Meta hält jede Version rund zwei Jahre am Leben und schaltet sie dann ab —
 * eine fest eingebaute Version ist also eine Zeitbombe mit langer Zündschnur.
 * Über die Umgebungsvariable lässt sie sich ohne Codeänderung hochziehen.
 *
 * Beim Aufruf gelesen, nicht beim Laden des Moduls: sonst verhielte sich diese
 * eine Einstellung anders als alle anderen hier, und das fällt genau dann auf,
 * wenn man es am wenigsten gebrauchen kann.
 */
function graphVersion(): string {
  return process.env.WHATSAPP_GRAPH_VERSION?.trim() || 'v26.0';
}

const DEFAULT_TEMPLATE = 'neue_anfrage';
const DEFAULT_LOCALE = 'de';

/**
 * Macht aus einer Telefonnummer die Ziffernfolge, die Meta erwartet:
 * international, ohne Plus, ohne führende Null.
 *
 * `0157…` wird zu `49157…`, `0049157…` zu `49157…`. Eine Nummer im falschen
 * Format wird nicht etwa abgelehnt, sondern stillschweigend nicht zugestellt —
 * deshalb wird sie hier begradigt statt geprüft.
 */
export function normaliseNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `49${digits.slice(1)}`;
  return digits;
}

/**
 * Bereitet einen Text als Platzhalter einer Nachrichtenvorlage auf.
 *
 * Meta lehnt Platzhalter ab, die einen Zeilenumbruch, einen Tabulator oder
 * mehr als vier Leerzeichen hintereinander enthalten — mit Fehler 132000 und
 * ohne Hinweis darauf, welcher Platzhalter schuld war. Die mehrzeilige
 * Zusammenfassung muss deshalb zu einer Zeile werden, bevor sie hier hineingeht.
 */
export function whatsappParameter(text: string): string {
  return text
    .replace(/[\r\n\t]+/g, ' · ')
    .replace(/ {2,}/g, ' ')
    .replace(/(?: · )+/g, ' · ')
    .replace(/^ · | · $/g, '')
    .trim();
}

/** Wohin die Meldung geht. Leer = die Nummer aus der Konfiguration. */
export function operatorNumber(): string {
  return normaliseNumber(process.env.OPERATOR_WHATSAPP?.trim() || siteConfig.whatsapp);
}

/**
 * Benennt, was an der Einrichtung fehlt oder nicht stimmt.
 *
 * Gibt nie einen Schlüssel oder Teile davon aus — nur den Namen der Variablen
 * und was an ihr falsch ist. Der Health-Endpunkt ist öffentlich.
 */
export function whatsappConfigProblems(): string[] {
  const problems: string[] = [];
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneNumberId) {
    problems.push('WHATSAPP_PHONE_NUMBER_ID fehlt');
  } else if (!/^\d{10,}$/.test(phoneNumberId)) {
    // Der häufigste Fehler: hier steht die Telefonnummer statt der ID. Beides
    // sind Ziffern, aber die ID ist deutlich länger und beginnt nicht mit 49.
    problems.push(
      'WHATSAPP_PHONE_NUMBER_ID sieht nicht nach einer Phone Number ID aus ' +
        '(erwartet werden mindestens 10 Ziffern aus dem API-Setup, nicht die Telefonnummer)',
    );
  }

  if (!accessToken) {
    problems.push('WHATSAPP_ACCESS_TOKEN fehlt');
  } else if (accessToken.length < 40) {
    problems.push('WHATSAPP_ACCESS_TOKEN ist auffällig kurz — vollständig kopiert?');
  }

  if (!operatorNumber()) {
    problems.push('OPERATOR_WHATSAPP enthält keine Ziffern');
  }

  return problems;
}

export function isWhatsAppConfigured(): boolean {
  return whatsappConfigProblems().length === 0;
}

/**
 * Schickt die Meldung über die Meta Cloud API.
 *
 * Als Vorlage, nicht als freier Text: eine Nachricht, die der Betrieb beginnt,
 * verlangt außerhalb eines laufenden Chatfensters eine von Meta genehmigte
 * Vorlage. Die Vorlage besteht aus einem Textkörper mit genau einem
 * Platzhalter `{{1}}`, in den die Zusammenfassung wandert.
 */
export async function sendWhatsAppNotification(summary: string): Promise<SendResult> {
  const provider = 'meta-cloud-api';

  if (!isWhatsAppConfigured()) {
    return { ok: true, provider, skipped: true, error: whatsappConfigProblems().join('; ') };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!.trim();
  const template = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || DEFAULT_TEMPLATE;
  const locale = process.env.WHATSAPP_TEMPLATE_LOCALE?.trim() || DEFAULT_LOCALE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion()}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: operatorNumber(),
          type: 'template',
          template: {
            name: template,
            language: { code: locale },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: whatsappParameter(summary) }],
              },
            ],
          },
        }),
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string; code?: number };
    };

    if (!response.ok) {
      const code = payload.error?.code;
      return {
        ok: false,
        provider,
        error: [payload.error?.message || `HTTP ${response.status}`, code && `(Code ${code})`]
          .filter(Boolean)
          .join(' '),
      };
    }

    return { ok: true, provider, messageId: payload.messages?.[0]?.id };
  } catch (error) {
    return {
      ok: false,
      provider,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    };
  }
}
