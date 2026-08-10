'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertRole, AuthorizationError, type SessionUser } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { canTransition, isShipmentStatus, statusMeta } from '@/lib/shipment-status';
import { calculatePrice } from '@/lib/pricing';
import { pricingConfig } from '@/config/pricing';
import { appUrl } from '@/config/brand';
import {
  bulkyQuoteSchema,
  pickupScheduleSchema,
  roleChangeSchema,
  sealSchema,
  shipmentEditSchema,
  statusUpdateSchema,
  tripSchema,
  uuidSchema,
  vehicleSchema,
} from '@/lib/validation';
import { notifyStatusChange, sendBulkyQuote } from '@/lib/notifications';
import type { BulkyRequestRow, ShipmentRow } from '@/lib/supabase/database.types';

/**
 * Back-office mutations.
 *
 * All of these run through the *user-scoped* Supabase client on purpose:
 *   • row level security re-checks the caller's role in the database, and
 *   • `auth.uid()` is populated, so the audit triggers record who did what.
 *
 * The service-role key is not used anywhere in this file.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function staff(): Promise<SessionUser> {
  return assertRole(['staff', 'admin']);
}

function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof AuthorizationError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? fallback };
  }
  console.error('[admin]', error);
  return { ok: false, error: fallback };
}

function revalidateShipment(id: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/sendungen');
  revalidatePath(`/admin/sendungen/${id}`);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export async function updateShipmentStatus(input: unknown): Promise<ActionResult> {
  try {
    const user = await staff();
    const data = statusUpdateSchema.parse(input);
    const supabase = await createServerSupabase();

    const { data: shipment } = await supabase
      .from('shipments')
      .select(
        'id, tracking_number, status, sender_email, sender_phone, sender_first_name, origin_city, destination_city, weight_kg, piece_count',
      )
      .eq('id', data.shipmentId)
      .maybeSingle();

    if (!shipment) return { ok: false, error: 'Sendung nicht gefunden.' };

    if (!isShipmentStatus(shipment.status) || !canTransition(shipment.status, data.status)) {
      return {
        ok: false,
        error: `Der Wechsel von „${statusMeta[shipment.status]?.label ?? shipment.status}“ zu „${
          statusMeta[data.status].label
        }" ist nicht erlaubt.`,
      };
    }

    const { error: updateError } = await supabase
      .from('shipments')
      .update({ status: data.status })
      .eq('id', data.shipmentId);

    if (updateError) throw updateError;

    // Append-only history — one row per change, never an overwrite.
    const { error: eventError } = await supabase.from('tracking_events').insert({
      shipment_id: data.shipmentId,
      status: data.status,
      location: data.location,
      public_message: data.publicMessage ?? statusMeta[data.status].publicMessage,
      internal_note: data.internalNote,
      created_by: user.id,
    });

    if (eventError) throw eventError;

    // A failing mail must not roll back a status that is already recorded.
    try {
      await notifyStatusChange(
        data.status,
        { email: shipment.sender_email, whatsapp: shipment.sender_phone },
        {
          trackingNumber: shipment.tracking_number,
          customerFirstName: shipment.sender_first_name,
          originCity: shipment.origin_city,
          destinationCity: shipment.destination_city,
          weightKg: shipment.weight_kg,
          pieceCount: shipment.piece_count,
          extra: data.publicMessage,
        },
        shipment.id,
      );
    } catch (notifyError) {
      console.error('[admin] Benachrichtigung fehlgeschlagen:', notifyError);
    }

    revalidateShipment(data.shipmentId);
    return { ok: true, message: `Status auf „${statusMeta[data.status].label}“ gesetzt.` };
  } catch (error) {
    return failure(error, 'Der Status konnte nicht geändert werden.');
  }
}

// ---------------------------------------------------------------------------
// Security seals
// ---------------------------------------------------------------------------

export async function addSecuritySeal(input: unknown): Promise<ActionResult> {
  try {
    const user = await staff();
    const data = sealSchema.parse(input);
    const supabase = await createServerSupabase();

    // Only one seal is active at a time; older ones stay for the record.
    await supabase
      .from('security_seals')
      .update({ is_active: false })
      .eq('shipment_id', data.shipmentId)
      .eq('is_active', true);

    const { error } = await supabase.from('security_seals').insert({
      shipment_id: data.shipmentId,
      seal_number: data.sealNumber,
      note: data.note,
      photo_path: data.photoPath,
      sealed_by: user.id,
    });

    if (error) {
      if (error.code === '23505') {
        return { ok: false, error: 'Diese Sicherheitsnummer ist bereits vergeben.' };
      }
      throw error;
    }

    revalidateShipment(data.shipmentId);
    return { ok: true, message: `Sicherheitsnummer ${data.sealNumber} gespeichert.` };
  } catch (error) {
    return failure(error, 'Die Sicherheitsnummer konnte nicht gespeichert werden.');
  }
}

// ---------------------------------------------------------------------------
// Shipment details
// ---------------------------------------------------------------------------

export async function updateShipmentDetails(input: unknown): Promise<ActionResult> {
  try {
    await staff();
    const data = shipmentEditSchema.parse(input);
    const supabase = await createServerSupabase();

    const { data: shipment } = await supabase
      .from('shipments')
      .select('id, shipment_type, weight_kg, pickup_requested, price_total_cents')
      .eq('id', data.shipmentId)
      .maybeSingle();

    if (!shipment) return { ok: false, error: 'Sendung nicht gefunden.' };

    const patch: Partial<ShipmentRow> = {};

    if (data.weightKg !== undefined) patch.weight_kg = data.weightKg;
    if (data.pieceCount !== undefined) patch.piece_count = data.pieceCount;
    if (data.paymentStatus !== undefined) patch.payment_status = data.paymentStatus;
    if (data.internalNotes !== undefined) patch.internal_notes = data.internalNotes;

    if (data.priceTotalCents !== undefined) {
      // A manual price wins, but the components stay consistent so invoices
      // and statistics keep adding up.
      const pickupFee = shipment.pickup_requested ? pricingConfig.pickupFeeCents : 0;
      patch.price_total_cents = data.priceTotalCents;
      patch.price_base_cents = Math.max(0, data.priceTotalCents - pickupFee);
      patch.pickup_fee_cents = pickupFee;
    } else if (data.weightKg !== undefined && shipment.shipment_type !== 'bulky') {
      // Weight changed without an explicit price: recompute from the central
      // pricing function rather than leaving a stale total behind. Sperrgut is
      // excluded because its price is always a manual quote; für Dokumente
      // liefert die Funktion den Pauschalpreis zurück, das Gewicht ändert daran
      // nichts.
      const price = calculatePrice({
        weightKg: data.weightKg,
        pickupRequested: shipment.pickup_requested,
        shipmentType: shipment.shipment_type,
      });
      patch.price_base_cents = price.basePriceCents;
      patch.pickup_fee_cents = price.pickupFeeCents;
      patch.price_total_cents = price.totalCents;
    }

    if (Object.keys(patch).length === 0) return { ok: true, message: 'Nichts zu ändern.' };

    const { error } = await supabase.from('shipments').update(patch).eq('id', data.shipmentId);
    if (error) throw error;

    revalidateShipment(data.shipmentId);
    return { ok: true, message: 'Sendung aktualisiert.' };
  } catch (error) {
    return failure(error, 'Die Sendung konnte nicht aktualisiert werden.');
  }
}

export async function recordPayment(input: unknown): Promise<ActionResult> {
  try {
    const user = await staff();
    const data = z
      .object({
        shipmentId: uuidSchema,
        method: z.enum(['cash', 'bank_transfer', 'online', 'other']),
        amountCents: z.coerce.number().int().positive().max(10_000_000),
        note: z.string().trim().max(500).optional(),
      })
      .parse(input);

    const supabase = await createServerSupabase();

    const { error } = await supabase.from('payments').insert({
      shipment_id: data.shipmentId,
      amount_cents: data.amountCents,
      method: data.method,
      note: data.note || null,
      received_by: user.id,
    });
    if (error) throw error;

    await supabase
      .from('shipments')
      .update({ payment_status: data.method === 'cash' ? 'paid_cash' : 'paid_online' })
      .eq('id', data.shipmentId);

    revalidateShipment(data.shipmentId);
    revalidatePath('/admin/finanzen');
    return { ok: true, message: 'Zahlung erfasst.' };
  } catch (error) {
    return failure(error, 'Die Zahlung konnte nicht erfasst werden.');
  }
}

export async function assignDriver(input: unknown): Promise<ActionResult> {
  try {
    await staff();
    const data = z
      .object({
        shipmentId: uuidSchema,
        driverId: z.union([uuidSchema, z.literal('')]).transform((v) => (v ? v : null)),
      })
      .parse(input);

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('shipments')
      .update({ assigned_driver_id: data.driverId })
      .eq('id', data.shipmentId);
    if (error) throw error;

    revalidateShipment(data.shipmentId);
    return { ok: true, message: data.driverId ? 'Fahrer zugewiesen.' : 'Fahrer entfernt.' };
  } catch (error) {
    return failure(error, 'Der Fahrer konnte nicht zugewiesen werden.');
  }
}

export async function cancelShipment(input: unknown): Promise<ActionResult> {
  const data = z
    .object({ shipmentId: uuidSchema, reason: z.string().trim().max(500).optional() })
    .safeParse(input);

  if (!data.success) return { ok: false, error: 'Ungültige Eingabe.' };

  return updateShipmentStatus({
    shipmentId: data.data.shipmentId,
    status: 'CANCELLED',
    publicMessage: 'Diese Sendung wurde storniert.',
    internalNote: data.data.reason || 'Storniert über das Dashboard',
  });
}

// ---------------------------------------------------------------------------
// Pickups
// ---------------------------------------------------------------------------

export async function schedulePickup(input: unknown): Promise<ActionResult> {
  try {
    await staff();
    const data = pickupScheduleSchema.parse(input);
    const supabase = await createServerSupabase();

    const { data: existing } = await supabase
      .from('pickup_assignments')
      .select('id')
      .eq('shipment_id', data.shipmentId)
      .not('status', 'in', '("completed","cancelled")')
      .maybeSingle();

    const payload = {
      shipment_id: data.shipmentId,
      scheduled_date: data.scheduledDate,
      time_window_start: data.timeWindowStart,
      time_window_end: data.timeWindowEnd,
      driver_id: data.driverId,
      note: data.note,
      status: 'scheduled' as const,
    };

    const { error } = existing
      ? await supabase.from('pickup_assignments').update(payload).eq('id', existing.id)
      : await supabase.from('pickup_assignments').insert(payload);

    if (error) throw error;

    await supabase
      .from('shipments')
      .update({
        pickup_requested: true,
        pickup_date: data.scheduledDate,
        ...(data.driverId ? { assigned_driver_id: data.driverId } : {}),
      })
      .eq('id', data.shipmentId);

    // Tell the customer, and record the status move properly.
    const statusResult = await updateShipmentStatus({
      shipmentId: data.shipmentId,
      status: 'PICKUP_SCHEDULED',
      location: null,
      publicMessage: `Die Abholung ist für den ${data.scheduledDate} eingeplant.`,
      internalNote: data.note,
    });

    revalidatePath('/admin/abholungen');
    revalidateShipment(data.shipmentId);

    // A shipment that is already further along keeps its status; the pickup
    // itself is still saved, so this is a success either way.
    return statusResult.ok ? statusResult : { ok: true, message: 'Abholung gespeichert.' };
  } catch (error) {
    return failure(error, 'Die Abholung konnte nicht geplant werden.');
  }
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function saveTrip(input: unknown): Promise<ActionResult> {
  try {
    await staff();
    const data = tripSchema.parse(input);
    const supabase = await createServerSupabase();

    const payload = {
      code: data.code,
      origin_country: data.originCountry,
      origin_city: data.originCity,
      destination_country: data.destinationCountry,
      destination_city: data.destinationCity,
      departure_date: data.departureDate,
      planned_arrival_date: data.plannedArrivalDate,
      vehicle_id: data.vehicleId,
      driver_id: data.driverId,
      status: data.status,
      max_payload_kg: data.maxPayloadKg ?? null,
      notes: data.notes,
    };

    const { error } = data.id
      ? await supabase.from('trips').update(payload).eq('id', data.id)
      : await supabase.from('trips').insert(payload);

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Diese Tour-ID existiert bereits.' };
      throw error;
    }

    revalidatePath('/admin/touren');
    return { ok: true, message: data.id ? 'Tour aktualisiert.' : 'Tour angelegt.' };
  } catch (error) {
    return failure(error, 'Die Tour konnte nicht gespeichert werden.');
  }
}

export async function assignShipmentToTrip(input: unknown): Promise<ActionResult> {
  try {
    const user = await staff();
    const data = z
      .object({ shipmentId: uuidSchema, tripId: z.union([uuidSchema, z.literal('')]) })
      .parse(input);

    const supabase = await createServerSupabase();

    // A shipment travels on exactly one trip — remove the old link first.
    await supabase.from('trip_shipments').delete().eq('shipment_id', data.shipmentId);

    if (data.tripId) {
      const { error } = await supabase.from('trip_shipments').insert({
        trip_id: data.tripId,
        shipment_id: data.shipmentId,
        added_by: user.id,
      });
      if (error) throw error;
    }

    revalidatePath('/admin/touren');
    revalidateShipment(data.shipmentId);
    return { ok: true, message: data.tripId ? 'Sendung der Tour zugewiesen.' : 'Von der Tour entfernt.' };
  } catch (error) {
    return failure(error, 'Die Zuordnung konnte nicht gespeichert werden.');
  }
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

export async function saveVehicle(input: unknown): Promise<ActionResult> {
  try {
    await staff();
    const data = vehicleSchema.parse(input);
    const supabase = await createServerSupabase();

    const payload = {
      plate: data.plate,
      make: data.make,
      model: data.model,
      gross_weight_kg: data.grossWeightKg ?? null,
      payload_kg: data.payloadKg,
      cargo_volume_m3: data.cargoVolumeM3 ?? null,
      status: data.status,
      notes: data.notes,
    };

    const { error } = data.id
      ? await supabase.from('vehicles').update(payload).eq('id', data.id)
      : await supabase.from('vehicles').insert(payload);

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Dieses Kennzeichen existiert bereits.' };
      throw error;
    }

    revalidatePath('/admin/fahrzeuge');
    return { ok: true, message: data.id ? 'Fahrzeug aktualisiert.' : 'Fahrzeug angelegt.' };
  } catch (error) {
    return failure(error, 'Das Fahrzeug konnte nicht gespeichert werden.');
  }
}

// ---------------------------------------------------------------------------
// Bulky requests
// ---------------------------------------------------------------------------

export async function quoteBulkyRequest(input: unknown): Promise<ActionResult> {
  try {
    const user = await staff();
    const data = bulkyQuoteSchema.parse(input);
    const supabase = await createServerSupabase();

    if (data.status === 'QUOTED' && data.quotedPriceCents === undefined) {
      return { ok: false, error: 'Für ein Angebot brauchst du einen Preis.' };
    }

    const patch: Partial<BulkyRequestRow> = {
      status: data.status,
      quote_note: data.quoteNote,
    };

    if (data.quotedPriceCents !== undefined) {
      patch.quoted_price_cents = data.quotedPriceCents;
    }
    if (data.status === 'QUOTED') {
      patch.quoted_at = new Date().toISOString();
      patch.quoted_by = user.id;
    }

    const { data: updated, error } = await supabase
      .from('bulky_item_requests')
      .update(patch)
      .eq('id', data.requestId)
      .select('id, reference, public_token, item_type, email, contact_first_name, quoted_price_cents, quote_note')
      .single();

    if (error) throw error;

    if (data.status === 'QUOTED' && updated?.email) {
      try {
        await sendBulkyQuote(
          updated.email,
          {
            reference: updated.reference,
            contactFirstName: updated.contact_first_name,
            itemType: updated.item_type,
            quotedPriceCents: updated.quoted_price_cents,
            quoteNote: updated.quote_note,
            offerUrl: `${appUrl()}/angebot/${updated.public_token}`,
          },
          updated.id,
        );
      } catch (notifyError) {
        console.error('[admin] Angebot konnte nicht versendet werden:', notifyError);
      }
    }

    revalidatePath('/admin/sperrgut');
    revalidatePath(`/admin/sperrgut/${data.requestId}`);
    return {
      ok: true,
      message: data.status === 'QUOTED' ? 'Angebot gespeichert und versendet.' : 'Anfrage aktualisiert.',
    };
  } catch (error) {
    return failure(error, 'Die Anfrage konnte nicht aktualisiert werden.');
  }
}

// ---------------------------------------------------------------------------
// Team & settings — admin only
// ---------------------------------------------------------------------------

export async function updateUserRole(input: unknown): Promise<ActionResult> {
  try {
    const admin = await assertRole(['admin']);
    const data = roleChangeSchema.parse(input);

    if (data.profileId === admin.id && data.role !== 'admin') {
      return { ok: false, error: 'Du kannst dir nicht selbst die Admin-Rechte entziehen.' };
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('profiles')
      .update({ role: data.role })
      .eq('id', data.profileId);

    if (error) throw error;

    revalidatePath('/admin/team');
    return { ok: true, message: 'Rolle aktualisiert.' };
  } catch (error) {
    return failure(error, 'Die Rolle konnte nicht geändert werden.');
  }
}

export async function setUserActive(input: unknown): Promise<ActionResult> {
  try {
    const admin = await assertRole(['admin']);
    const data = z.object({ profileId: uuidSchema, isActive: z.boolean() }).parse(input);

    if (data.profileId === admin.id && !data.isActive) {
      return { ok: false, error: 'Du kannst dein eigenes Konto nicht deaktivieren.' };
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: data.isActive })
      .eq('id', data.profileId);

    if (error) throw error;

    revalidatePath('/admin/team');
    return { ok: true, message: data.isActive ? 'Konto aktiviert.' : 'Konto deaktiviert.' };
  } catch (error) {
    return failure(error, 'Das Konto konnte nicht geändert werden.');
  }
}

/**
 * Short-lived signed URL for a file in a private bucket.
 * Access is checked twice: role here, and RLS on the attachment row.
 */
export async function getAttachmentUrl(attachmentId: string): Promise<string | null> {
  try {
    await staff();
    const id = uuidSchema.parse(attachmentId);
    const supabase = await createServerSupabase();

    const { data: attachment } = await supabase
      .from('attachments')
      .select('bucket, path')
      .eq('id', id)
      .maybeSingle();

    if (!attachment) return null;

    const { data } = await supabase.storage
      .from(attachment.bucket)
      .createSignedUrl(attachment.path, 300);

    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
