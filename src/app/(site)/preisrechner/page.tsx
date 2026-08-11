import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { PriceCalculator } from '@/components/booking/price-calculator';
import { Button } from '@/components/ui/button';
import { pricingConfig } from '@/config/pricing';
import { calculatePrice, formatCents } from '@/lib/pricing';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t('calculatorPage.metaTitle'),
    description: t('calculatorPage.metaDescription', {
      perKg: formatCents(pricingConfig.pricePerKgCents),
      minimum: formatCents(pricingConfig.minimumPriceCents),
      pickup: formatCents(pricingConfig.pickupFeeCents),
    }),
  };
}

const exampleWeights = [
  { weight: 5, pickup: false },
  { weight: 10, pickup: false },
  { weight: 10, pickup: true },
  { weight: 25, pickup: false },
  { weight: 25, pickup: true },
  { weight: 50, pickup: true },
];

/**
 * The weight at which the per-kilo price overtakes the minimum price.
 *
 * Derived, never written down: if either number in `pricingConfig` changes, the
 * sentence below changes with it instead of quietly becoming wrong.
 */
const breakEvenKg = pricingConfig.minimumPriceCents / pricingConfig.pricePerKgCents;

export default async function CalculatorPage() {
  const t = await getT();

  // Dieselbe Funktion, die auch der Server bei der Buchung benutzt — die
  // Beispieltabelle darf die Preisformel nicht ein zweites Mal enthalten.
  const examples = exampleWeights.map((example) => ({
    ...example,
    totalCents: calculatePrice({
      weightKg: example.weight,
      pickupRequested: example.pickup,
      shipmentType: 'standard',
    }).totalCents,
  }));

  return (
    <div className="container max-w-5xl py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <Calculator className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          {t('calculator.title')}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {t('calculator.subtitle')} {t('calculatorPage.intro')}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <PriceCalculator />

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="surface p-5">
            <h2 className="text-base font-semibold">{t('calculatorPage.howTitle')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex justify-between gap-3">
                <span>{t('calculatorPage.rowPerKilo')}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCents(pricingConfig.pricePerKgCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>{t('calculatorPage.rowMinimum')}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCents(pricingConfig.minimumPriceCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>{t('calculatorPage.rowPickup')}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  +{formatCents(pricingConfig.pickupFeeCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>
                  {t('calculatorPage.rowDocuments', { max: pricingConfig.maxDocumentsWeightKg })}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCents(pricingConfig.documentsPriceCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3 border-t border-border pt-3">
                <span>{t('calculatorPage.rowBulky')}</span>
                <span className="font-semibold text-foreground">
                  {t('calculatorPage.bulkyOnRequest')}
                </span>
              </li>
            </ul>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              {t('calculatorPage.minimumNote', {
                breakEven: breakEvenKg,
                minimum: formatCents(pricingConfig.minimumPriceCents),
                perKg: formatCents(pricingConfig.pricePerKgCents),
              })}
            </p>
          </div>

          <div className="surface p-5">
            <h2 className="text-base font-semibold">{t('calculatorPage.examplesTitle')}</h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-start text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 text-start font-medium">{t('calculatorPage.colWeight')}</th>
                  <th className="pb-2 text-start font-medium">{t('calculatorPage.colPickup')}</th>
                  <th className="pb-2 text-end font-medium">{t('calculatorPage.colPrice')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {examples.map((example) => (
                  <tr key={`${example.weight}-${example.pickup}`}>
                    <td className="py-2 tabular-nums">{example.weight} kg</td>
                    <td className="py-2 text-muted-foreground">
                      {example.pickup ? t('common.yes') : t('common.nope')}
                    </td>
                    <td className="py-2 text-end font-semibold tabular-nums">
                      {formatCents(example.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="surface p-5">
            <h2 className="text-base font-semibold">{t('calculatorPage.bulkyTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('calculatorPage.bulkyText')}
            </p>
            <Link href="/sperrgut" className="mt-4 inline-block">
              <Button variant="accent" block>
                {t('common.bulkyQuote')}
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
