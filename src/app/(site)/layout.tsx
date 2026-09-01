import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getSessionUser, homeRouteFor } from '@/lib/auth';
import { brand } from '@/config/brand';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { createT } from '@/lib/i18n';
import { currentLocale } from '@/lib/i18n/server';

/**
 * Die Metadaten der Paketplattform.
 *
 * Sie standen früher im Wurzellayout, als der Paketversand die ganze Website
 * war. Seit die Hauptseite die Fahrzeugüberführung ist, gehören sie hierher —
 * sonst trüge jede Seite der Überführung die Beschreibung des Paketversands.
 *
 * Die Metadaten folgen der gewählten Sprache, damit eine geteilte Seite eine
 * Vorschau in der Sprache erzeugt, in der sie gelesen wurde. Die Preise kommen
 * aus `pricingConfig` und nicht aus dem Satz, damit eine Preisänderung keine
 * veraltete Zahl im Suchergebnis stehen lässt.
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
    title: { default: title, template: `%s · ${brand.name}` },
    description: t('meta.siteDescription', prices),
    openGraph: {
      type: 'website',
      locale: t('meta.ogLocale'),
      siteName: brand.name,
      title,
      description: t('meta.ogDescription', prices),
    },
  };
}

/** Die Paketplattform bleibt hell — auch wenn die Hauptseite dunkel ist. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#111110' },
  ],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const dashboardHref = homeRouteFor(user);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader isSignedIn={!!user} dashboardHref={dashboardHref} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
