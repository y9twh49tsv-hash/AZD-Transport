import { describe, expect, it } from 'vitest';
import {
  bookingSchema,
  bulkyQuoteSchema,
  bulkyRequestSchema,
  optionalEmailSchema,
  phoneSchema,
  pickupScheduleSchema,
  quoteSchema,
  sealSchema,
  shipmentEditSchema,
  signedUploadSchema,
  statusUpdateSchema,
  trackingNumberSchema,
  tripSchema,
  vehicleSchema,
} from './validation';

const validBooking = {
  originCountry: 'DE',
  originCity: 'frankfurt-am-main',
  destinationCountry: 'MA',
  destinationCity: 'nador',
  weightKg: 25,
  pieceCount: 3,
  contentType: 'Kleidung',
  description: '',
  pickupRequested: false,
  pickupDate: '',
  senderFirstName: 'Yassin',
  senderLastName: 'El Amrani',
  senderPhone: '+49 176 1111111',
  senderEmail: 'yassin@example.com',
  senderAddress: 'Kaiserstraße 12',
  senderPostalCode: '60329',
  senderCity: 'Frankfurt am Main',
  senderCountry: 'DE',
  recipientFirstName: 'Samira',
  recipientLastName: 'Haddadi',
  recipientPhone: '+212 6 55 44 33 22',
  recipientAddress: 'Hay El Matar 7',
  recipientCity: 'Nador',
  recipientCountry: 'MA',
  detailsConfirmed: true,
  prohibitedConfirmed: true,
  termsAccepted: true,
};

describe('bookingSchema', () => {
  it('accepts a complete, valid booking', () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it('rejects a route that does not cross the border', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      destinationCountry: 'DE',
      destinationCity: 'offenbach',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a city that belongs to the other country', () => {
    const result = bookingSchema.safeParse({ ...validBooking, originCity: 'nador' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown city, even if it looks plausible', () => {
    const result = bookingSchema.safeParse({ ...validBooking, originCity: 'berlin' });
    expect(result.success).toBe(false);
  });

  it('requires all three confirmations', () => {
    for (const field of ['detailsConfirmed', 'prohibitedConfirmed', 'termsAccepted'] as const) {
      const result = bookingSchema.safeParse({ ...validBooking, [field]: false });
      expect(result.success, `${field} must be required`).toBe(false);
    }
  });

  it('requires a pickup date when pickup is requested', () => {
    expect(
      bookingSchema.safeParse({ ...validBooking, pickupRequested: true, pickupDate: '' }).success,
    ).toBe(false);
    expect(
      bookingSchema.safeParse({ ...validBooking, pickupRequested: true, pickupDate: '2026-09-01' })
        .success,
    ).toBe(true);
  });

  it('rejects impossible weights', () => {
    expect(bookingSchema.safeParse({ ...validBooking, weightKg: 0 }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, weightKg: -10 }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, weightKg: 99999 }).success).toBe(false);
  });

  it('rejects an invalid piece count', () => {
    expect(bookingSchema.safeParse({ ...validBooking, pieceCount: 0 }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, pieceCount: 2.5 }).success).toBe(false);
  });

  it('rejects a malformed e-mail address', () => {
    expect(bookingSchema.safeParse({ ...validBooking, senderEmail: 'keine-mail' }).success).toBe(
      false,
    );
  });

  it('normalises the e-mail address to lower case', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      senderEmail: '  Yassin@Example.COM ',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.senderEmail).toBe('yassin@example.com');
  });

  it('never lets the client submit a price or a tracking number', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      priceTotalCents: 1,
      trackingNumber: 'MC-000000-0001',
      status: 'DELIVERED',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('priceTotalCents');
      expect(result.data).not.toHaveProperty('trackingNumber');
      expect(result.data).not.toHaveProperty('status');
    }
  });
});

describe('phoneSchema', () => {
  it('accepts the formats German and Moroccan customers actually type', () => {
    for (const phone of [
      '+49 176 1111111',
      '0176 1111111',
      '+212 6 55 44 33 22',
      '00212655443322',
      '(069) 123-4567',
    ]) {
      expect(phoneSchema.safeParse(phone).success, phone).toBe(true);
    }
  });

  it('rejects nonsense', () => {
    for (const phone of ['', 'abcdef', '123', 'DROP TABLE shipments', '<script>']) {
      expect(phoneSchema.safeParse(phone).success, phone).toBe(false);
    }
  });
});

