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
