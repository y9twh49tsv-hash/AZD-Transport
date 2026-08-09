import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Landing point for the links Supabase mails out (address confirmation,
 * password reset, magic links).
 *
 * The `code` is exchanged for a session server-side, so the tokens never touch
 * the URL bar of the browser after the redirect.
 *
 * Set this URL in Supabase → Authentication → URL Configuration → Redirect URLs:
 *   http://localhost:3000/auth/callback
 *   https://<deine-domain>/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');

  // Never follow a redirect target that points off our own origin.
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/konto';

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=link_ungueltig`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link_abgelaufen`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
