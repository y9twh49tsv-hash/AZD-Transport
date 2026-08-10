-- =============================================================================
-- Minimal Supabase emulation for verifying the migrations locally
-- =============================================================================
-- Recreates just enough of a Supabase project (auth schema, auth.uid(), the
-- anon/authenticated/service_role roles, storage.buckets and the default
-- privileges) that `supabase/migrations/*.sql` can be executed unchanged
-- against a plain PostgreSQL instance.
--
-- Used by scripts/verify-db.sh. Never run against a real project.
-- =============================================================================

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant usage on schema public, auth, storage, extensions to anon, authenticated, service_role;

-- Supabase grants table access to these roles by default; RLS is what actually
-- restricts them.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- --- auth ---------------------------------------------------------------
create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  -- Nur gesetzt, wenn die Adresse bestätigt wurde. make-admin.sql zeigt den
  -- Wert an, weil ein unbestätigtes Konto sich nicht anmelden kann und das
  -- sonst wie ein Fehler der Rollenvergabe aussieht.
  email_confirmed_at timestamptz,
  created_at         timestamptz not null default now()
);

-- Mirrors Supabase's auth.uid(): reads the subject claim of the current request.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant execute on function auth.uid() to anon, authenticated, service_role;

-- --- storage ------------------------------------------------------------
create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);
