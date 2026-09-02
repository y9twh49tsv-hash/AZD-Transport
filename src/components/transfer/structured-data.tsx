import { appUrl } from '@/config/app-url';
import { isTodo, siteConfig } from '@/config/site';
import { content, pagePath, type Locale } from '@/content';

/**
 * Strukturierte Daten für Suchmaschinen.
 *
 * Es wird ausschließlich ausgegeben, was auch auf der Seite steht und
 * bestätigt ist. Felder mit offener Angabe (Anschrift, Firmierung) bleiben
 * weg — eine erfundene `postalAddress` in schema.org ist keine Kleinigkeit:
 * Google zeigt sie in Kartenergebnissen an, und dann steht eine falsche
 * Adresse an einer Stelle, die niemand mehr kontrolliert.
 *
 * Die Kennungen (`@id`) hängen an der Sprache: sonst behaupteten die deutsche
 * und die englische Startseite, dieselbe FAQ-Seite zu sein, und eine der
 * beiden Fassungen fiele aus dem Index.
 *
 * `JSON.stringify` wird über `escapeJson` geführt, damit ein `</script>` in
 * einem Text den Block nicht vorzeitig schließen kann.
 */

function escapeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function StructuredData({ locale }: { locale: Locale }) {
  const base = appUrl();
  const t = content(locale);
  const { address } = siteConfig;
  const addressKnown = !isTodo(address.street) && !isTodo(address.postalCode);

  const home = `${base}${pagePath('home', locale) === '/' ? '' : pagePath('home', locale)}`;
  const areaServed = { '@type': 'Country', name: t.seo.countryName } as const;

  const business = {
    '@type': 'LocalBusiness',
    '@id': `${home}/#unternehmen`,
    name: siteConfig.companyName,
    description: `${t.company.shortDescription} ${t.company.serviceArea}.`,
    url: home,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed,
    ...(addressKnown
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address.street,
            postalCode: address.postalCode,
            addressLocality: address.city,
            addressCountry: 'DE',
          },
        }
      : {
          // Ohne bestätigte Straße bleibt nur der Ort. Das ist zulässig und
          // besser, als eine Hausnummer zu erfinden.
          address: {
            '@type': 'PostalAddress',
            addressLocality: address.city,
            addressCountry: 'DE',
          },
        }),
  };

  const service = {
    '@type': 'Service',
    '@id': `${home}/#leistung`,
    name: t.seo.serviceName,
    serviceType: t.seo.serviceType,
    description: t.seo.serviceDescription,
    provider: { '@id': `${home}/#unternehmen` },
    areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.seo.offerCatalogName,
      itemListElement: t.services.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.title,
          description: item.text,
        },
      })),
    },
  };

  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${home}/#faq`,
    inLanguage: locale,
    mainEntity: t.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [business, service, faqPage],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJson(graph) }} />
  );
}
