import type { Metadata } from 'next';
import { LegalPage, Section } from '@/components/layout/legal-page';
import { brand } from '@/config/brand';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImprintPage() {
  return (
    <LegalPage title="Impressum" intro="Angaben gemäß § 5 DDG (ehemals § 5 TMG).">
      <Section title="Diensteanbieter">
        <p>
          {brand.legalName}
          <br />
          {brand.address.street}
          <br />
          {brand.address.zip} {brand.address.city}
          <br />
          {brand.address.country}
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Telefon: {brand.phone}
          <br />
          E-Mail: {brand.email}
        </p>
      </Section>

      <Section title="Vertretungsberechtigte Person">
        <p>
          <strong>[Vor- und Nachname der Inhaberin / des Inhabers eintragen]</strong>
        </p>
      </Section>

      <Section title="Umsatzsteuer-Identifikationsnummer">
        <p>
          <strong>[USt-IdNr. gemäß § 27 a UStG eintragen — oder Hinweis auf Kleinunternehmerregelung nach § 19 UStG]</strong>
        </p>
      </Section>

      <Section title="Registereintrag / Erlaubnis">
        <p>
          <strong>
            [Falls vorhanden: Handelsregister und Registernummer eintragen. Für gewerblichen
            Güterkraftverkehr ist zusätzlich die Erlaubnis nach § 3 GüKG bzw. die
            EU-Gemeinschaftslizenz nach VO (EG) 1072/2009 anzugeben. Bitte anwaltlich prüfen
            lassen, welche Erlaubnis für dein konkretes Geschäftsmodell erforderlich ist.]
          </strong>
        </p>
      </Section>

      <Section title="Redaktionell verantwortlich">
        <p>
          <strong>[Name und Anschrift der verantwortlichen Person eintragen]</strong>
        </p>
      </Section>

      <Section title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            className="font-medium text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          . Unsere E-Mail-Adresse findest du oben.
        </p>
      </Section>

      <Section title="Verbraucherstreitbeilegung">
        <p>
          <strong>
            [Angabe ergänzen: Wir sind (nicht) bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.]
          </strong>
        </p>
      </Section>
    </LegalPage>
  );
}
