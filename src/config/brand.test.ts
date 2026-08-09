import { afterEach, describe, expect, it } from 'vitest';
import { appUrl } from './brand';

const KEYS = [
  'NEXT_PUBLIC_APP_URL',
  'RAILWAY_PUBLIC_DOMAIN',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'VERCEL_URL',
] as const;

function clearAll() {
  for (const key of KEYS) delete process.env[key];
}

afterEach(clearAll);

describe('appUrl', () => {
  it('falls back to localhost when nothing is configured', () => {
    clearAll();
    expect(appUrl()).toBe('http://localhost:3000');
  });

  it('prefers the explicit setting over the host defaults', () => {
    clearAll();
    process.env.RAILWAY_PUBLIC_DOMAIN = 'auto.up.railway.app';
    process.env.NEXT_PUBLIC_APP_URL = 'https://marocargo.de';
    expect(appUrl()).toBe('https://marocargo.de');
  });

  it('uses the Railway domain when no explicit URL is set', () => {
    clearAll();
    process.env.RAILWAY_PUBLIC_DOMAIN = 'azd-transport-production.up.railway.app';
    expect(appUrl()).toBe('https://azd-transport-production.up.railway.app');
  });

  it('adds the missing scheme instead of producing an invalid URL', () => {
    // The mistake a dashboard invites: pasting a bare domain.
    clearAll();
    process.env.NEXT_PUBLIC_APP_URL = 'marocargo.de';
    expect(appUrl()).toBe('https://marocargo.de');
    expect(() => new URL(appUrl())).not.toThrow();
  });

  it('strips trailing slashes so paths never get doubled up', () => {
    clearAll();
    process.env.NEXT_PUBLIC_APP_URL = 'https://marocargo.de///';
    expect(appUrl()).toBe('https://marocargo.de');
  });

  it('ignores empty or whitespace-only values', () => {
    clearAll();
    process.env.NEXT_PUBLIC_APP_URL = '   ';
    process.env.RAILWAY_PUBLIC_DOMAIN = '';
    expect(appUrl()).toBe('http://localhost:3000');
  });

  it('never returns something that breaks new URL()', () => {
    for (const value of ['not a url', '://', 'https://', '  ', 'ht!tp://x']) {
      clearAll();
      process.env.NEXT_PUBLIC_APP_URL = value;
      expect(() => new URL(appUrl()), `input: ${value}`).not.toThrow();
    }
  });
});
