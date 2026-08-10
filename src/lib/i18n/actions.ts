'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale } from './index';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from './server';

/**
 * Stores the chosen language.
 *
 * Not httpOnly on purpose — no secret is involved, and a future client-side
 * read (for example to preselect a language in a form) should not require a
 * round trip. `sameSite: lax` keeps it attached when someone follows a link
 * from WhatsApp, which is how most of this site's traffic arrives.
 */
export async function setLocale(next: string): Promise<void> {
  if (!isLocale(next)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, next, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  // Every public page renders from the dictionary, so all of them change.
  revalidatePath('/', 'layout');
}
