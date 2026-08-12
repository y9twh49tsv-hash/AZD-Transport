/**
 * Goods we do not carry.
 *
 * Only the ids live here — the wording is in the dictionaries under
 * `legal.prohibited.<id>Title` / `<id>Examples` / `<id>Note`, so the list reads
 * in the customer's language on the public page and in the booking form.
 *
 * ⚠ PLACEHOLDER — this list reflects common practice for private cross-border
 * road transport, not legal advice. Before going live, have it checked against
 * German export rules, Moroccan customs rules (Douane / ADII) and the ADR
 * dangerous-goods regulations, and align it with your insurance policy.
 *
 * Note on `documents`: passports and certificates are not banned outright —
 * they are exactly what the flat-rate document shipment exists for. What is
 * not allowed is sending them loose inside an ordinary parcel, where they
 * travel unsealed and uninsured. The wording in the dictionary says so, and it
 * has to keep saying so: a customer booking the documents service confirms
 * "no prohibited goods" in the same form.
 */

export type ProhibitedCategoryId = (typeof prohibitedCategoryIds)[number];

export const prohibitedCategoryIds = [
  'weapons',
  'drugs',
  'dangerous',
  'batteries',
  'money',
  'documents',
  'perishable',
  'counterfeit',
  'medical',
] as const;
