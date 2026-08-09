import { describe, expect, it } from 'vitest';
import {
  allowedTransitions,
  canTransition,
  HAPPY_PATH,
  isShipmentStatus,
  SHIPMENT_STATUSES,
  statusMeta,
  statusPhase,
  statusProgress,
} from './shipment-status';

describe('status model', () => {
  it('has metadata for every status', () => {
    for (const status of SHIPMENT_STATUSES) {
      expect(statusMeta[status]).toBeDefined();
      expect(statusMeta[status].label.length).toBeGreaterThan(0);
      expect(statusMeta[status].publicMessage.length).toBeGreaterThan(0);
    }
  });

  it('recognises valid statuses only', () => {
    expect(isShipmentStatus('IN_TRANSIT')).toBe(true);
    expect(isShipmentStatus('in_transit')).toBe(false);
    expect(isShipmentStatus('SOMETHING')).toBe(false);
    expect(isShipmentStatus(null)).toBe(false);
    expect(isShipmentStatus(42)).toBe(false);
  });
});

describe('status transitions', () => {
  it('allows moving forward along the happy path', () => {
    expect(canTransition('BOOKED', 'PICKUP_SCHEDULED')).toBe(true);
    expect(canTransition('PICKED_UP', 'AT_GERMANY_HUB')).toBe(true);
    expect(canTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
  });

  it('allows skipping stages forward (drop-off without pickup scan)', () => {
    expect(canTransition('BOOKED', 'AT_GERMANY_HUB')).toBe(true);
    expect(canTransition('BOOKED', 'DELIVERED')).toBe(true);
  });

  it('never allows moving backwards', () => {
    expect(canTransition('IN_TRANSIT', 'PICKED_UP')).toBe(false);
    expect(canTransition('DELIVERED', 'IN_TRANSIT')).toBe(false);
    expect(canTransition('AT_MOROCCO_HUB', 'AT_GERMANY_HUB')).toBe(false);
  });

  it('never allows a transition to the same status', () => {
    for (const status of SHIPMENT_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });

  it('locks terminal statuses', () => {
    expect(allowedTransitions('DELIVERED')).toEqual([]);
    expect(allowedTransitions('CANCELLED')).toEqual([]);
    expect(canTransition('CANCELLED', 'BOOKED')).toBe(false);
  });

  it('can raise an exception from any live status', () => {
    for (const status of HAPPY_PATH.filter((s) => s !== 'DELIVERED')) {
      expect(canTransition(status, 'EXCEPTION')).toBe(true);
    }
  });

  it('can recover from an exception back into the happy path', () => {
    expect(canTransition('EXCEPTION', 'IN_TRANSIT')).toBe(true);
    expect(canTransition('EXCEPTION', 'DELIVERED')).toBe(true);
    expect(canTransition('EXCEPTION', 'CANCELLED')).toBe(true);
  });

  it('can cancel any live shipment', () => {
    for (const status of HAPPY_PATH.filter((s) => s !== 'DELIVERED')) {
      expect(canTransition(status, 'CANCELLED')).toBe(true);
    }
  });

  it('never offers a terminal status as a source of new transitions', () => {
    expect(allowedTransitions('DELIVERED')).toHaveLength(0);
  });
});

describe('progress and phase', () => {
  it('maps the happy path onto 0–100', () => {
    expect(statusProgress('BOOKED')).toBe(0);
    expect(statusProgress('DELIVERED')).toBe(100);
    expect(statusProgress('IN_TRANSIT')).toBeGreaterThan(0);
    expect(statusProgress('IN_TRANSIT')).toBeLessThan(100);
  });

  it('treats cancelled as zero progress', () => {
    expect(statusProgress('CANCELLED')).toBe(0);
  });

  it('reports which side of the corridor the shipment is on', () => {
    expect(statusPhase('BOOKED')).toBe('origin');
    expect(statusPhase('LOADED')).toBe('origin');
    expect(statusPhase('IN_TRANSIT')).toBe('transit');
    expect(statusPhase('DEPARTED_GERMANY')).toBe('transit');
    expect(statusPhase('AT_MOROCCO_HUB')).toBe('destination');
    expect(statusPhase('DELIVERED')).toBe('done');
  });
});
