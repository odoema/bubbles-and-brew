-- Bubbles & Brew public booking RPC
-- Safe to apply only to the verified Bubbles & Brew Supabase project.
-- The browser must never receive the service-role key.

create or replace function public.create_public_booking(
  p_full_name text,
  p_phone text,
  p_email text,
  p_registration_no text,
  p_vehicle_type public.bb_vehicle_type,
  p_service_id uuid,
  p_scheduled_date date,
  p_scheduled_time time,
  p_notes text default null
)
returns table (
  booking_id uuid,
  booking_number text,
  status public.bb_booking_status,
  quoted_amount_ugx bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_vehicle_id uuid;
  v_booking_id uuid;
  v_booking_number text;
  v_service_price bigint;
  v_service_active boolean;
  v_existing uuid;
begin
  if nullif(trim(p_full_name), '') is null then
    raise exception 'Full name is required';
  end if;

  if nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '') is null then
    raise exception 'Phone number is required';
  end if;

  if nullif(trim(p_registration_no), '') is null then
    raise exception 'Vehicle registration number is required';
  end if;

  if p_scheduled_date < current_date then
    raise exception 'Booking date cannot be in the past';
  end if;

  select price_ugx, active
    into v_service_price, v_service_active
  from public.services
  where id = p_service_id;

  if not found or not v_service_active then
    raise exception 'Selected service is unavailable';
  end if;

  -- Reuse the customer by phone so repeat customers do not create duplicates.
  select id into v_customer_id
  from public.customers
  where phone = regexp_replace(trim(p_phone), '[^0-9+]', '', 'g')
  order by created_at
  limit 1;

  if v_customer_id is null then
    insert into public.customers (full_name, phone, email)
    values (
      trim(p_full_name),
      regexp_replace(trim(p_phone), '[^0-9+]', '', 'g'),
      nullif(trim(coalesce(p_email, '')), '')
    )
    returning id into v_customer_id;
  else
    update public.customers
       set full_name = trim(p_full_name),
           email = coalesce(nullif(trim(coalesce(p_email, '')), ''), email),
           updated_at = now()
     where id = v_customer_id;
  end if;

  select id into v_vehicle_id
  from public.vehicles
  where customer_id = v_customer_id
    and upper(registration_no) = upper(trim(p_registration_no))
  limit 1;

  if v_vehicle_id is null then
    insert into public.vehicles (customer_id, registration_no, vehicle_type)
    values (v_customer_id, upper(trim(p_registration_no)), p_vehicle_type)
    returning id into v_vehicle_id;
  else
    update public.vehicles
       set vehicle_type = p_vehicle_type
     where id = v_vehicle_id;
  end if;

  -- Prevent obvious double-booking for the same vehicle at the same slot.
  select id into v_existing
  from public.bookings
  where vehicle_id = v_vehicle_id
    and scheduled_date = p_scheduled_date
    and scheduled_time = p_scheduled_time
    and status not in ('cancelled', 'no_show', 'completed')
  limit 1;

  if v_existing is not null then
    raise exception 'This vehicle already has a booking at that time';
  end if;

  v_booking_number := 'BB-' || to_char(p_scheduled_date, 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));

  insert into public.bookings (
    booking_number,
    customer_id,
    vehicle_id,
    service_id,
    scheduled_date,
    scheduled_time,
    status,
    payment_status,
    quoted_amount_ugx,
    notes
  ) values (
    v_booking_number,
    v_customer_id,
    v_vehicle_id,
    p_service_id,
    p_scheduled_date,
    p_scheduled_time,
    'requested',
    'unpaid',
    v_service_price,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_booking_id;

  insert into public.booking_status_history (booking_id, old_status, new_status, note)
  values (v_booking_id, null, 'requested', 'Public booking request received');

  return query
  select v_booking_id, v_booking_number, 'requested'::public.bb_booking_status, v_service_price;
end;
$$;

revoke all on function public.create_public_booking(text,text,text,text,public.bb_vehicle_type,uuid,date,time,text) from public;
grant execute on function public.create_public_booking(text,text,text,text,public.bb_vehicle_type,uuid,date,time,text) to anon, authenticated;
