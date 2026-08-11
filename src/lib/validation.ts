import { z } from 'zod';
import { pricingConfig } from '@/config/pricing';
import { exampleTrackingNumber } from '@/config/brand';
import { cities, COUNTRIES } from '@/config/regions';
import {
  BULKY_STATUSES,
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES,
  TRIP_STATUSES,
  USER_ROLES,
  VEHICLE_STATUSES,
} from '@/lib/shipment-status';

/**
 * Every piece of data that reaches the database passes through one of these
 * schemas first. They run on the server even when the same schema already
 * validated the form in the browser.
 */

const citySlugs = cities.map((c) => c.slug) as [string, ...string[]];

export const countrySchema = z.enum(COUNTRIES);
export const citySchema = z.enum(citySlugs, {
  errorMap: () => ({ message: 'Bitte wähle eine Stadt aus der Liste.' }),
});

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} ist erforderlich.`)
    .max(max, `${label} ist zu lang (max. ${max} Zeichen).`);

/**
 * Optional free text that ends up as `text NULL` in the database.
 *
 * Accepts a string, an empty string, `null` and `undefined`, and always yields
 * `string | null`. That the null side is accepted matters more than it looks:
 * these schemas validate the same data twice — once in the browser through
 * react-hook-form, once again in the server action, because a server must never
 * trust what the browser sends. The browser hands on the *parsed* result, so
 * the second pass sees the `null` the first pass produced. A schema that only
 * accepted `string | undefined` would reject its own output with
 * "Expected string, received null" — and the form would be impossible to
 * submit while every field on screen looks perfectly filled in.
 *
 * The rule to keep: every schema here must accept what it returns.
 * `validation.test.ts` asserts exactly that for all of them.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Bitte kürzer fassen (max. ${max} Zeichen).`)
    .nullish()
    .transform((v) => v || null);

/** Optional selection of something identified by a uuid. */
const optionalUuid = () =>
  z
    .union([z.string().uuid('Ungültige Auswahl.'), z.literal('')])
    .nullish()
    .transform((v) => (v ? v : null));

/** Optional ISO date (`2026-08-10`) coming from an `<input type="date">`. */
const optionalIsoDate = (message = 'Bitte ein gültiges Datum wählen.') =>
  z
    .union([z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, message), z.literal('')])
    .nullish()
    .transform((v) => (v ? v : null));

