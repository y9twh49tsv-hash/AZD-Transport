'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { publicEnv } from '@/lib/env';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser client. Carries the anon key and the user's session — everything it
 * can reach is governed by row level security.
 */
export function createClient() {
  if (cached) return cached;
  const env = publicEnv();
  cached = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return cached;
}
