'use server';

import { headers } from 'next/headers';
import { bulkyRequestSchema, signedUploadSchema } from '@/lib/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { checkRateLimit, clientKey, RATE_LIMITS } from '@/lib/rate-limit';
import { sendBulkyRequestReceived } from '@/lib/notifications';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export type SignedUploadResult =
  | { ok: true; path: string; token: string; bucket: string }
  | { ok: false; error: string };

/**
 * Issues a short-lived signed upload URL so the browser can send the file
 * straight to Supabase Storage.
 *
 * Why not upload through this server action: Vercel caps server action bodies
 * (1 MB by default) and every megabyte would run through a serverless
 * function. Direct-to-storage keeps phone photos working and costs nothing.
 *
 * The client never chooses the path — it is generated here from random bytes,
 * so one visitor cannot overwrite another's file or guess where it landed.
 */
export async function createSignedUpload(input: unknown): Promise<SignedUploadResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Die Datenbank ist noch nicht konfiguriert.' };
  }

  const parsed = signedUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Datei.' };
  }

  // The public form may only ever write into the bulky-photos bucket.
  if (parsed.data.bucket !== 'bulky-photos' || parsed.data.kind !== 'bulky_photo') {
    return { ok: false, error: 'Für diesen Upload fehlt die Berechtigung.' };
  }

  const requestHeaders = await headers();
  const limit = checkRateLimit(
    clientKey(requestHeaders, 'upload'),
    RATE_LIMITS.upload.limit,
    RATE_LIMITS.upload.windowMs,
  );
  if (!limit.allowed) {
    return { ok: false, error: 'Zu viele Uploads. Bitte warte einen Moment.' };
  }

  const extension = EXTENSION_BY_MIME[parsed.data.mimeType] ?? 'bin';
  const now = new Date();
  const folder = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('bulky-photos')
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('[upload] Signierte Upload-URL fehlgeschlagen:', error?.message);
    return { ok: false, error: 'Der Upload konnte nicht vorbereitet werden.' };
  }

  return { ok: true, path: data.path, token: data.token, bucket: 'bulky-photos' };
}

