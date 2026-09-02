import type { Content } from '../types';

/**
 * The legal texts in English.
 *
 * ⚠ A convenience translation. German law governs the contract, the German
 * wording is the binding one, and every page says so. Translating a set of
 * terms does not translate the jurisdiction they were written for — pretending
 * otherwise would be the one place on this site where a customer could be
 * misled into thinking they agreed to something else.
 */
export const legalEn: Content['legal'] = {
  eyebrow: 'Legal',
  incompleteTitle: 'This page is not complete yet',
  incompleteText:
    'The mandatory details below are still missing and are marked as TODO in the text. They are entered centrally in src/config/site.ts; this notice then disappears on its own.',
  missingPrefix: 'Detail still missing: ',
  translationNotice:
    'This is a translation for easier understanding. Only the German version is legally binding.',

  imprint: {
    title: 'Legal notice',
    intro: 'Information pursuant to § 5 DDG (German Digital Services Act).',
    metaDescription: 'Provider identification pursuant to § 5 DDG.',
    sections: [
      { id: 'provider', title: 'Provider' },
      { id: 'contact', title: 'Contact' },
      { id: 'vat', title: 'VAT identification number' },
      {
        id: 'responsible',
        title: 'Responsible for content pursuant to § 18 (2) MStV',
      },
      {
        title: 'Consumer dispute resolution',
        paragraphs: [
          'We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.',
        ],
      },
      {
        title: 'Liability for content',
        paragraphs: [
          'As a service provider we are responsible for our own content on these pages under general law. We are not obliged, however, to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity. Obligations to remove or block the use of information under general law remain unaffected. Liability in this respect is only possible from the point in time at which we become aware of a specific infringement. If we become aware of such infringements we will remove the content immediately.',
        ],
      },
      {
        title: 'Liability for links',
        paragraphs: [
          'Our offer contains links to external third-party websites over whose content we have no influence. We therefore cannot accept any responsibility for this external content. The respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking; unlawful content was not recognisable at that time. If we become aware of any infringements we will remove such links immediately.',
        ],
      },
      {
        title: 'Copyright',
        paragraphs: [
          'The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, adaptation, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy policy',
    intro:
      'Information on the processing of personal data on this website pursuant to Art. 13 GDPR.',
    metaDescription: 'Information on the processing of personal data pursuant to Art. 13 GDPR.',
    sections: [
      {
        title: '1. Controller',
        paragraphs: [
          'No data protection officer has been appointed; the legal requirements for appointing one are not met.',
        ],
      },
      {
        title: '2. Visiting this website',
        paragraphs: [
          'When you open the website, your browser transmits technically necessary data which is stored in server log files: IP address, date and time of access, the address requested, the amount of data transferred, the status code, the referrer and the browser and operating system identifier.',
          'The legal basis is **Art. 6 (1) (f) GDPR**. Our legitimate interest lies in the technical operation, the stability and the security of the website. Log data is deleted or shortened after 30 days at the latest, unless it is needed to investigate a specific case of misuse.',
        ],
      },
      {
        title: '3. Request form',
        paragraphs: [
          'When you use the request form we process the details you enter: pick-up location, destination, information about the vehicle, your preferred date, your remarks, your name and the phone number and/or email address you provide.',
          'The sole purpose is to handle your enquiry and prepare a quote. The legal basis is **Art. 6 (1) (b) GDPR** (steps taken prior to entering into a contract at your request).',
          'The request is sent to our mailbox as an email and is not stored in any database of this website. We keep it for as long as it is needed to handle the enquiry and answer follow-up questions. If a contract is concluded, commercial and tax retention periods apply (as a rule six or ten years). If no contract is concluded, we delete the enquiry once it is no longer needed.',
          'The form contains an additional field that is invisible to you and serves to fend off automated submissions. It processes no personal data and embeds no third-party service.',
        ],
      },
      {
        title: '4. Contact by phone, email and WhatsApp',
        paragraphs: [
          'If you contact us by phone, email or WhatsApp, we process the data arising from that contact in order to handle your request. The legal basis is **Art. 6 (1) (b) GDPR** where the contact is aimed at a contract, otherwise **Art. 6 (1) (f) GDPR**.',
          'The WhatsApp button is not based on an embedded script: it is an ordinary link. Only when you tap it do you leave this website and a connection to WhatsApp Ireland Ltd. or Meta Platforms is established. Meta is the controller for that processing; the WhatsApp privacy terms apply. If you would rather avoid this, you can reach us just as well by phone, by email or through the form.',
        ],
      },
      {
        title: '5. Recipients and processors',
        paragraphs: ['We use the following service providers to operate this website:'],
        list: [
          '**Railway Corp.** — hosting of the website and operation of the application.',
          '**Resend** — technical delivery of the request emails to our mailbox.',
        ],
        todo: 'Conclude data processing agreements and confirm here that they are in place.',
      },
      {
        title: '6. Cookies and analytics',
        paragraphs: [
          'This website sets **no cookies**. None for analytics, advertising or tracking, and none that are technically necessary either: there is no login, no shopping basket, and the language you are reading is part of the address itself — “/” for German, “/en” for English — and therefore does not have to be remembered anywhere. No data is placed in your browser’s local storage.',
          'No audience measurement takes place, and no third-party services are embedded that could recognise you across websites — not even fonts from external servers. Consent under **§ 25 TDDDG** is therefore not required: nothing is stored on your device and nothing is read from it.',
          'The details, and how to verify this yourself, are on the [Cookies & tracking](/en/cookies) page.',
        ],
      },
      {
        title: '7. Your rights',
        paragraphs: ['You have the following rights regarding your personal data:'],
        list: [
          'Access to the data processed (Art. 15 GDPR)',
          'Rectification of inaccurate data (Art. 16 GDPR)',
          'Erasure (Art. 17 GDPR)',
          'Restriction of processing (Art. 18 GDPR)',
          'Data portability (Art. 20 GDPR)',
          'Objection to processing based on Art. 6 (1) (f) GDPR (Art. 21 GDPR)',
          'Withdrawal of consent with effect for the future (Art. 7 (3) GDPR)',
        ],
      },
      {
        title: '8. Right to lodge a complaint',
        paragraphs: [
          'To exercise your rights, please use the contact details above. Independently of this, you have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular with the authority of your habitual residence or of the controller’s place of business.',
        ],
      },
      {
        title: '9. Obligation to provide data',
        paragraphs: [
          'Providing your data is neither required by law nor by contract. Without a pick-up location, a destination, your name and one way of reaching you, however, we cannot handle your enquiry or prepare a quote.',
        ],
      },
      {
        title: '10. Automated decision-making',
        paragraphs: [
          'Automated decision-making including profiling under Art. 22 GDPR does not take place. Every quote is reviewed and prepared by hand.',
        ],
      },
      {
        title: '11. Changes to this policy',
        paragraphs: [
          'We adapt this privacy policy when the legal situation, our services or the service providers we use change. The version available on this page at the time applies.',
        ],
      },
    ],
  },

  cookies: {
    title: 'Cookies & tracking',
    intro: 'Short and complete: this website sets no cookies.',
    metaDescription:
      'This website sets no cookies, measures no audience and embeds no third-party services. What that means and why there is therefore no cookie banner.',
    sections: [
      {
        title: 'What that means in detail',
        list: [
          'No analytics tools — neither Google Analytics nor Matomo nor anything comparable.',
          'No advertising or retargeting pixels, for instance from Meta or Google Ads.',
          'No fonts from external servers. The site uses the typeface already present on your device — so no request goes out to Google Fonts either.',
          'No embedded maps, videos or chat windows.',
          'Not even technically necessary cookies: there is no login and no shopping basket, and the language choice is part of the address — the switch is an ordinary link and stores nothing.',
        ],
      },
      {
        title: 'Why there is no cookie banner, then',
        paragraphs: [
          '**§ 25 TDDDG** requires your consent before information is stored on your device or read from it. Nothing is stored here and nothing is read — so there is nothing you could consent to.',
          'A banner asking permission for something that does not happen informs nobody. It only trains people to dismiss such windows unread. That is why there is none.',
        ],
      },
      {
        title: 'What is transmitted regardless',
        paragraphs: [
          'For a page to reach you at all, your browser has to request it. In doing so, log data arises at the host: IP address, time, the address requested, the amount of data transferred, browser and operating system identifier. This data serves the technical operation and security of the site and is deleted or shortened after 30 days at the latest.',
          'That is not tracking and cannot be switched off technically — without those details nobody could deliver a page to you. The details are in the [privacy policy](/en/privacy).',
        ],
      },
      {
        title: 'When you tap WhatsApp',
        paragraphs: [
          'The WhatsApp button is an ordinary link, not an embedded script. As long as you do not tap it, there is no connection to Meta. Only by tapping it do you leave this website, and the WhatsApp privacy terms apply. If you would rather avoid this, you can reach us just as well by phone, by email or through the form.',
        ],
      },
      {
        title: 'You don’t have to take our word for it',
        paragraphs: [
          'Check it yourself. On a computer: press **F12**, open the *Application* tab and click *Cookies* on the left. The list is empty. The *Network* tab also shows that not a single request goes to an external server.',
        ],
      },
      {
        title: 'Should this change',
        paragraphs: [
          'If audience measurement or any service that stores something on your device is added later, it will be described here and in the privacy policy beforehand — and, where consent is required, accompanied by a real request in which declining is exactly as easy as agreeing.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms and conditions',
    intro: 'For vehicle transfers driven under their own power.',
    metaDescription:
      'Terms and conditions for vehicle transfers driven under their own power by AZD Transport.',
    sections: [
      {
        title: '§ 1 Scope and contracting parties',
        paragraphs: [
          'These terms and conditions apply to all contracts for vehicle transfers between the provider named in the legal notice (the “Contractor”) and the client.',
          'Deviating terms of the client do not become part of the contract unless the Contractor expressly agrees to them in text form.',
          'A consumer is any natural person who enters into the contract for purposes that are predominantly outside their trade, business or profession (§ 13 German Civil Code). An entrepreneur is anyone acting in the exercise of their trade, business or profession when concluding the contract (§ 14 German Civil Code).',
        ],
      },
      {
        title: '§ 2 Subject of the service',
        paragraphs: [
          'The Contractor transfers the vehicle named by the client from the agreed pick-up location to the agreed destination. The transfer is carried out **under the vehicle’s own power**, meaning the vehicle is driven and not carried on a trailer or car transporter.',
          'Cars, SUVs, sports cars, luxury vehicles and vans up to 3.5 t permissible total mass are transferred.',
          'Additional services — in particular documenting the vehicle’s condition, recording the mileage and the fuel or charge level, handover photos and coordinating appointments with third parties — are only owed if expressly agreed.',
        ],
      },
      {
        title: '§ 3 Quote and conclusion of contract',
        paragraphs: [
          'The presentation of services on this website is not a binding offer but an invitation to submit an enquiry.',
          'By sending an enquiry through the form, by phone, by email or by messenger, the client requests a quote. On that basis the Contractor prepares an individual quote at a fixed price. The contract is concluded when the client accepts that quote and the Contractor confirms the order.',
          'An enquiry is non-binding and free of charge.',
        ],
      },
      {
        title: '§ 4 Prices and payment',
        paragraphs: [
          'The fixed price stated in the quote applies. It covers the services listed there including the outward and return journey and — unless expressly agreed otherwise — fuel and tolls.',
          'Subsequent changes to the order by the client, in particular changes to the pick-up location, the destination or the date, may change the price. The Contractor points out any such change before carrying out the transfer.',
          'Payment is due after invoicing without deduction unless agreed otherwise. The client receives an invoice; whether VAT is shown depends on the Contractor’s tax situation.',
        ],
      },
      {
        title: '§ 5 The client’s obligations to cooperate',
        paragraphs: ['The client ensures that at the agreed pick-up time:'],
        list: [
          'the vehicle is **roadworthy and safe to drive**,',
          'a valid registration plate and existing insurance cover are in place — regular registration, a short-term plate or a red dealer plate,',
          'the vehicle documents required for the journey and at least one key are handed over,',
          'the vehicle is accessible at the agreed location and a person authorised to hand it over is present or reachable,',
          'known defects, particularities or limitations of the vehicle are communicated in advance.',
        ],
      },
      {
        title: '§ 6 Consequences of missing cooperation',
        paragraphs: [
          'If the requirements under § 5 are not met and the transfer therefore cannot be carried out, or cannot be carried out as agreed, the Contractor may invoice the documented costs incurred — in particular a wasted outward journey.',
        ],
      },
      {
        title: '§ 7 Insurance and cover',
        paragraphs: [
          'The client is obliged to inform the Contractor about the vehicle’s existing insurance cover before the journey begins. If there is any doubt about insurance cover, the transfer will not be started.',
        ],
      },
      {
        title: '§ 8 Dates and performance',
        paragraphs: [
          'Dates for pick-up and handover are agreed individually. They are binding if they have expressly been confirmed as binding.',
          'If delays occur due to circumstances for which the Contractor is not responsible — in particular traffic conditions, weather, strikes, official orders or technical defects of the vehicle — the date shifts accordingly. The Contractor informs the client without undue delay.',
          'The Contractor may engage suitable third parties to carry out the transfer. In that case the Contractor remains the client’s contracting party.',
        ],
      },
      {
        title: '§ 9 Handover and condition report',
        paragraphs: [
          'At pick-up and at handover the vehicle is inspected together, provided an authorised person is present. If a condition report has been agreed, the Contractor records the condition, the mileage and the fuel or charge level and makes the documentation available to the client.',
          'Recognisable damage must be reported without undue delay at handover. For entrepreneurs, § 377 of the German Commercial Code applies in addition.',
        ],
      },
      {
        title: '§ 10 Cancellation',
        paragraphs: [
          'The client may cancel the order before the journey begins. Costs already incurred — in particular an outward journey already started or tickets already booked — must be reimbursed.',
          'The statutory right of withdrawal for consumers in distance contracts remains unaffected; the details are set out in the [withdrawal policy](/en/withdrawal).',
        ],
      },
      {
        title: '§ 11 Liability',
        paragraphs: [
          'The Contractor is liable without limitation for intent and gross negligence, for injury to life, body or health, and under the provisions of the German Product Liability Act.',
          'In cases of ordinary negligence the Contractor is only liable for breach of a material contractual obligation whose fulfilment makes the proper performance of the contract possible in the first place and on whose observance the client may regularly rely. In that case liability is limited to the damage foreseeable at the conclusion of the contract and typical for this type of contract.',
          'Any further liability is excluded. No liability is accepted for normal signs of use arising from the intended use of the vehicle on the agreed route, nor for damage resulting from pre-existing defects that were not communicated to the Contractor.',
        ],
      },
      {
        title: '§ 12 Final provisions',
        paragraphs: [
          'The law of the Federal Republic of Germany applies. For consumers this choice of law applies only insofar as it does not deprive them of the protection of mandatory provisions of the law of the state in which they have their habitual residence.',
          'If the client is a merchant, a legal entity under public law or a special fund under public law, the place of jurisdiction is the Contractor’s registered office.',
          'Should any provision of these terms be invalid, the validity of the remaining provisions remains unaffected.',
        ],
      },
      {
        title: 'Note',
        paragraphs: [
          'These terms were written for the vehicle transfer business. They are not a substitute for legal advice. Before going into production they should be reviewed by a lawyer for this specific operation — in particular the provisions on liability, insurance and cancellation.',
        ],
      },
    ],
  },

  withdrawal: {
    title: 'Right of withdrawal',
    intro: 'For consumers in contracts concluded at a distance or away from business premises.',
    metaDescription:
      'Right of withdrawal for consumers in distance contracts for vehicle transfers, including the model withdrawal form.',
    sections: [
      {
        title: 'Who has this right',
        paragraphs: [
          'A consumer is any natural person who enters into a legal transaction for purposes that are predominantly outside their trade, business or profession (§ 13 German Civil Code). Entrepreneurs do not have the right of withdrawal described below.',
        ],
      },
      {
        title: 'Right of withdrawal',
        paragraphs: [
          'You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day the contract was concluded.',
          'To exercise your right of withdrawal you must inform us — address and contact details below — by means of a clear statement (for example a letter sent by post or an email) of your decision to withdraw from this contract. You may use the model withdrawal form printed below, though it is not mandatory.',
          'To meet the withdrawal deadline it is sufficient for you to send your communication concerning the exercise of the right of withdrawal before the withdrawal period has expired.',
        ],
      },
      {
        title: 'Consequences of withdrawal',
        paragraphs: [
          'If you withdraw from this contract, we shall reimburse all payments received from you without undue delay and no later than fourteen days from the day on which we receive notification of your withdrawal. For this reimbursement we will use the same means of payment you used for the original transaction unless expressly agreed otherwise with you; in no event will you be charged any fees for this reimbursement.',
          'If you requested that the service should begin during the withdrawal period, you shall pay us an amount which is in proportion to what has been provided until you communicated your withdrawal from this contract, in comparison with the full coverage of the contract.',
        ],
      },
      {
        title: 'Early expiry of the right of withdrawal',
        paragraphs: [
          'In a contract for the provision of services, the right of withdrawal expires when we have fully performed the service and only began performance after you gave your express consent and at the same time acknowledged that you would lose your right of withdrawal upon full performance of the contract by us.',
          'This is the common case in practice: if a transfer is carried out at your request at short notice — that is, within the fourteen days — we obtain this consent in text form before the journey begins.',
        ],
      },
      // Provider details and blank lines rather than text — the page fills
      // this section in itself.
      { id: 'withdrawalForm', title: 'Model withdrawal form' },
      {
        title: 'Note',
        paragraphs: [
          'This policy follows the statutory model in Annex 1 to Art. 246a § 1 (2) of the Introductory Act to the German Civil Code. It is not a substitute for legal advice; in particular the handling of early expiry should be legally secured before going into production.',
        ],
      },
    ],
  },
};

/** Labels of the model withdrawal form. */
export const withdrawalFormEn = {
  title: 'Model withdrawal form',
  intro:
    'If you wish to withdraw from the contract, please complete this form and send it back to us.',
  to: 'To',
  body: 'I/we (*) hereby give notice that I/we (*) withdraw from my/our (*) contract for the provision of the following service:',
  lines: [
    'Description of the service',
    'Ordered on (*) / received on (*)',
    'Name of consumer(s)',
    'Address of consumer(s)',
    'Signature (only if this form is notified on paper)',
    'Date',
  ],
  footnote: '(*) Delete as appropriate.',
};
