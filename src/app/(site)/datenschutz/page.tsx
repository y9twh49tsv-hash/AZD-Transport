import type { Metadata } from 'next';
import { LegalPage, Section } from '@/components/layout/legal-page';
import { brand } from '@/config/brand';

export const metadata: Metadata = { title: 'Datenschutzerklärung' };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      intro="Wie wir mit deinen personenbezogenen Daten umgehen — und welche Rechte du hast."
    >
      <Section title="1. Verantwortlicher">
        <p>
          {brand.legalName}, {brand.address.street}, {brand.address.zip} {brand.address.city},{' '}
          {brand.address.country}. E-Mail: {brand.email}, Telefon: {brand.phone}.
        </p>
        <p>
          <strong>
            [Falls ein Datenschutzbeauftragter benannt werden muss, hier Name und Kontaktdaten
            ergänzen.]
          </strong>
        </p>
      </Section>

      <Section title="2. Welche Daten wir verarbeiten">
        <p>Für die Abwicklung einer Sendung verarbeiten wir:</p>
        <ul>
          <li>Vor- und Nachname von Absender und Empfänger</li>
          <li>Anschrift von Absender und Empfänger</li>
          <li>Telefonnummer und E-Mail-Adresse</li>
          <li>Angaben zur Sendung: Gewicht, Anzahl, Inhalt, Beschreibung</li>
          <li>Abhol- und Zustelltermine sowie Statusmeldungen</li>
          <li>Zahlungsstatus und Betrag</li>
          <li>bei Sperrgut: von dir hochgeladene Fotos</li>
          <li>bei Abholung und Zustellung: Nachweisfotos und ggf. eine Unterschrift</li>
        </ul>
        <p>
          Wir erheben nur die Daten, die wir für den Transport tatsächlich brauchen. Sensible
          Daten (z. B. Gesundheitsdaten) verarbeiten wir nicht.
        </p>
      </Section>

      <Section title="3. Rechtsgrundlagen">
        <ul>
          <li>
            <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> — Erfüllung des Transportvertrags
            (Buchung, Abholung, Transport, Zustellung, Sendungsverfolgung).
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> — gesetzliche Pflichten, insbesondere
            handels- und steuerrechtliche Aufbewahrungspflichten sowie zollrechtliche Vorgaben.
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> — berechtigtes Interesse an der Sicherheit
            unserer Systeme, an der Dokumentation der Übergaben und an der Abwehr von Missbrauch.
          </li>
        </ul>
      </Section>

      <Section title="4. Empfänger und Auftragsverarbeiter">
        <p>Wir setzen folgende Dienstleister ein:</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — Hosting der Website.{' '}
            <strong>[Auftragsverarbeitungsvertrag abschließen und hier bestätigen.]</strong>
          </li>
          <li>
            <strong>Supabase</strong> — Datenbank, Authentifizierung und Dateispeicher.{' '}
            <strong>
              [Serverstandort in der EU wählen und Auftragsverarbeitungsvertrag abschließen.]
            </strong>
          </li>
          <li>
            <strong>E-Mail-Versanddienstleister</strong> für Transaktionsmails.{' '}
            <strong>[Anbieter eintragen, sobald ausgewählt.]</strong>
          </li>
        </ul>
        <p>
          Eine Übermittlung in Drittländer erfolgt nur auf Grundlage geeigneter Garantien
          (Art. 44 ff. DSGVO).{' '}
          <strong>[Konkrete Garantien prüfen und benennen.]</strong>
        </p>
      </Section>

      <Section title="5. Sendungsverfolgung">
        <p>
          Über die öffentliche Sendungsverfolgung sind nur die Sendungsnummer, der Status, die
          Route, die Anzahl der Gepäckstücke, das Gesamtgewicht, eine eventuelle Sicherheitsnummer
          und der Verlauf einsehbar. <strong>Adressen, Telefonnummern, E-Mail-Adressen, Preise und
          interne Notizen werden dort niemals angezeigt.</strong>
        </p>
      </Section>

      <Section title="6. Speicherdauer">
        <p>
          Sendungsdaten bewahren wir für die Dauer der Vertragsabwicklung und anschließend im
          Rahmen der gesetzlichen Aufbewahrungsfristen auf (handels- und steuerrechtlich in der
          Regel 6 bzw. 10 Jahre). Fotos von Sperrgut-Anfragen, die nicht zu einer Sendung führen,
          löschen wir spätestens nach{' '}
          <strong>[Frist festlegen, z. B. 6 Monate]</strong>.
        </p>
      </Section>

      <Section title="7. Deine Rechte">
        <ul>
          <li>Auskunft über die zu dir gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO), soweit keine Aufbewahrungspflicht entgegensteht</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
          <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p>Für alle Anliegen genügt eine E-Mail an {brand.email}.</p>
      </Section>

      <Section title="8. Cookies und Reichweitenmessung">
        <p>
          Wir setzen ausschließlich technisch notwendige Cookies ein — konkret das Sitzungs-Cookie
          für angemeldete Nutzerinnen und Nutzer. Es findet kein Tracking und keine Werbeanalyse
          statt. <strong>[Anpassen, falls später Analyse-Tools eingesetzt werden — dann ist eine
          Einwilligungslösung erforderlich.]</strong>
        </p>
      </Section>

      <Section title="9. Datensicherheit">
        <p>
          Die Übertragung erfolgt verschlüsselt über HTTPS. Der Zugriff auf Kundendaten ist
          rollenbasiert beschränkt und wird zusätzlich auf Datenbankebene durchgesetzt. Fotos und
          Zustellnachweise liegen in nicht-öffentlichen Speicherbereichen und sind ausschließlich
          über zeitlich befristete, signierte Links erreichbar.
        </p>
      </Section>
    </LegalPage>
  );
}
