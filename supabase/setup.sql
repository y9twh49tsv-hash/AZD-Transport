-- =============================================================================
-- AZD Transport — komplette Einrichtung in einem Durchgang
-- =============================================================================
-- Diese Datei ist die Aneinanderreihung aller 7 Migrationen aus
-- supabase/migrations/ in der richtigen Reihenfolge. Sie existiert nur der
-- Bequemlichkeit halber: einmal in den Supabase SQL Editor einfügen und
-- ausführen, statt 7 Dateien nacheinander.
--
-- Die einzelnen Migrationsdateien bleiben die maßgebliche Quelle. Wenn du dort
-- etwas änderst, erzeuge diese Datei neu:
--     npm run build:setup-sql
--
-- NUR für ein FRISCHES Supabase-Projekt. Ein zweiter Lauf schlägt mit
-- »type "user_role" already exists« fehl, weil Typen und Tabellen dann schon
-- da sind — das ist Absicht und schützt vor versehentlichem Überschreiben.
--
-- Läuft schon etwas in der Datenbank? Dann nimm supabase/reinstall.sql.
-- =============================================================================



-- ###########################################################################
-- ## 20260809090000_init_schema.sql
-- ###########################################################################

-- =============================================================================
-- AZD Transport — initial schema
-- =============================================================================
-- Money is stored in integer euro cents. Weights are numeric(9,2) kilograms.
-- Every table uses uuid primary keys and created_at / updated_at timestamps.
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.user_role as enum ('customer', 'driver', 'staff', 'admin');

create type public.country_code as enum ('DE', 'MA');

create type public.shipment_type as enum ('standard', 'bulky');

create type public.shipment_status as enum (
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'AT_GERMANY_HUB',
  'LOADED',
  'DEPARTED_GERMANY',
  'IN_TRANSIT',
  'ARRIVED_MOROCCO',
  'AT_MOROCCO_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
  'CANCELLED'
);

create type public.payment_status as enum ('unpaid', 'paid_cash', 'paid_online', 'invoiced');

create type public.payment_method as enum ('cash', 'bank_transfer', 'online', 'other');

create type public.trip_status as enum (
  'PLANNED', 'LOADING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED'
);

create type public.vehicle_status as enum ('available', 'on_trip', 'maintenance');

create type public.bulky_status as enum ('NEW', 'IN_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED');

create type public.pickup_status as enum (
  'scheduled', 'en_route', 'completed', 'failed', 'cancelled'
);

create type public.attachment_kind as enum (
  'bulky_photo', 'pickup_photo', 'delivery_photo', 'signature', 'seal_photo', 'document', 'other'
);

create type public.notification_channel as enum ('email', 'whatsapp', 'sms');

create type public.notification_status as enum ('queued', 'sent', 'failed', 'skipped');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 64 hex characters built from two UUIDv4 values (~244 bits of entropy).
-- Used for unguessable public tokens (QR scan links, bulky offer links).
create or replace function public.generate_token(p_length int default 40)
returns text
language sql
volatile
as $$
  select substr(
    translate(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
    1,
    greatest(16, least(64, p_length))
  );
$$;

-- -----------------------------------------------------------------------------
-- app_settings — one row, holds operational parameters editable by admins
-- -----------------------------------------------------------------------------

create table public.app_settings (
  id                boolean primary key default true constraint app_settings_singleton check (id),
  brand_name        text        not null default 'MaroCargo',
  tracking_prefix   text        not null default 'MC' check (tracking_prefix ~ '^[A-Z]{2,5}$'),
  price_per_kg_cents      integer not null default 200 check (price_per_kg_cents >= 0),
  minimum_price_cents     integer not null default 2000 check (minimum_price_cents >= 0),
  pickup_fee_cents        integer not null default 1000 check (pickup_fee_cents >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

insert into public.app_settings (id) values (true);

create trigger app_settings_touch before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- profiles — one row per auth.users entry, carries the role
-- -----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'customer',
  full_name   text,
  phone       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role) where is_active;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Every new auth user automatically gets a customer profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A user must never be able to promote themselves. Only a service-role
-- connection (auth.uid() is null) or an existing admin may change a role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_role public.user_role;
begin
  if new.role is distinct from old.role then
    if auth.uid() is null then
      return new; -- service role / SQL editor
    end if;
    select p.role into v_actor_role from public.profiles p where p.id = auth.uid();
    if v_actor_role is distinct from 'admin' then
      raise exception 'Nur Admins dürfen Rollen ändern.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Role helpers. SECURITY DEFINER so that RLS policies on `profiles` do not
-- recurse into themselves when other tables ask "is this user an admin?".
create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role from public.profiles p where p.id = auth.uid() and p.is_active;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.auth_role() = 'admin', false);
$$;

-- Staff and admins share the back-office permissions.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.auth_role() in ('staff', 'admin'), false);
$$;

create or replace function public.is_driver()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.auth_role() = 'driver', false);
$$;

-- -----------------------------------------------------------------------------
-- customers — the address book. A customer may or may not have a login.
-- -----------------------------------------------------------------------------

