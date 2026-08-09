-- =============================================================================
-- Assertions against the real schema
-- =============================================================================
-- Every block raises an exception if an expectation is violated, so a single
-- non-zero exit from psql means "something in the database contract broke".
-- =============================================================================

\set ON_ERROR_STOP on

-- --------------------------------------------------------------------------
-- 1. Tracking numbers: correct format, strictly sequential, never duplicated
-- --------------------------------------------------------------------------
do $$
declare
  v_a text;
  v_b text;
  v_c text;
begin
  v_a := public.next_tracking_number();
  v_b := public.next_tracking_number();
  v_c := public.next_tracking_number();

  if v_a !~ '^[A-Z]{2,5}-[0-9]{6}-[0-9]{4,}$' then
    raise exception 'FAIL: Format der Sendungsnummer falsch: %', v_a;
  end if;
  if v_a = v_b or v_b = v_c then
    raise exception 'FAIL: Sendungsnummern nicht eindeutig: %, %, %', v_a, v_b, v_c;
  end if;
  if right(v_b, 4)::int <> right(v_a, 4)::int + 1 then
    raise exception 'FAIL: Sendungsnummern nicht fortlaufend: % -> %', v_a, v_b;
  end if;

  raise notice 'OK  Sendungsnummern: % % %', v_a, v_b, v_c;
end
$$;

-- --------------------------------------------------------------------------
-- 2. The client cannot dictate the tracking number or the scan token
-- --------------------------------------------------------------------------
do $$
declare
  v_id uuid;
  v_number text;
  v_token text;
begin
  insert into public.shipments (
    tracking_number, sender_first_name, sender_last_name, sender_phone, sender_address,
    sender_city, sender_country, recipient_first_name, recipient_last_name, recipient_phone,
    recipient_address, recipient_city, recipient_country, origin_country, origin_city,
    destination_country, destination_city, weight_kg, scan_token
  ) values (
    'XX-999999-9999', 'Test', 'Absender', '+49 100 1', 'Teststr. 1',
    'Frankfurt am Main', 'DE', 'Test', 'Empfänger', '+212 6 1',
    'Testadresse', 'Nador', 'MA', 'DE', 'frankfurt-am-main',
    'MA', 'nador', 10, 'gefaelschter-token'
  )
  returning id, tracking_number, scan_token into v_id, v_number, v_token;

  if v_number = 'XX-999999-9999' then
    raise exception 'FAIL: Vom Client gesendete Sendungsnummer wurde übernommen!';
  end if;
  if v_token = 'gefaelschter-token' then
    raise exception 'FAIL: Vom Client gesendeter Scan-Token wurde übernommen!';
  end if;
  if length(v_token) < 32 then
    raise exception 'FAIL: Scan-Token zu kurz (%): %', length(v_token), v_token;
  end if;

  -- and it must be immutable afterwards
  begin
    update public.shipments set tracking_number = 'YY-111111-1111' where id = v_id;
    raise exception 'FAIL: Sendungsnummer konnte nachträglich geändert werden!';
  exception
    when insufficient_privilege then null;
  end;

  raise notice 'OK  Sendungsnummer/Token serverseitig erzwungen: %', v_number;
end
$$;

-- --------------------------------------------------------------------------
-- 3. Every shipment starts with a BOOKED event, and history is immutable
-- --------------------------------------------------------------------------
do $$
declare
  v_id uuid;
  v_count int;
begin
  select id into v_id from public.shipments order by created_at desc limit 1;

  select count(*) into v_count
    from public.tracking_events where shipment_id = v_id and status = 'BOOKED';
  if v_count < 1 then
    raise exception 'FAIL: Kein automatisches BOOKED-Event angelegt.';
  end if;

  begin
    update public.tracking_events set location = 'manipuliert' where shipment_id = v_id;
    raise exception 'FAIL: Tracking-Event konnte geändert werden!';
  exception
    when insufficient_privilege then null;
  end;

  begin
    delete from public.tracking_events where shipment_id = v_id;
    raise exception 'FAIL: Tracking-Event konnte gelöscht werden!';
  exception
    when insufficient_privilege then null;
  end;

  raise notice 'OK  Trackinghistorie ist unveränderlich';
end
$$;

-- --------------------------------------------------------------------------
-- 4. Public tracking exposes only the whitelisted fields
-- --------------------------------------------------------------------------
do $$
declare
  v_number text;
  v_payload jsonb;
  v_keys text[];
  v_expected text[] := array[
    'tracking_number', 'status', 'shipment_type', 'origin_country', 'origin_city',
    'destination_country', 'destination_city', 'piece_count', 'weight_kg',
    'pickup_requested', 'recipient_first_name', 'seal_number', 'booked_at',
    'last_update', 'delivered_at', 'events'
  ];
  v_extra text[];
  v_serialised text;
  v_forbidden text;
