import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { appUrl } from '@/config/brand';
import { PATHNAME_HEADER, isTransferPath } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { dir, htmlLang, createT } from '@/lib/i18n';
import { currentLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/client';

/**
 * Die Grundangaben des Unternehmens.
 *
 * Das Hauptgeschäft ist die Fahrzeugüberführung, also steht sie hier. Die
 * Paketplattform bringt in `(site)/layout.tsx` ihre eigenen Metadaten mit und
 * überschreibt diese für ihre Seiten; einzelne Seiten überschreiben Titel und
 * Beschreibung noch einmal.
 *
 * `metadataBase` gehört an genau diese Stelle: alle relativen Angaben —
 * canonical, OpenGraph-URL — werden daran absolut gemacht.
 */
export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: 'Fahrzeugüberführung Frankfurt & deutschlandweit | AZD Transport',
    template: `%s · ${siteConfig.companyName}`,
  },
  description:
    'Professionelle Fahrzeugüberführungen auf eigener Achse. Premium-, Leasing- und Firmenfahrzeuge deutschlandweit überführen lassen. Jetzt unverbindlich anfragen.',
  applicationName: siteConfig.companyName,
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: siteConfig.companyName,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // Die Farbe der Browserleiste auf dem Telefon. Sie entspricht dem dunklen
  // Hintergrund der Hauptseite; die Paketplattform setzt in ihrem Layout
  // wieder ihre helle Farbe.
  themeColor: '#131210',
  width: 'device-width',
  initialScale: 1,
  // Never block zooming — it is an accessibility requirement.
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Die Seiten der Fahrzeugüberführung sind deutsch. Das Sprach-Cookie gehört
  // zur Paketplattform und darf ihnen nicht die Schreibrichtung drehen: wer
  // dort auf Arabisch gestellt hat, bekäme sonst einen deutschen Text von
  // rechts nach links. Den Pfad reicht `proxy.ts` in einem Header durch, weil
  // ein Layout ihn selbst nicht kennt.
  const pathname = (await headers()).get(PATHNAME_HEADER);
  const locale = isTransferPath(pathname) ? 'de' : await currentLocale();
  const t = createT(locale);

  return (
    <html lang={htmlLang(locale)} dir={dir(locale)} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t('common.skipToContent')}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