create table public.customers (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  first_name    text not null,
  last_name     text not null,
  email         text,
  phone         text not null,
  address_line1 text,
  postal_code   text,
  city          text,
  country       public.country_code,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index customers_profile_idx on public.customers (profile_id);
create index customers_email_idx on public.customers (lower(email));
create index customers_phone_idx on public.customers (phone);
create index customers_name_idx on public.customers (lower(last_name), lower(first_name));

create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- vehicles
-- -----------------------------------------------------------------------------

create table public.vehicles (
  id               uuid primary key default gen_random_uuid(),
  plate            text not null unique,
  make             text,
  model            text,
  gross_weight_kg  numeric(9,2) check (gross_weight_kg > 0),
  payload_kg       numeric(9,2) not null check (payload_kg > 0),
  cargo_volume_m3  numeric(7,2) check (cargo_volume_m3 > 0),
  status           public.vehicle_status not null default 'available',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index vehicles_status_idx on public.vehicles (status);

create trigger vehicles_touch before update on public.vehicles
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- trips — a transport run, e.g. FRANKFURT -> NADOR
-- -----------------------------------------------------------------------------

create table public.trips (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  origin_country       public.country_code not null,
  origin_city          text not null,
  destination_country  public.country_code not null,
  destination_city     text not null,
  departure_date       date not null,
  planned_arrival_date date,
  vehicle_id           uuid references public.vehicles(id) on delete set null,
  driver_id            uuid references public.profiles(id) on delete set null,
  status               public.trip_status not null default 'PLANNED',
  -- Falls back to the vehicle payload when null; lets ops override per trip.
  max_payload_kg       numeric(9,2) check (max_payload_kg > 0),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint trips_route_differs check (
    origin_country <> destination_country or origin_city <> destination_city
  ),
  constraint trips_arrival_after_departure check (
    planned_arrival_date is null or planned_arrival_date >= departure_date
  )
);

create index trips_status_idx on public.trips (status);
create index trips_departure_idx on public.trips (departure_date desc);
create index trips_driver_idx on public.trips (driver_id);

create trigger trips_touch before update on public.trips
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- shipments — the core entity
-- -----------------------------------------------------------------------------

create table public.shipments (
  id                    uuid primary key default gen_random_uuid(),
  tracking_number       text not null unique,
  -- Unguessable token behind the QR code. Never the tracking number itself.
  scan_token            text not null unique default public.generate_token(40),

  shipment_type         public.shipment_type not null default 'standard',
  status                public.shipment_status not null default 'BOOKED',

  customer_id           uuid references public.customers(id) on delete set null,
  created_by            uuid references public.profiles(id) on delete set null,

  -- Sender
  sender_first_name     text not null,
  sender_last_name      text not null,
  sender_phone          text not null,
  sender_email          text,
  sender_address        text not null,
  sender_postal_code    text,
  sender_city           text not null,
  sender_country        public.country_code not null,

  -- Recipient
  recipient_first_name  text not null,
  recipient_last_name   text not null,
  recipient_phone       text not null,
  recipient_address     text not null,
  recipient_city        text not null,
  recipient_country     public.country_code not null,

  -- Route (city slugs from src/config/regions.ts)
  origin_country        public.country_code not null,
  origin_city           text not null,
  destination_country   public.country_code not null,
  destination_city      text not null,

  -- Goods
  weight_kg             numeric(9,2) not null check (weight_kg > 0 and weight_kg <= 5000),
  piece_count           integer not null default 1 check (piece_count between 1 and 200),
  content_type          text,
  description           text,

  -- Pickup
  pickup_requested      boolean not null default false,
  pickup_date           date,

  -- Money (all integer cents, computed server-side)
  price_base_cents      integer not null default 0 check (price_base_cents >= 0),
  pickup_fee_cents      integer not null default 0 check (pickup_fee_cents >= 0),
  price_total_cents     integer not null default 0 check (price_total_cents >= 0),
  currency              text not null default 'EUR',
  payment_status        public.payment_status not null default 'unpaid',
  paid_at               timestamptz,

  assigned_driver_id    uuid references public.profiles(id) on delete set null,

  internal_notes        text,
  terms_accepted_at     timestamptz,
  prohibited_confirmed_at timestamptz,

  delivered_at          timestamptz,
  cancelled_at          timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint shipments_tracking_format check (tracking_number ~ '^[A-Z]{2,5}-[0-9]{6}-[0-9]{4,}$'),
  constraint shipments_route_differs check (origin_country <> destination_country)
);

create index shipments_status_idx on public.shipments (status);
create index shipments_created_idx on public.shipments (created_at desc);
create index shipments_customer_idx on public.shipments (customer_id);
create index shipments_created_by_idx on public.shipments (created_by);
create index shipments_driver_idx on public.shipments (assigned_driver_id);
create index shipments_payment_idx on public.shipments (payment_status);
create index shipments_route_idx on public.shipments (origin_country, destination_country);
create index shipments_pickup_idx on public.shipments (pickup_date) where pickup_requested;
create index shipments_sender_phone_idx on public.shipments (sender_phone);
create index shipments_recipient_phone_idx on public.shipments (recipient_phone);
create index shipments_sender_name_idx on public.shipments (lower(sender_last_name));
create index shipments_recipient_name_idx on public.shipments (lower(recipient_last_name));

create trigger shipments_touch before update on public.shipments
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- shipment_items — optional per-piece breakdown
-- -----------------------------------------------------------------------------

create table public.shipment_items (
  id           uuid primary key default gen_random_uuid(),
  shipment_id  uuid not null references public.shipments(id) on delete cascade,
  label        text not null,
  quantity     integer not null default 1 check (quantity > 0),
  weight_kg    numeric(9,2) check (weight_kg >= 0),
  description  text,
  created_at   timestamptz not null default now()
);

create index shipment_items_shipment_idx on public.shipment_items (shipment_id);

-- -----------------------------------------------------------------------------
-- tracking_events — append-only history
-- -----------------------------------------------------------------------------

create table public.tracking_events (
  id             uuid primary key default gen_random_uuid(),
  shipment_id    uuid not null references public.shipments(id) on delete cascade,
  status         public.shipment_status not null,
  occurred_at    timestamptz not null default now(),
  location       text,
  created_by     uuid references public.profiles(id) on delete set null,
  -- Shown on the public tracking page
  public_message text,
  -- Never leaves the back office
  internal_note  text,
  created_at     timestamptz not null default now()
);

create index tracking_events_shipment_idx on public.tracking_events (shipment_id, occurred_at desc);

-- Tracking history is immutable: it is the audit trail customers rely on.
create or replace function public.block_tracking_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Tracking-Events sind unveränderlich und dürfen nicht % werden.', tg_op
    using errcode = '42501';
end;
$$;

create trigger tracking_events_immutable
  before update or delete on public.tracking_events
  for each row execute function public.block_tracking_event_mutation();

-- -----------------------------------------------------------------------------
-- security_seals — tamper-evident bag / seal numbers
-- -----------------------------------------------------------------------------

create table public.security_seals (
  id           uuid primary key default gen_random_uuid(),
  shipment_id  uuid not null references public.shipments(id) on delete cascade,
  seal_number  text not null unique,
  sealed_at    timestamptz not null default now(),
  sealed_by    uuid references public.profiles(id) on delete set null,
  photo_path   text,
  note         text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index security_seals_shipment_idx on public.security_seals (shipment_id);
-- At most one active seal per shipment; older seals stay for the record.
create unique index security_seals_one_active_idx
  on public.security_seals (shipment_id) where is_active;

-- -----------------------------------------------------------------------------
-- trip_shipments — which shipment travels on which trip
-- -----------------------------------------------------------------------------

create table public.trip_shipments (
  trip_id      uuid not null references public.trips(id) on delete cascade,
  shipment_id  uuid not null references public.shipments(id) on delete cascade,
  added_at     timestamptz not null default now(),
  added_by     uuid references public.profiles(id) on delete set null,
  primary key (trip_id, shipment_id)
);

-- A shipment can only be on one trip at a time.
create unique index trip_shipments_shipment_unique_idx on public.trip_shipments (shipment_id);
create index trip_shipments_trip_idx on public.trip_shipments (trip_id);

-- -----------------------------------------------------------------------------
-- pickup_assignments — driver pickups at the customer's door
-- -----------------------------------------------------------------------------

create table public.pickup_assignments (
  id                uuid primary key default gen_random_uuid(),
  shipment_id       uuid not null references public.shipments(id) on delete cascade,
  driver_id         uuid references public.profiles(id) on delete set null,
  scheduled_date    date not null,
  time_window_start time,
  time_window_end   time,
  status            public.pickup_status not null default 'scheduled',
  completed_at      timestamptz,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index pickup_assignments_shipment_idx on public.pickup_assignments (shipment_id);
create index pickup_assignments_driver_date_idx
  on public.pickup_assignments (driver_id, scheduled_date);
create index pickup_assignments_date_idx on public.pickup_assignments (scheduled_date);

create trigger pickup_assignments_touch before update on public.pickup_assignments
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- payments — ledger; prepared for online payments later
-- -----------------------------------------------------------------------------

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  shipment_id   uuid not null references public.shipments(id) on delete cascade,
  amount_cents  integer not null check (amount_cents <> 0),
  method        public.payment_method not null default 'cash',
  reference     text,
  received_by   uuid references public.profiles(id) on delete set null,
  received_at   timestamptz not null default now(),
  note          text,
  created_at    timestamptz not null default now()
);

create index payments_shipment_idx on public.payments (shipment_id);
create index payments_received_idx on public.payments (received_at desc);

-- -----------------------------------------------------------------------------
-- bulky_item_requests — manual quotes for oversized goods
-- -----------------------------------------------------------------------------

create table public.bulky_item_requests (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique,
  -- Unguessable link the customer receives to view and accept the quote
  public_token        text not null unique default public.generate_token(40),

  origin_country      public.country_code not null,
  origin_city         text not null,
  destination_country public.country_code not null,
  destination_city    text not null,

  item_type           text not null,
  item_description    text,
  approx_weight_kg    numeric(9,2) check (approx_weight_kg > 0),
  length_cm           integer check (length_cm > 0),
  width_cm            integer check (width_cm > 0),
  height_cm           integer check (height_cm > 0),

  contact_first_name  text not null,
  contact_last_name   text not null,
  phone               text not null,
  email               text,
  pickup_requested    boolean not null default false,
  notes               text,

  status              public.bulky_status not null default 'NEW',
  quoted_price_cents  integer check (quoted_price_cents >= 0),
  quote_note          text,
  quoted_at           timestamptz,
  quoted_by           uuid references public.profiles(id) on delete set null,
  accepted_at         timestamptz,
  rejected_at         timestamptz,
  shipment_id         uuid references public.shipments(id) on delete set null,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint bulky_quote_requires_price check (
    status <> 'QUOTED' or quoted_price_cents is not null
  )
);

create index bulky_requests_status_idx on public.bulky_item_requests (status);
create index bulky_requests_created_idx on public.bulky_item_requests (created_at desc);

create trigger bulky_requests_touch before update on public.bulky_item_requests
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- attachments — metadata for files in Supabase Storage (private buckets)
-- -----------------------------------------------------------------------------

create table public.attachments (
  id                uuid primary key default gen_random_uuid(),
  shipment_id       uuid references public.shipments(id) on delete cascade,
  bulky_request_id  uuid references public.bulky_item_requests(id) on delete cascade,
  kind              public.attachment_kind not null default 'other',
  bucket            text not null,
  path              text not null,
  mime_type         text,
  size_bytes        integer check (size_bytes >= 0),
  caption           text,
  uploaded_by       uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  constraint attachments_one_parent check (
    (shipment_id is not null)::int + (bulky_request_id is not null)::int = 1
  ),
  constraint attachments_unique_object unique (bucket, path)
);

create index attachments_shipment_idx on public.attachments (shipment_id);
create index attachments_bulky_idx on public.attachments (bulky_request_id);

-- -----------------------------------------------------------------------------
-- notification_logs — one row per outbound message attempt
-- -----------------------------------------------------------------------------

create table public.notification_logs (
  id                  uuid primary key default gen_random_uuid(),
  shipment_id         uuid references public.shipments(id) on delete set null,
  bulky_request_id    uuid references public.bulky_item_requests(id) on delete set null,
  channel             public.notification_channel not null,
  template            text not null,
  -- Stored so support can prove what was sent where. Treated as personal data.
  recipient           text not null,
  subject             text,
  status              public.notification_status not null default 'queued',
  provider            text,
  provider_message_id text,
  error               text,
  created_at          timestamptz not null default now()
);

create index notification_logs_shipment_idx on public.notification_logs (shipment_id);
create index notification_logs_created_idx on public.notification_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- audit_logs — who changed what, when, from which value to which
-- -----------------------------------------------------------------------------

create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_role   public.user_role,
  actor_label  text,
  entity_type  text not null,
  entity_id    uuid,
  entity_label text,
  action       text not null,
  field        text,
  old_value    text,
  new_value    text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id);

-- -----------------------------------------------------------------------------
-- tracking_counters — race-safe per-day sequence for tracking numbers
-- -----------------------------------------------------------------------------

create table public.tracking_counters (
  prefix    text not null,
  day       date not null,
  last_seq  integer not null default 0,
  primary key (prefix, day)
);


-- ###########################################################################
-- ## 20260809091000_functions.sql
-- ###########################################################################

-- =============================================================================
-- AZD Transport — server-side business functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tracking numbers:  MC-260809-0042
--
-- Race safety: the INSERT ... ON CONFLICT DO UPDATE ... RETURNING takes a row
-- lock on the counter row, so two concurrent bookings on the same day are
-- serialised by Postgres and can never receive the same sequence number.
-- -----------------------------------------------------------------------------

create or replace function public.next_tracking_number()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_prefix text;
  v_day    date := (now() at time zone 'Europe/Berlin')::date;
  v_seq    integer;
begin
  select s.tracking_prefix into v_prefix from public.app_settings s where s.id limit 1;
  v_prefix := coalesce(v_prefix, 'MC');

  insert into public.tracking_counters as tc (prefix, day, last_seq)
  values (v_prefix, v_day, 1)
  on conflict (prefix, day)
    do update set last_seq = tc.last_seq + 1
  returning tc.last_seq into v_seq;

  return v_prefix || '-' || to_char(v_day, 'YYMMDD') || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- The tracking number is ALWAYS generated here. Whatever the client sends is
-- discarded, and the number can never be changed after creation.
create or replace function public.assign_tracking_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    -- Both values are assigned unconditionally: whatever the caller sent is
    -- discarded. A caller-chosen scan token would make the QR code on the
    -- label guessable, so this must never fall back to the supplied value.
    new.tracking_number := public.next_tracking_number();
    new.scan_token := public.generate_token(40);
    return new;
  end if;

  if new.tracking_number is distinct from old.tracking_number then
    raise exception 'Die Sendungsnummer kann nicht geändert werden.' using errcode = '42501';
  end if;
  if new.scan_token is distinct from old.scan_token then
    raise exception 'Der Scan-Token kann nicht geändert werden.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger shipments_assign_tracking_number
  before insert or update on public.shipments
  for each row execute function public.assign_tracking_number();

-- Keep the derived timestamps in sync with the status.
create or replace function public.sync_shipment_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'DELIVERED' and new.delivered_at is null then
    new.delivered_at := now();
  end if;
  if new.status = 'CANCELLED' and new.cancelled_at is null then
    new.cancelled_at := now();
  end if;
  if new.payment_status in ('paid_cash', 'paid_online') and new.paid_at is null then
    new.paid_at := now();
  end if;
  if new.payment_status = 'unpaid' then
    new.paid_at := null;
  end if;
  return new;
end;
$$;

create trigger shipments_sync_timestamps
  before insert or update on public.shipments
  for each row execute function public.sync_shipment_status_timestamps();

-- Every shipment starts its history with a BOOKED event.
create or replace function public.create_initial_tracking_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.tracking_events (shipment_id, status, occurred_at, public_message, created_by)
  values (
    new.id,
    new.status,
    new.created_at,
    'Deine Sendung wurde gebucht und ist bei uns registriert.',
    new.created_by
  );
  return new;
end;
$$;

create trigger shipments_initial_event
  after insert on public.shipments
  for each row execute function public.create_initial_tracking_event();

-- -----------------------------------------------------------------------------
-- Bulky request references:  BQ-260809-0007
-- -----------------------------------------------------------------------------

create or replace function public.assign_bulky_reference()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day date := (now() at time zone 'Europe/Berlin')::date;
  v_seq integer;
begin
  if tg_op = 'INSERT' then
    insert into public.tracking_counters as tc (prefix, day, last_seq)
    values ('BQ', v_day, 1)
    on conflict (prefix, day)
      do update set last_seq = tc.last_seq + 1
    returning tc.last_seq into v_seq;

    new.reference := 'BQ-' || to_char(v_day, 'YYMMDD') || '-' || lpad(v_seq::text, 4, '0');
    new.public_token := coalesce(nullif(new.public_token, ''), public.generate_token(40));
    return new;
  end if;

  if new.reference is distinct from old.reference
     or new.public_token is distinct from old.public_token then
    raise exception 'Referenz und Token sind unveränderlich.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger bulky_requests_assign_reference
  before insert or update on public.bulky_item_requests
  for each row execute function public.assign_bulky_reference();

-- -----------------------------------------------------------------------------
-- Audit logging for shipments
-- -----------------------------------------------------------------------------

create or replace function public.audit_shipment_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id   uuid := auth.uid();
  v_actor_role public.user_role;
  v_actor_label text;
begin
  select p.role, coalesce(p.full_name, p.id::text)
    into v_actor_role, v_actor_label
    from public.profiles p where p.id = v_actor_id;

  if tg_op = 'INSERT' then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, metadata)
    values (
      v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number, 'created',
      jsonb_build_object(
        'status', new.status,
        'weight_kg', new.weight_kg,
        'price_total_cents', new.price_total_cents
      )
    );
    return new;
  end if;

  -- One audit row per changed field, so the history reads as a plain diff.
  if new.status is distinct from old.status then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'status_changed', 'status', old.status::text, new.status::text);
  end if;

  if new.price_total_cents is distinct from old.price_total_cents then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'price_changed', 'price_total_cents', old.price_total_cents::text, new.price_total_cents::text);
  end if;

  if new.weight_kg is distinct from old.weight_kg then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'weight_changed', 'weight_kg', old.weight_kg::text, new.weight_kg::text);
  end if;

  if new.payment_status is distinct from old.payment_status then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'payment_changed', 'payment_status', old.payment_status::text, new.payment_status::text);
  end if;

  if new.assigned_driver_id is distinct from old.assigned_driver_id then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'driver_changed', 'assigned_driver_id', old.assigned_driver_id::text, new.assigned_driver_id::text);
  end if;

  if new.piece_count is distinct from old.piece_count then
    insert into public.audit_logs
      (actor_id, actor_role, actor_label, entity_type, entity_id, entity_label, action, field, old_value, new_value)
    values (v_actor_id, v_actor_role, v_actor_label, 'shipment', new.id, new.tracking_number,
            'pieces_changed', 'piece_count', old.piece_count::text, new.piece_count::text);
  end if;

  return new;
