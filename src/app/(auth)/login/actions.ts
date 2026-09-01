'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { emailSchema } from '@/lib/validation';
import { getT } from '@/lib/i18n/server';
import { translateError } from '@/lib/i18n/errors';

export type AuthResult = { ok: false; error: string } | { ok: true; message?: string };

const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen haben.').max(128),
});

const signUpSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, 'Bitte gib deinen Namen an.').max(120),
  phone: z.string().trim().max(32).optional(),
});

/** Keeps an open redirect from being smuggled in through ?next=. */
function safeRedirect(target: string | undefined | null): string {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return '/konto';
  return target;
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const t = await getT();
  if (!isSupabaseConfigured()) {
    return { ok: false, error: t('actions.authNotConfigured') };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: translateError(t, parsed.error.issues[0]?.message) ?? t('actions.checkInput'),
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately generic: never reveal whether an address exists.
    return { ok: false, error: t('actions.signInWrong') };
  }

  const next = safeRedirect(formData.get('next')?.toString());
  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const t = await getT();
  if (!isSupabaseConfigured()) {
    return { ok: false, error: t('actions.signUpNotConfigured') };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: translateError(t, parsed.error.issues[0]?.message) ?? t('actions.checkInput'),
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Only harmless display data. The role lives in `profiles` and is set by
      // a database trigger — user metadata can be influenced by the client and
      // is therefore never trusted for authorisation.
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone ?? null },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { ok: false, error: t('actions.accountExists') };
    }
    return { ok: false, error: t('actions.signUpFailed') };
  }

  return {
    ok: true,
    message: t('actions.signUpConfirm'),
  };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  // Nach dem Abmelden zurück auf die Paketseite: dort ist man angemeldet
  // gewesen, und die Startseite gehört inzwischen zur Überführung.
  redirect('/pakete');
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const t = await getT();
  if (!isSupabaseConfigured()) {
    return { ok: false, error: t('actions.resetNotConfigured') };
  }

  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return { ok: false, error: t('validation.emailInvalid') };
  }

  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(parsed.data);

  // Same answer either way, so the form cannot be used to enumerate accounts.
  return {
    ok: true,
    message: t('actions.resetSent'),
  };
}
