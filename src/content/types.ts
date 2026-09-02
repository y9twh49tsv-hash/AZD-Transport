/**
 * Die Form aller Inhalte — einmal beschrieben, für jede Sprache erfüllt.
 *
 * Der Zweck ist nicht Ordnung, sondern eine bestimmte Sorte Fehler zu
 * verhindern. Das frühere Wörterbuch dieses Projekts gab bei einem unbekannten
 * Schlüssel den Schlüssel selbst zurück; auf der Startseite stand daraufhin in
 * der Produktion „Deine Pakete sicher von home.countryFrom nach
 * home.countryTo". Typprüfung, Build und alle Tests waren grün.
 *
 * Hier kann das nicht passieren: `en.ts` ist als `Content` deklariert. Fehlt
 * ein Feld oder heißt es anders, scheitert der Compiler — vor dem Build, nicht
 * vor der Kundschaft.
 */

export type Locale = 'de' | 'en';

export type Service = { id: string; title: string; text: string };
export type Step = { number: string; title: string; text: string };
export type Reason = { title: string; text: string };
export type FaqItem = { question: string; answer: string };

/** Ein Abschnitt einer Rechtsseite: Überschrift und Absätze. */
export type LegalSectionContent = {
  /**
   * Kennung für Abschnitte, deren Inhalt nicht aus Text besteht, sondern aus
   * Werten der Konfiguration — die Anbieterangaben im Impressum etwa. Die
   * Überschrift wird übersetzt, der Inhalt kommt aus `siteConfig`.
   *
   * Bewusst eine Kennung und nicht die Reihenfolge: nach der Position zu gehen
   * hieße, dass ein eingeschobener Abschnitt in einer Sprache still die
   * falschen Werte druckt.
   */
  id?: string;
  title: string;
  /** Absätze. Einträge mit `**fett**` werden hervorgehoben dargestellt. */
  paragraphs?: string[];
  /** Aufzählung unter den Absätzen. */
  list?: string[];
  /** Ein noch offener Punkt, sichtbar als Hinweis. */
  todo?: string;
};

export type LegalPageContent = {
  title: string;
  intro: string;
  metaDescription: string;
  sections: LegalSectionContent[];
};

