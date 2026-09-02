import { openDetails, siteConfig, telLink } from '@/config/site';
import { content, type Locale } from '@/content';
import type { LegalSectionContent } from '@/content/types';
import { withdrawalForm } from '@/content';
import { IncompleteNotice, LegalPage, LegalSection, LegalSectionFromData, Value } from './legal';

/**
 * Die fünf Rechtsseiten.
 *
 * Drei davon — Datenschutz, Cookies, AGB — sind reiner Text und kommen
 * vollständig aus den Inhaltsdaten. Impressum und Widerrufsbelehrung nicht:
 * dort stehen Anbieterangaben, und die kommen aus `siteConfig` und werden
 * nicht übersetzt. Eine Anschrift hat keine Sprache.
 *
 * Deshalb tragen diese beiden Abschnitte in den Inhaltsdaten eine Kennung
 * statt Absätzen: übersetzt wird die Überschrift, gefüllt wird sie hier.
 */

/** Ein Abschnitt, den die Seite selbst füllt — sonst der Text aus den Daten. */
function Sections({
  sections,
  render,
}: {
  sections: LegalSectionContent[];
  render: (section: LegalSectionContent) => React.ReactNode | undefined;
}) {
  return (
    <>
      {sections.map((section) => {
        const own = section.id ? render(section) : undefined;
        if (own !== undefined) return own;
        return <LegalSectionFromData key={section.title} section={section} />;
      })}
    </>
  );
}

/** Anschrift und Kontakt des Anbieters — in beiden Sprachen dieselben. */
function ProviderAddress({ locale }: { locale: Locale }) {
  const { address } = siteConfig;
  return (
    <p>
      <Value locale={locale}>{siteConfig.legalName}</Value>
      <br />
      <Value locale={locale}>{siteConfig.legalForm}</Value>
      <br />
      <Value locale={locale}>{address.street}</Value>
      <br />
      <Value locale={locale}>{address.postalCode}</Value> {address.city}
      <br />
      {address.country}
    </p>
  );
}

export function ImprintPage({ locale }: { locale: Locale }) {
  const t = content(locale);
  const page = t.legal.imprint;

  return (
    <LegalPage title={page.title} intro={page.intro} locale={locale}>
      <IncompleteNotice items={openDetails()} locale={locale} />

      <Sections
        sections={page.sections}
        render={(section) => {
          switch (section.id) {
            case 'provider':
              return (
                <LegalSection key={section.title} title={section.title}>
                  <ProviderAddress locale={locale} />
                </LegalSection>
              );

            case 'contact':
              return (
                <LegalSection key={section.title} title={section.title}>
                  <p>
                    {t.request.phone}: <a href={telLink()}>{siteConfig.phone}</a>
                    <br />
                    {t.request.email}: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                  </p>
                </LegalSection>
              );

            // § 5 DDG verlangt die USt-IdNr. nur, „soweit vorhanden". Ist keine
            // hinterlegt, entfällt der Abschnitt — eine Überschrift ohne Inhalt
            // wirft mehr Fragen auf, als sie beantwortet.
            case 'vat':
              return siteConfig.vatId ? (
                <LegalSection key={section.title} title={section.title}>
                  <p>
                    <Value locale={locale}>{siteConfig.vatId}</Value>
                  </p>
                </LegalSection>
              ) : null;

            case 'responsible':
              return (
                <LegalSection key={section.title} title={section.title}>
                  <p>
                    <Value locale={locale}>{siteConfig.ownerName}</Value>
                    <br />
                    {siteConfig.address.street}
                    <br />
                    {siteConfig.address.postalCode} {siteConfig.address.city}
                  </p>
                </LegalSection>
              );

            default:
              return undefined;
          }
        }}
      />
    </LegalPage>
  );
}

export function WithdrawalPage({ locale }: { locale: Locale }) {
  const t = content(locale);
  const page = t.legal.withdrawal;
  const form = withdrawalForm(locale);
  const { address } = siteConfig;

  return (
    <LegalPage title={page.title} intro={page.intro} locale={locale}>
      <IncompleteNotice items={openDetails()} locale={locale} />

      <Sections
        sections={page.sections}
        render={(section) =>
          section.id === 'withdrawalForm' ? (
            <LegalSection key={section.title} title={form.title}>
              <p>{form.intro}</p>

              {/* Die Ausfülllinien sind Rahmen, keine Unterstriche. Eine Reihe
                  von Unterstrichen ist für den Browser ein einziges
                  unteilbares Wort — auf einem schmalen Bildschirm schiebt sie
                  die ganze Seite seitwärts. Ein Rahmen bricht nicht und lässt
                  sich außerdem ausdrucken. */}
              <div className="panel mt-6 space-y-5 p-6 text-[0.95rem] leading-relaxed">
                <p className="break-words">
                  {form.to} <Value locale={locale}>{siteConfig.legalName}</Value>,{' '}
                  <Value locale={locale}>{address.street}</Value>,{' '}
                  <Value locale={locale}>{address.postalCode}</Value> {address.city},{' '}
                  {t.request.email}: {siteConfig.email}
                </p>
                <p>{form.body}</p>

                {form.lines.map((label) => (
                  <p
                    key={label}
                    className="border-b border-border pb-7 text-sm text-muted-foreground"
                  >
                    {label}
                  </p>
                ))}

                <p className="text-sm text-muted-foreground">{form.footnote}</p>
              </div>
            </LegalSection>
          ) : undefined
        }
      />
    </LegalPage>
  );
}
