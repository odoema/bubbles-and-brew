# Bubbles & Brew backend readiness

## Current state

The repository now contains the backend contract and frontend integration layer, but **no live Supabase project is connected yet**.

This is deliberate. Do not connect this project to SmartAttend, PASSAGE, Dream City Grocery, or any other existing Supabase project.

## Included

- PostgreSQL core schema in `supabase/migrations/0001_bubbles_and_brew_core.sql`
- Secure public booking RPC in `0002_public_booking_rpc.sql`
- Initial services, wash bays and membership catalogue in `0003_seed_catalogue.sql`
- Browser-safe configuration placeholder in `js/config.js`
- Frontend booking integration in `js/app.js`
- RLS enabled across operational tables
- Server-authoritative booking validation and pricing
- Booking status history and audit-log foundations

## Connection procedure

1. Create or identify the dedicated Bubbles & Brew Supabase project.
2. Apply migrations 0001, 0002 and 0003 in order.
3. Confirm the active services, wash bays and membership plans.
4. Put only the Supabase project URL and publishable/anon key into `js/config.js`.
5. Never put the service-role key in GitHub Pages or browser JavaScript.
6. Test public booking creation, duplicate-slot protection, RLS and the operations workflow.
7. Add staff authentication and role policies before exposing an operations dashboard.

## Production principle

The public website may submit a booking request, but the server decides whether the service exists, what price is quoted, whether the slot conflicts, and what booking number is issued.

Payments, operational status changes, refunds, receipts and audit events must remain server-authoritative.
