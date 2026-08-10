/**
 * Single source of truth for the brand.
 *
 * To rename the company, change the values here (and optionally the
 * NEXT_PUBLIC_BRAND_* environment variables). Nothing else in the codebase
 * hardcodes the company name.
 *
 * `trackingPrefix` is also used by the database when generating tracking
 * numbers — if you change it, update `app_settings.tracking_prefix` in
 * Supabase too (see README § "Marke umbenennen").
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'AZD Transport',
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME || 'AZD Transport (Einzelunternehmen)',
  tagline: 'Transporte zwischen Deutschland und Marokko',
  trackingPrefix: process.env.NEXT_PUBLIC_TRACKING_PREFIX || 'AZD',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'azd-transport@outlook.com',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+49 000 0000000',
  /** Digits only, international format — used for wa.me deep links. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '49000000000',
  address: {
    street: process.env.NEXT_PUBLIC_CONTACT_STREET || 'Musterstraße 1',
    zip: process.env.NEXT_PUBLIC_CONTACT_ZIP || '60311',
    city: process.env.NEXT_PUBLIC_CONTACT_CITY || 'Frankfurt am Main',
    country: 'Deutschland',
  },
} as const;

/**
 * The example shown in placeholders and error messages.
 *
 * Derived from the prefix rather than written out, because an example that
 * contradicts the numbers actually issued is worse than none: it teaches the
 * wrong shape to exactly the person who is already struggling to find their
 * shipment. The date is fixed on purpose — a rolling one would look like a
 * real number belonging to today.
 */
export const exampleTrackingNumber = `${brand.trackingPrefix}-260809-0042`;

/**
 * The public base URL. Everything that has to work when opened on someone
 * else's device is built from it: QR codes on labels, links in e-mails and the
 * bulky-goods offer links.
 *
 * Order of precedence:
 *   1. NEXT_PUBLIC_APP_URL — set this once you have a custom domain.
 *   2. RAILWAY_PUBLIC_DOMAIN — injected by Railway at runtime, so the very
 *      first deployment already produces correct links without you knowing the
 *      generated domain in advance.
 *   3. Vercel's equivalents.
 *   4. localhost, for development.
 *
 * Only ever called on the server. In a browser bundle the non-public variables
 * resolve to undefined and the chain simply falls through.
 */
const FALLBACK_URL = 'http://localhost:3000';

/**
 * Turns whatever was configured into a usable absolute URL, or returns null.
 *
 * Hosting dashboards invite the mistake of entering a bare domain
 * ("meine-app.up.railway.app") — `new URL()` throws on that, and because the
 * root layout builds `metadataBase` from this value, the whole site would go
 * down over a missing "https://". So a missing scheme is added rather than
 * treated as an error, and anything still unusable is rejected here instead of
 * crashing a page render.
 */
function normaliseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname) return null;
    return withScheme.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function appUrl(): string {
  return (
    normaliseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normaliseUrl(process.env.RAILWAY_PUBLIC_DOMAIN) ??
    normaliseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normaliseUrl(process.env.VERCEL_URL) ??
    FALLBACK_URL
  );
}
