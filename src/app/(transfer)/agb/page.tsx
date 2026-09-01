import type { Metadata } from 'next';
import Link from 'next/link';
import { IncompleteNotice, LegalPage, LegalSection, Value } from '@/components/transfer/legal';
import { openDetails, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen',
  description:
    'Allgemeine Geschäftsbedingungen für Fahrzeugüberführungen auf eigener Achse durch AZD Transport.',
  alternates: { canonical: '/agb' },
  robots: { index: true, follow: true },
};

export default function AgbPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen"
      intro="Für Fahrzeugüberführungen auf eigener Achse. Stand: siehe Datum am Seitenende."
    >
      <IncompleteNotice items={openDetails()} />

      <LegalSection title="§ 1 Geltungsbereich und Vertragspartner">
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über
          Fahrzeugüberführungen zwischen <Value>{siteConfig.legalName}</Value> (nachfolgend
          „Auftragnehmer“) und dem Auftraggeber.
        </p>
        <p>
          Abweichende Bedingungen des Auftraggebers werden nicht Vertragsbestandteil, es sei denn,
          der Auftragnehmer stimmt ihrer Geltung ausdrücklich in Textform zu.
        </p>
        <p>
          Verbraucher ist jede natürliche Person, die den Vertrag zu Zwecken abschließt, die
          überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit
          zugerechnet werden können (§ 13 BGB). Unternehmer ist, wer bei Abschluss in Ausübung
          seiner gewerblichen oder selbständigen beruflichen Tätigkeit handelt (§ 14 BGB).
        </p>
      </LegalSection>

      <LegalSection title="§ 2 Gegenstand der Leistung">
        <p>
          Der Auftragnehmer überführt das vom Auftraggeber benannte Fahrzeug vom vereinbarten
          Abholort zum vereinbarten Zielort. Die Überführung erfolgt{' '}
          <strong>auf eigener Achse</strong>, das heißt: das Fahrzeug wird gefahren und nicht auf
          einem Anhänger oder Autotransporter befördert.
        </p>
        <p>
          Überführt werden PKW, SUV, Sportwagen, Luxusfahrzeuge sowie Transporter bis 3,5 t
          zulässiger Gesamtmasse.
        </p>
        <p>
          Zusatzleistungen — insbesondere die Dokumentation des Fahrzeugzustands, das Festhalten von
          Kilometerstand und Tank- bzw. Ladezustand, Übergabefotos sowie die Terminabstimmung mit
          Dritten — sind nur geschuldet, wenn sie ausdrücklich vereinbart wurden.
        </p>
      </LegalSection>

      <LegalSection title="§ 3 Angebot und Vertragsschluss">
        <p>
          Die Darstellung der Leistungen auf dieser Website ist kein bindendes Angebot, sondern eine
          Aufforderung zur Abgabe einer Anfrage.
        </p>
        <p>
          Mit einer Anfrage über das Formular, per Telefon, E-Mail oder Messenger fordert der
          Auftraggeber ein Angebot an. Auf dieser Grundlage erstellt der Auftragnehmer ein
          individuelles Angebot zu einem Festpreis. Der Vertrag kommt zustande, wenn der
          Auftraggeber dieses Angebot annimmt und der Auftragnehmer den Auftrag bestätigt.
        </p>
        <p>Eine Anfrage ist unverbindlich und kostenfrei.</p>
      </LegalSection>

      <LegalSection title="§ 4 Preise und Zahlung">
        <p>
          Es gilt der im Angebot genannte Festpreis. Er umfasst die dort aufgeführten Leistungen
          einschließlich An- und Rückreise sowie — soweit nicht ausdrücklich anders vereinbart —
          Kraftstoff und Maut.
        </p>
        <p>
          Nachträgliche Änderungen des Auftrags durch den Auftraggeber, insbesondere Änderungen von
          Abholort, Zielort oder Termin, können den Preis verändern. Der Auftragnehmer weist auf
          eine solche Änderung vor Ausführung hin.
        </p>
        <p>
          Die Zahlung erfolgt nach Rechnungsstellung ohne Abzug, sofern nichts anderes vereinbart
          ist. Der Auftraggeber erhält eine Rechnung; ein etwaiger Ausweis von Umsatzsteuer richtet
          sich nach den steuerrechtlichen Verhältnissen des Auftragnehmers.
        </p>
      </LegalSection>

      <LegalSection title="§ 5 Mitwirkungspflichten des Auftraggebers">
        <p>Der Auftraggeber stellt sicher, dass zum vereinbarten Abholzeitpunkt:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>
            das Fahrzeug <strong>fahrbereit und verkehrssicher</strong> ist,
          </li>
          <li>
            ein gültiges Kennzeichen und ein bestehender Versicherungsschutz vorliegen — die
            reguläre Zulassung, ein Kurzzeitkennzeichen oder ein rotes Kennzeichen,
          </li>
          <li>
            die für die Fahrt erforderlichen Fahrzeugpapiere und mindestens ein Fahrzeugschlüssel
            übergeben werden,
          </li>
          <li>
            das Fahrzeug am vereinbarten Ort zugänglich ist und eine übergabeberechtigte Person
            anwesend oder erreichbar ist,
          </li>
          <li>
            bekannte Mängel, Besonderheiten oder Einschränkungen des Fahrzeugs vorab mitgeteilt
            werden.
          </li>
        </ul>
        <p>
          Sind diese Voraussetzungen nicht erfüllt und kann die Überführung deshalb nicht oder nicht
          wie vereinbart durchgeführt werden, kann der Auftragnehmer den nachgewiesenen Aufwand
          (insbesondere die vergebliche Anreise) in Rechnung stellen.
        </p>
      </LegalSection>

      <LegalSection title="§ 6 Versicherung und Absicherung">
        <p>{siteConfig.insuranceText}</p>
        <p>
          Der Auftraggeber ist verpflichtet, den Auftragnehmer vor Fahrtantritt über den bestehenden
          Versicherungsschutz des Fahrzeugs zu informieren. Bestehen Zweifel am Versicherungsschutz,
          wird die Überführung nicht angetreten.
        </p>
      </LegalSection>

      <LegalSection title="§ 7 Termine und Ausführung">
        <p>
          Termine für Abholung und Übergabe werden individuell vereinbart. Sie sind verbindlich,
          wenn sie ausdrücklich als verbindlich bestätigt wurden.
        </p>
        <p>
          Kommt es aufgrund von Umständen, die der Auftragnehmer nicht zu vertreten hat —
          insbesondere Verkehrslage, Witterung, Streik, behördliche Anordnungen oder technische
          Defekte am Fahrzeug — zu Verzögerungen, verschiebt sich der Termin entsprechend. Der
          Auftragnehmer informiert den Auftraggeber unverzüglich.
        </p>
        <p>
          Der Auftragnehmer darf zur Durchführung geeignete Dritte einsetzen. Er bleibt in diesem
          Fall Vertragspartner des Auftraggebers.
        </p>
      </LegalSection>

      <LegalSection title="§ 8 Übergabe und Zustandsdokumentation">
        <p>
          Bei Übernahme und Übergabe wird das Fahrzeug gemeinsam in Augenschein genommen, soweit
          eine berechtigte Person anwesend ist. Ist eine Zustandsdokumentation vereinbart, hält der
          Auftragnehmer den Zustand, den Kilometerstand sowie den Tank- bzw. Ladezustand fest und
          stellt die Dokumentation dem Auftraggeber zur Verfügung.
        </p>
        <p>
          Erkennbare Schäden sind bei der Übergabe unverzüglich anzuzeigen. Für Unternehmer gilt
          zusätzlich § 377 HGB.
        </p>
      </LegalSection>

      <LegalSection title="§ 9 Stornierung">
        <p>
          Der Auftraggeber kann den Auftrag vor Fahrtantritt stornieren. Bereits entstandener
          Aufwand — insbesondere eine bereits angetretene Anreise oder gebuchte Fahrkarten — ist zu
          erstatten.
        </p>
        <p>
          Das gesetzliche Widerrufsrecht für Verbraucher bei Fernabsatzverträgen bleibt hiervon
          unberührt; Einzelheiten stehen in der <Link href="/widerruf">Widerrufsbelehrung</Link>.
        </p>
      </LegalSection>

      <LegalSection title="§ 10 Haftung">
        <p>
          Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei
          Verletzung von Leben, Körper oder Gesundheit sowie nach den Vorschriften des
          Produkthaftungsgesetzes.
        </p>
        <p>
          Bei einfacher Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung einer
          wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemäße Durchführung des
          Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Auftraggeber regelmäßig
          vertrauen darf. In diesem Fall ist die Haftung auf den bei Vertragsschluss vorhersehbaren,
          vertragstypischen Schaden begrenzt.
        </p>
        <p>
          Eine weitergehende Haftung ist ausgeschlossen. Für normale Gebrauchsspuren, die sich aus
          der bestimmungsgemäßen Nutzung des Fahrzeugs auf der vereinbarten Strecke ergeben, sowie
          für Schäden aus vorbestehenden Mängeln, die dem Auftragnehmer nicht mitgeteilt wurden,
          wird nicht gehaftet.
        </p>
      </LegalSection>

      <LegalSection title="§ 11 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland. Bei Verbrauchern gilt diese Rechtswahl
          nur, soweit dadurch der Schutz zwingender Vorschriften des Rechts des Staates, in dem der
          Verbraucher seinen gewöhnlichen Aufenthalt hat, nicht entzogen wird.
        </p>
        <p>
          Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder
          öffentlich-rechtliches Sondervermögen, ist Gerichtsstand der Sitz des Auftragnehmers.
        </p>
        <p>
          Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleibt die Wirksamkeit der
          übrigen Bestimmungen unberührt.
        </p>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Diese Bedingungen wurden für den Geschäftsbetrieb der Fahrzeugüberführung verfasst. Sie
          ersetzen keine anwaltliche Prüfung. Vor dem produktiven Einsatz sollten sie von einer
          Rechtsanwältin oder einem Rechtsanwalt auf den konkreten Betrieb hin geprüft werden —
          insbesondere die Regelungen zu Haftung, Versicherung und Stornierung.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
