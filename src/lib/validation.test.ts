import { describe, expect, it } from 'vitest';
import {
  bookingSchema,
  bulkyRequestSchema,
  phoneSchema,
  quoteSchema,
  sealSchema,
  signedUploadSchema,
  trackingNumberSchema,
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
