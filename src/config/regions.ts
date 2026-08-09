/**
 * Service area. Adding a city here makes it selectable in the calculator,
 * the booking flow and the bulky-goods request — no other change required.
 */

export const COUNTRIES = ['DE', 'MA'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const countryLabels: Record<CountryCode, string> = {
  DE: 'Deutschland',
  MA: 'Marokko',
};

export const countryFlags: Record<CountryCode, string> = {
  DE: '🇩🇪',
  MA: '🇲🇦',
};

export type City = {
  /** Stable slug stored in the database */
  slug: string;
  name: string;
  country: CountryCode;
  /** Region shown as a hint under the city name */
  region?: string;
  /** false = visible but marked "auf Anfrage" (not yet a scheduled stop) */
  active: boolean;
};

export const cities: City[] = [
  // --- Deutschland: Start Rhein-Main ---
  { slug: 'frankfurt-am-main', name: 'Frankfurt am Main', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'offenbach', name: 'Offenbach am Main', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'hanau', name: 'Hanau', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'wiesbaden', name: 'Wiesbaden', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'mainz', name: 'Mainz', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'darmstadt', name: 'Darmstadt', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'ruesselsheim', name: 'Rüsselsheim', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'bad-homburg', name: 'Bad Homburg', country: 'DE', region: 'Rhein-Main', active: true },
  { slug: 'giessen', name: 'Gießen', country: 'DE', region: 'Hessen', active: true },
  { slug: 'kassel', name: 'Kassel', country: 'DE', region: 'Hessen', active: false },
  { slug: 'koeln', name: 'Köln', country: 'DE', region: 'NRW', active: false },
  { slug: 'duesseldorf', name: 'Düsseldorf', country: 'DE', region: 'NRW', active: false },
  { slug: 'stuttgart', name: 'Stuttgart', country: 'DE', region: 'Baden-Württemberg', active: false },

  // --- Marokko: Start Nador & Umgebung ---
  { slug: 'nador', name: 'Nador', country: 'MA', region: 'Oriental', active: true },
  { slug: 'beni-ensar', name: 'Beni Ensar', country: 'MA', region: 'Nador', active: true },
  { slug: 'selouane', name: 'Selouane', country: 'MA', region: 'Nador', active: true },
  { slug: 'zeghanghane', name: 'Zeghanghane', country: 'MA', region: 'Nador', active: true },
  { slug: 'al-aroui', name: 'Al Aroui', country: 'MA', region: 'Nador', active: true },
  { slug: 'driouch', name: 'Driouch', country: 'MA', region: 'Oriental', active: true },
  { slug: 'berkane', name: 'Berkane', country: 'MA', region: 'Oriental', active: true },
  { slug: 'oujda', name: 'Oujda', country: 'MA', region: 'Oriental', active: true },
  { slug: 'al-hoceima', name: 'Al Hoceïma', country: 'MA', region: 'Tanger-Tétouan', active: false },
  { slug: 'fes', name: 'Fès', country: 'MA', region: 'Fès-Meknès', active: false },
  { slug: 'casablanca', name: 'Casablanca', country: 'MA', region: 'Casablanca-Settat', active: false },
];

export function citiesByCountry(country: CountryCode): City[] {
  return cities.filter((c) => c.country === country);
}

export function findCity(slug: string | null | undefined): City | undefined {
  if (!slug) return undefined;
  return cities.find((c) => c.slug === slug);
}

export function cityName(slug: string | null | undefined): string {
  return findCity(slug)?.name ?? (slug ?? '—');
}

export function isValidCityForCountry(slug: string, country: CountryCode): boolean {
  const city = findCity(slug);
  return !!city && city.country === country;
}

/** "Frankfurt am Main → Nador" */
export function routeLabel(originSlug: string, destinationSlug: string): string {
  return `${cityName(originSlug)} → ${cityName(destinationSlug)}`;
}