end;
$$;

create trigger shipments_audit
  after insert or update on public.shipments
  for each row execute function public.audit_shipment_changes();

create or replace function public.audit_seal_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
begin
  select p.role into v_actor_role from public.profiles p where p.id = v_actor_id;

  insert into public.audit_logs
    (actor_id, actor_role, entity_type, entity_id, action, field, old_value, new_value)
  values (
    v_actor_id, v_actor_role, 'shipment', new.shipment_id,
    case tg_op when 'INSERT' then 'seal_added' else 'seal_changed' end,
    'seal_number',
    case tg_op when 'UPDATE' then old.seal_number else null end,
    new.seal_number
  );
  return new;
end;
$$;

create trigger security_seals_audit
  after insert or update on public.security_seals
  for each row execute function public.audit_seal_changes();

-- -----------------------------------------------------------------------------
-- PUBLIC TRACKING
--
-- The only function reachable by anonymous visitors. It deliberately returns a
-- narrow, hand-picked set of fields: no addresses, no phone numbers, no email,
-- no internal notes, no prices, no internal ids.
-- -----------------------------------------------------------------------------

create or replace function public.get_public_tracking(p_tracking_number text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_number text := upper(regexp_replace(coalesce(p_tracking_number, ''), '\s', '', 'g'));
  v_shipment public.shipments;
  v_seal text;
  v_events jsonb;
begin
  if v_number !~ '^[A-Z]{2,5}-[0-9]{6}-[0-9]{4,}$' then
    return null;
  end if;

  select * into v_shipment from public.shipments s where s.tracking_number = v_number;
  if not found then
    return null;
  end if;

  select ss.seal_number into v_seal
    from public.security_seals ss
   where ss.shipment_id = v_shipment.id and ss.is_active
   limit 1;

  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'status', e.status,
          'occurred_at', e.occurred_at,
          'location', e.location,
          'message', e.public_message
        ) order by e.occurred_at desc, e.created_at desc
      ),
      '[]'::jsonb
    )
    into v_events
    from public.tracking_events e
   where e.shipment_id = v_shipment.id;

  return jsonb_build_object(
    'tracking_number', v_shipment.tracking_number,
    'status', v_shipment.status,
    'shipment_type', v_shipment.shipment_type,
    'origin_country', v_shipment.origin_country,
    'origin_city', v_shipment.origin_city,
    'destination_country', v_shipment.destination_country,
    'destination_city', v_shipment.destination_city,
    'piece_count', v_shipment.piece_count,
    'weight_kg', v_shipment.weight_kg,
    'pickup_requested', v_shipment.pickup_requested,
    -- Only the recipient's first name, never the full identity
    'recipient_first_name', v_shipment.recipient_first_name,
    'seal_number', v_seal,
    'booked_at', v_shipment.created_at,
    'last_update', v_shipment.updated_at,
    'delivered_at', v_shipment.delivered_at,
    'events', v_events
  );
