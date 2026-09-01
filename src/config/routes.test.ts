import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes';

/**
 * Die Liste in `routes.ts` ist die Quelle der Sitemap. Eine Liste, die von
 * Hand gepflegt wird, läuft auseinander — deshalb wird sie hier gegen das
 * Dateisystem gehalten. Eine neue Seite ohne Eintrag fällt so beim Testlauf
 * auf und nicht erst dann, wenn sie in keinem Suchergebnis auftaucht.
 */
function routesOnDisk(): string[] {
  const root = join(process.cwd(), 'src/app/(transfer)');
  const found: string[] = ['/'];

  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      // Routengruppen wie (foo) tauchen in der Adresse nicht auf.
      const segment = /^\(.*\)$/.test(entry.name) ? '' : `/${entry.name}`;
      const path = `${prefix}${segment}`;
      const child = join(dir, entry.name);
      if (readdirSync(child).some((file) => /^page\.(tsx?|jsx?|mdx)$/.test(file))) {
        found.push(path || '/');
      }
      walk(child, path);
    }
  };

  walk(root, '');
  return found;
}

describe('ROUTES', () => {
  it('listet genau die Seiten, die es unter (transfer) gibt', () => {
    expect(ROUTES.map((r) => r.path).sort()).toEqual(routesOnDisk().sort());
  });

  it('enthält keinen Pfad doppelt', () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gibt der Startseite den höchsten Rang', () => {
    const home = ROUTES.find((r) => r.path === '/');
    expect(home?.priority).toBe(1);
    for (const route of ROUTES) expect(route.priority).toBeLessThanOrEqual(1);
  });

  it('beginnt jeden Pfad mit einem Schrägstrich und endet ohne', () => {
    for (const { path } of ROUTES) {
      expect(path.startsWith('/')).toBe(true);
      if (path !== '/') expect(path.endsWith('/')).toBe(false);
    }
  });
});
