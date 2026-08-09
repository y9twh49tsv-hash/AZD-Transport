import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getEmailAdapter, maskEmail } from './email';
import { getWhatsAppAdapter, isWhatsAppConfigured } from './whatsapp';
import {
  buildBulkyEmail,
  buildShipmentEmail,
  buildShipmentWhatsAppText,
  type BulkyNotificationContext,
  type ShipmentNotificationContext,
} from './templates';
import type { NotificationTemplate, SendResult } from './types';

/**
 * The notification service.
 *
 * Every caller uses one of the `send*` helpers below. They pick the channels,
 * build the message from a template, hand it to the configured adapter and
 * write one `notification_logs` row per attempt.
 *
 * Failures never bubble up into the calling flow: a booking must not fail
 * because an e-mail provider is down.
 */

type Channels = { email?: string | null; whatsapp?: string | null };

async function logAttempt(input: {
  shipmentId?: string | null;
  bulkyRequestId?: string | null;
  channel: 'email' | 'whatsapp' | 'sms';
  template: string;
  recipient: string;
  subject?: string | null;
  result: SendResult;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('notification_logs').insert({
      shipment_id: input.shipmentId ?? null,
      bulky_request_id: input.bulkyRequestId ?? null,
      channel: input.channel,
      template: input.template,
      // Stored for support; never written to application logs in clear text.
      recipient: input.recipient,
      subject: input.subject ?? null,
      status: input.result.skipped ? 'skipped' : input.result.ok ? 'sent' : 'failed',
      provider: input.result.provider,
      provider_message_id: input.result.messageId ?? null,
      error: input.result.error ?? null,
    });
  } catch (error) {
    console.error('[notifications] Log konnte nicht geschrieben werden:', error);
  }
}

async function deliverShipment(
  template: NotificationTemplate,
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string | null,
): Promise<void> {
  if (channels.email) {
    const message = buildShipmentEmail(template, channels.email, ctx);
    const result = await getEmailAdapter().send(message);
    if (!result.ok) {
      console.error(
        `[notifications] E-Mail "${template}" an ${maskEmail(channels.email)} fehlgeschlagen: ${result.error}`,
      );
    }
    await logAttempt({
      shipmentId,
      channel: 'email',
      template,
      recipient: channels.email,
      subject: message.subject,
      result,
    });
  }

  if (channels.whatsapp && isWhatsAppConfigured()) {
    const body = buildShipmentWhatsAppText(template, ctx);
    const result = await getWhatsAppAdapter().send(channels.whatsapp, body);
    await logAttempt({
      shipmentId,
      channel: 'whatsapp',
      template,
      recipient: channels.whatsapp,
      result,
    });
  }
}

// --- Public API -------------------------------------------------------------

export async function sendBookingConfirmation(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('booking_confirmation', channels, ctx, shipmentId);
}

export async function sendPickupScheduled(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('pickup_scheduled', channels, ctx, shipmentId);
}

export async function sendPickedUp(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('picked_up', channels, ctx, shipmentId);
}

export async function sendDeparted(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('departed', channels, ctx, shipmentId);
}

export async function sendArrivedMorocco(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('arrived_morocco', channels, ctx, shipmentId);
}

export async function sendOutForDelivery(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('out_for_delivery', channels, ctx, shipmentId);
}

export async function sendDelivered(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('delivered', channels, ctx, shipmentId);
}

export async function sendException(
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId?: string,
) {
  await deliverShipment('exception', channels, ctx, shipmentId);
}

export async function sendBulkyRequestReceived(
  email: string | null | undefined,
  ctx: BulkyNotificationContext,
  requestId: string,
) {
  if (!email) return;
  const message = buildBulkyEmail('bulky_received', email, ctx);
  const result = await getEmailAdapter().send(message);
  await logAttempt({
    bulkyRequestId: requestId,
    channel: 'email',
    template: 'bulky_received',
    recipient: email,
    subject: message.subject,
    result,
  });
}

export async function sendBulkyQuote(
  email: string | null | undefined,
  ctx: BulkyNotificationContext,
  requestId: string,
) {
  if (!email) return;
  const message = buildBulkyEmail('bulky_quote', email, ctx);
  const result = await getEmailAdapter().send(message);
  await logAttempt({
    bulkyRequestId: requestId,
    channel: 'email',
    template: 'bulky_quote',
    recipient: email,
    subject: message.subject,
    result,
  });
}

/**
 * Maps a status change onto the right customer notification.
 * Returns silently for statuses that do not warrant a message.
 */
export async function notifyStatusChange(
  status: string,
  channels: Channels,
  ctx: ShipmentNotificationContext,
  shipmentId: string,
): Promise<void> {
  const map: Record<string, NotificationTemplate> = {
    PICKUP_SCHEDULED: 'pickup_scheduled',
    PICKED_UP: 'picked_up',
    DEPARTED_GERMANY: 'departed',
    ARRIVED_MOROCCO: 'arrived_morocco',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    EXCEPTION: 'exception',
  };

  const template = map[status];
  if (!template) return;

  await deliverShipment(template, channels, ctx, shipmentId);
}

export { whatsappLink, whatsappShareLink } from './whatsapp';
