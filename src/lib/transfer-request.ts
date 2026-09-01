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
