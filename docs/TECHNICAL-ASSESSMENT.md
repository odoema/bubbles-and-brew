# Bubbles & Brew — Technical Assessment & Upgrade Plan

## Executive finding

The current deployed experience was a static marketing prototype, not yet an operational business application.

The original prototype is a valuable product/design reference: it already explored wash booking, bay status, subscriptions, loyalty, staff view, standards/checklists and a customer journey. Its data handling was browser-local (`localStorage`) rather than a real backend.

## Current repository findings

- Frontend is served by GitHub Pages.
- Booking and catalogue integration targets **Firebase** (Firestore + Cloud Functions).
- Supabase migrations have been retired in favour of Firestore collections + security rules + a `createPublicBooking` Cloud Function.
- There is a dedicated Firebase project: **bubbles-and-brew**.

## Target architecture

### Customer frontend
- Responsive HTML/CSS/JavaScript
- PWA manifest and service worker
- Customer booking flow
- Service catalogue
- Membership and loyalty presentation
- Customer status / receipt experience

### Backend (Firebase)

- **Authentication** — staff and (optional) customer accounts
- **Cloud Firestore** — customers, vehicles, services, bookings, bays, memberships, loyalty, payments, audit
- **Security Rules** — public read of active catalogue only; all writes for bookings go through Cloud Functions
- **Cloud Functions** — authoritative `createPublicBooking`, future payment and status transitions
- **Cloud Storage** — receipts, vehicle photos (future)
- **Cloud Messaging** (optional) — booking and ready notifications

### Operational modules
1. Customers  
2. Vehicles  
3. Services and pricing  
4. Bookings  
5. Wash tickets  
6. Wash bays  
7. Staff and roles  
8. Memberships  
9. Loyalty  
10. Payments  
11. Receipts  
12. Fleet accounts  
13. Notifications  
14. Audit log  

## Security principles

- Never expose a service-account / Admin SDK private key in the browser.
- Use only the Firebase web config (apiKey, projectId, appId, etc.) on the client.
- Public clients may **read** active services/membership plans.
- Public clients must **not** write bookings, payments, or status changes directly.
- All booking creation, pricing, and slot validation run in a Cloud Function.
- Staff authorization must not rely on editable client claims alone.
- Keep an audit trail for staff actions and financial events.

## Deployment

GitHub Pages remains the public frontend host. Use one static deployment workflow. The backend remains separate and is accessed through HTTPS (Firestore + Cloud Functions).

## Rollout

### Phase 1 — frontend foundation (done)
- Rebuild the customer-facing UI
- Booking journey and booking reference
- Membership presentation
- Operations dashboard preview
- PWA foundation
- Split CSS and JavaScript

### Phase 2 — real backend (Firebase)
- Configure web app in Firebase project **bubbles-and-brew**
- Deploy Firestore rules and indexes
- Seed services, bays, membership plans
- Deploy `createPublicBooking` Cloud Function
- Put web config + function URL into `js/config.js`
- Persist bookings via the function

### Phase 3 — operations
- Wash queue and bays
- Staff dashboard (Auth + custom claims / roles)
- Receipts
- Notifications
- Loyalty

### Phase 4 — revenue
- Payments
- Memberships
- Fleet management
- Management analytics

## Acceptance standard

The client should be able to:
- understand the business within 10 seconds;
- book a wash on mobile;
- receive a booking reference;
- see a credible operational workflow;
- understand the car-wash-first positioning;
- understand the complementary café/beauty proposition;
- install the site as a PWA;
- and later use the same interface against a real backend without a visual rebuild.

## Current implementation note

The current upgrade is **backend-safe**: it improves the frontend and application structure. Booking data remains local until Firebase web config and the Cloud Function are connected. The next step is to complete the Firebase setup described in `docs/BACKEND-READINESS.md`.
