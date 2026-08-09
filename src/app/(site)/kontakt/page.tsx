import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';
import { whatsappLink } from '@/lib/notifications/whatsapp';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: `So erreichst du ${brand.name} — telefonisch, per WhatsApp oder E-Mail.`,
};

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-10 sm:py-16">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kontakt</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Fragen zu einer Sendung, zu einem Preis oder zu einer Stadt, die noch nicht in der Liste
          steht? Melde dich einfach — am schnellsten per WhatsApp oder Telefon.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink(brand.whatsapp, `Hallo ${brand.name}, ich habe eine Frage zu `)}
          target="_blank"
          rel="noopener noreferrer"
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <MessageCircle className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">WhatsApp</span>
            <span className="block text-sm text-muted-foreground">
              Schnellste Antwort — meist innerhalb weniger Stunden.
            </span>
          </span>
        </a>

        <a
          href={`tel:${brand.phone.replace(/\s/g, '')}`}
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Phone className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Telefon</span>
            <span className="block text-sm text-muted-foreground">{brand.phone}</span>
          </span>
        </a>

        <a
          href={`mailto:${brand.email}`}
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Mail className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">E-Mail</span>
            <span className="block break-all text-sm text-muted-foreground">{brand.email}</span>
          </span>
        </a>

        <div className="surface flex items-start gap-4 p-5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Annahmestelle</span>
            <span className="block text-sm text-muted-foreground">
              {brand.address.street}
              <br />
              {brand.address.zip} {brand.address.city}
            </span>
          </span>
        </div>
      </div>

      <section className="surface mt-8 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Häufige Fragen</h2>
        <dl className="mt-5 space-y-5 text-sm">
          {[
            {
              q: 'Wie lange dauert der Transport?',
              a: 'Die Laufzeit hängt von der jeweiligen Tour und vom Zoll ab. Den genauen Stand siehst du jederzeit in der Sendungsverfolgung.',
            },
            {
              q: 'Meine Stadt steht nicht in der Liste — geht es trotzdem?',
              a: 'Oft ja. Schreib uns kurz, wir prüfen, ob wir sie auf einer der nächsten Touren mitnehmen können.',
            },
            {
              q: 'Wie bezahle ich?',
              a: 'Aktuell bar bei Abgabe oder Abholung, per Überweisung oder nach Absprache auf Rechnung. Online-Zahlung ist in Vorbereitung.',
            },
            {
              q: 'Was kostet Sperrgut?',
              a: 'Das hängt von Größe, Gewicht und Aufwand ab. Lade Fotos und Maße hoch, dann bekommst du einen Festpreis.',
            },
          ].map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Link href="/preisrechner">
            <Button block className="sm:w-auto">
              Preis berechnen
            </Button>
          </Link>
          <Link href="/sperrgut">
            <Button variant="outline" block className="sm:w-auto">
              Sperrgut anfragen
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
