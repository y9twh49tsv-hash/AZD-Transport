import type { Content } from '../types';

/**
 * Die Rechtstexte auf Deutsch — die verbindliche Fassung.
 *
 * Als Daten und nicht als JSX, damit die englische Übersetzung dieselbe
 * Gliederung erfüllen muss und ein fehlender Abschnitt auffällt.
 *
 * In den Absätzen sind zwei Auszeichnungen erlaubt, mehr nicht:
 * `**fett**` und `[Text](/pfad)`. Alles Weitere gehört nicht in einen
 * Rechtstext.
 *
 * Die Angaben zum Anbieter stehen bewusst nicht hier, sondern kommen aus
 * `src/config/site.ts`. Sie sind in beiden Sprachen dieselben — eine Anschrift
 * wird nicht übersetzt.
 */
export const legalDe: Content['legal'] = {
  eyebrow: 'Rechtliches',
  incompleteTitle: 'Diese Seite ist noch nicht vollständig',
  incompleteText:
    'Die folgenden Pflichtangaben fehlen noch und sind im Text als TODO markiert. Sie werden zentral in src/config/site.ts eingetragen, danach verschwindet dieser Hinweis von selbst.',
  missingPrefix: 'Angabe fehlt noch: ',
  translationNotice: null,

  imprint: {
    title: 'Impressum',
    intro: 'Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).',
    metaDescription: 'Anbieterkennzeichnung nach § 5 DDG.',
    sections: [
      { id: 'provider', title: 'Anbieter' },
      { id: 'contact', title: 'Kontakt' },
      { id: 'vat', title: 'Umsatzsteuer-Identifikationsnummer' },
      {
        id: 'responsible',
        title: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      },
      {
        title: 'Verbraucherstreitbeilegung',
        paragraphs: [
          'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
        ],
      },
      {
        title: 'Haftung für Inhalte',
        paragraphs: [
          'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.',
        ],
      },
      {
        title: 'Haftung für Links',
        paragraphs: [
          'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.',
        ],
      },
      {
        title: 'Urheberrecht',
        paragraphs: [
          'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Datenschutzerklärung',
    intro:
      'Informationen über die Verarbeitung personenbezogener Daten auf dieser Website nach Art. 13 DSGVO.',
    metaDescription: 'Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO.',
    sections: [
      {
        title: '1. Verantwortlicher',
        paragraphs: [
          'Eine Datenschutzbeauftragte oder ein Datenschutzbeauftragter ist nicht bestellt; die gesetzlichen Voraussetzungen dafür liegen nicht vor.',
        ],
      },
      {
        title: '2. Aufruf dieser Website',
        paragraphs: [
          'Beim Aufruf der Website übermittelt Ihr Browser technisch notwendige Daten, die in Server-Protokolldateien gespeichert werden: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Adresse, übertragene Datenmenge, Statuscode, Referrer sowie Browser- und Betriebssystemkennung.',
          'Rechtsgrundlage ist **Art. 6 Abs. 1 lit. f DSGVO**. Unser berechtigtes Interesse liegt im technischen Betrieb, in der Stabilität und in der Sicherheit der Website. Die Protokolldaten werden nach spätestens 30 Tagen gelöscht oder gekürzt, sofern sie nicht zur Aufklärung eines konkreten Missbrauchsfalls benötigt werden.',
        ],
      },
      {
        title: '3. Anfrageformular',
        paragraphs: [
          'Wenn Sie das Anfrageformular nutzen, verarbeiten wir die von Ihnen eingegebenen Angaben: Abholort, Zielort, Angaben zum Fahrzeug, Wunschtermin, Ihre Bemerkungen sowie Ihren Namen und die von Ihnen angegebene Telefonnummer und/oder E-Mail-Adresse.',
          'Zweck ist ausschließlich die Bearbeitung Ihrer Anfrage und die Erstellung eines Angebots. Rechtsgrundlage ist **Art. 6 Abs. 1 lit. b DSGVO** (Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin).',
          'Die Anfrage wird als E-Mail an unser Postfach übermittelt und nicht in einer Datenbank dieser Website gespeichert. Wir bewahren sie auf, solange sie zur Bearbeitung und für mögliche Rückfragen erforderlich ist. Kommt ein Auftrag zustande, gelten die handels- und steuerrechtlichen Aufbewahrungsfristen (in der Regel sechs bzw. zehn Jahre). Kommt kein Auftrag zustande, löschen wir die Anfrage, sobald sie nicht mehr benötigt wird.',
          'Das Formular enthält ein für Sie unsichtbares Zusatzfeld zur Abwehr automatisierter Einsendungen. Es verarbeitet keine personenbezogenen Daten und bindet keinen Dienst Dritter ein.',
        ],
      },
      {
        title: '4. Kontakt per Telefon, E-Mail und WhatsApp',
        paragraphs: [
          'Bei einer Kontaktaufnahme per Telefon, E-Mail oder WhatsApp verarbeiten wir die dabei anfallenden Daten zur Bearbeitung Ihres Anliegens. Rechtsgrundlage ist **Art. 6 Abs. 1 lit. b DSGVO**, sofern die Kontaktaufnahme auf einen Vertrag gerichtet ist, andernfalls **Art. 6 Abs. 1 lit. f DSGVO**.',
          'Der WhatsApp-Schaltfläche liegt kein eingebundenes Skript zugrunde: sie ist ein gewöhnlicher Link. Erst wenn Sie ihn anklicken, verlassen Sie diese Website und es besteht eine Verbindung zu WhatsApp Ireland Ltd. bzw. Meta Platforms. Für diese Verarbeitung ist Meta verantwortlich; es gelten die Datenschutzhinweise von WhatsApp. Wenn Sie das nicht möchten, erreichen Sie uns ebenso per Telefon, E-Mail oder über das Formular.',
        ],
      },
      {
        title: '5. Empfänger und Auftragsverarbeiter',
        paragraphs: ['Für den Betrieb dieser Website setzen wir folgende Dienstleister ein:'],
        list: [
          '**Railway Corp.** — Hosting der Website und Betrieb der Anwendung.',
          '**Resend** — technischer Versand der Anfrage-E-Mails an unser Postfach.',
        ],
        todo: 'Auftragsverarbeitungsverträge abschließen und den Abschluss hier bestätigen.',
      },
      {
        title: '6. Cookies und Reichweitenmessung',
        paragraphs: [
          'Diese Website setzt **keine Cookies**. Weder zu Analyse- noch zu Werbe- oder Trackingzwecken, und auch keine technisch notwendigen: es gibt keine Anmeldung und keinen Warenkorb, und die gewählte Sprache steht in der Adresse selbst — „/“ für Deutsch, „/en“ für Englisch — und muss deshalb nirgends gemerkt werden. Es werden auch keine Daten im lokalen Speicher Ihres Browsers abgelegt.',
          'Es findet keine Reichweitenmessung statt, und es sind keine Dienste Dritter eingebunden, die Sie über Websites hinweg wiedererkennen könnten — auch keine Schriftarten von fremden Servern. Eine Einwilligung nach **§ 25 TDDDG** ist deshalb nicht erforderlich: es wird nichts auf Ihrem Endgerät gespeichert und nichts von dort ausgelesen.',
          'Einzelheiten und wie Sie das selbst nachprüfen können, stehen auf der Seite [Cookies & Tracking](/cookies).',
        ],
      },
      {
        title: '7. Ihre Rechte',
        paragraphs: [
          'Sie haben uns gegenüber folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:',
        ],
        list: [
          'Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)',
          'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
          'Löschung (Art. 17 DSGVO)',
          'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
          'Datenübertragbarkeit (Art. 20 DSGVO)',
          'Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)',
          'Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)',
        ],
      },
      {
        title: '8. Beschwerderecht',
        paragraphs: [
          'Wenden Sie sich für die Ausübung Ihrer Rechte an die oben genannten Kontaktdaten. Unabhängig davon steht Ihnen ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO), insbesondere bei der Behörde Ihres gewöhnlichen Aufenthaltsorts oder am Sitz des Verantwortlichen.',
        ],
      },
      {
        title: '9. Pflicht zur Bereitstellung',
        paragraphs: [
          'Die Angabe Ihrer Daten ist weder gesetzlich noch vertraglich vorgeschrieben. Ohne Abholort, Zielort, Namen und eine Kontaktmöglichkeit können wir Ihre Anfrage jedoch nicht bearbeiten und kein Angebot erstellen.',
        ],
      },
      {
        title: '10. Automatisierte Entscheidungsfindung',
        paragraphs: [
          'Eine automatisierte Entscheidungsfindung einschließlich Profiling nach Art. 22 DSGVO findet nicht statt. Jedes Angebot wird von Hand geprüft und erstellt.',
        ],
      },
      {
        title: '11. Änderungen dieser Erklärung',
        paragraphs: [
          'Wir passen diese Datenschutzerklärung an, wenn sich die Rechtslage, unsere Leistungen oder die eingesetzten Dienstleister ändern. Es gilt die jeweils auf dieser Seite abrufbare Fassung.',
        ],
      },
    ],
  },

  cookies: {
    title: 'Cookies & Tracking',
    intro: 'Kurz und vollständig: Diese Website setzt keine Cookies.',
    metaDescription:
      'Diese Website setzt keine Cookies, misst keine Reichweite und bindet keine Dienste Dritter ein. Was das bedeutet und warum es deshalb keine Cookie-Abfrage gibt.',
    sections: [
      {
        title: 'Was das im Einzelnen heißt',
        list: [
          'Keine Analysewerkzeuge — weder Google Analytics noch Matomo oder etwas Vergleichbares.',
          'Keine Werbe- oder Retargeting-Pixel, etwa von Meta oder Google Ads.',
          'Keine Schriftarten von fremden Servern. Die Seite nutzt die Schrift, die auf Ihrem Gerät ohnehin vorhanden ist — dadurch geht auch keine Anfrage an Google Fonts hinaus.',
          'Keine eingebetteten Karten, Videos oder Chatfenster.',
          'Auch keine technisch notwendigen Cookies: es gibt keine Anmeldung und keinen Warenkorb, und die Sprachwahl steht in der Adresse — der Umschalter ist ein gewöhnlicher Link und speichert nichts.',
        ],
      },
      {
        title: 'Warum es dann keine Cookie-Abfrage gibt',
        paragraphs: [
          '**§ 25 TDDDG** verlangt Ihre Einwilligung, bevor Informationen auf Ihrem Endgerät gespeichert oder von dort ausgelesen werden. Hier wird nichts gespeichert und nichts ausgelesen — es gibt also nichts, worin Sie einwilligen könnten.',
          'Ein Banner, das die Erlaubnis für etwas erfragt, das gar nicht stattfindet, informiert niemanden. Es gewöhnt nur daran, solche Fenster ungelesen wegzuklicken. Deshalb steht hier keines.',
        ],
      },
      {
        title: 'Was trotzdem übertragen wird',
        paragraphs: [
          'Damit eine Seite überhaupt bei Ihnen ankommt, muss Ihr Browser sie anfordern. Dabei fallen beim Hoster Protokolldaten an: IP-Adresse, Zeitpunkt, aufgerufene Adresse, übertragene Datenmenge, Browser- und Betriebssystemkennung. Diese Daten dienen dem technischen Betrieb und der Sicherheit und werden nach spätestens 30 Tagen gelöscht oder gekürzt.',
          'Das ist kein Tracking und lässt sich technisch nicht abschalten — ohne diese Angaben könnte Ihnen niemand eine Seite ausliefern. Einzelheiten stehen in der [Datenschutzerklärung](/datenschutz).',
        ],
      },
      {
        title: 'Wenn Sie auf WhatsApp tippen',
        paragraphs: [
          'Der WhatsApp-Knopf ist ein gewöhnlicher Link, kein eingebundenes Skript. Solange Sie ihn nicht antippen, besteht keine Verbindung zu Meta. Erst mit dem Antippen verlassen Sie diese Website, und es gelten die Datenschutzhinweise von WhatsApp. Wenn Sie das nicht möchten, erreichen Sie uns ebenso per Telefon, E-Mail oder über das Formular.',
        ],
      },
      {
        title: 'Sie müssen uns nicht glauben',
        paragraphs: [
          'Prüfen Sie es nach. Am Rechner: **F12** drücken, im Reiter *Anwendung* bzw. *Application* links auf *Cookies* klicken. Die Liste ist leer. Im Reiter *Netzwerk* sehen Sie außerdem, dass keine einzige Anfrage an einen fremden Server geht.',
        ],
      },
      {
        title: 'Sollte sich das ändern',
        paragraphs: [
          'Falls später eine Reichweitenmessung oder ein Dienst hinzukommt, der etwas auf Ihrem Gerät speichert, wird das vorher hier und in der Datenschutzerklärung beschrieben — und, soweit es einwilligungspflichtig ist, mit einer echten Abfrage versehen, die Ablehnen genauso leicht macht wie Zustimmen.',
        ],
      },
    ],
  },

  terms: {
    title: 'Allgemeine Geschäftsbedingungen',
    intro: 'Für Fahrzeugüberführungen auf eigener Achse.',
    metaDescription:
      'Allgemeine Geschäftsbedingungen für Fahrzeugüberführungen auf eigener Achse durch AZD Transport.',
    sections: [
      {
        title: '§ 1 Geltungsbereich und Vertragspartner',
        paragraphs: [
          'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über Fahrzeugüberführungen zwischen dem im Impressum genannten Anbieter (nachfolgend „Auftragnehmer") und dem Auftraggeber.',
          'Abweichende Bedingungen des Auftraggebers werden nicht Vertragsbestandteil, es sei denn, der Auftragnehmer stimmt ihrer Geltung ausdrücklich in Textform zu.',
          'Verbraucher ist jede natürliche Person, die den Vertrag zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB). Unternehmer ist, wer bei Abschluss in Ausübung seiner gewerblichen oder selbständigen beruflichen Tätigkeit handelt (§ 14 BGB).',
        ],
      },
      {
        title: '§ 2 Gegenstand der Leistung',
        paragraphs: [
          'Der Auftragnehmer überführt das vom Auftraggeber benannte Fahrzeug vom vereinbarten Abholort zum vereinbarten Zielort. Die Überführung erfolgt **auf eigener Achse**, das heißt: das Fahrzeug wird gefahren und nicht auf einem Anhänger oder Autotransporter befördert.',
          'Überführt werden PKW, SUV, Sportwagen, Luxusfahrzeuge sowie Transporter bis 3,5 t zulässiger Gesamtmasse.',
          'Zusatzleistungen — insbesondere die Dokumentation des Fahrzeugzustands, das Festhalten von Kilometerstand und Tank- bzw. Ladezustand, Übergabefotos sowie die Terminabstimmung mit Dritten — sind nur geschuldet, wenn sie ausdrücklich vereinbart wurden.',
        ],
      },
      {
        title: '§ 3 Angebot und Vertragsschluss',
        paragraphs: [
          'Die Darstellung der Leistungen auf dieser Website ist kein bindendes Angebot, sondern eine Aufforderung zur Abgabe einer Anfrage.',
          'Mit einer Anfrage über das Formular, per Telefon, E-Mail oder Messenger fordert der Auftraggeber ein Angebot an. Auf dieser Grundlage erstellt der Auftragnehmer ein individuelles Angebot zu einem Festpreis. Der Vertrag kommt zustande, wenn der Auftraggeber dieses Angebot annimmt und der Auftragnehmer den Auftrag bestätigt.',
          'Eine Anfrage ist unverbindlich und kostenfrei.',
        ],
      },
      {
        title: '§ 4 Preise und Zahlung',
        paragraphs: [
          'Es gilt der im Angebot genannte Festpreis. Er umfasst die dort aufgeführten Leistungen einschließlich An- und Rückreise sowie — soweit nicht ausdrücklich anders vereinbart — Kraftstoff und Maut.',
          'Nachträgliche Änderungen des Auftrags durch den Auftraggeber, insbesondere Änderungen von Abholort, Zielort oder Termin, können den Preis verändern. Der Auftragnehmer weist auf eine solche Änderung vor Ausführung hin.',
          'Die Zahlung erfolgt nach Rechnungsstellung ohne Abzug, sofern nichts anderes vereinbart ist. Der Auftraggeber erhält eine Rechnung; ein etwaiger Ausweis von Umsatzsteuer richtet sich nach den steuerrechtlichen Verhältnissen des Auftragnehmers.',
        ],
      },
      {
        title: '§ 5 Mitwirkungspflichten des Auftraggebers',
        paragraphs: ['Der Auftraggeber stellt sicher, dass zum vereinbarten Abholzeitpunkt:'],
        list: [
          'das Fahrzeug **fahrbereit und verkehrssicher** ist,',
          'ein gültiges Kennzeichen und ein bestehender Versicherungsschutz vorliegen — die reguläre Zulassung, ein Kurzzeitkennzeichen oder ein rotes Kennzeichen,',
          'die für die Fahrt erforderlichen Fahrzeugpapiere und mindestens ein Fahrzeugschlüssel übergeben werden,',
          'das Fahrzeug am vereinbarten Ort zugänglich ist und eine übergabeberechtigte Person anwesend oder erreichbar ist,',
          'bekannte Mängel, Besonderheiten oder Einschränkungen des Fahrzeugs vorab mitgeteilt werden.',
        ],
      },
      {
        title: '§ 6 Folgen fehlender Mitwirkung',
        paragraphs: [
          'Sind die Voraussetzungen nach § 5 nicht erfüllt und kann die Überführung deshalb nicht oder nicht wie vereinbart durchgeführt werden, kann der Auftragnehmer den nachgewiesenen Aufwand — insbesondere die vergebliche Anreise — in Rechnung stellen.',
        ],
      },
      {
        title: '§ 7 Versicherung und Absicherung',
        paragraphs: [
          'Der Auftraggeber ist verpflichtet, den Auftragnehmer vor Fahrtantritt über den bestehenden Versicherungsschutz des Fahrzeugs zu informieren. Bestehen Zweifel am Versicherungsschutz, wird die Überführung nicht angetreten.',
        ],
      },
      {
        title: '§ 8 Termine und Ausführung',
        paragraphs: [
          'Termine für Abholung und Übergabe werden individuell vereinbart. Sie sind verbindlich, wenn sie ausdrücklich als verbindlich bestätigt wurden.',
          'Kommt es aufgrund von Umständen, die der Auftragnehmer nicht zu vertreten hat — insbesondere Verkehrslage, Witterung, Streik, behördliche Anordnungen oder technische Defekte am Fahrzeug — zu Verzögerungen, verschiebt sich der Termin entsprechend. Der Auftragnehmer informiert den Auftraggeber unverzüglich.',
          'Der Auftragnehmer darf zur Durchführung geeignete Dritte einsetzen. Er bleibt in diesem Fall Vertragspartner des Auftraggebers.',
        ],
      },
      {
        title: '§ 9 Übergabe und Zustandsdokumentation',
        paragraphs: [
          'Bei Übernahme und Übergabe wird das Fahrzeug gemeinsam in Augenschein genommen, soweit eine berechtigte Person anwesend ist. Ist eine Zustandsdokumentation vereinbart, hält der Auftragnehmer den Zustand, den Kilometerstand sowie den Tank- bzw. Ladezustand fest und stellt die Dokumentation dem Auftraggeber zur Verfügung.',
          'Erkennbare Schäden sind bei der Übergabe unverzüglich anzuzeigen. Für Unternehmer gilt zusätzlich § 377 HGB.',
        ],
      },
      {
        title: '§ 10 Stornierung',
        paragraphs: [
          'Der Auftraggeber kann den Auftrag vor Fahrtantritt stornieren. Bereits entstandener Aufwand — insbesondere eine bereits angetretene Anreise oder gebuchte Fahrkarten — ist zu erstatten.',
          'Das gesetzliche Widerrufsrecht für Verbraucher bei Fernabsatzverträgen bleibt hiervon unberührt; Einzelheiten stehen in der [Widerrufsbelehrung](/widerruf).',
        ],
      },
      {
        title: '§ 11 Haftung',
        paragraphs: [
          'Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach den Vorschriften des Produkthaftungsgesetzes.',
          'Bei einfacher Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Auftraggeber regelmäßig vertrauen darf. In diesem Fall ist die Haftung auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.',
          'Eine weitergehende Haftung ist ausgeschlossen. Für normale Gebrauchsspuren, die sich aus der bestimmungsgemäßen Nutzung des Fahrzeugs auf der vereinbarten Strecke ergeben, sowie für Schäden aus vorbestehenden Mängeln, die dem Auftragnehmer nicht mitgeteilt wurden, wird nicht gehaftet.',
        ],
      },
      {
        title: '§ 12 Schlussbestimmungen',
        paragraphs: [
          'Es gilt das Recht der Bundesrepublik Deutschland. Bei Verbrauchern gilt diese Rechtswahl nur, soweit dadurch der Schutz zwingender Vorschriften des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, nicht entzogen wird.',
          'Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand der Sitz des Auftragnehmers.',
          'Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
        ],
      },
      {
        title: 'Hinweis',
        paragraphs: [
          'Diese Bedingungen wurden für den Geschäftsbetrieb der Fahrzeugüberführung verfasst. Sie ersetzen keine anwaltliche Prüfung. Vor dem produktiven Einsatz sollten sie von einer Rechtsanwältin oder einem Rechtsanwalt auf den konkreten Betrieb hin geprüft werden — insbesondere die Regelungen zu Haftung, Versicherung und Stornierung.',
        ],
      },
    ],
  },

  withdrawal: {
    title: 'Widerrufsbelehrung',
    intro:
      'Für Verbraucher bei Verträgen, die im Fernabsatz oder außerhalb von Geschäftsräumen geschlossen werden.',
    metaDescription:
      'Widerrufsrecht für Verbraucher bei Fernabsatzverträgen über Fahrzeugüberführungen, mit Muster-Widerrufsformular.',
    sections: [
      {
        title: 'Wer dieses Recht hat',
        paragraphs: [
          'Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB). Unternehmern steht das nachfolgend beschriebene Widerrufsrecht nicht zu.',
        ],
      },
      {
        title: 'Widerrufsrecht',
        paragraphs: [
          'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.',
          'Um Ihr Widerrufsrecht auszuüben, müssen Sie uns — Anschrift und Kontaktdaten siehe unten — mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten abgedruckte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.',
          'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
        ],
      },
      {
        title: 'Folgen des Widerrufs',
        paragraphs: [
          'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.',
          'Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.',
        ],
      },
      {
        title: 'Vorzeitiges Erlöschen des Widerrufsrechts',
        paragraphs: [
          'Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren.',
          'Das ist der praktisch häufige Fall: Wird eine Überführung auf Ihren Wunsch kurzfristig — also innerhalb der vierzehn Tage — durchgeführt, holen wir diese Zustimmung vor Fahrtantritt in Textform ein.',
        ],
      },
      // Der Inhalt dieses Abschnitts sind Anbieterangaben und Ausfülllinien,
      // kein Text — er wird von der Seite selbst gefüllt.
      { id: 'withdrawalForm', title: 'Muster-Widerrufsformular' },
      {
        title: 'Hinweis',
        paragraphs: [
          'Diese Belehrung folgt dem gesetzlichen Muster in Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB. Sie ersetzt keine anwaltliche Prüfung; insbesondere die Handhabung des vorzeitigen Erlöschens sollte vor dem produktiven Einsatz rechtlich abgesichert werden.',
        ],
      },
    ],
  },
};

/** Die Beschriftungen des Muster-Widerrufsformulars. */
export const withdrawalFormDe = {
  title: 'Muster-Widerrufsformular',
  intro:
    'Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.',
  to: 'An',
  body: 'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:',
  lines: [
    'Bezeichnung der Dienstleistung',
    'Bestellt am (*) / erhalten am (*)',
    'Name des/der Verbraucher(s)',
    'Anschrift des/der Verbraucher(s)',
    'Unterschrift (nur bei Mitteilung auf Papier)',
    'Datum',
  ],
  footnote: '(*) Unzutreffendes streichen.',
};
