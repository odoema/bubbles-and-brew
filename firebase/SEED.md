# Firestore seed data

Create these documents in the Firebase Console (or via Admin SDK script).

## Collection: `services`

Document IDs can be auto-generated. Fields:

| Field | Type | Example |
|-------|------|---------|
| name | string | `Basic Wash` |
| description | string | `Exterior wash, rinse and dry.` |
| durationMinutes | number | `30` |
| priceUgx | number | `15000` |
| active | boolean | `true` |
| sortOrder | number | `10` |

Seed three docs:

1. Basic Wash — 15000 UGX, sortOrder 10  
2. Full Wash — 25000 UGX, sortOrder 20  
3. Premium Care — 45000 UGX, sortOrder 30  

## Collection: `washBays`

- Bay 1, Bay 2, Bay 3 (or 4) with `name` (string) and `active` (true).

## Collection: `membershipPlans`

| name | monthlyPriceUgx | benefits (map) | active |
|------|-----------------|----------------|--------|
| Bubbly | 54000 | summary, priority | true |
| Brewed | 140000 | … | true |
| Fleet | 0 | … | true |

## Collections created by the Cloud Function

- `customers` (matched by normalised phone)
- `vehicles` (per customer + registration)
- `bookings`
- `bookingStatusHistory`

Do not open public write access to these collections.
