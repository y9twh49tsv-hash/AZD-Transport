import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { RequestForm } from '@/components/transfer/request-form';
import { StructuredData } from '@/components/transfer/structured-data';
import { siteConfig, telLink, whatsappRequestLink } from '@/config/site';
import {
  businessBenefits,
  documentation,
  faq,
  reasons,
  services,
  steps,
} from '@/config/transfer-content';

export const metadata: Metadata = {
  title: {
    absolute: 'Fahrzeugüberführung Frankfurt & deutschlandweit | AZD Transport',
  },
  description:
    'Professionelle Fahrzeugüberführungen auf eigener Achse. Premium-, Leasing- und Firmenfahrzeuge deutschlandweit überführen lassen. Jetzt unverbindlich anfragen.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    title: 'Fahrzeugüberführung Frankfurt & deutschlandweit | AZD Transport',
    description:
      'Professionelle Fahrzeugüberführungen auf eigener Achse. Premium-, Leasing- und Firmenfahrzeuge deutschlandweit überführen lassen.',
  },
};

/** Die Vertrauenspunkte im Kopfbereich. Jeder davon ist belegbar. */
const HERO_POINTS = [
  'Auf eigener Achse',
  'Deutschlandweit',
  'Flexible Termine',
  'Zustandsdokumentation',
  'Rechnung für Privat & Gewerbe',
];

const TRUST = [
  'Persönliche Durchführung',
  'Transparente Preisabsprache',
  'Flexible Terminplanung',
  'Dokumentierte Übergabe',
];

/** Was in die Kalkulation einfließt — ehrlich benannt statt weggelassen. */
const PRICE_FACTORS = [
  'Anreise zum Fahrzeug',
  'Entfernung Abholort → Ziel',
  'Rückreise',
  'Kraftstoff und Maut',
  'Fahrzeugart',
  'Wunschtermin',
];

function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-[clamp(1.6rem,7vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {lead && (
        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {lead}
        </p>
      )}
    </div>
  );
}

