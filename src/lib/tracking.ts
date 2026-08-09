import { isShipmentStatus, type ShipmentStatus } from '@/lib/shipment-status';
import type { CountryCode } from '@/config/regions';

/**
 * Public tracking data — the shape a visitor with only a tracking number is
 * allowed to see.
 *
 * Two independent gates produce it:
 *   1. `get_public_tracking()` in Postgres selects a fixed set of columns.
 *   2. `toPublicTracking()` below re-whitelists them in TypeScript.
 *
 * The second gate exists so that adding a column to the SQL function — or
 * pointing this code at a different query — cannot silently start leaking
 * addresses, phone numbers, e-mail addresses, prices or internal notes.
 */

export type PublicTrackingEvent = {
  status: ShipmentStatus;
  occurredAt: string;
  location: string | null;
  message: string | null;
};

export type PublicTracking = {
  trackingNumber: string;
  status: ShipmentStatus;
  shipmentType: 'standard' | 'bulky';
  originCountry: CountryCode;
  originCity: string;
  destinationCountry: CountryCode;
  destinationCity: string;
  pieceCount: number;
  weightKg: number;
  pickupRequested: boolean;
  /** First name only — enough for the customer to recognise their shipment. */
  recipientFirstName: string | null;
  sealNumber: string | null;
  bookedAt: string | null;
  lastUpdate: string | null;
  deliveredAt: string | null;
  events: PublicTrackingEvent[];
};

/**
 * NEVER add a field to this list without asking whether a stranger who guessed
 * a tracking number may see it.
 */
const ALLOWED_FIELDS = [
  'tracking_number',
  'status',
  'shipment_type',
  'origin_country',
  'origin_city',
  'destination_country',
  'destination_city',
  'piece_count',
  'weight_kg',
  'pickup_requested',
  'recipient_first_name',
  'seal_number',
  'booked_at',
  'last_update',
  'delivered_at',
  'events',
] as const;

/** Fields that must never appear in a public payload — asserted by the tests. */
export const FORBIDDEN_PUBLIC_FIELDS = [
  'id',
  'scan_token',
  'customer_id',
  'created_by',
  'sender_first_name',
  'sender_last_name',
  'sender_phone',
  'sender_email',
  'sender_address',
  'sender_postal_code',
  'recipient_last_name',
  'recipient_phone',
  'recipient_address',
  'price_base_cents',
  'pickup_fee_cents',
  'price_total_cents',
  'payment_status',
  'internal_notes',
  'internal_note',
  'assigned_driver_id',
] as const;

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function country(value: unknown): CountryCode {
  return value === 'MA' ? 'MA' : 'DE';
}

function toEvent(raw: unknown): PublicTrackingEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (!isShipmentStatus(record.status)) return null;
  const occurredAt = str(record.occurred_at);
  if (!occurredAt) return null;

  return {
    status: record.status,
    occurredAt,
    location: str(record.location),
    message: str(record.message),
  };
}

/**
 * Whitelisting converter. Returns null for anything that is not a recognisable
 * tracking payload, so a caller can never accidentally forward raw rows.
 */
export function toPublicTracking(raw: unknown): PublicTracking | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  const trackingNumber = str(record.tracking_number);
  if (!trackingNumber || !isShipmentStatus(record.status)) return null;

  const events = Array.isArray(record.events)
    ? record.events.map(toEvent).filter((e): e is PublicTrackingEvent => e !== null)
    : [];

  return {
    trackingNumber,
    status: record.status,
    shipmentType: record.shipment_type === 'bulky' ? 'bulky' : 'standard',
    originCountry: country(record.origin_country),
    originCity: str(record.origin_city) ?? '',
    destinationCountry: country(record.destination_country),
    destinationCity: str(record.destination_city) ?? '',
    pieceCount: num(record.piece_count, 1),
    weightKg: num(record.weight_kg, 0),
    pickupRequested: record.pickup_requested === true,
    recipientFirstName: str(record.recipient_first_name),
    sealNumber: str(record.seal_number),
    bookedAt: str(record.booked_at),
    lastUpdate: str(record.last_update),
    deliveredAt: str(record.delivered_at),
    events,
  };
}

export const PUBLIC_TRACKING_FIELDS = ALLOWED_FIELDS;
