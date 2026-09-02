import { z } from 'zod';
import { content, type Locale } from '@/content';

/**
 * Die Anfrage für eine Fahrzeugüberführung.
 *
 * Bewusst wenige Pflichtfelder: Abholort, Zielort, Name und eine
 * Kontaktmöglichkeit. Alles andere lässt sich am Telefon klären, und jedes
 * zusätzliche Pflichtfeld kostet Anfragen — gerade auf dem Handy.
 *
 * Wie überall im Projekt gilt: das Schema muss seine eigene Ausgabe wieder
 * annehmen. Das Formular prüft im Browser, die Server-Action prüft die bereits
 * geparste Ausgabe ein zweites Mal.
 */

export const VEHICLE_TYPES = [
  'PKW',
  'SUV',
  'Sportwagen',
  'Luxusfahrzeug',
  'Transporter bis 3,5 t',
] as const;

export const VEHICLE_STATES = [
  'zugelassen',
  'Kurzzeitkennzeichen vorhanden',
  'rote Kennzeichen vorhanden',
  'sonstiges / Rückfrage erforderlich',
] as const;

/**
 * Das Schema in der Sprache des Absenders.
 *
 * Die Werte selbst bleiben deutsch — sie sind die Kennungen, die über die
 * Leitung gehen, und die dürfen sich nicht mit der Anzeigesprache ändern.
 * Übersetzt wird nur, was der Mensch liest: die Fehlermeldungen.
 */
export function transferRequestSchema(locale: Locale) {
  const t = content(locale).errors;
  const tooLong = (max: number) => t.tooLong.replace('{max}', String(max));

  const optionalText = (max: number) =>
    z
      .string()
      .trim()
      .max(max, tooLong(max))
      .nullish()
      .transform((v) => v || null);

  const requiredText = (min: number, max: number) =>
    z.string().trim().min(min, t.required).max(max, tooLong(max));

  return z
    .object({
      pickupLocation: requiredText(2, 120),
      dropoffLocation: requiredText(2, 120),

      vehicleMake: optionalText(60),
      vehicleModel: optionalText(60),
      vehicleType: z.enum(VEHICLE_TYPES).default('PKW'),
      vehicleState: z.enum(VEHICLE_STATES).default('zugelassen'),
      vehicleValue: optionalText(40),

      preferredDate: z
        .union([
          z
            .string()
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, t.invalidDate),
          z.literal(''),
        ])
        .nullish()
        .transform((v) => v || null),
      dateFlexible: z.boolean().default(false),

      notes: optionalText(2000),

      name: requiredText(2, 100),
      phone: optionalText(40),
      email: z
        .union([z.string().trim().toLowerCase().email(t.invalidEmail), z.literal('')])
        .nullish()
        .transform((v) => v || null),

      privacyAccepted: z.literal(true, {
        errorMap: () => ({ message: t.needPrivacy }),
      }),

      /**
       * Honigtopf. Ein Feld, das für Menschen unsichtbar ist und das
       * automatische Formularausfüller trotzdem befüllen — ohne Dienst eines
       * Dritten und ohne eine Aufgabe, die echte Kundschaft lösen muss.
       *
       * Das Schema lehnt einen ausgefüllten Honigtopf bewusst *nicht* ab. Zwei
       * Gründe: eine Fehlermeldung würde einem Absender verraten, dass das Feld
       * geprüft wird, und — wichtiger — auch der Passwortmanager eines echten
       * Kunden füllt gelegentlich ein Feld namens „Firma“ aus. Der bekäme dann
       * eine Fehlermeldung zu einem Feld, das er nicht sehen kann. Die Anfrage
       * wird stattdessen in der Server-Action still verworfen.
       */
      company: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v ?? '').slice(0, 200)),
    })
    .refine((v) => !!v.phone || !!v.email, {
      message: t.needContact,
      path: ['phone'],
    });
}

export type TransferRequestInput = z.infer<ReturnType<typeof transferRequestSchema>>;

/**
 * Die Anfrage als lesbarer Text.
 *
 * Eine Quelle für beide Wege: die E-Mail an den Betrieb und die
 * WhatsApp-Nachricht, die der Kunde mit einem Tippen abschickt. Zwei getrennte
 * Textbausteine würden mit Sicherheit auseinanderlaufen — und dann steht in der
 * einen Meldung etwas anderes als in der anderen.
 *
 * Die Felder sind alle einzeln optional, weil dieselbe Funktion auch ein noch
 * halb ausgefülltes Formular abbilden muss: der WhatsApp-Knopf soll schon
 * funktionieren, wenn nur Abhol- und Zielort stehen.
 *
 * Geschrieben wird in der Sprache des Absenders, nicht in der des Betriebs.
 * Der Kunde sieht die WhatsApp-Nachricht, bevor er sie abschickt — eine
 * deutsche Nachricht aus einem englischen Formular sähe aus, als hätte die
 * Seite etwas anderes verschickt als angezeigt. Für den Betrieb ist die
 * englische Fassung ohnehin lesbar und sagt nebenbei, in welcher Sprache
 * geantwortet werden will.
 */
