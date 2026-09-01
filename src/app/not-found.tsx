import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Seite nicht gefunden</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Diese Seite gibt es nicht (mehr). Wollten Sie eine Überführung anfragen?
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:w-auto sm:flex-row">
        <Link
          href="/anfrage"
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Überführung anfragen
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
