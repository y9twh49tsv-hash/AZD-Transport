import { MessageCircle, Phone } from 'lucide-react';
import { RequestForm } from '@/components/transfer/request-form';
import { siteConfig, telLink, whatsappRequestLink } from '@/config/site';
import { content, type Locale } from '@/content';

/**
 * Die eigenständige Anfrageseite.
 *
 * Sie existiert neben dem Formular auf der Startseite, weil auf sie verlinkt
 * werden kann: aus der Kopfzeile, aus der festen Leiste auf dem Telefon und
 * aus einer WhatsApp-Nachricht heraus.
 *
 * `?kunde=gewerblich` kommt aus dem Geschäftskundenbereich und schreibt einen
 * Satz in die Bemerkungen, damit die Anfrage schon beim Eingang einsortiert
 * ist. Der Parameter heißt in beiden Sprachen gleich — er steht in Links, die
 * jemand kopiert haben könnte.
 */
export function RequestPage({ locale, business }: { locale: Locale; business: boolean }) {
  const t = content(locale);
  const f = t.request;

  return (
    <div className="container max-w-3xl py-14 lg:py-20">
      <p className="eyebrow">{f.eyebrow}</p>
      <h1 className="mt-4 text-balance text-[clamp(1.6rem,7.5vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl">
        {business ? f.titleBusiness : f.title}
      </h1>
      <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">{f.lead}</p>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={telLink()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
        >
          <Phone className="size-4 text-primary" aria-hidden />
          {siteConfig.phone}
        </a>
        <a
          href={whatsappRequestLink(t.whatsappOpener)}
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
        <RequestForm locale={locale} defaultNotes={business ? f.businessNotePrefix : undefined} />
      </div>
    </div>
  );
}