export type Content = {
  /** Sprachname in der eigenen Sprache — für den Umschalter. */
  localeName: string;
  /** Sprachname der jeweils anderen Sprache, wie sie sich selbst nennt. */
  switchTo: string;

  meta: {
    title: string;
    description: string;
    ogLocale: string;
  };

  /**
   * Der kurze Aufhänger hinter jedem WhatsApp-Knopf außerhalb des Formulars.
   *
   * Keine Lückenvorlage zum Selbstausfüllen — wer WhatsApp wählt, will tippen
   * wie in einem Chat. Die vollständige Nachricht baut das Formular.
   */
  whatsappOpener: string;

  /**
   * Angaben über den Betrieb, die eine Sprache haben.
   *
   * Anschrift, Rufnummer und Firmierung stehen weiterhin in `siteConfig` — die
   * werden nicht übersetzt. Diese drei sind Sätze und gehören deshalb hierher.
   */
  company: {
    shortDescription: string;
    serviceArea: string;
    /** Bewusst neutral, solange keine Police vorliegt. */
    insuranceText: string;
  };

  /** Nur für schema.org. Steht nicht sichtbar auf der Seite. */
  seo: {
    countryName: string;
    serviceName: string;
    serviceType: string;
    serviceDescription: string;
    offerCatalogName: string;
  };

  nav: {
    services: string;
    premium: string;
    business: string;
    process: string;
    faq: string;
    contact: string;
    request: string;
    legal: string;
    navigation: string;
    mainNavigation: string;
    mobileNavigation: string;
    openMenu: string;
    closeMenu: string;
    call: string;
    skipToContent: string;
    /** Beschriftung des Sprachschalters — für Screenreader. */
    language: string;
  };

  home: {
    eyebrow: string;
    headlineTop: string;
    headlineAccent: string;
    lead: string;
    points: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    ctaWhatsApp: string;
    factsArea: string;
    factsVehicles: string;
    factsVehiclesValue: string;
    factsContact: string;
    /** Beschriftung der Vertrauensleiste — nur für Screenreader. */
    trustLabel: string;
    trust: string[];

    servicesEyebrow: string;
    servicesTitle: string;
    servicesLead: string;

    premiumEyebrow: string;
    premiumTitle: string;
    premiumParagraphs: string[];
    insuranceTitle: string;
    documentationTitle: string;

    processEyebrow: string;
    processTitle: string;
    processLead: string;

    requestEyebrow: string;
    requestTitle: string;
    requestLead: string;
    priceFactorsTitle: string;
    priceFactors: string[];
    requestNote: string;

    businessEyebrow: string;
    businessTitle: string;
    businessLead: string;
    businessCta: string;
    businessBenefitsTitle: string;

    reasonsEyebrow: string;
    reasonsTitle: string;

    faqEyebrow: string;
    faqTitle: string;
    faqLead: string;

    finalTitle: string;
    finalLead: string;
    finalCta: string;
    finalCall: string;
  };

  services: Service[];
  steps: Step[];
  documentation: string[];
  businessBenefits: string[];
  reasons: Reason[];
  faq: FaqItem[];

  request: {
    eyebrow: string;
    title: string;
    titleBusiness: string;
    lead: string;
    businessNotePrefix: string;

    sectionRoute: string;
    sectionVehicle: string;
    sectionDate: string;
    sectionContact: string;

    pickup: string;
    dropoff: string;
    locationHint: string;
    pickupPlaceholder: string;
    dropoffPlaceholder: string;

    make: string;
    makePlaceholder: string;
    model: string;
    modelPlaceholder: string;
    vehicleType: string;
    vehicleState: string;
    vehicleStateHint: string;
    vehicleValue: string;
    vehicleValueHint: string;
    vehicleValuePlaceholder: string;

    preferredDate: string;
    dateFlexible: string;
    dateFlexibleHint: string;

    notes: string;
    notesHint: string;
    notesPlaceholder: string;

    name: string;
    phone: string;
    contactHint: string;
    email: string;

    privacyBefore: string;
    privacyLink: string;
    privacyAfter: string;

    optional: string;
    submit: string;
    submitting: string;
    whatsappSubmit: string;
    bothWays: string;
    ratherCall: string;

    whatsappOpenedTitle: string;
    whatsappOpenedText: string;
    needRoute: string;

    doneTitle: string;
    doneText: string;
    doneWhatsAppLead: string;
    doneWhatsAppCta: string;
    backHome: string;
  };

  /** Fehlermeldungen — im Browser wie auf dem Server dieselben. */
  errors: {
    required: string;
    tooLong: string;
    invalidEmail: string;
    invalidDate: string;
    needContact: string;
    needPrivacy: string;
    checkEntries: string;
    notDelivered: string;
    unavailable: string;
    unexpected: string;
  };

  /** Die einzeilige Zusammenfassung und die E-Mail an den Betrieb. */
  notification: {
    heading: string;
    subject: string;
    pickup: string;
    dropoff: string;
    vehicle: string;
    vehicleType: string;
    vehicleState: string;
    vehicleValue: string;
    preferredDate: string;
    dateFlexible: string;
    /** Kurzform für die einzeilige Zusammenfassung, in Klammern. */
    dateFlexibleShort: string;
    notes: string;
    name: string;
    phone: string;
    email: string;
  };

  vehicleTypes: Record<string, string>;
  vehicleStates: Record<string, string>;

  footer: {
    tagline: string;
    claim: string;
  };

  legal: {
    eyebrow: string;
    incompleteTitle: string;
    incompleteText: string;
    missingPrefix: string;
    /** Nur auf den englischen Seiten sichtbar. */
    translationNotice: string | null;
    imprint: LegalPageContent;
    privacy: LegalPageContent;
    cookies: LegalPageContent;
    terms: LegalPageContent;
    withdrawal: LegalPageContent;
  };

  notFound: { title: string; text: string; cta: string; home: string };
  error: {
    title: string;
    text: string;
    reference: string;
    retry: string;
    home: string;
  };
};
