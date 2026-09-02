import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Die Seite `/cookies` behauptet etwas Nachprüfbares: dass diese Website
 * nichts auf dem Gerät der Besucher speichert und keinen fremden Server
 * anfragt.
 *
 * Das stimmt — im Browser geprüft: kein Cookie, kein localStorage, keine
 * Anfrage nach außen, nicht einmal für eine Schriftart. Aber es ist die Sorte
 * Aussage, die still falsch wird: jemand bindet eine Karte ein, ein
 * Chatfenster oder eine Schriftart von Google, und der Text auf der Seite
 * behauptet weiter das Gegenteil. Rechtlich ist das genau der Fall, in dem ein
 * fehlendes Einwilligungsbanner zum Problem wird.
 *
 * Dieser Test schlägt an, sobald im Quelltext etwas auftaucht, das speichert
 * oder nach außen geht. Er ist kein Verbot — er erzwingt nur, dass die
 * Cookie-Seite und die Datenschutzerklärung mitgeändert werden.
 */

const SOURCE = join(process.cwd(), 'src');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    if (!/\.(tsx?|css)$/.test(entry) || /\.test\.tsx?$/.test(entry)) return [];
    return [path];
  });
}

/**
 * Die Rechtstexte reden über das Thema — sie zählen nicht.
 *
 * Die Seiten selbst stehen nicht mehr auf dieser Liste: sie bestehen nur noch
 * aus einem Aufruf der Inhaltsdaten, der Text liegt in `content/legal`. Wer
 * dort etwas einbaut, das speichert, wird von diesem Test erwischt.
 */
const EXEMPT = ['content/legal/de.ts', 'content/legal/en.ts'];

function relevantFiles(): { path: string; source: string }[] {
  return sourceFiles(SOURCE)
    .filter((path) => !EXEMPT.some((exempt) => path.endsWith(exempt)))
    .map((path) => ({
      path: path.slice(SOURCE.length + 1),
      source: readFileSync(path, 'utf8'),
    }));
}

describe('Die Website speichert nichts auf dem Gerät', () => {
  const files = relevantFiles();

  it('findet überhaupt Dateien — sonst prüft der Test nichts', () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each([
    ['document.cookie', /\bdocument\s*\.\s*cookie\b/],
    ['localStorage', /\blocalStorage\b/],
    ['sessionStorage', /\bsessionStorage\b/],
    ['indexedDB', /\bindexedDB\b/],
    ['Cookies über next/headers', /from\s+'next\/headers'/],
    ['cookies() im Server-Code', /\bcookies\s*\(\s*\)/],
    ['Antwort-Cookies im Proxy', /\.cookies\s*\.\s*set\b/],
  ])('verwendet kein %s', (_name, pattern) => {
    const offenders = files.filter((file) => pattern.test(file.source)).map((file) => file.path);
    expect(offenders).toEqual([]);
  });

  it('lädt keine Schriftart und kein Skript von einem fremden Server', () => {
    // Eine eingebundene Google-Schriftart überträgt die IP-Adresse jedes
    // Besuchers an Google — das war schon Gegenstand von Abmahnungen.
    const remote =
      /https?:\/\/(?!wa\.me|schema\.org|www\.w3\.org|ec\.europa\.eu)[a-z0-9-]+\.[a-z]/i;
    const offenders = files
      .filter((file) => /\.(tsx?|css)$/.test(file.path))
      .filter((file) =>
        file.source
          .split('\n')
          // Kommentare und Zeilen mit Adressen im Fließtext zählen nicht — es
          // geht um Ressourcen, die der Browser tatsächlich anfordert.
          .some(
            (codeLine) =>
              /\b(src|href|@import|url)\s*[=(:]/.test(codeLine) && remote.test(codeLine),
          ),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });
});
