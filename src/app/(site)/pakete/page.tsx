import Link from 'next/link';
import {
  ArrowRight,
  BadgeEuro,
  ClipboardCheck,
  Hash,
  MapPin,
  PackageSearch,
  QrCode,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { PriceCalculator } from '@/components/booking/price-calculator';
import { SetupNotice } from '@/components/layout/setup-notice';
import { Button } from '@/components/ui/button';
import { brand, exampleTrackingNumber } from '@/config/brand';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { cities } from '@/config/regions';
import { getT } from '@/lib/i18n/server';

/**
 * The six advantage cards. Only the icons live here — the words come from the
 * dictionary, so the list is built inside the component where the request
 * locale is known.
 */
const advantageIcons = [Truck, Hash, QrCode, PackageSearch, ShieldCheck, BadgeEuro];
const advantageKeys = ['Pickup', 'Number', 'Qr', 'Status', 'Seal', 'Price'] as const;

export default async function HomePage() {
  const t = await getT();
  const activeDe = cities.filter((c) => c.country === 'DE' && c.active);
  const activeMa = cities.filter((c) => c.country === 'MA' && c.active);

  const perKg = formatCents(pricingConfig.pricePerKgCents);
  const minimum = formatCents(pricingConfig.minimumPriceCents);
  const pickup = formatCents(pricingConfig.pickupFeeCents);

  const advantages = advantageKeys.map((key, index) => ({
    icon: advantageIcons[index],
    title: t(`home.feature${key}Title`),
    text: t(`home.feature${key}Text`, {
      example: exampleTrackingNumber,
      perKg,
      minimum,
      pickup,
    }),
  }));

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`home.step${n}Title`),
    text: t(`home.step${n}Text`),
  }));

  /**
   * The headline highlights both country names in colour. The two names are
   * placeholders in the dictionary rather than a fixed "A nach B" order,
   * because the word order differs per language — French puts the preposition
   * on the country, Darija puts "safely" at the end of the sentence.
   */
  const headlineParts = t('home.headline').split(/(\{from\}|\{to\})/);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden corridor-gradient">
        <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" aria-hidden />
        <div className="container relative py-12 sm:py-16 lg:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:gap-14">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm">
                <span aria-hidden>🇩🇪</span>
                {t('home.eyebrow')}
                <span aria-hidden>🇲🇦</span>
              </p>

              <h1 className="mt-6 text-[2.1rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                {headlineParts.map((part, index) => {
                  if (part === '{from}') {
                    return (
                      <span key={index} className="text-primary">
                        {t('countries.DE')}
                      </span>
                    );
                  }
                  if (part === '{to}') {
                    return (
                      <span key={index} className="text-accent">
                        {t('countries.MA')}
                      </span>
                    );
                  }
                  return <span key={index}>{part}</span>;
                })}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t('home.subline')}
              </p>

              {/* Price facts — the three numbers people actually want */}
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { label: t('home.factParcels'), value: `${perKg}/kg` },
                  { label: t('home.factMinimum'), value: minimum },
                  { label: t('home.factPickup'), value: `+${pickup}` },
                ].map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-3 text-sm text-muted-foreground">
                {t('home.documentsNote', {
                  price: formatCents(pricingConfig.documentsPriceCents),
                  max: pricingConfig.maxDocumentsWeightKg,
                })}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('home.bulkyNote')}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('home.departures')}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/buchen">
                  <Button size="lg" block className="sm:w-auto">
                    {t('common.bookShipment')}
                    <ArrowRight aria-hidden />
                  </Button>
                </Link>
                <Link href="/tracking">
                  <Button size="lg" variant="outline" block className="sm:w-auto">
                    <PackageSearch aria-hidden />
                    {t('common.trackShipment')}
                  </Button>
                </Link>
                <Link href="/sperrgut">
                  <Button size="lg" variant="ghost" block className="sm:w-auto">
                    {t('common.bulkyQuote')}
                  </Button>
                </Link>
              </div>

              <SetupNotice className="mt-8 max-w-xl" />
            </div>

            {/* Calculator sits in the hero: the first thing a visitor can do */}
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{t('calculator.title')}</h2>
                <span className="text-xs text-muted-foreground">{t('calculator.subtitle')}</span>
              </div>
              <PriceCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Advantages */}
      <section className="container py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('home.whyTitle', { brand: brand.name })}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t('home.whySubtitle')}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="surface p-5 transition-shadow hover:shadow-lift">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ----------------------------------------------------------------- Steps */}
      <section className="border-y border-border bg-secondary/40 py-16 sm:py-20">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.stepsTitle')}</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Cities */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.areaTitle')}</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              {t('home.areaText')}
            </p>
            <Link href="/kontakt" className="mt-6 inline-block">
              <Button variant="outline">
                {t('home.areaCta')}
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                flag: '🇩🇪',
                title: t('countries.DE'),
                hint: t('home.areaFromHint'),
                list: activeDe,
              },
              {
                flag: '🇲🇦',
                title: t('countries.MA'),
                hint: t('home.areaToHint'),
                list: activeMa,
              },
            ].map((group) => (
              <div key={group.title} className="surface p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {group.flag}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{group.title}</h3>
                    <p className="text-xs text-muted-foreground">{group.hint}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {group.list.map((city) => (
                    <li key={city.slug} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {city.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border corridor-gradient p-8 text-center sm:p-14">
          <ClipboardCheck className="mx-auto size-10 text-primary" aria-hidden />
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('home.ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('home.ctaText')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/preisrechner">
              <Button size="lg" block className="sm:w-auto">
                {t('common.calculatePrice')}
                <ArrowRight aria-hidden />
              </Button>
            </Link>
            <Link href="/tracking">
              <Button size="lg" variant="outline" block className="sm:w-auto">
                {t('common.trackShipment')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
