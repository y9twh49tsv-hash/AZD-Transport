-- =============================================================================
-- AZD Transport — Storage buckets
-- =============================================================================
-- All three buckets are PRIVATE. They hold photos of people's belongings,
-- delivery proofs and signatures, so nothing is served from a public URL.
--
-- Access pattern:
--   Upload   — the server issues a short-lived *signed upload URL* after
--              validating the request; the browser then uploads straight to
--              Supabase. Nothing large passes through the Next.js server, so
--              Vercel's request body limits never come into play.
--   Download — the server issues a short-lived *signed download URL* only
--              after checking that the caller may see the shipment.
--
-- No policies are created on storage.objects. RLS is enabled there by default
-- in Supabase, so with zero policies neither anon nor authenticated can touch
-- the objects directly — only the service role (server-side) can.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'shipment-photos',
    'shipment-photos',
    false,
    10485760, -- 10 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'bulky-photos',
    'bulky-photos',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'signatures',
    'signatures',
    false,
    2097152, -- 2 MB
    array['image/png', 'image/webp']
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
