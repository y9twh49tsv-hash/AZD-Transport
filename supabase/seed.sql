-- =============================================================================
-- MaroCargo — DEVELOPMENT SEED DATA
-- =============================================================================
--  ⚠  NEVER run this against a production project.
--
--  It inserts fictional customers and shipments so the dashboard, tracking and
--  driver views have something to show while you develop.
--
--  Run it in the Supabase SQL editor of your *development* project, after the
--  migrations. It is idempotent: running it twice will not duplicate rows.
--
--  The tracking-number trigger is switched off for the duration of the insert
--  so the demo shipments keep the stable numbers used in the documentation
--  (MC-260809-0042 …). Real bookings always go through the trigger.
-- =============================================================================

begin;

-- --------------------------------------------------------------------------
-- Vehicles
-- --------------------------------------------------------------------------
insert into public.vehicles (plate, make, model, gross_weight_kg, payload_kg, cargo_volume_m3, status, notes)
values
  ('F-MC 1234', 'Mercedes-Benz', 'Sprinter 519 CDI Maxi', 5500, 1200, 17.0, 'on_trip', 'Hauptfahrzeug Rhein-Main → Nador'),
  ('F-MC 5678', 'Ford',          'Transit L4H3',          3500,  950, 15.1, 'available', 'Abholungen im Rhein-Main-Gebiet'),
  ('F-MC 9012', 'Iveco',         'Daily 70C18',           7000, 3200, 19.6, 'maintenance', 'TÜV fällig')
on conflict (plate) do nothing;

-- --------------------------------------------------------------------------
-- Trips
-- --------------------------------------------------------------------------
insert into public.trips (
  code, origin_country, origin_city, destination_country, destination_city,
  departure_date, planned_arrival_date, vehicle_id, status, max_payload_kg, notes
)
select
  'TRIP-2026-001', 'DE', 'frankfurt-am-main', 'MA', 'nador',
  current_date - 3, current_date + 2,
  (select id from public.vehicles where plate = 'F-MC 1234'),
  'IN_TRANSIT', 1200, 'Laufende Tour über Spanien / Fähre Almería–Nador'
where not exists (select 1 from public.trips where code = 'TRIP-2026-001');

insert into public.trips (
  code, origin_country, origin_city, destination_country, destination_city,
  departure_date, planned_arrival_date, vehicle_id, status, max_payload_kg, notes
)
select
  'TRIP-2026-002', 'DE', 'frankfurt-am-main', 'MA', 'nador',
  current_date + 12, current_date + 17,
  (select id from public.vehicles where plate = 'F-MC 5678'),
  'PLANNED', 950, 'Nächste Tour – Annahme läuft'
where not exists (select 1 from public.trips where code = 'TRIP-2026-002');

insert into public.trips (
  code, origin_country, origin_city, destination_country, destination_city,
  departure_date, planned_arrival_date, status, max_payload_kg, notes
)
select
  'TRIP-2026-R01', 'MA', 'nador', 'DE', 'frankfurt-am-main',
  current_date + 6, current_date + 11, 'PLANNED', 1200, 'Rückfahrt Nador → Rhein-Main'
where not exists (select 1 from public.trips where code = 'TRIP-2026-R01');

-- --------------------------------------------------------------------------
-- Customers
-- --------------------------------------------------------------------------
insert into public.customers (first_name, last_name, email, phone, address_line1, postal_code, city, country)
values
  ('Yassin',  'El Amrani', 'yassin.demo@example.com',  '+49 176 1111111', 'Kaiserstraße 12',  '60329', 'Frankfurt am Main', 'DE'),
  ('Fatima',  'Benali',    'fatima.demo@example.com',  '+49 160 2222222', 'Bahnhofstraße 4',  '63065', 'Offenbach am Main', 'DE'),
  ('Karim',   'Ouazzani',  'karim.demo@example.com',   '+49 151 3333333', 'Mainzer Str. 88',  '65189', 'Wiesbaden',         'DE'),
  ('Samira',  'Haddadi',   null,                       '+212 6 55 44 33 22', 'Hay El Matar 7', '62000', 'Nador',           'MA')
on conflict do nothing;

-- --------------------------------------------------------------------------
-- Shipments (fixed demo tracking numbers)
-- --------------------------------------------------------------------------
alter table public.shipments disable trigger shipments_assign_tracking_number;

