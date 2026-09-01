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

  /**
   * Der Name, unter dem das Unternehmen rechtlich auftritt.
   *
   * Quelle: Gewerbeanmeldung nach § 14 GewO bei der Stadt Frankfurt
   * (Antrags-ID EAH-AZ 26.4309), angemeldet zum 27.08.2026 für
   * „Fahrzeugüberführungen auf eigener Achse sowie Hol- und Bringservice für
   * Kraftfahrzeuge".
   *
   * Ohne Eintrag im Handelsregister verlangt § 15b Abs. 1 GewO den Namen mit
   * mindestens einem ausgeschriebenen Vornamen — „AZD Transport" allein
   * genügt im Rechtsverkehr also nicht.
   */
  legalName: 'Mehdi Azdouffal – AZD Transport',
  legalForm: 'Einzelunternehmen',
  ownerName: 'Mehdi Azdouffal',

  claim: 'Premium Fahrzeugüberführungen. Diskret. Sicher. Deutschlandweit.',
  shortDescription: 'Premium Fahrzeugüberführungen auf eigener Achse.',

  /**
   * Die Betriebsstätte aus der Gewerbeanmeldung (Feld 15).
   *
   * ⚠ Sie ist zugleich die Wohnanschrift. Im Impressum muss eine ladungsfähige
   * Anschrift stehen — ein Postfach genügt nicht —, sie wird also öffentlich
   * sichtbar. Wer das nicht möchte, braucht eine echte Geschäftsadresse; ein
   * Weglassen ist keine Option.
   */
  address: {
    street: 'Kleyerstraße 92a',
    postalCode: '60326',
    city: 'Frankfurt am Main',
    country: 'Deutschland',
  },

  /**
   * Die Rufnummer für Anrufe. Aus der Gewerbeanmeldung bestätigt
   * (Feld 11 und 15). Steht im Impressum, in der Kopf- und Fußzeile und auf
   * jeder Fehlerseite.
   */
  phone: '+49 157 82034336',

  /**
   * Die Rufnummer für WhatsApp — bewusst getrennt von `phone`.
   *
   * Format: nur Ziffern, international, ohne Plus und ohne führende Null
   * (0157… wird zu 49157…). So verlangt es wa.me; mit Plus oder Leerzeichen
   * öffnet sich WhatsApp ohne Empfänger.
   *
   * Beim Wechsel auf eine eigene Nummer (eSIM) reicht es, diesen einen Wert zu
   * ändern — Kopfzeile, Fußzeile, die feste Leiste auf dem Telefon und der
   * „Anfrage per WhatsApp senden"-Knopf im Formular hängen alle daran.
   *
   * ⚠ Reihenfolge: erst die Nummer in WhatsApp registrieren und einen Testchat
   * empfangen, dann hier eintragen. Ein wa.me-Link auf eine Nummer ohne
   * WhatsApp-Konto endet in einer Fehlermeldung — und zwar bei der Kundschaft,
   * nicht bei uns.
   */
  whatsapp: '4915782034336',

  email: 'info@azd-transport.com',

  /** Nicht ins Impressum. Steuernummern gehören nicht auf eine Website. */
  taxNumber: `${TODO} Steuernummer — nur intern für Rechnungen, NICHT veröffentlichen`,

  /**
   * USt-IdNr. nach § 27a UStG.
   *
   * Leer = nicht vorhanden. Dann entfällt der Abschnitt im Impressum
   * vollständig — § 5 DDG verlangt die Angabe nur, „soweit vorhanden".
   * Angenommen für ein am 27.08.2026 angemeldetes Gewerbe: eine USt-IdNr.
   * wird nicht automatisch vergeben, sondern beim Bundeszentralamt für
   * Steuern beantragt. Sobald eine vorliegt, hier eintragen (Format
   * DE123456789), dann erscheint sie im Impressum.
   */
  vatId: '',

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

  /**
   * Optionales Kopfbild.
   *
   * Im Projekt liegt keine lizenzierte Automotive-Fotografie, und ein
   * erkennbares Stockfoto würde bei dieser Zielgruppe eher schaden als nützen.
   * Der Kopfbereich trägt deshalb ohne Bild.
   *
   * Sobald ein eigenes Foto vorliegt — ein Fahrzeug bei der Übergabe, ein
   * Detail, eine Situation, an der man sieht, dass es echt ist: Datei nach
   * `public/` legen und den Pfad hier eintragen, z. B. '/hero.jpg'. Querformat,
   * mindestens 2000 px breit, dunkel oder dunkel abstimmbar. Der Kopfbereich
   * legt automatisch einen Verlauf darüber, damit die Schrift lesbar bleibt.
   */
  heroImage: '' as string,

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
 * Praktische Obergrenze für die vorbereitete Nachricht in einem wa.me-Link.
 *
 * Der Text steckt in der Adresse und wird beim Kodieren länger — Umlaute und
 * Zeilenumbrüche werden zu drei Zeichen. Sehr lange Adressen schneiden manche
 * Browser ab, und abgeschnitten heißt hier: die Nachricht ist kaputt. Der Wert
 * ist bewusst konservativ.
 */
export const WHATSAPP_MESSAGE_LIMIT = 1200;

/**
 * Ein WhatsApp-Link mit vorbereiteter Nachricht.
 *
 * Der Text steht schon im Eingabefeld, wenn WhatsApp aufgeht — abschicken muss
 * ihn der Kunde selbst. Das ist keine Einschränkung dieser Umsetzung, sondern
 * wie wa.me funktioniert, und es ist auch richtig so: niemand verschickt
 * ungefragt eine Nachricht aus dem Konto eines anderen.
 */
export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Der Link für die Schaltflächen außerhalb des Formulars — Kopfzeile,
 * Fußzeile, die feste Leiste auf dem Telefon.
 *
 * Nur ein kurzer Aufhänger, keine Lückenvorlage. Vorher stand hier ein
 * Gerüst mit „Abholort: ___ Zielort: ___“, das der Kunde selbst ausfüllen
 * sollte. Das sieht nach Hausaufgabe aus und wird weggelöscht; wer WhatsApp
 * wählt, will tippen wie in einem Chat. Alle Angaben auf einmal gibt es im
 * Formular — dessen WhatsApp-Knopf baut die vollständige Nachricht.
 */
export function whatsappRequestLink(): string {
  return whatsappLink('Hallo, ich interessiere mich für eine Fahrzeugüberführung.');
}

export function telLink(): string {
  return `tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`;
}
