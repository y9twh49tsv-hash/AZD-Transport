/**
 * Goods we do not carry.
 *
 * ⚠ PLACEHOLDER — this list reflects common practice for private cross-border
 * road transport, not legal advice. Before going live, have it checked against
 * German export rules, Moroccan customs rules (Douane / ADII) and the ADR
 * dangerous-goods regulations, and align it with your insurance policy.
 *
 * The booking form renders this list and requires an explicit confirmation.
 */

export type ProhibitedCategory = {
  id: string;
  title: string;
  examples: string[];
  /** Shown as a hint when the rule has a nuance customers regularly ask about. */
  note?: string;
};

export const prohibitedCategories: ProhibitedCategory[] = [
  {
    id: 'weapons',
    title: 'Waffen, Munition und Waffenteile',
    examples: ['Schusswaffen', 'Munition', 'Messer mit Waffencharakter', 'Reizgas'],
  },
  {
    id: 'drugs',
    title: 'Betäubungsmittel und illegale Substanzen',
    examples: ['Drogen jeder Art', 'nicht verschreibungsfähige Präparate'],
  },
  {
    id: 'dangerous',
    title: 'Gefahrgut und leicht entzündliche Stoffe',
    examples: [
      'Benzin, Diesel, Spiritus',
      'Gasflaschen und Feuerzeuggas',
      'Feuerwerk und Pyrotechnik',
      'Farben, Lacke, Lösungsmittel',
      'Säuren und Laugen',
    ],
    note: 'Auch scheinbar harmlose Sprays und Parfüm gelten teilweise als Gefahrgut.',
  },
  {
    id: 'batteries',
    title: 'Lose Lithium-Batterien und beschädigte Akkus',
    examples: ['Powerbanks ohne Gerät', 'aufgeblähte oder beschädigte Akkus', 'E-Bike-Akkus'],
    note: 'Geräte mit fest verbautem Akku bitte vorher mit uns abstimmen.',
  },
  {
    id: 'money',
    title: 'Bargeld, Edelmetalle und Wertsachen',
    examples: ['Bargeld', 'Gold- und Silberbarren', 'Schmuck von hohem Wert', 'Sparbücher'],
    note: 'Für Wertsachen besteht kein Versicherungsschutz — bitte niemals mitgeben.',
  },
  {
    id: 'documents',
    title: 'Ausweis- und Originaldokumente',
    examples: ['Reisepässe', 'Personalausweise', 'Original-Urkunden'],
  },
  {
    id: 'perishable',
    title: 'Verderbliche Lebensmittel und lebende Tiere',
    examples: ['frisches Fleisch und Fisch', 'Milchprodukte', 'Pflanzen', 'lebende Tiere'],
    note: 'Haltbar verpackte Lebensmittel sind nach Absprache möglich.',
  },
  {
    id: 'counterfeit',
    title: 'Gefälschte und nicht deklarierte Handelswaren',
    examples: ['Markenfälschungen', 'unversteuerte Zigaretten', 'Alkohol zum Weiterverkauf'],
  },
  {
    id: 'medical',
    title: 'Verschreibungspflichtige Medikamente ohne Nachweis',
    examples: ['Medikamente in Handelsmengen', 'Betäubungsmittel-Rezepte'],
    note: 'Kleine Mengen für den Eigenbedarf bitte vorher anmelden.',
  },
];

/** Short version for the booking checkbox tooltip. */
export const prohibitedShortList = prohibitedCategories.map((c) => c.title);
