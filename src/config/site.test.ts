import { describe, expect, it } from 'vitest';
import {
  isTodo,
  openDetails,
  siteConfig,
  telLink,
  todoText,
  whatsappLink,
  whatsappRequestLink,
} from './site';

/**
 * Die Unternehmensangaben sind kein gewöhnlicher Inhalt.
 *
 * Eine Musteradresse im Impressum ist abmahnfähig, und sie fällt niemandem
 * mehr auf, sobald sie einmal wie eine echte Adresse aussieht. Dieser Test
 * schaut deshalb nach, dass keine mehr da ist — und dass die Angaben, die auf
 * den Rechtsseiten stehen müssen, tatsächlich gefüllt sind.
 */

describe('siteConfig', () => {
  it('enthält keine offenen Pflichtangaben mehr', () => {
    // openDetails() speist den Hinweis auf den Rechtsseiten. Ist die Liste
    // leer, verschwindet er — und genau das ist der Zustand, in dem die Seite
    // beworben werden darf.
    expect(openDetails()).toEqual([]);
  });

  it('nennt Firmierung, Inhaber und eine ladungsfähige Anschrift', () => {
    for (const value of [
      siteConfig.legalName,
      siteConfig.legalForm,
      siteConfig.ownerName,
      siteConfig.address.street,
      siteConfig.address.postalCode,
      siteConfig.address.city,
    ]) {
      expect(isTodo(value)).toBe(false);
      expect(value.trim().length).toBeGreaterThan(1);
    }
  });

  it('verwendet keine Platzhalteradresse', () => {
    const address = Object.values(siteConfig.address).join(' ').toLowerCase();
    for (const placeholder of ['muster', 'beispiel', 'example', 'xxx', 'straße 1,']) {
      expect(address).not.toContain(placeholder);
    }
  });

  it('nennt den Inhaber mit ausgeschriebenem Vornamen', () => {
    // § 15b Abs. 1 GewO: ohne Handelsregistereintrag muss mindestens ein
    // Vorname ausgeschrieben sein — „M. Azdouffal" genügt nicht.
    const parts = siteConfig.ownerName.trim().split(/\s+/);
    expect(parts.length).toBeGreaterThanOrEqual(2);
    for (const part of parts) expect(part).not.toMatch(/^\p{Lu}\.$/u);
  });

  it('führt die Postleitzahl als fünfstellige Zahl', () => {
    expect(siteConfig.address.postalCode).toMatch(/^\d{5}$/);
  });

  it('hält die Steuernummer von der Website fern', () => {
    // Sie ist noch offen — aber selbst wenn sie eingetragen wird, darf sie
    // nicht in der Liste auftauchen, die die Rechtsseiten anzeigen.
    expect(openDetails().some((entry) => entry.startsWith('taxNumber'))).toBe(false);
  });

  it('gibt die USt-IdNr. nur aus, wenn es eine gibt', () => {
    // Leer heißt „nicht vorhanden": § 5 DDG verlangt sie nur, soweit sie
    // existiert. Eine Markierung als offener Punkt wäre hier falsch.
    expect(isTodo(siteConfig.vatId)).toBe(false);
    if (siteConfig.vatId) expect(siteConfig.vatId).toMatch(/^DE\d{9}$/);
  });

  it('verspricht keine Versicherungsdeckung, die nicht belegt ist', () => {
    const text = siteConfig.insuranceText.toLowerCase();
    for (const claim of ['vollversichert', 'vollkasko', '100 %', 'garantiert']) {
      expect(text).not.toContain(claim);
    }
  });

  it('baut einen wählbaren Telefonlink', () => {
    expect(telLink()).toBe('tel:+4915782034336');
  });

  it('baut einen WhatsApp-Link mit kurzem Aufhänger', () => {
    const link = whatsappRequestLink();
    expect(link.startsWith(`https://wa.me/${siteConfig.whatsapp}?text=`)).toBe(true);
    expect(decodeURIComponent(link)).toContain('Fahrzeugüberführung');
  });

  it('stellt den Schaltflächen außerhalb des Formulars keine Lückenvorlage hin', () => {
    // Vorher stand hier „Abholort: ___ Zielort: ___“ zum Selbstausfüllen. Das
    // sieht nach Hausaufgabe aus und wird weggelöscht; die vollständige
    // Nachricht baut das Formular.
    const message = decodeURIComponent(whatsappRequestLink().split('?text=')[1]);
    expect(message).not.toContain(':');
    expect(message.split('\n')).toHaveLength(1);
  });

  it('kodiert beliebigen Text sicher in den Link', () => {
    const link = whatsappLink('Abholort: Köln & Umgebung\nZielort: München');
    expect(link).not.toContain(' ');
    expect(link).not.toContain('\n');
    expect(decodeURIComponent(link.split('?text=')[1])).toBe(
      'Abholort: Köln & Umgebung\nZielort: München',
    );
  });
});

describe('TODO-Markierung', () => {
  it('erkennt einen offenen Wert und gibt seinen Text zurück', () => {
    expect(isTodo('TODO: Anschrift nachtragen')).toBe(true);
    expect(todoText('TODO: Anschrift nachtragen')).toBe('Anschrift nachtragen');
  });

  it('hält einen gefüllten Wert nicht für offen', () => {
    expect(isTodo('Kleyerstraße 92a')).toBe(false);
    expect(isTodo('')).toBe(false);
  });
});
