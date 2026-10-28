# Firebase Implementation Plan

## Project

- Firebase project ID: `bubbles-and-brew`
- Customer website: `https://bubblesandbrew.online/`
- Source repository: `odoema/bubbles-and-brew`
- Source branch: `main`
- Working branch for this foundation: `firebase-foundation`

## Principle

Keep GitHub Pages as the customer-facing deployment and introduce Firebase as the application backend. Do not replace the working frontend deployment with Firebase Hosting unless there is a later, explicit reason to do so.

## Phase 1 — Foundation

Completed in the repository:

- Firebase project ID pinned in `.firebaserc`.
- Firebase CLI configuration started in `firebase.json`.
- Firestore rules source added with a deny-by-default production baseline.
- Firestore index source added.
- Firebase Web SDK configuration scaffold added.
- Modular Firebase SDK initialization boundary added.
- Frontend copy updated so Firebase is the planned backend rather than the previously proposed Supabase backend.

## Phase 2 — Firebase Console registration

Still required in the Firebase Console:

1. Register a Web app for `bubbles-and-brew`.
2. Obtain the generated Web configuration object.
3. Enable Cloud Firestore in production/locked mode.
4. Confirm the default Firestore database and region before production data is created.
5. Enable Authentication providers when the staff/customer identity model is ready.
6. Do not open Firestore with broad `allow read, write: if true` rules.

Firebase recommends using Authentication together with Cloud Firestore Security Rules for user- and role-based access control, and recommends starting new databases in a locked/production security posture. citeturn0search0turn0search6

## Phase 3 — First business slice

Build one complete flow before adding the rest of the platform:

```text
Customer
  ↓
Booking form
  ↓
Validated Firestore write
  ↓
Booking reference: BB-YYYYMMDD-XXXXXX
  ↓
Initial status: requested
  ↓
Operations dashboard
```

The first Firestore collections should be limited to the minimum needed for this flow:

- `services`
- `customers`
- `vehicles`
- `bookings`
- `booking_status_history`

## Phase 4 — Operations

Add:

- `wash_bays`
- `staff`
- queue management
- check-in
- washing state
- quality check
- ready/completed states
- audit log

## Phase 5 — Revenue and customer relationship

Add:

- `payments`
- `receipts`
- `membership_plans`
- `memberships`
- `loyalty_accounts`
- `loyalty_transactions`
- fleet accounts and reporting

## Phase 6 — Communications and analytics

Add as justified:

- Firebase Cloud Messaging
- transactional notifications
- Analytics events
- customer journey measurement
- management reporting

## Security model

Client-side Firebase configuration is not a substitute for authorization. Firestore Security Rules must explicitly control access to each collection and document path. Privileged server operations should use trusted server-side code rather than exposing administrative credentials to the browser.

The repository should remain the source-controlled home for Firebase rules and indexes. Firebase's documentation notes that deploying rules through the CLI overwrites the corresponding deployed rules, so console edits and repository rules must be kept consistent. citeturn0search0turn0search5

## Deployment discipline

- Do not connect the project to any unrelated Firebase or Supabase project.
- Do not commit Firebase Admin SDK credentials, service-account private keys, or other secrets.
- Do not enable public Firestore writes as a shortcut.
- Test Security Rules before production deployment.
- Keep production data creation separate from frontend design work.
- Use a dedicated Firebase project for Bubbles & Brew.

Firebase supports keeping Firestore Security Rules under version control and deploying them with the Firebase CLI. citeturn0search0turn0search1

## Current status

| Area | Status |
|---|---|
| Firebase project | Ready |
| Firebase project ID | Ready |
| GitHub branch | Ready |
| Firebase CLI config | Started |
| Firestore rules baseline | Ready, locked |
| Firestore indexes file | Ready |
| Web app registration | Pending |
| Web SDK config values | Pending |
| Firestore database | Pending |
| Authentication | Pending |
| First real booking | Pending |
| Staff dashboard | Pending |
| Cloud Functions | Later phase |
| Payments | Later phase |
| Receipts | Later phase |
