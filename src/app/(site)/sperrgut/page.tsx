import type { Metadata } from 'next';
import { Sofa } from 'lucide-react';
import { BulkyForm, type BulkyDefaults } from '@/components/booking/bulky-form';
import { SetupNotice } from '@/components/layout/setup-notice';
import { findCity, type CountryCode } from '@/config/regions';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Sperrgut anfragen',
  description:
    'Waschmaschine, Kühlschrank, Möbel oder Fahrrad nach Marokko? Lade Fotos hoch und erhalte einen Festpreis.',
};

const steps = [
  'Fotos aufnehmen',
  'Maße & Gewicht angeben',
  'Abhol- und Zielort wählen',
  'Anfrage senden',
];

export default async function BulkyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const country = (value: string | undefined, fallback: CountryCode): CountryCode =>
    value === 'DE' || value === 'MA' ? value : fallback;

  const originCountry = country(get('von'), 'DE');
  const destinationCountry = country(get('nach'), 'MA');
  const originCity = findCity(get('vonStadt'));
  const destinationCity = findCity(get('nachStadt'));
  const weightRaw = Number.parseFloat((get('gewicht') ?? '').replace(',', '.'));

  const defaults: BulkyDefaults = {
    originCountry,
    destinationCountry,
    originCity: originCity?.country === originCountry ? originCity.slug : undefined,
    destinationCity:
      destinationCity?.country === destinationCountry ? destinationCity.slug : undefined,
    approxWeightKg: Number.isFinite(weightRaw) && weightRaw > 0 ? weightRaw : undefined,
  };

  return (
    <div className="container max-w-3xl py-10 sm:py-14">
      <header className="mb-8">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Sofa className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('bulky.title')}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t('bulky.subtitle')} Für sperrige oder besonders schwere Güter gibt es keinen
          Kilopreis — du bekommst von uns einen verbindlichen Pauschalpreis.
        </p>

        <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-2 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              {step}
              {index < steps.length - 1 && <span className="ml-1 text-border">·</span>}
            </li>
          ))}
        </ol>
      </header>

      <SetupNotice className="mb-8" />

      <BulkyForm defaults={defaults} />
    </div>
  );
}
