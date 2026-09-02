import Link from 'next/link';
import { AlertTriangle, Compass, Phone } from 'lucide-react';
import { siteConfig, telLink } from '@/config/site';
import { content, pagePath, type Locale } from '@/content';

/**
 * Fehler- und 404-Seite.
 *
 * Beides sind Momente, in denen jemand gerade nicht weiterkommt — deshalb
 * steht die Telefonnummer direkt daneben. Ein Fehler auf der Website ist kein
 * Grund, einen Auftrag zu verlieren.
 */

export function ErrorPage({
  locale,
  digest,
  reset,
}: {
  locale: Locale;
  digest?: string;
  reset: () => void;
}) {
  const t = content(locale).error;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t.text}</p>

      {/* Bewusst ohne Stapelspur und ohne Fehlertext: die können interne Namen
          enthalten. Die Kennung reicht, um den Eintrag im Serverprotokoll zu
          finden. */}
      {digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {t.reference} {digest}
        </p>
      )}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          {t.retry}
        </button>
        <a
          href={telLink()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-6 text-sm font-medium text-foreground"
        >
          <Phone className="size-4 text-primary" aria-hidden />
          {siteConfig.phone}
        </a>
      </div>

      <Link
        href={pagePath('home', locale)}
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
      >
        {t.home}
      </Link>
    </div>
  );
}

export function NotFoundPage({ locale }: { locale: Locale }) {
  const t = content(locale).notFound;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t.text}</p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:w-auto sm:flex-row">
        <Link
          href={pagePath('request', locale)}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          {t.cta}
        </Link>
        <Link
          href={pagePath('home', locale)}
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground"
        >
          {t.home}
        </Link>
      </div>
    </div>
  );
}
