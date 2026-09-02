import { de } from './de';
import { en } from './en';
import { withdrawalFormDe } from './legal/de';
import { withdrawalFormEn } from './legal/en';
import type { Content, Locale } from './types';

export type { Content, Locale, FaqItem, Service, Step, Reason } from './types';

export const LOCALES = ['de', 'en'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'de';

const CONTENT: Record<Locale, Content> = { de, en };

export function content(locale: Locale): Content {
  return CONTENT[locale];
}

export function withdrawalForm(locale: Locale) {
  return locale === 'de' ? withdrawalFormDe : withdrawalFormEn;
}

/**
 * Die Seiten der Website, je Sprache mit eigener Adresse.
 *
 * Deutsch liegt ohne Präfix auf der Wurzel: das ist der Hauptmarkt, und die
 * Adressen sind bereits im Umlauf und in der Sitemap. Englisch bekommt `/en`
 * mit übersetzten Pfaden — `/en/imprint` findet ein englischsprachiger Sucher,
 * `/en/impressum` nicht.
 *
 * Diese Tabelle ist die einzige Stelle, an der die Zuordnung steht. Daraus
 * bauen sich der Sprachumschalter (welche Seite ist das Gegenstück?), die
 * hreflang-Angaben und die Sitemap. `routes.test.ts` hält sie gegen das
 * Dateisystem.
 */
export const PAGES = [
  { key: 'home', de: '/', en: '/en', priority: 1, changeFrequency: 'weekly' },
  {
    key: 'request',
    de: '/anfrage',
    en: '/en/request',
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    key: 'cookies',
    de: '/cookies',
    en: '/en/cookies',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    key: 'terms',
    de: '/agb',
    en: '/en/terms',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    key: 'withdrawal',
    de: '/widerruf',
    en: '/en/withdrawal',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    key: 'privacy',
    de: '/datenschutz',
    en: '/en/privacy',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    key: 'imprint',
    de: '/impressum',
    en: '/en/imprint',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
] as const satisfies readonly {
  key: string;
  de: string;
  en: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
}[];

export type PageKey = (typeof PAGES)[number]['key'];

/** Die Adresse einer Seite in einer Sprache. */
export function pagePath(key: PageKey, locale: Locale): string {
  const page = PAGES.find((entry) => entry.key === key);
  if (!page) throw new Error(`Unbekannte Seite: ${key}`);
  return page[locale];
}

/**
 * Das Gegenstück einer Adresse in der anderen Sprache.
 *
 * Für den Sprachumschalter: wer auf `/impressum` steht und umschaltet, will
 * `/en/imprint` sehen und nicht die englische Startseite. Ist eine Seite in
 * der anderen Sprache unbekannt, führt der Umschalter auf deren Startseite —
 * das ist die einzige Antwort, die nie ins Leere zeigt.
 */
export function alternatePath(path: string, target: Locale): string {
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  const page = PAGES.find((entry) => entry.de === clean || entry.en === clean);
  return page ? page[target] : pagePath('home', target);
}

/** Zu welcher Sprache eine Adresse gehört. */
export function localeOf(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'de';
}
