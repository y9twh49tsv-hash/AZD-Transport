import '@/app/globals.css';
import { SiteHeader } from '@/components/transfer/site-header';
import { SiteFooter } from '@/components/transfer/site-footer';
import { StickyCta } from '@/components/transfer/sticky-cta';
import { content, type Locale } from '@/content';

/**
 * Der Rahmen der Website: `<html lang>`, Kopfzeile, Inhalt, Fußzeile und — auf
 * dem Telefon — die feste Handlungsleiste am unteren Rand.
 *
 * Die Sprache hängt am Wurzellayout und nicht an einem Umschalter im Browser.
 * Es gibt zwei davon: `app/(de)/layout.tsx` für die deutschen Adressen und
 * `app/(en)/layout.tsx` für `/en/…`. Nur so trägt jede Fassung ihr eigenes
 * `lang`-Attribut — und das ist keine Formalie: davon hängt ab, wie ein
 * Screenreader den Text ausspricht und wie eine Suchmaschine ihn einordnet.
 *
 * Der Preis dieser Lösung: der Wechsel zwischen den Sprachen lädt die Seite
 * vollständig neu. Bei zwei Sprachen und einem Wechsel pro Besuch ist das
 * nicht der Rede wert.
 */
export function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          {content(locale).nav.skipToContent}
        </a>

        <div className="flex min-h-dvh flex-col">
          <SiteHeader locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} />
          <StickyCta locale={locale} />
        </div>
      </body>
    </html>
  );
}
