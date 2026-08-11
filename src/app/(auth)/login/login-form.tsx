'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input } from '@/components/ui/input';
import { requestPasswordReset, signIn } from './actions';
import { useT } from '@/lib/i18n/client';

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSignIn(formData: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      // On success the action redirects, so only failures return here.
      const result = await signIn(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  function handleReset(formData: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result.ok) {
        setInfo(result.message ?? null);
        setShowReset(false);
      } else {
        setError(result.error);
      }
    });
  }

  if (showReset) {
    return (
      <form action={handleReset} className="surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.resetTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.resetSubtitle')}</p>

        {error && (
          <Alert tone="error" className="mt-5">
            {error}
          </Alert>
        )}

        <div className="mt-6 space-y-4">
          <Field label={t('fields.email')} htmlFor="reset-email" required>
            <Input id="reset-email" name="email" type="email" autoComplete="email" required />
          </Field>

          <Button type="submit" block size="lg" disabled={pending}>
            {pending ? t('auth.resetSending') : t('auth.resetRequest')}
          </Button>
          <Button type="button" variant="ghost" block onClick={() => setShowReset(false)}>
            {t('auth.backToLogin')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={handleSignIn} className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{t('auth.loginTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>

      {error && (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      )}
      {info && (
        <Alert tone="success" className="mt-5">
          {info}
        </Alert>
      )}

      <input type="hidden" name="next" value={next ?? ''} />

      <div className="mt-6 space-y-4">
        <Field label={t('fields.email')} htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            required
          />
        </Field>

        <Field label={t('auth.password')} htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" block size="lg" disabled={pending}>
          <LogIn aria-hidden />
          {pending ? t('auth.signingIn') : t('auth.loginTitle')}
        </Button>
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-6 text-center text-sm">
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('auth.forgotPassword')}
        </button>
        <p className="text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link href="/registrieren" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('auth.registerNow')}
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          {t('auth.guestHint')}{' '}
          <Link href="/buchen" className="underline">
            {t('auth.bookDirectly')}
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