insert into public.shipments (
  tracking_number, shipment_type, status,
  customer_id,
  sender_first_name, sender_last_name, sender_phone, sender_email,
  sender_address, sender_postal_code, sender_city, sender_country,
  recipient_first_name, recipient_last_name, recipient_phone,
  recipient_address, recipient_city, recipient_country,
  origin_country, origin_city, destination_country, destination_city,
  weight_kg, piece_count, content_type, description,
  pickup_requested, pickup_date,
  price_base_cents, pickup_fee_cents, price_total_cents,
  payment_status, terms_accepted_at, prohibited_confirmed_at, created_at
)
select v.* from (values
  (
    'MC-260809-0042', 'standard'::public.shipment_type, 'IN_TRANSIT'::public.shipment_status,
    (select id from public.customers where email = 'yassin.demo@example.com'),
    'Yassin', 'El Amrani', '+49 176 1111111', 'yassin.demo@example.com',
    'Kaiserstraße 12', '60329', 'Frankfurt am Main', 'DE'::public.country_code,
    'Samira', 'Haddadi', '+212 6 55 44 33 22',
    'Hay El Matar 7', 'Nador', 'MA'::public.country_code,
    'DE'::public.country_code, 'frankfurt-am-main', 'MA'::public.country_code, 'nador',
    25.00, 3, 'Kleidung & Haushaltswaren', '2 Kartons Kleidung, 1 Reisetasche',
    true, (current_date - 6)::date,
    5000, 1000, 6000,
    'paid_cash'::public.payment_status, now() - interval '7 days', now() - interval '7 days', now() - interval '7 days'
  ),
  (
    'MC-260809-0043', 'standard'::public.shipment_type, 'BOOKED'::public.shipment_status,
    (select id from public.customers where email = 'fatima.demo@example.com'),
    'Fatima', 'Benali', '+49 160 2222222', 'fatima.demo@example.com',
    'Bahnhofstraße 4', '63065', 'Offenbach am Main', 'DE'::public.country_code,
    'Nadia', 'Benali', '+212 6 11 22 33 44',
    'Rue Al Massira 22', 'Selouane', 'MA'::public.country_code,
    'DE'::public.country_code, 'offenbach', 'MA'::public.country_code, 'selouane',
    8.00, 1, 'Geschenke', 'Kleiner Karton mit Geschenken',
    false, null,
    2000, 0, 2000,
    'unpaid'::public.payment_status, now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'
  ),
  (
    'MC-260809-0044', 'standard'::public.shipment_type, 'PICKUP_SCHEDULED'::public.shipment_status,
    (select id from public.customers where email = 'karim.demo@example.com'),
    'Karim', 'Ouazzani', '+49 151 3333333', 'karim.demo@example.com',
    'Mainzer Str. 88', '65189', 'Wiesbaden', 'DE'::public.country_code,
    'Hassan', 'Ouazzani', '+212 6 77 88 99 00',
    'Avenue Hassan II 145', 'Nador', 'MA'::public.country_code,
    'DE'::public.country_code, 'wiesbaden', 'MA'::public.country_code, 'nador',
    42.50, 5, 'Persönliche Gegenstände', 'Umzugskartons',
    true, (current_date + 1)::date,
    8500, 1000, 9500,
    'unpaid'::public.payment_status, now() - interval '2 days', now() - interval '2 days', now() - interval '2 days'
  ),
  (
    'MC-260809-0045', 'standard'::public.shipment_type, 'AT_GERMANY_HUB'::public.shipment_status,
    null,
    'Mohamed', 'Tazi', '+49 172 4444444', 'mohamed.demo@example.com',
    'Berliner Str. 3', '63450', 'Hanau', 'DE'::public.country_code,
    'Aicha', 'Tazi', '+212 6 22 33 44 55',
    'Quartier Ouled Mimoun 9', 'Al Aroui', 'MA'::public.country_code,
    'DE'::public.country_code, 'hanau', 'MA'::public.country_code, 'al-aroui',
    15.00, 2, 'Kleidung', null,
    false, null,
    3000, 0, 3000,
    'paid_online'::public.payment_status, now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'
  ),
  (
    'MC-260809-0046', 'standard'::public.shipment_type, 'DELIVERED'::public.shipment_status,
    null,
    'Leila', 'Bouzid', '+49 175 5555555', 'leila.demo@example.com',
    'Rheinstraße 21', '64283', 'Darmstadt', 'DE'::public.country_code,
    'Youssef', 'Bouzid', '+212 6 33 44 55 66',
    'Rue de Fès 5', 'Berkane', 'MA'::public.country_code,
    'DE'::public.country_code, 'darmstadt', 'MA'::public.country_code, 'berkane',
    6.00, 1, 'Dokumente & Kleidung', null,
    false, null,
    2000, 0, 2000,
    'paid_cash'::public.payment_status, now() - interval '21 days', now() - interval '21 days', now() - interval '21 days'
  ),
  (
    'MC-260809-0047', 'standard'::public.shipment_type, 'EXCEPTION'::public.shipment_status,
    null,
    'Omar', 'Chakir', '+49 179 6666666', null,
    'Frankfurter Str. 100', '63067', 'Offenbach am Main', 'DE'::public.country_code,
    'Rachid', 'Chakir', '+212 6 44 55 66 77',
    'Zeghanghane Centre', 'Zeghanghane', 'MA'::public.country_code,
    'DE'::public.country_code, 'offenbach', 'MA'::public.country_code, 'zeghanghane',
    60.00, 4, 'Haushaltswaren', 'Empfänger telefonisch nicht erreichbar',
    true, (current_date - 2)::date,
    12000, 1000, 13000,
    'unpaid'::public.payment_status, now() - interval '9 days', now() - interval '9 days', now() - interval '9 days'
  ),
  (
    'MC-260809-0048', 'standard'::public.shipment_type, 'OUT_FOR_DELIVERY'::public.shipment_status,
    null,
    'Nora', 'Idrissi', '+49 178 7777777', 'nora.demo@example.com',
    'Louisenstraße 40', '61348', 'Bad Homburg', 'DE'::public.country_code,
    'Khadija', 'Idrissi', '+212 6 66 77 88 99',
    'Beni Ensar Port 3', 'Beni Ensar', 'MA'::public.country_code,
    'DE'::public.country_code, 'bad-homburg', 'MA'::public.country_code, 'beni-ensar',
    18.50, 2, 'Kleidung & Spielzeug', null,
    false, null,
    3700, 0, 3700,
    'paid_cash'::public.payment_status, now() - interval '11 days', now() - interval '11 days', now() - interval '11 days'
  ),
  (
    'MC-260809-0049', 'standard'::public.shipment_type, 'BOOKED'::public.shipment_status,
    null,
    'Samira', 'Haddadi', '+212 6 55 44 33 22', null,
    'Hay El Matar 7', '62000', 'Nador', 'MA'::public.country_code,
    'Yassin', 'El Amrani', '+49 176 1111111',
    'Kaiserstraße 12', 'Frankfurt am Main', 'DE'::public.country_code,
    'MA'::public.country_code, 'nador', 'DE'::public.country_code, 'frankfurt-am-main',
    12.00, 1, 'Lebensmittel (haltbar)', 'Rückweg Marokko → Deutschland',
    false, null,
    2400, 0, 2400,
    'unpaid'::public.payment_status, now() - interval '5 hours', now() - interval '5 hours', now() - interval '5 hours'
  )
) as v
where not exists (select 1 from public.shipments where tracking_number = v.column1);

