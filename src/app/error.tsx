'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Catches unexpected render errors anywhere in the app.
 *
 * Deliberately shows no stack trace and no error message: those can contain
 * table names, ids or other internals. The digest is enough to find the entry
 * in the server logs.
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
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Da ist etwas schiefgelaufen</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Wir konnten die Seite nicht laden. Versuche es bitte erneut — wenn es weiterhin nicht
        klappt, melde dich einfach bei uns.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Referenz: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Erneut versuchen</Button>
        <Link href="/">
          <Button variant="outline" block className="sm:w-auto">
            Zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
}
