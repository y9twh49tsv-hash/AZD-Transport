import { afterEach, describe, expect, it } from 'vitest';
import { emailConfigProblems, isEmailConfigured, maskEmail } from './email';

const KEYS = ['EMAIL_API_KEY', 'EMAIL_PROVIDER', 'EMAIL_FROM', 'EMAIL_REPLY_TO'] as const;

function set(values: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) process.env[key] = value;
}

afterEach(() => set({}));

describe('emailConfigProblems', () => {
  it('says so plainly when no provider is configured at all', () => {
    set({});
    expect(emailConfigProblems()).toEqual([expect.stringContaining('EMAIL_API_KEY fehlt')]);
    expect(isEmailConfigured()).toBe(false);
  });

  it('accepts a complete Resend setup', () => {
    set({
      EMAIL_API_KEY: 're_AbCdEfGh_1234567890',
      EMAIL_PROVIDER: 'resend',
      EMAIL_FROM: 'AZD Transport <info@azd-transport.de>',
      EMAIL_REPLY_TO: 'azd-transport@outlook.com',
    });
    expect(emailConfigProblems()).toEqual([]);
    expect(isEmailConfigured()).toBe(true);
  });

  /**
   * The setting that looks right and silently never delivers: a sending
   * provider can only send from a domain verified by DNS, and nobody can verify
   * outlook.com. Every send fails with a 403 while bookings keep working, so
   * without this check the first sign of trouble is a customer who never got
   * their shipment number.
   */
  it.each([
    'azd-transport@outlook.com',
    'AZD Transport <azd-transport@outlook.com>',
    'info@gmail.com',
    'kontakt@web.de',
    'post@t-online.de',
    'me@icloud.com',
  ])('rejects the freemail sender %j', (from) => {
    set({ EMAIL_API_KEY: 're_x1234567890', EMAIL_FROM: from });
    const problems = emailConfigProblems();
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('EMAIL_FROM');
    expect(problems[0]).toContain('EMAIL_REPLY_TO');
  });

  it('allows a freemail address as the reply target', () => {
    // Genau der Aufbau, der funktioniert: Versand über die eigene Domain,
    // Antworten landen im gewohnten Postfach.
    set({
      EMAIL_API_KEY: 're_x1234567890',
      EMAIL_FROM: 'AZD Transport <info@azd-transport.de>',
      EMAIL_REPLY_TO: 'azd-transport@outlook.com',
    });
    expect(emailConfigProblems()).toEqual([]);
  });

  it('warns that the test sender only reaches your own inbox', () => {
    set({ EMAIL_API_KEY: 're_x1234567890' });
    expect(emailConfigProblems()).toEqual([expect.stringContaining('EMAIL_FROM fehlt')]);
  });

  it('notices a key that belongs to a different provider', () => {
    set({ EMAIL_API_KEY: 'pm_abcdefghijkl', EMAIL_FROM: 'A <a@azd-transport.de>' });
    expect(emailConfigProblems()).toEqual([expect.stringContaining('Resend-Schlüssel')]);
  });

  it('accepts a Postmark token when Postmark is the provider', () => {
    set({
      EMAIL_API_KEY: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      EMAIL_PROVIDER: 'postmark',
      EMAIL_FROM: 'A <a@azd-transport.de>',
    });
    expect(emailConfigProblems()).toEqual([]);
  });

  it('rejects a malformed sender and reply address', () => {
    set({ EMAIL_API_KEY: 're_x1234567890', EMAIL_FROM: 'AZD Transport' });
    expect(emailConfigProblems()).toEqual([expect.stringContaining('gültige Absenderadresse')]);

    set({
      EMAIL_API_KEY: 're_x1234567890',
      EMAIL_FROM: 'A <a@azd-transport.de>',
      EMAIL_REPLY_TO: 'kein-postfach',
    });
    expect(emailConfigProblems()).toEqual([expect.stringContaining('EMAIL_REPLY_TO')]);
  });

  it('never echoes the API key', () => {
    set({ EMAIL_API_KEY: 'pm_geheim_123456', EMAIL_FROM: 'a@outlook.com' });
    expect(emailConfigProblems().join(' ')).not.toContain('geheim');
  });
});

describe('maskEmail', () => {
  it('keeps the domain readable and hides the mailbox', () => {
    expect(maskEmail('mehdi90@outlook.de')).toBe('m***0@outlook.de');
    expect(maskEmail('ab@x.de')).toBe('a@x.de');
    expect(maskEmail('kaputt')).toBe('***');
  });
});
