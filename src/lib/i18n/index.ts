import { de, type Dictionary } from './dictionaries/de';
import { en } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import { ar } from './dictionaries/ar';

/**
 * Translation layer.
 *
 * Four locales, because the customers of this business are three audiences at
 * once: people living in Germany, French-speaking Moroccans, and Darija
 * speakers who read Arabic script. English is the fallback for everyone else.
 *
 * `ar` is Moroccan Darija in Arabic script, not Modern Standard Arabic. It is
 * what a Moroccan customer actually speaks; MSA would read like a government
 * form. Because it is written right to left, `dir()` drives the `dir` attribute
 * on <html>, and the layout uses logical CSS properties throughout so it
 * mirrors without a second stylesheet.
 */

export const LOCALES = ['de', 'en', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';

/** Each language named in itself — nobody looks for "German" in a German menu. */
export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  ar: 'الدارجة',
};

/**
 * A flag is a country, not a language, and picking one is always a compromise.
 * These are the ones this audience reads as intended.
 */
export const LOCALE_FLAGS: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇲🇦',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Writing direction. Only Darija runs right to left. */
export function dir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * The `lang` attribute. Darija has its own BCP-47 tag (`ary`); using it rather
 * than plain `ar` tells screen readers and translation tools that this is
 * Moroccan Arabic, not Modern Standard.
 */
export function htmlLang(locale: Locale): string {
  return locale === 'ar' ? 'ary' : locale;
}

const dictionaries: Record<Locale, Dictionary> = { de, en, fr, ar };

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** Resolves "home.headline" against a dictionary. */
function resolve(dict: Dictionary, path: string): string | undefined {
  const value = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], dict);
  return typeof value === 'string' ? value : undefined;
}

export type Translate = (path: string, params?: Record<string, string | number>) => string;

/**
 * Builds the lookup function for one locale.
 *
 * A missing string falls back to German rather than to the key itself: a
 * visitor who sees one German sentence among French ones is inconvenienced,
 * while one who sees `booking.stepSender` assumes the site is broken.
 */
export function createT(locale: Locale = DEFAULT_LOCALE): Translate {
  const dict = getDictionary(locale);
  return (path, params) => {
    const raw = resolve(dict, path) ?? resolve(de, path) ?? path;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (match, key: string) =>
      key in params ? String(params[key]) : match,
    );
  };
}

/**
 * German lookup without a locale — for the staff areas (/admin, /driver), which
 * are deliberately German only: they are used by the team, not by customers,
 * and translating them would multiply the surface that has to stay correct.
 */
export const t: Translate = createT(DEFAULT_LOCALE);