/** Optional time of day (`08:30`) from an `<input type="time">`. */
const optionalTime = () =>
  z
    .union([z.string().trim().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'), z.literal('')])
    .nullish()
    .transform((v) => (v ? v : null));

/**
 * Optional number.
 *
 * The empty string and null are treated as "not given" rather than handed to
 * `z.coerce.number()`, which would turn both into 0. For a price field that
 * distinction is the difference between "leave the price alone" and "this
 * shipment is free".
 */
const optionalNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

/**
 * Phone numbers arrive in many shapes (+49 176…, 0176…, 00212…). We keep the
 * original formatting but require a plausible amount of digits.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Bitte gib eine Telefonnummer an.')
  .max(32, 'Telefonnummer ist zu lang.')
  .refine((v) => (v.match(/\d/g) ?? []).length >= 6, 'Die Telefonnummer wirkt unvollständig.')
  .refine((v) => /^[+()\-.\s\d/]+$/.test(v), 'Die Telefonnummer enthält ungültige Zeichen.');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Bitte gib eine gültige E-Mail-Adresse an.')
  .max(254);

export const optionalEmailSchema = z
  .union([emailSchema, z.literal('')])
  .nullish()
  .transform((v) => (v ? v : null));

/**
 * Gewicht in Kilogramm.
 *
 * Die Untergrenze ist die absolute — die eines Briefumschlags. Das
 * Mindestgewicht für Pakete ist höher und wird dort geprüft, wo die
 * Sendungsart bekannt ist (siehe `requiresParcelWeight`). Stünde die
 * Paketgrenze schon hier, ließe sich der Dokumentenversand nicht buchen: ein
 * Umschlag mit Pass und zwei Urkunden wiegt rund 50 Gramm.
 */
export const weightSchema = z.coerce
  .number({ invalid_type_error: 'Bitte gib ein Gewicht in kg an.' })
  .positive('Das Gewicht muss größer als 0 sein.')
  .min(pricingConfig.minDocumentsWeightKg, `Mindestens ${pricingConfig.minDocumentsWeightKg} kg.`)
  .max(
    pricingConfig.maxStandardWeightKg,
    `Über ${pricingConfig.maxStandardWeightKg} kg bitte als Sperrgut anfragen.`,
  );

/** Alles außer Dokumenten muss das Paket-Mindestgewicht erreichen. */
const requiresParcelWeight = (v: { shipmentType?: string; weightKg: number }) =>
  v.shipmentType === 'documents' || v.weightKg >= pricingConfig.minWeightKg;

const parcelWeightMessage = {
  message: `Mindestens ${pricingConfig.minWeightKg} kg. Leichter? Dann ist es vermutlich eine Dokumentensendung.`,
  path: ['weightKg'],
};

export const pieceCountSchema = z.coerce
  .number({ invalid_type_error: 'Bitte gib die Anzahl der Gepäckstücke an.' })
  .int('Bitte eine ganze Zahl angeben.')
  .min(1, 'Mindestens 1 Gepäckstück.')
  .max(200, 'Bitte kontaktiere uns für mehr als 200 Gepäckstücke.');

// --- Price calculator -------------------------------------------------------

export const quoteSchema = z
  .object({
    originCountry: countrySchema,
    originCity: citySchema,
    destinationCountry: countrySchema,
    destinationCity: citySchema,
    weightKg: weightSchema,
    pickupRequested: z.boolean().default(false),
    shipmentType: z.enum(['standard', 'documents', 'bulky']).default('standard'),
  })
  .refine((v) => v.originCountry !== v.destinationCountry, {
    message: 'Wir transportieren zwischen Deutschland und Marokko — bitte wähle zwei Länder.',
    path: ['destinationCountry'],
  })
  .refine((v) => cities.find((c) => c.slug === v.originCity)?.country === v.originCountry, {
    message: 'Die Abholstadt passt nicht zum gewählten Land.',
    path: ['originCity'],
  })
  .refine(
    (v) => cities.find((c) => c.slug === v.destinationCity)?.country === v.destinationCountry,
    { message: 'Die Zielstadt passt nicht zum gewählten Land.', path: ['destinationCity'] },
  )
  .refine(requiresParcelWeight, parcelWeightMessage);

export type QuoteInput = z.infer<typeof quoteSchema>;

// --- Booking ----------------------------------------------------------------

export const bookingSchema = z
  .object({
    // Route & goods
    originCountry: countrySchema,
    originCity: citySchema,
    destinationCountry: countrySchema,
    destinationCity: citySchema,
    /**
     * Sperrgut wird hier nicht angenommen: dafür gibt es /sperrgut mit Fotos,
     * Maßen und einem Angebot durch das Büro. Wer hier bucht, bekommt sofort
     * einen verbindlichen Preis — das geht nur für Paket und Dokumente.
     */
    shipmentType: z.enum(['standard', 'documents']).default('standard'),
    weightKg: weightSchema,
    pieceCount: pieceCountSchema,
    contentType: trimmed(2, 120, 'Art des Inhalts'),
    description: optionalText(2000),
    pickupRequested: z.boolean().default(false),
    pickupDate: optionalIsoDate(),

    // Sender
    senderFirstName: trimmed(2, 80, 'Vorname'),
    senderLastName: trimmed(2, 80, 'Nachname'),
    senderPhone: phoneSchema,
    senderEmail: emailSchema,
    senderAddress: trimmed(3, 200, 'Adresse'),
    senderPostalCode: optionalText(16),
    senderCity: trimmed(2, 100, 'Stadt'),
    senderCountry: countrySchema,

    // Recipient
    recipientFirstName: trimmed(2, 80, 'Vorname des Empfängers'),
    recipientLastName: trimmed(2, 80, 'Nachname des Empfängers'),
    recipientPhone: phoneSchema,
    recipientAddress: trimmed(3, 200, 'Adresse des Empfängers'),
    recipientCity: trimmed(2, 100, 'Stadt des Empfängers'),
    recipientCountry: countrySchema,

    // Confirmations — all three are mandatory
    detailsConfirmed: z.literal(true, {
      errorMap: () => ({ message: 'Bitte bestätige, dass deine Angaben korrekt sind.' }),
    }),
    prohibitedConfirmed: z.literal(true, {
      errorMap: () => ({ message: 'Bitte bestätige, dass keine verbotenen Waren enthalten sind.' }),
    }),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Bitte akzeptiere die Versandbedingungen.' }),
    }),
  })
  .refine((v) => v.originCountry !== v.destinationCountry, {
    message: 'Start- und Zielland müssen unterschiedlich sein.',
    path: ['destinationCountry'],
  })
  .refine((v) => cities.find((c) => c.slug === v.originCity)?.country === v.originCountry, {
    message: 'Die Abholstadt passt nicht zum gewählten Land.',
    path: ['originCity'],
  })
  .refine(
    (v) => cities.find((c) => c.slug === v.destinationCity)?.country === v.destinationCountry,
    { message: 'Die Zielstadt passt nicht zum gewählten Land.', path: ['destinationCity'] },
  )
  .refine((v) => !v.pickupRequested || !!v.pickupDate, {
    message: 'Bitte wähle ein Wunschdatum für die Abholung.',
    path: ['pickupDate'],
  })
  .refine(requiresParcelWeight, parcelWeightMessage)
  /**
   * Der Pauschalpreis für Dokumente gilt für einen Umschlag, nicht für einen
   * Karton. Ohne diese Grenze wäre „Dokumente“ schlicht der billigere Tarif
   * für jede Sendung — 10,00 € statt 2,00 € pro Kilo.
   */
  .refine((v) => v.shipmentType !== 'documents' || v.weightKg <= pricingConfig.maxDocumentsWeightKg, {
    message:
      `Für Dokumente gilt der Pauschalpreis bis ${pricingConfig.maxDocumentsWeightKg} kg. ` +
      'Schwerer? Dann buche es bitte als Paket.',
    path: ['weightKg'],
  })
  .refine((v) => v.shipmentType !== 'documents' || v.pieceCount === 1, {
    message: 'Für Dokumente ist ein Umschlag vorgesehen. Mehrere Stücke bitte als Paket buchen.',
    path: ['pieceCount'],
  });

