import { pricingConfig } from '@/config/pricing';

export type ShipmentType = 'standard' | 'documents' | 'bulky';

export type PriceInput = {
  weightKg: number;
  pickupRequested: boolean;
  shipmentType: ShipmentType;
};

export type PriceBreakdown = {
  /** true when the price can be calculated automatically */
  quotable: boolean;
  weightKg: number;
  /** weight × rate, before the minimum is applied */
  weightPriceCents: number;
  /** what the customer actually pays for transport (minimum applied) */
  basePriceCents: number;
  /** true when the minimum price kicked in instead of the per-kg price */
  minimumApplied: boolean;
  pickupFeeCents: number;
  totalCents: number;
  ratePerKgCents: number;
  minimumPriceCents: number;
};

/** Rounds to whole cents, guarding against float artefacts (e.g. 0.1 + 0.2). */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * THE single pricing function of the application.
 *
 * Rules:
 *   standard:  base = max(20,00 €, weight × 2,00 €)
 *   documents: flat 10,00 €, regardless of weight
 *   pickup:    + 10,00 €
 *   bulky:     no automatic price — always a manual quote by the office
 *
 * Both the client-side calculator and the server-side booking endpoint call
 * this, and the server result is the one that is stored. A price sent by the
 * browser is never trusted.
 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const { pricePerKgCents, minimumPriceCents, pickupFeeCents, documentsPriceCents } = pricingConfig;

  const weightKg = Number.isFinite(input.weightKg) ? Math.max(0, input.weightKg) : 0;
  const pickupFee = input.pickupRequested ? pickupFeeCents : 0;

  if (input.shipmentType === 'documents') {
    // Flat rate: the weight is recorded for the manifest, but never priced.
    return {
      quotable: true,
      weightKg,
      weightPriceCents: 0,
      basePriceCents: documentsPriceCents,
      minimumApplied: false,
      pickupFeeCents: pickupFee,
      totalCents: documentsPriceCents + pickupFee,
      ratePerKgCents: 0,
      minimumPriceCents: documentsPriceCents,
    };
  }

  if (input.shipmentType === 'bulky') {
    return {
      quotable: false,
      weightKg,
      weightPriceCents: 0,
      basePriceCents: 0,
      minimumApplied: false,
      pickupFeeCents: pickupFee,
      totalCents: 0,
      ratePerKgCents: pricePerKgCents,
      minimumPriceCents,
    };
  }

  const weightPriceCents = Math.round(toCents(weightKg * pricePerKgCents));
  const basePriceCents = Math.max(minimumPriceCents, weightPriceCents);

  return {
    quotable: true,
    weightKg,
    weightPriceCents,
    basePriceCents,
    minimumApplied: basePriceCents === minimumPriceCents && weightPriceCents < minimumPriceCents,
    pickupFeeCents: pickupFee,
    totalCents: basePriceCents + pickupFee,
    ratePerKgCents: pricePerKgCents,
    minimumPriceCents,
  };
}

const eurFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

/** 6000 -> "60,00 €" */
export function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '—';
  return eurFormatter.format(cents / 100);
}

/** "60,00" -> 6000. Accepts German and English decimal separators. */
export function parseEuroToCents(value: string): number | null {
  const normalised = value.trim().replace(/\s|€/g, '').replace(',', '.');
  if (!normalised) return null;
  const num = Number(normalised);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

const weightFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

/** 25 -> "25 kg" */
export function formatWeight(kg: number | null | undefined): string {
  if (kg === null || kg === undefined) return '—';
  return `${weightFormatter.format(kg)} kg`;
}
