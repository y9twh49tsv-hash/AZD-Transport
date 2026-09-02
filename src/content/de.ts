import type { Content } from './types';
import { legalDe } from './legal/de';

/**
 * Die deutschen Inhalte — die Ausgangssprache.
 *
 * `en.ts` ist als `Content` deklariert und muss dieselbe Form erfüllen. Ein
 * vergessenes Feld ist damit ein Compilerfehler und keine Lücke, die erst auf
 * der fertigen Seite auffällt.
 */
export const de: Content = {
  localeName: 'Deutsch',
  switchTo: 'English',

  meta: {
    title: 'Fahrzeugüberführung Frankfurt & deutschlandweit | AZD Transport',
    description:
      'Professionelle Fahrzeugüberführungen auf eigener Achse. Premium-, Leasing- und Firmenfahrzeuge deutschlandweit überführen lassen. Jetzt unverbindlich anfragen.',
    ogLocale: 'de_DE',
  },

  whatsappOpener: 'Hallo, ich interessiere mich für eine Fahrzeugüberführung.',

  company: {
    shortDescription: 'Premium Fahrzeugüberführungen auf eigener Achse.',
    serviceArea: 'Deutschlandweit — auf Anfrage europaweit',
    insuranceText:
      'Die konkrete Absicherung wird je nach Auftrag und Fahrzeug individuell geprüft. Die Details erhalten Sie vor Auftragserteilung schriftlich.',
  },

  seo: {
    countryName: 'Deutschland',
    serviceName: 'Fahrzeugüberführung auf eigener Achse',
    serviceType: 'Fahrzeugüberführung',
    serviceDescription:
      'Professionelle Überführung von PKW, SUV, Sportwagen, Luxusfahrzeugen und Transportern bis 3,5 t auf eigener Achse — nicht auf Anhänger oder Autotransporter.',
    offerCatalogName: 'Leistungen',
  },

  nav: {
    services: 'Leistungen',
    premium: 'Premium-Service',
    business: 'Für Unternehmen',
    process: 'Ablauf',
    faq: 'FAQ',
    contact: 'Kontakt',
    request: 'Überführung anfragen',
    legal: 'Rechtliches',
    navigation: 'Navigation',
    mainNavigation: 'Hauptnavigation',
    mobileNavigation: 'Hauptnavigation mobil',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    call: 'Anrufen',
    skipToContent: 'Zum Inhalt springen',
    language: 'Sprache',
  },

  home: {
    eyebrow: 'Fahrzeugüberführungen auf eigener Achse',
    headlineTop: 'Premium Fahrzeugüberführungen.',
    headlineAccent: 'Deutschlandweit.',
    lead: 'Professionelle Fahrzeugüberführungen auf eigener Achse — persönlich, zuverlässig und transparent.',
    points: [
      'Auf eigener Achse',
      'Deutschlandweit',
      'Flexible Termine',
      'Zustandsdokumentation',
      'Rechnung für Privat & Gewerbe',
    ],
    ctaPrimary: 'Überführung anfragen',
    ctaSecondary: 'Preis anfragen',
    ctaWhatsApp: 'Direkt per WhatsApp',
    factsArea: 'Einsatzgebiet',
    factsVehicles: 'Fahrzeuge',
    factsVehiclesValue: 'PKW, SUV, Sportwagen, Luxusfahrzeuge, Transporter bis 3,5 t',
    factsContact: 'Direkter Kontakt',
    trustLabel: 'Kurzüberblick',
    trust: [
      'Persönliche Durchführung',
      'Transparente Preisabsprache',
      'Flexible Terminplanung',
      'Dokumentierte Übergabe',
    ],

    servicesEyebrow: 'Leistungen',
    servicesTitle: 'Überführungen für jeden Anlass.',
    servicesLead:
      'Ob einzelnes Fahrzeug oder wiederkehrender Auftrag — der Ablauf bleibt derselbe: klare Absprache, fester Preis, persönliche Übergabe.',

    premiumEyebrow: 'Premium-Service',
    premiumTitle: 'Besondere Fahrzeuge verdienen besondere Sorgfalt.',
    premiumParagraphs: [
      'Bei hochwertigen Fahrzeugen geht es nicht nur darum, von A nach B zu kommen. Übergabe, Kommunikation, Dokumentation und ein verantwortungsvoller Umgang mit dem Fahrzeug stehen im Mittelpunkt.',
      'Das Fahrzeug fährt auf eigener Achse — angemessen bewegt, ohne unnötige Zwischenstopps und ohne Auf- und Abladen auf einen Anhänger.',
    ],
    insuranceTitle: 'Versicherung & Absicherung',
    documentationTitle: 'Auf Wunsch Teil des Auftrags',

    processEyebrow: 'Ablauf',
    processTitle: 'In vier Schritten zur Überführung.',
    processLead: 'Kein Portal, kein Konto, keine Wartezeit in einer Hotline. Eine Anfrage genügt.',

    requestEyebrow: 'Anfrage',
    requestTitle: 'Individuelle Festpreise.',
    requestLead:
      'Jede Überführung wird individuell kalkuliert. Nach Prüfung Ihrer Angaben erhalten Sie ein Festpreisangebot — erst danach entscheiden Sie.',
    priceFactorsTitle: 'In die Kalkulation fließt ein',
    priceFactors: [
      'Anreise zum Fahrzeug',
      'Entfernung Abholort → Ziel',
      'Rückreise',
      'Kraftstoff und Maut',
      'Fahrzeugart',
      'Wunschtermin',
    ],
    requestNote:
      'Sie erhalten vor Auftragserteilung einen Komplettpreis. Kurzfristige Termine gerne telefonisch oder per WhatsApp — das ist der schnellste Weg.',

    businessEyebrow: 'Für Unternehmen',
    businessTitle: 'Fahrzeugüberführungen für Autohäuser & Unternehmen.',
    businessLead:
      'Autohäuser, Gebrauchtwagenhändler, Leasinggesellschaften, Fuhrparks und Werkstätten: ein Ansprechpartner für Einzelaufträge wie für wiederkehrende Überführungen.',
    businessCta: 'Geschäftskunden-Anfrage',
    businessBenefitsTitle: 'Was Sie erwarten können',

    reasonsEyebrow: 'Der Unterschied',
    reasonsTitle: 'Warum AZD Transport?',

    faqEyebrow: 'Häufige Fragen',
    faqTitle: 'Antworten vor der Anfrage.',
    faqLead: 'Etwas nicht dabei? Rufen Sie an — die Frage ist in zwei Minuten geklärt.',

    finalTitle: 'Ihr Fahrzeug soll von A nach B? Wir kümmern uns um die Überführung.',
    finalLead: 'Unverbindlich anfragen — Sie erhalten ein individuelles Festpreisangebot.',
    finalCta: 'Jetzt Überführung anfragen',
    finalCall: 'Oder direkt anrufen:',
  },

  services: [
    {
      id: 'premium',
      title: 'Premium- & Luxusfahrzeuge',
      text: 'Sportwagen, hochwertige Limousinen und SUV. Übernahme, Fahrweise und Übergabe sind dem Fahrzeug angemessen — keine Routinefahrt.',
    },
    {
      id: 'kauf',
      title: 'Fahrzeugkauf & -verkauf',
      text: 'Sie haben weit entfernt gekauft oder verkauft. Wir übernehmen das Fahrzeug beim Händler oder Privatverkäufer und bringen es an die Wunschadresse.',
    },
    {
      id: 'leasing',
      title: 'Leasingrückgaben',
      text: 'Rückführung zum Händler oder Rückgabezentrum, mit Terminabstimmung und dokumentiertem Zustand bei Übernahme.',
    },
    {
      id: 'autohaus',
      title: 'Autohaus & Gewerbekunden',
      text: 'Einzelaufträge ebenso wie wiederkehrende Überführungen. Ein Ansprechpartner, klare Absprachen, Rechnung.',
    },
    {
      id: 'flotte',
      title: 'Firmen- & Flottenfahrzeuge',
      text: 'Umsetzungen zwischen Standorten, Werkstattfahrten, Fahrzeugwechsel im Fuhrpark — planbar terminiert.',
    },
    {
      id: 'holbring',
      title: 'Hol- und Bringservice',
      text: 'Fahrzeug zur Werkstatt, zur Aufbereitung, zum TÜV und zurück. Sie bleiben, wo Sie sind.',
    },
  ],

  steps: [
    {
      number: '01',
      title: 'Anfrage senden',
      text: 'Abholort, Zielort, Fahrzeug und Wunschtermin angeben — online oder per WhatsApp.',
    },
    {
      number: '02',
      title: 'Angebot erhalten',
      text: 'Sie erhalten ein individuelles Festpreisangebot. Erst danach entscheiden Sie.',
    },
    {
      number: '03',
      title: 'Fahrzeugübernahme',
      text: 'Übernahme am vereinbarten Ort. Auf Wunsch mit dokumentiertem Zustand, Kilometerstand und Übergabefotos.',
    },
    {
      number: '04',
      title: 'Übergabe',
      text: 'Das Fahrzeug wird auf eigener Achse zum Ziel gefahren und persönlich übergeben.',
    },
  ],

  documentation: [
    'Fahrzeugzustand bei Übernahme dokumentieren',
    'Kilometerstand festhalten',
    'Tank- bzw. Ladezustand festhalten',
    'Übergabefotos',
    'Direkte Kommunikation während der Fahrt',
    'Terminabstimmung mit Verkäufer oder Autohaus',
    'Übergabe an die Wunschadresse',
  ],

  businessBenefits: [
    'Regelmäßige Überführungen und Einzelaufträge',
    'Ein Ansprechpartner statt wechselnder Fahrer',
    'Rechnung für Buchhaltung und Fuhrparkverwaltung',
    'Flexible Terminierung nach Ihrem Ablauf',
    'Übergabedokumentation auf Wunsch',
  ],

  reasons: [
    {
      title: 'Persönlicher Ansprechpartner',
      text: 'Sie sprechen mit der Person, die Ihr Fahrzeug auch fährt. Keine Hotline, keine Weiterleitung.',
    },
    {
      title: 'Direkte Kommunikation',
      text: 'Rückfragen unterwegs gehen direkt an Sie — ohne Umweg über eine Disposition.',
    },
    {
      title: 'Klare Preisabsprache',
      text: 'Der Festpreis steht vor der Fahrt. Was besprochen ist, wird abgerechnet.',
    },
    {
      title: 'Flexible Terminabstimmung',
      text: 'Übernahme und Übergabe richten sich nach Ihrem Termin, nicht nach einem Tourenplan.',
    },
    {
      title: 'Professioneller Umgang',
      text: 'Angemessene Fahrweise, sorgsame Behandlung, keine unnötigen Zwischenstopps.',
    },
    {
      title: 'Zustandsdokumentation',
      text: 'Auf Wunsch halten wir den Zustand bei Übernahme und Übergabe fest — für beide Seiten.',
    },
  ],

  faq: [
    {
      question: 'Wie funktioniert eine Fahrzeugüberführung auf eigener Achse?',
      answer:
        'Das Fahrzeug wird am Abholort übernommen und selbst zum Zielort gefahren — nicht auf einen Anhänger oder Autotransporter geladen. Das ist schneller verfügbar, meist günstiger und ohne Auf- und Abladen.',
    },
    {
      question: 'Welche Fahrzeuge können überführt werden?',
      answer:
        'PKW, SUV, Sportwagen, Luxusfahrzeuge und Transporter bis 3,5 t. Das Fahrzeug muss fahrbereit und verkehrssicher sein.',
    },
    {
      question: 'Wie wird der Preis berechnet?',
      answer:
        'Jede Überführung wird einzeln kalkuliert. In den Preis fließen die Anreise zum Fahrzeug, die Strecke zum Ziel, die Rückreise, Kraftstoff, Maut sowie der gewünschte Termin ein. Sie erhalten einen Komplettpreis, bevor Sie beauftragen.',
    },
    {
      question: 'Sind Kraftstoffkosten im Angebot enthalten?',
      answer:
        'Ja, sofern nicht ausdrücklich anders vereinbart. Was im Festpreis enthalten ist, steht im Angebot.',
    },
    {
      question: 'Wie schnell ist eine Überführung möglich?',
      answer:
        'Das hängt von Strecke, Termin und Verfügbarkeit ab. Fragen Sie kurzfristige Termine einfach an — häufig lässt sich etwas einrichten.',
    },
    {
      question: 'Muss das Fahrzeug zugelassen sein?',
      answer:
        'Für die Fahrt auf öffentlichen Straßen sind ein gültiges Kennzeichen und ein bestehender Versicherungsschutz erforderlich — die reguläre Zulassung, ein Kurzzeitkennzeichen oder ein rotes Kennzeichen. Liegt das nicht vor, klären wir vorab, welche Lösung möglich ist.',
    },
    {
      question: 'Kann ein Leasingfahrzeug zurückgebracht werden?',
      answer:
        'Ja. Rückführungen zum Händler oder Rückgabezentrum gehören zum regelmäßigen Geschäft, inklusive Terminabstimmung.',
    },
    {
      question: 'Sind auch kurzfristige Überführungen möglich?',
      answer:
        'Oft ja. Rufen Sie an oder schreiben Sie per WhatsApp — bei kurzfristigen Terminen ist das der schnellste Weg.',
    },
    {
      question: 'Erhalte ich eine Rechnung?',
      answer: 'Ja, für Privat- und Geschäftskunden.',
    },
    {
      question: 'Wie wird der Fahrzeugzustand dokumentiert?',
      answer:
        'Auf Wunsch werden bei Übernahme und Übergabe Fotos gemacht sowie Kilometerstand und Tank- bzw. Ladezustand festgehalten. Sie erhalten die Dokumentation zur Fahrt.',
    },
  ],

  request: {
    eyebrow: 'Anfrage',
    title: 'Unverbindliches Angebot anfordern',
    titleBusiness: 'Geschäftskunden-Anfrage',
    lead: 'Nach Prüfung Ihrer Angaben erhalten Sie ein individuelles Festpreisangebot. Pflicht sind nur Abholort, Zielort, Ihr Name und eine Kontaktmöglichkeit — alles Weitere klären wir miteinander.',
    businessNotePrefix: 'Gewerbliche Anfrage — ',

    sectionRoute: 'Strecke',
    sectionVehicle: 'Fahrzeug',
    sectionDate: 'Termin',
    sectionContact: 'Kontakt',

    pickup: 'Abholort',
    dropoff: 'Zielort',
    locationHint: 'PLZ oder Ort genügt',
    pickupPlaceholder: '60311 Frankfurt am Main',
    dropoffPlaceholder: '80331 München',

    make: 'Hersteller',
    makePlaceholder: 'z. B. Porsche',
    model: 'Modell',
    modelPlaceholder: 'z. B. 911 Carrera',
    vehicleType: 'Fahrzeugtyp',
    vehicleState: 'Zulassung',
    vehicleStateHint: 'Für die Fahrt wird ein gültiges Kennzeichen benötigt',
    vehicleValue: 'Fahrzeugwert',
    vehicleValueHint: 'Hilft bei der Einschätzung der Absicherung',
    vehicleValuePlaceholder: 'z. B. 120.000 €',

    preferredDate: 'Wunschtermin',
    dateFlexible: 'Termin ist flexibel',
    dateFlexibleHint: 'Ermöglicht oft ein günstigeres Angebot',

    notes: 'Bemerkungen',
    notesHint: 'Besonderheiten, Ansprechpartner vor Ort, Übergabezeiten',
    notesPlaceholder: 'Abholung beim Autohaus, Ansprechpartner Herr …',

    name: 'Name',
    phone: 'Telefon',
    contactHint: 'Telefon oder E-Mail genügt',
    email: 'E-Mail',

    privacyBefore: 'Ich habe die ',
    privacyLink: 'Datenschutzhinweise',
    privacyAfter:
      ' gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden.',

    optional: 'optional',
    submit: 'Unverbindliches Angebot anfordern',
    submitting: 'Wird übermittelt …',
    whatsappSubmit: 'Anfrage per WhatsApp senden',
    bothWays: 'Beide Wege enthalten dieselben Angaben — Sie müssen nichts abtippen.',
    ratherCall: 'Lieber telefonisch?',

    whatsappOpenedTitle: 'WhatsApp wurde geöffnet.',
    whatsappOpenedText:
      'Ihre Angaben stehen dort schon in der Nachricht — bitte einmal auf Senden tippen, dann ist die Anfrage bei uns.',
    needRoute: 'Bitte geben Sie Abhol- und Zielort an — dann steht alles in der Nachricht.',

    doneTitle: 'Vielen Dank.',
    doneText:
      'Ihre Anfrage wurde übermittelt. Wir prüfen die Angaben und melden uns kurzfristig mit einem individuellen Angebot.',
    doneWhatsAppLead:
      'Soll es schneller gehen? Schicken Sie dieselbe Anfrage zusätzlich per WhatsApp — fertig ausgefüllt, ein Tippen.',
    doneWhatsAppCta: 'Zusätzlich per WhatsApp senden',
    backHome: 'Zurück zur Startseite',
  },

  errors: {
    required: 'Bitte ausfüllen.',
    tooLong: 'Bitte kürzer fassen (höchstens {max} Zeichen).',
    invalidEmail: 'Bitte eine gültige E-Mail-Adresse angeben.',
    invalidDate: 'Bitte ein gültiges Datum wählen.',
    needContact: 'Bitte Telefon oder E-Mail angeben, damit wir antworten können.',
    needPrivacy: 'Bitte bestätigen Sie die Datenschutzhinweise.',
    checkEntries: 'Bitte prüfen Sie Ihre Angaben.',
    notDelivered:
      'Die Anfrage konnte gerade nicht übermittelt werden. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
    unavailable:
      'Der Nachrichtenversand ist derzeit nicht verfügbar. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
    unexpected:
      'Es ist ein Fehler aufgetreten. Bitte rufen Sie uns an oder schreiben Sie per WhatsApp.',
  },

  notification: {
    heading: 'Anfrage Fahrzeugüberführung',
    subject: 'Überführungsanfrage',
    pickup: 'Abholort',
    dropoff: 'Zielort',
    vehicle: 'Fahrzeug',
    vehicleType: 'Fahrzeugtyp',
    vehicleState: 'Zulassung',
    vehicleValue: 'Fahrzeugwert',
    preferredDate: 'Wunschtermin',
    dateFlexible: 'Termin flexibel: ja',
    dateFlexibleShort: 'flexibel',
    notes: 'Bemerkungen',
    name: 'Name',
    phone: 'Telefon',
    email: 'E-Mail',
  },

  vehicleTypes: {
    PKW: 'PKW',
    SUV: 'SUV',
    Sportwagen: 'Sportwagen',
    Luxusfahrzeug: 'Luxusfahrzeug',
    'Transporter bis 3,5 t': 'Transporter bis 3,5 t',
  },

  vehicleStates: {
    zugelassen: 'zugelassen',
    'Kurzzeitkennzeichen vorhanden': 'Kurzzeitkennzeichen vorhanden',
    'rote Kennzeichen vorhanden': 'rote Kennzeichen vorhanden',
    'sonstiges / Rückfrage erforderlich': 'sonstiges / Rückfrage erforderlich',
  },

  footer: {
    tagline: 'Premium Fahrzeugüberführungen auf eigener Achse.',
    claim: 'Fahrzeugüberführungen auf eigener Achse — kein Transport auf Anhänger.',
  },

  legal: legalDe,

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht (mehr). Wollten Sie eine Überführung anfragen?',
    cta: 'Überführung anfragen',
    home: 'Zur Startseite',
  },

  error: {
    title: 'Da ist etwas schiefgelaufen',
    text: 'Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut — oder rufen Sie uns einfach an, das geht ohnehin schneller.',
    reference: 'Referenz:',
    retry: 'Erneut versuchen',
    home: 'Zur Startseite',
  },
};
