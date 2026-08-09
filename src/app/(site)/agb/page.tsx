import type { Metadata } from 'next';
import { LegalPage, Section } from '@/components/layout/legal-page';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { brand } from '@/config/brand';

export const metadata: Metadata = { title: 'AGB' };

export default function TermsPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen"
      intro={`Vertragsbedingungen für Transportleistungen von ${brand.name}.`}
    >
      <Section title="§ 1 Geltungsbereich">
        <p>
          Diese Bedingungen gelten für alle Transportleistungen zwischen {brand.legalName}{' '}
          (nachfolgend „wir“) und dem Auftraggeber (nachfolgend „Kunde“) im Verkehr zwischen
          Deutschland und Marokko.
        </p>
      </Section>

      <Section title="§ 2 Vertragsschluss">
        <p>
          Der Vertrag kommt mit der Bestätigung der Buchung durch uns zustande. Der Kunde erhält
          eine Sendungsnummer, unter der die Sendung nachverfolgt werden kann.
        </p>
      </Section>

      <Section title="§ 3 Preise">
        <ul>
          <li>Normale Sendungen: {formatCents(pricingConfig.pricePerKgCents)} je angefangenes Kilogramm.</li>
          <li>Mindestpreis je Sendung: {formatCents(pricingConfig.minimumPriceCents)}.</li>
          <li>Abholung beim Kunden: pauschal {formatCents(pricingConfig.pickupFeeCents)}.</li>
          <li>
            Sperrige oder besonders schwere Güter: individueller Pauschalpreis nach vorheriger
            Prüfung von Fotos, Maßen und Gewicht.
          </li>
        </ul>
        <p>
          Maßgeblich ist das bei der Annahme festgestellte tatsächliche Gewicht. Weicht es von der
          Angabe des Kunden ab, informieren wir ihn vor der Weiterbeförderung.
        </p>
      </Section>

      <Section title="§ 4 Pflichten des Kunden">
        <ul>
          <li>vollständige und wahrheitsgemäße Angaben zu Inhalt, Gewicht und Empfänger</li>
          <li>transportsichere Verpackung der Sendung</li>
          <li>keine verbotenen oder nicht deklarierten Waren (siehe Seite „Verbotene Waren“)</li>
          <li>Erreichbarkeit des Empfängers unter der angegebenen Telefonnummer</li>
        </ul>
      </Section>

      <Section title="§ 5 Zahlung">
        <p>
          Die Zahlung erfolgt derzeit bar bei Abgabe oder Abholung, per Überweisung oder auf
          Rechnung nach Absprache. Eine Online-Zahlung ist in Vorbereitung.
        </p>
      </Section>

      <Section title="§ 6 Laufzeiten">
        <p>
          <strong>
            [Realistische Transportzeiten eintragen, z. B. „in der Regel 7–12 Tage ab Verladung“.
            Verbindliche Zusagen nur machen, wenn sie eingehalten werden können.]
          </strong>{' '}
          Angegebene Laufzeiten sind unverbindliche Richtwerte. Verzögerungen durch Zoll, Fähre
          oder höhere Gewalt begründen keinen Schadenersatzanspruch.
        </p>
      </Section>

      <Section title="§ 7 Haftung">
        <p>
          Es gelten die Regelungen der Seite „Haftung &amp; Versicherung“.{' '}
          <strong>
            [Prüfen lassen, ob und in welchem Umfang die CMR (Übereinkommen über den
            Beförderungsvertrag im internationalen Straßengüterverkehr) oder §§ 407 ff. HGB
            Anwendung finden.]
          </strong>
        </p>
      </Section>

      <Section title="§ 8 Widerrufsrecht für Verbraucher">
        <p>
          <strong>
            [Widerrufsbelehrung ergänzen. Bei Beförderungsverträgen gelten Besonderheiten — bitte
            anwaltlich klären, ob § 312g Abs. 2 BGB einschlägig ist, und gegebenenfalls ein
            Muster-Widerrufsformular bereitstellen.]
          </strong>
        </p>
      </Section>

      <Section title="§ 9 Schlussbestimmungen">
        <p>
          Es gilt deutsches Recht. Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit
          der übrigen Bestimmungen unberührt.
        </p>
      </Section>
    </LegalPage>
  );
}
