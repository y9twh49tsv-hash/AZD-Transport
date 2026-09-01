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
2. [Alles ändern an einer Stelle](#2-alles-ändern-an-einer-stelle)
3. [Lokal starten](#3-lokal-starten)
4. [E-Mail einrichten](#4-e-mail-einrichten)
5. [Deployen](#5-deployen)
6. [Projektstruktur](#6-projektstruktur)
7. [Tests und Qualitätssicherung](#7-tests-und-qualitätssicherung)
8. [Noch offen](#8-noch-offen)

---

## 1. Wie die Seite funktioniert

Sechs öffentliche Seiten, kein Konto, keine Datenbank:

| Adresse | Inhalt |
|---|---|
| `/` | Startseite: Leistungen, Premium-Service, Ablauf, Anfrageformular, Geschäftskunden, FAQ |
| `/anfrage` | dasselbe Formular als eigene Seite — verlinkbar aus Kopfzeile, Handy-Leiste und WhatsApp |
| `/impressum` `/datenschutz` `/agb` `/widerruf` | Rechtstexte |

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

## 2. Alles ändern an einer Stelle

Zwei Dateien, mehr braucht es für Inhalt und Unternehmensangaben nicht:

**`src/config/site.ts`** — Firmierung, Anschrift, Telefon, E-Mail, USt-IdNr.,
Versicherungstext, Einsatzgebiet, optionales Kopfbild.

> Werte, die mit `TODO:` beginnen, sind noch nicht bestätigt. Sie werden auf den
> Rechtsseiten sichtbar als fehlend gekennzeichnet, statt durch eine erfundene
> Angabe ersetzt zu werden — eine Musteradresse im Impressum ist abmahnfähig, und
> eine erfundene Versicherungsaussage ist schlimmer als gar keine. Sobald der
> echte Wert eingetragen ist, verschwindet der Hinweis von selbst.

**`src/config/transfer-content.ts`** — Leistungen, Ablaufschritte, Vorteile für
Geschäftskunden, Gründe, FAQ. Alles als Daten, nicht als JSX: jeder Satz steht
einmal, lässt sich ohne Layoutkenntnisse ändern und taucht automatisch in den
strukturierten Daten (schema.org) auf, statt dort ein zweites Mal getippt zu
werden.

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
│  ├─ (transfer)/         Die öffentlichen Seiten
│  │  ├─ layout.tsx           Kopfzeile, Fußzeile, feste Leiste auf dem Handy
│  │  ├─ page.tsx             Startseite
│  │  ├─ anfrage/             Formularseite + Server Action (actions.ts)
│  │  └─ impressum, datenschutz, agb, widerruf
│  ├─ api/health/         Zustandsprüfung für den Hoster
│  ├─ layout.tsx          <html>, Metadaten, Sprunglink
│  ├─ globals.css         ⭐ der Farbraum und die Bausteine des Designs
│  ├─ error.tsx, not-found.tsx
│  └─ robots.ts, sitemap.ts
├─ components/transfer/   Kopfzeile, Fußzeile, Formular, Rechtsseiten-Bausteine,
│                         strukturierte Daten, feste Handlungsleiste
├─ config/                ⭐ site.ts · transfer-content.ts · routes.ts · app-url.ts
├─ lib/
│  ├─ transfer-request.ts     Zod-Schema der Anfrage
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
  Schema muss seine eigene Ausgabe wieder annehmen) und Honigtopf.
- **`anfrage/actions.test.ts`** — die Server-Action gegen einen ausgetauschten
  Versanddienst. Interessant sind die beiden Fälle, in denen leicht gelogen wird:
  ein ausgefüllter Honigtopf (nach außen ein Erfolg, in Wirklichkeit verworfen)
  und ein fehlender Versanddienst (nach außen ein Fehler, obwohl der Adapter
  „ok" meldet).
- **`site.test.ts`** — dass keine Pflichtangabe offen ist, keine
  Platzhalteradresse zurückkommt und der Versicherungstext keine Deckung
  verspricht.
- **`routes.test.ts`** — hält die Liste der Adressen gegen das Dateisystem. Eine
  neue Seite ohne Eintrag in der Sitemap fällt so beim Testlauf auf und nicht
  erst, wenn sie in keinem Suchergebnis auftaucht.
- **`app-url.test.ts`** — dass aus einer nackten Domain im Hosting-Dashboard eine
  gültige Adresse wird, statt die ganze Seite beim Rendern abstürzen zu lassen.
- **`email.test.ts`** — das Zerlegen und Zusammensetzen der Absenderadresse.

---

## 8. Noch offen

- **AGB und Widerrufsbelehrung** sind sorgfältig verfasst, aber keine
  Rechtsberatung. Vor dem echten Geschäftsbetrieb von einer Anwältin oder einem
  Anwalt prüfen lassen — insbesondere Haftung, Versicherung und Stornierung.
- **Versicherung.** Der Text in `siteConfig.insuranceText` ist bewusst neutral.
  Sobald eine Police vorliegt, wird dort der konkrete Umfang eingetragen — und
  nur dann.
- **USt-IdNr.** Ist `siteConfig.vatId` leer, entfällt der Abschnitt im Impressum;
  § 5 DDG verlangt die Angabe nur, soweit sie existiert.
- **Bilder.** Es liegt keine lizenzierte Automotive-Fotografie im Projekt. Ein
  eigenes Foto lässt sich über `siteConfig.heroImage` einhängen.
