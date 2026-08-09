export type NotificationTemplate =
  | 'booking_confirmation'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'departed'
  | 'arrived_morocco'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'bulky_received'
  | 'bulky_quote';

export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body. Always filled — it is the accessible fallback. */
  text: string;
  html: string;
  replyTo?: string;
};

export type SendResult = {
  ok: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  /** true when the adapter deliberately did nothing (e.g. no API key set). */
  skipped?: boolean;
};

/**
 * Contract every channel adapter implements. Adding a provider means writing
 * one of these — nothing else in the app changes.
 */
export interface EmailAdapter {
  readonly name: string;
  send(message: EmailMessage): Promise<SendResult>;
}

export interface WhatsAppAdapter {
  readonly name: string;
  send(to: string, body: string): Promise<SendResult>;
}