export type BookingInput = z.infer<typeof bookingSchema>;

// --- Bulky goods ------------------------------------------------------------

export const bulkyRequestSchema = z
  .object({
    originCountry: countrySchema,
    originCity: citySchema,
    destinationCountry: countrySchema,
    destinationCity: citySchema,

    itemType: trimmed(2, 80, 'Gegenstand'),
    itemDescription: optionalText(2000),
    approxWeightKg: z.coerce
      .number({ invalid_type_error: 'Bitte gib ein ungefähres Gewicht an.' })
      .positive('Das Gewicht muss größer als 0 sein.')
      .max(2000, 'Bitte kontaktiere uns direkt für über 2000 kg.'),
    lengthCm: z.coerce.number().int().positive('Bitte gib die Länge in cm an.').max(1000),
    widthCm: z.coerce.number().int().positive('Bitte gib die Breite in cm an.').max(1000),
    heightCm: z.coerce.number().int().positive('Bitte gib die Höhe in cm an.').max(1000),

    contactFirstName: trimmed(2, 80, 'Vorname'),
    contactLastName: trimmed(2, 80, 'Nachname'),
    phone: phoneSchema,
    email: optionalEmailSchema,
    pickupRequested: z.boolean().default(false),
    notes: optionalText(2000),

    /** Storage paths of photos already uploaded via a signed upload URL. */
    photoPaths: z.array(z.string().trim().min(1).max(300)).max(6).default([]),

    prohibitedConfirmed: z.literal(true, {
      errorMap: () => ({ message: 'Bitte bestätige, dass keine verbotenen Waren enthalten sind.' }),
    }),
  })
  .refine((v) => v.originCountry !== v.destinationCountry, {
    message: 'Start- und Zielland müssen unterschiedlich sein.',
    path: ['destinationCountry'],
  })
  .refine((v) => cities.find((c) => c.slug === v.originCity)?.country === v.originCountry, {
    message: 'Die Abholstadt passt nicht zum gewählten Land.',
    path: ['originCity'],
  })
  .refine(
    (v) => cities.find((c) => c.slug === v.destinationCity)?.country === v.destinationCountry,
    { message: 'Die Zielstadt passt nicht zum gewählten Land.', path: ['destinationCity'] },
  );

