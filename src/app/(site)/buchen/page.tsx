import type { Metadata } from 'next';
import { BookingForm, type BookingDefaults } from '@/components/booking/booking-form';
import { SetupNotice } from '@/components/layout/setup-notice';
import { findCity, type CountryCode } from '@/config/regions';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Sendung buchen',
  description:
    'Buche deine Sendung von Deutschland nach Marokko in wenigen Minuten — mit sofortiger Sendungsnummer.',
};

/**
 * Prefills come from the calculator via query parameters. Everything is
 * re-validated on the server, so a manipulated URL can only produce a
 * pre-filled form, never a wrong price.
 */
function parseDefaults(params: Record<string, string | string[] | undefined>): BookingDefaults {
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
  const weightKg = Number.isFinite(weightRaw) && weightRaw > 0 ? weightRaw : undefined;

  return {
    originCountry,
    destinationCountry,
    originCity: originCity?.country === originCountry ? originCity.slug : undefined,
    destinationCity:
      destinationCity?.country === destinationCountry ? destinationCity.slug : undefined,
    weightKg,
    pickupRequested: get('abholung') === '1',
  };
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const defaults = parseDefaults(params);

  return (
    <div className="container max-w-5xl py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('booking.title')}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Vier kurze Schritte. Du bekommst sofort eine feste Sendungsnummer und eine Bestätigung per
          E-Mail — ein Konto brauchst du dafür nicht.
        </p>
      </header>

      <SetupNotice className="mb-8" />

      <BookingForm defaults={defaults} />
    </div>
  );
}
