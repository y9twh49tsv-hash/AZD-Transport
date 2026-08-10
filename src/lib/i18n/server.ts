import 'server-only';

import { cookies, headers } from 'next/headers';
import { createT, DEFAULT_LOCALE, isLocale, LOCALES, type Locale, type Translate } from './index';

/**
 * Which language the visitor gets.
 *
 * The choice lives in a cookie, not in the URL. That keeps every existing link
 * working and avoids duplicating each route under four prefixes — at the cost
 * of one shared address per page, which for a business whose links travel
 * through WhatsApp rather than search engines is the better trade.
 */
export const LOCALE_COOKIE = 'azd_locale';

/** A year: the language someone speaks does not change between visits. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Reads the preferred language from the browser's Accept-Language header.
 *
 * Only used on a first visit, before anything was chosen. Moroccan browsers
 * commonly send `ar-MA`, French ones `fr-FR` — matching on the primary subtag
 * is enough and avoids a long table of regional variants.
 */
function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => Number.isFinite(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split('-')[0];
    // `ary` is Darija's own tag; `ar` covers browsers that only send the family.
    if (primary === 'ary' || primary === 'ar') return 'ar';
    if (LOCALES.includes(primary as Locale)) return primary as Locale;
  }
  return null;
}

/** The locale for the current request. */
export async function currentLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  try {
    const requestHeaders = await headers();
    return fromAcceptLanguage(requestHeaders.get('accept-language')) ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Translation function bound to the current request's locale. */
export async function getT(): Promise<Translate> {
  return createT(await currentLocale());
}
