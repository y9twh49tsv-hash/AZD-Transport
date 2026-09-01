import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/app-url';
import { ROUTES } from '@/config/routes';

/**
 * Wird pro Anfrage gerendert, nicht beim Bauen: der Host gibt seine Domain
 * (RAILWAY_PUBLIC_DOMAIN) erst preis, wenn der Container läuft. Vorab
 * erzeugen würde festschreiben, was während des Builds bekannt war — in der
 * Praxis `localhost:3000`. Die Antwort sind ein paar hundert Byte, der Aufwand
 * ist also belanglos.
 */
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const now = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
