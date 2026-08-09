# MaroCargo

Webplattform für Transporte zwischen **Deutschland 🇩🇪 und Marokko 🇲🇦** — Pakete, Taschen,
Kartons, persönliche Gegenstände und Sperrgut.

Startregion: Frankfurt am Main / Rhein-Main ↔ Nador und Umgebung.

| | |
|---|---|
| **Preis** | 2,00 € pro kg · Mindestpreis 20 € · Abholung +10 € |
| **Sperrgut** | individueller Pauschalpreis nach Fotos und Maßen |
| **Stack** | Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel |

> Die Marke ist austauschbar: alle Namen, Kontaktdaten und das Nummernpräfix stehen zentral in
> `src/config/brand.ts`.

---

## Inhalt

1. [Was die Anwendung kann](#1-was-die-anwendung-kann)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Supabase einrichten](#3-supabase-einrichten)
4. [Lokal starten](#4-lokal-starten)
5. [Admin-Benutzer anlegen](#5-admin-benutzer-anlegen)
6. [Auf Vercel deployen](#6-auf-vercel-deployen)
7. [Domain verbinden](#7-domain-verbinden)
8. [Projektstruktur](#8-projektstruktur)
9. [Sicherheit & Datenschutz](#9-sicherheit--datenschutz)
10. [Anpassen](#10-anpassen)
11. [Tests und Qualitätssicherung](#11-tests-und-qualitätssicherung)
12. [Vor dem echten Geschäftsbetrieb](#12-vor-dem-echten-geschäftsbetrieb)

---

## 1. Was die Anwendung kann

**Für Kundinnen und Kunden**

- Preisrechner mit sofortigem Ergebnis, ohne Anmeldung
- Buchung in vier Schritten, mit sofortiger Sendungsnummer (`MC-260809-0042`)
- Öffentliche Sendungsverfolgung mit vollständigem Verlauf
- Sperrgut-Anfrage mit Foto-Upload direkt vom Handy
- Angebotslink zum Annehmen oder Ablehnen eines Sperrgut-Festpreises
- Optionales Kundenkonto mit allen eigenen Sendungen

**Für das Büro (`/admin`)**

- Übersicht: Sendungen heute, offene Abholungen, unterwegs, in Marokko, Probleme, Umsätze
- Sendungstabelle mit Filtern (Status, Zeitraum, Land, Stadt, bezahlt) und Volltextsuche
- Sendungsdetail: Status ändern, Sicherheitsnummer, Gewicht/Preis, Abholung planen,
  Fahrer zuweisen, Tour zuweisen, Zahlung erfassen, stornieren, Label drucken
- Touren mit Auslastungsanzeige (`760 / 1.200 kg · 63 %`)
- Fahrzeuge, Kunden, Finanzen, Sperrgut-Angebote, Mitarbeiterrollen

**Für Fahrer (`/driver`)**

- Mobile-First-Oberfläche, mit einer Hand bedienbar
- Heutige Abholungen, Sendungen im Fahrzeug, offene Zustellungen
- QR-Code scannen (In-App-Scanner oder Kamera-App des Handys)
- Abholung bestätigen: Gewicht, Stückzahl, Sicherheitsnummer, Foto, Unterschrift
- Zustellnachweis per Foto und Unterschrift

---

## 2. Voraussetzungen

| Werkzeug | Version | Warum |
|---|---|---|
| **Node.js** | 20 oder neuer | Next.js 16 |
| **npm** | kommt mit Node | Paketverwaltung |
| **Git** | aktuell | Code auf GitHub laden |
| **Supabase-Konto** | kostenlos | Datenbank, Login, Dateispeicher |
| **Vercel-Konto** | kostenlos | Hosting |

Node-Version prüfen:

```bash
node -v      # muss v20.x oder höher sein
```

---

## 3. Supabase einrichten

### 3.1 Projekt anlegen

1. Auf [supabase.com](https://supabase.com) anmelden → **New project**.
2. Name z. B. `marocargo`, ein sicheres Datenbank-Passwort setzen (aufschreiben!).
3. **Region: Frankfurt (eu-central-1)** — wichtig für die DSGVO, da du echte Kundendaten
   verarbeitest.
4. Warten, bis das Projekt bereitsteht (1–2 Minuten).

### 3.2 Migrationen ausführen

Im Supabase-Dashboard → **SQL Editor** → **New query**. Führe die fünf Dateien **in dieser
Reihenfolge** aus, jede einzeln (Inhalt einfügen → **Run**):

1. `supabase/migrations/20260809090000_init_schema.sql` — Tabellen, Enums, Indizes
2. `supabase/migrations/20260809091000_functions.sql` — Sendungsnummern, öffentliches Tracking
3. `supabase/migrations/20260809092000_rls.sql` — Row Level Security
4. `supabase/migrations/20260809093000_storage.sql` — Storage-Buckets
5. `supabase/migrations/20260809094000_hardening.sql` — zusätzliche Schutzregeln

Nach Schritt 1 sollte unter **Table Editor** die Tabelle `shipments` sichtbar sein.

> **Mit der Supabase CLI** geht es auch in einem Rutsch:
> ```bash
> npx supabase link --project-ref <deine-project-ref>
> npx supabase db push
> ```

### 3.3 Storage-Buckets prüfen

Migration 4 legt drei **private** Buckets an. Unter **Storage** solltest du sehen:

| Bucket | Inhalt | Öffentlich? |
|---|---|---|
| `shipment-photos` | Abhol- und Zustellfotos, Plombenfotos | **nein** |
| `bulky-photos` | Kundenfotos von Sperrgut | **nein** |
| `signatures` | Unterschriften | **nein** |

Alle drei müssen **privat** bleiben. Der Zugriff läuft ausschließlich über kurzlebige signierte
URLs, die der Server erzeugt.

### 3.4 Authentifizierung konfigurieren

**Authentication → URL Configuration**

- **Site URL**: `http://localhost:3000` (später deine echte Domain)
- **Redirect URLs** — beide eintragen:
  - `http://localhost:3000/auth/callback`
  - `https://deine-domain.de/auth/callback`

**Authentication → Providers → Email**: aktiviert lassen. Für den Start kannst du
„Confirm email“ deaktivieren, damit du dich sofort anmelden kannst — **vor dem Livegang
unbedingt wieder aktivieren**.

### 3.5 Zugangsdaten kopieren

**Project Settings → API**. Du brauchst drei Werte:

| Wert im Dashboard | Environment Variable |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `publishable` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` / `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

⚠ Der `service_role` Key umgeht **alle** Sicherheitsregeln. Er gehört ausschließlich in
serverseitige Environment Variables — nie ins Frontend, nie ins Repository.

### 3.6 Optional: Demodaten laden

Nur für die Entwicklung, **niemals in der Produktionsdatenbank**:

SQL Editor → Inhalt von `supabase/seed.sql` einfügen → **Run**.

Damit hast du acht Beispielsendungen (u. a. `MC-260809-0042`: 25 kg, Frankfurt → Nador, 60 €,
Sicherheitsnummer `SEC-583921`, Status „Unterwegs“), drei Fahrzeuge, drei Touren und zwei
Sperrgut-Anfragen.

---

## 4. Lokal starten

```bash
# 1. Repository holen
git clone <deine-repository-url>
cd AZD-Transport

# 2. Abhängigkeiten installieren
npm install

# 3. Environment-Datei anlegen
cp .env.example .env.local
```

Öffne `.env.local` und trage mindestens diese vier Werte ein:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Entwicklungsserver starten
npm run dev
```

Die Anwendung läuft auf **http://localhost:3000**.

Solange Supabase nicht konfiguriert ist, zeigt die Website einen gelben Hinweis und Buchungen
sind deaktiviert — die Seiten laden aber trotzdem.

---

## 5. Admin-Benutzer anlegen

Rollen werden **niemals** über das Registrierungsformular vergeben. So machst du dich zum Admin:

1. Registriere dich ganz normal auf `http://localhost:3000/registrieren`.
2. Bestätige die E-Mail (oder deaktiviere die Bestätigung wie in 3.4 beschrieben).
3. Supabase → **SQL Editor** → dieses Statement mit deiner Adresse ausführen:

```sql
update public.profiles set role = 'admin'
 where id = (select id from auth.users where email = 'du@example.com');
```

4. Neu laden — unter `/admin` ist jetzt das Dashboard erreichbar.

Weitere Rollen legst du danach bequem unter **Verwaltung → Mitarbeiter** fest, oder per SQL:

```sql
-- Fahrer
update public.profiles set role = 'driver'
 where id = (select id from auth.users where email = 'fahrer@example.com');

-- Büro
update public.profiles set role = 'staff'
 where id = (select id from auth.users where email = 'buero@example.com');
```

| Rolle | Darf |
|---|---|
| `customer` | eigene Sendungen sehen, buchen |
| `driver` | zugewiesene Sendungen sehen, scannen, Status setzen, Fotos hochladen |
| `staff` | gesamtes Dashboard außer Rollenverwaltung und Einstellungen |
| `admin` | alles |

---

## 6. Auf Vercel deployen

### 6.1 Auf GitHub pushen

```bash
git add -A
git commit -m "MaroCargo"
git push -u origin main
```

### 6.2 In Vercel importieren

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Repository auswählen → **Import**
3. Framework wird automatisch als **Next.js** erkannt — nichts ändern
4. **Deploy noch nicht klicken** — erst die Environment Variables setzen

### 6.3 Environment Variables eintragen

Im Import-Bildschirm (oder später unter **Settings → Environment Variables**) für die Umgebungen
**Production**, **Preview** und **Development**:

| Name | Wert | Pflicht |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Projekt-URL aus Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://deine-domain.de` | ✅ |
| `EMAIL_PROVIDER` | `resend` oder `postmark` | empfohlen |
| `EMAIL_API_KEY` | API-Key des Anbieters | empfohlen |
| `EMAIL_FROM` | `MaroCargo <info@deine-domain.de>` | empfohlen |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Cloud API | optional |
| `WHATSAPP_ACCESS_TOKEN` | Meta Cloud API | optional |

> `NEXT_PUBLIC_APP_URL` muss auf die **echte** Domain zeigen. Aus diesem Wert werden die Links
> in E-Mails, die QR-Codes auf den Labels und die Sperrgut-Angebotslinks gebaut.

### 6.4 Deployen

**Deploy** klicken. Der Build läuft ohne besondere Infrastruktur:

```bash
npm run build      # muss lokal fehlerfrei durchlaufen
```

Es gibt keine Schreibzugriffe auf das Dateisystem — alle Uploads gehen direkt in Supabase Storage.

### 6.5 Supabase nachziehen

Nach dem ersten Deployment in Supabase → **Authentication → URL Configuration**:

- **Site URL** auf `https://deine-domain.de` ändern
- `https://deine-domain.de/auth/callback` bei den **Redirect URLs** ergänzen

---

## 7. Domain verbinden

1. Vercel → dein Projekt → **Settings → Domains → Add**
2. Domain eingeben, z. B. `marocargo.de`
3. Vercel zeigt dir die nötigen DNS-Einträge:
   - **A-Record** `@` → `76.76.21.21`, oder
   - **CNAME** `www` → `cname.vercel-dns.com`
4. Einträge bei deinem Domain-Anbieter setzen (DNS-Verbreitung: Minuten bis 48 Stunden)
5. Das TLS-Zertifikat stellt Vercel automatisch aus
6. Danach `NEXT_PUBLIC_APP_URL` auf die neue Domain setzen und **einmal neu deployen**

---

## 8. Projektstruktur

```
src/
├─ app/
│  ├─ (site)/            Öffentliche Website
│  │  ├─ page.tsx            Startseite mit Preisrechner
│  │  ├─ preisrechner/       Rechner mit Beispielen
│  │  ├─ buchen/             Buchung (Server Action in actions.ts)
│  │  ├─ tracking/           Sendungsverfolgung
│  │  ├─ sperrgut/           Sperrgut-Anfrage mit Upload
│  │  ├─ angebot/[token]/    Angebotslink für den Kunden
│  │  ├─ konto/              Kundenkonto
│  │  └─ impressum, datenschutz, agb, …
│  ├─ (auth)/            Login, Registrierung
│  ├─ admin/             Dashboard (nur staff + admin)
│  ├─ driver/            Fahreransicht (nur driver + staff + admin)
│  ├─ scan/[token]/      Ziel jedes QR-Codes
│  └─ auth/callback/     Supabase-Login-Rückleitung
├─ components/           UI-Bausteine
├─ config/               ⭐ brand.ts · pricing.ts · regions.ts · prohibited-items.ts
├─ lib/
│  ├─ pricing.ts             ⭐ die einzige Preisberechnung
│  ├─ shipment-status.ts     Status, Übergänge, Beschriftungen
│  ├─ roles.ts               Berechtigungslogik
│  ├─ auth.ts                Session und Rollen-Guards
│  ├─ tracking.ts            Filterung der öffentlichen Trackingdaten
│  ├─ validation.ts          alle Zod-Schemas
│  ├─ qr.ts, rate-limit.ts, image.ts, utils.ts
│  ├─ notifications/         E-Mail- und WhatsApp-Adapter
│  ├─ supabase/              Browser-, Server- und Service-Role-Client
│  └─ i18n/                  Übersetzungen (aktuell Deutsch)
└─ proxy.ts              Session-Refresh + Schutz der internen Bereiche

supabase/
├─ migrations/           4 SQL-Dateien — die einzige Quelle des Schemas
└─ seed.sql              Demodaten, nur für Entwicklung
```

**Die wichtigsten Dateien**

| Datei | Wofür |
|---|---|
| `src/config/pricing.ts` | Kilopreis, Mindestpreis, Abholpauschale |
| `src/lib/pricing.ts` | die zentrale Preisformel — nirgends sonst wird gerechnet |
| `src/config/regions.ts` | Städte und Länder |
| `src/config/brand.ts` | Name, Kontaktdaten, Nummernpräfix |
| `supabase/migrations/…_rls.sql` | wer welche Daten sehen darf |
| `src/lib/tracking.ts` | was die öffentliche Sendungsverfolgung preisgibt |

---

## 9. Sicherheit & Datenschutz

**Rollen werden dreifach geprüft**

1. `src/proxy.ts` blockt nicht angemeldete Zugriffe auf `/admin`, `/driver`, `/konto`, `/scan`
2. Jede Seite und jede Server Action prüft die Rolle serverseitig (`requireRole`, `assertRole`)
3. Row Level Security prüft sie erneut in der Datenbank

**Preise und Sendungsnummern kommen nie vom Client**

Der Preis wird beim Buchen serverseitig aus `calculatePrice()` neu berechnet. Die Sendungsnummer
erzeugt ein Datenbank-Trigger über einen Zähler mit Zeilensperre — auch bei gleichzeitigen
Buchungen kann keine Nummer doppelt vergeben werden, und kein Client kann sie beeinflussen.

**Öffentliches Tracking zeigt nur unbedenkliche Felder**

Die Datenbankfunktion `get_public_tracking()` gibt eine feste, enge Auswahl zurück, und
`toPublicTracking()` filtert in TypeScript ein zweites Mal. **Nicht** sichtbar sind: Adressen,
Telefonnummern, E-Mail-Adressen, Preise, Zahlungsstatus, interne Notizen und interne IDs.
Dafür gibt es Tests (`src/lib/tracking.test.ts`).

**QR-Codes enthalten keine Kundendaten**

Auf dem Label steht nur ein zufälliger 40-Zeichen-Token, der auf `/scan/<token>` zeigt. Diese
Route funktioniert ausschließlich für angemeldete Fahrer, Mitarbeiter und Admins.

**Dateien liegen in privaten Buckets**

Uploads gehen per signierter URL direkt vom Browser zu Supabase — der Dateiname wird immer
serverseitig zufällig erzeugt. Angezeigt werden Fotos nur über signierte Links mit fünf Minuten
Gültigkeit. Bilder werden vor dem Upload im Browser verkleinert, wobei EXIF-Daten inklusive
GPS-Koordinaten verloren gehen.

**Weiteres**

- Rate Limiting für Tracking-Abfragen, Buchungen, Sperrgut-Anfragen und Uploads
- Trackingverlauf ist unveränderlich (Trigger blockiert UPDATE und DELETE)
- Änderungsprotokoll für Status, Preis, Gewicht, Zahlung, Fahrer und Plomben
- Keine Kundendaten in Anwendungslogs (E-Mail-Adressen werden maskiert)
- Sicherheits-Header (HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy)

---

## 10. Anpassen

### Preise ändern

`src/config/pricing.ts` — alle Beträge in **Cent**:

```ts
pricePerKgCents: 200,     // 2,00 € pro kg
minimumPriceCents: 2000,  // 20,00 € Mindestpreis
pickupFeeCents: 1000,     // 10,00 € Abholung
```

Rechner, Buchung, Dashboard und Fahreransicht übernehmen die Änderung sofort. Vorhandene
Sendungen behalten ihren gebuchten Preis.

### Stadt hinzufügen

`src/config/regions.ts`:

```ts
{ slug: 'koeln', name: 'Köln', country: 'DE', region: 'NRW', active: true },
```

`active: false` zeigt die Stadt mit dem Zusatz „auf Anfrage“ an.

### Marke umbenennen

`src/config/brand.ts` anpassen. Wenn du auch das Nummernpräfix änderst (`MC` → z. B. `AZ`),
zusätzlich in Supabase:

```sql
update public.app_settings set tracking_prefix = 'AZ';
```

Bereits vergebene Nummern bleiben unverändert — das ist beabsichtigt.

### Verbotene Waren pflegen

`src/config/prohibited-items.ts`. Die Liste erscheint im Buchungsformular und auf
`/verbotene-waren`.

### Weitere Sprache ergänzen

`src/lib/i18n/dictionaries/de.ts` kopieren, übersetzen und in `src/lib/i18n/index.ts`
registrieren.

---

## 11. Tests und Qualitätssicherung

```bash
npm run test        # Vitest — 78 Tests
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run build       # Produktionsbuild
npm run test:db     # Datenbankprüfungen (optional, siehe unten)
```

Getestet werden die Teile, bei denen ein Fehler Geld oder Vertrauen kostet:

| Bereich | Was geprüft wird |
|---|---|
| Preisberechnung | Mindestpreis, Kilopreis, Abholpauschale, alle Beispiele aus der Spezifikation, Rundung, ungültige Eingaben |
| Statusübergänge | kein Rückwärtsgehen, keine Änderung nach Zustellung/Storno, Ausnahmen |
| Tracking-Filterung | dass keine Adresse, Telefonnummer, E-Mail oder Preis nach außen gelangt |
| Berechtigungen | dass Kunden nichts Internes sehen und deaktivierte Konten keine Rechte haben |
| Eingabevalidierung | Telefonnummern, E-Mails, Städte, Dateitypen, Dateigrößen |

### Datenbankprüfungen

`npm run test:db` legt eine Wegwerf-Datenbank an, spielt alle Migrationen und die Seed-Daten
ein und prüft anschließend die Zusagen, auf die sich die Anwendung verlässt:

- Sendungsnummern haben das richtige Format, sind fortlaufend und eindeutig
- weder Sendungsnummer noch QR-Token lassen sich vom Client bestimmen oder nachträglich ändern
- die Trackinghistorie kann nicht verändert oder gelöscht werden
- die öffentliche Trackingfunktion gibt ausschließlich die 16 freigegebenen Felder zurück
- ein Kunde sieht ausschließlich seine eigenen Sendungen, anonyme Zugriffe sehen gar nichts
- niemand kann sich selbst zum Admin machen oder ein deaktiviertes Konto reaktivieren
- Preis-, Status- und Routenänderungen landen im Änderungsprotokoll
- alle Storage-Buckets sind privat und auf allen Tabellen ist RLS aktiv

Voraussetzung ist ein lokal laufender PostgreSQL-Server (Version 15 oder neuer):

```bash
PGHOST=/tmp PGPORT=5433 npm run test:db
```

Das Skript fasst dein Supabase-Projekt nicht an — es arbeitet ausschließlich in einer
Datenbank namens `marocargo_test`.

---

## 12. Vor dem echten Geschäftsbetrieb

Die Software ist fertig. Diese Punkte sind **geschäftlich und rechtlich** noch offen:

**Rechtlich — die Seiten sind ausdrücklich als Platzhalter gekennzeichnet**

- [ ] Impressum vervollständigen (Inhaber, USt-IdNr. bzw. § 19 UStG, ggf. Registereintrag)
- [ ] AGB, Versandbedingungen und Haftungsseite anwaltlich prüfen lassen
- [ ] Widerrufsbelehrung für Verbraucher ergänzen
- [ ] Liste der verbotenen Waren zoll- und gefahrgutrechtlich prüfen lassen
      (deutsche Ausfuhr, marokkanische ADII, ADR)
- [ ] Datenschutzerklärung an die tatsächlich eingesetzten Dienstleister anpassen

**Genehmigungen und Versicherung**

- [ ] Erlaubnis nach § 3 GüKG bzw. EU-Gemeinschaftslizenz klären
- [ ] Verkehrshaftungsversicherung abschließen, Haftungshöchstbetrag festlegen und eintragen
- [ ] Betriebshaftpflicht prüfen

**Datenschutz**

- [ ] Auftragsverarbeitungsverträge mit Supabase, Vercel und dem E-Mail-Anbieter abschließen
- [ ] Supabase-Region auf EU (Frankfurt) prüfen
- [ ] Löschkonzept festlegen (Aufbewahrungsfristen, Fotos aus nicht angenommenen Anfragen)
- [ ] Verzeichnis von Verarbeitungstätigkeiten anlegen

**Betrieb**

- [ ] E-Mail-Versand konfigurieren und Absenderdomain verifizieren (SPF, DKIM)
- [ ] „Confirm email“ in Supabase wieder aktivieren
- [ ] Seed-Daten **nicht** in die Produktionsdatenbank laden
- [ ] Datenbank-Backups in Supabase prüfen
- [ ] Realistische Laufzeiten in den AGB eintragen
- [ ] Ablauf und Preise für Zollabgaben festlegen

---

**Lizenz:** privates Projekt.
