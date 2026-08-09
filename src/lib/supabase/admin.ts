import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { publicEnv, serviceRoleKey } from '@/lib/env';

let cached: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Service-role client. BYPASSES ROW LEVEL SECURITY COMPLETELY.
 *
 * Rules for using it:
 *   1. Server-side only (the `server-only` import above enforces this).
 *   2. Never expose its results straight to the browser — pick the fields you
 *      actually want to send.
 *   3. Always check the caller's role first (see `requireRole` in
 *      `src/lib/auth.ts`) unless the operation is genuinely public, such as
 *      creating a booking or reading public tracking data.
 */
export function createAdminClient() {
  if (cached) return cached;
  const env = publicEnv();
  cached = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
