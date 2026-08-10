import { describe, expect, it } from 'vitest';
import { calculatePrice, formatCents, parseEuroToCents } from './pricing';

const standard = (weightKg: number, pickupRequested = false) =>
  calculatePrice({ weightKg, pickupRequested, shipmentType: 'standard' });

describe('calculatePrice — standard shipments', () => {
  it('charges the 20 € minimum for light shipments', () => {
    expect(standard(1).totalCents).toBe(2000);
    expect(standard(5).totalCents).toBe(2000);
    expect(standard(9.9).totalCents).toBe(2000);
  });

  it('charges exactly 20 € at the 10 kg break-even point', () => {
    const result = standard(10);
    expect(result.totalCents).toBe(2000);
    // 10 kg × 2 € = 20 € equals the minimum, so the minimum is not "applied"
    expect(result.minimumApplied).toBe(false);
  });

  it('flags when the minimum price was applied', () => {
    expect(standard(3).minimumApplied).toBe(true);
    expect(standard(25).minimumApplied).toBe(false);
  });

  it('charges 2 €/kg above 10 kg', () => {
    expect(standard(10.5).totalCents).toBe(2100);
    expect(standard(25).totalCents).toBe(5000);
    expect(standard(50).totalCents).toBe(10000);
    expect(standard(120).totalCents).toBe(24000);
  });

  it('adds the 10 € pickup fee', () => {
    expect(standard(10, true).totalCents).toBe(3000);
    expect(standard(25, true).totalCents).toBe(6000);
    expect(standard(50, true).totalCents).toBe(11000);
    expect(standard(5, true).totalCents).toBe(3000);
  });

  it('matches every example from the specification', () => {
    const cases: Array<[number, boolean, number]> = [
      [5, false, 2000],
      [10, false, 2000],
      [10, true, 3000],
      [25, false, 5000],
      [25, true, 6000],
      [50, true, 11000],
    ];
    for (const [weight, pickup, expected] of cases) {
      expect(standard(weight, pickup).totalCents).toBe(expected);
    }
  });

  it('handles fractional weights without float drift', () => {
    expect(standard(10.1).totalCents).toBe(2020);
    expect(standard(12.3).totalCents).toBe(2460);
    expect(standard(33.33).totalCents).toBe(6666);
  });

  it('never returns a negative or NaN total', () => {
    expect(standard(-5).totalCents).toBe(2000);
    expect(standard(Number.NaN).totalCents).toBe(2000);
    expect(standard(Number.POSITIVE_INFINITY).totalCents).toBe(2000);
  });

  it('breaks the price down transparently', () => {
    const result = standard(25, true);
    expect(result.weightPriceCents).toBe(5000);
    expect(result.basePriceCents).toBe(5000);
    expect(result.pickupFeeCents).toBe(1000);
    expect(result.totalCents).toBe(6000);
    expect(result.quotable).toBe(true);
  });
});

describe('calculatePrice — bulky shipments', () => {
  it('is never quotable automatically', () => {
    const result = calculatePrice({ weightKg: 80, pickupRequested: true, shipmentType: 'bulky' });
    expect(result.quotable).toBe(false);
    expect(result.totalCents).toBe(0);
    expect(result.basePriceCents).toBe(0);
  });
});

describe('money formatting', () => {
  it('formats cents as German euro amounts', () => {
    //   = non-breaking space inserted by Intl
    expect(formatCents(6000).replace(/ /g, ' ')).toBe('60,00 €');
    expect(formatCents(2000).replace(/ /g, ' ')).toBe('20,00 €');
    expect(formatCents(null)).toBe('—');
  });

  it('parses euro input in German and English notation', () => {
    expect(parseEuroToCents('85,50')).toBe(8550);
    expect(parseEuroToCents('85.50')).toBe(8550);
    expect(parseEuroToCents(' 85,50 € ')).toBe(8550);
    expect(parseEuroToCents('0')).toBe(0);
    expect(parseEuroToCents('abc')).toBeNull();
    expect(parseEuroToCents('-5')).toBeNull();
    expect(parseEuroToCents('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Dokumente — Pauschalpreis
// ---------------------------------------------------------------------------
describe('Dokumentenversand', () => {
  const doc = (weightKg: number, pickupRequested = false) =>
    calculatePrice({ weightKg, pickupRequested, shipmentType: 'documents' });

  it('kostet pauschal 10 €, unabhängig vom Gewicht', () => {
    // Der ganze Zweck der Sendungsart: ein Umschlag wiegt fast nichts, und der
    // Mindestpreis von 20 € würde die Leistung sinnlos verteuern.
    for (const kg of [0.01, 0.1, 0.5, 1, 2]) {
      expect(doc(kg).totalCents, `${kg} kg`).toBe(1000);
    }
  });

  it('rechnet die Abholung obendrauf', () => {
    expect(doc(0.2, true).totalCents).toBe(2000);
    expect(doc(0.2, true).pickupFeeCents).toBe(1000);
  });

  it('weist das Gewicht aus, ohne es zu berechnen', () => {
    const price = doc(1.5);
    expect(price.weightKg).toBe(1.5);
    expect(price.weightPriceCents).toBe(0);
    expect(price.minimumApplied).toBe(false);
  });

  it('ist billiger als dieselbe Sendung als Paket', () => {
    const alsPaket = calculatePrice({
      weightKg: 0.5,
      pickupRequested: false,
      shipmentType: 'standard',
    });
    expect(alsPaket.totalCents).toBe(2000);
    expect(doc(0.5).totalCents).toBeLessThan(alsPaket.totalCents);
  });

  it('liefert einen berechenbaren Preis — anders als Sperrgut', () => {
    expect(doc(1).quotable).toBe(true);
    expect(
      calculatePrice({ weightKg: 1, pickupRequested: false, shipmentType: 'bulky' }).quotable,
    ).toBe(false);
  });
});
