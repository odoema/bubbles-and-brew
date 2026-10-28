# Bubbles & Brew

**Wash, Warm and Roll.**

Bubbles & Brew is being developed as a **car-wash-first digital business platform** for the planned opening on **1 January 2027** at Jinja Road, Naguru, Kampala.

## Current release

The customer frontend is a structured, mobile-first PWA foundation:

- Car-wash-first brand experience
- Responsive service catalogue
- Booking journey with booking reference
- Membership plans
- Operations dashboard preview
- PWA manifest + service worker
- Separated CSS and JavaScript
- SVG brand assets
- Technical architecture documentation

The visual system is designed to accept the supplied vehicle-care photography and other final production assets without changing the application structure.

### Backend status

The live customer booking flow is **still preview mode**. Test bookings are stored in the customer's browser only. No customer information is currently sent to a production backend.

A dedicated Firebase project has now been created:

- **Firebase project:** `bubbles-and-brew`
- **Plan:** Spark during the initial build
- **Backend direction:** Firebase Authentication + Cloud Firestore + Cloud Functions when server-side functions are required + Storage/FCM as later phases require

The repository now contains the first Firebase foundation files:

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `js/firebase-config.js`
- `js/firebase-init.js`

The Firestore rules are intentionally locked down until each collection has an explicit, tested authorization policy.

## Target production architecture

```text
Customer PWA
    ↓ HTTPS
Firebase
    ├── Authentication
    ├── Cloud Firestore
    ├── Security Rules
    ├── Cloud Functions
    ├── Cloud Storage
    ├── Cloud Messaging
    └── Analytics
          ↓
Bookings · Wash Queue · Bays · Staff · Vehicles
Memberships · Loyalty · Payments · Receipts · Fleet
```

See [`docs/TECHNICAL-ASSESSMENT.md`](docs/TECHNICAL-ASSESSMENT.md) and [`docs/FIREBASE-IMPLEMENTATION.md`](docs/FIREBASE-IMPLEMENTATION.md).

## Deployment

- Frontend: GitHub Pages
- Domain: `bubblesandbrew.online`
- Source branch: `main`
- Firebase project: `bubbles-and-brew`
- GitHub Pages remains the customer-facing deployment; Firebase is being introduced as the backend platform.

Only one static Pages workflow should be used for this project.

## Product principle

**The car wash is the main business.** Coffee, food and beauty services are complementary parts of the customer experience.

The production release should make the business operational, not merely attractive: customers should be able to book, staff should be able to manage the wash queue, and management should be able to see customers, vehicles, revenue and service performance.
