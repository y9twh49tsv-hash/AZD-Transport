import type { Metadata } from 'next';
import Link from 'next/link';
import { IncompleteNotice, LegalPage, LegalSection, Value } from '@/components/transfer/legal';
import { openDetails, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO.',
  alternates: { canonical: '/datenschutz' },
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  const { address } = siteConfig;

  return (
    <LegalPage
      title="Datenschutzerklärung"
      intro="Informationen über die Verarbeitung personenbezogener Daten auf dieser Website nach Art. 13 DSGVO."
    >
      <IncompleteNotice items={openDetails()} />

      <LegalSection title="1. Verantwortlicher">
        <p>
          <Value>{siteConfig.legalName}</Value>
          <br />
          <Value>{address.street}</Value>
          <br />
          <Value>{address.postalCode}</Value> {address.city}
          <br />
          Telefon: <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`}>{siteConfig.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
        <p>
          Eine Datenschutzbeauftragte oder ein Datenschutzbeauftragter ist nicht bestellt; die
          gesetzlichen Voraussetzungen dafür liegen nicht vor.
        </p>
      </LegalSection>

      <LegalSection title="2. Aufruf dieser Website">
        <p>
          Beim Aufruf der Website übermittelt Ihr Browser technisch notwendige Daten, die in
          Server-Protokolldateien gespeichert werden: IP-Adresse, Datum und Uhrzeit des Zugriffs,
          aufgerufene Adresse, übertragene Datenmenge, Statuscode, Referrer sowie Browser- und
          Betriebssystemkennung.
        </p>
        <p>
          Rechtsgrundlage ist <strong>Art. 6 Abs. 1 lit. f DSGVO</strong>. Unser berechtigtes
          Interesse liegt im technischen Betrieb, in der Stabilität und in der Sicherheit der
          Website. Die Protokolldaten werden nach spätestens 30 Tagen gelöscht oder gekürzt, sofern
          sie nicht zur Aufklärung eines konkreten Missbrauchsfalls benötigt werden.
        </p>
      </LegalSection>

      <LegalSection title="3. Anfrageformular">
        <p>
          Wenn Sie das Anfrageformular nutzen, verarbeiten wir die von Ihnen eingegebenen Angaben:
          Abholort, Zielort, Angaben zum Fahrzeug, Wunschtermin, Ihre Bemerkungen sowie Ihren Namen
          und die von Ihnen angegebene Telefonnummer und/oder E-Mail-Adresse.
        </p>
        <p>
          Zweck ist ausschließlich die Bearbeitung Ihrer Anfrage und die Erstellung eines Angebots.
          Rechtsgrundlage ist <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Durchführung
          vorvertraglicher Maßnahmen auf Ihre Anfrage hin).
        </p>
        <p>
          Die Anfrage wird als E-Mail an unser Postfach übermittelt und nicht in einer Datenbank
          dieser Website gespeichert. Wir bewahren sie auf, solange sie zur Bearbeitung und für
          mögliche Rückfragen erforderlich ist. Kommt ein Auftrag zustande, gelten die
          handels- und steuerrechtlichen Aufbewahrungsfristen (in der Regel sechs bzw. zehn Jahre).
          Kommt kein Auftrag zustande, löschen wir die Anfrage, sobald sie nicht mehr benötigt wird.
        </p>
        <p>
          Das Formular enthält ein für Sie unsichtbares Zusatzfeld zur Abwehr automatisierter
          Einsendungen. Es verarbeitet keine personenbezogenen Daten und bindet keinen Dienst
          Dritter ein.
        </p>
      </LegalSection>

      <LegalSection title="4. Kontakt per Telefon, E-Mail und WhatsApp">
        <p>
          Bei einer Kontaktaufnahme per Telefon, E-Mail oder WhatsApp verarbeiten wir die dabei
          anfallenden Daten zur Bearbeitung Ihres Anliegens. Rechtsgrundlage ist{' '}
          <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>, sofern die Kontaktaufnahme auf einen Vertrag
          gerichtet ist, andernfalls <strong>Art. 6 Abs. 1 lit. f DSGVO</strong>.
        </p>
        <p>
          Der WhatsApp-Schaltfläche liegt kein eingebundenes Skript zugrunde: sie ist ein
          gewöhnlicher Link. Erst wenn Sie ihn anklicken, verlassen Sie diese Website und es besteht
          eine Verbindung zu WhatsApp Ireland Ltd. bzw. Meta Platforms. Für diese Verarbeitung ist
          Meta verantwortlich; es gelten die Datenschutzhinweise von WhatsApp. Wenn Sie das nicht
          möchten, erreichen Sie uns ebenso per Telefon, E-Mail oder über das Formular.
        </p>
      </LegalSection>

      <LegalSection title="5. Empfänger und Auftragsverarbeiter">
        <p>Für den Betrieb dieser Website setzen wir folgende Dienstleister ein:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>
            <strong>Railway Corp.</strong> — Hosting der Website und Betrieb der Anwendung.
          </li>
          <li>
            <strong>Resend</strong> — technischer Versand der Anfrage-E-Mails an unser Postfach.
          </li>
        </ul>
        <p>
          Mit diesen Dienstleistern bestehen bzw. werden Verträge zur Auftragsverarbeitung nach{' '}
          <strong>Art. 28 DSGVO</strong> geschlossen. Erfolgt dabei eine Übermittlung in ein
          Drittland, geschieht dies nur auf Grundlage geeigneter Garantien nach Art. 44 ff. DSGVO,
          insbesondere der Standardvertragsklauseln der EU-Kommission.
        </p>
        <p className="text-destructive-foreground">
          <mark className="rounded-sm bg-destructive/15 px-1.5 py-0.5">
            TODO — Auftragsverarbeitungsverträge abschließen und den Abschluss hier bestätigen.
          </mark>
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies und Reichweitenmessung">
        <p>
          Diese Website setzt <strong>keine Cookies</strong>. Weder zu Analyse- noch zu Werbe- oder
          Trackingzwecken, und auch keine technisch notwendigen: es gibt keine Anmeldung, keinen
          Warenkorb und keine Sprachumschaltung, für die etwas gemerkt werden müsste. Es werden auch
          keine Daten im lokalen Speicher Ihres Browsers abgelegt.
        </p>
        <p>
          Es findet keine Reichweitenmessung statt, und es sind keine Dienste Dritter eingebunden,
          die Sie über Websites hinweg wiedererkennen könnten — auch keine Schriftarten von fremden
          Servern. Eine Einwilligung nach <strong>§ 25 TDDDG</strong> ist deshalb nicht
          erforderlich: es wird nichts auf Ihrem Endgerät gespeichert und nichts von dort ausgelesen.
        </p>
        <p>
          Einzelheiten und wie Sie das selbst nachprüfen können, stehen auf der Seite{' '}
          <Link href="/cookies">Cookies &amp; Tracking</Link>.
        </p>
      </LegalSection>

      <LegalSection title="7. Ihre Rechte">
        <p>Sie haben uns gegenüber folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>
          Wenden Sie sich dafür an die oben genannten Kontaktdaten. Unabhängig davon steht Ihnen ein
          Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO), insbesondere
          bei der Behörde Ihres gewöhnlichen Aufenthaltsorts oder am Sitz des Verantwortlichen.
        </p>
      </LegalSection>

      <LegalSection title="8. Pflicht zur Bereitstellung">
        <p>
          Die Angabe Ihrer Daten ist weder gesetzlich noch vertraglich vorgeschrieben. Ohne
          Abholort, Zielort, Namen und eine Kontaktmöglichkeit können wir Ihre Anfrage jedoch nicht
          bearbeiten und kein Angebot erstellen.
        </p>
      </LegalSection>

      <LegalSection title="9. Automatisierte Entscheidungsfindung">
        <p>
          Eine automatisierte Entscheidungsfindung einschließlich Profiling nach Art. 22 DSGVO
          findet nicht statt. Jedes Angebot wird von Hand geprüft und erstellt.
        </p>
      </LegalSection>

      <LegalSection title="10. Änderungen dieser Erklärung">
        <p>
          Wir passen diese Datenschutzerklärung an, wenn sich die Rechtslage, unsere Leistungen oder
          die eingesetzten Dienstleister ändern. Es gilt die jeweils auf dieser Seite abrufbare
          Fassung.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
