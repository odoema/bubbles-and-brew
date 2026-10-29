# Firestore seed data

Create these documents in the Firebase Console (or via Admin SDK script).

## Collection: `services`

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

## Collection: `membershipPlans`

Public read when `active == true`. Seed three plans:

### Bubbly (starter)
| Field | Type | Value |
|-------|------|-------|
| name | string | `Bubbly` |
| tier | string | `starter` |
| monthlyPriceUgx | number | `54000` |
| active | boolean | `true` |
| sortOrder | number | `10` |
| washesPerMonth | number | `4` |
| washLevel | string | `basic` |
| memberDiscountPct | number | `10` |
| priorityBooking | boolean | `true` |
| loyaltyMultiplier | number | `1` |
| benefits | array of string | `4 basic washes`, `10% member discount`, `Priority booking` |

### Brewed (popular)
| Field | Type | Value |
|-------|------|-------|
| name | string | `Brewed` |
| tier | string | `everyday` |
| monthlyPriceUgx | number | `140000` |
| active | boolean | `true` |
| sortOrder | number | `20` |
| washesPerMonth | number | `4` |
| washLevel | string | `full` |
| complimentaryCoffees | number | `4` |
| loyaltyMultiplier | number | `1.5` |
| priorityBooking | boolean | `true` |
| benefits | array of string | `4 full washes`, `4 complimentary coffees`, `1.5× loyalty points` |

### Fleet (business)
| Field | Type | Value |
|-------|------|-------|
| name | string | `Fleet` |
| tier | string | `business` |
| monthlyPriceUgx | number | `0` |
| customQuote | boolean | `true` |
| active | boolean | `true` |
| sortOrder | number | `30` |
| benefits | array of string | `Multiple vehicles`, `Monthly reporting`, `Corporate invoicing` |

## Loyalty / rewards (staff-managed later)

| Collection | Purpose |
|------------|---------|
| `loyaltyAccounts` | Points balance per customer (staff write only) |
| `loyaltyTransactions` | Earn / redeem history (staff write only) |

Public clients cannot read or write loyalty collections (see firestore.rules).

Suggested earn rules (document in ops handbook, enforce in staff app later):

- Basic wash complete → 10 points  
- Full wash complete → 20 points  
- Premium care complete → 40 points  
- Member multiplier from plan (e.g. Brewed = 1.5×)  
- Redeem: 100 points → UGX 5,000 off next visit (example)

## Collection: `washBays`

Bay 1–4 with `name` (string) and `active` (true). Staff-only.

## Public booking creates

- `customers`
- `vehicles`
- `bookings`
- `bookingStatusHistory`
