import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/brand';

/**
 * Rendered per request, not at build time: the host only reveals its domain
 * (RAILWAY_PUBLIC_DOMAIN) once the container runs. Prerendering this would
 * freeze whatever was known during the build — in practice `localhost:3000`.
 * The response is a few hundred bytes, so the cost is irrelevant.
 */
export const dynamic = 'force-dynamic';

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