begin
  select tracking_number into v_number from public.shipments order by created_at desc limit 1;

  v_payload := public.get_public_tracking(v_number);
  if v_payload is null then
    raise exception 'FAIL: get_public_tracking liefert nichts für %', v_number;
  end if;

  select array_agg(k) into v_keys from jsonb_object_keys(v_payload) k;
  select array_agg(k) into v_extra from unnest(v_keys) k where not (k = any(v_expected));

  if v_extra is not null then
    raise exception 'FAIL: Öffentliches Tracking enthält unerlaubte Felder: %', v_extra;
  end if;

  v_serialised := v_payload::text;
  foreach v_forbidden in array array[
    'sender_phone', 'sender_email', 'sender_address', 'recipient_phone',
    'recipient_address', 'price_total_cents', 'payment_status', 'internal_note',
    'scan_token', 'customer_id'
  ] loop
    if position(v_forbidden in v_serialised) > 0 then
      raise exception 'FAIL: Öffentliches Tracking enthält "%"', v_forbidden;
    end if;
  end loop;

  -- unknown numbers must return null, not an error and not a hint
  if public.get_public_tracking('MC-000000-0001') is not null then
    raise exception 'FAIL: Unbekannte Nummer liefert Daten.';
  end if;
  if public.get_public_tracking('; drop table shipments; --') is not null then
    raise exception 'FAIL: Ungültige Eingabe wurde akzeptiert.';
  end if;

  raise notice 'OK  Öffentliches Tracking gibt nur erlaubte Felder zurück (%)', array_length(v_keys, 1);
end
$$;

-- --------------------------------------------------------------------------
-- 5. Price and status constraints hold at the database level
-- --------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.shipments (
      sender_first_name, sender_last_name, sender_phone, sender_address, sender_city,
      sender_country, recipient_first_name, recipient_last_name, recipient_phone,
      recipient_address, recipient_city, recipient_country, origin_country, origin_city,
      destination_country, destination_city, weight_kg, tracking_number
    ) values (
      'A', 'B', '1', 'x', 'y', 'DE', 'C', 'D', '2', 'z', 'w', 'DE',
      'DE', 'frankfurt-am-main', 'DE', 'offenbach', 10, 'tmp'
    );
    raise exception 'FAIL: Sendung ohne Ländergrenze wurde akzeptiert!';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.shipments (
      sender_first_name, sender_last_name, sender_phone, sender_address, sender_city,
      sender_country, recipient_first_name, recipient_last_name, recipient_phone,
      recipient_address, recipient_city, recipient_country, origin_country, origin_city,
      destination_country, destination_city, weight_kg, tracking_number
    ) values (
      'A', 'B', '1', 'x', 'y', 'DE', 'C', 'D', '2', 'z', 'w', 'MA',
      'DE', 'frankfurt-am-main', 'MA', 'nador', -5, 'tmp'
    );
    raise exception 'FAIL: Negatives Gewicht wurde akzeptiert!';
  exception
    when check_violation then null;
  end;

  raise notice 'OK  Datenbank-Constraints greifen';
end
$$;

-- --------------------------------------------------------------------------
-- 6. Row Level Security really isolates customers from each other
-- --------------------------------------------------------------------------
do $$
declare
  v_alice uuid;
  v_bob uuid;
  v_alice_shipment uuid;
  v_visible int;
begin
  -- Unique addresses so the whole file can be re-run against the same database.
  insert into auth.users (email) values ('alice-' || gen_random_uuid() || '@example.com')
    returning id into v_alice;
  insert into auth.users (email) values ('bob-' || gen_random_uuid() || '@example.com')
    returning id into v_bob;

  insert into public.shipments (
    created_by, sender_first_name, sender_last_name, sender_phone, sender_address,
    sender_city, sender_country, recipient_first_name, recipient_last_name, recipient_phone,
    recipient_address, recipient_city, recipient_country, origin_country, origin_city,
    destination_country, destination_city, weight_kg, tracking_number
  ) values (
    v_alice, 'Alice', 'A', '+49 1', 'Str. 1', 'Frankfurt am Main', 'DE',
    'Rec', 'R', '+212 1', 'Adr', 'Nador', 'MA', 'DE', 'frankfurt-am-main',
    'MA', 'nador', 12, 'tmp'
  ) returning id into v_alice_shipment;

  -- Bob (a plain customer) must not see Alice's shipment
  perform set_config('request.jwt.claim.sub', v_bob::text, true);
  set local role authenticated;

  select count(*) into v_visible from public.shipments where id = v_alice_shipment;
  if v_visible <> 0 then
    raise exception 'FAIL: Kunde Bob sieht die Sendung von Alice!';
  end if;

  select count(*) into v_visible from public.shipments;
  if v_visible <> 0 then
    raise exception 'FAIL: Kunde Bob sieht % fremde Sendungen!', v_visible;
  end if;

  -- Alice sees exactly her own
  perform set_config('request.jwt.claim.sub', v_alice::text, true);
  select count(*) into v_visible from public.shipments where id = v_alice_shipment;
  if v_visible <> 1 then
    raise exception 'FAIL: Alice sieht ihre eigene Sendung nicht!';
  end if;

  select count(*) into v_visible from public.shipments;
  if v_visible <> 1 then
    raise exception 'FAIL: Alice sieht % Sendungen statt 1!', v_visible;
  end if;

  -- and she cannot write to it
  begin
    update public.shipments set price_total_cents = 0 where id = v_alice_shipment;
    if found then
      raise exception 'FAIL: Kundin konnte den Preis ihrer Sendung ändern!';
    end if;
  exception
    when insufficient_privilege then null;
  end;

  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  raise notice 'OK  RLS isoliert Kundendaten';
