import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isWhatsAppConfigured,
  normaliseNumber,
  operatorNumber,
  sendWhatsAppNotification,
  whatsappConfigProblems,
  whatsappParameter,
} from './whatsapp';

const KEYS = [
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_TEMPLATE_NAME',
  'WHATSAPP_TEMPLATE_LOCALE',
  'WHATSAPP_GRAPH_VERSION',
  'OPERATOR_WHATSAPP',
] as const;

/** Werte, mit denen der Versand eingerichtet ist. */
function configure() {
  process.env.WHATSAPP_PHONE_NUMBER_ID = '109876543210987';
  process.env.WHATSAPP_ACCESS_TOKEN = 'EAAG'.padEnd(120, 'x');
}

beforeEach(() => {
  for (const key of KEYS) delete process.env[key];
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
  vi.restoreAllMocks();
});

describe('normaliseNumber', () => {
  it('macht aus jeder gebräuchlichen Schreibweise dieselbe Ziffernfolge', () => {
    for (const input of [
      '+49 157 82034336',
      '0157 82034336',
      '0049 157 82034336',
      '49157 8203 4336',
      '+49-157-82034336',
    ]) {
      expect(normaliseNumber(input), `Eingabe: ${input}`).toBe('4915782034336');
    }
  });

  it('lässt eine ausländische Nummer in Ruhe', () => {
    expect(normaliseNumber('+212 6 6885 5220')).toBe('212668855220');
  });
});

describe('whatsappParameter', () => {
  it('macht aus der mehrzeiligen Zusammenfassung eine Zeile', () => {
    // Meta lehnt Platzhalter mit Zeilenumbruch, Tabulator oder mehr als vier
    // Leerzeichen hintereinander ab — Fehler 132000, ohne Hinweis worauf.
    const text = whatsappParameter('Abholort: Frankfurt\nZielort: München\n\tFahrzeug: Porsche');

    expect(text).not.toMatch(/[\r\n\t]/);
    expect(text).not.toMatch(/ {2}/);
    expect(text).toBe('Abholort: Frankfurt · Zielort: München · Fahrzeug: Porsche');
  });

  it('zieht mehrere Trenner zu einem zusammen und lässt keinen am Rand stehen', () => {
    expect(whatsappParameter('\n\nA\n\n\nB\n\n')).toBe('A · B');
  });

  it('lässt einen bereits einzeiligen Text unverändert', () => {
    const line = 'Frankfurt → München · Porsche 911 · 15.10.2026';
    expect(whatsappParameter(line)).toBe(line);
  });
});

describe('whatsappConfigProblems', () => {
  it('meldet beide fehlenden Werte, wenn nichts eingerichtet ist', () => {
    expect(whatsappConfigProblems()).toEqual([
      'WHATSAPP_PHONE_NUMBER_ID fehlt',
      'WHATSAPP_ACCESS_TOKEN fehlt',
    ]);
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it('erkennt die Telefonnummer an der Stelle der Phone Number ID', () => {
    // Der häufigste Einrichtungsfehler. Beides sind Ziffern, deshalb fällt es
    // sonst erst auf, wenn die erste Anfrage nicht ankommt.
    process.env.WHATSAPP_PHONE_NUMBER_ID = '4915782034336';
    process.env.WHATSAPP_ACCESS_TOKEN = 'x'.padEnd(120, 'y');
    // 13 Ziffern gehen als ID durch — das prüft die Form, nicht die Bedeutung.
    process.env.WHATSAPP_PHONE_NUMBER_ID = '+49 157 82034336';
    expect(whatsappConfigProblems()[0]).toMatch(/Phone Number ID/);
  });

  it('bemängelt einen abgeschnittenen Zugriffsschlüssel', () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '109876543210987';
    process.env.WHATSAPP_ACCESS_TOKEN = 'EAAG-zu-kurz';
    expect(whatsappConfigProblems()[0]).toMatch(/auffällig kurz/);
  });

  it('ist zufrieden, wenn beide Werte stimmen', () => {
    configure();
    expect(whatsappConfigProblems()).toEqual([]);
    expect(isWhatsAppConfigured()).toBe(true);
  });

  it('nennt keinen Schlüssel und kein Bruchstück davon', () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '109876543210987';
    process.env.WHATSAPP_ACCESS_TOKEN = 'EAAGgeheim';
    const joined = whatsappConfigProblems().join(' ');
    expect(joined).not.toContain('EAAGgeheim');
    expect(joined).not.toContain('geheim');
  });
});

describe('operatorNumber', () => {
  it('nimmt die Nummer aus der Konfiguration, wenn keine gesetzt ist', () => {
    expect(operatorNumber()).toBe('4915782034336');
  });

  it('begradigt eine gesetzte Nummer, statt sie abzulehnen', () => {
    process.env.OPERATOR_WHATSAPP = '0170 1234567';
    expect(operatorNumber()).toBe('491701234567');
  });
});

describe('sendWhatsAppNotification', () => {
  it('tut nichts und meldet das, solange nichts eingerichtet ist', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await sendWhatsAppNotification('Frankfurt → München');

    expect(result.skipped).toBe(true);
    expect(result.ok).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('schickt eine Vorlage an die Nummer des Betriebs', async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: 'wamid.TEST' }] }), { status: 200 }),
    );

    const result = await sendWhatsAppNotification('Frankfurt → München\nPorsche 911');

    expect(result.ok).toBe(true);
    expect(result.messageId).toBe('wamid.TEST');

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.com/v26.0/109876543210987/messages');
    expect((init.headers as Record<string, string>).Authorization).toMatch(/^Bearer EAAG/);

    const body = JSON.parse(init.body as string);
    expect(body.messaging_product).toBe('whatsapp');
    expect(body.to).toBe('4915782034336');
    expect(body.type).toBe('template');
    expect(body.template.name).toBe('neue_anfrage');
    expect(body.template.language.code).toBe('de');

    // Der Platzhalter muss einzeilig sein, sonst weist Meta die Nachricht ab.
    const parameter = body.template.components[0].parameters[0].text;
    expect(parameter).toBe('Frankfurt → München · Porsche 911');
    expect(parameter).not.toMatch(/[\r\n\t]/);
  });

  it('nimmt Vorlagenname, Sprache und API-Version aus der Umgebung', async () => {
    configure();
    process.env.WHATSAPP_TEMPLATE_NAME = 'anfrage_eingegangen';
    process.env.WHATSAPP_TEMPLATE_LOCALE = 'de_DE';
    process.env.WHATSAPP_GRAPH_VERSION = 'v27.0';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ messages: [{ id: 'x' }] }), { status: 200 }));

    await sendWhatsAppNotification('Test');

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/v27.0/');
    const body = JSON.parse(init.body as string);
    expect(body.template.name).toBe('anfrage_eingegangen');
    expect(body.template.language.code).toBe('de_DE');
  });

  it('gibt die Fehlermeldung von Meta samt Code weiter', async () => {
    configure();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'Template name does not exist', code: 132001 } }),
        { status: 400 },
      ),
    );

    const result = await sendWhatsAppNotification('Test');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Template name does not exist');
    expect(result.error).toContain('132001');
  });

  it('meldet einen Fehler statt zu werfen, wenn Meta nicht erreichbar ist', async () => {
    configure();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const result = await sendWhatsAppNotification('Test');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('network down');
  });

  it('kommt mit einer Antwort ohne JSON zurecht', async () => {
    configure();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>502</html>', { status: 502 }));

    const result = await sendWhatsAppNotification('Test');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('502');
  });
});
