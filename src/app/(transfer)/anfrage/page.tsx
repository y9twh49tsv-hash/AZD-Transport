import type { Metadata } from 'next';
import { MessageCircle, Phone } from 'lucide-react';
import { RequestForm } from '@/components/transfer/request-form';
import { siteConfig, telLink, whatsappRequestLink } from '@/config/site';

export const metadata: Metadata = {
  title: 'Überführung anfragen',
  description:
    'Fahrzeugüberführung unverbindlich anfragen: Abholort, Zielort, Fahrzeug und Wunschtermin angeben — Sie erhalten ein individuelles Festpreisangebot.',
  alternates: { canonical: '/anfrage' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/anfrage',
    title: 'Überführung anfragen · AZD Transport',
    description:
      'Fahrzeugüberführung unverbindlich anfragen — Sie erhalten ein individuelles Festpreisangebot.',
  },
};

/**
 * Die eigenständige Anfrageseite.
 *
 * Sie existiert neben dem Formular auf der Startseite, weil auf sie verlinkt
 * werden kann: aus der Kopfzeile, aus der festen Leiste auf dem Telefon und
 * aus einer WhatsApp-Nachricht heraus. `?kunde=gewerblich` kommt aus dem
 * Geschäftskundenbereich und schreibt einen Satz in die Bemerkungen, damit die
 * Anfrage schon beim Eingang einsortiert ist.
 */
export default async function AnfragePage({
  searchParams,
}: {
  searchParams: Promise<{ kunde?: string }>;
}) {
  const { kunde } = await searchParams;
  const business = kunde === 'gewerblich';

  return (
    <div className="container max-w-3xl py-14 lg:py-20">
      <p className="eyebrow">Anfrage</p>
      <h1 className="mt-4 text-balance text-[clamp(1.6rem,7.5vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl">
        {business ? 'Geschäftskunden-Anfrage' : 'Unverbindliches Angebot anfordern'}
      </h1>
      <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
        Nach Prüfung Ihrer Angaben erhalten Sie ein individuelles Festpreisangebot. Pflicht sind nur
        Abholort, Zielort, Ihr Name und eine Kontaktmöglichkeit — alles Weitere klären wir
        miteinander.
      </p>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={telLink()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
        >
          <Phone className="size-4 text-primary" aria-hidden />
          {siteConfig.phone}
        </a>
        <a
          href={whatsappRequestLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
        >
          <MessageCircle className="size-4 text-primary" aria-hidden />
          WhatsApp
        </a>
      </div>

      <div className="rule mt-12" aria-hidden />

      <div className="mt-12">
        <RequestForm
          defaultNotes={business ? 'Gewerbliche Anfrage — ' : undefined}
        />
      </div>
    </div>
  );
}
