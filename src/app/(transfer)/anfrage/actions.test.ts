import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailMessage, SendResult } from '@/lib/notifications/types';

/**
 * Die Server-Action wird gegen einen ausgetauschten Versanddienst geprüft.
 *
 * Der interessante Teil ist nicht der Erfolgsfall, sondern die beiden Fälle,
 * in denen leicht gelogen wird: ein ausgefüllter Honigtopf (nach außen ein
 * Erfolg, in Wirklichkeit verworfen) und ein fehlender Versanddienst (nach
 * außen ein Fehler, obwohl der Adapter „ok“ meldet).
 */

const send = vi.fn<(message: EmailMessage) => Promise<SendResult>>();

vi.mock('@/lib/notifications/email', () => ({
  getEmailAdapter: () => ({ name: 'test', send }),
}));

const { submitTransferRequest } = await import('./actions');

const valid = {
  pickupLocation: 'Frankfurt am Main',
  dropoffLocation: 'München',
  name: 'Max Mustermann',
  phone: '0157 82034336',
  email: 'kunde@example.com',
  privacyAccepted: true,
};

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ ok: true, provider: 'test' });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('submitTransferRequest', () => {
  it('sends a valid request to the configured inbox', async () => {
    const result = await submitTransferRequest(valid);

    expect(result).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);

    const message = send.mock.calls[0][0];
    expect(message.subject).toContain('Frankfurt am Main');
    expect(message.subject).toContain('München');
    expect(message.text).toContain('Max Mustermann');
    // Antworten sollen bei der Kundschaft landen, nicht beim Versanddienst.
    expect(message.replyTo).toBe('kunde@example.com');
  });

  it('reports field errors instead of sending an incomplete request', async () => {
    const result = await submitTransferRequest({ ...valid, pickupLocation: '' });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.fieldErrors?.pickupLocation).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it('discards a filled honeypot without sending — and says nothing about it', async () => {
    const result = await submitTransferRequest({ ...valid, company: 'ACME Ltd' });

    expect(result).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('reports an error when no mail provider is configured', async () => {
    // Der Log-Adapter meldet `ok: true, skipped: true`. Das als Erfolg zu
    // quittieren hieße, jemanden auf eine Antwort warten zu lassen, die
    // niemand je gelesen hat.
    send.mockResolvedValue({ ok: true, provider: 'log', skipped: true });

    const result = await submitTransferRequest(valid);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/WhatsApp|anrufen/i);
  });

  it('reports an error when the provider rejects the message', async () => {
    send.mockResolvedValue({ ok: false, provider: 'test', error: 'domain not verified' });

    const result = await submitTransferRequest(valid);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/WhatsApp|anrufen/i);
  });

  it('survives a provider that throws', async () => {
    send.mockRejectedValue(new Error('network down'));

    const result = await submitTransferRequest(valid);

    expect(result.ok).toBe(false);
  });

  it('omits reply-to when only a phone number was given', async () => {
    await submitTransferRequest({ ...valid, email: '' });

    expect(send.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it('escapes angle brackets so a request cannot inject markup into the e-mail', async () => {
    await submitTransferRequest({ ...valid, name: '<script>alert(1)</script>' });

    const message = send.mock.calls[0][0];
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script');
  });
});
