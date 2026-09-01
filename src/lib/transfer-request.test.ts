import { describe, expect, it } from 'vitest';
import {
  buildRequestMessage,
  formatDate,
  transferRequestSchema,
  VEHICLE_STATES,
  VEHICLE_TYPES,
} from './transfer-request';

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

describe('formatDate', () => {
  it('macht aus einem ISO-Datum eines, das man vorliest', () => {
    expect(formatDate('2026-10-01')).toBe('01.10.2026');
  });

  it('lässt alles andere unangetastet, statt es zu verschlucken', () => {
    expect(formatDate('nächste Woche')).toBe('nächste Woche');
    expect(formatDate('')).toBeNull();
    expect(formatDate(null)).toBeNull();
    expect(formatDate(undefined)).toBeNull();
  });
});

describe('buildRequestMessage', () => {
  const full = {
    pickupLocation: '60311 Frankfurt am Main',
    dropoffLocation: '80331 München',
    vehicleMake: 'Porsche',
    vehicleModel: '911 Carrera',
    vehicleType: 'Sportwagen',
    vehicleState: 'zugelassen',
    vehicleValue: '120.000 €',
    preferredDate: '2026-10-01',
    dateFlexible: true,
    notes: 'Abholung beim Autohaus, Ansprechpartner Herr Meier',
    name: 'Max Mustermann',
    phone: '0157 82034336',
    email: 'kunde@example.com',
  };

  it('nennt jede ausgefüllte Angabe', () => {
    const text = buildRequestMessage(full);
    for (const value of [
      '60311 Frankfurt am Main',
      '80331 München',
      'Porsche 911 Carrera',
      'Sportwagen',
      'zugelassen',
      '120.000 €',
      '01.10.2026',
      'Termin flexibel: ja',
      'Ansprechpartner Herr Meier',
      'Max Mustermann',
      '0157 82034336',
      'kunde@example.com',
    ]) {
      expect(text).toContain(value);
    }
  });

  it('beginnt mit der Strecke — das Erste, was im Chat sichtbar ist', () => {
    const lines = buildRequestMessage(full).split('\n');
    expect(lines[0]).toBe('Anfrage Fahrzeugüberführung');
    expect(lines[2]).toBe('Abholort: 60311 Frankfurt am Main');
    expect(lines[3]).toBe('Zielort: 80331 München');
  });

  it('funktioniert schon mit Abhol- und Zielort allein', () => {
    // Genau der Zustand, in dem der WhatsApp-Knopf freigegeben wird.
    const text = buildRequestMessage({
      pickupLocation: 'Frankfurt',
      dropoffLocation: 'München',
    });
    expect(text).toContain('Abholort: Frankfurt');
    expect(text).toContain('Zielort: München');
    expect(text).not.toContain('Name:');
    expect(text).not.toContain('Bemerkungen:');
  });

  it('lässt leere Felder weg, statt Zeilen ohne Inhalt zu drucken', () => {
    const text = buildRequestMessage({ ...full, vehicleValue: null, notes: '   ', email: '' });
    expect(text).not.toContain('Fahrzeugwert');
    expect(text).not.toContain('Bemerkungen');
    expect(text).not.toContain('E-Mail');
  });

  it('erwähnt einen unflexiblen Termin gar nicht erst', () => {
    expect(buildRequestMessage({ ...full, dateFlexible: false })).not.toContain('flexibel');
  });

  it('lässt keine doppelten Leerzeilen stehen und endet ohne', () => {
    const text = buildRequestMessage({ pickupLocation: 'A', dropoffLocation: 'B', name: 'C' });
    expect(text).not.toMatch(/\n\n\n/);
    expect(text).not.toMatch(/\n$/);
  });

  it('kürzt nur die Bemerkungen, wenn die Nachricht zu lang wird', () => {
    const text = buildRequestMessage({ ...full, notes: 'x'.repeat(2000) }, { maxLength: 400 });

    expect(text.length).toBeLessThanOrEqual(400);
    // Die Eckdaten überleben die Kürzung — sie sind der Zweck der Nachricht.
    expect(text).toContain('60311 Frankfurt am Main');
    expect(text).toContain('80331 München');
    expect(text).toContain('Max Mustermann');
    expect(text).toContain('[…]');
  });

  it('wirft die Bemerkungen ganz weg, wenn selbst gekürzt kein Platz bleibt', () => {
    const text = buildRequestMessage({ ...full, notes: 'x'.repeat(2000) }, { maxLength: 260 });
    expect(text).not.toContain('Bemerkungen');
    expect(text).toContain('80331 München');
  });

  it('kürzt nicht, wenn die Nachricht ohnehin passt', () => {
    expect(buildRequestMessage(full, { maxLength: 5000 })).toBe(buildRequestMessage(full));
  });
});
