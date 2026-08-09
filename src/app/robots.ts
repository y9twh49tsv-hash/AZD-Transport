import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/brand';

/**
 * Keeps every non-public area out of search results.
 *
 * `/tracking/*` is excluded on purpose: a tracking number is not a secret, but
 * an indexed shipment page would let anyone browse other people's shipments
 * through a search engine. The tracking entry page itself stays indexable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/driver',
          '/konto',
          '/scan',
          '/angebot',
          '/login',
          '/registrieren',
          '/auth',
          '/tracking/',
          '/kein-zugriff',
        ],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
