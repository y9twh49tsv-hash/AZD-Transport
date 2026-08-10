import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { isSupabaseConfigured, supabaseConfigProblems } from '@/lib/env';

/**
 * Shown instead of a crash when the app runs without usable Supabase
 * credentials — the very first thing a developer sees after `npm run dev`.
 *
 * The concrete problem is named, because the two cases look identical from the
 * outside and need different fixes: a variable that was never set, and one that
 * was set to the placeholder from a set-up guide. Only variable names are shown,
 * never a value.
 */
export function SetupNotice({ className }: { className?: string }) {
  const problems = supabaseConfigProblems();
  if (problems.length === 0) return null;

  return (
    <Alert tone="warning" title="Supabase ist noch nicht konfiguriert" className={className}>
      <ul className="mb-2 list-disc space-y-1 pl-5">
        {problems.map((problem) => (
          <li key={problem} className="font-mono text-xs">
            {problem}
          </li>
        ))}
      </ul>
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
