import type { Metadata, Viewport } from 'next';
import './globals.css';
import { brand, appUrl } from '@/config/brand';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { createT, dir, htmlLang } from '@/lib/i18n';
import { currentLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/client';

/**
 * Metadata follows the chosen language, so a French visitor who shares the page
 * gets a French preview card. The prices come from `pricingConfig` rather than
 * from the sentence, so a price change cannot leave a stale number in the
 * search-engine snippet.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = createT(await currentLocale());
  const prices = {
    perKg: formatCents(pricingConfig.pricePerKgCents),
    minimum: formatCents(pricingConfig.minimumPriceCents),
    pickup: formatCents(pricingConfig.pickupFeeCents),
  };
  const title = `${brand.name} — ${t('meta.tagline')}`;

  return {
    metadataBase: new URL(appUrl()),
    title: {
      default: title,
      template: `%s · ${brand.name}`,
    },
    description: t('meta.siteDescription', prices),
    applicationName: brand.name,
    formatDetection: { telephone: true, address: false, email: false },
    openGraph: {
      type: 'website',
      locale: t('meta.ogLocale'),
      siteName: brand.name,
      title,
      description: t('meta.ogDescription', prices),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

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
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t('common.skipToContent')}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
