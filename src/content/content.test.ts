import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VEHICLE_STATES, VEHICLE_TYPES } from '@/lib/transfer-request';
import { alternatePath, content, LOCALES, localeOf, PAGES, pagePath, withdrawalForm } from '.';
import type { Content, Locale } from './types';

/**
 * Zwei Sprachen, die auseinanderlaufen, sind schlimmer als eine.
 *
 * Der Compiler hält die Form: fehlt in `en.ts` ein Feld, scheitert der Build.
 * Was er nicht sieht, steht hier — dass die Adressen in `PAGES` tatsächlich
 * existieren, dass beide Fassungen gleich viele Abschnitte haben, dass kein
 * Platzhalter ungefüllt durchrutscht und dass der Umschalter in beide
 * Richtungen dorthin führt, wo er hinsoll.
 */

/** Die Adressen, die tatsächlich unter einer Routengruppe liegen. */
function routesOnDisk(group: string, prefix: string): string[] {
  const root = join(process.cwd(), 'src/app', group);
  const found: string[] = [];

  const walk = (dir: string, path: string) => {
    if (readdirSync(dir).some((file) => /^page\.(tsx?|jsx?|mdx)$/.test(file))) {
      found.push(path || '/');
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      // Routengruppen wie (foo) tauchen in der Adresse nicht auf.
      const segment = /^\(.*\)$/.test(entry.name) ? '' : `/${entry.name}`;
      walk(join(dir, entry.name), `${path}${segment}`);
    }
  };

  walk(root, prefix);
  return found;
}

describe('PAGES', () => {
  it('listet genau die deutschen Seiten, die es auf der Platte gibt', () => {
    expect(PAGES.map((page) => page.de).sort()).toEqual(routesOnDisk('(de)', '').sort());
  });

  it('listet genau die englischen Seiten, die es auf der Platte gibt', () => {
    expect(PAGES.map((page) => page.en).sort()).toEqual(routesOnDisk('(en)', '').sort());
  });

  it('enthält keine Adresse doppelt — auch nicht über die Sprachen hinweg', () => {
    const paths = PAGES.flatMap((page) => [page.de, page.en]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gibt der Startseite den höchsten Rang', () => {
    expect(PAGES.find((page) => page.key === 'home')?.priority).toBe(1);
    for (const page of PAGES) expect(page.priority).toBeLessThanOrEqual(1);
  });

  it('beginnt jede Adresse mit einem Schrägstrich und endet ohne', () => {
    for (const page of PAGES) {
      for (const path of [page.de, page.en]) {
        expect(path.startsWith('/')).toBe(true);
        if (path !== '/') expect(path.endsWith('/')).toBe(false);
      }
    }
  });

  it('legt jede englische Adresse unter /en', () => {
    // Daran hängt `localeOf` — und damit, welches Wurzellayout greift.
    for (const page of PAGES) {
      expect(page.en === '/en' || page.en.startsWith('/en/')).toBe(true);
      expect(page.de === '/' || !page.de.startsWith('/en')).toBe(true);
    }
  });

  it('übersetzt die Adressen und lässt sie nicht deutsch', () => {
    // `/en/impressum` findet kein englischsprachiger Sucher. Zwei Ausnahmen:
    // die Startseite hat kein Wort zu übersetzen, und „Cookies" heißt in
    // beiden Sprachen so.
    const same = ['home', 'cookies'];
    for (const page of PAGES) {
      if (same.includes(page.key)) continue;
      expect(page.en).not.toBe(`/en${page.de}`);
    }
  });
});

describe('alternatePath', () => {
  it('führt von jeder Seite auf ihr Gegenstück — und wieder zurück', () => {
    for (const page of PAGES) {
      expect(alternatePath(page.de, 'en')).toBe(page.en);
      expect(alternatePath(page.en, 'de')).toBe(page.de);
    }
  });

  it('landet bei einer unbekannten Adresse auf der Startseite statt im Nichts', () => {
    expect(alternatePath('/gibt-es-nicht', 'en')).toBe('/en');
    expect(alternatePath('/en/nope', 'de')).toBe('/');
  });

  it('stört sich weder an einem Schrägstrich am Ende noch an Parametern', () => {
    expect(alternatePath('/impressum/', 'en')).toBe('/en/imprint');
    expect(alternatePath('/anfrage?kunde=gewerblich', 'en')).toBe('/en/request');
  });
});

describe('localeOf', () => {
  it('ordnet jede Adresse der Sprache zu, unter deren Wurzellayout sie liegt', () => {
    for (const page of PAGES) {
      expect(localeOf(page.de)).toBe('de');
      expect(localeOf(page.en)).toBe('en');
    }
  });

  it('lässt sich von einer Adresse, die nur mit „en" anfängt, nicht täuschen', () => {
    expect(localeOf('/entfernung')).toBe('de');
  });
});

/** Alle Schlüsselpfade eines Objekts — für den Vergleich der Sprachen. */
function keyPaths(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => keyPaths(entry, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) =>
      keyPaths(inner, path ? `${path}.${key}` : key),
    );
  }
  return [path];
}

