import { appUrl } from '@/config/app-url';
import { isTodo, siteConfig } from '@/config/site';
import { faq, services } from '@/config/transfer-content';

/**
 * Strukturierte Daten für Suchmaschinen.
 *
 * Es wird ausschließlich ausgegeben, was auch auf der Seite steht und
 * bestätigt ist. Felder mit offener Angabe (Anschrift, Firmierung) bleiben
 * weg — eine erfundene `postalAddress` in schema.org ist keine Kleinigkeit:
 * Google zeigt sie in Kartenergebnissen an, und dann steht eine falsche
 * Adresse an einer Stelle, die niemand mehr kontrolliert.
 *
 * `JSON.stringify` wird über `escapeJson` geführt, damit ein `</script>` in
 * einem Text den Block nicht vorzeitig schließen kann.
 */

function escapeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function StructuredData() {
  const base = appUrl();
  const { address } = siteConfig;
  const addressKnown = !isTodo(address.street) && !isTodo(address.postalCode);

  const business = {
    '@type': 'LocalBusiness',
    '@id': `${base}/#unternehmen`,
    name: siteConfig.companyName,
    description: `${siteConfig.shortDescription} ${siteConfig.serviceArea}.`,
    url: base,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed: { '@type': 'Country', name: 'Deutschland' },
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
    '@id': `${base}/#leistung`,
    name: 'Fahrzeugüberführung auf eigener Achse',
    serviceType: 'Fahrzeugüberführung',
    description:
      'Professionelle Überführung von PKW, SUV, Sportwagen, Luxusfahrzeugen und Transportern bis 3,5 t auf eigener Achse — nicht auf Anhänger oder Autotransporter.',
    provider: { '@id': `${base}/#unternehmen` },
    areaServed: { '@type': 'Country', name: 'Deutschland' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Leistungen',
      itemListElement: services.map((item) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: item.title, description: item.text },
      })),
    },
  };

  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${base}/#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const graph = { '@context': 'https://schema.org', '@graph': [business, service, faqPage] };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJson(graph) }}
    />
  );
}
