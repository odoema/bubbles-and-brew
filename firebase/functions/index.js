/**
 * Bubbles & Brew — public booking Cloud Function
 *
 * Deploy:
 *   cd firebase/functions && npm install
 *   firebase use bubbles-and-brew
 *   firebase deploy --only functions:createPublicBooking
 *
 * The browser must never hold a service-account key.
 * This function runs with Admin privileges and enforces validation.
 */

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

initializeApp();
const db = getFirestore();

const ALLOWED_ORIGINS = [
  'https://bubblesandbrew.online',
  'https://odoema.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000'
];

function cors(req, res) {
  const origin = req.get('Origin') || '';
  if (ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o))) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.set('Access-Control-Allow-Origin', 'https://bubblesandbrew.online');
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
}

function normalizePhone(phone) {
  return String(phone || '').replace(/[^0-9+]/g, '');
}

function randomSuffix() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

exports.createPublicBooking = onRequest(
  { region: 'us-central1', cors: false },
  async (req, res) => {
    cors(req, res);
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const body = req.body || {};
      const fullName = String(body.fullName || '').trim();
      const phone = normalizePhone(body.phone);
      const email = body.email ? String(body.email).trim() : null;
      const registrationNo = String(body.registrationNo || '').trim().toUpperCase();
      const vehicleType = String(body.vehicleType || 'other').toLowerCase();
      const serviceId = String(body.serviceId || '').trim();
      const scheduledDate = String(body.scheduledDate || '').trim();
      const scheduledTime = String(body.scheduledTime || '').trim();
      const notes = body.notes ? String(body.notes).trim() : null;

      if (!fullName) {
        res.status(400).json({ error: 'Full name is required' });
        return;
      }
      if (!phone) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
      }
      if (!registrationNo) {
        res.status(400).json({ error: 'Vehicle registration number is required' });
        return;
      }
      if (!serviceId) {
        res.status(400).json({ error: 'Service is required' });
        return;
      }
      if (!scheduledDate || !scheduledTime) {
        res.status(400).json({ error: 'Date and time are required' });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      if (scheduledDate < today) {
        res.status(400).json({ error: 'Booking date cannot be in the past' });
        return;
      }

      const serviceRef = db.collection('services').doc(serviceId);
      const serviceSnap = await serviceRef.get();
      if (!serviceSnap.exists || serviceSnap.data().active !== true) {
        res.status(400).json({ error: 'Selected service is unavailable' });
        return;
      }
      const service = serviceSnap.data();
      const priceUgx = Number(service.priceUgx ?? service.price_ugx ?? 0);

      const customersQ = await db
        .collection('customers')
        .where('phone', '==', phone)
        .limit(1)
        .get();

      let customerId;
      if (customersQ.empty) {
        const ref = await db.collection('customers').add({
          fullName,
          phone,
          email: email || null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
        customerId = ref.id;
      } else {
        customerId = customersQ.docs[0].id;
        await db.collection('customers').doc(customerId).update({
          fullName,
          email: email || customersQ.docs[0].data().email || null,
          updatedAt: FieldValue.serverTimestamp()
        });
      }

      const vehiclesQ = await db
        .collection('vehicles')
        .where('customerId', '==', customerId)
        .where('registrationNo', '==', registrationNo)
        .limit(1)
        .get();

      let vehicleId;
      if (vehiclesQ.empty) {
        const ref = await db.collection('vehicles').add({
          customerId,
          registrationNo,
          vehicleType,
          createdAt: FieldValue.serverTimestamp()
        });
        vehicleId = ref.id;
      } else {
        vehicleId = vehiclesQ.docs[0].id;
        await db.collection('vehicles').doc(vehicleId).update({ vehicleType });
      }

      const blockedStatuses = ['cancelled', 'no_show', 'completed'];
      const existingQ = await db
        .collection('bookings')
        .where('vehicleId', '==', vehicleId)
        .where('scheduledDate', '==', scheduledDate)
        .where('scheduledTime', '==', scheduledTime)
        .get();

      const conflict = existingQ.docs.some(d => !blockedStatuses.includes(d.data().status));
      if (conflict) {
        res.status(409).json({ error: 'This vehicle already has a booking at that time' });
        return;
      }

      const bookingNumber =
        'BB-' + scheduledDate.replace(/-/g, '') + '-' + randomSuffix();

      const bookingRef = await db.collection('bookings').add({
        bookingNumber,
        customerId,
        vehicleId,
        serviceId,
        bayId: null,
        scheduledDate,
        scheduledTime,
        status: 'requested',
        paymentStatus: 'unpaid',
        quotedAmountUgx: priceUgx,
        notes: notes || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: null
      });

      await db.collection('bookingStatusHistory').add({
        bookingId: bookingRef.id,
        oldStatus: null,
        newStatus: 'requested',
        note: 'Public booking request received',
        createdAt: FieldValue.serverTimestamp()
      });

      res.status(200).json({
        bookingId: bookingRef.id,
        bookingNumber,
        status: 'requested',
        quotedAmountUgx: priceUgx
      });
    } catch (err) {
      console.error('createPublicBooking error', err);
      res.status(500).json({ error: 'Booking could not be created' });
    }
  }
);