end;
$$;

revoke all on function public.get_public_tracking(text) from public;
grant execute on function public.get_public_tracking(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Trip capacity — internal only
-- -----------------------------------------------------------------------------

create or replace view public.trip_capacity
with (security_invoker = true)
as
select
  t.id as trip_id,
  t.code,
  coalesce(t.max_payload_kg, v.payload_kg) as max_payload_kg,
  coalesce(sum(s.weight_kg), 0)::numeric(9,2) as loaded_weight_kg,
  greatest(coalesce(t.max_payload_kg, v.payload_kg, 0) - coalesce(sum(s.weight_kg), 0), 0)::numeric(9,2)
    as free_capacity_kg,
  count(s.id) as shipment_count
from public.trips t
left join public.vehicles v on v.id = t.vehicle_id
left join public.trip_shipments ts on ts.trip_id = t.id
left join public.shipments s on s.id = ts.shipment_id and s.status <> 'CANCELLED'
group by t.id, t.code, t.max_payload_kg, v.payload_kg;

-- -----------------------------------------------------------------------------
-- Dashboard aggregates — one round trip instead of a dozen count queries
-- -----------------------------------------------------------------------------

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'Europe/Berlin')::date;
  v_result jsonb;
begin
  if not public.is_staff() then
    raise exception 'Kein Zugriff.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'shipments_today', count(*) filter (
      where (s.created_at at time zone 'Europe/Berlin')::date = v_today
    ),
    'open_pickups', count(*) filter (
      where s.pickup_requested and s.status in ('BOOKED', 'PICKUP_SCHEDULED')
    ),
    'in_transit', count(*) filter (
      where s.status in ('LOADED', 'DEPARTED_GERMANY', 'IN_TRANSIT')
    ),
    'arrived_morocco', count(*) filter (
      where s.status in ('ARRIVED_MOROCCO', 'AT_MOROCCO_HUB', 'OUT_FOR_DELIVERY')
    ),
    'delivered_total', count(*) filter (where s.status = 'DELIVERED'),
    'exceptions', count(*) filter (where s.status = 'EXCEPTION'),
    'unpaid', count(*) filter (
      where s.payment_status = 'unpaid' and s.status <> 'CANCELLED'
    ),
    'active_weight_kg', coalesce(sum(s.weight_kg) filter (
      where s.status not in ('DELIVERED', 'CANCELLED')
    ), 0),
    'revenue_today_cents', coalesce(sum(s.price_total_cents) filter (
      where (s.created_at at time zone 'Europe/Berlin')::date = v_today and s.status <> 'CANCELLED'
    ), 0),
    'revenue_week_cents', coalesce(sum(s.price_total_cents) filter (
      where s.created_at >= date_trunc('week', now() at time zone 'Europe/Berlin')
        and s.status <> 'CANCELLED'
    ), 0),
    'revenue_month_cents', coalesce(sum(s.price_total_cents) filter (
      where s.created_at >= date_trunc('month', now() at time zone 'Europe/Berlin')
        and s.status <> 'CANCELLED'
    ), 0),
    'open_bulky_requests', (
      select count(*) from public.bulky_item_requests b where b.status in ('NEW', 'IN_REVIEW')
    )
  )
  into v_result
  from public.shipments s;

  return v_result;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to authenticated;


