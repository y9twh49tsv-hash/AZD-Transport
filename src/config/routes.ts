/**
 * Welche Adressen zur Hauptseite (Fahrzeugüberführung) gehören.
 *
 * Gebraucht wird das an einer einzigen, aber wichtigen Stelle: das
 * Wurzellayout setzt `lang` und `dir` am <html>-Element aus dem Sprach-Cookie
 * der Paketplattform. Wer dort auf Arabisch umgestellt hat, bekäme sonst die
 * deutschsprachige Überführungsseite als arabisches Dokument von rechts nach
 * links ausgeliefert.
 *
 * Die Liste ist abgeschlossen und wird von `routes.test.ts` gegen den
 * tatsächlichen Inhalt von `src/app/(transfer)` geprüft — eine neue Seite in
 * dieser Gruppe, die hier fehlt, lässt den Test fehlschlagen.
 */
export const TRANSFER_PATHS = [
  '/',
  '/anfrage',
  '/impressum',
  '/datenschutz',
  '/agb',
  '/widerruf',
] as const;

/** Der Header, in dem `proxy.ts` den Pfad an das Layout weiterreicht. */
export const PATHNAME_HEADER = 'x-pathname';

export function isTransferPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  // Ein abschließender Schrägstrich und eine Suchanfrage sind derselbe Pfad.
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return (TRANSFER_PATHS as readonly string[]).includes(path);
}
