/**
 * Alle öffentlichen Adressen der Website — an einer Stelle.
 *
 * Die Liste speist die Sitemap. Sie von Hand zu pflegen wäre die Sorte
 * Aufgabe, die zuverlässig vergessen wird: eine neue Seite entsteht, taucht
 * aber in keiner Sitemap auf, und niemand merkt es, weil nichts kaputtgeht.
 * `routes.test.ts` hält sie deshalb gegen den tatsächlichen Inhalt von
 * `src/app/(transfer)` — eine Seite ohne Eintrag lässt den Test fehlschlagen.
 */

export type Route = {
  path: string;
  /** Rangfolge in der Sitemap: 1 ist die Startseite, Rechtstexte sind niedrig. */
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
};

export const ROUTES: Route[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/anfrage', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/agb', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/widerruf', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/datenschutz', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/impressum', priority: 0.3, changeFrequency: 'yearly' },
];
