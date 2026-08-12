/**
 * The legal texts, in German.
 *
 * Kept out of the main dictionary because of their sheer length — the four
 * files here are roughly as long as everything else put together, and mixing
 * them in would bury the ordinary interface strings.
 *
 * German is the authoritative version: the business is German, the disclosures
 * follow German law, and the other three files say so explicitly (see
 * `translationNotice`). A translation is a service to the reader, not a second
 * legally binding text.
 *
 * ⚠ All of these are drafts written by a developer, not by a lawyer. Passages
 * in square brackets mark what still has to be filled in before the business
 * goes live.
 */
export const legalDe = {
  disclaimerTitle: 'Platzhalter — juristisch noch nicht geprüft',
  disclaimer:
    'Dieser Text ist ein unverbindlicher Entwurf zur technischen Fertigstellung der Website. Er ersetzt keine Rechtsberatung. Vor dem echten Geschäftsbetrieb muss er von einer Anwältin oder einem Anwalt geprüft und an dein tatsächliches Unternehmen, deine Versicherung und die geltenden zoll- und transportrechtlichen Vorgaben angepasst werden.',
  translationNoticeTitle: 'Übersetzung',
  translationNotice:
    'Diese Seite ist eine Übersetzung zur besseren Verständlichkeit. Rechtlich verbindlich ist ausschließlich die deutsche Fassung.',
  asOf: 'Stand: {date}',
  updatedAt: 'noch nicht final geprüft',

  terms: {
    title: 'Allgemeine Geschäftsbedingungen',
    intro: 'Vertragsbedingungen für Transportleistungen von {brand}.',
    s1Title: '§ 1 Geltungsbereich',
    s1p: 'Diese Bedingungen gelten für alle Transportleistungen zwischen {legalName} (nachfolgend „wir“) und dem Auftraggeber (nachfolgend „Kunde“) im Verkehr zwischen Deutschland und Marokko.',
    s2Title: '§ 2 Vertragsschluss',
    s2p: 'Der Vertrag kommt mit der Bestätigung der Buchung durch uns zustande. Der Kunde erhält eine Sendungsnummer, unter der die Sendung nachverfolgt werden kann.',
    s3Title: '§ 3 Preise',
    s3li1: 'Normale Sendungen: {perKg} je angefangenes Kilogramm.',
    s3li2: 'Mindestpreis je Sendung: {minimum}.',
    s3li3: 'Abholung beim Kunden: pauschal {pickup}.',
    s3li4: 'Dokumente bis {documentsMax} kg: pauschal {documents}, unabhängig vom Gewicht.',
    s3li5:
      'Sperrige oder besonders schwere Güter: individueller Pauschalpreis nach vorheriger Prüfung von Fotos, Maßen und Gewicht.',
    s3p: 'Maßgeblich ist das bei der Annahme festgestellte tatsächliche Gewicht. Weicht es von der Angabe des Kunden ab, informieren wir ihn vor der Weiterbeförderung.',
    s4Title: '§ 4 Pflichten des Kunden',
    s4li1: 'vollständige und wahrheitsgemäße Angaben zu Inhalt, Gewicht und Empfänger',
    s4li2: 'transportsichere Verpackung der Sendung',
    s4li3: 'keine verbotenen oder nicht deklarierten Waren (siehe Seite „Verbotene Waren“)',
    s4li4: 'Erreichbarkeit des Empfängers unter der angegebenen Telefonnummer',
    s5Title: '§ 5 Zahlung',
    s5p: 'Die Zahlung erfolgt derzeit bar bei Abgabe oder Abholung, per Überweisung oder auf Rechnung nach Absprache. Eine Online-Zahlung ist in Vorbereitung.',
    s6Title: '§ 6 Laufzeiten',
    s6todo:
      '[Realistische Transportzeiten eintragen, z. B. „in der Regel 7–12 Tage ab Verladung“. Verbindliche Zusagen nur machen, wenn sie eingehalten werden können.]',
    s6p: 'Angegebene Laufzeiten sind unverbindliche Richtwerte. Verzögerungen durch Zoll, Fähre oder höhere Gewalt begründen keinen Schadenersatzanspruch.',
    s7Title: '§ 7 Haftung',
    s7p: 'Es gelten die Regelungen der Seite „Haftung & Versicherung“.',
    s7todo:
      '[Prüfen lassen, ob und in welchem Umfang die CMR (Übereinkommen über den Beförderungsvertrag im internationalen Straßengüterverkehr) oder §§ 407 ff. HGB Anwendung finden.]',
    s8Title: '§ 8 Widerrufsrecht für Verbraucher',
    s8todo:
      '[Widerrufsbelehrung ergänzen. Bei Beförderungsverträgen gelten Besonderheiten — bitte anwaltlich klären, ob § 312g Abs. 2 BGB einschlägig ist, und gegebenenfalls ein Muster-Widerrufsformular bereitstellen.]',
    s9Title: '§ 9 Schlussbestimmungen',
    s9p: 'Es gilt deutsches Recht. Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
  },

  privacy: {
    title: 'Datenschutzerklärung',
    intro: 'Wie wir mit deinen personenbezogenen Daten umgehen — und welche Rechte du hast.',
    s1Title: '1. Verantwortlicher',
    s1p: '{legalName}, {street}, {zip} {city}, {country}. E-Mail: {email}, Telefon: {phone}.',
    s1todo:
      '[Falls ein Datenschutzbeauftragter benannt werden muss, hier Name und Kontaktdaten ergänzen.]',
    s2Title: '2. Welche Daten wir verarbeiten',
    s2p: 'Für die Abwicklung einer Sendung verarbeiten wir:',
    s2li1: 'Vor- und Nachname von Absender und Empfänger',
    s2li2: 'Anschrift von Absender und Empfänger',
    s2li3: 'Telefonnummer und E-Mail-Adresse',
    s2li4: 'Angaben zur Sendung: Gewicht, Anzahl, Inhalt, Beschreibung',
    s2li5: 'Abhol- und Zustelltermine sowie Statusmeldungen',
    s2li6: 'Zahlungsstatus und Betrag',
    s2li7: 'bei Sperrgut: von dir hochgeladene Fotos',
    s2li8: 'bei Abholung und Zustellung: Nachweisfotos und ggf. eine Unterschrift',
    s2after:
      'Wir erheben nur die Daten, die wir für den Transport tatsächlich brauchen. Sensible Daten (z. B. Gesundheitsdaten) verarbeiten wir nicht.',
    s3Title: '3. Rechtsgrundlagen',
    s3li1Law: 'Art. 6 Abs. 1 lit. b DSGVO',
    s3li1: '— Erfüllung des Transportvertrags (Buchung, Abholung, Transport, Zustellung, Sendungsverfolgung).',
    s3li2Law: 'Art. 6 Abs. 1 lit. c DSGVO',
    s3li2: '— gesetzliche Pflichten, insbesondere handels- und steuerrechtliche Aufbewahrungspflichten sowie zollrechtliche Vorgaben.',
    s3li3Law: 'Art. 6 Abs. 1 lit. f DSGVO',
    s3li3: '— berechtigtes Interesse an der Sicherheit unserer Systeme, an der Dokumentation der Übergaben und an der Abwehr von Missbrauch.',
    s4Title: '4. Empfänger und Auftragsverarbeiter',
    s4p: 'Wir setzen folgende Dienstleister ein:',
    s4li1: '— Hosting der Website und Betrieb der Anwendung.',
    s4li1todo: '[Auftragsverarbeitungsvertrag abschließen und hier bestätigen.]',
    s4li2: '— Datenbank, Authentifizierung und Dateispeicher. Serverstandort: Region Frankfurt (EU).',
    s4li2todo: '[Auftragsverarbeitungsvertrag abschließen und hier bestätigen.]',
    s4li3: '— Versand der Transaktions-E-Mails (Buchungsbestätigung, Statusmeldungen, Angebote).',
    s4li3todo: '[Auftragsverarbeitungsvertrag abschließen und hier bestätigen.]',
    s4after:
      'Eine Übermittlung in Drittländer erfolgt nur auf Grundlage geeigneter Garantien (Art. 44 ff. DSGVO).',
    s4todo: '[Konkrete Garantien prüfen und benennen.]',
    s5Title: '5. Sendungsverfolgung',
    s5p: 'Über die öffentliche Sendungsverfolgung sind nur die Sendungsnummer, der Status, die Route, die Anzahl der Gepäckstücke, das Gesamtgewicht, eine eventuelle Sicherheitsnummer und der Verlauf einsehbar.',
    s5strong:
      'Adressen, Telefonnummern, E-Mail-Adressen, Preise und interne Notizen werden dort niemals angezeigt.',
    s6Title: '6. Speicherdauer',
    s6p: 'Sendungsdaten bewahren wir für die Dauer der Vertragsabwicklung und anschließend im Rahmen der gesetzlichen Aufbewahrungsfristen auf (handels- und steuerrechtlich in der Regel 6 bzw. 10 Jahre). Fotos von Sperrgut-Anfragen, die nicht zu einer Sendung führen, löschen wir spätestens nach',
    s6todo: '[Frist festlegen, z. B. 6 Monate]',
    s7Title: '7. Deine Rechte',
    s7li1: 'Auskunft über die zu dir gespeicherten Daten (Art. 15 DSGVO)',
    s7li2: 'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
    s7li3: 'Löschung (Art. 17 DSGVO), soweit keine Aufbewahrungspflicht entgegensteht',
    s7li4: 'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
    s7li5: 'Datenübertragbarkeit (Art. 20 DSGVO)',
    s7li6: 'Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)',
    s7li7: 'Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)',
    s7after: 'Für alle Anliegen genügt eine E-Mail an {email}.',
    s8Title: '8. Cookies und Reichweitenmessung',
    s8p: 'Wir setzen ausschließlich technisch notwendige Cookies ein — konkret das Sitzungs-Cookie für angemeldete Nutzerinnen und Nutzer sowie ein Cookie, das sich die gewählte Sprache merkt. Es findet kein Tracking und keine Werbeanalyse statt.',
    s8todo:
      '[Anpassen, falls später Analyse-Tools eingesetzt werden — dann ist eine Einwilligungslösung erforderlich.]',
    s9Title: '9. Datensicherheit',
    s9p: 'Die Übertragung erfolgt verschlüsselt über HTTPS. Der Zugriff auf Kundendaten ist rollenbasiert beschränkt und wird zusätzlich auf Datenbankebene durchgesetzt. Fotos und Zustellnachweise liegen in nicht-öffentlichen Speicherbereichen und sind ausschließlich über zeitlich befristete, signierte Links erreichbar.',
  },

  shipping: {
    title: 'Versandbedingungen',
    intro: 'Was du vor dem Versand wissen solltest — praktisch und kurz.',
    s1Title: 'Was wir transportieren',
    s1p1: 'Pakete, Taschen, Kartons, persönliche Gegenstände und nach Absprache Sperrgut wie Möbel, Haushaltsgeräte oder Fahrräder. Ausgeschlossen sind die auf der Seite',
    s1p2: 'genannten Gegenstände.',
    s2Title: 'Verpackung',
    s2li1: 'Stabile Kartons oder feste Reisetaschen verwenden.',
    s2li2: 'Zerbrechliches gut auspolstern — wir stapeln im Fahrzeug.',
    s2li3: 'Jedes Gepäckstück außen mit Name und Telefonnummer des Empfängers beschriften.',
    s2li4: 'Flüssigkeiten zusätzlich in einen dichten Beutel geben.',
    s3Title: 'Abgabe oder Abholung',
    s3p: 'Du kannst deine Sendung bei uns abgeben oder sie für pauschal {pickup} bei dir abholen lassen. Bei der Abholung prüfen wir Gewicht und Anzahl gemeinsam mit dir und dokumentieren die Übernahme.',
    s4Title: 'Dokumente',
    s4p: 'Pässe, Urkunden, Verträge und Vollmachten befördern wir als eigene Sendungsart zum Pauschalpreis von {documents} bis {documentsMax} kg. Sie müssen als Dokumentensendung gebucht werden — lose in einem Paket dürfen wir sie nicht mitnehmen.',
    s5Title: 'Sicherheitsbeutel und Plomben',
    s5p: 'Größere Sendungen versiegeln wir mit nummerierten Sicherheitsbeuteln. Die Nummer (z. B. SEC-583921) wird gespeichert und ist in deiner Sendungsverfolgung sichtbar. Prüfe bei der Übergabe, ob Nummer und Verschluss unversehrt sind.',
    s6Title: 'Zustellung',
    s6p: 'Wir stellen an der angegebenen Adresse zu oder vereinbaren einen Übergabeort. Der Empfänger muss telefonisch erreichbar sein. Bei der Übergabe dokumentieren wir die Zustellung mit Foto und/oder Unterschrift.',
    s7Title: 'Zoll',
    s7todo:
      '[Zollrechtliche Hinweise durch eine sachkundige Stelle ergänzen lassen: Welche Warenmengen sind als Umzugs- oder Geschenkgut zulässig? Welche Dokumente muss der Kunde beibringen? Wer trägt eventuelle Abgaben?]',
  },

  liability: {
    title: 'Haftung & Versicherung',
    intro: 'Wofür wir einstehen — und was du selbst absichern solltest.',
    s1Title: 'Grundsatz',
    s1p: 'Wir haften für Verlust und Beschädigung der Sendung während der Zeit, in der wir sie in Obhut haben.',
    s1todo:
      '[Haftungsrahmen konkretisieren: Gilt die CMR mit 8,33 SZR je Kilogramm, gelten §§ 407 ff. HGB mit 8,33 Rechnungseinheiten je Kilogramm, oder eine abweichende vertragliche Regelung? Zwingend anwaltlich klären.]',
    s2Title: 'Höchstbetrag je Sendung',
    s2todo:
      '[Konkreten Höchstbetrag eintragen, abgestimmt mit deiner Transportversicherung, z. B. „bis 500 € je Sendung“. Ohne abgeschlossene Versicherung hier keinen Betrag nennen.]',
    s3Title: 'Nicht versicherte Gegenstände',
    s3p: 'Für Bargeld, Schmuck, Edelmetalle, Wertpapiere, elektronische Geräte ohne Originalverpackung und leicht verderbliche Waren besteht kein Versicherungsschutz. Bitte gib solche Gegenstände nicht mit.',
    s4Title: 'Verpackung',
    s4p: 'Für Schäden, die auf eine unzureichende Verpackung durch den Absender zurückgehen, können wir nicht haften. Hinweise dazu findest du in den Versandbedingungen.',
    s5Title: 'Schadenmeldung',
    s5p1: 'Melde einen erkennbaren Schaden bitte',
    s5strong: 'direkt bei der Übergabe',
    s5p2: 'und lass ihn auf dem Übergabeprotokoll vermerken. Verdeckte Schäden melde uns bitte innerhalb von',
    s5todo: '[Frist eintragen, z. B. 7 Tagen]',
    s5p3: 'mit Fotos.',
    s6Title: 'Höhere Gewalt',
    s6p: 'Für Verzögerungen oder Schäden durch Streik, Wetter, Grenzschließungen, Fährausfälle, behördliche Maßnahmen oder Zollkontrollen haften wir nicht.',
    s7Title: 'Erforderliche Versicherungen',
    s7todo:
      '[Vor Betriebsaufnahme klären und hier dokumentieren: Verkehrshaftungsversicherung, Betriebshaftpflicht, ggf. Warentransportversicherung, sowie die Erlaubnis nach § 3 GüKG bzw. die EU-Gemeinschaftslizenz für grenzüberschreitenden gewerblichen Güterverkehr.]',
  },

  imprint: {
    title: 'Impressum',
    intro: 'Angaben gemäß § 5 DDG (ehemals § 5 TMG).',
    s1Title: 'Diensteanbieter',
    s2Title: 'Kontakt',
    phone: 'Telefon',
    email: 'E-Mail',
    s3Title: 'Vertretungsberechtigte Person',
    s3todo: '[Vor- und Nachname der Inhaberin / des Inhabers eintragen]',
    s4Title: 'Umsatzsteuer-Identifikationsnummer',
    s4todo:
      '[USt-IdNr. gemäß § 27 a UStG eintragen — oder Hinweis auf Kleinunternehmerregelung nach § 19 UStG]',
    s5Title: 'Registereintrag / Erlaubnis',
    s5todo:
      '[Falls vorhanden: Handelsregister und Registernummer eintragen. Für gewerblichen Güterkraftverkehr ist zusätzlich die Erlaubnis nach § 3 GüKG bzw. die EU-Gemeinschaftslizenz nach VO (EG) 1072/2009 anzugeben. Bitte anwaltlich prüfen lassen, welche Erlaubnis für dein konkretes Geschäftsmodell erforderlich ist.]',
    s6Title: 'Redaktionell verantwortlich',
    s6todo: '[Name und Anschrift der verantwortlichen Person eintragen]',
    s7Title: 'EU-Streitschlichtung',
    s7p1: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:',
    s7p2: '. Unsere E-Mail-Adresse findest du oben.',
    s8Title: 'Verbraucherstreitbeilegung',
    s8todo:
      '[Angabe ergänzen: Wir sind (nicht) bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.]',
  },

  prohibited: {
    title: 'Verbotene Waren',
    intro:
      'Diese Gegenstände dürfen wir nicht transportieren. Bitte prüfe deine Sendung vor der Abgabe.',
    s1Title: 'Nicht erlaubt',
    forExample: 'Zum Beispiel: {examples}.',
    s2Title: 'Im Zweifel: kurz nachfragen',
    s2p: 'Du bist dir bei einem Gegenstand nicht sicher? Schreib uns an {email} oder ruf an unter {phone}. Eine Minute Rückfrage ist besser als eine Sendung, die im Zoll hängen bleibt.',
    s3Title: 'Folgen bei Verstoß',
    s3p: 'Enthält eine Sendung verbotene oder nicht deklarierte Waren, können wir die Beförderung verweigern. Für Schäden, Beschlagnahmen, Bußgelder oder Verzögerungen, die dadurch entstehen, haftet der Absender.',
    s3todo: '[Genaue Rechtsfolgen und mögliche Kostenübernahme anwaltlich prüfen und hier konkretisieren.]',
    s4Title: 'Diese Liste ist nicht abschließend',
    s4todo:
      '[Die endgültige Liste muss zoll- und transportrechtlich geprüft werden — insbesondere gegen die Einfuhrbestimmungen der marokkanischen Zollverwaltung (ADII), die deutschen Ausfuhrvorschriften und die ADR-Gefahrgutvorschriften. Auch die Vorgaben deiner Transportversicherung sind einzuarbeiten.]',

    weaponsTitle: 'Waffen, Munition und Waffenteile',
    weaponsExamples: 'Schusswaffen, Munition, Messer mit Waffencharakter, Reizgas',
    weaponsNote: '',
    drugsTitle: 'Betäubungsmittel und illegale Substanzen',
    drugsExamples: 'Drogen jeder Art, nicht verschreibungsfähige Präparate',
    drugsNote: '',
    dangerousTitle: 'Gefahrgut und leicht entzündliche Stoffe',
    dangerousExamples:
      'Benzin, Diesel, Spiritus, Gasflaschen und Feuerzeuggas, Feuerwerk und Pyrotechnik, Farben, Lacke, Lösungsmittel, Säuren und Laugen',
    dangerousNote: 'Auch scheinbar harmlose Sprays und Parfüm gelten teilweise als Gefahrgut.',
    batteriesTitle: 'Lose Lithium-Batterien und beschädigte Akkus',
    batteriesExamples: 'Powerbanks ohne Gerät, aufgeblähte oder beschädigte Akkus, E-Bike-Akkus',
    batteriesNote: 'Geräte mit fest verbautem Akku bitte vorher mit uns abstimmen.',
    moneyTitle: 'Bargeld, Edelmetalle und Wertsachen',
    moneyExamples: 'Bargeld, Gold- und Silberbarren, Schmuck von hohem Wert, Sparbücher',
    moneyNote: 'Für Wertsachen besteht kein Versicherungsschutz — bitte niemals mitgeben.',
    documentsTitle: 'Ausweis- und Originaldokumente im normalen Paket',
    documentsExamples: 'Reisepässe, Personalausweise, Original-Urkunden',
    documentsNote:
      'Nicht generell verboten: Für genau diese Papiere gibt es die Sendungsart „Dokumente“ zum Pauschalpreis. Lose in einem Paket dürfen sie nicht mitreisen.',
    perishableTitle: 'Verderbliche Lebensmittel und lebende Tiere',
    perishableExamples: 'frisches Fleisch und Fisch, Milchprodukte, Pflanzen, lebende Tiere',
    perishableNote: 'Haltbar verpackte Lebensmittel sind nach Absprache möglich.',
    counterfeitTitle: 'Gefälschte und nicht deklarierte Handelswaren',
    counterfeitExamples: 'Markenfälschungen, unversteuerte Zigaretten, Alkohol zum Weiterverkauf',
    counterfeitNote: '',
    medicalTitle: 'Verschreibungspflichtige Medikamente ohne Nachweis',
    medicalExamples: 'Medikamente in Handelsmengen, Betäubungsmittel-Rezepte',
    medicalNote: 'Kleine Mengen für den Eigenbedarf bitte vorher anmelden.',
  },
} as const;

/**
 * Widens the literal types `as const` produces back to `string`, so the other
 * three files match the shape without having to contain the German words.
 */
type Translated<T> = {
  [K in keyof T]: T[K] extends string ? string : Translated<T[K]>;
};

export type LegalDictionary = Translated<typeof legalDe>;
