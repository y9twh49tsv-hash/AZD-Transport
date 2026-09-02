'use client';

import { ErrorPage } from '@/components/transfer/status-pages';
import '@/app/globals.css';

/**
 * Der Auffangbereich für Fehler im Wurzellayout selbst.
 *
 * `error.tsx` einer Gruppe fängt Fehler der Seiten darunter, nicht die des
 * Layouts, in dem es liegt. Bleibt also nur diese Datei — und weil sie das
 * Layout ersetzt, bringt sie ihr eigenes `<html>` mit.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de" dir="ltr">
      <body className="min-h-dvh">
        <ErrorPage locale="de" digest={error.digest} reset={reset} />
      </body>
    </html>
  );
}