export type RequestMessageInput = {
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleType?: string | null;
  vehicleState?: string | null;
  vehicleValue?: string | null;
  preferredDate?: string | null;
  dateFlexible?: boolean;
  notes?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

/** „2026-10-01“ → „01.10.2026“. Alles andere bleibt, wie es ist. */
export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value.trim() || null;
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

function line(label: string, value: string | null | undefined): string | null {
  const text = value?.toString().trim();
  return text ? `${label}: ${text}` : null;
}

/** Der Anzeigename eines Auswahlwerts; unbekannte Werte bleiben, wie sie sind. */
function label(table: Record<string, string>, value: string | null | undefined): string | null {
  const key = value?.trim();
  if (!key) return null;
  return table[key] ?? key;
}

/**
 * Die Anfrage in einer Zeile.
 *
 * Für den Platzhalter einer WhatsApp-Nachrichtenvorlage: Meta lehnt
 * Platzhalter mit Zeilenumbrüchen ab, und in einer Benachrichtigung auf dem
 * Sperrbildschirm zählt ohnehin nur, was in die ersten zwei Zeilen passt.
 * Deshalb die Reihenfolge — Strecke, Fahrzeug, Termin, Kontakt: die Frage
 * „hinfahren oder nicht" steht vorne.
 */
export function buildRequestLine(data: RequestMessageInput, locale: Locale): string {
  const t = content(locale);

  const vehicle = [data.vehicleMake, data.vehicleModel]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  const route = [data.pickupLocation?.trim(), data.dropoffLocation?.trim()]
    .filter(Boolean)
    .join(' → ');

  const date = formatDate(data.preferredDate);

  return [
    route || null,
    vehicle || label(t.vehicleTypes, data.vehicleType),
    date && (data.dateFlexible ? `${date} (${t.notification.dateFlexibleShort})` : date),
    data.name?.trim() || null,
    data.phone?.trim() || data.email?.trim() || null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function buildRequestMessage(
  data: RequestMessageInput,
  locale: Locale,
  /**
   * Obergrenze für die Gesamtlänge. Nur der WhatsApp-Weg braucht sie: die
   * Nachricht steckt dort in einer Adresse, und sehr lange Adressen werden von
   * manchen Browsern abgeschnitten. Gekürzt wird ausschließlich das Freitextfeld
   * — die Eckdaten bleiben in jedem Fall vollständig.
   */
  options: { maxLength?: number } = {},
): string {
  const t = content(locale).notification;
  const { vehicleTypes, vehicleStates } = content(locale);

  const vehicle = [data.vehicleMake, data.vehicleModel]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  const build = (notes: string | null | undefined) =>
    [
      t.heading,
      '',
      line(t.pickup, data.pickupLocation),
      line(t.dropoff, data.dropoffLocation),
      '',
      line(t.vehicle, vehicle || null),
      line(t.vehicleType, label(vehicleTypes, data.vehicleType)),
      line(t.vehicleState, label(vehicleStates, data.vehicleState)),
      line(t.vehicleValue, data.vehicleValue),
      '',
      line(t.preferredDate, formatDate(data.preferredDate)),
      data.dateFlexible ? t.dateFlexible : null,
      '',
      line(t.notes, notes),
      '',
      line(t.name, data.name),
      line(t.phone, data.phone),
      line(t.email, data.email),
    ]
      .filter((entry) => entry !== null)
      // Zwei Leerzeilen hintereinander entstehen, wenn ein ganzer Block leer
      // bleibt. Sie zu einer zusammenzuziehen ist der Unterschied zwischen
      // einer Nachricht, die man überfliegt, und einer, die man scrollt.
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n+$/, '');

  const full = build(data.notes);
  const max = options.maxLength;
  if (!max || full.length <= max) return full;

  // Der Text ohne Bemerkungen ist die Untergrenze. Passt der schon nicht, hilft
  // Kürzen nicht weiter — die Eckdaten sind wichtiger als die Obergrenze, und
  // eine Anfrage ohne Zielort wäre wertlos.
  const withoutNotes = build(null);
  const notes = data.notes?.trim();
  if (!notes) return withoutNotes;

  // Schrittweise kürzen statt zu rechnen: wie lang der fertige Text wird, hängt
  // davon ab, welche Blöcke leer bleiben und wieviel die Leerzeilenbereinigung
  // wegnimmt. Ausprobieren trifft es genau, Rechnen nur ungefähr.
  let room = max - withoutNotes.length;
  while (room >= 24) {
    const candidate = build(`${notes.slice(0, room)} […]`);
    if (candidate.length <= max) return candidate;
    room -= Math.max(1, candidate.length - max);
  }

  return withoutNotes;
}
