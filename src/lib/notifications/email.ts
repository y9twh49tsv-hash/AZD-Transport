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
  return process.env.EMAIL_FROM || 'MaroCargo <onboarding@resend.dev>';
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
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
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
          ...(message.replyTo ? { ReplyTo: message.replyTo } : {}),
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
