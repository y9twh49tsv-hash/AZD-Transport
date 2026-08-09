'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normaliseTrackingNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';

export function TrackingSearch({
  initialValue = '',
  autoFocus = false,
}: {
  initialValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const normalised = normaliseTrackingNumber(value);

    if (!/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(normalised)) {
      setError('Bitte gib eine gültige Sendungsnummer ein, z. B. MC-260809-0042.');
      return;
    }

    setError(null);
    router.push(`/tracking/${encodeURIComponent(normalised)}`);
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="tracking-number" className="sr-only">
          Sendungsnummer
        </label>
        <Input
          id="tracking-number"
          name="tracking-number"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={t('tracking.placeholder')}
          aria-invalid={!!error}
          aria-describedby={error ? 'tracking-error' : undefined}
          onChange={(event) => {
            setValue(event.target.value.toUpperCase());
            if (error) setError(null);
          }}
          className="font-mono text-lg tracking-wide"
        />
        <Button type="submit" size="lg" className="sm:min-w-40">
          <Search aria-hidden />
          {t('common.trackShipment')}
        </Button>
      </div>
      {error && (
        <p id="tracking-error" role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
