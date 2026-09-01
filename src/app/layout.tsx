import type { Metadata, Viewport } from 'next';
import './globals.css';
import { appUrl } from '@/config/app-url';
import { siteConfig } from '@/config/site';

/**
 * Die Grundangaben des Unternehmens.
 *
 * Einzelne Seiten überschreiben Titel und Beschreibung; die Vorlage sorgt
 * dafür, dass der Name der Firma auch dann im Browsertab steht, wenn eine
 * Seite nur ihren eigenen kurzen Titel setzt.
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
  /** Die Farbe der Browserleiste auf dem Telefon — der Hintergrund der Seite. */
  themeColor: '#131210',
  width: 'device-width',
  initialScale: 1,
  // Zoomen darf nie blockiert werden — das ist eine Anforderung der
  // Barrierefreiheit, keine Geschmacksfrage.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" dir="ltr" suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
