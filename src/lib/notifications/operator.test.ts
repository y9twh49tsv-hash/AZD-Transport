import { describe, expect, it } from 'vitest';
import {
  buildOperatorBookingEmail,
  buildOperatorBookingWhatsAppText,
  type OperatorBookingContext,
} from './templates';

const abholung: OperatorBookingContext = {
  trackingNumber: 'AZD-260812-0002',
  shipmentType: 'standard',
  priceTotalCents: 6000,
  originCity: 'frankfurt-am-main',
  destinationCity: 'nador',
  weightKg: 25,
  pieceCount: 2,
  contentType: 'Kleidung',
  pickupRequested: true,
  pickupDate: '2026-08-14',
  senderName: 'Mehdi Azdouffal',
  senderPhone: '+49 157 8203 4336',
  senderEmail: 'mehdi@example.de',
  pickupAddress: 'Kleyerstraße 92a, 60326 Frankfurt am Main',
  recipientName: 'Amine Akaouch',
  recipientPhone: '+212 6 6885 5220',
  recipientCity: 'nador',
};

const abgabe: OperatorBookingContext = {
  ...abholung,
  trackingNumber: 'AZD-260812-0003',
  shipmentType: 'documents',
  priceTotalCents: 1000,
  pickupRequested: false,
  pickupDate: null,
  pickupAddress: null,
};

describe('Betriebsmeldung — E-Mail', () => {
  it('nennt die Abholung samt Datum schon im Betreff', () => {
    const mail = buildOperatorBookingEmail('chef@azd-transport.com', abholung, 'https://wa.me/49');
    expect(mail.subject).toContain('Abholung');
    expect(mail.subject).toContain('AZD-260812-0002');
    // Die wichtigste Frage im Betrieb: hinfahren oder nicht.
    expect(mail.text.split('\n')[0]).toContain('Abholung beim Kunden am 14.08.2026');
    expect(mail.text).toContain('Kleyerstraße 92a');
  });

  it('unterscheidet die Abgabe klar davon', () => {
    const mail = buildOperatorBookingEmail('chef@azd-transport.com', abgabe, 'https://wa.me/49');
    expect(mail.subject).toContain('Abgabe');
    expect(mail.text).toContain('Kunde bringt die Sendung vorbei');
    // Ohne Abholung ist die Absenderadresse für die Fahrt bedeutungslos und
    // steht deshalb nicht in der Meldung.
    expect(mail.text).not.toContain('Kleyerstraße');
  });

  it('lässt bei Dokumenten Gewicht und Stückzahl weg', () => {
    const mail = buildOperatorBookingEmail('chef@azd-transport.com', abgabe, 'https://wa.me/49');
    expect(mail.text).not.toContain('Stück');
    expect(mail.text).not.toMatch(/0,1 kg/);
  });

  it('enthält Telefonnummern und den WhatsApp-Link', () => {
    const url = 'https://wa.me/4915782034336?text=Hallo';
    const mail = buildOperatorBookingEmail('chef@azd-transport.com', abholung, url);
    expect(mail.text).toContain('+49 157 8203 4336');
    expect(mail.text).toContain('+212 6 6885 5220');
    expect(mail.text).toContain(url);
    expect(mail.html).toContain('WhatsApp');
  });

  it('schreibt den Preis in Euro, nicht in Cent', () => {
    const mail = buildOperatorBookingEmail('chef@azd-transport.com', abholung, 'https://wa.me/49');
    expect(mail.text).toContain('60,00 €');
    expect(mail.text).not.toContain('6000');
  });
});

describe('Betriebsmeldung — WhatsApp', () => {
  it('setzt die Entscheidung in die erste Zeile', () => {
    // In der Handy-Benachrichtigung sieht man oft nur diese eine Zeile.
    expect(buildOperatorBookingWhatsAppText(abholung).split('\n')[0]).toBe(
      'ABHOLUNG am 14.08.2026 — AZD-260812-0002',
    );
    expect(buildOperatorBookingWhatsAppText(abgabe).split('\n')[0]).toBe(
      'ABGABE bei uns — AZD-260812-0003',
    );
  });

  it('bleibt kurz genug für eine Benachrichtigung', () => {
    expect(buildOperatorBookingWhatsAppText(abholung).length).toBeLessThan(300);
  });

  it('nennt die Adresse nur, wenn hingefahren wird', () => {
    expect(buildOperatorBookingWhatsAppText(abholung)).toContain('Kleyerstraße 92a');
    expect(buildOperatorBookingWhatsAppText(abgabe)).not.toContain('Kleyerstraße');
  });
});
