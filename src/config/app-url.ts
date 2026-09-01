/**
 * Die öffentliche Adresse der Anwendung.
 *
 * Alles, was auf einem fremden Gerät funktionieren muss, wird daraus gebaut:
 * die Canonical-Angaben, die OpenGraph-Vorschau, die Sitemap und die
 * strukturierten Daten.
 *
 * Reihenfolge:
 *   1. NEXT_PUBLIC_APP_URL — die eigene Domain, sobald sie verbunden ist.
 *   2. RAILWAY_PUBLIC_DOMAIN — von Railway zur Laufzeit gesetzt, damit schon
 *      die allererste Bereitstellung richtige Links erzeugt, ohne dass man die
 *      generierte Adresse vorher kennen muss.
 *   3. Die Entsprechungen bei Vercel.
 *   4. localhost, für die Entwicklung.
 *
 * Wird nur auf dem Server aufgerufen. In einem Browser-Bündel sind die nicht
 * öffentlichen Variablen undefiniert, die Kette fällt dann einfach durch.
 */

const FALLBACK_URL = 'http://localhost:3000';

/**
 * Macht aus dem, was konfiguriert wurde, eine benutzbare absolute Adresse —
 * oder gibt null zurück.
 *
 * Der Fehler, zu dem jedes Hosting-Dashboard einlädt, ist die nackte Domain
 * ("meine-app.up.railway.app"). `new URL()` wirft darauf, und weil das
 * Wurzellayout daraus `metadataBase` baut, wäre die ganze Seite wegen eines
 * fehlenden "https://" unten. Ein fehlendes Schema wird deshalb ergänzt statt
 * als Fehler behandelt, und was danach immer noch unbrauchbar ist, wird hier
 * abgewiesen, statt eine Seite beim Rendern abstürzen zu lassen.
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
