import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { brand } from '@/config/brand';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { cities, countryLabels } from '@/config/regions';
import { prohibitedCategoryIds } from '@/config/prohibited-items';
import { isWhatsAppConfigured } from '@/lib/notifications/whatsapp';
import { LOCALE_LABELS, LOCALES, t } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!isAdmin(user)) redirect('/kein-zugriff');

  const emailProvider = process.env.EMAIL_API_KEY
    ? (process.env.EMAIL_PROVIDER || 'resend')
    : 'nicht konfiguriert (E-Mails werden nur protokolliert)';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aktuelle Konfiguration der Anwendung
        </p>
      </header>

      <Alert tone="info" title="Wo diese Werte herkommen">
        Preise, Städte und die Marke liegen als Code in{' '}
        <code className="rounded bg-secondary px-1 text-xs">src/config/</code>. Änderungen dort
        gelten sofort überall in der Anwendung — im Rechner, in der Buchung und im Dashboard. So
        kann es keine zwei unterschiedlichen Preislogiken geben.
      </Alert>

      <section className="surface p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Settings className="size-4 text-primary" aria-hidden />
          Marke
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Name">{brand.name}</Row>
          <Row label="Rechtlicher Name">{brand.legalName}</Row>
          <Row label="Präfix der Sendungsnummer">{brand.trackingPrefix}</Row>
          <Row label="E-Mail">{brand.email}</Row>
          <Row label="Telefon">{brand.phone}</Row>
        </dl>
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Zum Umbenennen: <code className="rounded bg-secondary px-1">src/config/brand.ts</code>{' '}
          anpassen (oder die <code className="rounded bg-secondary px-1">NEXT_PUBLIC_BRAND_*</code>{' '}
          Variablen setzen). Wenn du das Nummernpräfix änderst, passe zusätzlich{' '}
          <code className="rounded bg-secondary px-1">app_settings.tracking_prefix</code> in
          Supabase an — bereits vergebene Nummern bleiben unverändert.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold">Preise</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Preis pro Kilogramm">{formatCents(pricingConfig.pricePerKgCents)}</Row>
          <Row label="Mindestpreis">{formatCents(pricingConfig.minimumPriceCents)}</Row>
          <Row label="Abholpauschale">{formatCents(pricingConfig.pickupFeeCents)}</Row>
          <Row label="Maximalgewicht Standardsendung">
            {pricingConfig.maxStandardWeightKg} kg
          </Row>
          <Row label="Sperrgut">Immer manueller Pauschalpreis</Row>
        </dl>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold">Liniengebiet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(['DE', 'MA'] as const).map((country) => {
            const list = cities.filter((c) => c.country === country);
            return (
              <div key={country}>
                <h3 className="text-sm font-semibold">{countryLabels[country]}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {list.map((city) => (
                    <li key={city.slug} className="flex justify-between gap-3">
                      <span>{city.name}</span>
                      <span className={city.active ? 'text-primary' : ''}>
                        {city.active ? 'aktiv' : 'auf Anfrage'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Neue Städte ergänzt du in <code className="rounded bg-secondary px-1">src/config/regions.ts</code>.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold">Benachrichtigungen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="E-Mail-Anbieter">{emailProvider}</Row>
          <Row label="Absenderadresse">{process.env.EMAIL_FROM || 'nicht gesetzt'}</Row>
          <Row label="WhatsApp Cloud API">
            {isWhatsAppConfigured() ? 'konfiguriert' : 'nicht konfiguriert (nur Deep-Links)'}
          </Row>
        </dl>
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Ohne <code className="rounded bg-secondary px-1">EMAIL_API_KEY</code> werden E-Mails nicht
          versendet, sondern nur im Serverlog vermerkt — praktisch für die Entwicklung, vor dem
          Start aber unbedingt konfigurieren.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold">Verbotene Waren</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {prohibitedCategoryIds.length} Kategorien. Die Kennungen stehen in{' '}
          <code className="rounded bg-secondary px-1 text-xs">src/config/prohibited-items.ts</code>,
          der Wortlaut in den vier Wörterbüchern unter{' '}
          <code className="rounded bg-secondary px-1 text-xs">legal.prohibited</code>. Die Liste
          erscheint im Buchungsformular und auf der öffentlichen Seite.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {prohibitedCategoryIds.map((id) => (
            <li
              key={id}
              className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs"
            >
              {t(`legal.prohibited.${id}Title`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold">Sprachen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Aktiv">
            {LOCALES.map((l) => `${LOCALE_LABELS[l]} (${l})`).join(' · ')}
          </Row>
          <Row label="Standard">Deutsch — auch die Rückfallsprache, wenn ein Text fehlt</Row>
          <Row label="Verwaltung & Fahrer">nur Deutsch</Row>
        </dl>
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Eine weitere Sprache ergänzt du, indem du{' '}
          <code className="rounded bg-secondary px-1">src/lib/i18n/dictionaries/de.ts</code>{' '}
          kopierst, übersetzt und in{' '}
          <code className="rounded bg-secondary px-1">src/lib/i18n/index.ts</code> registrierst.
        </p>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
