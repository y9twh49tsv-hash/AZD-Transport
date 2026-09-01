import { describe, expect, it } from 'vitest';
import { transferRequestSchema, VEHICLE_STATES, VEHICLE_TYPES } from './transfer-request';

/**
 * Die kleinste Anfrage, die durchgehen muss. Alles darüber hinaus ist
 * freiwillig — genau das ist die Absicht des Formulars.
 */
const minimal = {
  pickupLocation: 'Frankfurt am Main',
  dropoffLocation: 'München',
  name: 'Max Mustermann',
  phone: '0157 82034336',
  privacyAccepted: true,
};

describe('transferRequestSchema', () => {
  it('accepts a minimal request', () => {
    const result = transferRequestSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('accepts its own output — the server parses what the browser already parsed', () => {
    const first = transferRequestSchema.parse({
      ...minimal,
      vehicleMake: 'Porsche',
      vehicleModel: '911',
      vehicleType: 'Sportwagen',
      vehicleState: 'zugelassen',
      vehicleValue: '120.000 €',
      preferredDate: '2026-10-01',
      dateFlexible: true,
      notes: 'Abholung beim Autohaus',
      email: 'Kunde@Example.COM',
    });

    const second = transferRequestSchema.parse(first);
    expect(second).toEqual(first);
  });

  it('requires pickup and destination', () => {
    for (const field of ['pickupLocation', 'dropoffLocation'] as const) {
      const result = transferRequestSchema.safeParse({ ...minimal, [field]: '' });
      expect(result.success).toBe(false);
      expect(result.success ? [] : result.error.issues.map((i) => i.path[0])).toContain(field);
    }
  });

  it('requires a way to answer — phone or e-mail', () => {
    const result = transferRequestSchema.safeParse({
      ...minimal,
      phone: '',
      email: '',
    });
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toMatch(/Telefon oder E-Mail/);
  });

  it('accepts an e-mail alone, without a phone number', () => {
    const result = transferRequestSchema.safeParse({
      ...minimal,
      phone: undefined,
      email: 'kunde@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('normalises the e-mail address to lower case', () => {
    const parsed = transferRequestSchema.parse({ ...minimal, email: '  Kunde@Example.COM ' });
    expect(parsed.email).toBe('kunde@example.com');
  });

  it('turns empty optional fields into null rather than empty strings', () => {
    const parsed = transferRequestSchema.parse({
      ...minimal,
      vehicleMake: '',
      vehicleModel: '   ',
      notes: '',
      preferredDate: '',
      email: '',
    });

    expect(parsed.vehicleMake).toBeNull();
    expect(parsed.vehicleModel).toBeNull();
    expect(parsed.notes).toBeNull();
    expect(parsed.preferredDate).toBeNull();
    expect(parsed.email).toBeNull();
  });

  it('insists on the privacy checkbox', () => {
    const result = transferRequestSchema.safeParse({ ...minimal, privacyAccepted: false });
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toMatch(/Datenschutz/);
  });

  it('rejects a malformed date', () => {
    const result = transferRequestSchema.safeParse({ ...minimal, preferredDate: '01.10.2026' });
    expect(result.success).toBe(false);
  });

  it('falls back to the most common vehicle type and state', () => {
    const parsed = transferRequestSchema.parse(minimal);
    expect(parsed.vehicleType).toBe('PKW');
    expect(parsed.vehicleState).toBe('zugelassen');
  });

  it('only accepts the offered vehicle types and states', () => {
    expect(transferRequestSchema.safeParse({ ...minimal, vehicleType: 'LKW' }).success).toBe(false);
    expect(transferRequestSchema.safeParse({ ...minimal, vehicleState: 'egal' }).success).toBe(
      false,
    );

    for (const type of VEHICLE_TYPES) {
      expect(transferRequestSchema.safeParse({ ...minimal, vehicleType: type }).success).toBe(true);
    }
    for (const state of VEHICLE_STATES) {
      expect(transferRequestSchema.safeParse({ ...minimal, vehicleState: state }).success).toBe(
        true,
      );
    }
  });

  it('lets a filled honeypot through the schema — the action discards it silently', () => {
    // Der Honigtopf darf hier nicht scheitern. Eine Fehlermeldung würde dem
    // Absender verraten, dass das Feld geprüft wird, und ein echter Kunde,
    // dessen Passwortmanager das Feld „Firma“ ausfüllt, bekäme einen Fehler zu
    // einem Feld, das er gar nicht sieht.
    const result = transferRequestSchema.safeParse({ ...minimal, company: 'ACME' });
    expect(result.success).toBe(true);
    expect(result.success && result.data.company).toBe('ACME');
  });

  it('leaves the honeypot as an empty string when the field is absent', () => {
    expect(transferRequestSchema.parse(minimal).company).toBe('');
  });

  it('caps free text so a single request cannot fill the mailbox', () => {
    const result = transferRequestSchema.safeParse({ ...minimal, notes: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});