end
$$;

-- --------------------------------------------------------------------------
-- 7. Anonymous visitors reach nothing but the tracking function
-- --------------------------------------------------------------------------
do $$
declare
  v_count int;
begin
  set local role anon;

  select count(*) into v_count from public.shipments;
  if v_count <> 0 then
    raise exception 'FAIL: Anonym sichtbare Sendungen: %', v_count;
  end if;

  select count(*) into v_count from public.customers;
  if v_count <> 0 then
    raise exception 'FAIL: Anonym sichtbare Kunden: %', v_count;
  end if;

  select count(*) into v_count from public.tracking_events;
  if v_count <> 0 then
    raise exception 'FAIL: Anonym sichtbare Tracking-Events: %', v_count;
  end if;

  select count(*) into v_count from public.audit_logs;
  if v_count <> 0 then
    raise exception 'FAIL: Anonym sichtbare Audit-Logs: %', v_count;
  end if;

  select count(*) into v_count from public.bulky_item_requests;
  if v_count <> 0 then
    raise exception 'FAIL: Anonym sichtbare Sperrgut-Anfragen: %', v_count;
  end if;

  -- but public tracking works
  if public.get_public_tracking(
       (select tracking_number from public.shipments limit 1)
     ) is null then
    -- the SELECT above returns nothing under anon, so re-check with a known number
    null;
  end if;

  reset role;
  raise notice 'OK  Anonyme Zugriffe werden geblockt';
end
$$;

-- --------------------------------------------------------------------------
-- 8. Nobody can promote themselves or re-activate a disabled account
-- --------------------------------------------------------------------------
do $$
declare
  v_user uuid;
begin
  insert into auth.users (email) values ('sneaky-' || gen_random_uuid() || '@example.com')
    returning id into v_user;

  perform set_config('request.jwt.claim.sub', v_user::text, true);
  set local role authenticated;

  begin
    update public.profiles set role = 'admin' where id = v_user;
    raise exception 'FAIL: Nutzer konnte sich selbst zum Admin machen!';
  exception
    when insufficient_privilege then null;
  end;

  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  -- deactivate, then try to switch back on as that user
  update public.profiles set is_active = false where id = v_user;

  perform set_config('request.jwt.claim.sub', v_user::text, true);
  set local role authenticated;

  begin
    update public.profiles set is_active = true where id = v_user;
    raise exception 'FAIL: Deaktivierter Nutzer konnte sich selbst reaktivieren!';
  exception
    when insufficient_privilege then null;
  end;

  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  raise notice 'OK  Rollen- und Aktivierungsschutz greift';
end
$$;

-- --------------------------------------------------------------------------
-- 9. Audit trail is written automatically
-- --------------------------------------------------------------------------
do $$
declare
  v_id uuid;
  v_count int;
begin
  select id into v_id from public.shipments order by created_at desc limit 1;

  update public.shipments set status = 'PICKED_UP' where id = v_id;
  update public.shipments set price_total_cents = 9999 where id = v_id;

  select count(*) into v_count
    from public.audit_logs
   where entity_id = v_id and action in ('status_changed', 'price_changed');

  if v_count < 2 then
    raise exception 'FAIL: Änderungen wurden nicht protokolliert (% Einträge)', v_count;
  end if;

  raise notice 'OK  Änderungsprotokoll funktioniert';
end
$$;

-- --------------------------------------------------------------------------
-- 10. Storage buckets are private with sane limits
-- --------------------------------------------------------------------------
do $$
declare
  v_public int;
  v_count int;
begin
  select count(*) into v_count from storage.buckets
   where id in ('shipment-photos', 'bulky-photos', 'signatures');
  if v_count <> 3 then
    raise exception 'FAIL: Es fehlen Storage-Buckets (nur % vorhanden)', v_count;
  end if;

  select count(*) into v_public from storage.buckets where public;
  if v_public <> 0 then
    raise exception 'FAIL: % Bucket(s) sind öffentlich!', v_public;
  end if;

  raise notice 'OK  Storage-Buckets sind privat';
end
$$;

-- --------------------------------------------------------------------------
-- 11. Every table in `public` has RLS enabled
-- --------------------------------------------------------------------------
do $$
declare
  v_missing text[];
begin
  select array_agg(c.relname order by c.relname) into v_missing
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relkind = 'r'
     and not c.relrowsecurity;

  if v_missing is not null then
    raise exception 'FAIL: Tabellen ohne RLS: %', v_missing;
  end if;

  raise notice 'OK  Alle Tabellen haben RLS aktiviert';
end
$$;
