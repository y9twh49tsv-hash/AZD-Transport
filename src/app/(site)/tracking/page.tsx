import type { Metadata } from 'next';
import { PackageSearch } from 'lucide-react';
import { TrackingSearch } from '@/components/tracking/tracking-search';
import { SetupNotice } from '@/components/layout/setup-notice';
import { statusMeta, HAPPY_PATH } from '@/lib/shipment-status';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Sendungsverfolgung',
  description: 'Verfolge deine Sendung zwischen Deutschland und Marokko mit deiner Sendungsnummer.',
};

export default async function TrackingPage() {
  const t = await getT();
  return (
    <div className="container max-w-3xl py-10 sm:py-16">
      <header className="text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary">
          <PackageSearch className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('tracking.title')}</h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
          {t('tracking.subtitle')}
        </p>
      </header>

      <div className="surface mt-8 p-5 sm:p-7">
        <TrackingSearch autoFocus />
        <p className="mt-3 text-xs text-muted-foreground">
          Die Sendungsnummer steht in deiner Buchungsbestätigung und auf dem Label.
        </p>
      </div>

      <SetupNotice className="mt-6" />

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Diese Stationen durchläuft deine Sendung</h2>
        <ol className="mt-6 space-y-3">
          {HAPPY_PATH.map((status, index) => {
            const meta = statusMeta[status];
            const Icon = meta.icon;
            return (
              <li key={status} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    <span className="mr-2 text-muted-foreground tabular-nums">{index + 1}.</span>
                    {meta.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{meta.publicMessage}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
