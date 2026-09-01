/**
 * Die Inhalte der Überführungsseite als Daten, nicht als JSX.
 *
 * Damit steht jeder Satz einmal, lässt sich ohne Layoutkenntnisse ändern und
 * taucht automatisch in den strukturierten Daten (schema.org) auf, statt dort
 * ein zweites Mal getippt zu werden.
 */

export type Service = {
  id: string;
  title: string;
  text: string;
};

export const services: Service[] = [
  {
    id: 'premium',
    title: 'Premium- & Luxusfahrzeuge',
    text: 'Sportwagen, hochwertige Limousinen und SUV. Übernahme, Fahrweise und Übergabe werden dem Fahrzeug angemessen behandelt — nicht wie eine Routinefahrt.',
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
];

export type Step = {
  number: string;
  title: string;
  text: string;
};

export const steps: Step[] = [
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
];

/** Was auf Wunsch zum Auftrag gehört. Bewusst als „auf Wunsch“ formuliert. */
export const documentation: string[] = [
  'Fahrzeugzustand bei Übernahme dokumentieren',
  'Kilometerstand festhalten',
  'Tank- bzw. Ladezustand festhalten',
  'Übergabefotos',
  'Direkte Kommunikation während der Fahrt',
  'Terminabstimmung mit Verkäufer oder Autohaus',
  'Übergabe an die Wunschadresse',
];

export const businessBenefits: string[] = [
  'Regelmäßige Überführungen und Einzelaufträge',
  'Ein Ansprechpartner statt wechselnder Fahrer',
  'Rechnung für Buchhaltung und Fuhrparkverwaltung',
  'Flexible Terminierung nach Ihrem Ablauf',
  'Übergabedokumentation auf Wunsch',
];

export const reasons: { title: string; text: string }[] = [
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
];

export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
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
      'Für die Fahrt auf öffentlichen Straßen ist ein gültiges Kennzeichen und Versicherungsschutz erforderlich — die reguläre Zulassung, ein Kurzzeitkennzeichen oder ein rotes Kennzeichen. Fehlt beides, klären wir vorab, welche Lösung möglich ist.',
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
];
