import { describe, expect, it } from 'vitest';
import { de } from './dictionaries/de';
import { en } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import { ar } from './dictionaries/ar';
import { createT, LOCALES, dir, htmlLang, getDictionary } from './index';

/**
 * TypeScript already guarantees that every locale has every key — the
 * `Dictionary` type is derived from the German file. What it cannot check is
 * the *content*: that a translator did not leave a German sentence in the
 * French file, and that the placeholders survived the translation.
 *
 * The placeholder check is the important one. `{pickup}` in a price sentence is
 * filled from `pricingConfig`; if a translation drops it, the customer reads a
 * sentence about a collection fee with no number in it, and nothing in the type
 * system or the build notices.
 */

type Node = { [key: string]: string | Node };

function flatten(node: Node, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [k, v] of flatten(value, path)) out.set(k, v);
  }
  return out;
}

const flatDe = flatten(de as unknown as Node);
const others = { en, fr, ar } as const;

/** "{max} kg bis {price}" -> ["max", "price"] */
function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

describe('dictionaries', () => {
  it('German is not empty and is the shape everyone matches', () => {
    expect(flatDe.size).toBeGreaterThan(400);
  });

  for (const [locale, dict] of Object.entries(others)) {
    const flat = flatten(dict as unknown as Node);

    it(`${locale} has exactly the German keys`, () => {
      expect([...flat.keys()].sort()).toEqual([...flatDe.keys()].sort());
    });

    it(`${locale} keeps every placeholder`, () => {
      const mismatched: string[] = [];
      for (const [path, german] of flatDe) {
        const translated = flat.get(path) ?? '';
        const expected = placeholders(german);
        if (expected.join(',') !== placeholders(translated).join(',')) {
          mismatched.push(path);
        }
      }
      expect(mismatched).toEqual([]);
    });

    it(`${locale} has no empty string where German has text`, () => {
      const empty: string[] = [];
      for (const [path, german] of flatDe) {
        if (german.trim() && !(flat.get(path) ?? '').trim()) empty.push(path);
      }
      expect(empty).toEqual([]);
    });

    it(`${locale} does not simply repeat the German sentence`, () => {
      // Short words legitimately coincide across languages ("Total", "Status",
      // "Contact", a flag, a locale code). Only longer prose that is identical
      // is a sign that a passage was never translated.
      const copied: string[] = [];
      for (const [path, german] of flatDe) {
        const translated = flat.get(path) ?? '';
        if (german.length > 25 && translated === german) copied.push(path);
      }
      expect(copied).toEqual([]);
    });
  }

  it('Darija is written in Arabic script', () => {
    const flatAr = flatten(ar as unknown as Node);
    const latinOnly: string[] = [];
    for (const [path, value] of flatAr) {
      // Some values are deliberately not Arabic: locale codes, the QR acronym,
      // brand names of service providers. Everything with real prose in it
      // must contain at least one Arabic letter.
      if (value.length > 20 && !/[؀-ۿ]/.test(value)) latinOnly.push(path);
    }
    expect(latinOnly).toEqual([]);
  });

  it('resolves through the German fallback rather than showing a key', () => {
    const t = createT('fr');
    expect(t('footer.imprint')).toBe(fr.footer.imprint);
    // A key that exists nowhere comes back as itself — visible in development,
    // and never silently blank in production.
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    const t = createT('de');
    expect(t('home.whyTitle', { brand: 'AZD Transport' })).toContain('AZD Transport');
    expect(t('home.whyTitle')).toContain('{brand}');
  });

  it('marks Darija as right-to-left and tags it as Moroccan Arabic', () => {
    expect(dir('ar')).toBe('rtl');
    expect(htmlLang('ar')).toBe('ary');
    for (const locale of LOCALES.filter((l) => l !== 'ar')) {
      expect(dir(locale)).toBe('ltr');
      expect(htmlLang(locale)).toBe(locale);
    }
  });

  it('gives every locale a dictionary', () => {
    for (const locale of LOCALES) {
      expect(getDictionary(locale)).toBeDefined();
    }
  });

  it('never writes a price into a translated sentence', () => {
    // Prices come from pricingConfig through placeholders. A literal euro
    // amount in a dictionary would go stale the moment a price changes — and
    // it would go stale in four files at once.
    const offenders: string[] = [];
    for (const dict of [de, en, fr, ar]) {
      for (const [path, value] of flatten(dict as unknown as Node)) {
        // The open points for the lawyer (`…todo`) are exempt: they say things
        // like «bis 500 € je Sendung» as an *example* of what to fill in. That
        // is instruction, not a price the site charges.
        if (path.endsWith('todo')) continue;
        // The seal number example (SEC-583921) and article references
        // (§ 27a, 8,33 SZR) are not prices; only a currency amount counts.
        if (/\d[\d.,]*\s*€|€\s*\d/.test(value)) offenders.push(`${path}: ${value}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
