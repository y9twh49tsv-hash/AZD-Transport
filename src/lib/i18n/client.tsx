'use client';

import { createContext, useContext, useMemo } from 'react';
import { createT, DEFAULT_LOCALE, dir, type Locale, type Translate } from './index';

/**
 * The locale for client components.
 *
 * Server components read it from the cookie directly; client components cannot,
 * so the root layout passes it down once and everything below reads it from
 * here. Without this a client component would silently render German inside an
 * otherwise French page.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** `const t = useT()` — then `t('booking.title')` as usual. */
export function useT(): Translate {
  const locale = useLocale();
  return useMemo(() => createT(locale), [locale]);
}

/** For the few places that need to know the writing direction in the browser. */
export function useDir(): 'ltr' | 'rtl' {
  return dir(useLocale());
}
