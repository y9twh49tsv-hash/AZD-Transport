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
