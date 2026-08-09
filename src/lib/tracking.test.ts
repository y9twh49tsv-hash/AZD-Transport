import { describe, expect, it } from 'vitest';
import { FORBIDDEN_PUBLIC_FIELDS, toPublicTracking } from './tracking';
import { normaliseTrackingNumber } from './utils';

/**
 * A raw row as the database function returns it, deliberately polluted with
 * every sensitive column an accidental `select *` could drag along.
 */
const rawWithSensitiveData = {
  tracking_number: 'MC-260809-0042',
  status: 'IN_TRANSIT',
  shipment_type: 'standard',
  origin_country: 'DE',
  origin_city: 'frankfurt-am-main',
  destination_country: 'MA',
  destination_city: 'nador',
  piece_count: 3,
  weight_kg: 25,
  pickup_requested: true,
  recipient_first_name: 'Samira',
  seal_number: 'SEC-583921',
  booked_at: '2026-08-02T10:00:00Z',
  last_update: '2026-08-08T09:00:00Z',
  delivered_at: null,
  events: [
    {
      status: 'IN_TRANSIT',
      occurred_at: '2026-08-08T09:00:00Z',
      location: 'Spanien',
      message: 'Deine Sendung befindet sich auf dem Transportweg.',
      internal_note: 'Fahrer meldet Verzögerung an der Grenze',
    },
  ],

  // --- none of these may survive ---
  id: '0b8b8f3e-0000-0000-0000-000000000001',
  scan_token: 'a'.repeat(40),
  customer_id: '0b8b8f3e-0000-0000-0000-000000000002',
  created_by: '0b8b8f3e-0000-0000-0000-000000000003',
  sender_first_name: 'Yassin',
  sender_last_name: 'El Amrani',
  sender_phone: '+49 176 1111111',
  sender_email: 'yassin@example.com',
  sender_address: 'Kaiserstraße 12',
  sender_postal_code: '60329',
  recipient_last_name: 'Haddadi',
  recipient_phone: '+212 6 55 44 33 22',
  recipient_address: 'Hay El Matar 7',
  price_base_cents: 5000,
  pickup_fee_cents: 1000,
  price_total_cents: 6000,
  payment_status: 'paid_cash',
  internal_notes: 'Kunde ruft ständig an',
  assigned_driver_id: '0b8b8f3e-0000-0000-0000-000000000004',
};

describe('public tracking sanitisation', () => {
  const result = toPublicTracking(rawWithSensitiveData);

  it('returns the expected public fields', () => {
    expect(result).not.toBeNull();
    expect(result!.trackingNumber).toBe('MC-260809-0042');
    expect(result!.status).toBe('IN_TRANSIT');
    expect(result!.originCity).toBe('frankfurt-am-main');
    expect(result!.destinationCity).toBe('nador');
    expect(result!.pieceCount).toBe(3);
    expect(result!.weightKg).toBe(25);
    expect(result!.sealNumber).toBe('SEC-583921');
    expect(result!.recipientFirstName).toBe('Samira');
  });

  it('drops every sensitive field', () => {
    const serialised = JSON.stringify(result);
    for (const field of FORBIDDEN_PUBLIC_FIELDS) {
      expect(serialised).not.toContain(field);
    }
  });

  it('does not leak sensitive VALUES either', () => {
    const serialised = JSON.stringify(result);
    const secrets = [
      '+49 176 1111111',
      '+212 6 55 44 33 22',
      'yassin@example.com',
      'Kaiserstraße 12',
      'Hay El Matar 7',
      'El Amrani',
      'Haddadi',
      '60329',
      'Kunde ruft ständig an',
      'Fahrer meldet Verzögerung an der Grenze',
      rawWithSensitiveData.scan_token,
      rawWithSensitiveData.id,
      rawWithSensitiveData.customer_id,
    ];
    for (const secret of secrets) {
      expect(serialised).not.toContain(secret);
    }
  });

  it('never exposes prices', () => {
    const serialised = JSON.stringify(result);
    expect(serialised).not.toContain('6000');
    expect(serialised).not.toContain('5000');
    expect(serialised).not.toContain('paid_cash');
  });

  it('keeps only the public part of each event', () => {
    expect(result!.events).toHaveLength(1);
    expect(result!.events[0]).toEqual({
      status: 'IN_TRANSIT',
      occurredAt: '2026-08-08T09:00:00Z',
      location: 'Spanien',
      message: 'Deine Sendung befindet sich auf dem Transportweg.',
    });
    expect(Object.keys(result!.events[0])).toEqual([
      'status',
      'occurredAt',
      'location',
      'message',
    ]);
  });

  it('rejects malformed payloads instead of passing them through', () => {
    expect(toPublicTracking(null)).toBeNull();
    expect(toPublicTracking(undefined)).toBeNull();
    expect(toPublicTracking('MC-260809-0042')).toBeNull();
    expect(toPublicTracking([])).toBeNull();
    expect(toPublicTracking({})).toBeNull();
    expect(toPublicTracking({ tracking_number: 'MC-260809-0042' })).toBeNull();
    expect(toPublicTracking({ tracking_number: 'X', status: 'NOT_A_STATUS' })).toBeNull();
  });

  it('drops events with an unknown status', () => {
    const output = toPublicTracking({
      ...rawWithSensitiveData,
      events: [
        { status: 'FANTASY', occurred_at: '2026-08-08T09:00:00Z' },
        { status: 'DELIVERED', occurred_at: '2026-08-09T09:00:00Z' },
        { status: 'DELIVERED' },
      ],
    });
    expect(output!.events).toHaveLength(1);
    expect(output!.events[0].status).toBe('DELIVERED');
  });
});

describe('tracking number normalisation', () => {
  it('accepts the canonical format', () => {
    expect(normaliseTrackingNumber('MC-260809-0042')).toBe('MC-260809-0042');
  });

  it('repairs common typing variants', () => {
    expect(normaliseTrackingNumber('mc-260809-0042')).toBe('MC-260809-0042');
    expect(normaliseTrackingNumber('  MC-260809-0042  ')).toBe('MC-260809-0042');
    expect(normaliseTrackingNumber('MC 260809 0042')).toBe('MC-260809-0042');
    expect(normaliseTrackingNumber('mc2608090042')).toBe('MC-260809-0042');
  });

  it('leaves clearly invalid input alone so validation can reject it', () => {
    expect(normaliseTrackingNumber('hallo')).toBe('HALLO');
    expect(normaliseTrackingNumber('')).toBe('');
  });
});
