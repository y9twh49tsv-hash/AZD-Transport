import { Lock, MapPin, Package, ShieldCheck, Weight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { cityName, countryFlags } from '@/config/regions';
import { statusMeta, statusProgress, HAPPY_PATH } from '@/lib/shipment-status';
import { formatDateTime, formatRelative } from '@/lib/utils';
import { formatWeight } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { PublicTracking } from '@/lib/tracking';
import { t } from '@/lib/i18n';

/**
 * The public tracking view.
 *
 * It only ever renders fields from `PublicTracking` — no addresses, phone
 * numbers, e-mail addresses, prices or internal notes exist in this component's
 * input at all.
 */
export function TrackingResult({ data }: { data: PublicTracking }) {
  const progress = statusProgress(data.status);
  const isCancelled = data.status === 'CANCELLED';
  const isException = data.status === 'EXCEPTION';
  const currentIndex = HAPPY_PATH.indexOf(data.status);

  return (
    <div className="space-y-6">
      {/* Headline card */}
      <div className="surface overflow-hidden">
        <div className="corridor-gradient border-b border-border p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sendungsnummer
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                {data.trackingNumber}
              </p>
            </div>
            <StatusBadge status={data.status} className="px-3 py-1.5 text-sm" />
          </div>

          <p className="mt-4 text-base leading-relaxed text-foreground">
            {statusMeta[data.status].publicMessage}
          </p>

          {!isCancelled && (
            <div className="mt-6">
              <div className="h-2 overflow-hidden rounded-full bg-card">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    isException ? 'bg-destructive' : 'bg-primary',
                  )}
                  style={{ width: `${Math.max(progress, 4)}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Fortschritt der Sendung"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
                <span>
                  {countryFlags[data.originCountry]} {cityName(data.originCity)}
                </span>
                <span>
                  {cityName(data.destinationCity)} {countryFlags[data.destinationCountry]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Facts */}
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          <Fact icon={MapPin} label="Route">
            {cityName(data.originCity)}
            <span className="mx-1 text-muted-foreground">→</span>
            {cityName(data.destinationCity)}
          </Fact>
          <Fact icon={Package} label="Gepäckstücke">
            {data.pieceCount}
          </Fact>
          <Fact icon={Weight} label="Gesamtgewicht">
            {formatWeight(data.weightKg)}
          </Fact>
          <Fact icon={Lock} label={t('tracking.lastUpdate')}>
            {formatRelative(data.lastUpdate)}
          </Fact>
        </dl>
      </div>

      {/* Security seal */}
      {data.sealNumber && (
        <Alert tone="success" title="Versiegelte Sendung" icon={false}>
          <span className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span>
              {t('tracking.sealed', { seal: data.sealNumber })}. Prüfe bei der Übergabe, dass die
              Nummer auf dem Sicherheitsbeutel mit dieser Nummer übereinstimmt und der Verschluss
              unbeschädigt ist.
            </span>
          </span>
        </Alert>
      )}

      {/* Timeline */}
      <section className="surface p-5 sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight">{t('tracking.history')}</h2>

        {data.events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Für diese Sendung liegen noch keine Statusmeldungen vor.
          </p>
        ) : (
          <ol className="mt-6 space-y-0">
            {data.events.map((event, index) => {
              const meta = statusMeta[event.status];
              const Icon = meta.icon;
              const isLatest = index === 0;

              return (
                <li key={`${event.status}-${event.occurredAt}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < data.events.length - 1 && (
                    <span
                      className="absolute left-[1.1875rem] top-10 bottom-0 w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border',
                      isLatest
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className={cn('text-sm font-semibold', isLatest && 'text-primary')}>
                      {meta.label}
                    </p>
                    {event.message && (
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {event.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(event.occurredAt)}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {currentIndex >= 0 && currentIndex < HAPPY_PATH.length - 1 && (
          <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
            Nächster Schritt:{' '}
            <span className="font-medium text-foreground">
              {statusMeta[HAPPY_PATH[currentIndex + 1]].label}
            </span>
          </p>
        )}
      </section>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {t('tracking.privacyNote')}
      </p>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold leading-snug">{children}</dd>
    </div>
  );
}