-- ###########################################################################
-- ## 20260809092000_rls.sql
-- ###########################################################################

-- =============================================================================
-- AZD Transport — Row Level Security
-- =============================================================================
-- Threat model
-- ------------
-- The anon key is public by definition (it ships in the browser bundle). These
-- policies decide what someone holding that key — or a logged-in customer's
-- session — can reach through PostgREST directly.
--
-- All privileged WRITES in the application go through server-side code that
-- authenticates the user, checks the role in TypeScript and then uses the
-- service-role key. RLS is the second lock on the same door: even if an
-- application-level check were missed, a customer session still cannot read or
-- write another customer's data.
--
-- Default posture: every table denies everything, then we open the minimum.
-- =============================================================================

alter table public.app_settings         enable row level security;
alter table public.profiles             enable row level security;
alter table public.customers            enable row level security;
alter table public.shipments            enable row level security;
alter table public.shipment_items       enable row level security;
alter table public.tracking_events      enable row level security;
alter table public.security_seals       enable row level security;
alter table public.trips                enable row level security;
alter table public.trip_shipments       enable row level security;
alter table public.vehicles             enable row level security;
alter table public.payments             enable row level security;
alter table public.pickup_assignments   enable row level security;
alter table public.bulky_item_requests  enable row level security;
alter table public.attachments          enable row level security;
alter table public.notification_logs    enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.tracking_counters    enable row level security;

