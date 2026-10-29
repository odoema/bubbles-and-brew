(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};
  const photoMap = { heroPhoto: media.hero, p1: media.img0, p2: media.img1, p3: media.img2 };
  Object.entries(photoMap).forEach(([id, src]) => {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
  });

  const date = new Date();
  date.setDate(date.getDate() + 1);
  $('#bDate').min = date.toISOString().slice(0, 10);

  const fb = config.firebase || {};
  const backendReady = Boolean(fb.apiKey && fb.projectId && fb.appId);
  let services = [];
  let db = null;
  let functionsBase = (config.functionsBaseUrl || '').replace(/\/$/, '');

  const setBookingMessage = (message, good = true) => {
    const el = $('#bookingResult');
    el.textContent = message;
    el.classList.toggle('success', good);
    el.classList.toggle('error', !good);
  };

  function chooseService(name) {
    const select = $('#bService');
    const option = Array.from(select.options).find(
      o => (o.dataset.name || o.value) === name || o.textContent.split(' \u2014 ')[0] === name
    );
    if (option) select.value = option.value;
  }

  async function initFirebase() {
    if (!backendReady || typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(fb);
      }
      db = firebase.firestore();
      return true;
    } catch (err) {
      console.warn('Firebase init failed', err);
      return false;
    }
  }

  async function loadBackendCatalogue() {
    const ready = await initFirebase();
    if (!ready || !db) return;
    try {
      const snap = await db
        .collection('services')
        .where('active', '==', true)
        .orderBy('sortOrder')
        .get();

      services = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          price_ugx: data.priceUgx ?? data.price_ugx ?? 0,
          sortOrder: data.sortOrder ?? 0
        };
      });

      const select = $('#bService');
      if (services.length) {
        select.innerHTML = services
          .map(
            s =>
              `<option value="${s.id}" data-name="${s.name}">${s.name} \u2014 UGX ${Number(
                s.price_ugx
              ).toLocaleString()}</option>`
          )
          .join('');
      }

      const note = document.querySelector('.booking-note span');
      if (note) {
        note.textContent =
          'Connected to the Bubbles & Brew Firebase backend. Booking requests are validated server-side before entering the operations queue.';
      }
      const heading = document.querySelector('.booking-note b');
      if (heading) heading.textContent = 'Live booking mode';
    } catch (err) {
      console.warn('Catalogue load failed', err);
      services = [];
      setBookingMessage(
        'Backend connection is not available yet. This page remains in safe preview mode.',
        false
      );
    }
  }

  async function createBackendBooking(payload) {
    const service = services.find(s => s.name === payload.service || s.id === $('#bService').value);
    if (!service) throw new Error('Selected service is not available');

    if (functionsBase) {
      const res = await fetch(`${functionsBase}/createPublicBooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: payload.name,
          phone: payload.phone,
          email: payload.email || null,
          registrationNo: payload.registration,
          vehicleType: payload.vehicleType,
          serviceId: service.id,
          scheduledDate: payload.date,
          scheduledTime: payload.time,
          notes: null
        })
      });
      if (!res.ok) {
        let detail = 'Booking could not be created';
        try {
          const body = await res.json();
          detail = body.error || body.message || detail;
        } catch (_) {}
        throw new Error(detail);
      }
      return await res.json();
    }

    throw new Error(
      'Cloud Function URL is not configured. Set functionsBaseUrl in js/config.js after deploying createPublicBooking.'
    );
  }

  $('#themeBtn').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'bb-theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  });
  if (localStorage.getItem('bb-theme') === 'dark') document.body.classList.add('dark');

  const nav = $('#mainNav'),
    menuBtn = $('#menuBtn');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.textContent = open ? '\u2715' : '\u2630';
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(min-width:851px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  const stepEls = Array.from(document.querySelectorAll('#bookingForm .step'));
  const dots = Array.from(document.querySelectorAll('#bookingSteps li'));
  const backBtn = $('#stepBack'),
    nextBtn = $('#stepNext');
  let step = 1;

  function showStep(n, opts = {}) {
    step = n;
    stepEls.forEach(el => {
      el.hidden = Number(el.dataset.step) !== n;
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i + 1 === n);
      d.classList.toggle('done', i + 1 < n);
      if (i + 1 === n) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
    });
    backBtn.hidden = n === 1;
    nextBtn.hidden = n === 3;
    $('#stepSubmit').hidden = n !== 3;
    if (n === 3) fillSummary();
    if (opts.scroll !== false) {
      const form = $('#bookingForm');
      if (form.getBoundingClientRect().top < 0)
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function fillSummary() {
    const when = $('#bDate').value
      ? new Date($('#bDate').value + 'T00:00').toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }) +
        ' \u00b7 ' +
        $('#bTime').value
      : '';
    const values = {
      service:
        $('#bService').selectedOptions[0]?.dataset?.name ||
        $('#bService').value.split(' \u2014 ')[0],
      when,
      vehicle: $('#bVehicle').value.trim(),
      registration: $('#bRegistration').value.trim().toUpperCase(),
      vehicleType: $('#bVehicleType').selectedOptions[0]?.textContent || '',
      name: $('#bName').value.trim(),
      phone: $('#bPhone').value.trim()
    };
    document.querySelectorAll('[data-sum]').forEach(el => {
      el.textContent = values[el.dataset.sum] || '';
    });
  }

  function validateStep(n) {
    const fields = stepEls[n - 1].querySelectorAll('input,select');
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(step)) return;
    setBookingMessage('', true);
    showStep(Math.min(step + 1, 3));
  });
  backBtn.addEventListener('click', () => {
    setBookingMessage('', true);
    showStep(Math.max(step - 1, 1));
  });

  document.querySelectorAll('[data-book]').forEach(b =>
    b.addEventListener('click', () => {
      chooseService(b.dataset.book);
      showStep(1, { scroll: false });
      $('#book').scrollIntoView({ behavior: 'smooth' });
    })
  );
  document.querySelectorAll('[data-plan]').forEach(b =>
    b.addEventListener('click', () => {
      chooseService('Full Wash');
      showStep(1, { scroll: false });
      $('#book').scrollIntoView({ behavior: 'smooth' });
      $('#bVehicle').focus({ preventScroll: true });
    })
  );

  $('#bookingForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (step < 3) {
      nextBtn.click();
      return;
    }
    for (let n = 1; n <= 2; n++) {
      if (
        !Array.from(stepEls[n - 1].querySelectorAll('input,select')).every(f =>
          f.checkValidity()
        )
      ) {
        showStep(n);
        validateStep(n);
        return;
      }
    }
    const submit = e.target.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Creating booking\u2026';

    const serviceName =
      $('#bService').selectedOptions[0]?.dataset?.name ||
      $('#bService').value.split(' \u2014 ')[0];
    const payload = {
      name: $('#bName').value.trim(),
      phone: $('#bPhone').value.trim(),
      vehicle: $('#bVehicle').value.trim(),
      registration: $('#bRegistration').value.trim(),
      vehicleType: $('#bVehicleType').value,
      service: serviceName,
      date: $('#bDate').value,
      time: $('#bTime').value,
      email: null
    };

    try {
      if (backendReady && services.length) {
        const result = await createBackendBooking(payload);
        setBookingMessage(
          `Booking ${result.bookingNumber || result.booking_number} received for ${
            payload.registration
          }. The team can now process it from the operations queue.`
        );
      } else {
        const booking = {
          id: 'BB-' + String(Date.now()).slice(-6),
          name: payload.name,
          phone: payload.phone,
          vehicle: payload.vehicle,
          registration: payload.registration,
          vehicleType: payload.vehicleType,
          service: payload.service,
          date: payload.date,
          time: payload.time,
          status: 'REQUESTED',
          createdAt: new Date().toISOString()
        };
        const list = JSON.parse(localStorage.getItem('bb-bookings') || '[]');
        list.unshift(booking);
        localStorage.setItem('bb-bookings', JSON.stringify(list));
        setBookingMessage(
          `Preview booking ${booking.id} created for ${booking.registration}. It is stored on this device only.`
        );
      }
      e.target.reset();
      $('#bDate').min = date.toISOString().slice(0, 10);
      showStep(1, { scroll: false });
      $('#bookingResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      setBookingMessage(error.message || 'Booking failed. Please try again.', false);
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Create booking <span>\u2192</span>';
    }
  });

  $('#demoDash').addEventListener('click', () => {
    $('#modal').classList.add('open');
    $('#modal').setAttribute('aria-hidden', 'false');
  });
  $('#closeModal').addEventListener('click', () => {
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden', 'true');
  });
  $('#modal').addEventListener('click', e => {
    if (e.target.id === 'modal') $('#closeModal').click();
  });
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js').catch(() => {});

  loadBackendCatalogue();
})();
