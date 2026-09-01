import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/app-url';

/**
 * Wird pro Anfrage gerendert, nicht beim Bauen — aus demselben Grund wie die
 * Sitemap: die Domain steht erst zur Laufzeit fest.
 *
 * Es gibt nichts auszuschließen. Die Anwendung besteht ausschließlich aus
 * öffentlichen Seiten; es gibt keinen internen Bereich und keine Adresse, die
 * personenbezogene Daten anzeigt.
 */
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