describe('quoteSchema', () => {
  it('coerces a numeric string weight', () => {
    const result = quoteSchema.safeParse({
      originCountry: 'DE',
      originCity: 'frankfurt-am-main',
      destinationCountry: 'MA',
      destinationCity: 'nador',
      weightKg: '25',
      pickupRequested: false,
      shipmentType: 'standard',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.weightKg).toBe(25);
  });
});

describe('trackingNumberSchema', () => {
  it('accepts valid numbers and upper-cases them', () => {
    const result = trackingNumberSchema.safeParse('mc-260809-0042');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('MC-260809-0042');
  });

  it('rejects anything that is not a tracking number', () => {
    for (const value of ['', 'MC-2608-0042', 'hallo', "' OR 1=1 --", '../../etc/passwd']) {
      expect(trackingNumberSchema.safeParse(value).success, value).toBe(false);
    }
  });
});

describe('sealSchema', () => {
  it('accepts a normal seal number', () => {
    const result = sealSchema.safeParse({
      shipmentId: '0b8b8f3e-0000-4000-8000-000000000001',
      sealNumber: 'sec-583921',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sealNumber).toBe('SEC-583921');
  });

  it('rejects characters that do not belong on a seal', () => {
    for (const seal of ['SE', '<script>', 'SEC 583921; DROP', 'SEC\n583921']) {
      const result = sealSchema.safeParse({
        shipmentId: '0b8b8f3e-0000-4000-8000-000000000001',
        sealNumber: seal,
      });
      expect(result.success, seal).toBe(false);
    }
  });

  it('rejects a non-uuid shipment id', () => {
    expect(sealSchema.safeParse({ shipmentId: '1', sealNumber: 'SEC-1234' }).success).toBe(false);
  });
});

describe('bulkyRequestSchema', () => {
  const base = {
    originCountry: 'DE',
    originCity: 'frankfurt-am-main',
    destinationCountry: 'MA',
    destinationCity: 'nador',
    itemType: 'Waschmaschine',
    approxWeightKg: 75,
    lengthCm: 60,
    widthCm: 60,
    heightCm: 85,
    contactFirstName: 'Rachid',
    contactLastName: 'El Fassi',
    phone: '+49 176 9999999',
    email: '',
    pickupRequested: true,
    photoPaths: [],
    prohibitedConfirmed: true,
  };

  it('accepts a request without an e-mail address', () => {
    const result = bulkyRequestSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBeNull();
  });

  it('caps the number of photos', () => {
    const result = bulkyRequestSchema.safeParse({
      ...base,
      photoPaths: Array.from({ length: 20 }, (_, i) => `2026-08/${i}.jpg`),
    });
    expect(result.success).toBe(false);
  });

  it('requires the prohibited-goods confirmation', () => {
    expect(bulkyRequestSchema.safeParse({ ...base, prohibitedConfirmed: false }).success).toBe(
      false,
    );
  });
});

describe('signedUploadSchema', () => {
  it('accepts image uploads within the size limit', () => {
    const result = signedUploadSchema.safeParse({
      bucket: 'bulky-photos',
      kind: 'bulky_photo',
      fileName: 'foto.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1_000_000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-image types — no PDFs, no executables, no SVG', () => {
    for (const mimeType of ['application/pdf', 'text/html', 'image/svg+xml', 'application/x-msdownload']) {
      const result = signedUploadSchema.safeParse({
        bucket: 'bulky-photos',
        kind: 'bulky_photo',
        fileName: 'datei',
        mimeType,
        sizeBytes: 1000,
      });
      expect(result.success, mimeType).toBe(false);
    }
  });

  it('rejects files above 10 MB', () => {
    const result = signedUploadSchema.safeParse({
      bucket: 'bulky-photos',
      kind: 'bulky_photo',
      fileName: 'gross.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 11 * 1024 * 1024,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown bucket', () => {
    const result = signedUploadSchema.safeParse({
      bucket: 'avatars',
      kind: 'bulky_photo',
      fileName: 'foto.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Ein Schema muss annehmen, was es selbst zurückgibt
// ---------------------------------------------------------------------------
// Diese Schemas prüfen dieselben Daten zweimal: react-hook-form im Browser und
// danach die Server Action noch einmal, weil ein Server dem Browser nicht
// glauben darf. Der Browser reicht dabei das *geparste* Ergebnis weiter — die
// Ausgabe des einen Durchgangs ist also die Eingabe des nächsten.
//
// Ein Schema, das seine eigene Ausgabe ablehnt, macht das Formular
// unabsendbar, und zwar mit einer Meldung, die kein Feld benennt, während auf
// dem Bildschirm jedes Feld korrekt ausgefüllt aussieht. Genau das hat die
// Buchung blockiert: '' wurde beim Hinausgehen zu null und beim Hereinkommen
// abgelehnt — "Expected string, received null" und "Invalid input".

const UUID = '11111111-2222-3333-4444-555555555555';

const roundTrip = [
  ['bookingSchema', bookingSchema, validBooking],
  [
    'statusUpdateSchema',
    statusUpdateSchema,
    { shipmentId: UUID, status: 'IN_TRANSIT', location: '', publicMessage: '', internalNote: '' },
  ],
  ['sealSchema', sealSchema, { shipmentId: UUID, sealNumber: 'SEC-583921', note: '', photoPath: '' }],
  [
    'shipmentEditSchema',
    shipmentEditSchema,
    { shipmentId: UUID, weightKg: 25, pieceCount: 2, priceTotalCents: 5000, internalNotes: '' },
  ],
  [
    'pickupScheduleSchema',
    pickupScheduleSchema,
    {
      shipmentId: UUID,
      scheduledDate: '2026-08-20',
      timeWindowStart: '',
      timeWindowEnd: '',
      driverId: '',
      note: '',
    },
  ],
  [
    'vehicleSchema',
    vehicleSchema,
    { plate: 'F-MC 1234', make: '', model: '', payloadKg: 1200, notes: '' },
  ],
  [
    'tripSchema',
    tripSchema,
    {
      code: 'TOUR-01',
      originCountry: 'DE',
      originCity: 'frankfurt-am-main',
      destinationCountry: 'MA',
      destinationCity: 'nador',
      departureDate: '2026-08-20',
      plannedArrivalDate: '',
      vehicleId: '',
      driverId: '',
      notes: '',
    },
  ],
  ['bulkyQuoteSchema', bulkyQuoteSchema, { requestId: UUID, status: 'QUOTED', quoteNote: '' }],
] as const;

describe('Schemas akzeptieren ihre eigene Ausgabe', () => {
  it.each(roundTrip)('%s', (_name, schema, input) => {
    const first = schema.parse(input);
    // Der zweite Durchgang ist der, der auf dem Server läuft.
    expect(schema.parse(first)).toEqual(first);
  });

  it('bulkyRequestSchema', () => {
    const first = bulkyRequestSchema.parse({
      originCountry: 'DE',
      originCity: 'frankfurt-am-main',
      destinationCountry: 'MA',
      destinationCity: 'nador',
      itemType: 'Waschmaschine',
      itemDescription: '',
      approxWeightKg: 75,
      lengthCm: 60,
      widthCm: 60,
      heightCm: 85,
      contactFirstName: 'Rachid',
      contactLastName: 'El Fassi',
      phone: '+49 176 9999999',
      email: '',
      pickupRequested: true,
      notes: '',
      photoPaths: [],
      prohibitedConfirmed: true,
    });
    expect(bulkyRequestSchema.parse(first)).toEqual(first);
  });

  it('auch beim dritten Mal', () => {
    const once = bookingSchema.parse(validBooking);
    expect(bookingSchema.parse(bookingSchema.parse(once))).toEqual(once);
  });
});

describe('Buchung ohne Abholung', () => {
  it('geht durch — der Fall, der die Buchung blockierte', () => {
    const parsed = bookingSchema.parse(validBooking);
    expect(parsed.pickupDate).toBeNull();
    expect(parsed.description).toBeNull();
    expect(() => bookingSchema.parse(parsed)).not.toThrow();
  });

  it('macht aus einer leeren PLZ null, nicht eine leere Zeichenkette', () => {
    expect(bookingSchema.parse({ ...validBooking, senderPostalCode: '   ' }).senderPostalCode)
      .toBeNull();
  });
});

describe('optionale Zahlen', () => {
  it('behandeln leer und null als »nicht angegeben«, nicht als 0', () => {
    // Sonst würde ein leer gelassenes Preisfeld die Sendung kostenlos machen.
    for (const value of ['', null, undefined]) {
      const parsed = shipmentEditSchema.parse({ shipmentId: UUID, priceTotalCents: value });
      expect(parsed.priceTotalCents, `Eingabe: ${JSON.stringify(value)}`).toBeUndefined();
    }
  });

  it('nehmen eine echte Zahl weiterhin an', () => {
    expect(shipmentEditSchema.parse({ shipmentId: UUID, priceTotalCents: '4500' }).priceTotalCents)
      .toBe(4500);
  });
});

describe('optionalEmailSchema', () => {
  it('akzeptiert Adresse, leer, null und undefined', () => {
    expect(optionalEmailSchema.parse('Mehdi90@Outlook.de')).toBe('mehdi90@outlook.de');
    for (const value of ['', null, undefined]) {
      expect(optionalEmailSchema.parse(value), `Eingabe: ${JSON.stringify(value)}`).toBeNull();
    }
  });

  it('lehnt eine kaputte Adresse ab', () => {
    expect(optionalEmailSchema.safeParse('keine-adresse').success).toBe(false);
  });
});

describe('Dokumentenversand', () => {
  const alsDokument = { ...validBooking, shipmentType: 'documents' as const, weightKg: 0.3, pieceCount: 1 };

  it('nimmt einen Umschlag an', () => {
    const result = bookingSchema.safeParse(alsDokument);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.shipmentType).toBe('documents');
  });

  it('lehnt ab, was kein Umschlag mehr ist', () => {
    // Sonst wäre "Dokumente" schlicht der billigere Tarif für jede Sendung:
    // 10 € pauschal statt 2 € pro Kilo.
    const result = bookingSchema.safeParse({ ...alsDokument, weightKg: 25 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['weightKg']);
      expect(result.error.issues[0].message).toContain('Paket');
    }
  });

  it('lässt mehrere Stücke nicht als Dokumente durchgehen', () => {
    const result = bookingSchema.safeParse({ ...alsDokument, pieceCount: 5 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['pieceCount']);
  });

  it('lässt dasselbe Gewicht als Paket zu', () => {
    expect(bookingSchema.safeParse({ ...validBooking, weightKg: 25, pieceCount: 5 }).success).toBe(
      true,
    );
  });

  it('nimmt Sperrgut hier nicht an — dafür gibt es die Sperrgut-Anfrage', () => {
    expect(bookingSchema.safeParse({ ...validBooking, shipmentType: 'bulky' }).success).toBe(false);
  });

  it('bucht ohne Angabe weiterhin als Paket', () => {
    const { shipmentType: _ignored, ...ohneArt } = alsDokument;
    const result = bookingSchema.safeParse({ ...ohneArt, weightKg: 25 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.shipmentType).toBe('standard');
  });
});

describe('Mindestgewicht je Sendungsart', () => {
  it('lässt einen 50-Gramm-Umschlag als Dokumente zu', () => {
    // Genau der Fall, für den es die Sendungsart gibt. Mit der Paketgrenze von
    // 0,5 kg wäre der Dienst für echte Umschläge nicht buchbar gewesen.
    const result = bookingSchema.safeParse({
      ...validBooking,
      shipmentType: 'documents',
      weightKg: 0.05,
      pieceCount: 1,
    });
    expect(result.success).toBe(true);
  });

  it('lehnt dasselbe Gewicht als Paket ab', () => {
    const result = bookingSchema.safeParse({ ...validBooking, weightKg: 0.05 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'weightKg');
      expect(issue?.message).toContain('Dokumentensendung');
    }
  });
});
