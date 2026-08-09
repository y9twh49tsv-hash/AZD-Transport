import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/brand';

/**
 * Rendered per request, not at build time: the host only reveals its domain
 * (RAILWAY_PUBLIC_DOMAIN) once the container runs. Prerendering this would
 * freeze whatever was known during the build — in practice `localhost:3000`.
 * The response is a few hundred bytes, so the cost is irrelevant.
 */
export const dynamic = 'force-dynamic';

/** Only the pages a customer should be able to find via a search engine. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const now = new Date();

  const pages: Array<{ path: string; priority: number; frequency: 'weekly' | 'monthly' | 'yearly' }> = [
    { path: '', priority: 1, frequency: 'weekly' },
    { path: '/preisrechner', priority: 0.9, frequency: 'monthly' },
    { path: '/buchen', priority: 0.9, frequency: 'monthly' },
    { path: '/tracking', priority: 0.8, frequency: 'monthly' },
    { path: '/sperrgut', priority: 0.8, frequency: 'monthly' },
    { path: '/kontakt', priority: 0.6, frequency: 'monthly' },
    { path: '/versandbedingungen', priority: 0.4, frequency: 'yearly' },
    { path: '/verbotene-waren', priority: 0.4, frequency: 'yearly' },
    { path: '/haftung', priority: 0.3, frequency: 'yearly' },
    { path: '/agb', priority: 0.3, frequency: 'yearly' },
    { path: '/datenschutz', priority: 0.3, frequency: 'yearly' },
    { path: '/impressum', priority: 0.3, frequency: 'yearly' },
  ];

  return pages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: page.frequency,
    priority: page.priority,
  }));
}
