import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { errorKey, parseErrorKey, translateError } from './errors';
import { createT, LOCALES } from './index';
import { de } from './dictionaries/de';
import {
  bookingSchema,
  bulkyRequestSchema,
  phoneSchema,
  quoteSchema,
  trackingNumberSchema,
} from '../validation';

describe('errorKey / parseErrorKey', () => {
  it('round-trips a key without parameters', () => {
    expect(parseErrorKey(errorKey('required'))).toEqual({
      path: 'validation.required',
      params: {},
    });
  });

  it('round-trips a key with parameters', () => {
    expect(parseErrorKey(errorKey('tooLong', { max: 120 }))).toEqual({
      path: 'validation.tooLong',
      params: { max: '120' },
    });
  });

  it('carries several parameters', () => {
    const parsed = parseErrorKey(errorKey('weightMin', { min: 0.5, unit: 'kg' }));
    expect(parsed?.params).toEqual({ min: '0.5', unit: 'kg' });
  });

  it('leaves prose alone', () => {
    expect(parseErrorKey('Bitte prüfe deine Eingaben.')).toBeNull();
    // A colon in ordinary prose must not be mistaken for the separator.
    expect(parseErrorKey('Fehler: bitte erneut versuchen.')).toBeNull();
  });
});

describe('translateError', () => {
  const t = createT('de');

  it('returns undefined for no message', () => {
    expect(translateError(t, undefined)).toBeUndefined();
    expect(translateError(t, null)).toBeUndefined();
    expect(translateError(t, '')).toBeUndefined();
  });

  it('fills the parameters', () => {
    expect(translateError(t, errorKey('tooLong', { max: 120 }))).toBe(
      'Zu lang — höchstens 120 Zeichen.',
    );
  });

  it('passes a server sentence through unchanged', () => {
    const prose = 'Diese Sendungsnummer existiert bereits.';
    expect(translateError(t, prose)).toBe(prose);
  });

  it('translates the same key into every language', () => {
    const message = errorKey('emailInvalid');
    const rendered = LOCALES.map((locale) => translateError(createT(locale), message));
    expect(new Set(rendered).size).toBe(LOCALES.length);
    expect(rendered.every((r) => r && !r.startsWith('validation.'))).toBe(true);
  });
});

/**
 * The check that actually protects the forms.
 *
 * A schema message is only a key; nothing forces that key to exist. Without
 * this test a typo — `errorKey('weightMinimum')` instead of `weightMin` — would
 * pass typecheck, pass the build, and show the customer the literal string
 * "validation.weightMinimum" in the one moment they are already stuck.
 */
describe('every schema message resolves', () => {
  const schemas = {
    quote: quoteSchema,
    booking: bookingSchema,
    bulky: bulkyRequestSchema,
    phone: phoneSchema,
    trackingNumber: trackingNumberSchema,
  };

  /** Runs a schema against junk and collects every message it produces. */
  function messagesOf(schema: { safeParse: (v: unknown) => { success: boolean; error?: unknown } }) {
    const found = new Set<string>();
    const inputs: unknown[] = [
      undefined,
      {},
      '',
      'x',
      { weightKg: -1, pieceCount: 0 },
      { weightKg: 9999, pieceCount: 9999, originCountry: 'DE', destinationCountry: 'DE' },
      { shipmentType: 'documents', weightKg: 25, pieceCount: 4 },
      { senderPhone: 'abc', senderEmail: 'nope', phone: 'abc', email: 'nope' },
      { approxWeightKg: 99999, lengthCm: 0, widthCm: 0, heightCm: 0 },
      { originCity: 'nirgendwo', destinationCity: 'nirgendwo' },
    ];

    for (const input of inputs) {
      const result = schema.safeParse(input);
      if (result.success) continue;
      for (const issue of (result.error as { issues: { message: string }[] }).issues) {
        found.add(issue.message);
      }
    }
    return found;
  }

  for (const [name, schema] of Object.entries(schemas)) {
    it(`${name}: no key is missing from any dictionary`, () => {
      const messages = messagesOf(schema);
      expect(messages.size).toBeGreaterThan(0);

      const missing: string[] = [];
      for (const message of messages) {
        const parsed = parseErrorKey(message);
        if (!parsed) continue; // Zods eigene Meldungen, hier nicht relevant
        for (const locale of LOCALES) {
          const rendered = createT(locale)(parsed.path);
          if (rendered === parsed.path) missing.push(`${locale}: ${parsed.path}`);
        }
      }
      expect(missing).toEqual([]);
    });
  }

  /**
   * The sample inputs above only reach the rules they happen to trip. This
   * reads every `errorKey('…')` out of the schema source instead, so a key
   * behind a rule no test input triggers is checked too.
   */
  it('every errorKey() in validation.ts exists in all four dictionaries', () => {
    const source = readFileSync(new URL('../validation.ts', import.meta.url), 'utf8');
    const keys = [...source.matchAll(/errorKey\(\s*'([^']+)'/g)].map((m) => m[1]);

    expect(keys.length).toBeGreaterThan(20);

    const missing: string[] = [];
    for (const key of new Set(keys)) {
      const path = `validation.${key}`;
      for (const locale of LOCALES) {
        if (createT(locale)(path) === path) missing.push(`${locale}: ${path}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('no validation key in the German dictionary is unused prose', () => {
    // Every entry under `validation` must be a sentence, not an accidental
    // empty string — an empty message renders as a red field with no reason.
    for (const [key, value] of Object.entries(de.validation)) {
      expect(value.trim().length, key).toBeGreaterThan(2);
    }
  });
});
