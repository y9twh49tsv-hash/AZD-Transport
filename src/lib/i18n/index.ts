import { de, type Dictionary } from './dictionaries/de';

/**
 * Minimal translation layer.
 *
 * German is the only complete locale today. The structure — one dictionary
 * object per locale plus `t()` lookups by dot path — is what a later move to
 * `next-intl` (or locale-prefixed routes) would build on, so no UI string has
 * to be hunted down again at that point.
 *
 * To add French: copy `dictionaries/de.ts` to `dictionaries/fr.ts`, translate
 * the values, register it in `dictionaries` below and add 'fr' to LOCALES.
 */

export const LOCALES = ['de'] as const;
export const PLANNED_LOCALES = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';

const dictionaries: Record<Locale, Dictionary> = { de };

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

type Path = string;

/** Resolves "home.headline" against the dictionary. */
function resolve(dict: Dictionary, path: Path): string | undefined {
  const value = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], dict);
  return typeof value === 'string' ? value : undefined;
}

/**
 * `t('calculator.breakdownWeight', { weight: '25 kg' })`
 * Falls back to the key itself so a missing string is visible but harmless.
 */
export function t(
  path: Path,
  params?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const raw = resolve(getDictionary(locale), path) ?? path;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Language attribute for <html lang="…">. */
export function htmlLang(locale: Locale = DEFAULT_LOCALE): string {
  return locale;
}