alter table public.shipments enable trigger shipments_assign_tracking_number;

-- The demo shipments were inserted with the trigger switched off, so the
-- sequence counter never saw them. Without this step the next real booking
-- would start again at 0001 and eventually collide with MC-260809-0042.
-- Deriving the values from the numbers themselves keeps this correct no matter
-- which day the seed is run on.
insert into public.tracking_counters (prefix, day, last_seq)
select
  split_part(s.tracking_number, '-', 1),
  to_date(split_part(s.tracking_number, '-', 2), 'YYMMDD'),
  max(split_part(s.tracking_number, '-', 3)::int)
from public.shipments s
where s.tracking_number ~ '^[A-Z]{2,5}-[0-9]{6}-[0-9]{4,}$'
group by 1, 2
on conflict (prefix, day) do update
  set last_seq = greatest(tracking_counters.last_seq, excluded.last_seq);

-- --------------------------------------------------------------------------
-- Security seal for the flagship demo shipment
-- --------------------------------------------------------------------------
insert into public.security_seals (shipment_id, seal_number, sealed_at, note)
select s.id, 'SEC-583921', now() - interval '6 days', 'Großer Sicherheitsbeutel, versiegelt im Depot Frankfurt'
  from public.shipments s
 where s.tracking_number = 'MC-260809-0042'
   and not exists (select 1 from public.security_seals where seal_number = 'SEC-583921');

