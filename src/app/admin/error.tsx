'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-16">
      <Alert tone="error" title="Diese Ansicht konnte nicht geladen werden" icon={false}>
        <span className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <span>
            Häufigste Ursache: die Supabase-Zugangsdaten fehlen oder die Migrationen wurden noch
            nicht ausgeführt. Prüfe die Environment Variables und die README.
            {error.digest && (
              <span className="mt-2 block font-mono text-xs">Referenz: {error.digest}</span>
            )}
          </span>
        </span>
      </Alert>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={reset}>Erneut versuchen</Button>
        <Link href="/admin">
          <Button variant="outline">Zur Übersicht</Button>
        </Link>
      </div>
    </div>
  );
}