export default function TransferHomePage() {
  return (
    <>
      <StructuredData />

      {/* ================================================================
          A — Kopfbereich
          ----------------------------------------------------------------
          Ohne Fotografie: es liegt keine lizenzierte Automotive-Bildstrecke
          im Projekt, und ein erkennbares Stockfoto würde bei genau der
          Zielgruppe das Gegenteil bewirken. Die Wirkung trägt hier die
          Typografie, ein sehr weiches Studiolicht und ein feines Korn.
          Nebeneffekt: der größte sichtbare Inhalt ist Text und damit sofort
          da — der Kopfbereich lädt kein einziges Byte Bild nach.
          ================================================================ */}
      <section className="hero-wash grain relative isolate overflow-hidden">
        {siteConfig.heroImage && (
          <>
            <Image
              src={siteConfig.heroImage}
              alt=""
              fill
              // Der Kopfbereich ist das erste, was geladen wird — kein
              // Nachladen beim Scrollen, sonst blitzt die Fläche kurz leer auf.
              priority
              sizes="100vw"
              className="-z-10 object-cover object-center opacity-45"
            />
            {/* Verlauf über dem Foto: die Schrift muss lesbar bleiben, egal
                wie hell das Bild an der Stelle ist. */}
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/40"
              aria-hidden
            />
          </>
        )}

        <div className="container relative z-10 grid gap-14 [&>*]:min-w-0 pb-20 pt-16 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-32 lg:pt-28">
          <div>
            <p className="eyebrow">Fahrzeugüberführungen auf eigener Achse</p>

            {/* Die Schriftgröße läuft bis 320 px mit: „Deutschlandweit.“ ist
                ein einziges Wort und passt bei fester Größe auf einem sehr
                schmalen Bildschirm nicht mehr in die Zeile. */}
            <h1 className="mt-6 text-balance text-[clamp(2rem,8.5vw,2.5rem)] font-semibold leading-[1.05] tracking-tight hyphens-auto sm:text-6xl lg:text-[4.25rem]">
              Premium Fahrzeug&shy;überführungen.
              <span className="mt-2 block text-primary">Deutschlandweit.</span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Professionelle Fahrzeugüberführungen auf eigener Achse — persönlich, zuverlässig und
              transparent.
            </p>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {HERO_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/anfrage"
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-sm bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Überführung anfragen
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href="#anfrage"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-sm border border-border px-7 text-sm font-medium text-foreground transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Preis anfragen
              </a>
              <a
                href={whatsappRequestLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <MessageCircle className="size-4" aria-hidden />
                Direkt per WhatsApp
              </a>
            </div>
          </div>

          {/* Statt Dekoration: die drei Angaben, die ein Interessent zuerst
              prüft. Auf dem Telefon steht das unter dem Text, nicht daneben. */}
          <div className="panel bg-card/60 p-7 backdrop-blur-sm sm:p-8">
            <dl className="divide-y divide-border">
              <div className="pb-5">
                <dt className="eyebrow">Einsatzgebiet</dt>
                <dd className="mt-2 text-lg font-medium">{siteConfig.serviceArea}</dd>
              </div>
              <div className="py-5">
                <dt className="eyebrow">Fahrzeuge</dt>
                <dd className="mt-2 text-lg font-medium leading-snug">
                  PKW, SUV, Sportwagen, Luxusfahrzeuge, Transporter bis 3,5 t
                </dd>
              </div>
              <div className="pt-5">
                <dt className="eyebrow">Direkter Kontakt</dt>
                <dd className="mt-3 space-y-2.5">
                  <a
                    href={telLink()}
                    className="flex min-h-11 items-center gap-2.5 text-base font-medium text-foreground transition-colors hover:text-primary"
                  >
                    <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                    {siteConfig.phone}
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex min-h-11 items-center gap-2.5 break-all text-base text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ================================================================
          B — Vertrauensleiste
          ================================================================ */}
      <section aria-label="Kurzüberblick" className="border-y border-border bg-card/40">
        <div className="container grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <p key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </p>
          ))}
        </div>
      </section>

      {/* ================================================================
          C — Leistungen
          ================================================================ */}
      <section id="leistungen" className="scroll-mt-24 py-24 lg:py-32">
        <div className="container">
          <SectionHeading
            eyebrow="Leistungen"
            title="Überführungen für jeden Anlass."
            lead="Ob einzelnes Fahrzeug oder wiederkehrender Auftrag — der Ablauf bleibt derselbe: klare Absprache, fester Preis, persönliche Übergabe."
          />

          <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="reveal bg-card p-8">
                <h3 className="text-lg font-semibold leading-snug">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          D — Premium-Bereich
          ================================================================ */}
      <section id="premium" className="scroll-mt-24 border-y border-border bg-card/40 py-24 lg:py-32">
        <div className="container grid gap-14 [&>*]:min-w-0 lg:grid-cols-2 lg:items-start lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Premium-Service"
              title="Besondere Fahrzeuge verdienen besondere Sorgfalt."
            />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Bei hochwertigen Fahrzeugen geht es nicht nur darum, von A nach B zu kommen. Übergabe,
                Kommunikation, Dokumentation und ein verantwortungsvoller Umgang mit dem Fahrzeug
                stehen im Mittelpunkt.
              </p>
              <p>
                Das Fahrzeug fährt auf eigener Achse — angemessen bewegt, ohne unnötige
                Zwischenstopps und ohne Auf- und Abladen auf einen Anhänger.
              </p>
            </div>

            {/* Versicherung & Absicherung — bewusst neutral. Der Text kommt aus
                der zentralen Konfiguration und wird ausgetauscht, sobald eine
                Police vorliegt. Bis dahin steht hier keine Zusage. */}
            <div className="panel mt-10 p-7">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h3 className="text-base font-semibold">Versicherung &amp; Absicherung</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {siteConfig.insuranceText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-8 sm:p-10">
            <h3 className="eyebrow">Auf Wunsch Teil des Auftrags</h3>
            <ul className="mt-7 space-y-4">
              {documentation.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          E — Ablauf
          ================================================================ */}
      <section id="ablauf" className="scroll-mt-24 py-24 lg:py-32">
        <div className="container">
          <SectionHeading
            eyebrow="Ablauf"
            title="In vier Schritten zur Überführung."
            lead="Kein Portal, kein Konto, keine Wartezeit in einer Hotline. Eine Anfrage genügt."
          />

          <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="reveal bg-card p-8">
                <p className="font-mono text-sm text-primary">{step.number}</p>
                <h3 className="mt-5 text-lg font-semibold leading-snug">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================
          F — Preise und Anfrage
          ----------------------------------------------------------------
          Das Formular steht auf der Startseite und nicht nur hinter einem
          Link: wer bis hierher gelesen hat, ist bereit — und jeder
          Seitenwechsel kostet an dieser Stelle Anfragen.
          ================================================================ */}
      <section
        id="anfrage"
        className="scroll-mt-24 border-y border-border bg-card/40 py-24 lg:py-32"
      >
        <div className="container grid gap-14 [&>*]:min-w-0 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Anfrage"
              title="Individuelle Festpreise."
              lead="Jede Überführung wird individuell kalkuliert. Nach Prüfung Ihrer Angaben erhalten Sie ein Festpreisangebot — erst danach entscheiden Sie."
            />

            <h3 className="eyebrow mt-12">In die Kalkulation fließt ein</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PRICE_FACTORS.map((factor) => (
                <li key={factor} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {factor}
                </li>
              ))}
            </ul>

            <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
              Sie erhalten vor Auftragserteilung einen Komplettpreis. Kurzfristige Termine gerne
              telefonisch oder per WhatsApp — das ist der schnellste Weg.
            </p>
          </div>

          <RequestForm />
        </div>
      </section>

      {/* ================================================================
          G — Geschäftskunden
          ================================================================ */}
      <section id="unternehmen" className="scroll-mt-24 py-24 lg:py-32">
        <div className="container grid gap-14 [&>*]:min-w-0 lg:grid-cols-2 lg:items-start lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Für Unternehmen"
              title="Fahrzeugüberführungen für Autohäuser & Unternehmen."
              lead="Autohäuser, Gebrauchtwagenhändler, Leasinggesellschaften, Fuhrparks und Werkstätten: ein Ansprechpartner für Einzelaufträge wie für wiederkehrende Überführungen."
            />

            <Link
              href="/anfrage?kunde=gewerblich"
              className="mt-10 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-sm bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Geschäftskunden-Anfrage
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="panel p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <Building2 className="size-5 text-primary" aria-hidden />
              <h3 className="eyebrow">Was Sie erwarten können</h3>
            </div>
            <ul className="mt-7 space-y-4">
              {businessBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-[0.95rem] leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          H — Warum AZD Transport
          ================================================================ */}
      <section className="border-y border-border bg-card/40 py-24 lg:py-32">
        <div className="container">
          <SectionHeading eyebrow="Der Unterschied" title="Warum AZD Transport?" />

          <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.title} className="reveal">
                <div className="rule" aria-hidden />
                <h3 className="mt-6 text-lg font-semibold leading-snug">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          I — Häufige Fragen
          ----------------------------------------------------------------
          Als <details>/<summary>: ohne JavaScript aufklappbar, per Tastatur
          bedienbar, und der Text steht auch im Quelltext für Suchmaschinen.
          ================================================================ */}
      <section id="faq" className="scroll-mt-24 py-24 lg:py-32">
        <div className="container">
          <SectionHeading
            eyebrow="Häufige Fragen"
            title="Antworten vor der Anfrage."
            lead="Etwas nicht dabei? Rufen Sie an — die Frage ist in zwei Minuten geklärt."
          />

          <div className="mt-14 divide-y divide-border border-y border-border">
            {faq.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  {item.question}
                  <ChevronDown
                    className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="max-w-3xl pb-6 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          J — Abschluss
          ================================================================ */}
      <section
        id="kontakt"
        className="hero-wash grain relative isolate scroll-mt-24 overflow-hidden border-t border-border"
      >
        <div className="container relative z-10 py-24 text-center lg:py-32">
          <h2 className="mx-auto max-w-3xl text-balance text-[clamp(1.6rem,7vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl lg:text-5xl">
            Ihr Fahrzeug soll von A nach B? Wir kümmern uns um die Überführung.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            Unverbindlich anfragen — Sie erhalten ein individuelles Festpreisangebot.
          </p>

          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/anfrage"
              className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-sm bg-primary px-8 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:w-auto"
            >
              Jetzt Überführung anfragen
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href={whatsappRequestLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-sm border border-border px-8 text-sm font-medium text-foreground transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:w-auto"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Oder direkt anrufen:{' '}
            <a href={telLink()} className="font-medium text-foreground hover:text-primary">
              {siteConfig.phone}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
