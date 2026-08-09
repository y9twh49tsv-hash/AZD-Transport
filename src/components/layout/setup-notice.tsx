import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Shown instead of a crash when the app runs without Supabase credentials —
 * the very first thing a developer sees after `npm run dev`.
 */
export function SetupNotice({ className }: { className?: string }) {
  if (isSupabaseConfigured()) return null;

  return (
    <Alert tone="warning" title="Supabase ist noch nicht konfiguriert" className={className}>
      <p>
        Lege eine Datei <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">.env.local</code>{' '}
        nach dem Vorbild von{' '}
        <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">.env.example</code> an und
        trage deine Supabase-Zugangsdaten ein. Die Schritt-für-Schritt-Anleitung steht in der{' '}
        <Link href="https://github.com" className="font-medium underline">
          README
        </Link>
        . Buchungen, Tracking und das Dashboard funktionieren erst danach.
      </p>
    </Alert>
  );
}

export function isConfigured() {
  return isSupabaseConfigured();
}
