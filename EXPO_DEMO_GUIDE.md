# Bubbles & Brew — Expo Demonstration Guide

**Purpose:** A simple guide for students, staff, judges and visitors who want to test the Bubbles & Brew digital experience at the Entrepreneurship Expo.

**Business promise:** **WASH, WARM AND ROLL**

**Customer site:** https://bubblesandbrew.online/

**Operations dashboard:** https://bubblesandbrew.online/dashboard.html

---

## 1. The 5-minute demonstration

The easiest way to demonstrate the MVP is to show two sides of the system:

1. **Customer experience** — a visitor books a wash.
2. **Operations experience** — staff receive the booking and move it through the wash workflow.

Use one laptop/phone for the customer test and the same laptop for the dashboard if you are demonstrating the current MVP local mode.

> **Expo note:** The current dashboard is an MVP local demonstration environment. A booking created in the browser is stored on that device. Do not describe it as a multi-device production booking system until the Firebase staff/operations backend is activated.

---

## 2. Customer test — student/visitor

Open:

**https://bubblesandbrew.online/**

### Step 1 — Explore

Show the visitor:

- Home / brand promise
- Car wash services
- Café / waiting experience
- Beauty offering
- Membership plans
- Booking section

Explain:

> “The car wash is the main business. The café and other services make the waiting experience more valuable.”

### Step 2 — Start a booking

Click **Book a wash** or one of the service **Book** buttons.

Use demonstration information such as:

- Vehicle: `Toyota Harrier`
- Registration: `UAX 123A`
- Vehicle type: `SUV`
- Service: `Full Wash`
- Name: `Expo Demo Customer`
- Phone: use a real test number or a clearly designated demo number
- Date: choose an available future date shown by the form
- Time: choose a displayed slot

### Step 3 — Review

Click **Next** until the confirmation screen.

Point out that the customer can review:

- service
- date and time
- vehicle
- registration
- customer name
- phone number

### Step 4 — Create booking

Click **Create booking**.

The system should return a booking reference such as:

`BB-YYYYMMDD-XXXXXX`

Read the booking number aloud. This is the number you will use in the operations demonstration.

---

## 3. Staff test — operations dashboard

Open:

**https://bubblesandbrew.online/dashboard.html**

The dashboard is designed for the staff member managing the wash floor.

### What to show

The dashboard provides:

- Today's booking count
- Requested bookings
- Vehicles currently washing
- Vehicles ready for collection
- Completed jobs
- Completed-job revenue
- Search
- Date filtering
- Status filtering
- Walk-in booking entry
- Print function

Find the booking you just created.

---

## 4. Demonstrate the wash workflow

Use the **Next action** buttons on the booking.

Move the booking through:

**REQUESTED → CONFIRMED → CHECKED IN → WASHING → READY → COMPLETED**

Explain each stage:

| Stage | Meaning |
|---|---|
| Requested | Customer has submitted a booking request. |
| Confirmed | Staff have accepted the booking. |
| Checked in | Vehicle has arrived and has been received. |
| Washing | The vehicle is currently being serviced. |
| Ready | Vehicle has passed the service stage and can be handed over. |
| Completed | Customer handover is complete. |

After marking the booking **Completed**, show the dashboard's **Completed** and **Revenue** figures changing.

---

## 5. Demonstrate a walk-in customer

From the dashboard click:

**+ Walk-in booking**

Enter:

- customer name
- phone
- vehicle
- registration
- vehicle type
- service
- date
- time
- optional note

Click **Create booking**.

The walk-in appears in the operations queue as **Checked in**, because the customer is already physically at the wash.

Then move it through:

**WASHING → READY → COMPLETED**

---

## 6. Demonstrate search and filtering

Use the dashboard search box to search by:

- booking number
- customer name
- phone
- registration
- vehicle
- service

Then demonstrate:

- **Today** vs **All dates**
- a specific status such as **Washing** or **Ready**

This is useful when explaining how the system can support a busy wash floor.

---

## 7. Demonstrate the business idea

If a judge asks, **“What problem are you solving?”**, use this explanation:

> “We are turning a traditional car-wash visit into a connected customer experience. Customers can discover services and book digitally, while the business can manage the booking queue and vehicle progress. The café and complementary services turn waiting time into part of the experience.”

If asked, **“What makes the MVP valuable?”**, say:

> “The MVP proves the customer journey and the operational workflow before we add the heavier production features such as authenticated staff accounts, payments, notifications, loyalty and multi-device real-time operations.”

---

## 8. If someone asks about the technology

Keep the explanation simple:

- **Frontend:** responsive web application
- **Hosting:** GitHub Pages
- **Application logic:** JavaScript
- **Fonts/UI:** Bricolage Grotesque and Manrope with the Bubbles & Brew brand system
- **Backend direction:** Firebase / Firestore and Cloud Functions
- **Current Expo MVP:** browser-based local booking fallback plus an operations dashboard
- **Production direction:** secure server-side booking, authenticated staff roles, payments, notifications and multi-device operations

Do not claim that a feature is production-connected unless it has been activated and tested.

---

## 9. The ideal live demonstration script

### Presenter

> “Welcome to Bubbles & Brew — Wash, Warm and Roll. Let me show you how a customer journey becomes an operations workflow.”

### Customer

> “I want to wash my Toyota Harrier.”

### Presenter

Click **Book a wash**, enter the vehicle and customer details, choose **Full Wash**, select the date/time and submit.

> “The customer receives a booking reference. Now let's switch to the business side.”

Open the dashboard.

> “This is the operations queue. Staff can see what has been requested and move the vehicle through the actual service journey.”

Move the booking:

> “Confirmed. Checked in. Washing. Ready. Completed.”

Then show the KPI update.

> “So the same visit has a customer-facing side and an operations side. That is the foundation we can now extend into payments, staff roles, notifications, loyalty and reporting.”

---

## 10. Expo safety rules

### Always

- Use demonstration customer details where possible.
- Tell visitors when they are using the MVP demonstration environment.
- Use a test phone number if the number does not need to be real.
- Keep the dashboard on the designated demonstration device.
- Reset test data after a demonstration session if required.

### Never

- Ask visitors for passwords.
- Display another customer's private information.
- Promise a production booking if the backend is not connected.
- Enter sensitive personal information unnecessarily.
- Delete real business data to prepare a demonstration.

---

## 11. Quick troubleshooting

### Booking button does nothing

Refresh the page and try the main **Book a wash** button.

### Booking is created but not visible on another device

This is expected in the current local MVP mode. The current demonstration dashboard stores local bookings on the same browser/device.

### Dashboard is empty

Create a booking from the customer site on the same device, or use **+ Walk-in booking**.

### Need to start the demonstration again

Use **Clear test data** on the dashboard, then create a fresh demonstration booking.

### Website looks old

Open the site in a fresh/private browser window. Do not repeatedly refresh an old tab.

---

## 12. What comes after the MVP

The recommended next production stages are:

1. Firebase service catalogue and booking function deployment.
2. Secure staff authentication and role-based access.
3. Real-time multi-device operations dashboard.
4. Bay assignment and capacity management.
5. Customer booking confirmations.
6. Payment integration and reconciliation.
7. SMS/WhatsApp/email notifications.
8. Loyalty and membership accounts.
9. Café orders linked to vehicle visits.
10. Management reporting and analytics.

The MVP should be demonstrated as the **foundation**, not as if every future feature already exists.

---

**Bubbles & Brew — Internal Expo Guide**  
**WASH, WARM AND ROLL**