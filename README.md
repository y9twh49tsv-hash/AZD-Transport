# AZD Transport

Website für **Premium-Fahrzeugüberführungen auf eigener Achse** — deutschlandweit,
auf Anfrage europaweit.

PKW, SUV, Sportwagen, Luxusfahrzeuge und Transporter bis 3,5 t. Das Fahrzeug wird
gefahren, nicht auf einen Anhänger oder Autotransporter geladen.

| | |
|---|---|
| **Adresse** | https://www.azd-transport.com |
| **Stack** | Next.js 16 (App Router) · TypeScript · Tailwind CSS |
| **Hosting** | Railway (Docker) oder Vercel — beides vorbereitet |
| **Datenbank** | keine |

---

## Inhalt

1. [Wie die Seite funktioniert](#1-wie-die-seite-funktioniert)
1a. [Zwei Sprachen](#1a-zwei-sprachen)
2. [Alles ändern an einer Stelle](#2-alles-ändern-an-einer-stelle)
3. [Lokal starten](#3-lokal-starten)
4. [E-Mail einrichten](#4-e-mail-einrichten)
4a. [WhatsApp: Anfragen automatisch aufs Handy](#4a-whatsapp-anfragen-automatisch-aufs-handy)
5. [Deployen](#5-deployen)
6. [Projektstruktur](#6-projektstruktur)
7. [Tests und Qualitätssicherung](#7-tests-und-qualitätssicherung)
8. [Noch offen](#8-noch-offen)

---

## 1. Wie die Seite funktioniert

Sieben öffentliche Seiten, jede in zwei Sprachen, kein Konto, keine Datenbank:

| Deutsch | Englisch | Inhalt |
|---|---|---|
| `/` | `/en` | Startseite: Leistungen, Premium-Service, Ablauf, Anfrageformular, Geschäftskunden, FAQ |
| `/anfrage` | `/en/request` | dasselbe Formular als eigene Seite — verlinkbar aus Kopfzeile, Handy-Leiste und WhatsApp |
| `/impressum` | `/en/imprint` | Anbieterkennzeichnung nach § 5 DDG |
| `/datenschutz` | `/en/privacy` | Datenschutzerklärung |
| `/cookies` | `/en/cookies` | Cookies & Tracking (es gibt keine) |
| `/agb` | `/en/terms` | Allgemeine Geschäftsbedingungen |
| `/widerruf` | `/en/withdrawal` | Widerrufsbelehrung + Muster-Formular |

**Der Anfrageweg.** Das Formular wird im Browser geprüft, ein zweites Mal auf dem
Server, und dann als E-Mail an den Betrieb geschickt. Es gibt bewusst keine
Datenbank: eine Anfrage ist eine Nachricht, kein Auftrag — Name, Telefonnummer
und Adressdaten dauerhaft zu speichern, bevor überhaupt ein Vertrag zustande
kommt, wäre mehr Datenhaltung als nötig.

Pflicht sind nur Abholort, Zielort, Name und eine Kontaktmöglichkeit. Jedes
zusätzliche Pflichtfeld kostet Anfragen, gerade auf dem Handy.

**Kein automatischer Preis.** Jede Überführung wird von Hand kalkuliert. Die
Seite verspricht deshalb nirgends eine Zahl, sondern ein Festpreisangebot nach
Prüfung der Angaben.

**Wenn der Versand nicht eingerichtet ist**, meldet das Formular einen Fehler und
verweist auf Telefon und WhatsApp — statt einen Erfolg vorzutäuschen, bei dem
niemand die Anfrage je liest. `/api/health` zeigt den Zustand an.

---

## 1a. Zwei Sprachen

Deutsch liegt ohne Präfix auf der Wurzel, Englisch unter `/en` mit übersetzten
Adressen. Kein Präfix für Deutsch, weil das der Hauptmarkt ist und die Adressen
bereits im Umlauf sind; übersetzte Adressen für Englisch, weil `/en/impressum`
kein englischsprachiger Sucher findet.

**Die Sprache steht in der Adresse — nicht in einem Cookie.** Es gibt keine
automatische Weiterleitung nach Browsersprache und nichts, was sich eine Wahl
merkt. Wer `/agb` aufruft, bekommt `/agb`; der Umschalter oben rechts (und
unten in der Fußzeile) führt auf das Gegenstück derselben Seite, nicht auf die
Startseite der anderen Sprache.

**Technisch** sind es zwei Wurzellayouts — `app/(de)/layout.tsx` und
`app/(en)/layout.tsx` —, damit jede Fassung ihr eigenes `<html lang>` trägt.
Preis dieser Lösung: der Sprachwechsel lädt die Seite vollständig neu. Bei zwei
Sprachen und einem Wechsel pro Besuch ist das nicht der Rede wert.

> **Die deutsche Fassung ist die verbindliche.** Die englischen Rechtstexte sind
> Übersetzungen zum leichteren Verständnis und sagen das auch: über jedem steht
> ein Hinweis. Eine übersetzte AGB übersetzt nicht die Rechtsordnung, für die sie
> geschrieben wurde.

Eine neue Seite braucht drei Dinge: einen Eintrag in `PAGES`
(`src/content/index.ts`), je eine `page.tsx` unter `app/(de)/…` und
`app/(en)/en/…`, und den Text in beiden Sprachmodulen. Fehlt eines davon,
schlägt `npm test` fehl — `content.test.ts` hält `PAGES` gegen das Dateisystem.

---

## 2. Alles ändern an einer Stelle

Drei Stellen, mehr braucht es für Inhalt und Unternehmensangaben nicht:

**`src/config/site.ts`** — Firmierung, Anschrift, Telefon, E-Mail, USt-IdNr.,
optionales Kopfbild. Nur, was in jeder Sprache gleich ist: eine Anschrift wird
nicht übersetzt.

> Werte, die mit `TODO:` beginnen, sind noch nicht bestätigt. Sie werden auf den
> Rechtsseiten sichtbar als fehlend gekennzeichnet, statt durch eine erfundene
> Angabe ersetzt zu werden — eine Musteradresse im Impressum ist abmahnfähig, und
> eine erfundene Versicherungsaussage ist schlimmer als gar keine. Sobald der
> echte Wert eingetragen ist, verschwindet der Hinweis von selbst.

**`src/content/de.ts`** und **`src/content/en.ts`** — jeder Satz der Website:
Leistungen, Ablaufschritte, FAQ, Formularbeschriftungen, Fehlermeldungen,
Einsatzgebiet, Versicherungstext. Alles als Daten, nicht als JSX: jeder Satz
steht einmal, lässt sich ohne Layoutkenntnisse ändern und taucht automatisch in
den strukturierten Daten (schema.org) auf, statt dort ein zweites Mal getippt zu
werden. Die Rechtstexte liegen daneben in `src/content/legal/`.

> `en.ts` ist als `Content` deklariert und muss dieselbe Form erfüllen wie
> `de.ts`. Ein vergessenes Feld ist damit ein Compilerfehler und keine Lücke, die
> erst auf der fertigen Seite auffällt. In einer früheren Fassung dieses Projekts
> gab das Wörterbuch bei einem unbekannten Schlüssel den Schlüssel selbst zurück;
> auf der Startseite stand daraufhin in der Produktion „Deine Pakete sicher von
> home.countryFrom nach home.countryTo". Typprüfung, Build und alle Tests waren
> grün.

Ein **eigenes Kopfbild** kommt nach `public/`, der Pfad in `siteConfig.heroImage`
(z. B. `/hero.jpg`). Querformat, mindestens 2000 px breit. Bleibt der Wert leer,
trägt der Kopfbereich typografisch — was nebenbei sehr schnell lädt.

---

## 3. Lokal starten

```bash
npm install
cp .env.example .env.local     # Werte eintragen (siehe unten)
npm run dev                    # http://localhost:3000
```

Ohne jede Umgebungsvariable läuft die Seite vollständig — nur der E-Mail-Versand
fehlt dann, und das Formular sagt das auch.

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Vitest
npm run build       # Production-Build
```

---

## 4. E-Mail einrichten

Nötig sind drei Werte in `.env.local` bzw. in den Variablen des Hosters:

```
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_…
EMAIL_FROM=AZD Transport <info@azd-transport.com>
```

⚠ Die Domain in `EMAIL_FROM` muss dir gehören und beim Anbieter per DNS-Eintrag
verifiziert sein. Eine Freemail-Adresse (`@outlook.com`, `@gmail.com`, `@web.de`,
`@gmx.de` …) funktioniert **nicht**: diese Domains gehören Microsoft, Google und
Co., du kannst sie nicht verifizieren, und jeder Versand scheitert.

Optional:

- `EMAIL_REPLY_TO` — wohin Antworten gehen, wenn die Anfrage keine E-Mail-Adresse
  enthält. Hier darf eine Freemail-Adresse stehen.
- `REQUEST_INBOX` — wohin die Anfragen zugestellt werden. Leer = der Wert aus
  `site.ts`.

Prüfen: `/api/health` meldet `email.sending: true`, sobald alles stimmt, und
benennt sonst das konkrete Problem — ohne je einen Schlüssel auszugeben.

---

## 4a. WhatsApp: Anfragen automatisch aufs Handy

Ohne Einrichtung nutzt die Seite kostenlose `wa.me`-Links: der Kunde füllt das
Formular aus, tippt auf „Anfrage per WhatsApp senden" und drückt in WhatsApp
einmal auf Senden. Das funktioniert sofort und ohne Vertrag.

Mit der **Meta Cloud API** schickt zusätzlich der Server jede Anfrage von
selbst — auch die vom Kunden, der das Formular abschickt und dann doch nicht
auf Senden tippt.

### Der Aufbau, für den das gedacht ist

| Nummer | Rolle |
|---|---|
| die bekannte Kundennummer | bleibt in der WhatsApp Business App auf dem Handy. Die `wa.me`-Links zeigen dorthin, Kunden schreiben, man antwortet normal. **Empfängt** die Meldungen. |
| eine zweite Nummer | liegt in der Cloud API und **verschickt** die Meldungen. Kunden sehen sie nie. |

⚠ Eine Nummer in der Cloud API ist eine reine Servernummer — sie lässt sich
nicht mehr in der WhatsApp-App benutzen, und sie darf dort auch vorher nie
registriert gewesen sein.

### Die Nachrichtenvorlage

Eine Nachricht, die der Betrieb beginnt, verlangt außerhalb eines laufenden
Chatfensters eine von Meta genehmigte Vorlage. Anzulegen im WhatsApp Manager
unter *Message Templates*, Kategorie **Utility**, Sprache **Deutsch**:

```
Name:  neue_anfrage
Text:  Neue Anfrage über die Website: {{1}}
```

> Die **Vorlage** bleibt deutsch, der **Platzhalter** nicht: eine englische
> Anfrage füllt ihn mit „60311 Frankfurt → 80331 Munich · …". Meta prüft nur den
> Vorlagentext gegen die angegebene Sprache, nicht den eingesetzten Wert. Eine
> zweite Vorlage braucht es also nicht — und die englischen Wörter in der Meldung
> sagen nebenbei, in welcher Sprache geantwortet werden will.

Genau ein Platzhalter, und der Platzhalter darf **keine Zeilenumbrüche**
enthalten — Meta lehnt sie mit Fehler 132000 ab, ohne zu sagen welcher
Platzhalter schuld war. `buildRequestLine()` erzeugt deshalb eine Zeile:

```
60311 Frankfurt am Main → 80331 München · Mercedes-AMG GT 63 S · 15.10.2026 · Max Mustermann · 0170 1234567
```

Strecke zuerst: auf dem Sperrbildschirm sind zwei Zeilen sichtbar, und die
Frage „hinfahren oder nicht" steht vorne.

### Einrichten

Vier Werte, alle in `.env.example` beschrieben:

```
WHATSAPP_PHONE_NUMBER_ID=   # aus dem API-Setup, NICHT die Telefonnummer
WHATSAPP_ACCESS_TOKEN=      # dauerhafter Schlüssel eines Systembenutzers
WHATSAPP_TEMPLATE_NAME=neue_anfrage
OPERATOR_WHATSAPP=          # wohin die Meldung geht; leer = Nummer aus site.ts
```

Prüfen: `/api/health` meldet `whatsapp.sending: true`, sobald alles stimmt, und
benennt sonst das konkrete Problem — ohne je einen Schlüssel auszugeben. Der
häufigste Fehler ist die Telefonnummer an der Stelle der Phone Number ID;
darauf weist der Endpunkt eigens hin.

**Ein Weg genügt.** Kommt die Anfrage per E-Mail an, aber WhatsApp klemmt (oder
umgekehrt), gilt sie als zugestellt. Erst wenn beide Wege scheitern, bekommt
der Kunde einen Fehler zu sehen.

---

## 5. Deployen

**Railway** liest `railway.toml` und baut über das `Dockerfile`. Zur Bauzeit wird
nur eine Variable gebraucht: `NEXT_PUBLIC_APP_URL`. Alles Weitere (die
E-Mail-Werte) wird zur Laufzeit gelesen — Geheimnisse gehören nicht in eine
Image-Schicht.

**Vercel** braucht keine Konfiguration über `vercel.json` hinaus.

**Domain.** Setze `NEXT_PUBLIC_APP_URL` auf genau den Hostnamen, unter dem die
Seite laufen soll (mit oder ohne `www`). `src/proxy.ts` leitet die jeweils andere
Variante mit 308 dorthin um, damit es nicht zwei Adressen mit demselben Inhalt
gibt. Bei Cloudflare muss der DNS-Eintrag auf **DNS only** stehen (graue Wolke) —
mit „proxied" (orange) endet die Anfrage vorher mit 502 und der Code läuft nie.

---

## 6. Projektstruktur

```
src/
├─ app/
│  ├─ (de)/               Die deutschen Adressen — Wurzellayout mit lang="de"
│  │  ├─ layout.tsx           <html>, Metadaten, Kopf- und Fußzeile
│  │  ├─ page.tsx             /
│  │  ├─ anfrage/             /anfrage
│  │  ├─ impressum, datenschutz, cookies, agb, widerruf
│  │  └─ error.tsx, not-found.tsx
│  ├─ (en)/en/            Dieselben Seiten unter /en — Wurzellayout mit lang="en"
│  ├─ api/health/         Zustandsprüfung für den Hoster
│  ├─ global-not-found.tsx    404 für unbekannte Adressen, zweisprachig
│  ├─ global-error.tsx        Fehler im Wurzellayout selbst
│  ├─ globals.css         ⭐ der Farbraum und die Bausteine des Designs
│  └─ robots.ts, sitemap.ts
├─ content/               ⭐ de.ts · en.ts · legal/ · index.ts (PAGES, Adressen)
├─ components/transfer/   Startseite, Anfrageseite, Rechtsseiten, Kopf- und
│                         Fußzeile, Formular, Sprachumschalter — alle nehmen
│                         `locale` entgegen und gibt es deshalb nur einmal
├─ config/                ⭐ site.ts · app-url.ts
├─ lib/
│  ├─ transfer-request.ts     Zod-Schema der Anfrage (je Sprache)
│  ├─ metadata.ts             Titel, canonical, hreflang
│  ├─ actions/                Server Action für die Anfrage
│  ├─ notifications/email.ts  E-Mail-Adapter (Resend, Postmark, Protokoll)
│  └─ utils.ts
└─ proxy.ts               Weiterleitung auf den einen Hostnamen

Dockerfile                Container-Build für Railway (und jeden Docker-Host)
railway.toml              Railway: Docker-Builder + Healthcheck
```

---

## 7. Tests und Qualitätssicherung

`npm test` deckt die Stellen ab, an denen ein Fehler nicht auffallen würde:

- **`transfer-request.test.ts`** — das Anfrageschema, inklusive Rundlauf (das
  Schema muss seine eigene Ausgabe wieder annehmen), Honigtopf und die
  Sprachfassungen: dieselben Regeln, übersetzte Meldungen, unveränderte Werte.
- **`content.test.ts`** — der wichtigste Test der Zweisprachigkeit. Er hält
  `PAGES` gegen das Dateisystem (eine Seite ohne Eintrag in der Sitemap fällt so
  beim Testlauf auf und nicht erst, wenn sie in keinem Suchergebnis auftaucht),
  vergleicht die Gliederung beider Sprachen Feld für Feld, prüft, dass der
  Umschalter in beide Richtungen auf das richtige Gegenstück führt, dass kein
  Platzhalter ungefüllt bleibt und dass keine Übersetzung in Wirklichkeit der
  deutsche Text ist.
- **`actions/transfer-request.test.ts`** — die Server-Action gegen einen ausgetauschten
  Versanddienst. Interessant sind die beiden Fälle, in denen leicht gelogen wird:
  ein ausgefüllter Honigtopf (nach außen ein Erfolg, in Wirklichkeit verworfen)
  und ein fehlender Versanddienst (nach außen ein Fehler, obwohl der Adapter
  „ok" meldet).
- **`site.test.ts`** — dass keine Pflichtangabe offen ist, keine
  Platzhalteradresse zurückkommt und die WhatsApp-Nummer im Format steht, das
  wa.me versteht. Dass der Versicherungstext keine Deckung verspricht, prüft
  `content.test.ts` — in beiden Sprachen.
- **`app-url.test.ts`** — dass aus einer nackten Domain im Hosting-Dashboard eine
  gültige Adresse wird, statt die ganze Seite beim Rendern abstürzen zu lassen.
- **`email.test.ts`** — das Zerlegen und Zusammensetzen der Absenderadresse.

---

## 8. Noch offen

- **AGB und Widerrufsbelehrung** sind sorgfältig verfasst, aber keine
  Rechtsberatung. Vor dem echten Geschäftsbetrieb von einer Anwältin oder einem
  Anwalt prüfen lassen — insbesondere Haftung, Versicherung und Stornierung.
- **Versicherung.** Der Text in `content.company.insuranceText` (je Sprache) ist
  bewusst neutral.
  Sobald eine Police vorliegt, wird dort der konkrete Umfang eingetragen — und
  nur dann.
- **USt-IdNr.** Ist `siteConfig.vatId` leer, entfällt der Abschnitt im Impressum;
  § 5 DDG verlangt die Angabe nur, soweit sie existiert.
- **Bilder.** Es liegt keine lizenzierte Automotive-Fotografie im Projekt. Ein
  eigenes Foto lässt sich über `siteConfig.heroImage` einhängen.
