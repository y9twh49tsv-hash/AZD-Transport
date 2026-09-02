import type { Metadata, Viewport } from 'next';
import { appUrl } from '@/config/app-url';
import { siteConfig } from '@/config/site';
import { PAGES, content, pagePath, type Locale, type PageKey } from '@/content';

/**
 * Die Grundangaben eines Wurzellayouts.
 *
 * `metadataBase` gehört an genau diese Stelle: alle relativen Angaben —
 * canonical, hreflang, OpenGraph-URL — werden daran absolut gemacht.
 *
 * Einzelne Seiten überschreiben Titel und Beschreibung; die Vorlage sorgt
 * dafür, dass der Name der Firma auch dann im Browsertab steht, wenn eine
 * Seite nur ihren eigenen kurzen Titel setzt.
 */
export function rootMetadata(locale: Locale): Metadata {
  const t = content(locale);

  return {
    metadataBase: new URL(appUrl()),
    title: {
      default: t.meta.title,
      template: `%s · ${siteConfig.companyName}`,
    },
    description: t.meta.description,
    applicationName: siteConfig.companyName,
    formatDetection: { telephone: true, address: false, email: false },
    openGraph: {
      type: 'website',
      locale: t.meta.ogLocale,
      siteName: siteConfig.companyName,
    },
    robots: { index: true, follow: true },
  };
}

export const rootViewport: Viewport = {
  /** Die Farbe der Browserleiste auf dem Telefon — der Hintergrund der Seite. */
  themeColor: '#131210',
  width: 'device-width',
  initialScale: 1,
  // Zoomen darf nie blockiert werden — das ist eine Anforderung der
  // Barrierefreiheit, keine Geschmacksfrage.
  maximumScale: 5,
};

/**
 * Die Metadaten einer Seite — in beiden Sprachen nach derselben Regel gebaut.
 *
 * Der Kern sind die `hreflang`-Angaben. Zwei Fassungen derselben Seite ohne
 * gegenseitigen Verweis sind für eine Suchmaschine zwei konkurrierende Seiten;
 * sie sucht sich eine aus und die andere verschwindet. Genau das ist der
 * häufigste Fehler bei zweisprachigen Seiten, und er fällt nicht auf, weil
 * beide Fassungen erreichbar bleiben.
 *
 * `x-default` zeigt auf Deutsch: das ist der Hauptmarkt, und wer weder Deutsch
 * noch Englisch spricht, landet dort, wo die verbindliche Fassung steht.
 */
export function pageMetadata({
  key,
  locale,
  title,
  description,
}: {
  key: PageKey;
  locale: Locale;
  title: string;
  description: string;
}): Metadata {
  const page = PAGES.find((entry) => entry.key === key);
  if (!page) throw new Error(`Unbekannte Seite: ${key}`);

  const path = pagePath(key, locale);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        'de-DE': page.de,
        en: page.en,
        'x-default': page.de,
      },
    },
    openGraph: {
      type: 'website',
      locale: content(locale).meta.ogLocale,
      url: path,
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

/** Die Metadaten einer Rechtsseite: Titel und Beschreibung stehen im Inhalt. */
export function legalMetadata(
  key: Extract<PageKey, 'imprint' | 'privacy' | 'cookies' | 'terms' | 'withdrawal'>,
  locale: Locale,
): Metadata {
  const page = content(locale).legal[key];
  return pageMetadata({
    key,
    locale,
    title: page.title,
    description: page.metaDescription,
  });
}
