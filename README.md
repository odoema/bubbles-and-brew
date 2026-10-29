# Bubbles & Brew

**Wash, Warm and Roll.**

Bubbles & Brew is being developed as a **car-wash-first digital business platform** for the planned opening on **1 January 2027** at Jinja Road, Naguru, Kampala.

## Current release

The customer frontend has been upgraded from a single-page preview into a structured, mobile-first PWA foundation:

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

### Important

The booking flow is **still preview mode** until Firebase is configured. It stores test bookings in the customer's browser only when Firebase config is empty.

A real backend has deliberately **not** been fully wired yet. Fill `js/config.js` with the **bubbles-and-brew** Firebase web app keys and deploy the Cloud Function before going live.

## Target production architecture

```text
Customer PWA
    ↓ HTTPS
Firebase
    ├── Authentication
    ├── Cloud Firestore
    ├── Security Rules
    ├── Cloud Storage
    ├── Cloud Functions
    └── (optional) Cloud Messaging / Hosting
          ↓
Bookings · Wash Queue · Bays · Staff · Vehicles
Memberships · Loyalty · Payments · Receipts · Fleet
```

See [`docs/TECHNICAL-ASSESSMENT.md`](docs/TECHNICAL-ASSESSMENT.md) and [`docs/BACKEND-READINESS.md`](docs/BACKEND-READINESS.md).

## Deployment

- Frontend: GitHub Pages
- Domain: `bubblesandbrew.online`
- Source branch: `main`
- Backend: Firebase project **bubbles-and-brew**

Only one static Pages workflow should be used for this project.

## Product principle

**The car wash is the main business.** Coffee, food and beauty services are complementary parts of the customer experience.

The production release should make the business operational, not merely attractive: customers should be able to book, staff should be able to manage the wash queue, and management should be able to see customers, vehicles, revenue and service performance.