export type BulkyRequestInput = z.infer<typeof bulkyRequestSchema>;

// --- Back office ------------------------------------------------------------

export const trackingNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z]{2,5}-\d{6}-\d{4,}$/,
    // Aus dem Präfix der Marke abgeleitet — ein festes Beispiel wäre nach der
    // Umbenennung stehen geblieben und hätte die falsche Form gezeigt.
    `Bitte gib eine gültige Sendungsnummer ein (z. B. ${exampleTrackingNumber}).`,
  );

export const uuidSchema = z.string().uuid('Ungültige ID.');

export const statusUpdateSchema = z.object({
  shipmentId: uuidSchema,
  status: z.enum(SHIPMENT_STATUSES),
  location: optionalText(120),
  publicMessage: optionalText(500),
  internalNote: optionalText(2000),
});

export const sealSchema = z.object({
  shipmentId: uuidSchema,
  sealNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Bitte gib eine Sicherheitsnummer an.')
    .max(40)
    .regex(/^[A-Z0-9][A-Z0-9\-_/]*$/, 'Nur Buchstaben, Ziffern und - _ / sind erlaubt.'),
  note: optionalText(500),
  photoPath: optionalText(300),
});

export const shipmentEditSchema = z.object({
  shipmentId: uuidSchema,
  weightKg: optionalNumber(weightSchema),
  pieceCount: optionalNumber(pieceCountSchema),
  priceTotalCents: optionalNumber(z.coerce.number().int().min(0).max(10_000_000)),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  internalNotes: optionalText(4000),
});

export const pickupScheduleSchema = z.object({
  shipmentId: uuidSchema,
  scheduledDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte ein gültiges Datum wählen.'),
  timeWindowStart: optionalTime(),
  timeWindowEnd: optionalTime(),
  driverId: optionalUuid(),
  note: optionalText(500),
});

export const vehicleSchema = z.object({
  id: uuidSchema.optional(),
  plate: trimmed(2, 20, 'Kennzeichen').transform((v) => v.toUpperCase()),
  make: optionalText(60),
  model: optionalText(60),
  grossWeightKg: optionalNumber(z.coerce.number().positive().max(60_000)),
  payloadKg: z.coerce.number({ invalid_type_error: 'Bitte gib die Nutzlast an.' }).positive().max(60_000),
  cargoVolumeM3: optionalNumber(z.coerce.number().positive().max(200)),
  status: z.enum(VEHICLE_STATUSES).default('available'),
  notes: optionalText(1000),
});

export const tripSchema = z
  .object({
    id: uuidSchema.optional(),
    code: trimmed(3, 40, 'Tour-ID').transform((v) => v.toUpperCase()),
    originCountry: countrySchema,
    originCity: citySchema,
    destinationCountry: countrySchema,
    destinationCity: citySchema,
    departureDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte ein gültiges Datum wählen.'),
    plannedArrivalDate: optionalIsoDate(),
    vehicleId: optionalUuid(),
    driverId: optionalUuid(),
    status: z.enum(TRIP_STATUSES).default('PLANNED'),
    maxPayloadKg: optionalNumber(z.coerce.number().positive().max(60_000)),
    notes: optionalText(2000),
  })
  .refine((v) => v.originCountry !== v.destinationCountry, {
    message: 'Start- und Zielland müssen unterschiedlich sein.',
    path: ['destinationCountry'],
  });

export const bulkyQuoteSchema = z.object({
  requestId: uuidSchema,
  status: z.enum(BULKY_STATUSES),
  quotedPriceCents: optionalNumber(z.coerce.number().int().min(0).max(10_000_000)),
  quoteNote: optionalText(2000),
});

export const roleChangeSchema = z.object({
  profileId: uuidSchema,
  role: z.enum(USER_ROLES),
});

export const signedUploadSchema = z.object({
  bucket: z.enum(['shipment-photos', 'bulky-photos', 'signatures']),
  kind: z.enum([
    'bulky_photo',
    'pickup_photo',
    'delivery_photo',
    'signature',
    'seal_photo',
    'document',
    'other',
  ]),
  fileName: z.string().trim().min(1).max(160),
  mimeType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ]),
  sizeBytes: z.coerce
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'Die Datei darf höchstens 10 MB groß sein.'),
});