-- Counters are only ever touched by SECURITY DEFINER functions: no policies at
-- all means no direct access for anon or authenticated.

-- -----------------------------------------------------------------------------
-- Visibility helper
-- -----------------------------------------------------------------------------

create or replace function public.can_view_shipment(p_shipment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.shipments s
     where s.id = p_shipment_id
       and (
            public.is_staff()
         or s.created_by = auth.uid()
         or s.customer_id in (
              select c.id from public.customers c where c.profile_id = auth.uid()
            )
         or (
              public.is_driver()
              and (
                   s.assigned_driver_id = auth.uid()
                or exists (
                     select 1 from public.pickup_assignments pa
                      where pa.shipment_id = s.id and pa.driver_id = auth.uid()
                   )
                or exists (
                     select 1
                       from public.trip_shipments ts
                       join public.trips t on t.id = ts.trip_id
                      where ts.shipment_id = s.id and t.driver_id = auth.uid()
                   )
              )
            )
       )
  );
$$;

-- -----------------------------------------------------------------------------
-- app_settings
-- -----------------------------------------------------------------------------

create policy "settings readable by staff"
  on public.app_settings for select to authenticated
  using (public.is_staff());

create policy "settings writable by admins"
  on public.app_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create policy "read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "staff read all profiles"
  on public.profiles for select to authenticated
  using (public.is_staff());

-- Users may edit their own name/phone. The role column is additionally guarded
-- by the profiles_guard_role trigger, which rejects self-promotion.
create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "admins manage profiles"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------

