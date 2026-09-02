import type { Content } from './types';
import { legalEn } from './legal/en';

/**
 * The English content.
 *
 * Declared as `Content`, so it has to satisfy exactly the same shape as the
 * German original. A forgotten field is a compiler error rather than a gap
 * that only shows up on the finished page.
 *
 * Who this is for: buyers and dealers who are in Germany but do not read
 * German — expats around Frankfurt, exporters collecting a car here,
 * international dealerships. Not a machine translation of the German pitch but
 * the same claims, written to read naturally.
 */
export const en: Content = {
  localeName: 'English',
  switchTo: 'Deutsch',

  meta: {
    title: 'Vehicle transfer Frankfurt & Germany-wide | AZD Transport',
    description:
      'Professional vehicle transfers driven under their own power. Have premium, leased and company vehicles moved anywhere in Germany. Request a no-obligation quote.',
    ogLocale: 'en_GB',
  },

  whatsappOpener: 'Hello, I would like to ask about a vehicle transfer.',

  company: {
    shortDescription: 'Premium vehicle transfers driven under their own power.',
    serviceArea: 'Anywhere in Germany — on request across Europe',
    insuranceText:
      'The cover in place is assessed individually for each job and each vehicle. You receive the details in writing before you place the order.',
  },

  seo: {
    countryName: 'Germany',
    serviceName: 'Vehicle transfer under the vehicle’s own power',
    serviceType: 'Vehicle transfer',
    serviceDescription:
      'Professional transfer of cars, SUVs, sports cars, luxury vehicles and vans up to 3.5 t driven under their own power — not on a trailer or car transporter.',
    offerCatalogName: 'Services',
  },

  nav: {
    services: 'Services',
    premium: 'Premium service',
    business: 'For businesses',
    process: 'How it works',
    faq: 'FAQ',
    contact: 'Contact',
    request: 'Request a transfer',
    legal: 'Legal',
    navigation: 'Navigation',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Main navigation, mobile',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    call: 'Call',
    skipToContent: 'Skip to content',
    language: 'Language',
  },

  home: {
    eyebrow: 'Vehicle transfers under their own power',
    headlineTop: 'Premium vehicle transfers.',
    headlineAccent: 'Anywhere in Germany.',
    lead: 'Professional vehicle transfers driven under their own power — personal, dependable and transparent.',
    points: [
      'Driven, not trailered',
      'Germany-wide',
      'Flexible dates',
      'Condition report',
      'Invoice for private and business customers',
    ],
    ctaPrimary: 'Request a transfer',
    ctaSecondary: 'Ask for a price',
    ctaWhatsApp: 'Straight to WhatsApp',
    factsArea: 'Service area',
    factsVehicles: 'Vehicles',
    factsVehiclesValue: 'Cars, SUVs, sports cars, luxury vehicles, vans up to 3.5 t',
    factsContact: 'Direct contact',
    trustLabel: 'At a glance',
    trust: [
      'Carried out in person',
      'Transparent price agreement',
      'Flexible scheduling',
      'Documented handover',
    ],

    servicesEyebrow: 'Services',
    servicesTitle: 'Transfers for every occasion.',
    servicesLead:
      'A single vehicle or a recurring job — the process is the same either way: a clear agreement, a fixed price, a handover in person.',

    premiumEyebrow: 'Premium service',
    premiumTitle: 'Exceptional vehicles deserve exceptional care.',
    premiumParagraphs: [
      'With a high-value vehicle it is not simply about getting from A to B. The handover, the communication, the documentation and a responsible way of treating the car are what matter.',
      'The vehicle is driven under its own power — moved appropriately, without unnecessary stops and without being loaded on and off a trailer.',
    ],
    insuranceTitle: 'Insurance & cover',
    documentationTitle: 'Part of the job on request',

    processEyebrow: 'How it works',
    processTitle: 'Four steps to a completed transfer.',
    processLead: 'No portal, no account, no waiting in a phone queue. One enquiry is enough.',

    requestEyebrow: 'Enquiry',
    requestTitle: 'Individual fixed prices.',
    requestLead:
      'Every transfer is quoted individually. Once we have reviewed your details you receive a fixed-price quote — and only then do you decide.',
    priceFactorsTitle: 'What goes into the calculation',
    priceFactors: [
      'Getting to the vehicle',
      'Distance from pick-up to destination',
      'The return journey',
      'Fuel and tolls',
      'Type of vehicle',
      'Your preferred date',
    ],
    requestNote:
      'You receive an all-in price before you place the order. For short-notice dates, phone or WhatsApp is the fastest route.',

    businessEyebrow: 'For businesses',
    businessTitle: 'Vehicle transfers for dealerships & companies.',
    businessLead:
      'Dealerships, used-car traders, leasing companies, fleet operators and workshops: one point of contact for single jobs and recurring transfers alike.',
    businessCta: 'Business enquiry',
    businessBenefitsTitle: 'What you can expect',

    reasonsEyebrow: 'The difference',
    reasonsTitle: 'Why AZD Transport?',

    faqEyebrow: 'Frequent questions',
    faqTitle: 'Answers before you ask.',
    faqLead: 'Something missing? Give us a call — most questions take two minutes.',

    finalTitle: 'Your vehicle needs to get from A to B? We will take care of the transfer.',
    finalLead: 'Ask without obligation — you receive an individual fixed-price quote.',
    finalCta: 'Request a transfer now',
    finalCall: 'Or simply call:',
  },

  services: [
    {
      id: 'premium',
      title: 'Premium & luxury vehicles',
      text: 'Sports cars, high-end saloons and SUVs. Collection, driving style and handover are appropriate to the car — not a routine trip.',
    },
    {
      id: 'kauf',
      title: 'Buying & selling a vehicle',
      text: 'You bought or sold far from home. We collect the vehicle from the dealer or private seller and bring it to the address you name.',
    },
    {
      id: 'leasing',
      title: 'Lease returns',
      text: 'Return to the dealer or the return centre, with the appointment arranged and the condition documented at collection.',
    },
    {
      id: 'autohaus',
      title: 'Dealerships & trade customers',
      text: 'Single jobs as well as recurring transfers. One point of contact, clear agreements, an invoice.',
    },
    {
      id: 'flotte',
      title: 'Company & fleet vehicles',
      text: 'Moves between sites, workshop runs, vehicle changes within the fleet — scheduled so you can plan around them.',
    },
    {
      id: 'holbring',
      title: 'Collection & delivery service',
      text: 'Vehicle to the workshop, to detailing, to the inspection and back. You stay where you are.',
    },
  ],

  steps: [
    {
      number: '01',
      title: 'Send your enquiry',
      text: 'Give us the pick-up location, the destination, the vehicle and your preferred date — online or by WhatsApp.',
    },
    {
      number: '02',
      title: 'Receive a quote',
      text: 'You get an individual fixed-price quote. Only then do you decide.',
    },
    {
      number: '03',
      title: 'Vehicle collection',
      text: 'Collection at the agreed location. On request with the condition, mileage and handover photos documented.',
    },
    {
      number: '04',
      title: 'Handover',
      text: 'The vehicle is driven to the destination under its own power and handed over in person.',
    },
  ],

  documentation: [
    'Document the vehicle’s condition at collection',
    'Record the mileage',
    'Record the fuel or charge level',
    'Handover photos',
    'Direct contact during the journey',
    'Coordinating the appointment with the seller or dealership',
    'Handover at the address you name',
  ],

  businessBenefits: [
    'Recurring transfers and single jobs',
    'One contact person instead of changing drivers',
    'An invoice for accounting and fleet administration',
    'Flexible scheduling around your operation',
    'Handover documentation on request',
  ],

  reasons: [
    {
      title: 'A personal contact',
      text: 'You speak to the person who also drives your vehicle. No hotline, no transfers between departments.',
    },
    {
      title: 'Direct communication',
      text: 'Questions along the way come straight to you — without a dispatcher in between.',
    },
    {
      title: 'A clear price agreement',
      text: 'The fixed price is settled before the journey. What was agreed is what gets invoiced.',
    },
    {
      title: 'Flexible scheduling',
      text: 'Collection and handover follow your schedule, not a route plan.',
    },
    {
      title: 'Professional handling',
      text: 'An appropriate driving style, careful treatment, no unnecessary stops.',
    },
    {
      title: 'Condition report',
      text: 'On request we record the condition at collection and at handover — for both sides.',
    },
  ],

  faq: [
    {
      question: 'How does a transfer under the vehicle’s own power work?',
      answer:
        'The vehicle is collected at the pick-up location and driven to the destination — not loaded onto a trailer or car transporter. It is available at shorter notice, usually cheaper, and there is no loading and unloading.',
    },
    {
      question: 'Which vehicles can be transferred?',
      answer:
        'Cars, SUVs, sports cars, luxury vehicles and vans up to 3.5 t. The vehicle must be roadworthy and safe to drive.',
    },
    {
      question: 'How is the price calculated?',
      answer:
        'Every transfer is quoted individually. The price takes into account getting to the vehicle, the distance to the destination, the return journey, fuel, tolls and the date you want. You receive an all-in price before you place the order.',
    },
    {
      question: 'Is fuel included in the quote?',
      answer:
        'Yes, unless expressly agreed otherwise. What the fixed price covers is stated in the quote.',
    },
    {
      question: 'How quickly can a transfer happen?',
      answer:
        'That depends on the route, the date and availability. Simply ask about short-notice dates — something can often be arranged.',
    },
    {
      question: 'Does the vehicle have to be registered?',
      answer:
        'To drive on public roads a valid registration plate and existing insurance cover are required — regular registration, a short-term plate or a red dealer plate. If none of these is in place, we clarify beforehand what is possible.',
    },
    {
      question: 'Can a leased vehicle be returned?',
      answer:
        'Yes. Returns to the dealer or the return centre are regular business, including arranging the appointment.',
    },
    {
      question: 'Are short-notice transfers possible?',
      answer:
        'Often, yes. Call or write on WhatsApp — for short-notice dates that is the fastest route.',
    },
    {
      question: 'Will I receive an invoice?',
      answer: 'Yes, for private and business customers alike.',
    },
    {
      question: 'How is the vehicle’s condition documented?',
      answer:
        'On request, photos are taken at collection and at handover and the mileage and fuel or charge level are recorded. You receive the documentation for the journey.',
    },
  ],

  request: {
    eyebrow: 'Enquiry',
    title: 'Request a no-obligation quote',
    titleBusiness: 'Business enquiry',
    lead: 'Once we have reviewed your details you receive an individual fixed-price quote. Only the pick-up location, the destination, your name and one way of reaching you are required — we can sort out the rest together.',
    businessNotePrefix: 'Business enquiry — ',

    sectionRoute: 'Route',
    sectionVehicle: 'Vehicle',
    sectionDate: 'Date',
    sectionContact: 'Contact',

    pickup: 'Pick-up location',
    dropoff: 'Destination',
    locationHint: 'A postcode or town is enough',
    pickupPlaceholder: '60311 Frankfurt am Main',
    dropoffPlaceholder: '80331 Munich',

    make: 'Make',
    makePlaceholder: 'e.g. Porsche',
    model: 'Model',
    modelPlaceholder: 'e.g. 911 Carrera',
    vehicleType: 'Vehicle type',
    vehicleState: 'Registration',
    vehicleStateHint: 'A valid registration plate is required for the journey',
    vehicleValue: 'Vehicle value',
    vehicleValueHint: 'Helps us assess the cover needed',
    vehicleValuePlaceholder: 'e.g. €120,000',

    preferredDate: 'Preferred date',
    dateFlexible: 'The date is flexible',
    dateFlexibleHint: 'Often makes a better price possible',

    notes: 'Remarks',
    notesHint: 'Anything unusual, a contact on site, handover times',
    notesPlaceholder: 'Collection at the dealership, ask for Mr …',

    name: 'Name',
    phone: 'Phone',
    contactHint: 'Either a phone number or an email is enough',
    email: 'Email',

    privacyBefore: 'I have read the ',
    privacyLink: 'privacy notice',
    privacyAfter: ' and agree that my details may be used to handle this enquiry.',

    optional: 'optional',
    submit: 'Request a no-obligation quote',
    submitting: 'Sending …',
    whatsappSubmit: 'Send the enquiry via WhatsApp',
    bothWays: 'Both routes carry the same details — you never have to retype anything.',
    ratherCall: 'Rather talk?',

    whatsappOpenedTitle: 'WhatsApp has opened.',
    whatsappOpenedText:
      'Your details are already in the message — just tap Send once and the enquiry is with us.',
    needRoute: 'Please give a pick-up location and a destination — then the message is complete.',

    doneTitle: 'Thank you.',
    doneText:
      'Your enquiry has been sent. We will review the details and come back to you shortly with an individual quote.',
    doneWhatsAppLead:
      'Want it faster? Send the same enquiry via WhatsApp as well — already filled in, one tap.',
    doneWhatsAppCta: 'Also send via WhatsApp',
    backHome: 'Back to the home page',
  },

  errors: {
    required: 'Please fill this in.',
    tooLong: 'Please keep it shorter (no more than {max} characters).',
    invalidEmail: 'Please enter a valid email address.',
    invalidDate: 'Please choose a valid date.',
    needContact: 'Please give a phone number or an email so we can reply.',
    needPrivacy: 'Please confirm the privacy notice.',
    checkEntries: 'Please check your entries.',
    notDelivered: 'The enquiry could not be sent just now. Please call us or write on WhatsApp.',
    unavailable: 'Message delivery is currently unavailable. Please call us or write on WhatsApp.',
    unexpected: 'Something went wrong. Please call us or write on WhatsApp.',
  },

  notification: {
    heading: 'Vehicle transfer enquiry',
    subject: 'Transfer enquiry',
    pickup: 'Pick-up',
    dropoff: 'Destination',
    vehicle: 'Vehicle',
    vehicleType: 'Vehicle type',
    vehicleState: 'Registration',
    vehicleValue: 'Vehicle value',
    preferredDate: 'Preferred date',
    dateFlexible: 'Date flexible: yes',
    dateFlexibleShort: 'flexible',
    notes: 'Remarks',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
  },

  vehicleTypes: {
    PKW: 'Car',
    SUV: 'SUV',
    Sportwagen: 'Sports car',
    Luxusfahrzeug: 'Luxury vehicle',
    'Transporter bis 3,5 t': 'Van up to 3.5 t',
  },

  vehicleStates: {
    zugelassen: 'registered',
    'Kurzzeitkennzeichen vorhanden': 'short-term plate available',
    'rote Kennzeichen vorhanden': 'red dealer plate available',
    'sonstiges / Rückfrage erforderlich': 'other / needs clarifying',
  },

  footer: {
    tagline: 'Premium vehicle transfers driven under their own power.',
    claim: 'Vehicle transfers under their own power — never on a trailer.',
  },

  legal: legalEn,

  notFound: {
    title: 'Page not found',
    text: 'This page does not exist (any more). Were you looking to request a transfer?',
    cta: 'Request a transfer',
    home: 'Back to the home page',
  },

  error: {
    title: 'Something went wrong',
    text: 'The page could not be loaded. Please try again — or simply give us a call, that is faster anyway.',
    reference: 'Reference:',
    retry: 'Try again',
    home: 'Back to the home page',
  },
};
