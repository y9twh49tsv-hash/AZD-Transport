'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowRightLeft, FileText, Info, Package, Sofa, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/input';
import { calculatePrice, formatCents, formatWeight } from '@/lib/pricing';
import { pricingConfig } from '@/config/pricing';
import { citiesByCountry, countryFlags, type CountryCode } from '@/config/regions';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import type { Translate } from '@/lib/i18n';

type ShipmentType = 'standard' | 'documents' | 'bulky';

export type CalculatorState = {
  originCountry: CountryCode;
  originCity: string;
  destinationCountry: CountryCode;
  destinationCity: string;
  weight: string;
  pickup: boolean;
  shipmentType: ShipmentType;
};

const DEFAULT_STATE: CalculatorState = {
  originCountry: 'DE',
  originCity: 'frankfurt-am-main',
  destinationCountry: 'MA',
  destinationCity: 'nador',
  weight: '',
  pickup: false,
  shipmentType: 'standard',
};

function CityOptions({ country, t }: { country: CountryCode; t: Translate }) {
  return (
    <>
      {citiesByCountry(country).map((city) => (
        <option key={city.slug} value={city.slug}>
          {city.name}
          {city.region ? ` · ${city.region}` : ''}
          {city.active ? '' : ` (${t('calculator.cityOnRequest')})`}
        </option>
      ))}
    </>
  );
}

/**
 * The public price calculator.
 *
 * It shows the price instantly, but the number shown here is never what gets
 * stored: `/buchen` recalculates it on the server from the same
 * `calculatePrice` function before writing the shipment.
 */
