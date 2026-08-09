'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertRole, AuthorizationError, type SessionUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/server';
import { canTransition, isShipmentStatus, statusMeta } from '@/lib/shipment-status';
import { calculatePrice } from '@/lib/pricing';
import { uuidSchema } from '@/lib/validation';
import { notifyStatusChange } from '@/lib/notifications';
import type { ShipmentRow } from '@/lib/supabase/database.types';

/**
 * Driver actions.
 *
 * Drivers may only read their own shipments through row level security, and
 * they have no UPDATE policy on `shipments` at all — a stolen driver session
 * cannot rewrite prices or other people's shipments through PostgREST.
 *
 * The writes below therefore run with the service-role client, but only after
 * two checks in this file:
 *   1. the caller really holds the driver (or higher) role, and
 *   2. the shipment is actually assigned to them.
 *
 * Because the service role has no `auth.uid()`, the audit rows are written
 * explicitly here with the driver's identity.
 */

export type DriverResult = { ok: true; message?: string } | { ok: false; error: string };

const scanUpdateSchema = z.object({
  shipmentId: uuidSchema,
  status: z.enum([
    'PICKED_UP',
    'AT_GERMANY_HUB',
    'LOADED',
    'DEPARTED_GERMANY',
    'IN_TRANSIT',
    'ARRIVED_MOROCCO',
    'AT_MOROCCO_HUB',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'EXCEPTION',
  ]),
  weightKg: z.coerce.number().positive().max(5000).optional(),
  pieceCount: z.coerce.number().int().min(1).max(200).optional(),
  sealNumber: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .regex(/^[A-Z0-9][A-Z0-9\-_/]*$/, 'Nur Buchstaben, Ziffern und - _ /')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  photoPath: z.string().trim().max(300).optional().or(z.literal('')).transform((v) => (v ? v : null)),
  signaturePath: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  location: z.string().trim().max(120).optional().or(z.literal('')).transform((v) => (v ? v : null)),
  note: z.string().trim().max(1000).optional().or(z.literal('')).transform((v) => (v ? v : null)),
});

async function driver(): Promise<SessionUser> {
  return assertRole(['driver', 'staff', 'admin']);
}

function failure(error: unknown, fallback: string): DriverResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? fallback };
  console.error('[driver]', error);
  return { ok: false, error: fallback };
}

/**
 * Checks that this driver is genuinely responsible for the shipment: assigned
 * directly, on one of their pickups, or on a trip they drive. Staff and admins
 * pass automatically.
 */
async function assertResponsible(user: SessionUser, shipmentId: string): Promise<boolean> {
  if (user.role === 'staff' || user.role === 'admin') return true;

  // The user-scoped client sees exactly the shipments RLS allows this driver,
  // so a successful read *is* the permission check.
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('shipments').select('id').eq('id', shipmentId).maybeSingle();
  return !!data;
}

