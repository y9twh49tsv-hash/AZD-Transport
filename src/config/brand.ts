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
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'MaroCargo',
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME || 'MaroCargo (Einzelunternehmen)',
  tagline: 'Transporte zwischen Deutschland und Marokko',
  trackingPrefix: process.env.NEXT_PUBLIC_TRACKING_PREFIX || 'MC',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@marocargo.de',
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
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return 'http://localhost:3000';
}