export function PriceCalculator({
  compact = false,
  initial,
}: {
  compact?: boolean;
  initial?: Partial<CalculatorState>;
}) {
  const t = useT();
  const [state, setState] = useState<CalculatorState>({ ...DEFAULT_STATE, ...initial });

  const weightNumber = Number.parseFloat(state.weight.replace(',', '.'));
  const hasWeight = Number.isFinite(weightNumber) && weightNumber > 0;

  const breakdown = useMemo(
    () =>
      calculatePrice({
        weightKg: hasWeight ? weightNumber : 0,
        pickupRequested: state.pickup,
        shipmentType: state.shipmentType,
      }),
    [hasWeight, weightNumber, state.pickup, state.shipmentType],
  );

  const isDocuments = state.shipmentType === 'documents';

  /**
   * Wann ein Preis angezeigt werden darf.
   *
   * Für Dokumente sofort — er hängt an nichts, was noch einzugeben wäre.
   * Für Pakete erst mit einem Gewicht, weil es dort der Preis ist.
   */
  const priceReady = isDocuments || hasWeight;

  const tooHeavy = hasWeight && weightNumber > pricingConfig.maxStandardWeightKg;
  /** Kein Preis und kein Weiter, solange das Gewicht nicht zur Sendungsart passt. */
  const blocked = tooHeavy;

  function swapDirection() {
    setState((prev) => ({
      ...prev,
      originCountry: prev.destinationCountry,
      originCity: prev.destinationCity,
      destinationCountry: prev.originCountry,
      destinationCity: prev.originCity,
    }));
  }

  function setCountry(side: 'origin' | 'destination', country: CountryCode) {
    const other: CountryCode = country === 'DE' ? 'MA' : 'DE';
    setState((prev) => ({
      ...prev,
      ...(side === 'origin'
        ? {
            originCountry: country,
            originCity: citiesByCountry(country)[0]?.slug ?? '',
            destinationCountry: other,
            destinationCity:
              prev.destinationCountry === other
                ? prev.destinationCity
                : (citiesByCountry(other)[0]?.slug ?? ''),
          }
        : {
            destinationCountry: country,
            destinationCity: citiesByCountry(country)[0]?.slug ?? '',
            originCountry: other,
            originCity:
              prev.originCountry === other ? prev.originCity : (citiesByCountry(other)[0]?.slug ?? ''),
          }),
    }));
  }

  const bookingHref = {
    pathname: '/buchen',
    query: {
      von: state.originCountry,
      vonStadt: state.originCity,
      nach: state.destinationCountry,
      nachStadt: state.destinationCity,
      gewicht: hasWeight ? String(weightNumber) : '',
      abholung: state.pickup ? '1' : '0',
      art: state.shipmentType,
    },
  };

  const bulkyHref = {
    pathname: '/sperrgut',
    query: {
      von: state.originCountry,
      vonStadt: state.originCity,
      nach: state.destinationCountry,
      nachStadt: state.destinationCity,
      gewicht: hasWeight ? String(weightNumber) : '',
    },
  };

  return (
    <div className={cn('surface overflow-hidden', compact ? '' : 'shadow-lift')}>
      <div className="space-y-5 p-5 sm:p-6">
        {/* Shipment type */}
        <fieldset>
          <legend className="field-label">{t('calculator.typeLabel')}</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {(
              [
                {
                  value: 'standard' as const,
                  icon: Package,
                  label: t('calculator.typeStandard'),
                  hint: t('calculator.typeStandardHint'),
                },
                {
                  value: 'documents' as const,
                  icon: FileText,
                  label: t('calculator.typeDocuments'),
                  hint: t('calculator.typeDocumentsHint'),
                },
                {
                  value: 'bulky' as const,
                  icon: Sofa,
                  label: t('calculator.typeBulky'),
                  hint: t('calculator.typeBulkyHint'),
                },
              ]
            ).map((option) => {
              const Icon = option.icon;
              const active = state.shipmentType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      shipmentType: option.value,
                      // Ein vorher eingetipptes Paketgewicht muss weg: für
                      // Dokumente wird es nicht mehr abgefragt, bliebe also
                      // unsichtbar stehen und könnte den Preis blockieren.
                      weight: option.value === 'documents' ? '' : prev.weight,
                    }))
                  }
                  aria-pressed={active}
                  className={cn(
                    'flex min-h-[4.5rem] flex-col items-start gap-1 rounded-xl border p-3.5 text-start transition-colors',
                    active
                      ? 'border-primary bg-primary-muted'
                      : 'border-border bg-card hover:bg-secondary',
                  )}
                >
                  <Icon className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
                  <span className="text-sm font-semibold leading-tight">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Route */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <Field label={t('common.from')} htmlFor="calc-origin-country">
            <Select
              id="calc-origin-country"
              value={state.originCountry}
              onChange={(e) => setCountry('origin', e.target.value as CountryCode)}
            >
              {(['DE', 'MA'] as CountryCode[]).map((c) => (
                <option key={c} value={c}>
                  {countryFlags[c]} {t(`countries.${c}`)}
                </option>
              ))}
            </Select>
          </Field>

          <button
            type="button"
            onClick={swapDirection}
            className="mb-0.5 hidden size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
            aria-label={t('calculator.swapDirection')}
          >
            <ArrowRightLeft className="size-4" aria-hidden />
          </button>

          <Field label={t('common.to')} htmlFor="calc-destination-country">
            <Select
              id="calc-destination-country"
              value={state.destinationCountry}
              onChange={(e) => setCountry('destination', e.target.value as CountryCode)}
            >
              {(['DE', 'MA'] as CountryCode[]).map((c) => (
                <option key={c} value={c}>
                  {countryFlags[c]} {t(`countries.${c}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('calculator.originCity')} htmlFor="calc-origin-city">
            <Select
              id="calc-origin-city"
              value={state.originCity}
              onChange={(e) => setState((prev) => ({ ...prev, originCity: e.target.value }))}
            >
              <CityOptions country={state.originCountry} t={t} />
            </Select>
          </Field>

          <Field label={t('calculator.destinationCity')} htmlFor="calc-destination-city">
            <Select
              id="calc-destination-city"
              value={state.destinationCity}
              onChange={(e) => setState((prev) => ({ ...prev, destinationCity: e.target.value }))}
            >
              <CityOptions country={state.destinationCountry} t={t} />
            </Select>
          </Field>
        </div>

        {/*
          Gewicht — bei Dokumenten gar nicht erst gefragt. Der Preis ist
          pauschal, die Zahl würde also nichts verändern, was der Kunde sehen
          kann; ein Pflichtfeld ohne Wirkung ist nur eine Hürde vor dem Preis.
        */}
        {!isDocuments && (
        <Field
          label={t('calculator.weightLabel')}
          htmlFor="calc-weight"
          hint={
            state.shipmentType === 'bulky'
              ? t('calculator.weightHintBulky')
              : t('calculator.weightHintStandard', {
                  minimum: formatCents(pricingConfig.minimumPriceCents),
                  perKg: formatCents(pricingConfig.pricePerKgCents),
                })
          }
          error={
            tooHeavy && state.shipmentType === 'standard'
              ? t('calculator.tooHeavyStandard', { max: pricingConfig.maxStandardWeightKg })
              : null
          }
        >
          <div className="relative">
            <Input
              id="calc-weight"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={t('calculator.weightPlaceholder')}
              value={state.weight}
              aria-invalid={tooHeavy && state.shipmentType === 'standard'}
              onChange={(e) =>
                setState((prev) => ({ ...prev, weight: e.target.value.replace(/[^\d.,]/g, '') }))
              }
              className="pe-14 text-lg font-semibold"
            />
            <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-sm font-medium text-muted-foreground">
              kg
            </span>
          </div>
        </Field>
        )}

        {isDocuments && (
          <p className="rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
            {t('calculator.documentsExplain', {
              price: formatCents(pricingConfig.documentsPriceCents),
              max: pricingConfig.maxDocumentsWeightKg,
            })}
          </p>
        )}

        {/* Pickup */}
        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, pickup: !prev.pickup }))}
          aria-pressed={state.pickup}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors',
            state.pickup ? 'border-primary bg-primary-muted' : 'border-border bg-card hover:bg-secondary',
          )}
        >
          <Truck
            className={cn('size-5 shrink-0', state.pickup ? 'text-primary' : 'text-muted-foreground')}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t('calculator.pickupLabel')}</span>
            <span className="block text-xs text-muted-foreground">{t('calculator.pickupHint', { pickup: formatCents(pricingConfig.pickupFeeCents) })}</span>
          </span>
          <span
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors',
              state.pickup ? 'bg-primary' : 'bg-input',
            )}
          >
            <span
              className={cn(
                'absolute top-1 size-5 rounded-full bg-white shadow transition-all',
                state.pickup ? 'start-6' : 'start-1',
              )}
            />
          </span>
        </button>
      </div>

      {/* Result */}
      <div className="border-t border-border bg-secondary/40 p-5 sm:p-6">
        {state.shipmentType === 'bulky' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <p className="text-base font-semibold">{t('calculator.bulkyNotice')}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t('calculator.bulkyExplain')}
                </p>
              </div>
            </div>
            <Link href={bulkyHref}>
              <Button variant="accent" size="lg" block>
                {t('common.bulkyQuote')}
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('calculator.yourPrice')}</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {priceReady && !blocked ? formatCents(breakdown.totalCents) : '—'}
                </p>
              </div>
              {priceReady && !blocked && (
                <p className="pb-1.5 text-end text-xs text-muted-foreground">
                  {/* Bei Dokumenten gibt es kein Gewicht zu nennen. */}
                  {!isDocuments && (
                    <>
                      {t('calculator.forWeight', { weight: formatWeight(weightNumber) })}
                      <br />
                    </>
                  )}
                  {state.pickup ? t('calculator.inclPickup') : t('calculator.dropOff')}
                </p>
              )}
            </div>

            {priceReady && !blocked && (
              <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {state.shipmentType === 'documents'
                      ? t('calculator.breakdownDocuments')
                      : breakdown.minimumApplied
                        ? t('calculator.breakdownMinimum')
                        : t('calculator.breakdownWeight', { weight: formatWeight(weightNumber) })}
                  </dt>
                  <dd className="font-medium tabular-nums">{formatCents(breakdown.basePriceCents)}</dd>
                </div>
                {breakdown.pickupFeeCents > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('calculator.breakdownPickup')}</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCents(breakdown.pickupFeeCents)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-border pt-1.5">
                  <dt className="font-semibold">{t('common.total')}</dt>
                  <dd className="font-bold tabular-nums">{formatCents(breakdown.totalCents)}</dd>
                </div>
              </dl>
            )}

            <Link href={bookingHref} aria-disabled={!priceReady || blocked}>
              <Button size="lg" block disabled={!priceReady || blocked}>
                {t('common.bookShipment')}
                <ArrowRight aria-hidden />
              </Button>
            </Link>

            {!priceReady && (
              <p className="text-center text-xs text-muted-foreground">
                {t('calculator.enterWeight')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
