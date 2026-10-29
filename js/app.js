(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};
  const photoMap = {heroPhoto:media.hero,p1:media.img0,p2:media.img1,p3:media.img2};
  Object.entries(photoMap).forEach(([id,src]) => { const el=document.getElementById(id); if(el&&src) el.src=src; });

  const date = new Date();
  date.setDate(date.getDate()+1);
  $('#bDate').min = date.toISOString().slice(0,10);

  const backendReady = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  let services = [];

  const setBookingMessage = (message, good = true) => {
    const el = $('#bookingResult');
    el.textContent = message;
    el.classList.toggle('success', good);
    el.classList.toggle('error', !good);
  };

  function chooseService(name) {
    const select = $('#bService');
    const option = Array.from(select.options).find(o => (o.dataset.name || o.value) === name || o.textContent.split(' — ')[0] === name);
    if (option) select.value = option.value;
  }

  async function loadBackendCatalogue() {
    if (!backendReady) return;
    try {
      const res = await fetch(`${config.supabaseUrl}/rest/v1/services?select=id,name,price_ugx&active=eq.true&order=sort_order`, {
        headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` }
      });
      if (!res.ok) throw new Error('catalogue unavailable');
      services = await res.json();
      const select = $('#bService');
      if (services.length) {
        select.innerHTML = services.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} — UGX ${Number(s.price_ugx).toLocaleString()}</option>`).join('');
      }
      const note = document.querySelector('.booking-note span');
      if (note) note.textContent = 'Connected to the Bubbles & Brew backend. Booking requests are validated server-side before entering the operations queue.';
      const heading = document.querySelector('.booking-note b');
      if (heading) heading.textContent = 'Live booking mode';
    } catch (_) {
      services = [];
      setBookingMessage('Backend connection is not available yet. This page remains in safe preview mode.', false);
    }
  }

  async function createBackendBooking(payload) {
    const service = services.find(s => s.name === payload.service);
    if (!service) throw new Error('Selected service is not available');
    const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/create_public_booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      },
      body: JSON.stringify({
        p_full_name: payload.name,
        p_phone: payload.phone,
        p_email: payload.email || null,
        p_registration_no: payload.registration,
        p_vehicle_type: payload.vehicleType,
        p_service_id: service.id,
        p_scheduled_date: payload.date,
        p_scheduled_time: payload.time,
        p_notes: null
      })
    });
    if (!res.ok) {
      let detail = 'Booking could not be created';
      try { const body = await res.json(); detail = body.message || body.hint || body.details || detail; } catch (_) {}
      throw new Error(detail);
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows[0] : rows;
  }

  $('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('bb-theme',document.body.classList.contains('dark')?'dark':'light')});
  if(localStorage.getItem('bb-theme')==='dark') document.body.classList.add('dark');
  const nav = $('#mainNav'), menuBtn = $('#menuBtn');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.textContent = open ? '✕' : '☰';
  };
  menuBtn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') setMenu(false); });
  window.matchMedia('(min-width:851px)').addEventListener('change',e=>{ if(e.matches) setMenu(false); });

  // ----- Booking wizard: 1 Your ride -> 2 Your slot -> 3 Confirm -----
  const stepEls = Array.from(document.querySelectorAll('#bookingForm .step'));
  const dots = Array.from(document.querySelectorAll('#bookingSteps li'));
  const backBtn = $('#stepBack'), nextBtn = $('#stepNext');
  let step = 1;

  function showStep(n, opts = {}) {
    step = n;
    stepEls.forEach(el => { el.hidden = Number(el.dataset.step) !== n; });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i + 1 === n);
      d.classList.toggle('done', i + 1 < n);
      if (i + 1 === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    backBtn.hidden = n === 1;
    nextBtn.hidden = n === 3;
    $('#stepSubmit').hidden = n !== 3;
    if (n === 3) fillSummary();
    if (opts.scroll !== false) {
      const form = $('#bookingForm');
      if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function fillSummary() {
    const when = $('#bDate').value
      ? new Date($('#bDate').value + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + $('#bTime').value
      : '';
    const values = {
      service: $('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value.split(' — ')[0],
      when,
      vehicle: $('#bVehicle').value.trim(),
      registration: $('#bRegistration').value.trim().toUpperCase(),
      vehicleType: $('#bVehicleType').selectedOptions[0]?.textContent || '',
      name: $('#bName').value.trim(),
      phone: $('#bPhone').value.trim()
    };
    document.querySelectorAll('[data-sum]').forEach(el => { el.textContent = values[el.dataset.sum] || ''; });
  }

  function validateStep(n) {
    const fields = stepEls[n - 1].querySelectorAll('input,select');
    for (const f of fields) { if (!f.checkValidity()) { f.reportValidity(); return false; } }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(step)) return;
    setBookingMessage('', true);
    showStep(Math.min(step + 1, 3));
  });
  backBtn.addEventListener('click', () => { setBookingMessage('', true); showStep(Math.max(step - 1, 1)); });

  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{ chooseService(b.dataset.book); showStep(1,{scroll:false}); $('#book').scrollIntoView({behavior:'smooth'}); }));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{ chooseService('Full Wash'); showStep(1,{scroll:false}); $('#book').scrollIntoView({behavior:'smooth'}); $('#bVehicle').focus({preventScroll:true}); }));

  $('#bookingForm').addEventListener('submit', async e=>{
    e.preventDefault();
    if (step < 3) { nextBtn.click(); return; }
    for (let n = 1; n <= 2; n++) {
      if (!Array.from(stepEls[n - 1].querySelectorAll('input,select')).every(f => f.checkValidity())) {
        showStep(n);
        validateStep(n);
        return;
      }
    }
    const submit = e.target.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Creating booking…';

    const serviceName = $('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value.split(' — ')[0];
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
        setBookingMessage(`Booking ${result.booking_number} received for ${payload.registration}. The team can now process it from the operations queue.`);
      } else {
        const booking={id:'BB-'+String(Date.now()).slice(-6),name:payload.name,phone:payload.phone,vehicle:payload.vehicle,registration:payload.registration,vehicleType:payload.vehicleType,service:payload.service,date:payload.date,time:payload.time,status:'REQUESTED',createdAt:new Date().toISOString()};
        const list=JSON.parse(localStorage.getItem('bb-bookings')||'[]');
        list.unshift(booking);
        localStorage.setItem('bb-bookings',JSON.stringify(list));
        setBookingMessage(`Preview booking ${booking.id} created for ${booking.registration}. It is stored on this device only.`);
      }
      e.target.reset();
      $('#bDate').min=date.toISOString().slice(0,10);
      showStep(1,{scroll:false});
      $('#bookingResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch (error) {
      setBookingMessage(error.message || 'Booking failed. Please try again.', false);
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Create booking <span>→</span>';
    }
  });

  $('#demoDash').addEventListener('click',()=>{ $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden','false'); });
  $('#closeModal').addEventListener('click',()=>{ $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden','true'); });
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal') $('#closeModal').click()});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
  loadBackendCatalogue();
})();
