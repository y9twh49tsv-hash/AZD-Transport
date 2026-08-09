import { z } from 'zod';
import { pricingConfig } from '@/config/pricing';
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
  .optional()
  .transform((v) => (v ? v : null));

export const weightSchema = z.coerce
  .number({ invalid_type_error: 'Bitte gib ein Gewicht in kg an.' })
  .positive('Das Gewicht muss größer als 0 sein.')
  .min(pricingConfig.minWeightKg, `Mindestens ${pricingConfig.minWeightKg} kg.`)
  .max(
    pricingConfig.maxStandardWeightKg,
    `Über ${pricingConfig.maxStandardWeightKg} kg bitte als Sperrgut anfragen.`,
  );

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
    shipmentType: z.enum(['standard', 'bulky']).default('standard'),
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
  );

export type QuoteInput = z.infer<typeof quoteSchema>;

// --- Booking ----------------------------------------------------------------

export const bookingSchema = z
  .object({
    // Route & goods
    originCountry: countrySchema,
    originCity: citySchema,
    destinationCountry: countrySchema,
    destinationCity: citySchema,
    weightKg: weightSchema,
    pieceCount: pieceCountSchema,
    contentType: trimmed(2, 120, 'Art des Inhalts'),
    description: z.string().trim().max(2000).optional().transform((v) => v || null),
    pickupRequested: z.boolean().default(false),
    pickupDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte ein gültiges Datum wählen.')
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : null)),

    // Sender
    senderFirstName: trimmed(2, 80, 'Vorname'),
    senderLastName: trimmed(2, 80, 'Nachname'),
    senderPhone: phoneSchema,
    senderEmail: emailSchema,
    senderAddress: trimmed(3, 200, 'Adresse'),
    senderPostalCode: z.string().trim().max(16).optional().transform((v) => v || null),
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
    itemDescription: z.string().trim().max(2000).optional().transform((v) => v || null),
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
    notes: z.string().trim().max(2000).optional().transform((v) => v || null),

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
  .regex(/^[A-Z]{2,5}-\d{6}-\d{4,}$/, 'Bitte gib eine gültige Sendungsnummer ein (z. B. MC-260809-0042).');

export const uuidSchema = z.string().uuid('Ungültige ID.');

export const statusUpdateSchema = z.object({
  shipmentId: uuidSchema,
  status: z.enum(SHIPMENT_STATUSES),
  location: z.string().trim().max(120).optional().transform((v) => v || null),
  publicMessage: z.string().trim().max(500).optional().transform((v) => v || null),
  internalNote: z.string().trim().max(2000).optional().transform((v) => v || null),
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
  note: z.string().trim().max(500).optional().transform((v) => v || null),
  photoPath: z.string().trim().max(300).optional().transform((v) => v || null),
});

export const shipmentEditSchema = z.object({
  shipmentId: uuidSchema,
  weightKg: weightSchema.optional(),
  pieceCount: pieceCountSchema.optional(),
  priceTotalCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  internalNotes: z.string().trim().max(4000).optional().transform((v) => v ?? null),
});

export const pickupScheduleSchema = z.object({
  shipmentId: uuidSchema,
  scheduledDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitte ein gültiges Datum wählen.'),
  timeWindowStart: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Format HH:MM')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  timeWindowEnd: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Format HH:MM')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  driverId: z.union([uuidSchema, z.literal('')]).optional().transform((v) => (v ? v : null)),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const vehicleSchema = z.object({
  id: uuidSchema.optional(),
  plate: trimmed(2, 20, 'Kennzeichen').transform((v) => v.toUpperCase()),
  make: z.string().trim().max(60).optional().transform((v) => v || null),
  model: z.string().trim().max(60).optional().transform((v) => v || null),
  grossWeightKg: z.coerce.number().positive().max(60_000).optional(),
  payloadKg: z.coerce.number({ invalid_type_error: 'Bitte gib die Nutzlast an.' }).positive().max(60_000),
  cargoVolumeM3: z.coerce.number().positive().max(200).optional(),
  status: z.enum(VEHICLE_STATUSES).default('available'),
  notes: z.string().trim().max(1000).optional().transform((v) => v || null),
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
    plannedArrivalDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : null)),
    vehicleId: z.union([uuidSchema, z.literal('')]).optional().transform((v) => (v ? v : null)),
    driverId: z.union([uuidSchema, z.literal('')]).optional().transform((v) => (v ? v : null)),
    status: z.enum(TRIP_STATUSES).default('PLANNED'),
    maxPayloadKg: z.coerce.number().positive().max(60_000).optional(),
    notes: z.string().trim().max(2000).optional().transform((v) => v || null),
  })
  .refine((v) => v.originCountry !== v.destinationCountry, {
    message: 'Start- und Zielland müssen unterschiedlich sein.',
    path: ['destinationCountry'],
  });

export const bulkyQuoteSchema = z.object({
  requestId: uuidSchema,
  status: z.enum(BULKY_STATUSES),
  quotedPriceCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  quoteNote: z.string().trim().max(2000).optional().transform((v) => v || null),
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
