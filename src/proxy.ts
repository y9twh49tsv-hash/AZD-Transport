import { NextResponse, type NextRequest } from 'next/server';

/**
 * Läuft vor jeder passenden Anfrage (Next.js „Proxy", früher Middleware).
 *
 * Übrig ist eine einzige Aufgabe: die Seite unter einem Hostnamen zu halten.
 * Es gibt keine Anmeldung mehr, keine Sitzung, die aufzufrischen wäre, und
 * keine geschützten Bereiche — die Anwendung besteht aus öffentlichen Seiten
 * und einem Anfrageformular, das per E-Mail zugestellt wird.
 */

/**
 * Der eine Hostname, unter dem die Seite laufen soll.
 *
 * Aus NEXT_PUBLIC_APP_URL abgeleitet — derselben Quelle, aus der auch die
 * Canonical-Angaben und die Sitemap gebaut werden. Damit kann die
 * Weiterleitung nicht in die eine und ein Suchergebnis in die andere Richtung
 * zeigen.
 */
function canonicalHost(): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return null;
  try {
    return new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).host;
  } catch {
    return null;
  }
}

/**
 * Schickt azd-transport.com auf www.azd-transport.com (oder umgekehrt, je nach
 * Einstellung).
 *
 * Zwei Gründe. Erstens findet ein Besucher, der die Adresse ohne www eintippt,
 * die Seite trotzdem. Zweitens gäbe es sonst zwei Adressen mit demselben
 * Inhalt, und Suchmaschinen werten das ab.
 *
 * 308 statt 302: die Weiterleitung ist dauerhaft und behält die Methode bei —
 * ein abgeschicktes Anfrageformular ginge sonst als GET verloren.
 *
 * Wichtig: das greift erst, wenn die Anfrage hier überhaupt ankommt. Steht der
 * DNS-Eintrag der Domain auf „proxied" (orange Wolke bei Cloudflare), endet sie
 * vorher mit 502 und dieser Code läuft nie.
 */
function canonicalRedirect(request: NextRequest): NextResponse | null {
  const expected = canonicalHost();
  if (!expected) return null;

  // Hinter einem Reverse Proxy — und Railway ist einer — steht im Host-Header
  // oft nicht mehr der Name, den der Besucher eingetippt hat, sondern der
  // interne Dienstname. Den ursprünglichen reicht die Edge in
  // x-forwarded-host weiter. Erst dort nachsehen, dann auf host zurückfallen;
  // die Reihenfolge ist der Unterschied zwischen einer Weiterleitung, die
  // greift, und einer, die in der Produktion still nichts tut.
  const actual = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!actual || actual === expected) return null;

  // Nur zwischen der Domain und ihrer www-Variante umleiten. Alles andere —
  // localhost, die Vorschau-Adresse von Railway, ein eigener Testhost — bleibt
  // unangetastet, sonst wäre die Anwendung außerhalb der Produktion nicht mehr
  // erreichbar.
  const bare = (host: string) => host.replace(/^www\./, '').split(':')[0];
  if (bare(actual) !== bare(expected)) return null;

  const target = request.nextUrl.clone();
  target.host = expected;
  target.protocol = 'https:';
  target.port = '';
  return NextResponse.redirect(target, 308);
}

export default function proxy(request: NextRequest) {
  return canonicalRedirect(request) ?? NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Alles außer statischen Dateien und Bildern — umgeleitet werden muss nur
     * eine echte Seitenansicht.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