export type BulkyResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createBulkyRequest(input: unknown): Promise<BulkyResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'Die Datenbank ist noch nicht konfiguriert. Bitte hinterlege die Supabase-Zugangsdaten.',
    };
  }

  const parsed = bulkyRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: 'Bitte prüfe deine Eingaben.', fieldErrors };
  }

  const data = parsed.data;

  const requestHeaders = await headers();
  const limit = checkRateLimit(
    clientKey(requestHeaders, 'bulky'),
    RATE_LIMITS.bulky.limit,
    RATE_LIMITS.bulky.windowMs,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Zu viele Anfragen. Bitte versuche es in ${limit.retryAfterSeconds} Sekunden erneut.`,
    };
  }

  const supabase = createAdminClient();

  const { data: request, error } = await supabase
    .from('bulky_item_requests')
    .insert({
      origin_country: data.originCountry,
      origin_city: data.originCity,
      destination_country: data.destinationCountry,
      destination_city: data.destinationCity,
      item_type: data.itemType,
      item_description: data.itemDescription,
      approx_weight_kg: data.approxWeightKg,
      length_cm: data.lengthCm,
      width_cm: data.widthCm,
      height_cm: data.heightCm,
      contact_first_name: data.contactFirstName,
      contact_last_name: data.contactLastName,
      phone: data.phone,
      email: data.email,
      pickup_requested: data.pickupRequested,
      notes: data.notes,
      status: 'NEW',
    })
    .select('id, reference')
    .single();

  if (error || !request) {
    console.error('[bulky] Anfrage konnte nicht gespeichert werden:', error?.message);
    return { ok: false, error: 'Die Anfrage konnte nicht gespeichert werden. Bitte versuche es erneut.' };
  }

  // Attach the photos that were uploaded before the form was submitted.
  if (data.photoPaths.length > 0) {
    const { error: attachError } = await supabase.from('attachments').insert(
      data.photoPaths.map((path) => ({
        bulky_request_id: request.id,
        kind: 'bulky_photo' as const,
        bucket: 'bulky-photos',
        path,
      })),
    );
    if (attachError) {
      console.error('[bulky] Fotos konnten nicht verknüpft werden:', attachError.message);
    }
  }

  try {
    await sendBulkyRequestReceived(
      data.email,
      {
        reference: request.reference,
        contactFirstName: data.contactFirstName,
        itemType: data.itemType,
      },
      request.id,
    );
  } catch (notifyError) {
    console.error('[bulky] Eingangsbestätigung fehlgeschlagen:', notifyError);
  }

  return { ok: true, reference: request.reference };
}

export type OfferDecision = { ok: true; status: 'ACCEPTED' | 'REJECTED' } | { ok: false; error: string };

/**
 * Customer decision on a quote, reached through the unguessable token link.
 *
 * Accepting creates the actual shipment with the quoted flat price. Because
 * the token is the only credential, the action never reveals whether a token
 * exists beyond the generic error message.
 */
export async function decideOnOffer(token: string, decision: 'accept' | 'reject'): Promise<OfferDecision> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Die Datenbank ist noch nicht konfiguriert.' };
  }
  if (typeof token !== 'string' || !/^[a-f0-9]{16,64}$/.test(token)) {
    return { ok: false, error: 'Dieser Angebotslink ist ungültig.' };
  }

  const requestHeaders = await headers();
  const limit = checkRateLimit(
    clientKey(requestHeaders, 'offer'),
    RATE_LIMITS.bulky.limit,
    RATE_LIMITS.bulky.windowMs,
  );
  if (!limit.allowed) {
    return { ok: false, error: 'Zu viele Versuche. Bitte warte einen Moment.' };
  }

  const supabase = createAdminClient();
  const { data: request } = await supabase
    .from('bulky_item_requests')
    .select('*')
    .eq('public_token', token)
    .maybeSingle();

  if (!request) return { ok: false, error: 'Dieser Angebotslink ist ungültig.' };
  if (request.status !== 'QUOTED') {
    return { ok: false, error: 'Dieses Angebot kann nicht mehr bearbeitet werden.' };
  }

  if (decision === 'reject') {
    await supabase
      .from('bulky_item_requests')
      .update({ status: 'REJECTED', rejected_at: new Date().toISOString() })
      .eq('id', request.id);
    return { ok: true, status: 'REJECTED' };
  }

  const now = new Date().toISOString();
  const price = request.quoted_price_cents ?? 0;

  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments')
    .insert({
      shipment_type: 'bulky',
      status: 'BOOKED',

      sender_first_name: request.contact_first_name,
      sender_last_name: request.contact_last_name,
      sender_phone: request.phone,
      sender_email: request.email,
      sender_address: 'Wird bei der Abholung erfasst',
      sender_city: request.origin_city,
      sender_country: request.origin_country,

      recipient_first_name: request.contact_first_name,
      recipient_last_name: request.contact_last_name,
      recipient_phone: request.phone,
      recipient_address: 'Wird noch mitgeteilt',
      recipient_city: request.destination_city,
      recipient_country: request.destination_country,

      origin_country: request.origin_country,
      origin_city: request.origin_city,
      destination_country: request.destination_country,
      destination_city: request.destination_city,

      weight_kg: request.approx_weight_kg ?? 1,
      piece_count: 1,
      content_type: request.item_type,
      description: request.item_description,

      pickup_requested: request.pickup_requested,

      // Flat price from the quote — the per-kg formula never applies to bulky goods.
      price_base_cents: price,
      pickup_fee_cents: 0,
      price_total_cents: price,
      payment_status: 'unpaid',

      terms_accepted_at: now,
      prohibited_confirmed_at: now,
      internal_notes: `Aus Sperrgut-Anfrage ${request.reference} entstanden.`,
    })
    .select('id, tracking_number')
    .single();

  if (shipmentError || !shipment) {
    console.error('[offer] Sendung konnte nicht erstellt werden:', shipmentError?.message);
    return { ok: false, error: 'Die Sendung konnte nicht angelegt werden. Bitte melde dich bei uns.' };
  }

  await supabase
    .from('bulky_item_requests')
    .update({ status: 'ACCEPTED', accepted_at: now, shipment_id: shipment.id })
    .eq('id', request.id);

  // Move the customer's photos over to the new shipment so the driver sees them.
  await supabase
    .from('attachments')
    .update({ shipment_id: shipment.id, bulky_request_id: null })
    .eq('bulky_request_id', request.id);

  if (request.email) {
    const { sendBookingConfirmation } = await import('@/lib/notifications');
    try {
      await sendBookingConfirmation(
        { email: request.email, whatsapp: request.phone },
        {
          trackingNumber: shipment.tracking_number,
          customerFirstName: request.contact_first_name,
          originCity: request.origin_city,
          destinationCity: request.destination_city,
          weightKg: request.approx_weight_kg,
          pieceCount: 1,
          priceTotalCents: price,
        },
        shipment.id,
      );
    } catch (error) {
      console.error('[offer] Bestätigung fehlgeschlagen:', error);
    }
  }

  return { ok: true, status: 'ACCEPTED' };
}