export async function driverUpdateShipment(input: unknown): Promise<DriverResult> {
  try {
    const user = await driver();
    const data = scanUpdateSchema.parse(input);

    if (!(await assertResponsible(user, data.shipmentId))) {
      return { ok: false, error: 'Diese Sendung ist dir nicht zugewiesen.' };
    }

    const admin = createAdminClient();

    const { data: shipment } = await admin
      .from('shipments')
      .select(
        'id, tracking_number, status, shipment_type, weight_kg, piece_count, pickup_requested, sender_email, sender_phone, sender_first_name, origin_city, destination_city',
      )
      .eq('id', data.shipmentId)
      .maybeSingle();

    if (!shipment) return { ok: false, error: 'Sendung nicht gefunden.' };

    if (!isShipmentStatus(shipment.status) || !canTransition(shipment.status, data.status)) {
      return {
        ok: false,
        error: `Wechsel von „${statusMeta[shipment.status]?.label ?? shipment.status}“ zu „${statusMeta[data.status].label}“ ist nicht möglich.`,
      };
    }

    const patch: Partial<ShipmentRow> = { status: data.status };

    // A driver confirming the real weight at the door is the normal case —
    // recompute the price from the central function so the customer is charged
    // for what we actually carry.
    if (data.weightKg !== undefined && data.weightKg !== Number(shipment.weight_kg)) {
      patch.weight_kg = data.weightKg;
      if (shipment.shipment_type === 'standard') {
        const price = calculatePrice({
          weightKg: data.weightKg,
          pickupRequested: shipment.pickup_requested,
          shipmentType: 'standard',
        });
        patch.price_base_cents = price.basePriceCents;
        patch.pickup_fee_cents = price.pickupFeeCents;
        patch.price_total_cents = price.totalCents;
      }
    }

    if (data.pieceCount !== undefined) patch.piece_count = data.pieceCount;

    const { error: updateError } = await admin
      .from('shipments')
      .update(patch)
      .eq('id', data.shipmentId);
    if (updateError) throw updateError;

    const { error: eventError } = await admin.from('tracking_events').insert({
      shipment_id: data.shipmentId,
      status: data.status,
      location: data.location,
      public_message: statusMeta[data.status].publicMessage,
      internal_note: data.note,
      created_by: user.id,
    });
    if (eventError) throw eventError;

    if (data.sealNumber) {
      await admin
        .from('security_seals')
        .update({ is_active: false })
        .eq('shipment_id', data.shipmentId)
        .eq('is_active', true);

      const { error: sealError } = await admin.from('security_seals').insert({
        shipment_id: data.shipmentId,
        seal_number: data.sealNumber,
        sealed_by: user.id,
        note: 'Vom Fahrer erfasst',
      });
      if (sealError && sealError.code !== '23505') throw sealError;
    }

    for (const [path, kind] of [
      [data.photoPath, data.status === 'DELIVERED' ? 'delivery_photo' : 'pickup_photo'],
      [data.signaturePath, 'signature'],
    ] as const) {
      if (!path) continue;
      await admin.from('attachments').insert({
        shipment_id: data.shipmentId,
        kind,
        bucket: kind === 'signature' ? 'signatures' : 'shipment-photos',
        path,
        uploaded_by: user.id,
      });
    }

    if (data.status === 'PICKED_UP') {
      await admin
        .from('pickup_assignments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('shipment_id', data.shipmentId)
        .in('status', ['scheduled', 'en_route']);
    }

    // The service role has no auth.uid(), so the database trigger cannot know
    // who acted — record it here instead.
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: user.role,
      actor_label: user.fullName ?? user.email,
      entity_type: 'shipment',
      entity_id: data.shipmentId,
      entity_label: shipment.tracking_number,
      action: 'driver_scan',
      field: 'status',
      old_value: shipment.status,
      new_value: data.status,
      metadata: {
        weight_kg: data.weightKg ?? null,
        piece_count: data.pieceCount ?? null,
        seal_number: data.sealNumber,
        has_photo: !!data.photoPath,
        has_signature: !!data.signaturePath,
      },
    });

    try {
      await notifyStatusChange(
        data.status,
        { email: shipment.sender_email, whatsapp: shipment.sender_phone },
        {
          trackingNumber: shipment.tracking_number,
          customerFirstName: shipment.sender_first_name,
          originCity: shipment.origin_city,
          destinationCity: shipment.destination_city,
          weightKg: data.weightKg ?? shipment.weight_kg,
          pieceCount: data.pieceCount ?? shipment.piece_count,
          sealNumber: data.sealNumber,
        },
        shipment.id,
      );
    } catch (notifyError) {
      console.error('[driver] Benachrichtigung fehlgeschlagen:', notifyError);
    }

    revalidatePath('/driver');
    revalidatePath(`/driver/sendung/${data.shipmentId}`);
    revalidatePath(`/admin/sendungen/${data.shipmentId}`);

    return { ok: true, message: `Status auf „${statusMeta[data.status].label}“ gesetzt.` };
  } catch (error) {
    return failure(error, 'Die Aktualisierung ist fehlgeschlagen.');
  }
}

const driverUploadSchema = z.object({
  shipmentId: uuidSchema,
  kind: z.enum(['pickup_photo', 'delivery_photo', 'signature', 'seal_photo']),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.coerce.number().int().positive().max(10 * 1024 * 1024),
});

export type DriverUploadResult =
  | { ok: true; bucket: string; path: string; token: string }
  | { ok: false; error: string };

export async function createDriverUpload(input: unknown): Promise<DriverUploadResult> {
  try {
    const user = await driver();
    const data = driverUploadSchema.parse(input);

    if (!(await assertResponsible(user, data.shipmentId))) {
      return { ok: false, error: 'Diese Sendung ist dir nicht zugewiesen.' };
    }

    const bucket = data.kind === 'signature' ? 'signatures' : 'shipment-photos';
    const extension = data.mimeType === 'image/png' ? 'png' : data.mimeType === 'image/webp' ? 'webp' : 'jpg';
    // Grouped per shipment so files stay findable, with a random name so
    // nothing can be guessed or overwritten.
    const path = `${data.shipmentId}/${data.kind}-${crypto.randomUUID()}.${extension}`;

    const admin = createAdminClient();
    const { data: signed, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);

    if (error || !signed) {
      console.error('[driver] Upload-URL fehlgeschlagen:', error?.message);
      return { ok: false, error: 'Der Upload konnte nicht vorbereitet werden.' };
    }

    return { ok: true, bucket, path: signed.path, token: signed.token };
  } catch (error) {
    const result = failure(error, 'Der Upload konnte nicht vorbereitet werden.');
    return { ok: false, error: result.ok ? '' : result.error };
  }
}

/** Resolves a scanned QR token to a shipment id, for the /scan route. */
export async function resolveScanToken(token: string): Promise<string | null> {
  try {
    await driver();
    if (!/^[a-f0-9]{16,64}$/.test(token)) return null;

    const admin = createAdminClient();
    const { data } = await admin
      .from('shipments')
      .select('id')
      .eq('scan_token', token)
      .maybeSingle();

    return data?.id ?? null;
  } catch {
    return null;
  }
}
