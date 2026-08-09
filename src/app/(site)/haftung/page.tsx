import type { Metadata } from 'next';
import { LegalPage, Section } from '@/components/layout/legal-page';

export const metadata: Metadata = { title: 'Haftung & Versicherung' };

export default function LiabilityPage() {
  return (
    <LegalPage
      title="Haftung & Versicherung"
      intro="Wofür wir einstehen — und was du selbst absichern solltest."
    >
      <Section title="Grundsatz">
        <p>
          Wir haften für Verlust und Beschädigung der Sendung während der Zeit, in der wir sie in
          Obhut haben.{' '}
          <strong>
            [Haftungsrahmen konkretisieren: Gilt die CMR mit 8,33 SZR je Kilogramm, gelten
            §§ 407 ff. HGB mit 8,33 Rechnungseinheiten je Kilogramm, oder eine abweichende
            vertragliche Regelung? Zwingend anwaltlich klären.]
          </strong>
        </p>
      </Section>

      <Section title="Höchstbetrag je Sendung">
        <p>
          <strong>
            [Konkreten Höchstbetrag eintragen, abgestimmt mit deiner Transportversicherung, z. B.
            „bis 500 € je Sendung“. Ohne abgeschlossene Versicherung hier keinen Betrag nennen.]
          </strong>
        </p>
      </Section>

      <Section title="Nicht versicherte Gegenstände">
        <p>
          Für Bargeld, Schmuck, Edelmetalle, Wertpapiere, Ausweisdokumente, elektronische Geräte
          ohne Originalverpackung und leicht verderbliche Waren besteht kein Versicherungsschutz.
          Bitte gib solche Gegenstände nicht mit.
        </p>
      </Section>

      <Section title="Verpackung">
        <p>
          Für Schäden, die auf eine unzureichende Verpackung durch den Absender zurückgehen, können
          wir nicht haften. Hinweise dazu findest du in den Versandbedingungen.
        </p>
      </Section>

      <Section title="Schadenmeldung">
        <p>
          Melde einen erkennbaren Schaden bitte <strong>direkt bei der Übergabe</strong> und lass
          ihn auf dem Übergabeprotokoll vermerken. Verdeckte Schäden melde uns bitte innerhalb von{' '}
          <strong>[Frist eintragen, z. B. 7 Tagen]</strong> mit Fotos.
        </p>
      </Section>

      <Section title="Höhere Gewalt">
        <p>
          Für Verzögerungen oder Schäden durch Streik, Wetter, Grenzschließungen, Fährausfälle,
          behördliche Maßnahmen oder Zollkontrollen haften wir nicht.
        </p>
      </Section>

      <Section title="Erforderliche Versicherungen">
        <p>
          <strong>
            [Vor Betriebsaufnahme klären und hier dokumentieren: Verkehrshaftungsversicherung,
            Betriebshaftpflicht, ggf. Warentransportversicherung, sowie die Erlaubnis nach § 3 GüKG
            bzw. die EU-Gemeinschaftslizenz für grenzüberschreitenden gewerblichen Güterverkehr.]
          </strong>
        </p>
      </Section>
    </LegalPage>
  );
}
