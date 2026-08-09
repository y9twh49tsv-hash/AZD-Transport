/**
 * Pricing parameters. Every price in the application is derived from these
 * numbers via `src/lib/pricing.ts` — never inline a rate anywhere else.
 *
 * All money is handled in EURO CENTS (integers) to avoid float rounding
 * errors. Only the presentation layer converts to euros.
 */
export const pricingConfig = {
  /** 2,00 € per kilogram */
  pricePerKgCents: 200,
  /** Minimum charge for a standard shipment: 20,00 € */
  minimumPriceCents: 2000,
  /** Surcharge when we collect the shipment from the customer: 10,00 € */
  pickupFeeCents: 1000,
  /** Weight limit per single standard shipment before it must be quoted manually */
  maxStandardWeightKg: 300,
  /** Below this weight the form rejects the input */
  minWeightKg: 0.5,
  currency: 'EUR',
} as const;

export type PricingConfig = typeof pricingConfig;
