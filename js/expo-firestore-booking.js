/* Bubbles & Brew — zero-cost Expo booking backend
 *
 * The customer form is already validated step-by-step by app.js.
 * This bridge owns the final submit so the Expo MVP writes directly to
 * Firestore on the free Firebase plan — no Cloud Functions or billing.
 */
(function () {
  'use strict';

  function localDateValue() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function moneyFromServiceOption(option) {
    const text = String(option?.textContent || '');
    const match = text.match(/UGX\s*([0-9,]+)/i);
    return match ? Number(match[1].replace(/,/g, '')) : 0;
  }

  function randomBookingNumber(date) {
    return `BB-${String(date).replace(/-/g, '')}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  }

  function value(form, id) {
    const el = form.querySelector(`#${id}`);
    return el ? String(el.value || '').trim() : '';
  }

  function mirrorForDashboard(booking) {
    try {
      const list = JSON.parse(localStorage.getItem('bb-bookings') || '[]');
      const filtered = list.filter(item => item.bookingNumber !== booking.bookingNumber && item.id !== booking.bookingNumber);
      filtered.unshift(booking);
      localStorage.setItem('bb-bookings', JSON.stringify(filtered));
    } catch (error) {
      console.warn('Bubbles & Brew local operations mirror failed', error);
    }
  }

  function showResult(message, good) {
    const result = document.getElementById('bookingResult');
    if (!result) return;
    result.textContent = message;
    result.classList.toggle('success', good);
    result.classList.toggle('error', !good);
  }

  async function submitDirectlyToFirestore(form) {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      throw new Error('Firebase is not available. Please refresh the page and try again.');
    }

    const config = window.BB_CONFIG?.firebase || {};
    if (!firebase.apps.length) firebase.initializeApp(config);
    const db = firebase.firestore();

    // Read the actual controls from THIS booking form. app.js has already
    // validated steps 1 and 2 before the user reaches this button.
    const name = value(form, 'bName');
    const phone = value(form, 'bPhone');
    const vehicle = value(form, 'bVehicle');
    const registration = value(form, 'bRegistration').toUpperCase();
    const vehicleType = form.querySelector('#bVehicleType')?.value || 'other';
    const serviceSelect = form.querySelector('#bService');
    const option = serviceSelect?.selectedOptions?.[0];
    const serviceId = option?.value || 'basic-wash';
    const service = option?.dataset?.name || String(option?.textContent || '').split(' — ')[0] || 'Basic Wash';
    const date = value(form, 'bDate');
    const time = value(form, 'bTime');
    const amount = moneyFromServiceOption(option);

    // Do not reject a valid step-3 submission because another handler or
    // browser autofill temporarily reports an empty field. Firebase rules
    // remain the final server-side gate for the required booking fields.
    if (!name || !phone || !vehicle || !registration || !date || !time) {
      const missing = [];
      if (!name) missing.push('name');
      if (!phone) missing.push('phone');
      if (!vehicle) missing.push('vehicle');
      if (!registration) missing.push('registration');
      if (!date) missing.push('date');
      if (!time) missing.push('time');
      throw new Error(`Booking details are missing: ${missing.join(', ')}. Please go back and confirm the booking details.`);
    }
    if (date < localDateValue()) {
      throw new Error('Booking date cannot be in the past.');
    }

    const customerRef = db.collection('customers').doc();
    const vehicleRef = db.collection('vehicles').doc();
    const bookingRef = db.collection('bookings').doc();
    const historyRef = db.collection('bookingStatusHistory').doc();
    const bookingNumber = randomBookingNumber(date);
    const now = firebase.firestore.FieldValue.serverTimestamp();

    const batch = db.batch();
    batch.set(customerRef, {
      fullName: name,
      phone,
      email: null,
      createdAt: now,
      updatedAt: now
    });
    batch.set(vehicleRef, {
      customerId: customerRef.id,
      registrationNo: registration,
      vehicleType,
      createdAt: now
    });
    batch.set(bookingRef, {
      bookingNumber,
      customerId: customerRef.id,
      vehicleId: vehicleRef.id,
      serviceId,
      bayId: null,
      scheduledDate: date,
      scheduledTime: time,
      status: 'requested',
      paymentStatus: 'unpaid',
      quotedAmountUgx: amount,
      notes: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    });
    batch.set(historyRef, {
      bookingId: bookingRef.id,
      oldStatus: null,
      newStatus: 'requested',
      note: 'Public booking request received',
      createdAt: now
    });

    await batch.commit();

    const localBooking = {
      id: bookingNumber,
      bookingNumber,
      name,
      phone,
      vehicle,
      registration,
      vehicleType,
      service,
      serviceId,
      date,
      time,
      status: 'requested',
      paymentStatus: 'unpaid',
      amount,
      quotedAmountUgx: amount,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'firebase-firestore-free-plan'
    };
    mirrorForDashboard(localBooking);

    return { bookingNumber, localBooking };
  }

  function install() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', async function (event) {
      // Capture phase deliberately wins over the older submit handler in
      // app.js. This keeps the Expo flow on the zero-cost direct Firestore path.
      event.preventDefault();
      event.stopImmediatePropagation();

      const submit = document.getElementById('stepSubmit');
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Saving booking…';
      }

      try {
        const result = await submitDirectlyToFirestore(form);
        showResult(`Booking ${result.bookingNumber} created successfully and saved to Firebase. It is now available in the operations dashboard on this device.`, true);
        form.reset();
        const date = document.getElementById('bDate');
        if (date) date.min = localDateValue();
      } catch (error) {
        console.error('Direct Firestore booking failed', error);
        showResult(error.message || 'Booking could not be created. Please try again.', false);
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = 'Create booking <span>→</span>';
        }
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
