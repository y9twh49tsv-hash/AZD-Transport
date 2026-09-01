'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input } from '@/components/ui/input';
import { signUp } from '@/app/(auth)/login/actions';
import { useT } from '@/lib/i18n/client';

export function RegisterForm() {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result.ok) {
        setDone(result.message ?? t('auth.createdFallback'));
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="surface p-6 sm:p-8">
        <Alert tone="success" title={t('auth.createdTitle')}>
          {done}
        </Alert>
        <Link href="/login" className="mt-6 block">
          <Button block size="lg">
            {t('auth.toLogin')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{t('auth.registerTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>

      {error && (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      )}

      <div className="mt-6 space-y-4">
        <Field label={t('auth.fullName')} htmlFor="fullName" required>
          <Input id="fullName" name="fullName" autoComplete="name" required minLength={2} />
        </Field>

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

        <Field label={t('fields.phone')} htmlFor="phone" hint={t('auth.phoneHint')}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
        </Field>

        <Field label={t('auth.password')} htmlFor="password" hint={t('auth.passwordHint')} required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </Field>

        <Button type="submit" block size="lg" disabled={pending}>
          <UserPlus aria-hidden />
          {pending ? t('auth.creating') : t('auth.createAccount')}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('auth.acceptPrefix')}{' '}
          <Link href="/pakete/agb" className="underline">
            {t('footer.terms')}
          </Link>{' '}
          {t('auth.acceptAnd')}{' '}
          <Link href="/pakete/datenschutz" className="underline">
            {t('booking.termsPrivacy')}
          </Link>
          .
        </p>
      </div>

      <p className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.loginTitle')}
        </Link>
      </p>
    </form>
  );
}
