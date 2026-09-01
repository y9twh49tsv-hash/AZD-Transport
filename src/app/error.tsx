'use client';

import Link from 'next/link';
import { AlertTriangle, Phone } from 'lucide-react';
import { siteConfig, telLink } from '@/config/site';

/**
 * Fängt unerwartete Fehler beim Rendern ab.
 *
 * Bewusst ohne Stapelspur und ohne Fehlertext: die können interne Namen
 * enthalten. Die Kennung reicht, um den Eintrag im Serverprotokoll zu finden.
 *
 * Und weil jemand, der hier landet, gerade nicht weiterkommt: die
 * Telefonnummer steht direkt daneben. Ein Fehler auf der Website ist kein
 * Grund, einen Auftrag zu verlieren.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Da ist etwas schiefgelaufen</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut — oder rufen Sie uns
        einfach an, das geht ohnehin schneller.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Referenz: {error.digest}</p>
      )}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Erneut versuchen
        </button>
        <a
          href={telLink()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-6 text-sm font-medium text-foreground"
        >
          <Phone className="size-4 text-primary" aria-hidden />
          {siteConfig.phone}
        </a>
      </div>

      <Link href="/" className="mt-6 text-sm text-muted-foreground underline underline-offset-4">
        Zur Startseite
      </Link>
    </div>
  );
}
