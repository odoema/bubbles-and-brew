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
  $('#menuBtn').addEventListener('click',()=>{const n=$('#mainNav');n.style.display=n.style.display==='flex'?'none':'flex';n.style.position='absolute';n.style.top='70px';n.style.left='15px';n.style.right='15px';n.style.background='#082b36';n.style.padding='10px';n.style.borderRadius='14px';n.style.flexDirection='column'});
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{ $('#bService').value=b.dataset.book; $('#book').scrollIntoView({behavior:'smooth'}); }));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{ $('#bService').value='Full Wash'; $('#book').scrollIntoView({behavior:'smooth'}); $('#bName').focus(); }));

  $('#bookingForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const submit = e.target.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Creating booking…';

    const serviceName = $('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value;
    const payload = {
      name: $('#bName').value.trim(),
      phone: $('#bPhone').value.trim(),
      vehicle: $('#bVehicle').value.trim(),
      registration: $('#bVehicle').value.trim(),
      vehicleType: 'other',
      service: serviceName,
      date: $('#bDate').value,
      time: $('#bTime').value,
      email: null
    };

    try {
      if (backendReady && services.length) {
        const result = await createBackendBooking(payload);
        setBookingMessage(`Booking ${result.booking_number} received for ${payload.vehicle}. The team can now process it from the operations queue.`);
      } else {
        const booking={id:'BB-'+String(Date.now()).slice(-6),name:payload.name,phone:payload.phone,vehicle:payload.vehicle,service:payload.service,date:payload.date,time:payload.time,status:'REQUESTED',createdAt:new Date().toISOString()};
        const list=JSON.parse(localStorage.getItem('bb-bookings')||'[]');
        list.unshift(booking);
        localStorage.setItem('bb-bookings',JSON.stringify(list));
        setBookingMessage(`Preview booking ${booking.id} created for ${booking.vehicle}. It is stored on this device only.`);
      }
      e.target.reset();
      $('#bDate').min=date.toISOString().slice(0,10);
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
