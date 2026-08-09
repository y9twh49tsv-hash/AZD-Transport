'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DriverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Alert tone="error" title="Konnte nicht geladen werden">
        Prüfe deine Internetverbindung und versuche es erneut.
        {error.digest && <span className="mt-2 block font-mono text-xs">Ref: {error.digest}</span>}
      </Alert>

      <div className="mt-6 flex flex-col gap-3">
        <Button block className="min-h-14" onClick={reset}>
          Erneut versuchen
        </Button>
        <Link href="/driver">
          <Button variant="outline" block className="min-h-14">
            Zur Übersicht
          </Button>
        </Link>
      </div>
    </div>
  );
}
