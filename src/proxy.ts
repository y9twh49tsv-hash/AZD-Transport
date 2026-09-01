import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PATHNAME_HEADER } from '@/config/routes';

/**
 * Runs before every matching request (Next.js "proxy", formerly middleware).
 *
 * Refreshes the Supabase session cookie on every navigation and blocks
 * unauthenticated access to the protected areas early, before any page code
 * runs.
 *
 * This is a first line of defence only. Every protected page and server action
 * checks the role again on the server (`requireRole`), and row level security
 * checks it a third time in the database.
 */

const PROTECTED_PREFIXES = ['/admin', '/driver', '/konto', '/scan'];

/**
 * Der eine Hostname, unter dem die Seite laufen soll.
 *
 * Aus NEXT_PUBLIC_APP_URL abgeleitet — derselben Quelle, aus der auch die
 * QR-Codes auf den Labels, die Links in den E-Mails und die Angebotslinks
 * gebaut werden. Damit kann die Weiterleitung nicht in die eine und ein
 * gedrucktes Label in die andere Richtung zeigen.
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
 * Inhalt: Suchmaschinen werten das ab, und eine Sitzung, die unter dem einen
 * Hostnamen angemeldet ist, gilt unter dem anderen nicht — das Cookie hängt am
 * Hostnamen.
 *
 * 308 statt 302: die Weiterleitung ist dauerhaft und behält die Methode bei,
 * ein abgeschicktes Buchungsformular ginge sonst als GET verloren.
 *
 * Wichtig: das greift erst, wenn die Anfrage hier überhaupt ankommt. Steht der
 * DNS-Eintrag der Domain auf "proxied" (orange Wolke bei Cloudflare), endet sie
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

/**
 * Reicht den angefragten Pfad an das Layout weiter.
 *
 * Ein Layout kennt seinen Pfad nicht — es wird für alle darunterliegenden
 * Seiten einmal gerendert. Das Wurzellayout braucht ihn aber, um zu
 * entscheiden, ob die Seite der Sprachwahl der Paketplattform folgt oder
 * deutsch bleibt.
 */
function withPathname(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, request.nextUrl.pathname);
  return headers;
}

export default async function proxy(request: NextRequest) {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  const headers = withPathname(request);
  let response = NextResponse.next({ request: { headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without configuration there is no session to refresh; let the page render
  // its own "Supabase not configured" hint instead of crashing the edge.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request: { headers: withPathname(request) } });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (needsAuth && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — the session cookie
     * only needs refreshing on real navigations.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
