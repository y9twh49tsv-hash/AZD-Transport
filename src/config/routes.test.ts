import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TRANSFER_PATHS, isTransferPath } from './routes';

/**
 * Die Liste in `routes.ts` ist der einzige Ort, an dem steht, welche Seiten
 * deutschsprachig bleiben. Eine Liste, die von Hand gepflegt wird, läuft
 * auseinander — deshalb wird sie hier gegen das Dateisystem gehalten.
 */
function transferRoutesOnDisk(): string[] {
  const root = join(process.cwd(), 'src/app/(transfer)');
  const found: string[] = ['/'];

  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      // Routengruppen wie (foo) tauchen in der Adresse nicht auf.
      const segment = /^\(.*\)$/.test(entry.name) ? '' : `/${entry.name}`;
      const path = `${prefix}${segment}`;
      const child = join(dir, entry.name);
      const files = readdirSync(child);
      if (files.some((file) => /^page\.(tsx?|jsx?|mdx)$/.test(file))) found.push(path || '/');
      walk(child, path);
    }
  };

  walk(root, '');
  return found;
}

describe('TRANSFER_PATHS', () => {
  it('lists exactly the pages that exist under (transfer)', () => {
    expect([...TRANSFER_PATHS].sort()).toEqual(transferRoutesOnDisk().sort());
  });
});

describe('isTransferPath', () => {
  it('recognises every listed path', () => {
    for (const path of TRANSFER_PATHS) expect(isTransferPath(path)).toBe(true);
  });

  it('ignores a trailing slash and a query string', () => {
    expect(isTransferPath('/anfrage/')).toBe(true);
    expect(isTransferPath('/anfrage?kunde=gewerblich')).toBe(true);
    expect(isTransferPath('/')).toBe(true);
  });

  it('rejects the parcel platform and the internal areas', () => {
    for (const path of [
      '/pakete',
      '/pakete/impressum',
      '/buchen',
      '/tracking/AZD-260812-0001',
      '/admin',
      '/driver',
      '/konto',
    ]) {
      expect(isTransferPath(path)).toBe(false);
    }
  });

  it('rejects a missing header rather than guessing', () => {
    expect(isTransferPath(null)).toBe(false);
    expect(isTransferPath(undefined)).toBe(false);
    expect(isTransferPath('')).toBe(false);
  });

  it('does not match a path that merely starts the same way', () => {
    expect(isTransferPath('/agb-alt')).toBe(false);
    expect(isTransferPath('/impressum/extra')).toBe(false);
  });
});
