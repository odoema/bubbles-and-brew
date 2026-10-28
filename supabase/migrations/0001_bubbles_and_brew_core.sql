-- Bubbles & Brew core schema foundation
-- This file is intentionally NOT executed against a live project yet.
-- Connect it only after the correct Bubbles & Brew Supabase project is verified.

create extension if not exists pgcrypto;

do $$ begin
  create type public.bb_staff_role as enum ('owner','manager','supervisor','cashier','wash_attendant');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.bb_booking_status as enum ('requested','confirmed','checked_in','washing','quality_check','ready','completed','cancelled','no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.bb_payment_status as enum ('unpaid','pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.bb_vehicle_type as enum ('saloon','suv','pickup','van','truck','motorcycle','other');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.bb_staff_role not null default 'wash_attendant',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  registration_no text not null,
  make text,
  model text,
  vehicle_type public.bb_vehicle_type not null default 'other',
  colour text,
  created_at timestamptz not null default now(),
  unique(customer_id, registration_no)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  price_ugx bigint not null default 0 check (price_ugx >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wash_bays (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  customer_id uuid not null references public.customers(id),
  vehicle_id uuid not null references public.vehicles(id),
  service_id uuid not null references public.services(id),
  bay_id uuid references public.wash_bays(id),
  scheduled_date date not null,
  scheduled_time time not null,
  status public.bb_booking_status not null default 'requested',
  payment_status public.bb_payment_status not null default 'unpaid',
  quoted_amount_ugx bigint not null default 0 check (quoted_amount_ugx >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.booking_status_history (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_status public.bb_booking_status,
  new_status public.bb_booking_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_price_ugx bigint not null default 0 check (monthly_price_ugx >= 0),
  benefits jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id),
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  points_balance integer not null default 0 check (points_balance >= 0),
  tier text not null default 'Starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_transactions (
  id bigint generated always as identity primary key,
  loyalty_account_id uuid not null references public.loyalty_accounts(id) on delete cascade,
  points integer not null,
  reason text not null,
  booking_id uuid references public.bookings(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  amount_ugx bigint not null check (amount_ugx >= 0),
  method text not null,
  status public.bb_payment_status not null default 'pending',
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_date_status on public.bookings(scheduled_date, status);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_vehicles_customer on public.vehicles(customer_id);
create index if not exists idx_loyalty_transactions_account on public.loyalty_transactions(loyalty_account_id);

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.services enable row level security;
alter table public.wash_bays enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.membership_plans enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- Public catalogue reads.
create policy "public can read active services" on public.services for select to anon, authenticated using (active = true);
create policy "public can read active membership plans" on public.membership_plans for select to anon, authenticated using (active = true);

-- Staff access is intentionally restrictive. Role-based helper policies should be added after the real auth model is approved.
create policy "staff can read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

-- Authenticated customers can access only their own customer record.
create policy "customer can read own customer record" on public.customers for select to authenticated using (auth_user_id = (select auth.uid()));
create policy "customer can update own customer record" on public.customers for update to authenticated using (auth_user_id = (select auth.uid())) with check (auth_user_id = (select auth.uid()));

create policy "customer can read own vehicles" on public.vehicles for select to authenticated using (exists (select 1 from public.customers c where c.id = vehicles.customer_id and c.auth_user_id = (select auth.uid())));
create policy "customer can manage own vehicles" on public.vehicles for insert to authenticated with check (exists (select 1 from public.customers c where c.id = vehicles.customer_id and c.auth_user_id = (select auth.uid())));
create policy "customer can update own vehicles" on public.vehicles for update to authenticated using (exists (select 1 from public.customers c where c.id = vehicles.customer_id and c.auth_user_id = (select auth.uid()))) with check (exists (select 1 from public.customers c where c.id = vehicles.customer_id and c.auth_user_id = (select auth.uid())));

create policy "customer can read own bookings" on public.bookings for select to authenticated using (exists (select 1 from public.customers c where c.id = bookings.customer_id and c.auth_user_id = (select auth.uid())));
create policy "customer can read own loyalty account" on public.loyalty_accounts for select to authenticated using (exists (select 1 from public.customers c where c.id = loyalty_accounts.customer_id and c.auth_user_id = (select auth.uid())));

-- Public booking creation should be implemented through a validated Edge Function, not a broad anon INSERT policy.
-- Payment writes and operational status changes must likewise be server-authoritative.
