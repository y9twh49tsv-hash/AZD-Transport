'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input } from '@/components/ui/input';
import { signUp } from '@/app/(auth)/login/actions';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result.ok) {
        setDone(result.message ?? 'Registrierung erfolgreich.');
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="surface p-6 sm:p-8">
        <Alert tone="success" title="Konto angelegt">
          {done}
        </Alert>
        <Link href="/login" className="mt-6 block">
          <Button block size="lg">
            Zur Anmeldung
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Konto erstellen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mit einem Konto siehst du alle deine Sendungen auf einen Blick.
      </p>

      {error && (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      )}

      <div className="mt-6 space-y-4">
        <Field label="Vor- und Nachname" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" autoComplete="name" required minLength={2} />
        </Field>

        <Field label="E-Mail" htmlFor="email" required>
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

        <Field label="Telefonnummer" htmlFor="phone" hint="Optional, hilft uns bei Rückfragen.">
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
        </Field>

        <Field label="Passwort" htmlFor="password" hint="Mindestens 8 Zeichen." required>
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
          {pending ? 'Wird erstellt …' : 'Konto erstellen'}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Mit der Registrierung akzeptierst du unsere{' '}
          <Link href="/agb" className="underline">
            AGB
          </Link>{' '}
          und die{' '}
          <Link href="/datenschutz" className="underline">
            Datenschutzhinweise
          </Link>
          .
        </p>
      </div>

      <p className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Schon ein Konto?{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
