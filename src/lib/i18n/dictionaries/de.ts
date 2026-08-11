export const de = {
  common: {
    calculatePrice: 'Preis berechnen',
    bookShipment: 'Sendung buchen',
    trackShipment: 'Sendung verfolgen',
    bulkyQuote: 'Preis für Sperrgut anfragen',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    save: 'Speichern',
    cancel: 'Abbrechen',
    loading: 'Wird geladen …',
    saving: 'Wird gespeichert …',
    search: 'Suchen',
    from: 'Von',
    to: 'Nach',
    weight: 'Gewicht',
    pieces: 'Gepäckstücke',
    pickup: 'Abholung',
    yes: 'Ja',
    nope: 'Nein',
    optional: 'optional',
    required: 'Pflichtfeld',
    status: 'Status',
    price: 'Preis',
    total: 'Gesamt',
    route: 'Route',
    date: 'Datum',
    close: 'Schließen',
    errorGeneric: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    skipToContent: 'Zum Inhalt springen',
  },
  nav: {
    home: 'Start',
    calculator: 'Preisrechner',
    booking: 'Buchen',
    tracking: 'Sendungsverfolgung',
    bulky: 'Sperrgut',
    contact: 'Kontakt',
    login: 'Anmelden',
    logout: 'Abmelden',
    account: 'Mein Konto',
    admin: 'Verwaltung',
    driver: 'Fahrer',
    mainNavigation: 'Hauptnavigation',
    menu: 'Menü öffnen',
  },
  meta: {
    tagline: 'Transporte zwischen Deutschland und Marokko',
    // Die Preise stehen als Platzhalter, damit die Beschreibung nie etwas
    // anderes behauptet als der Rechner ausrechnet.
    siteDescription:
      'Pakete, Taschen und Kartons zwischen Deutschland und Marokko. Ab {perKg}/kg, Mindestpreis {minimum}, Abholung +{pickup}. Mit Sendungsnummer, QR-Code und Statusverfolgung.',
    ogDescription:
      'Transport zwischen Frankfurt/Rhein-Main und Nador. Ab {perKg}/kg, Mindestpreis {minimum}, Abholung +{pickup}.',
    ogLocale: 'de_DE',
  },
  countries: {
    DE: 'Deutschland',
    MA: 'Marokko',
  },
  home: {
    eyebrow: 'Deutschland ↔ Marokko',
    // {from} und {to} werden im Markup farbig hervorgehoben. Als Platzhalter,
    // weil die Wortstellung je Sprache anders ist — im Französischen steht die
    // Präposition am Land, im Arabischen kommt „sicher“ ganz ans Ende.
    headline: 'Deine Pakete sicher von {from} nach {to}',
    subline:
      'Wir holen deine Pakete, Taschen und Kartons im Rhein-Main-Gebiet ab und bringen sie nach Nador und Umgebung — mit fester Sendungsnummer, QR-Code und lückenloser Statusverfolgung.',
    factParcels: 'Pakete ab',
    factMinimum: 'Mindestpreis',
    factPickup: 'Abholung',
    documentsNote:
      'Dokumente (Pässe, Urkunden, Verträge): pauschal {price} bis {max} kg — unabhängig vom Gewicht.',
    bulkyNote:
      'Sperrige Gegenstände (Möbel, Geräte, Fahrräder): individueller Pauschalpreis nach Foto und Maßen.',
    whyTitle: 'Warum {brand}?',
    whySubtitle: 'Persönlich, nachvollziehbar und ohne versteckte Kosten.',
    featurePickupTitle: 'Persönliche Abholung',
    featurePickupText:
      'Auf Wunsch holen wir deine Sendung im Rhein-Main-Gebiet direkt bei dir zu Hause ab — für pauschal {pickup}.',
    featureNumberTitle: 'Feste Sendungsnummer',
    featureNumberText:
      'Jede Sendung bekommt sofort eine eindeutige Nummer wie {example}. Damit findest du sie jederzeit wieder.',
    featureQrTitle: 'QR-Code auf jedem Paket',
    featureQrText:
      'Ein aufgeklebtes Label mit QR-Code. Unser Team scannt es an jeder Station — ohne dass deine Daten auf dem Paket stehen.',
    featureStatusTitle: 'Statusverfolgung',
    featureStatusText:
      'Von „Gebucht“ bis „Zugestellt“: jeder Schritt wird protokolliert und ist für dich online sichtbar.',
    featureSealTitle: 'Sichere Dokumentation',
    featureSealText:
      'Große Sendungen versiegeln wir mit nummerierten Sicherheitsbeuteln. Die Plombennummer siehst du im Tracking.',
    featurePriceTitle: 'Transparente Preise',
    featurePriceText:
      'Kein Kleingedrucktes: {perKg} pro Kilo, mindestens {minimum}, Abholung {pickup}. Sperrgut bekommt einen Festpreis vorab.',
    stepsTitle: 'So einfach geht es',
    step1Title: 'Preis berechnen',
    step1Text: 'Gewicht eingeben, Preis sofort sehen — ohne Anmeldung.',
    step2Title: 'Sendung buchen',
    step2Text: 'Absender und Empfänger eintragen, fertig in wenigen Minuten.',
    step3Title: 'Abgeben oder abholen lassen',
    step3Text: 'Du bringst sie vorbei oder wir kommen zu dir.',
    step4Title: 'Verfolgen bis zur Übergabe',
    step4Text: 'Statusupdates bis die Sendung in Marokko ankommt.',
    areaTitle: 'Unser Liniengebiet',
    areaText:
      'Wir starten im Rhein-Main-Gebiet und in der Region Nador. Weitere Städte kommen laufend dazu — frag einfach nach, wenn deine Stadt noch fehlt.',
    areaCta: 'Stadt anfragen',
    areaFromHint: 'Frankfurt & Rhein-Main',
    areaToHint: 'Nador & Umgebung',
    ctaTitle: 'Bereit für deine Sendung?',
    ctaText: 'Preis berechnen, buchen, Sendungsnummer erhalten — in wenigen Minuten erledigt.',
  },
  calculator: {
    title: 'Preis berechnen',
    subtitle: 'In 30 Sekunden zum Festpreis — ohne Anmeldung.',
    direction: 'Richtung',
    originCity: 'Abholstadt',
    destinationCity: 'Zielstadt',
    weightLabel: 'Gewicht in kg',
    pickupLabel: 'Abholung bei mir zu Hause',
    pickupHint: 'Wir holen deine Sendung ab (+{pickup}). Sonst gibst du sie bei uns ab.',
    typeLabel: 'Art der Sendung',
    typeStandard: 'Normale Sendung',
    typeStandardHint: 'Pakete, Taschen, Kartons',
    typeDocuments: 'Dokumente',
    typeDocumentsHint: 'Pässe, Urkunden, Verträge',
    typeBulky: 'Sperrig / schwer',
    typeBulkyHint: 'Möbel, Geräte, Fahrrad …',
    cityOnRequest: 'auf Anfrage',
    swapDirection: 'Richtung tauschen',
    weightHintBulky: 'Ungefähres Gewicht genügt — wir prüfen es bei der Abholung.',
    weightHintStandard: 'Mindestpreis {minimum} · danach {perKg} pro kg',
    weightPlaceholder: 'z. B. 25',
    tooHeavyStandard: 'Über {max} kg bitte als Sperrgut anfragen.',
    tooHeavyDocuments: 'Über {max} kg bitte als normale Sendung buchen.',
    forWeight: 'für {weight}',
    inclPickup: 'inkl. Abholung',
    dropOff: 'Abgabe bei uns',
    enterWeight: 'Gib ein Gewicht ein, um deinen Preis zu sehen.',
    yourPrice: 'Dein Preis',
    breakdownWeight: 'Transport ({weight})',
    breakdownMinimum: 'Mindestpreis',
    breakdownDocuments: 'Dokumente (Pauschale)',
    documentsExplain:
      'Pauschal {price} bis {max} kg — unabhängig vom Gewicht. Für Pässe, Urkunden, Verträge und Vollmachten. Schwerer oder mehr als ein Umschlag? Dann buche es als normale Sendung.',
    breakdownPickup: 'Abholung',
    bulkyNotice: 'Individuelles Angebot erforderlich',
    bulkyExplain:
      'Für sperrige oder besonders schwere Güter erstellen wir dir einen persönlichen Pauschalpreis. Lade dafür Fotos und Maße hoch — du bekommst dein Angebot in der Regel innerhalb von 24 Stunden.',
  },
  calculatorPage: {
    metaTitle: 'Preisrechner',
    metaDescription:
      'Berechne den Preis für deine Sendung nach Marokko: {perKg}/kg, Mindestpreis {minimum}, Abholung +{pickup}.',
    intro:
      'Der angezeigte Preis ist der Preis, den du zahlst — wir prüfen das Gewicht bei der Annahme und sprechen Abweichungen immer vorher mit dir ab.',
    howTitle: 'So rechnen wir',
    rowPerKilo: 'Preis pro Kilogramm',
    rowMinimum: 'Mindestpreis',
    rowPickup: 'Abholung beim Kunden',
    rowDocuments: 'Dokumente bis {max} kg',
    rowBulky: 'Sperrgut',
    bulkyOnRequest: 'Festpreis auf Anfrage',
    minimumNote:
      'Bis einschließlich {breakEven} kg gilt der Mindestpreis von {minimum}. Ab {breakEven} kg zahlst du genau {perKg} pro Kilo.',
    examplesTitle: 'Beispiele',
    colWeight: 'Gewicht',
    colPickup: 'Abholung',
    colPrice: 'Preis',
    bulkyTitle: 'Sperrig oder sehr schwer?',
    bulkyText:
      'Für Waschmaschinen, Kühlschränke, Möbel, Fahrräder oder Autoteile machen wir dir einen persönlichen Festpreis.',
  },
  booking: {
    title: 'Sendung buchen',
    stepShipment: 'Sendung',
    stepSender: 'Absender',
    stepRecipient: 'Empfänger',
    stepConfirm: 'Bestätigen',
    confirmDetails: 'Ich bestätige, dass meine Angaben korrekt sind.',
    confirmProhibited:
      'Ich bestätige, dass meine Sendung keine verbotenen oder nicht deklarierten Waren enthält.',
    confirmTerms: 'Ich akzeptiere die Versandbedingungen und die Datenschutzhinweise.',
    successTitle: 'Deine Sendung wurde gebucht.',
    successHint: 'Notiere dir deine Sendungsnummer — damit kannst du jederzeit den Status abfragen.',
    shareText: 'Meine Sendung {number} ist gebucht. Status verfolgen: {url}',
  },
  tracking: {
    title: 'Sendungsverfolgung',
    subtitle: 'Gib deine Sendungsnummer ein, um den aktuellen Status zu sehen.',
    // Beispielnummer bewusst nicht hier: sie hängt am Nummernpräfix der Marke
    // und stünde sonst irgendwann im Widerspruch zu den echten Nummern.
    placeholder: 'z. B. ',
    notFound:
      'Zu dieser Sendungsnummer haben wir nichts gefunden. Bitte prüfe die Nummer und versuche es erneut.',
    lastUpdate: 'Letztes Update',
    history: 'Verlauf',
    sealed: 'Versiegelt mit Sicherheitsnummer {seal}',
    privacyNote:
      'Aus Datenschutzgründen zeigen wir hier keine Adressen, Telefonnummern oder Preise an.',
  },
  bulky: {
    title: 'Sperrgut anfragen',
    subtitle: 'Fotos hochladen, Maße angeben — wir melden uns mit einem Festpreis.',
    successTitle: 'Wir prüfen deine Anfrage.',
    successHint: 'Du bekommst dein persönliches Angebot in der Regel innerhalb von 24 Stunden.',
  },
  footer: {
    blurb: 'Persönlich, transparent und mit lückenloser Sendungsverfolgung.',
    rights: 'Alle Rechte vorbehalten.',
    vatNote: 'Preise inkl. gesetzlicher Umsatzsteuer, sofern anwendbar.',
    legal: 'Rechtliches',
    company: 'Unternehmen',
    service: 'Service',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    terms: 'AGB',
    shippingTerms: 'Versandbedingungen',
    prohibited: 'Verbotene Waren',
    liability: 'Haftung & Versicherung',
  },
} as const;

/**
 * Widens the literal types that `as const` produces back to `string`.
 *
 * Without it every other locale would have to contain the German words: the
 * type of `footer.legal` would be the literal `'Rechtliches'`, not `string`.
 * The German file stays the shape everyone else has to match — same keys, same
 * nesting — while the values are free.
 */
type Translated<T> = {
  [K in keyof T]: T[K] extends string ? string : Translated<T[K]>;
};

export type Dictionary = Translated<typeof de>;
