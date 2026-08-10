import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { PriceCalculator } from '@/components/booking/price-calculator';
import { Button } from '@/components/ui/button';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Preisrechner',
  description:
    'Berechne den Preis für deine Sendung nach Marokko: 2 €/kg, Mindestpreis 20 €, Abholung +10 €.',
};

const examples = [
  { weight: 5, pickup: false },
  { weight: 10, pickup: false },
  { weight: 10, pickup: true },
  { weight: 25, pickup: false },
  { weight: 25, pickup: true },
  { weight: 50, pickup: true },
];

export default async function CalculatorPage() {
  const t = await getT();
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
          {t('calculator.subtitle')} Der angezeigte Preis ist der Preis, den du zahlst — wir prüfen
          das Gewicht bei der Annahme und sprechen Abweichungen immer vorher mit dir ab.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <PriceCalculator />

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="surface p-5">
            <h2 className="text-base font-semibold">So rechnen wir</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex justify-between gap-3">
                <span>Preis pro Kilogramm</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCents(pricingConfig.pricePerKgCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Mindestpreis</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCents(pricingConfig.minimumPriceCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Abholung beim Kunden</span>
                <span className="font-semibold text-foreground tabular-nums">
                  +{formatCents(pricingConfig.pickupFeeCents)}
                </span>
              </li>
              <li className="flex justify-between gap-3 border-t border-border pt-3">
                <span>Sperrgut</span>
                <span className="font-semibold text-foreground">Festpreis auf Anfrage</span>
              </li>
            </ul>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              Bis einschließlich 10 kg gilt der Mindestpreis von{' '}
              {formatCents(pricingConfig.minimumPriceCents)}. Ab 10 kg zahlst du genau{' '}
              {formatCents(pricingConfig.pricePerKgCents)} pro Kilo.
            </p>
          </div>

          <div className="surface p-5">
            <h2 className="text-base font-semibold">Beispiele</h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Gewicht</th>
                  <th className="pb-2 font-medium">Abholung</th>
                  <th className="pb-2 text-right font-medium">Preis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {examples.map((example) => {
                  const base = Math.max(
                    pricingConfig.minimumPriceCents,
                    example.weight * pricingConfig.pricePerKgCents,
                  );
                  const total = base + (example.pickup ? pricingConfig.pickupFeeCents : 0);
                  return (
                    <tr key={`${example.weight}-${example.pickup}`}>
                      <td className="py-2 tabular-nums">{example.weight} kg</td>
                      <td className="py-2 text-muted-foreground">
                        {example.pickup ? 'ja' : 'nein'}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {formatCents(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="surface p-5">
            <h2 className="text-base font-semibold">Sperrig oder sehr schwer?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Für Waschmaschinen, Kühlschränke, Möbel, Fahrräder oder Autoteile machen wir dir einen
              persönlichen Festpreis.
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