/** Jeder Text in einem Inhaltsbaum, mit seinem Pfad. */
function strings(value: unknown, path = ''): [string, string][] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => strings(entry, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) =>
      strings(inner, path ? `${path}.${key}` : key),
    );
  }
  return typeof value === 'string' ? [[path, value]] : [];
}

describe('Sprachmodule', () => {
  it('haben in beiden Sprachen dieselbe Gliederung', () => {
    // Der Compiler prüft die Form, nicht die Anzahl: eine Übersetzung mit fünf
    // statt sechs Leistungen oder einem fehlenden AGB-Paragraphen geht durch,
    // fällt aber niemandem auf, der nur eine der beiden Fassungen liest.
    expect(keyPaths(content('en'))).toEqual(keyPaths(content('de')));
  });

  it.each(LOCALES)('lässt in %s kein Feld leer', (locale) => {
    const empty = strings(content(locale))
      .filter(([, text]) => text.trim() === '')
      // `translationNotice` ist auf Deutsch bewusst null, nicht leer — leere
      // Texte gibt es sonst keine.
      .map(([path]) => path);

    expect(empty).toEqual([]);
  });

  it.each(LOCALES)('füllt in %s jeden Platzhalter, den es einsetzt', (locale) => {
    // `{max}` wird zur Laufzeit ersetzt; jeder andere Platzhalter wäre einer,
    // den niemand ersetzt — und dann steht die geschweifte Klammer auf der
    // Seite.
    const leftovers = strings(content(locale))
      .filter(([path, text]) => /\{[a-z]+\}/i.test(text) && path !== 'errors.tooLong')
      .map(([path]) => path);

    expect(leftovers).toEqual([]);
    expect(content(locale).errors.tooLong).toContain('{max}');
  });

  it.each(LOCALES)('bietet in %s zu jedem Auswahlwert eine Beschriftung', (locale) => {
    // Fehlt eine, stünde im englischen Formular „Transporter bis 3,5 t".
    const t = content(locale);
    expect(Object.keys(t.vehicleTypes).sort()).toEqual([...VEHICLE_TYPES].sort());
    expect(Object.keys(t.vehicleStates).sort()).toEqual([...VEHICLE_STATES].sort());
  });

  it('übersetzt tatsächlich, statt den deutschen Text zu wiederholen', () => {
    const de = strings(content('de'));
    const en = new Map(strings(content('en')));

    // Ein paar Texte sind in beiden Sprachen zu Recht gleich: Eigennamen,
    // Abkürzungen, Zahlen, Ortsnamen in Beispielen.
    const shared = de.filter(([path, text]) => en.get(path) === text && text.length > 30);

    expect(shared.map(([path]) => path)).toEqual([]);
  });

  it('weist auf den englischen Rechtsseiten darauf hin, dass Deutsch gilt', () => {
    // Eine übersetzte AGB übersetzt nicht die Rechtsordnung, für die sie
    // geschrieben wurde. Das zu verschweigen wäre die eine Stelle, an der
    // jemand glauben könnte, etwas anderem zugestimmt zu haben.
    expect(content('de').legal.translationNotice).toBeNull();
    expect(content('en').legal.translationNotice).toMatch(/German version is legally binding/i);
  });

  it.each(LOCALES)(
    'verspricht in %s keine Versicherungsdeckung, die nicht belegt ist',
    (locale) => {
      const text = content(locale).company.insuranceText.toLowerCase();
      for (const claim of [
        'vollversichert',
        'vollkasko',
        '100 %',
        'garantiert',
        'fully insured',
        'guaranteed',
      ]) {
        expect(text).not.toContain(claim);
      }
    },
  );

  it('hält die Rechtsseiten Abschnitt für Abschnitt parallel', () => {
    const pages = ['imprint', 'privacy', 'cookies', 'terms', 'withdrawal'] as const;

    for (const key of pages) {
      const de = content('de').legal[key].sections;
      const en = content('en').legal[key].sections;

      expect(en).toHaveLength(de.length);
      // Die Kennungen entscheiden, welchen Abschnitt die Seite selbst füllt.
      // Fehlt eine in einer Sprache, bliebe dort das Impressum ohne Anschrift.
      expect(en.map((section) => section.id)).toEqual(de.map((section) => section.id));
    }
  });

  it('hält das Muster-Widerrufsformular in beiden Sprachen gleich lang', () => {
    expect(withdrawalForm('en').lines).toHaveLength(withdrawalForm('de').lines.length);
  });

  it('kennt zu jeder Sprache eine Startseite', () => {
    for (const locale of LOCALES) {
      expect(pagePath('home', locale)).toBe(locale === 'de' ? '/' : '/en');
      expect(content(locale as Locale).localeName).toBeTruthy();
    }
  });

  it('nennt im Umschalter die jeweils andere Sprache, wie sie sich selbst nennt', () => {
    // „Deutsch" auf der englischen Seite, „English" auf der deutschen. Ein
    // Umschalter, der die andere Sprache in der eigenen benennt („German"),
    // hilft genau denen nicht, für die er da ist.
    const de: Content = content('de');
    const en: Content = content('en');
    expect(de.switchTo).toBe(en.localeName);
    expect(en.switchTo).toBe(de.localeName);
  });
});
