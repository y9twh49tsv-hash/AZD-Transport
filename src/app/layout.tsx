import type { Metadata, Viewport } from 'next';
import './globals.css';
import { brand, appUrl } from '@/config/brand';
import { createT, dir, htmlLang } from '@/lib/i18n';
import { currentLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/client';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description:
    'Pakete, Taschen und Kartons zwischen Deutschland und Marokko. Ab 2 €/kg, Mindestpreis 20 €, ' +
    'Abholung +10 €. Mit Sendungsnummer, QR-Code und Statusverfolgung.',
  applicationName: brand.name,
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description:
      'Transport zwischen Frankfurt/Rhein-Main und Nador. Ab 2 €/kg, Mindestpreis 20 €, ' +
      'Abholung +10 €.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#111110' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Never block zooming — it is an accessibility requirement.
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await currentLocale();
  const t = createT(locale);

  return (
    <html lang={htmlLang(locale)} dir={dir(locale)} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t('common.skipToContent')}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
