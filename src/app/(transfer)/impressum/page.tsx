import type { Metadata } from 'next';
import { IncompleteNotice, LegalPage, LegalSection, Value } from '@/components/transfer/legal';
import { openDetails, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Anbieterkennzeichnung nach § 5 DDG.',
  alternates: { canonical: '/impressum' },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  const { address } = siteConfig;

  return (
    <LegalPage title="Impressum" intro="Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).">
      <IncompleteNotice items={openDetails()} />

      <LegalSection title="Anbieter">
        <p>
          <Value>{siteConfig.legalName}</Value>
          <br />
          <Value>{siteConfig.legalForm}</Value>
          <br />
          <Value>{address.street}</Value>
          <br />
          <Value>{address.postalCode}</Value> {address.city}
          <br />
          {address.country}
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Telefon:{' '}
          <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`}>{siteConfig.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
      </LegalSection>

      {/* § 5 DDG verlangt die USt-IdNr. nur, „soweit vorhanden". Ist keine
          hinterlegt, entfällt der Abschnitt — eine Überschrift ohne Inhalt
          wirft mehr Fragen auf, als sie beantwortet. */}
      {siteConfig.vatId && (
        <LegalSection title="Umsatzsteuer-Identifikationsnummer">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
            <br />
            <Value>{siteConfig.vatId}</Value>
          </p>
        </LegalSection>
      )}

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          <Value>{siteConfig.ownerName}</Value>
          <br />
          Anschrift wie oben.
        </p>
      </LegalSection>

      <LegalSection title="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Inhalte">
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder
          gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
          eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
          Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
          diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten
          Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen
          wir diese Inhalte umgehend.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Links">
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
          mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum Zeitpunkt der
          Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir
          derartige Links umgehend.
        </p>
      </LegalSection>

      <LegalSection title="Urheberrecht">
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen
          Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
