import { z } from 'zod';

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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Bitte kürzer fassen (höchstens ${max} Zeichen).`)
    .nullish()
    .transform((v) => v || null);

const requiredText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, 'Bitte ausfüllen.')
    .max(max, `Bitte kürzer fassen (höchstens ${max} Zeichen).`);

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

export const transferRequestSchema = z
  .object({
    pickupLocation: requiredText(2, 120),
    dropoffLocation: requiredText(2, 120),

    vehicleMake: optionalText(60),
    vehicleModel: optionalText(60),
    vehicleType: z.enum(VEHICLE_TYPES).default('PKW'),
    vehicleState: z.enum(VEHICLE_STATES).default('zugelassen'),
    vehicleValue: optionalText(40),

    preferredDate: z
      .union([z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte ein gültiges Datum wählen.'), z.literal('')])
      .nullish()
      .transform((v) => v || null),
    dateFlexible: z.boolean().default(false),

    notes: optionalText(2000),

    name: requiredText(2, 100),
    phone: optionalText(40),
    email: z
      .union([z.string().trim().toLowerCase().email('Bitte eine gültige E-Mail-Adresse angeben.'), z.literal('')])
      .nullish()
      .transform((v) => v || null),

    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Bitte bestätigen Sie die Datenschutzhinweise.' }),
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
    message: 'Bitte Telefon oder E-Mail angeben, damit wir antworten können.',
    path: ['phone'],
  });

export type TransferRequestInput = z.infer<typeof transferRequestSchema>;

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

/**
 * Die Anfrage in einer Zeile.
 *
 * Für den Platzhalter einer WhatsApp-Nachrichtenvorlage: Meta lehnt
 * Platzhalter mit Zeilenumbrüchen ab, und in einer Benachrichtigung auf dem
 * Sperrbildschirm zählt ohnehin nur, was in die ersten zwei Zeilen passt.
 * Deshalb die Reihenfolge — Strecke, Fahrzeug, Termin, Kontakt: die Frage
 * „hinfahren oder nicht" steht vorne.
 */
export function buildRequestLine(data: RequestMessageInput): string {
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
    vehicle || data.vehicleType || null,
    date && (data.dateFlexible ? `${date} (flexibel)` : date),
    data.name?.trim() || null,
    data.phone?.trim() || data.email?.trim() || null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function buildRequestMessage(
  data: RequestMessageInput,
  /**
   * Obergrenze für die Gesamtlänge. Nur der WhatsApp-Weg braucht sie: die
   * Nachricht steckt dort in einer Adresse, und sehr lange Adressen werden von
   * manchen Browsern abgeschnitten. Gekürzt wird ausschließlich das Freitextfeld
   * — die Eckdaten bleiben in jedem Fall vollständig.
   */
  options: { maxLength?: number } = {},
): string {
  const vehicle = [data.vehicleMake, data.vehicleModel]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  const build = (notes: string | null | undefined) =>
    [
      'Anfrage Fahrzeugüberführung',
      '',
      line('Abholort', data.pickupLocation),
      line('Zielort', data.dropoffLocation),
      '',
      line('Fahrzeug', vehicle || null),
      line('Fahrzeugtyp', data.vehicleType),
      line('Zulassung', data.vehicleState),
      line('Fahrzeugwert', data.vehicleValue),
      '',
      line('Wunschtermin', formatDate(data.preferredDate)),
      data.dateFlexible ? 'Termin flexibel: ja' : null,
      '',
      line('Bemerkungen', notes),
      '',
      line('Name', data.name),
      line('Telefon', data.phone),
      line('E-Mail', data.email),
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
