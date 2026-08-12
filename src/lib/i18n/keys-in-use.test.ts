import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createT, LOCALES } from './index';

/**
 * Every `t('…')` in the source must resolve to a real entry.
 *
 * The dictionary test next door checks that the four files agree with each
 * other. That is not the same thing: a key can be perfectly consistent across
 * all four and simply not exist, because a component still asks for the name it
 * had before a rename. Nothing then fails — `createT` returns the path itself,
 * by design, so a missing string never renders as a blank space.
 *
 * The price for that design is this test. Without it the headline on the home
 * page read "Deine Pakete sicher von home.countryFrom nach home.countryTo" in
 * production, after `home.countryFrom` was folded into `countries.DE`.
 * Typecheck passed, the build passed, all tests passed.
 */

const SOURCE = join(process.cwd(), 'src');

/** Every .ts/.tsx file under src/, except the tests themselves. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry)) return [];
    return [path];
  });
}

/**
 * Pulls the statically readable keys out of a file.
 *
 * Only single-quoted literals: `t(`status.${s}`)` cannot be resolved without
 * running the code, and guessing at it would produce false alarms. Those calls
 * are covered by the dictionary test, which walks every locale key by key.
 */
function keysIn(source: string): string[] {
  return [...source.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*)'/g)].map((m) => m[1]);
}

describe('Übersetzungsschlüssel im Quelltext', () => {
  const files = sourceFiles(SOURCE);

  it('findet überhaupt Aufrufe — sonst prüft der Test nichts', () => {
    const total = files.reduce((n, f) => n + keysIn(readFileSync(f, 'utf8')).length, 0);
    expect(total).toBeGreaterThan(200);
  });

  it('jeder Schlüssel existiert im deutschen Wörterbuch', () => {
    const t = createT('de');
    const missing: string[] = [];

    for (const file of files) {
      for (const key of new Set(keysIn(readFileSync(file, 'utf8')))) {
        // Punktlose Aufrufe sind keine Übersetzungsschlüssel, sondern andere
        // Funktionen, die zufällig t heißen.
        if (!key.includes('.')) continue;
        if (t(key) === key) missing.push(`${file.replace(SOURCE, 'src')}: ${key}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('und in allen vier Sprachen', () => {
    const missing: string[] = [];
    for (const locale of LOCALES) {
      const t = createT(locale);
      for (const file of files) {
        for (const key of new Set(keysIn(readFileSync(file, 'utf8')))) {
          if (!key.includes('.')) continue;
          if (t(key) === key) missing.push(`${locale} — ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