create policy "staff manage customers"
  on public.customers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read own customer record"
  on public.customers for select to authenticated
  using (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- shipments
-- -----------------------------------------------------------------------------

create policy "view permitted shipments"
  on public.shipments for select to authenticated
  using (public.can_view_shipment(id));

create policy "staff manage shipments"
  on public.shipments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Deliberately absent: any INSERT policy for customers. Bookings are created
-- server-side so that price, tracking number and status cannot be forged.

-- -----------------------------------------------------------------------------
-- shipment_items
-- -----------------------------------------------------------------------------

create policy "view items of permitted shipments"
  on public.shipment_items for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff manage items"
  on public.shipment_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- tracking_events
--
-- No UPDATE or DELETE policy exists for anybody, and the
-- tracking_events_immutable trigger blocks it even for the service role.
-- -----------------------------------------------------------------------------

create policy "view events of permitted shipments"
  on public.tracking_events for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff and drivers add events"
  on public.tracking_events for insert to authenticated
  with check (
    (public.is_staff() or public.is_driver())
    and public.can_view_shipment(shipment_id)
  );

-- -----------------------------------------------------------------------------
-- security_seals
-- -----------------------------------------------------------------------------

create policy "view seals of permitted shipments"
  on public.security_seals for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff manage seals"
  on public.security_seals for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers add seals"
  on public.security_seals for insert to authenticated
  with check (public.is_driver() and public.can_view_shipment(shipment_id));

-- -----------------------------------------------------------------------------
-- trips, trip_shipments, vehicles — internal operations data
-- -----------------------------------------------------------------------------

create policy "staff manage trips"
  on public.trips for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own trips"
  on public.trips for select to authenticated
  using (public.is_driver() and driver_id = auth.uid());

create policy "staff manage trip shipments"
  on public.trip_shipments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own trip shipments"
  on public.trip_shipments for select to authenticated
  using (
    public.is_driver()
    and exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid())
  );

create policy "staff manage vehicles"
  on public.vehicles for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read vehicles"
  on public.vehicles for select to authenticated
  using (public.is_driver());

-- -----------------------------------------------------------------------------
-- pickup_assignments
-- -----------------------------------------------------------------------------

create policy "staff manage pickups"
  on public.pickup_assignments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own pickups"
  on public.pickup_assignments for select to authenticated
  using (public.is_driver() and driver_id = auth.uid());

create policy "drivers update own pickups"
  on public.pickup_assignments for update to authenticated
  using (public.is_driver() and driver_id = auth.uid())
  with check (public.is_driver() and driver_id = auth.uid());

create policy "customers read own pickups"
  on public.pickup_assignments for select to authenticated
  using (public.can_view_shipment(shipment_id));

-- -----------------------------------------------------------------------------
-- payments — money is back-office only, never readable by customers directly
-- -----------------------------------------------------------------------------

create policy "staff manage payments"
  on public.payments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- bulky_item_requests
--
-- Public submissions and the token-based offer page are handled server-side,
-- so anon needs no direct access here at all.
-- -----------------------------------------------------------------------------

create policy "staff manage bulky requests"
  on public.bulky_item_requests for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- attachments — metadata only; the files live in private Storage buckets
-- -----------------------------------------------------------------------------

create policy "staff manage attachments"
  on public.attachments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "view attachments of permitted shipments"
  on public.attachments for select to authenticated
  using (shipment_id is not null and public.can_view_shipment(shipment_id));

create policy "drivers add attachments"
  on public.attachments for insert to authenticated
  with check (
    public.is_driver()
    and shipment_id is not null
    and public.can_view_shipment(shipment_id)
  );

-- -----------------------------------------------------------------------------
-- notification_logs & audit_logs — admin-only, contain personal data
-- -----------------------------------------------------------------------------

create policy "admins read notification logs"
  on public.notification_logs for select to authenticated
  using (public.is_admin());

create policy "admins read audit logs"
  on public.audit_logs for select to authenticated
  using (public.is_admin());

-- Audit rows are written by SECURITY DEFINER triggers and the server. Nobody
-- gets UPDATE or DELETE — not even admins — so the trail cannot be rewritten.


-- ###########################################################################
-- ## 20260809093000_storage.sql
-- ###########################################################################

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


-- ###########################################################################
-- ## 20260809094000_hardening.sql
-- ###########################################################################

-- =============================================================================
-- Hardening: protect `is_active` the same way `role` is protected
-- =============================================================================
-- The "update own profile" policy lets people fix their own name and phone
-- number. Without this guard it would also let a *deactivated* account set
-- is_active back to true and walk straight back in — the RLS policy only
-- checks `id = auth.uid()`, which a deactivated user still satisfies.
--
-- Both privileged columns are now handled by one trigger function.
-- =============================================================================

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_role public.user_role;
  v_actor_active boolean;
begin
  -- Nothing privileged changed: allow.
  if new.role is not distinct from old.role
     and new.is_active is not distinct from old.is_active then
    return new;
  end if;

  -- Service role / SQL editor: no auth.uid(), full control.
  if auth.uid() is null then
    return new;
  end if;

  select p.role, p.is_active
    into v_actor_role, v_actor_active
    from public.profiles p
   where p.id = auth.uid();

  if v_actor_role is distinct from 'admin' or not coalesce(v_actor_active, false) then
    raise exception 'Nur aktive Admins dürfen Rolle oder Aktivierung ändern.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- The trigger itself already exists (created in the initial migration) and
-- points at this function, so replacing the function is enough.


-- =============================================================================
-- Hardening: the scan token is always generated, never accepted from a caller
-- =============================================================================
-- The first version fell back to a supplied value when it was non-empty. The
-- application never sends one, but a guessable token would make the QR code on
-- a label readable by anyone, so the value is now overwritten unconditionally.
-- =============================================================================

