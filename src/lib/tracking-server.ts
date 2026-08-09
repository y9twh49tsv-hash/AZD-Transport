import 'server-only';

import { headers } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { checkRateLimit, clientKey, RATE_LIMITS } from '@/lib/rate-limit';
import { toPublicTracking, type PublicTracking } from '@/lib/tracking';
import { normaliseTrackingNumber } from '@/lib/utils';

export type TrackingLookup =
  | { state: 'found'; data: PublicTracking }
  | { state: 'not_found' }
  | { state: 'invalid' }
  | { state: 'rate_limited'; retryAfterSeconds: number }
  | { state: 'unconfigured' };

/**
 * Public tracking lookup.
 *
 * Runs through the *anon* client on purpose: `get_public_tracking` is a
 * SECURITY DEFINER function granted to anon, and it is the only way into the
 * shipments table from here. The service-role key is never involved, so a bug
 * in this file cannot widen what a visitor sees.
 */
export async function fetchPublicTracking(rawNumber: string): Promise<TrackingLookup> {
  const trackingNumber = normaliseTrackingNumber(rawNumber ?? '');

  if (!/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(trackingNumber)) {
    return { state: 'invalid' };
  }

  if (!isSupabaseConfigured()) return { state: 'unconfigured' };

  const requestHeaders = await headers();
  const limit = checkRateLimit(
    clientKey(requestHeaders, 'tracking'),
    RATE_LIMITS.tracking.limit,
    RATE_LIMITS.tracking.windowMs,
  );
  if (!limit.allowed) {
    return { state: 'rate_limited', retryAfterSeconds: limit.retryAfterSeconds };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_public_tracking', {
    p_tracking_number: trackingNumber,
  });

  if (error) {
    console.error('[tracking] Abfrage fehlgeschlagen:', error.message);
    return { state: 'not_found' };
  }

  const sanitised = toPublicTracking(data);
  return sanitised ? { state: 'found', data: sanitised } : { state: 'not_found' };
}
