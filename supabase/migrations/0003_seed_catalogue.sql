-- Bubbles & Brew initial catalogue.
-- Prices are the website's launch placeholders and should be confirmed by management before go-live.

insert into public.services (name, description, duration_minutes, price_ugx, sort_order)
values
  ('Basic Wash', 'Exterior wash, rinse and dry.', 30, 15000, 10),
  ('Full Wash', 'Exterior wash plus interior vacuum and wipe-down.', 50, 25000, 20),
  ('Premium Care', 'Deep clean and enhanced vehicle-care package.', 90, 45000, 30)
on conflict (name) do update set
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_ugx = excluded.price_ugx,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

insert into public.wash_bays (name)
values ('Bay 1'), ('Bay 2'), ('Bay 3')
on conflict (name) do update set active = true;

insert into public.membership_plans (name, monthly_price_ugx, benefits)
values
  ('Bubbly', 54000, '{"summary":"Regular wash membership","priority":"standard"}'::jsonb),
  ('Brewed', 140000, '{"summary":"Premium wash membership with café experience","priority":"preferred"}'::jsonb),
  ('Fleet', 0, '{"summary":"Custom fleet programme","priority":"business"}'::jsonb)
on conflict (name) do update set
  monthly_price_ugx = excluded.monthly_price_ugx,
  benefits = excluded.benefits,
  active = true;
