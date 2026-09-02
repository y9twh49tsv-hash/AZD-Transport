import type { MetadataRoute } from 'next';
import { appUrl } from '@/config/app-url';
import { PAGES } from '@/content';

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
  const url = (path: string) => `${base}${path === '/' ? '' : path}`;

  /*
    Jede Seite steht zweimal drin, einmal je Sprache, und jeder Eintrag nennt
    über `alternates.languages` sein Gegenstück. Ohne diese Verweise sind zwei
    Übersetzungen für eine Suchmaschine zwei konkurrierende Seiten: sie sucht
    sich eine aus, und die andere verschwindet aus dem Index. Dass beide
    erreichbar bleiben, merkt man dabei nicht — es fällt nur der Verkehr weg,
    den es nie gab.
  */
  return PAGES.flatMap((page) => {
    const languages = { de: url(page.de), en: url(page.en) };

    return [
      {
        url: url(page.de),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      },
      {
        url: url(page.en),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        // Die englische Fassung ist die Übersetzung, nicht das Original.
        priority: Number((page.priority * 0.9).toFixed(2)),
        alternates: { languages },
      },
    ];
  });
}
