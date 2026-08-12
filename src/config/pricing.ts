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
  /**
   * Documents — passports, certificates, contracts, powers of attorney: a flat
   * 10,00 €, independent of weight.
   *
   * A flat rate rather than the per-kilo tariff because what matters here is
   * not the weight (an envelope weighs nothing) but that the papers arrive
   * intact and on time. The per-kilo minimum of 20,00 € would price the
   * service out of existence.
   */
  documentsPriceCents: 1000,
  /**
   * Above this, an envelope is no longer "documents" but a parcel, and the
   * ordinary tariff applies. Deliberately generous — a folder of certified
   * copies can weigh a kilo.
   */
  maxDocumentsWeightKg: 2,
  /** Weight limit per single standard shipment before it must be quoted manually */
  maxStandardWeightKg: 300,
  /**
   * Below this weight a *parcel* is rejected — anything lighter is almost
   * certainly a typo or an empty form.
   */
  minWeightKg: 0.5,
  /**
   * The floor for documents. An envelope with a passport and two certificates
   * weighs around 50 grams, so the parcel minimum of 0,5 kg would reject the
   * very shipments this service exists for.
   *
   * Only checked when a weight was given at all — see below.
   */
  minDocumentsWeightKg: 0.01,
  /**
   * What a document shipment is booked as when nobody weighed it.
   *
   * The customer is not asked: the price is flat, so the number would change
   * nothing they can see, and "how much does an envelope weigh" is a question
   * with no useful answer. But `shipments.weight_kg` is `not null` and feeds
   * the load planning — a trip sums the weight of its shipments against the
   * vehicle's payload — so a value has to be stored.
   *
   * 100 grams is a realistic envelope with a few certified copies. Erring
   * low is the right direction here: a document shipment that quietly
   * consumed 2 kg of a van's payload would push out a parcel that actually
   * needed the space.
   */
  documentsAssumedWeightKg: 0.1,
  currency: 'EUR',
} as const;

export type PricingConfig = typeof pricingConfig;
