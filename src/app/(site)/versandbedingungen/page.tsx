import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section } from '@/components/layout/legal-page';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';

export const metadata: Metadata = { title: 'Versandbedingungen' };

export default function ShippingTermsPage() {
  return (
    <LegalPage
      title="Versandbedingungen"
      intro="Was du vor dem Versand wissen solltest — praktisch und kurz."
    >
      <Section title="Was wir transportieren">
        <p>
          Pakete, Taschen, Kartons, persönliche Gegenstände und nach Absprache Sperrgut wie Möbel,
          Haushaltsgeräte oder Fahrräder. Ausgeschlossen sind die auf der Seite{' '}
          <Link href="/verbotene-waren" className="font-medium text-primary underline">
            Verbotene Waren
          </Link>{' '}
          genannten Gegenstände.
        </p>
      </Section>

      <Section title="Verpackung">
        <ul>
          <li>Stabile Kartons oder feste Reisetaschen verwenden.</li>
          <li>Zerbrechliches gut auspolstern — wir stapeln im Fahrzeug.</li>
          <li>Jedes Gepäckstück außen mit Name und Telefonnummer des Empfängers beschriften.</li>
          <li>Flüssigkeiten zusätzlich in einen dichten Beutel geben.</li>
        </ul>
      </Section>

      <Section title="Abgabe oder Abholung">
        <p>
          Du kannst deine Sendung bei uns abgeben oder sie für pauschal{' '}
          {formatCents(pricingConfig.pickupFeeCents)} bei dir abholen lassen. Bei der Abholung
          prüfen wir Gewicht und Anzahl gemeinsam mit dir und dokumentieren die Übernahme.
        </p>
      </Section>

      <Section title="Sicherheitsbeutel und Plomben">
        <p>
          Größere Sendungen versiegeln wir mit nummerierten Sicherheitsbeuteln. Die Nummer
          (z. B. SEC-583921) wird gespeichert und ist in deiner Sendungsverfolgung sichtbar. Prüfe
          bei der Übergabe, ob Nummer und Verschluss unversehrt sind.
        </p>
      </Section>

      <Section title="Zustellung">
        <p>
          Wir stellen an der angegebenen Adresse zu oder vereinbaren einen Übergabeort. Der
          Empfänger muss telefonisch erreichbar sein. Bei der Übergabe dokumentieren wir die
          Zustellung mit Foto und/oder Unterschrift.
        </p>
      </Section>

      <Section title="Zoll">
        <p>
          <strong>
            [Zollrechtliche Hinweise durch eine sachkundige Stelle ergänzen lassen: Welche
            Warenmengen sind als Umzugs- oder Geschenkgut zulässig? Welche Dokumente muss der
            Kunde beibringen? Wer trägt eventuelle Abgaben?]
          </strong>
        </p>
      </Section>
    </LegalPage>
  );
}
