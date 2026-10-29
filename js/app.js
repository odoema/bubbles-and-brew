(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};

  function initHeroSlider() {
    const hero = $('.hero');
    if (!hero || hero.dataset.sliderReady === 'true') return;
    hero.dataset.sliderReady = 'true';
    hero.classList.add('hero-slider');
    hero.innerHTML = `
      <div class="hero-viewport" aria-roledescription="carousel" aria-label="Bubbles & Brew highlights">
        <div class="hero-track">
          <article class="hero-slide is-active" data-slide="0" aria-hidden="false">
            <div class="hero-copy"><span class="eyebrow">JINJA ROAD · NAGURU · KAMPALA</span><h1>Wash. <em>Warm.</em> Roll.</h1><p class="lead">Professional car wash and vehicle care, with great coffee, food and a better place to wait.</p><div class="hero-actions"><a class="btn primary" href="#book">Book a wash <span>→</span></a><a class="btn ghost" href="#wash">Explore services</a></div><div class="hero-trust"><span>Opening 1 January 2027</span><span>•</span><span>Car wash first</span><span>•</span><span>Near Ntinda trading centre</span></div></div>
            <div class="hero-visual"><div class="hero-photo"><img id="heroPhoto" alt="Vehicle care at Bubbles & Brew"></div><div class="status-card"><span class="pulse"></span><div><b>Digital booking</b><small>Reserve your wash before you arrive.</small></div><strong>→</strong></div></div>
          </article>
          <article class="hero-slide" data-slide="1" aria-hidden="true">
            <div class="hero-copy"><span class="eyebrow">COFFEE · FOOD · COMFORT</span><h1>Let the wash be <em>your</em> pause.</h1><p class="lead">Hand over the car, settle in with a fresh brew and enjoy a better waiting experience while our team gets to work.</p><div class="hero-actions"><a class="btn primary" href="#experience">Explore the experience <span>→</span></a><a class="btn ghost" href="#book">Book a wash</a></div><div class="hero-trust"><span>Fresh coffee</span><span>•</span><span>Food & refreshments</span><span>•</span><span>Comfortable waiting</span></div></div>
            <div class="hero-visual"><div class="hero-photo"><img id="heroPhoto2" alt="Coffee and customer experience at Bubbles & Brew"></div><div class="status-card"><span class="pulse"></span><div><b>More than a wash</b><small>Turn waiting time into your time.</small></div><strong>→</strong></div></div>
          </article>
          <article class="hero-slide" data-slide="2" aria-hidden="true">
            <div class="hero-copy"><span class="eyebrow">MEMBERSHIP · VALUE · PRIORITY</span><h1>Come back. <em>Get more.</em></h1><p class="lead">Membership makes regular vehicle care simpler, with priority booking, member savings and rewards designed around your routine.</p><div class="hero-actions"><a class="btn primary" href="#membership">View membership <span>→</span></a><a class="btn ghost" href="#book">Reserve a wash</a></div><div class="hero-trust"><span>From UGX 54,000/month</span><span>•</span><span>Priority booking</span><span>•</span><span>Loyalty rewards</span></div></div>
            <div class="hero-visual"><div class="hero-photo"><img id="heroPhoto3" alt="Premium vehicle care at Bubbles & Brew"></div><div class="status-card"><span class="pulse"></span><div><b>Built for regulars</b><small>Keep your car cared for without the hassle.</small></div><strong>→</strong></div></div>
          </article>
        </div>
        <button class="hero-arrow hero-prev" type="button" aria-label="Previous highlight">←</button><button class="hero-arrow hero-next" type="button" aria-label="Next highlight">→</button>
        <div class="hero-dots" role="tablist" aria-label="Choose highlight"><button class="hero-dot is-active" type="button" role="tab" aria-selected="true" aria-label="Wash highlight" data-slide-to="0"></button><button class="hero-dot" type="button" role="tab" aria-selected="false" aria-label="Experience highlight" data-slide-to="1"></button><button class="hero-dot" type="button" role="tab" aria-selected="false" aria-label="Membership highlight" data-slide-to="2"></button></div>
      </div>`;

    const track = $('.hero-track');
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = (next, immediate = false) => {
      index = (next + slides.length) % slides.length;
      track.style.transition = immediate || reducedMotion ? 'none' : 'transform 700ms cubic-bezier(.22,.75,.22,1)';
      track.style.transform = `translate3d(-${index * 100}%,0,0)`;
      slides.forEach((slide, i) => { const active = i === index; slide.classList.toggle('is-active', active); slide.setAttribute('aria-hidden', String(!active)); });
      dots.forEach((dot, i) => { const active = i === index; dot.classList.toggle('is-active', active); dot.setAttribute('aria-selected', String(active)); });
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { if (!reducedMotion) { stop(); timer = setInterval(() => render(index + 1), 6500); } };
    $('.hero-prev').addEventListener('click', () => { render(index - 1); start(); });
    $('.hero-next').addEventListener('click', () => { render(index + 1); start(); });
    dots.forEach(dot => dot.addEventListener('click', () => { render(Number(dot.dataset.slideTo)); start(); }));
    hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start); hero.addEventListener('focusin', stop); hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) start(); });
    start();
  }

  initHeroSlider();
  const photoMap = { heroPhoto: media.hero, heroPhoto2: media.img0, heroPhoto3: media.img1, p1: media.img0, p2: media.img1, p3: media.img2 };
  Object.entries(photoMap).forEach(([id, src]) => { const el = document.getElementById(id); if (el && src) el.src = src; });

  const date = new Date(); date.setDate(date.getDate() + 1); $('#bDate').min = date.toISOString().slice(0, 10);
  const backendReady = Boolean(config.supabaseUrl && config.supabaseAnonKey); let services = [];
  const setBookingMessage = (message, good = true) => { const el = $('#bookingResult'); el.textContent = message; el.classList.toggle('success', good); el.classList.toggle('error', !good); };
  function chooseService(name) { const select = $('#bService'); const option = Array.from(select.options).find(o => (o.dataset.name || o.value) === name || o.textContent.split(' — ')[0] === name); if (option) select.value = option.value; }
  async function loadBackendCatalogue() {
    if (!backendReady) return;
    try {
      const res = await fetch(`${config.supabaseUrl}/rest/v1/services?select=id,name,price_ugx&active=eq.true&order=sort_order`, { headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` } });
      if (!res.ok) throw new Error('catalogue unavailable'); services = await res.json(); const select = $('#bService');
      if (services.length) select.innerHTML = services.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} — UGX ${Number(s.price_ugx).toLocaleString()}</option>`).join('');
      const note = document.querySelector('.booking-note span'); if (note) note.textContent = 'Connected to the Bubbles & Brew backend. Booking requests are validated server-side before entering the operations queue.';
      const heading = document.querySelector('.booking-note b'); if (heading) heading.textContent = 'Live booking mode';
    } catch (_) { services = []; setBookingMessage('Backend connection is not available yet. This page remains in safe preview mode.', false); }
  }
  async function createBackendBooking(payload) {
    const service = services.find(s => s.name === payload.service); if (!service) throw new Error('Selected service is not available');
    const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/create_public_booking`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` }, body: JSON.stringify({ p_full_name: payload.name, p_phone: payload.phone, p_email: payload.email || null, p_registration_no: payload.registration, p_vehicle_type: payload.vehicleType, p_service_id: service.id, p_scheduled_date: payload.date, p_scheduled_time: payload.time, p_notes: null }) });
    if (!res.ok) { let detail = 'Booking could not be created'; try { const body = await res.json(); detail = body.message || body.hint || body.details || detail; } catch (_) {} throw new Error(detail); }
    const rows = await res.json(); return Array.isArray(rows) ? rows[0] : rows;
  }
  $('#themeBtn').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('bb-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('bb-theme') === 'dark') document.body.classList.add('dark');
  $('#menuBtn').addEventListener('click', () => { const n = $('#mainNav'); n.style.display = n.style.display === 'flex' ? 'none' : 'flex'; n.style.position = 'absolute'; n.style.top = '70px'; n.style.left = '15px'; n.style.right = '15px'; n.style.background = '#082b36'; n.style.padding = '10px'; n.style.borderRadius = '14px'; n.style.flexDirection = 'column'; });
  document.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => { chooseService(b.dataset.book); $('#book').scrollIntoView({ behavior: 'smooth' }); }));
  document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => { chooseService('Full Wash'); $('#book').scrollIntoView({ behavior: 'smooth' }); $('#bName').focus(); }));
  $('#bookingForm').addEventListener('submit', async e => {
    e.preventDefault(); const submit = e.target.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = 'Creating booking…';
    const serviceName = $('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value.split(' — ')[0];
    const payload = { name: $('#bName').value.trim(), phone: $('#bPhone').value.trim(), vehicle: $('#bVehicle').value.trim(), registration: $('#bRegistration').value.trim(), vehicleType: $('#bVehicleType').value, service: serviceName, date: $('#bDate').value, time: $('#bTime').value, email: null };
    try {
      if (backendReady && services.length) { const result = await createBackendBooking(payload); setBookingMessage(`Booking ${result.booking_number} received for ${payload.registration}. The team can now process it from the operations queue.`); }
      else { const booking = { id: 'BB-' + String(Date.now()).slice(-6), name: payload.name, phone: payload.phone, vehicle: payload.vehicle, registration: payload.registration, vehicleType: payload.vehicleType, service: payload.service, date: payload.date, time: payload.time, status: 'REQUESTED', createdAt: new Date().toISOString() }; const list = JSON.parse(localStorage.getItem('bb-bookings') || '[]'); list.unshift(booking); localStorage.setItem('bb-bookings', JSON.stringify(list)); setBookingMessage(`Preview booking ${booking.id} created for ${booking.registration}. It is stored on this device only.`); }
      e.target.reset(); $('#bDate').min = date.toISOString().slice(0, 10);
    } catch (error) { setBookingMessage(error.message || 'Booking failed. Please try again.', false); } finally { submit.disabled = false; submit.innerHTML = 'Create booking <span>→</span>'; }
  });
  $('#demoDash').addEventListener('click', () => { $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); });
  $('#closeModal').addEventListener('click', () => { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); });
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#closeModal').click(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  loadBackendCatalogue();
})();