insert into public.security_seals (shipment_id, seal_number, sealed_at, note)
select s.id, 'SEC-583944', now() - interval '11 days', 'Versiegelt im Depot Frankfurt'
  from public.shipments s
 where s.tracking_number = 'MC-260809-0048'
   and not exists (select 1 from public.security_seals where seal_number = 'SEC-583944');

-- --------------------------------------------------------------------------
-- Tracking history (the BOOKED event is created automatically by the trigger)
-- --------------------------------------------------------------------------
insert into public.tracking_events (shipment_id, status, occurred_at, location, public_message)
select s.id, e.status, e.occurred_at, e.location, e.message
  from public.shipments s
  join (values
    ('MC-260809-0042', 'PICKUP_SCHEDULED'::public.shipment_status, now() - interval '7 days', 'Frankfurt am Main', 'Die Abholung deiner Sendung ist eingeplant.'),
    ('MC-260809-0042', 'PICKED_UP',        now() - interval '6 days', 'Frankfurt am Main', 'Deine Sendung wurde abgeholt.'),
    ('MC-260809-0042', 'AT_GERMANY_HUB',   now() - interval '6 days' + interval '4 hours', 'Depot Frankfurt', 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.'),
    ('MC-260809-0042', 'LOADED',           now() - interval '4 days', 'Depot Frankfurt', 'Deine Sendung wurde für den Transport nach Marokko verladen.'),
    ('MC-260809-0042', 'DEPARTED_GERMANY', now() - interval '3 days', 'Frankfurt am Main', 'Deine Sendung ist unterwegs nach Marokko.'),
    ('MC-260809-0042', 'IN_TRANSIT',       now() - interval '1 day',  'Spanien', 'Deine Sendung befindet sich auf dem Transportweg.'),

    ('MC-260809-0044', 'PICKUP_SCHEDULED', now() - interval '1 day', 'Wiesbaden', 'Die Abholung deiner Sendung ist eingeplant.'),

    ('MC-260809-0045', 'PICKED_UP',      now() - interval '3 days', 'Hanau', 'Deine Sendung wurde abgeholt.'),
    ('MC-260809-0045', 'AT_GERMANY_HUB', now() - interval '3 days' + interval '5 hours', 'Depot Frankfurt', 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.'),

    ('MC-260809-0046', 'AT_GERMANY_HUB',   now() - interval '20 days', 'Depot Frankfurt', 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.'),
    ('MC-260809-0046', 'DEPARTED_GERMANY', now() - interval '18 days', 'Frankfurt am Main', 'Deine Sendung ist unterwegs nach Marokko.'),
    ('MC-260809-0046', 'ARRIVED_MOROCCO',  now() - interval '14 days', 'Nador', 'Deine Sendung ist in Marokko angekommen.'),
    ('MC-260809-0046', 'OUT_FOR_DELIVERY', now() - interval '13 days', 'Berkane', 'Deine Sendung ist in Zustellung.'),
    ('MC-260809-0046', 'DELIVERED',        now() - interval '13 days' + interval '3 hours', 'Berkane', 'Deine Sendung wurde zugestellt.'),

    ('MC-260809-0047', 'PICKED_UP',      now() - interval '8 days', 'Offenbach am Main', 'Deine Sendung wurde abgeholt.'),
    ('MC-260809-0047', 'AT_GERMANY_HUB', now() - interval '8 days' + interval '6 hours', 'Depot Frankfurt', 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.'),
    ('MC-260809-0047', 'EXCEPTION',      now() - interval '2 days', 'Depot Frankfurt', 'Bei deiner Sendung gibt es eine Rückfrage. Wir melden uns bei dir.'),

    ('MC-260809-0048', 'AT_GERMANY_HUB',   now() - interval '10 days', 'Depot Frankfurt', 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.'),
    ('MC-260809-0048', 'DEPARTED_GERMANY', now() - interval '8 days',  'Frankfurt am Main', 'Deine Sendung ist unterwegs nach Marokko.'),
    ('MC-260809-0048', 'ARRIVED_MOROCCO',  now() - interval '3 days',  'Nador', 'Deine Sendung ist in Marokko angekommen.'),
    ('MC-260809-0048', 'AT_MOROCCO_HUB',   now() - interval '2 days',  'Depot Nador', 'Deine Sendung ist in unserem Depot in Marokko eingetroffen.'),
    ('MC-260809-0048', 'OUT_FOR_DELIVERY', now() - interval '3 hours', 'Beni Ensar', 'Deine Sendung ist in Zustellung.')
  ) as e(tracking_number, status, occurred_at, location, message)
    on e.tracking_number = s.tracking_number
 where not exists (
   select 1 from public.tracking_events te
    where te.shipment_id = s.id and te.status = e.status and te.occurred_at = e.occurred_at
 );

-- --------------------------------------------------------------------------
-- Trip assignment
-- --------------------------------------------------------------------------
insert into public.trip_shipments (trip_id, shipment_id)
select t.id, s.id
  from public.trips t
  join public.shipments s on s.tracking_number in ('MC-260809-0042', 'MC-260809-0048')
 where t.code = 'TRIP-2026-001'
on conflict do nothing;

insert into public.trip_shipments (trip_id, shipment_id)
select t.id, s.id
  from public.trips t
  join public.shipments s on s.tracking_number in ('MC-260809-0043', 'MC-260809-0044')
 where t.code = 'TRIP-2026-002'
on conflict do nothing;

-- --------------------------------------------------------------------------
-- Pickups for today / tomorrow
-- --------------------------------------------------------------------------
insert into public.pickup_assignments (shipment_id, scheduled_date, time_window_start, time_window_end, status, note)
select s.id, current_date + 1, '09:00', '13:00', 'scheduled', 'Klingeln bei „Ouazzani", 3. Stock'
  from public.shipments s
 where s.tracking_number = 'MC-260809-0044'
   and not exists (select 1 from public.pickup_assignments p where p.shipment_id = s.id);

insert into public.pickup_assignments (shipment_id, scheduled_date, time_window_start, time_window_end, status, note)
select s.id, current_date, '14:00', '18:00', 'scheduled', 'Kunde ruft vorher an'
  from public.shipments s
 where s.tracking_number = 'MC-260809-0043'
   and not exists (select 1 from public.pickup_assignments p where p.shipment_id = s.id);

-- --------------------------------------------------------------------------
-- Payments ledger
-- --------------------------------------------------------------------------
insert into public.payments (shipment_id, amount_cents, method, note, received_at)
select s.id, s.price_total_cents, 'cash', 'Bar bei Abholung', s.created_at + interval '1 day'
  from public.shipments s
 where s.payment_status = 'paid_cash'
   and not exists (select 1 from public.payments p where p.shipment_id = s.id);

insert into public.payments (shipment_id, amount_cents, method, note, received_at)
select s.id, s.price_total_cents, 'bank_transfer', 'Überweisung erhalten', s.created_at + interval '1 day'
  from public.shipments s
 where s.payment_status = 'paid_online'
   and not exists (select 1 from public.payments p where p.shipment_id = s.id);

-- --------------------------------------------------------------------------
-- Bulky-goods requests
-- --------------------------------------------------------------------------
insert into public.bulky_item_requests (
  reference, origin_country, origin_city, destination_country, destination_city,
  item_type, item_description, approx_weight_kg, length_cm, width_cm, height_cm,
  contact_first_name, contact_last_name, phone, email, pickup_requested, notes, status
)
select 'PLACEHOLDER', v.* from (values
  (
    'DE'::public.country_code, 'frankfurt-am-main', 'MA'::public.country_code, 'nador',
    'Waschmaschine', 'Bosch Serie 6, Originalverpackung nicht mehr vorhanden', 75.0, 60, 60, 85,
    'Rachid', 'El Fassi', '+49 176 9999999', 'rachid.demo@example.com', true,
    'Bitte im Erdgeschoss abholen', 'NEW'::public.bulky_status
  ),
  (
    'DE'::public.country_code, 'offenbach', 'MA'::public.country_code, 'oujda',
    'Fahrrad', 'Herren-Trekkingrad, 28 Zoll', 16.0, 180, 40, 110,
    'Sofia', 'Merzouki', '+49 151 8888888', 'sofia.demo@example.com', false,
    null, 'IN_REVIEW'::public.bulky_status
  )
) as v
where not exists (
  select 1 from public.bulky_item_requests b where b.phone = v.column13
);

commit;

-- --------------------------------------------------------------------------
-- After seeding: create your users in Supabase Studio → Authentication → Users,
-- then promote them here (see README § "Admin-Benutzer anlegen"):
--
--   update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'du@example.com');
--
--   update public.profiles set role = 'driver'
--    where id = (select id from auth.users where email = 'fahrer@example.com');
-- --------------------------------------------------------------------------
