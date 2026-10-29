# Bubbles & Brew backend readiness (Firebase)

## Current state

The repository now contains the Firebase contract and frontend integration layer. The Firebase project **bubbles-and-brew** is the intended backend.

Do not connect this site to any other Firebase or Supabase project.

## Included

- Browser-safe Firebase config placeholder in `js/config.js`
- Frontend booking + catalogue integration in `js/app.js` (Firebase JS SDK compat)
- Firestore security rules in `firebase/firestore.rules`
- Example Cloud Function `createPublicBooking` in `firebase/functions/`
- Seed document shapes and collection notes in `firebase/SEED.md`
- Firestore indexes note in `firebase/firestore.indexes.json`

## Connection procedure

1. Open [Firebase Console](https://console.firebase.google.com/u/0/project/bubbles-and-brew).
2. Enable **Authentication** (Email/Password and/or phone as needed for staff later).
3. Create a **Web app** if one does not exist → copy the config object into `js/config.js` (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
4. Enable **Cloud Firestore** (production mode is fine; we deploy rules next).
5. Deploy rules and indexes:
   ```bash
   cd firebase
   firebase use bubbles-and-brew
   firebase deploy --only firestore:rules,firestore:indexes
   ```
6. Seed catalogue collections (`services`, `washBays`, `membershipPlans`) — see `firebase/SEED.md`.
7. Deploy the Cloud Function:
   ```bash
   cd firebase/functions
   npm install
   firebase deploy --only functions:createPublicBooking
   ```
8. Put the function base URL into `js/config.js` as `functionsBaseUrl`  
   (e.g. `https://us-central1-bubbles-and-brew.cloudfunctions.net`).
9. Never put the service-account private key in GitHub Pages or browser JavaScript.
10. Test public booking creation, duplicate-slot protection, and rules.
11. Add staff authentication and role claims before exposing a live operations dashboard.

## Production principle

The public website may submit a booking request, but the **Cloud Function** decides whether the service exists, what price is quoted, whether the slot conflicts, and what booking number is issued.

Payments, operational status changes, refunds, receipts and audit events must remain server-authoritative.
