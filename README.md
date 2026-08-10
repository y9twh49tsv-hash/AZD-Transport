# MaroCargo

Webplattform für Transporte zwischen **Deutschland 🇩🇪 und Marokko 🇲🇦** — Pakete, Taschen,
Kartons, persönliche Gegenstände und Sperrgut.

Startregion: Frankfurt am Main / Rhein-Main ↔ Nador und Umgebung.

| | |
|---|---|
| **Preis** | 2,00 € pro kg · Mindestpreis 20 € · Abholung +10 € |
| **Sperrgut** | individueller Pauschalpreis nach Fotos und Maßen |
| **Stack** | Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase |
| **Hosting** | Railway (Docker) oder Vercel — beides vorbereitet |

> Die Marke ist austauschbar: alle Namen, Kontaktdaten und das Nummernpräfix stehen zentral in
> `src/config/brand.ts`.

---

## Inhalt

1. [Was die Anwendung kann](#1-was-die-anwendung-kann)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Supabase einrichten](#3-supabase-einrichten)
4. [Lokal starten](#4-lokal-starten)
5. [Admin-Benutzer anlegen](#5-admin-benutzer-anlegen)
6. [Auf Railway deployen](#6-auf-railway-deployen)
7. [Alternative: Vercel](#7-alternative-vercel)
8. [Domain verbinden](#8-domain-verbinden)
9. [Projektstruktur](#9-projektstruktur)
10. [Sicherheit & Datenschutz](#10-sicherheit--datenschutz)
11. [Anpassen](#11-anpassen)
12. [Tests und Qualitätssicherung](#12-tests-und-qualitätssicherung)
13. [Vor dem echten Geschäftsbetrieb](#13-vor-dem-echten-geschäftsbetrieb)

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
| **Railway- oder Vercel-Konto** | kostenlos zum Start | Hosting |

Node-Version prüfen:

```bash
node -v      # muss v20.x oder höher sein
```

---

## 3. Supabase einrichten

### 3.1 Projekt anlegen

1. Auf [supabase.com](https://supabase.com) anmelden → **New project**.
2. Name z. B. `marocargo`, ein sicheres Datenbank-Passwort setzen (aufschreiben!).
3. **Region: Central EU (Frankfurt), `eu-central-1`** — wichtig für die DSGVO, da du echte
   Namen, Adressen und Telefonnummern verarbeitest. **Die Region lässt sich nachträglich
   nicht ändern**, ein Wechsel bedeutet später einen Umzug mit echten Kundendaten. Achte
   besonders darauf, nicht versehentlich *West EU (London)* zu nehmen: Großbritannien ist
   seit dem Brexit ein Drittland, und der Angemessenheitsbeschluss der EU, auf dem die
   Übermittlung dorthin beruht, muss regelmäßig verlängert werden.
4. Warten, bis das Projekt bereitsteht (1–2 Minuten).

> **Nimm ein frisches Projekt, kein bereits benutztes.** Die Migrationen legen Typen wie
> `user_role` und Tabellen wie `profiles` oder `customers` an — Namen, die eine andere
> Anwendung mit hoher Wahrscheinlichkeit schon vergeben hat. `setup.sql` bricht dann gleich
> am Anfang ab (`type "user_role" already exists`), und der einzige Ausweg wäre, das Schema
> der anderen Anwendung zu löschen. Ein zweites Projekt kostet nichts.

### 3.2 Migrationen ausführen

**Der einfache Weg (empfohlen):** Im Supabase-Dashboard → **SQL Editor** → **New query**.
Den kompletten Inhalt von `supabase/setup.sql` einfügen → **Run**. Das ist genau die
Aneinanderreihung aller fünf Migrationen und läuft in einem Durchgang durch.

Danach sollte unter **Table Editor** die Tabelle `shipments` sichtbar sein.

<details>
<summary>Alternative: die fünf Migrationen einzeln ausführen</summary>

Inhalt einfügen → **Run**, in **dieser Reihenfolge**:

1. `supabase/migrations/20260809090000_init_schema.sql` — Tabellen, Enums, Indizes
2. `supabase/migrations/20260809091000_functions.sql` — Sendungsnummern, öffentliches Tracking
3. `supabase/migrations/20260809092000_rls.sql` — Row Level Security
4. `supabase/migrations/20260809093000_storage.sql` — Storage-Buckets
5. `supabase/migrations/20260809094000_hardening.sql` — zusätzliche Schutzregeln

Oder mit der Supabase CLI:
```bash
npx supabase link --project-ref <deine-project-ref>
npx supabase db push
```
</details>

> Die Migrationsdateien bleiben die maßgebliche Quelle. `supabase/setup.sql` wird daraus
> erzeugt — nach einer Änderung an einer Migration `npm run build:setup-sql` ausführen.

**Kontrolle:** `supabase/check.sql` im SQL Editor ausführen. Es liest nur und zeigt eine
Tabelle, in der in der Spalte `ok` überall `true` stehen muss.

**Wenn `setup.sql` mit einem Fehler abbricht** wie `type "user_role" already exists` oder
`relation "shipments" already exists`, ist aus einem früheren Versuch noch etwas übrig.
Dann erst `supabase/reset.sql` ausführen (löscht alles, was zu MaroCargo gehört) und
danach `setup.sql` erneut. ⚠️ `reset.sql` löscht alle Sendungen und Kunden — nur
benutzen, solange noch keine echten Daten drin sind.

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

## 6. Auf Railway deployen

Railway baut das mitgelieferte `Dockerfile` (festgelegt in `railway.toml`). Der Container läuft
als Nicht-Root-Benutzer und enthält nur die Laufzeit — kein Quellcode, keine Dev-Abhängigkeiten.

### 6.1 Projekt anlegen

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Repository auswählen, Branch `claude/marocargo-logistics-platform-f7hscf` (oder `main`)
3. Railway erkennt `railway.toml` und baut mit Docker — Build Command musst du nicht setzen

### 6.2 Variablen setzen

**Variables → Raw Editor**, diesen Block einfügen und die Werte ersetzen:

```
NEXT_PUBLIC_SUPABASE_URL=https://DEINPROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=DEIN_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY
```

Das genügt für den Start. **`NEXT_PUBLIC_APP_URL` brauchst du zunächst nicht** — die App liest
Railways `RAILWAY_PUBLIC_DOMAIN` und baut Links, QR-Codes und E-Mails daraus automatisch richtig.
Setze die Variable erst, wenn du eine eigene Domain hast.

> **Warum die Reihenfolge zählt:** `NEXT_PUBLIC_*` wird beim **Build** fest in den Browser-Code
> eingebaut, nicht zur Laufzeit gelesen. Trägst du sie später nach, musst du **neu deployen**.
> Für `SUPABASE_SERVICE_ROLE_KEY` gilt das nicht — der wird nur zur Laufzeit auf dem Server
> gelesen und landet bewusst nie im Image.

### 6.3 Domain erzeugen

**Settings → Networking → Generate Domain**. Du bekommst z. B.
`marocargo-production.up.railway.app`. Einen Port musst du nicht angeben — Railway setzt `PORT`,
der Container übernimmt ihn.

### 6.4 Supabase nachziehen

Supabase → **Authentication → URL Configuration**:

- **Site URL**: deine Railway-Domain
- **Redirect URLs**: `https://DEINE-RAILWAY-DOMAIN/auth/callback`

Ohne diesen Schritt funktioniert die Anmeldung nicht — der Bestätigungslink läuft ins Leere.

### 6.5 Prüfen, ob alles steht

```bash
curl https://DEINE-RAILWAY-DOMAIN/api/health
```

Erwartete Antwort:

```json
{"status":"ok","configured":true,"commit":"de35518","publicUrl":"https://…","timestamp":"..."}
```

`"configured": false` heißt: die Supabase-Variablen fehlen oder es wurde seit dem Eintragen nicht
neu deployt. Genau diesen Pfad nutzt auch Railways Healthcheck (`/api/health`) — er fragt
absichtlich **nicht** die Datenbank ab, damit eine Supabase-Störung keinen Neustart-Kreislauf
auslöst.

`commit` zeigt, welcher Stand tatsächlich läuft, und `publicUrl`, welche Adresse die App für
QR-Codes und E-Mail-Links verwendet. Nach jeder Änderung an den Variablen ist das die schnellste
Kontrolle, ob der neue Build wirklich draußen ist — steht dort noch der alte Commit, läuft auch
noch der alte Container.

### 6.6 Lokal mit Docker testen

Der identische Build, den Railway ausführt:

```bash
docker build -t marocargo \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://DEINPROJEKT.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=DEIN_ANON_KEY \
  .

docker run -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY \
  marocargo
```

### 6.7 Wenn etwas nicht läuft

| Symptom | Ursache |
|---|---|
| Gelber Hinweis „Supabase ist nicht konfiguriert" | Variablen fehlen oder es wurde nach dem Eintragen nicht neu deployt. `NEXT_PUBLIC_*` wirkt erst nach einem neuen Build. |
| Healthcheck schlägt fehl, Deploy bleibt hängen | Container startet nicht. Deploy-Logs prüfen — meist ein fehlendes `SUPABASE_SERVICE_ROLE_KEY` in einem Server-Pfad. |
| QR-Codes/E-Mail-Links zeigen auf `localhost:3000` | Weder `NEXT_PUBLIC_APP_URL` gesetzt noch `RAILWAY_PUBLIC_DOMAIN` vorhanden. Domain erzeugen und neu deployen. |
| Anmeldung leitet ins Leere | Redirect-URL in Supabase fehlt (Schritt 6.4). |

---

## 7. Alternative: Vercel

### 7.1 Auf GitHub pushen

```bash
git add -A
git commit -m "MaroCargo"
git push -u origin main
```

### 7.2 In Vercel importieren

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Repository auswählen → **Import**
3. **Framework Preset** muss **Next.js** sein. Steht dort „Other", schlägt der Build
   am Ende mit `No Output Directory named "public" found` fehl — Vercel sucht dann eine
   statische Website statt der Next.js-Ausgabe. Das mitgelieferte `vercel.json` setzt das
   Preset bereits, du kannst es zusätzlich im Dashboard prüfen.
4. **Deploy noch nicht klicken** — erst die Environment Variables setzen

### 7.3 Environment Variables eintragen

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

### 7.4 Deployen

**Deploy** klicken. Der Build läuft ohne besondere Infrastruktur:

```bash
npm run build      # muss lokal fehlerfrei durchlaufen
```

Es gibt keine Schreibzugriffe auf das Dateisystem — alle Uploads gehen direkt in Supabase Storage.

### 7.5 Wenn der Build fehlschlägt

| Fehlermeldung | Ursache und Lösung |
|---|---|
| `No Output Directory named "public" found` | Framework Preset steht auf „Other". `vercel.json` mit `"framework": "nextjs"` behebt das; alternativ im Dashboard unter **Settings → Build & Deployment → Framework Preset** auf **Next.js** stellen und neu deployen. |
| `Supabase ist nicht konfiguriert` zur Laufzeit | Die drei Supabase-Variablen fehlen für die betroffene Umgebung (Production, Preview oder Development). Nach dem Nachtragen **neu deployen** — Environment Variables werden beim Build eingebacken. |
| Links in E-Mails zeigen auf `localhost` | `NEXT_PUBLIC_APP_URL` steht noch auf dem lokalen Wert. Auf die echte Domain setzen und neu deployen. |

### 7.6 Supabase nachziehen

Nach dem ersten Deployment in Supabase → **Authentication → URL Configuration**:

- **Site URL** auf `https://deine-domain.de` ändern
- `https://deine-domain.de/auth/callback` bei den **Redirect URLs** ergänzen

---

## 8. Domain verbinden

### Railway

1. **Settings → Networking → Custom Domain** → deine Domain eintragen, z. B. `marocargo.de`
2. Railway zeigt einen **CNAME**-Eintrag, den du beim Domain-Anbieter setzt
3. Das TLS-Zertifikat stellt Railway automatisch aus
4. Danach `NEXT_PUBLIC_APP_URL=https://marocargo.de` als Variable setzen und **neu deployen** —
   sonst zeigen QR-Codes und E-Mail-Links weiter auf die `.up.railway.app`-Adresse
5. In Supabase die neue Domain bei **Site URL** und **Redirect URLs** ergänzen

### Vercel

1. **Settings → Domains → Add** → Domain eintragen
2. Vercel zeigt die nötigen DNS-Einträge (A-Record `@` → `76.76.21.21` oder CNAME `www`)
3. Zertifikat kommt automatisch
4. `NEXT_PUBLIC_APP_URL` auf die neue Domain setzen und einmal neu deployen
5. Domain in Supabase bei **Site URL** und **Redirect URLs** ergänzen

## 9. Projektstruktur

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
├─ migrations/           5 SQL-Dateien — die einzige Quelle des Schemas
├─ setup.sql             alle Migrationen in einer Datei (aus migrations/ erzeugt)
├─ check.sql             liest nur: ist die Einrichtung vollständig?
├─ reset.sql             räumt alles wieder ab, damit setup.sql neu laufen kann
└─ seed.sql              Demodaten, nur für Entwicklung

Dockerfile               Container-Build für Railway (und jeden Docker-Host)
railway.toml             Railway: Docker-Builder + Healthcheck
vercel.json              Vercel: Framework-Preset
scripts/verify-db.sh     Migrationen gegen echtes PostgreSQL prüfen
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

## 10. Sicherheit & Datenschutz

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

## 11. Anpassen

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

## 12. Tests und Qualitätssicherung

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

Anschließend läuft derselbe Prüfsatz noch einmal, nachdem `reset.sql` und `setup.sql`
die Datenbank komplett neu aufgebaut haben. Das hält die beiden Dateien, die nur im
Supabase SQL Editor benutzt werden, mit den Migrationen im Gleichschritt und stellt
sicher, dass nach einem Zurücksetzen auch die Tabellenrechte wieder stimmen.

Voraussetzung ist ein lokal laufender PostgreSQL-Server (Version 15 oder neuer):

```bash
PGHOST=/tmp PGPORT=5433 npm run test:db
```

Das Skript fasst dein Supabase-Projekt nicht an — es arbeitet ausschließlich in einer
Datenbank namens `marocargo_test`.

---

## 13. Vor dem echten Geschäftsbetrieb

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
