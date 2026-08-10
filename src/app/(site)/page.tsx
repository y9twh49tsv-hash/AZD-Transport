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
import { t } from '@/lib/i18n';

const advantages = [
  {
    icon: Truck,
    title: 'Persönliche Abholung',
    text: 'Auf Wunsch holen wir deine Sendung im Rhein-Main-Gebiet direkt bei dir zu Hause ab — für pauschal 10 €.',
  },
  {
    icon: Hash,
    title: 'Feste Sendungsnummer',
    text: `Jede Sendung bekommt sofort eine eindeutige Nummer wie ${exampleTrackingNumber}. Damit findest du sie jederzeit wieder.`,
  },
  {
    icon: QrCode,
    title: 'QR-Code auf jedem Paket',
    text: 'Ein aufgeklebtes Label mit QR-Code. Unser Team scannt es an jeder Station — ohne dass deine Daten auf dem Paket stehen.',
  },
  {
    icon: PackageSearch,
    title: 'Statusverfolgung',
    text: 'Von „Gebucht“ bis „Zugestellt“: jeder Schritt wird protokolliert und ist für dich online sichtbar.',
  },
  {
    icon: ShieldCheck,
    title: 'Sichere Dokumentation',
    text: 'Große Sendungen versiegeln wir mit nummerierten Sicherheitsbeuteln. Die Plombennummer siehst du im Tracking.',
  },
  {
    icon: BadgeEuro,
    title: 'Transparente Preise',
    text: 'Kein Kleingedrucktes: 2 € pro Kilo, mindestens 20 €, Abholung 10 €. Sperrgut bekommt einen Festpreis vorab.',
  },
];

const steps = [
  { title: 'Preis berechnen', text: 'Gewicht eingeben, Preis sofort sehen — ohne Anmeldung.' },
  { title: 'Sendung buchen', text: 'Absender und Empfänger eintragen, fertig in wenigen Minuten.' },
  { title: 'Abgeben oder abholen lassen', text: 'Du bringst sie vorbei oder wir kommen zu dir.' },
  { title: 'Verfolgen bis zur Übergabe', text: 'Statusupdates bis die Sendung in Marokko ankommt.' },
];

export default function HomePage() {
  const activeDe = cities.filter((c) => c.country === 'DE' && c.active);
  const activeMa = cities.filter((c) => c.country === 'MA' && c.active);

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
                Deine Pakete sicher von{' '}
                <span className="text-primary">Deutschland</span> nach{' '}
                <span className="text-accent">Marokko</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t('home.subline')}
              </p>

              {/* Price facts — the three numbers people actually want */}
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Pakete ab',
                    value: `${formatCents(pricingConfig.pricePerKgCents)}/kg`,
                  },
                  { label: 'Mindestpreis', value: formatCents(pricingConfig.minimumPriceCents) },
                  { label: 'Abholung', value: `+${formatCents(pricingConfig.pickupFeeCents)}` },
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
                Sperrige Gegenstände (Möbel, Geräte, Fahrräder): individueller Pauschalpreis nach Foto
                und Maßen.
              </p>

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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">So einfach geht&apos;s</h2>
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Unser Liniengebiet</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              Wir starten im Rhein-Main-Gebiet und in der Region Nador. Weitere Städte kommen
              laufend dazu — frag einfach nach, wenn deine Stadt noch fehlt.
            </p>
            <Link href="/kontakt" className="mt-6 inline-block">
              <Button variant="outline">
                Stadt anfragen
                <ArrowRight aria-hidden />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { flag: '🇩🇪', title: 'Deutschland', hint: 'Frankfurt & Rhein-Main', list: activeDe },
              { flag: '🇲🇦', title: 'Marokko', hint: 'Nador & Umgebung', list: activeMa },
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
            Bereit für deine Sendung?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Preis berechnen, buchen, Sendungsnummer erhalten — in wenigen Minuten erledigt.
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
