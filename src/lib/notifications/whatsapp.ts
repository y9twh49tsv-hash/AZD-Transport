import type { SendResult, WhatsAppAdapter } from './types';

/**
 * WhatsApp.
 *
 * No paid API is wired up yet, by design. Two things exist instead:
 *
 *  1. `whatsappLink()` — a wa.me deep link. Customers use it to share their
 *     tracking number, staff use it to open a chat with one tap. Costs
 *     nothing and works today.
 *
 *  2. `CloudApiAdapter` — the Meta WhatsApp Cloud API adapter, complete but
 *     inactive until WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are
 *     set. Meta requires pre-approved message templates for business-initiated
 *     conversations, so `templateName` refers to a template you register in
 *     the Meta Business Manager.
 *
 * Because both sit behind the `WhatsAppAdapter` interface, switching to
 * Twilio, 360dialog or MessageBird later means writing one class.
 */

/** Strips everything but digits — wa.me needs a bare international number. */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // 0049… and 0212… are the common local prefixes we see in Germany/Morocco.
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `49${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(phone: string, message?: string): string {
  const number = normalisePhone(phone);
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${query}`;
}

/** Share link without a recipient — opens the contact picker. */
export function whatsappShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

class NoopWhatsAppAdapter implements WhatsAppAdapter {
  readonly name = 'noop';

  async send(): Promise<SendResult> {
    return {
      ok: true,
      provider: this.name,
      skipped: true,
      error: 'WhatsApp-Versand ist nicht konfiguriert.',
    };
  }
}

class CloudApiAdapter implements WhatsAppAdapter {
  readonly name = 'meta-cloud-api';

  constructor(
    private readonly phoneNumberId: string,
    private readonly accessToken: string,
    private readonly templateName: string,
    private readonly templateLocale: string,
  ) {}

  async send(to: string, body: string): Promise<SendResult> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: normalisePhone(to),
            type: 'template',
            template: {
              name: this.templateName,
              language: { code: this.templateLocale },
              components: [
                { type: 'body', parameters: [{ type: 'text', text: body }] },
              ],
            },
          }),
        },
      );

      const payload = (await response.json().catch(() => ({}))) as {
        messages?: Array<{ id: string }>;
        error?: { message: string };
      };

      if (!response.ok) {
        return {
          ok: false,
          provider: this.name,
          error: payload.error?.message || `HTTP ${response.status}`,
        };
      }
      return { ok: true, provider: this.name, messageId: payload.messages?.[0]?.id };
    } catch (error) {
      return {
        ok: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }
}

export function getWhatsAppAdapter(): WhatsAppAdapter {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return new NoopWhatsAppAdapter();

  return new CloudApiAdapter(
    phoneNumberId,
    accessToken,
    process.env.WHATSAPP_TEMPLATE_NAME || 'shipment_update',
    process.env.WHATSAPP_TEMPLATE_LOCALE || 'de',
  );
}

export function isWhatsAppConfigured(): boolean {
  return !!process.env.WHATSAPP_PHONE_NUMBER_ID && !!process.env.WHATSAPP_ACCESS_TOKEN;
}
