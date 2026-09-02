import { describe, expect, it } from 'vitest';
import {
  buildRequestLine,
  buildRequestMessage,
  formatDate,
  transferRequestSchema,
  VEHICLE_STATES,
  VEHICLE_TYPES,
} from './transfer-request';

/**
 * Das Schema in der Sprache des Absenders. Geprüft wird überwiegend die
 * deutsche Fassung — die Regeln sind in beiden dieselben, nur die Meldungen
 * nicht. Was sprachabhängig ist, steht am Ende dieser Datei.
 */
const schema = transferRequestSchema('de');

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
    const result = schema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('accepts its own output — the server parses what the browser already parsed', () => {
    const first = schema.parse({
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

    const second = schema.parse(first);
    expect(second).toEqual(first);
  });

  it('requires pickup and destination', () => {
    for (const field of ['pickupLocation', 'dropoffLocation'] as const) {
      const result = schema.safeParse({ ...minimal, [field]: '' });
      expect(result.success).toBe(false);
      expect(result.success ? [] : result.error.issues.map((i) => i.path[0])).toContain(field);
    }
  });

  it('requires a way to answer — phone or e-mail', () => {
    const result = schema.safeParse({
      ...minimal,
      phone: '',
      email: '',
    });
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toMatch(/Telefon oder E-Mail/);
  });

  it('accepts an e-mail alone, without a phone number', () => {
    const result = schema.safeParse({
      ...minimal,
      phone: undefined,
      email: 'kunde@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('normalises the e-mail address to lower case', () => {
    const parsed = schema.parse({ ...minimal, email: '  Kunde@Example.COM ' });
    expect(parsed.email).toBe('kunde@example.com');
  });

  it('turns empty optional fields into null rather than empty strings', () => {
    const parsed = schema.parse({
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
    const result = schema.safeParse({ ...minimal, privacyAccepted: false });
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toMatch(/Datenschutz/);
  });

  it('rejects a malformed date', () => {
    const result = schema.safeParse({
      ...minimal,
      preferredDate: '01.10.2026',
    });
    expect(result.success).toBe(false);
  });

  it('falls back to the most common vehicle type and state', () => {
    const parsed = schema.parse(minimal);
    expect(parsed.vehicleType).toBe('PKW');
    expect(parsed.vehicleState).toBe('zugelassen');
  });

  it('only accepts the offered vehicle types and states', () => {
    expect(schema.safeParse({ ...minimal, vehicleType: 'LKW' }).success).toBe(false);
    expect(schema.safeParse({ ...minimal, vehicleState: 'egal' }).success).toBe(false);

    for (const type of VEHICLE_TYPES) {
      expect(schema.safeParse({ ...minimal, vehicleType: type }).success).toBe(true);
    }
    for (const state of VEHICLE_STATES) {
      expect(schema.safeParse({ ...minimal, vehicleState: state }).success).toBe(true);
    }
  });

  it('lets a filled honeypot through the schema — the action discards it silently', () => {
    // Der Honigtopf darf hier nicht scheitern. Eine Fehlermeldung würde dem
    // Absender verraten, dass das Feld geprüft wird, und ein echter Kunde,
    // dessen Passwortmanager das Feld „Firma“ ausfüllt, bekäme einen Fehler zu
    // einem Feld, das er gar nicht sieht.
    const result = schema.safeParse({ ...minimal, company: 'ACME' });
    expect(result.success).toBe(true);
    expect(result.success && result.data.company).toBe('ACME');
  });

  it('leaves the honeypot as an empty string when the field is absent', () => {
    expect(schema.parse(minimal).company).toBe('');
  });

  it('caps free text so a single request cannot fill the mailbox', () => {
    const result = schema.safeParse({ ...minimal, notes: 'x'.repeat(2001) });
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
    const text = buildRequestMessage(full, 'de');
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
    const lines = buildRequestMessage(full, 'de').split('\n');
    expect(lines[0]).toBe('Anfrage Fahrzeugüberführung');
    expect(lines[2]).toBe('Abholort: 60311 Frankfurt am Main');
    expect(lines[3]).toBe('Zielort: 80331 München');
  });

  it('funktioniert schon mit Abhol- und Zielort allein', () => {
    // Genau der Zustand, in dem der WhatsApp-Knopf freigegeben wird.
    const text = buildRequestMessage(
      {
        pickupLocation: 'Frankfurt',
        dropoffLocation: 'München',
      },
      'de',
    );
    expect(text).toContain('Abholort: Frankfurt');
    expect(text).toContain('Zielort: München');
    expect(text).not.toContain('Name:');
    expect(text).not.toContain('Bemerkungen:');
  });

  it('lässt leere Felder weg, statt Zeilen ohne Inhalt zu drucken', () => {
    const text = buildRequestMessage(
      { ...full, vehicleValue: null, notes: '   ', email: '' },
      'de',
    );
    expect(text).not.toContain('Fahrzeugwert');
    expect(text).not.toContain('Bemerkungen');
    expect(text).not.toContain('E-Mail');
  });

  it('erwähnt einen unflexiblen Termin gar nicht erst', () => {
    expect(buildRequestMessage({ ...full, dateFlexible: false }, 'de')).not.toContain('flexibel');
  });

  it('lässt keine doppelten Leerzeilen stehen und endet ohne', () => {
    const text = buildRequestMessage(
      { pickupLocation: 'A', dropoffLocation: 'B', name: 'C' },
      'de',
    );
    expect(text).not.toMatch(/\n\n\n/);
    expect(text).not.toMatch(/\n$/);
  });

  it('kürzt nur die Bemerkungen, wenn die Nachricht zu lang wird', () => {
    const text = buildRequestMessage({ ...full, notes: 'x'.repeat(2000) }, 'de', {
      maxLength: 400,
    });

    expect(text.length).toBeLessThanOrEqual(400);
    // Die Eckdaten überleben die Kürzung — sie sind der Zweck der Nachricht.
    expect(text).toContain('60311 Frankfurt am Main');
    expect(text).toContain('80331 München');
    expect(text).toContain('Max Mustermann');
    expect(text).toContain('[…]');
  });

  it('wirft die Bemerkungen ganz weg, wenn selbst gekürzt kein Platz bleibt', () => {
    const text = buildRequestMessage({ ...full, notes: 'x'.repeat(2000) }, 'de', {
      maxLength: 260,
    });
    expect(text).not.toContain('Bemerkungen');
    expect(text).toContain('80331 München');
  });

  it('kürzt nicht, wenn die Nachricht ohnehin passt', () => {
    expect(buildRequestMessage(full, 'de', { maxLength: 5000 })).toBe(
      buildRequestMessage(full, 'de'),
    );
  });
});

describe('buildRequestLine', () => {
  const full = {
    pickupLocation: '60311 Frankfurt am Main',
    dropoffLocation: '80331 München',
    vehicleMake: 'Porsche',
    vehicleModel: '911 Carrera',
    vehicleType: 'Sportwagen',
    preferredDate: '2026-10-01',
    dateFlexible: false,
    name: 'Max Mustermann',
    phone: '0157 82034336',
    email: 'kunde@example.com',
  };

  it('passt in eine Zeile und beginnt mit der Strecke', () => {
    // Auf dem Sperrbildschirm sind zwei Zeilen sichtbar. Was dort zuerst
    // steht, entscheidet, ob man das Telefon überhaupt entsperrt.
    const line = buildRequestLine(full, 'de');
    expect(line).not.toMatch(/[\r\n\t]/);
    expect(line.startsWith('60311 Frankfurt am Main → 80331 München')).toBe(true);
  });

  it('nennt Fahrzeug, Termin, Name und eine Rufnummer', () => {
    expect(buildRequestLine(full, 'de')).toBe(
      '60311 Frankfurt am Main → 80331 München · Porsche 911 Carrera · 01.10.2026 · Max Mustermann · 0157 82034336',
    );
  });

  it('markiert einen flexiblen Termin als solchen', () => {
    expect(buildRequestLine({ ...full, dateFlexible: true }, 'de')).toContain(
      '01.10.2026 (flexibel)',
    );
  });

  it('nimmt die E-Mail, wenn keine Telefonnummer da ist', () => {
    expect(buildRequestLine({ ...full, phone: null }, 'de')).toContain('kunde@example.com');
  });

  it('weicht auf den Fahrzeugtyp aus, wenn Hersteller und Modell fehlen', () => {
    const line = buildRequestLine({ ...full, vehicleMake: null, vehicleModel: null }, 'de');
    expect(line).toContain('Sportwagen');
  });

  it('lässt weg, was fehlt, statt leere Trenner zu drucken', () => {
    const line = buildRequestLine(
      {
        pickupLocation: 'Frankfurt',
        dropoffLocation: 'München',
      },
      'de',
    );
    expect(line).toBe('Frankfurt → München');
    expect(line).not.toMatch(/·\s*·/);
    expect(line).not.toMatch(/·\s*$/);
  });
});

describe('Sprache', () => {
  it('meldet Fehler in der Sprache des Formulars', () => {
    const german = transferRequestSchema('de').safeParse({
      ...minimal,
      privacyAccepted: false,
    });
    const english = transferRequestSchema('en').safeParse({
      ...minimal,
      privacyAccepted: false,
    });

    expect(german.success ? '' : german.error.issues[0].message).toMatch(/Datenschutz/);
    expect(english.success ? '' : english.error.issues[0].message).toMatch(/privacy notice/i);
  });

  it('setzt die Höchstlänge in die Meldung ein, statt {max} zu drucken', () => {
    // Der Platzhalter ist die Stelle, an der eine Übersetzung still kaputtgeht:
    // Typprüfung und Build merken nichts, es steht nur „{max}" auf der Seite.
    for (const locale of ['de', 'en'] as const) {
      const result = transferRequestSchema(locale).safeParse({
        ...minimal,
        notes: 'x'.repeat(2001),
      });
      const message = result.success ? '' : result.error.issues[0].message;
      expect(message).not.toContain('{max}');
      expect(message).toContain('2000');
    }
  });

  it('nimmt in beiden Sprachen dieselben Werte an — übersetzt wird nur die Anzeige', () => {
    // „PKW" ist die Kennung, die über die Leitung geht. Würde sie mit der
    // Sprache wechseln, käme aus dem englischen Formular ein Wert, den das
    // Schema nicht kennt — und die Anfrage wäre weg.
    for (const type of VEHICLE_TYPES) {
      expect(transferRequestSchema('en').safeParse({ ...minimal, vehicleType: type }).success).toBe(
        true,
      );
    }
  });

  it('schreibt die Nachricht in der Sprache des Absenders', () => {
    const data = {
      pickupLocation: '60311 Frankfurt am Main',
      dropoffLocation: '80331 München',
      vehicleType: 'Sportwagen',
      vehicleState: 'zugelassen',
      dateFlexible: true,
      preferredDate: '2026-10-01',
      name: 'Max Mustermann',
    };

    const english = buildRequestMessage(data, 'en');
    expect(english).toContain('Pick-up: 60311 Frankfurt am Main');
    expect(english).toContain('Destination: 80331 München');
    expect(english).toContain('Vehicle type: Sports car');
    expect(english).toContain('Registration: registered');
    expect(english).toContain('Date flexible: yes');
    expect(english).not.toContain('Abholort');

    expect(buildRequestLine(data, 'en')).toContain('01.10.2026 (flexible)');
  });
});
