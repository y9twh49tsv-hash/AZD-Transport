import 'server-only';

import type { EmailAdapter, EmailMessage, SendResult } from './types';

/**
 * E-mail adapters.
 *
 * The provider is chosen with EMAIL_PROVIDER and talked to over plain HTTP —
 * no SDK, so swapping providers costs one small file and no dependency churn.
 *
 *   EMAIL_PROVIDER=resend    → Resend  (EMAIL_API_KEY = re_…)
 *   EMAIL_PROVIDER=postmark  → Postmark (EMAIL_API_KEY = server token)
 *   EMAIL_PROVIDER=log       → writes to the server log (default in dev)
 */

function fromAddress(): string {
  return process.env.EMAIL_FROM || 'AZD Transport <onboarding@resend.dev>';
}

/**
 * Where replies go.
 *
 * The sender domain has to be one the provider can verify, which is rarely the
 * mailbox the business actually reads. EMAIL_REPLY_TO closes that gap: mail
 * leaves through the verified domain and a customer hitting "Reply" lands in
 * the ordinary inbox.
 */
function replyToAddress(message: EmailMessage): string | undefined {
  return message.replyTo || process.env.EMAIL_REPLY_TO?.trim() || undefined;
}

/**
 * Domains nobody can prove ownership of.
 *
 * A sending provider only lets you send from a domain you have verified by DNS
 * record. Free mailbox domains belong to Microsoft, Google and the like, so a
 * verification for them can never succeed — which makes an EMAIL_FROM such as
 * "azd-transport@outlook.com" a setting that looks entirely reasonable and
 * fails on every single send with a 403.
 *
 * The failure is quiet where it hurts: the booking still works, the customer
 * sees a shipment number, and only the notification never arrives. So it is
 * worth naming before the first customer is affected.
 */
const UNVERIFIABLE_DOMAINS = [
  'outlook.com', 'outlook.de', 'hotmail.com', 'hotmail.de', 'live.com', 'live.de',
  'msn.com', 'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.de', 'ymail.com',
  'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch', 'web.de', 't-online.de', 'freenet.de',
  'arcor.de', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aol.de',
  'proton.me', 'protonmail.com', 'mail.ru', 'yandex.ru',
];

/** Pulls "a@b.de" out of both "a@b.de" and "Name <a@b.de>". */
function extractAddress(value: string): string | null {
  const match = value.match(/<([^>]+)>/);
  const candidate = (match ? match[1] : value).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null;
}

/**
 * What is wrong with the e-mail configuration, in plain German.
 *
 * Never contains the API key. Returned by /api/health so the setting can be
 * checked without sending a test message to a real customer.
 */
export function emailConfigProblems(): string[] {
  const problems: string[] = [];
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const provider = (process.env.EMAIL_PROVIDER || (apiKey ? 'resend' : 'log')).toLowerCase();

  if (!apiKey) {
    return ['EMAIL_API_KEY fehlt — E-Mails werden nur ins Serverprotokoll geschrieben'];
  }

  if (provider === 'resend' && !apiKey.startsWith('re_')) {
    problems.push('EMAIL_API_KEY sieht nicht nach einem Resend-Schlüssel aus (erwartet re_…)');
  }
  if (!['resend', 'postmark', 'log'].includes(provider)) {
    problems.push(`EMAIL_PROVIDER "${provider}" ist unbekannt (erlaubt: resend, postmark, log)`);
  }

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    problems.push('EMAIL_FROM fehlt — es wird von onboarding@resend.dev gesendet, was nur an dich selbst zustellbar ist');
  } else {
    const address = extractAddress(from);
    if (!address) {
      problems.push('EMAIL_FROM ist keine gültige Absenderadresse (erwartet: Name <info@deine-domain.de>)');
    } else {
      const domain = address.split('@')[1];
      if (UNVERIFIABLE_DOMAINS.includes(domain)) {
        problems.push(
          `EMAIL_FROM verwendet ${domain} — von einer Freemail-Adresse kann kein Versanddienst senden. ` +
            'Nimm eine eigene Domain und trage die Freemail-Adresse als EMAIL_REPLY_TO ein.',
        );
      }
    }
  }

  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  if (replyTo && !extractAddress(replyTo)) {
    problems.push('EMAIL_REPLY_TO ist keine gültige E-Mail-Adresse');
  }

  return problems;
}

/** True when a real provider is configured and nothing obvious is wrong. */
export function isEmailConfigured(): boolean {
  return !!process.env.EMAIL_API_KEY?.trim() && emailConfigProblems().length === 0;
}

class ResendAdapter implements EmailAdapter {
  readonly name = 'resend';

  constructor(private readonly apiKey: string) {}

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress(),
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          ...(replyToAddress(message) ? { reply_to: replyToAddress(message) } : {}),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
      };

      if (!response.ok) {
        return {
          ok: false,
          provider: this.name,
          error: payload.message || `HTTP ${response.status}`,
        };
      }
      return { ok: true, provider: this.name, messageId: payload.id };
    } catch (error) {
      return {
        ok: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }
}

class PostmarkAdapter implements EmailAdapter {
  readonly name = 'postmark';

  constructor(private readonly apiKey: string) {}

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          From: fromAddress(),
          To: message.to,
          Subject: message.subject,
          TextBody: message.text,
          HtmlBody: message.html,
          ...(replyToAddress(message) ? { ReplyTo: replyToAddress(message) } : {}),
          MessageStream: 'outbound',
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        MessageID?: string;
        Message?: string;
      };

      if (!response.ok) {
        return {
          ok: false,
          provider: this.name,
          error: payload.Message || `HTTP ${response.status}`,
        };
      }
      return { ok: true, provider: this.name, messageId: payload.MessageID };
    } catch (error) {
      return {
        ok: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }
}

/**
 * Development fallback. Logs the subject and recipient — never the body, which
 * contains personal data.
 */
class LogAdapter implements EmailAdapter {
  readonly name = 'log';

  async send(message: EmailMessage): Promise<SendResult> {
    console.info(
      `[mail:log] to=${maskEmail(message.to)} subject="${message.subject}" ` +
        '(kein EMAIL_API_KEY gesetzt — E-Mail wurde nicht versendet)',
    );
    return { ok: true, provider: this.name, skipped: true };
  }
}

/** "yassin@example.com" -> "y****n@example.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.length <= 2 ? local[0] ?? '' : `${local[0]}***${local[local.length - 1]}`;
  return `${visible}@${domain}`;
}

export function getEmailAdapter(): EmailAdapter {
  const apiKey = process.env.EMAIL_API_KEY;
  const provider = (process.env.EMAIL_PROVIDER || (apiKey ? 'resend' : 'log')).toLowerCase();

  if (!apiKey) return new LogAdapter();

  switch (provider) {
    case 'resend':
      return new ResendAdapter(apiKey);
    case 'postmark':
      return new PostmarkAdapter(apiKey);
    default:
      return new LogAdapter();
  }
}