create or replace function public.assign_tracking_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.tracking_number := public.next_tracking_number();
    new.scan_token := public.generate_token(40);
    return new;
  end if;

  if new.tracking_number is distinct from old.tracking_number then
    raise exception 'Die Sendungsnummer kann nicht geändert werden.' using errcode = '42501';
  end if;
  if new.scan_token is distinct from old.scan_token then
    raise exception 'Der Scan-Token kann nicht geändert werden.' using errcode = '42501';
  end if;
  return new;
end;
$$;


-- ###########################################################################
-- ## 20260810090000_history_lifecycle.sql
-- ###########################################################################

-- =============================================================================
-- AZD Transport — Trackinghistorie: unveränderlich, aber nicht unlöschbar
-- =============================================================================
-- Die ursprüngliche Regel war zu grob. Sie verbot jedes UPDATE und jedes DELETE
-- auf tracking_events und machte damit zwei völlig legitime Vorgänge unmöglich:
--
--   1. Ein Benutzerkonto löschen. Der Fremdschlüssel created_by steht auf
--      ON DELETE SET NULL, und dieses Nullsetzen ist ein UPDATE. Wer je einen
--      Status gesetzt hatte, ließ sich damit nicht mehr entfernen — auch nicht
--      auf Verlangen nach Art. 17 DSGVO.
--
--   2. Eine Sendung löschen. Der Fremdschlüssel shipment_id steht auf
--      ON DELETE CASCADE, und dieses Mitlöschen ist ein DELETE. Eine
--      Fehlbuchung blieb dadurch dauerhaft im Bestand.
--
-- Beides fiel erst im Betrieb auf, weil eine frische Datenbank keine Historie
-- hat, an der die Sperre greifen könnte.
--
-- Die Zusage, um die es eigentlich geht, bleibt unangetastet: Ein einmal
-- geschriebener Trackingeintrag darf inhaltlich nie wieder verändert und nie
-- einzeln entfernt werden. Erlaubt sind ab jetzt genau zwei Ausnahmen:
--
--   · das Anonymisieren des Urhebers (created_by → null), wobei kein anderes
--     Feld abweichen darf,
--   · das Mitlöschen, wenn die zugehörige Sendung nicht mehr existiert.
--
-- Die zweite Bedingung ist genauer als sie aussieht: PostgreSQL entfernt beim
-- Kaskadieren zuerst die Sendung und danach die abhängigen Zeilen. Innerhalb
-- des Löschvorgangs ist die Sendung also bereits weg, während sie bei einem
-- direkten `delete from tracking_events` noch da wäre. Genau daran lassen sich
-- die beiden Fälle unterscheiden.
-- =============================================================================

create or replace function public.block_tracking_event_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    -- Erlaubt: ausschließlich das Anonymisieren des Urhebers.
    if old.created_by is not null
       and new.created_by is null
       and new.id             is not distinct from old.id
       and new.shipment_id    is not distinct from old.shipment_id
       and new.status         is not distinct from old.status
       and new.occurred_at    is not distinct from old.occurred_at
       and new.location       is not distinct from old.location
       and new.public_message is not distinct from old.public_message
       and new.internal_note  is not distinct from old.internal_note
       and new.created_at     is not distinct from old.created_at
    then
      return new;
    end if;

    raise exception
      'Tracking-Events sind unveränderlich. Erlaubt ist nur das Anonymisieren '
      'des Urhebers beim Löschen eines Kontos.'
      using errcode = '42501';
  end if;

  -- tg_op = 'DELETE': nur zulässig, wenn die Sendung selbst schon fort ist.
  if not exists (select 1 from public.shipments s where s.id = old.shipment_id) then
    return old;
  end if;

  raise exception
    'Ein Tracking-Event darf nicht einzeln gelöscht werden. Lösche die Sendung, '
    'dann verschwindet ihre Historie mit ihr.'
    using errcode = '42501';
end;
$$;


-- ###########################################################################
-- ## 20260810120000_brand_azd_transport.sql
-- ###########################################################################

-- =============================================================================
-- AZD Transport — Marke und Nummernpräfix angleichen
-- =============================================================================
-- Sendungsnummern werden in der Datenbank vergeben, nicht in der Anwendung.
-- Marke und Präfix stehen deshalb in app_settings und müssen beim Umbenennen
-- mitgezogen werden — sonst zeigt die Website „AZD Transport“, während die
-- Nummern weiter mit MC- beginnen.
--
-- Bereits vergebene Nummern bleiben unverändert. Eine Sendungsnummer ist die
-- Referenz, unter der eine Kundin ihr Paket sucht und die auf dem aufgeklebten
-- Etikett steht; sie nachträglich umzuschreiben würde jedes gedruckte Etikett
-- entwerten. Die Sendungsverfolgung akzeptiert jedes Präfix aus zwei bis fünf
-- Großbuchstaben, alte und neue Nummern funktionieren also nebeneinander.
-- =============================================================================

alter table public.app_settings
  alter column brand_name set default 'AZD Transport',
  alter column tracking_prefix set default 'AZD';

update public.app_settings
   set brand_name = 'AZD Transport',
       tracking_prefix = 'AZD',
       updated_at = now()
 where tracking_prefix = 'MC';

-- Der Tageszähler in tracking_counters ist über (prefix, day) eindeutig. Mit
-- einem neuen Präfix beginnt die laufende Nummer des Tages deshalb wieder bei
-- 0001 — AZD-260810-0001 kann neben einem schon vergebenen MC-260810-0003
-- stehen. Das ist unkritisch: die Eindeutigkeit hängt an der vollständigen
-- Nummer, und die enthält das Präfix.
