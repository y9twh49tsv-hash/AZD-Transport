/**
 * Alle Unternehmensangaben an einer Stelle.
 *
 * Jede Zahl, Adresse und Rechtsangabe der Website kommt von hier. Wer etwas
 * ändern will, ändert es hier — nicht in fünf Komponenten.
 *
 * ⚠ Werte mit `TODO` sind noch nicht bestätigt. Sie sind bewusst als solche
 * markiert und nicht geraten: eine erfundene Anschrift im Impressum ist
 * abmahnfähig, und eine erfundene Versicherungsaussage ist schlimmer als gar
 * keine. `isTodo()` erkennt sie, damit die Rechtsseiten sichtbar warnen statt
 * einen Platzhalter als Tatsache auszugeben.
 */

export const TODO = 'TODO:' as const;

/** Ein Wert, der noch bestätigt werden muss. */
export function isTodo(value: string): boolean {
  return value.startsWith(TODO);
}

/** Der Text ohne die Markierung — für die Anzeige im Hinweis. */
export function todoText(value: string): string {
  return value.slice(TODO.length).trim();
}

export const siteConfig = {
  companyName: 'AZD Transport',
  legalName: `${TODO} Vollständige Firmierung inkl. Rechtsform (z. B. "Mehdi Azdouffal – AZD Transport, Einzelunternehmen")`,
  ownerName: `${TODO} Vor- und Nachname der Inhaberin / des Inhabers`,

  claim: 'Premium Fahrzeugüberführungen. Diskret. Sicher. Deutschlandweit.',
  shortDescription: 'Premium Fahrzeugüberführungen auf eigener Achse.',

  address: {
    street: `${TODO} Straße und Hausnummer`,
    postalCode: `${TODO} PLZ`,
    city: 'Frankfurt am Main',
    country: 'Deutschland',
  },

  /** Aus der bestehenden Konfiguration übernommen — im Betrieb bestätigt. */
  phone: '+49 157 82034336',
  /** Nur Ziffern, internationales Format — für wa.me. */
  whatsapp: '4915782034336',
  email: 'info@azd-transport.com',

  /** Nicht ins Impressum. Steuernummern gehören nicht auf eine Website. */
  taxNumber: `${TODO} Steuernummer — nur intern für Rechnungen, NICHT veröffentlichen`,
  vatId: `${TODO} USt-IdNr. nach § 27a UStG, falls vorhanden — sonst diesen Eintrag löschen`,

  /**
   * Bewusst neutral. Sobald eine Police vorliegt, wird hier der konkrete
   * Umfang eingetragen — und nur dann. Aussagen wie "vollversichert" ohne
   * Deckung wären genau die Zusage, an der ein Premiumkunde einen Anbieter
   * misst, wenn etwas passiert.
   */
  insuranceText:
    'Die konkrete Absicherung wird je nach Auftrag und Fahrzeug individuell geprüft. Die Details erhalten Sie vor Auftragserteilung schriftlich.',

  /** Wohin Anfragen gehen. Leer = an `email`. */
  requestInbox: process.env.REQUEST_INBOX?.trim() || 'info@azd-transport.com',

  serviceArea: 'Deutschlandweit — auf Anfrage europaweit',
} as const;

/** Alle noch offenen Angaben, für den Hinweis in den Rechtsseiten. */
export function openDetails(): string[] {
  const open: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      if (isTodo(value)) open.push(`${path}: ${todoText(value)}`);
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, inner] of Object.entries(value)) {
        walk(inner, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(siteConfig, '');
  // Die Steuernummer gehört nie auf die Website — sie fehlt dort nicht.
  return open.filter((entry) => !entry.startsWith('taxNumber'));
}

/**
 * WhatsApp-Link mit vorbereiteter Nachricht.
 *
 * Die Lücken bleiben absichtlich stehen: der Kunde füllt sie im Chatfenster
 * aus, bevor er sendet. Das ist schneller als ein Formular und erzeugt
 * trotzdem eine Anfrage, mit der sich arbeiten lässt.
 */
export function whatsappRequestLink(): string {
  const message =
    'Hallo, ich interessiere mich für eine Fahrzeugüberführung.\n' +
    'Abholort: \nZielort: \nFahrzeug: \nTermin: ';
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(): string {
  return `tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`;
}
