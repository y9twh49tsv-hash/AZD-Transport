'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { LOCALE_FLAGS, LOCALE_LABELS, LOCALES, type Locale } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/client';
import { setLocale } from '@/lib/i18n/actions';
import { cn } from '@/lib/utils';

/**
 * Language picker.
 *
 * A native <select> on purpose. It is one tap on a phone, it opens the
 * platform's own list, and it stays reachable by keyboard and screen reader
 * without a line of focus-trap code. A custom dropdown would look tidier in a
 * screenshot and behave worse in a moving vehicle.
 *
 * Each language is named in itself — someone looking for Darija is not helped
 * by the word "Arabisch" in a German menu.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    startTransition(async () => {
      await setLocale(next);
      // The server components above re-render with the new dictionary.
      router.refresh();
    });
  }

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <Globe
        className="pointer-events-none absolute start-2.5 size-4 text-muted-foreground"
        aria-hidden
      />
      <select
        value={locale}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        aria-label={LOCALE_LABELS[locale]}
        className={cn(
          'h-9 cursor-pointer appearance-none rounded-lg border border-border bg-card ps-8 pe-3 text-sm font-medium',
          'transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          pending && 'opacity-60',
        )}
      >
        {LOCALES.map((code: Locale) => (
          <option key={code} value={code}>
            {LOCALE_FLAGS[code]} {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
