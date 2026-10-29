(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};
  const photoMap = { heroPhoto: media.hero, p1: media.img0, p2: media.img1, p3: media.img2 };
  Object.entries(photoMap).forEach(([id, src]) => { const el = document.getElementById(id); if (el && src) el.src = src; });

  const localDate = d => {
    const x = d || new Date();
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minBookingDate = localDate(tomorrow);
  $('#bDate').min = minBookingDate;

  const fb = config.firebase || {};
  const backendReady = Boolean(fb.apiKey && fb.projectId && fb.appId);
  let services = [];
  let db = null;
  let firebaseReady = false;
  const functionsBase = String(config.functionsBaseUrl || '').replace(/\/$/, '');
  const fallbackServices = [
    { id:'basic-wash', name:'Basic Wash', price_ugx:15000, sortOrder:10 },
    { id:'full-wash', name:'Full Wash', price_ugx:25000, sortOrder:20 },
    { id:'premium-care', name:'Premium Care', price_ugx:45000, sortOrder:30 }
  ];

  const setBookingMessage = (message, good = true) => {
    const el = $('#bookingResult');
    el.textContent = message;
    el.classList.toggle('success', good);
    el.classList.toggle('error', !good);
  };

  function populateServices(list) {
    services = list.length ? list : fallbackServices;
    const select = $('#bService');
    if (!select) return;
    const current = select.value;
    select.innerHTML = services.map(s =>
      `<option value="${String(s.id).replace(/"/g,'&quot;')}" data-name="${String(s.name).replace(/"/g,'&quot;')}">${s.name} — UGX ${Number(s.price_ugx || 0).toLocaleString()}</option>`
    ).join('');
    const preferred = services.find(s => s.id === current || s.name === current);
    if (preferred) select.value = preferred.id;
  }

  function chooseService(name) {
    const select = $('#bService');
    const option = Array.from(select.options).find(o => (o.dataset.name || o.value) === name || o.textContent.split(' — ')[0] === name);
    if (option) select.value = option.value;
  }

  function randomSuffix() { return Math.random().toString(16).slice(2, 8).toUpperCase(); }

  function saveLocalBooking(payload) {
    const service = services.find(s => s.name === payload.service || s.id === payload.serviceId) || fallbackServices.find(s => s.name === payload.service);
    const bookingNumber = 'BB-' + String(payload.date).replace(/-/g,'') + '-' + randomSuffix();
    const booking = {
      id: bookingNumber,
      bookingNumber,
      name: payload.name,
      phone: payload.phone,
      vehicle: payload.vehicle,
      registration: String(payload.registration).trim().toUpperCase(),
      vehicleType: payload.vehicleType,
      service: payload.service,
      serviceId: service?.id || payload.serviceId || '',
      date: payload.date,
      time: payload.time,
      status: 'requested',
      paymentStatus: 'unpaid',
      amount: Number(service?.price_ugx || 0),
      quotedAmountUgx: Number(service?.price_ugx || 0),
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const list = JSON.parse(localStorage.getItem('bb-bookings') || '[]');
    list.unshift(booking);
    localStorage.setItem('bb-bookings', JSON.stringify(list));
    return booking;
  }

  async function initFirebase() {
    if (!backendReady || typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(fb);
      db = firebase.firestore();
      firebaseReady = true;
      return true;
    } catch (err) {
      console.warn('Firebase init failed', err);
      firebaseReady = false;
      return false;
    }
  }

  async function loadBackendCatalogue() {
    const ready = await initFirebase();
    if (!ready || !db) { populateServices(fallbackServices); return; }
    try {
      const snap = await db.collection('services').where('active','==',true).orderBy('sortOrder').get();
      const loaded = snap.docs.map(d => {
        const data = d.data();
        return { id:d.id, name:data.name, price_ugx:Number(data.priceUgx ?? data.price_ugx ?? 0), sortOrder:Number(data.sortOrder ?? 0) };
      });
      populateServices(loaded);
      const note = document.querySelector('.booking-note span');
      const heading = document.querySelector('.booking-note b');
      if (loaded.length) {
        if (note) note.textContent = 'Connected to Firebase. New bookings can be sent to the Bubbles & Brew operations queue.';
        if (heading) heading.textContent = 'Live booking mode';
      } else {
        if (note) note.textContent = 'Firebase is connected, but the service catalogue is not seeded yet. The MVP keeps a safe built-in catalogue for testing.';
        if (heading) heading.textContent = 'MVP catalogue mode';
      }
    } catch (err) {
      console.warn('Catalogue load failed', err);
      populateServices(fallbackServices);
      const note = document.querySelector('.booking-note span');
      const heading = document.querySelector('.booking-note b');
      if (note) note.textContent = 'The live catalogue is not available yet. The booking journey remains fully testable using the built-in MVP catalogue.';
      if (heading) heading.textContent = 'MVP booking mode';
    }
  }

  async function createBackendBooking(payload) {
    const service = services.find(s => s.name === payload.service || s.id === $('#bService').value);
    if (!service) throw new Error('Selected service is not available');

    if (functionsBase) {
      const res = await fetch(`${functionsBase}/createPublicBooking`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ fullName:payload.name, phone:payload.phone, email:null, registrationNo:payload.registration, vehicleType:payload.vehicleType, serviceId:service.id, scheduledDate:payload.date, scheduledTime:payload.time, notes:payload.notes || null })
      });
      if (!res.ok) {
        let detail = 'Booking could not be created';
        try { const body = await res.json(); detail = body.error || body.message || detail; } catch (_) {}
        throw new Error(detail);
      }
      return await res.json();
    }

    if (!firebaseReady || !db) throw new Error('Firebase is not initialised');
    const serviceSnap = await db.collection('services').doc(service.id).get();
    if (!serviceSnap.exists) throw new Error('The live service catalogue is not seeded yet');
    const liveService = serviceSnap.data();
    const phone = String(payload.phone || '').replace(/[^0-9+]/g,'');
    const registrationNo = String(payload.registration || '').trim().toUpperCase();
    const priceUgx = Number(liveService.priceUgx ?? liveService.price_ugx ?? 0);

    const customersQ = await db.collection('customers').where('phone','==',phone).limit(1).get();
    let customerId;
    if (customersQ.empty) {
      const ref = await db.collection('customers').add({ fullName:payload.name.trim(), phone, email:null, createdAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp() });
      customerId = ref.id;
    } else {
      customerId = customersQ.docs[0].id;
      await db.collection('customers').doc(customerId).update({ fullName:payload.name.trim(), updatedAt:firebase.firestore.FieldValue.serverTimestamp() });
    }

    const vehiclesQ = await db.collection('vehicles').where('customerId','==',customerId).where('registrationNo','==',registrationNo).limit(1).get();
    let vehicleId;
    if (vehiclesQ.empty) {
      const ref = await db.collection('vehicles').add({ customerId, registrationNo, vehicleType:payload.vehicleType || 'other', createdAt:firebase.firestore.FieldValue.serverTimestamp() });
      vehicleId = ref.id;
    } else {
      vehicleId = vehiclesQ.docs[0].id;
      await db.collection('vehicles').doc(vehicleId).update({ vehicleType:payload.vehicleType || 'other' });
    }

    const existingQ = await db.collection('bookings').where('vehicleId','==',vehicleId).where('scheduledDate','==',payload.date).where('scheduledTime','==',payload.time).get();
    const blocked = ['cancelled','no_show','completed'];
    if (existingQ.docs.some(d => !blocked.includes(d.data().status))) throw new Error('This vehicle already has a booking at that time');

    const bookingNumber = 'BB-' + String(payload.date).replace(/-/g,'') + '-' + randomSuffix();
    const bookingRef = await db.collection('bookings').add({ bookingNumber, customerId, vehicleId, serviceId:service.id, bayId:null, scheduledDate:payload.date, scheduledTime:payload.time, status:'requested', paymentStatus:'unpaid', quotedAmountUgx:priceUgx, notes:payload.notes || null, createdAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp(), completedAt:null });
    await db.collection('bookingStatusHistory').add({ bookingId:bookingRef.id, oldStatus:null, newStatus:'requested', note:'Public booking request received', createdAt:firebase.firestore.FieldValue.serverTimestamp() });
    return { bookingId:bookingRef.id, bookingNumber, status:'requested', quotedAmountUgx:priceUgx };
  }

  $('#themeBtn').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('bb-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('bb-theme') === 'dark') document.body.classList.add('dark');

  const nav = $('#mainNav'), menuBtn = $('#menuBtn');
  const setMenu = open => { nav.classList.toggle('open',open); menuBtn.setAttribute('aria-expanded',String(open)); menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu'); menuBtn.textContent=open?'✕':'☰'; };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width:851px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  const stepEls = Array.from(document.querySelectorAll('#bookingForm .step'));
  const dots = Array.from(document.querySelectorAll('#bookingSteps li'));
  const backBtn = $('#stepBack'), nextBtn = $('#stepNext');
  let step = 1;

  function showStep(n, opts={}) {
    step=n;
    stepEls.forEach(el => { el.hidden = Number(el.dataset.step) !== n; });
    dots.forEach((d,i) => { d.classList.toggle('active',i+1===n); d.classList.toggle('done',i+1<n); if(i+1===n)d.setAttribute('aria-current','step');else d.removeAttribute('aria-current'); });
    backBtn.hidden=n===1; nextBtn.hidden=n===3; $('#stepSubmit').hidden=n!==3;
    if(n===3) fillSummary();
    if(opts.scroll!==false && $('#bookingForm').getBoundingClientRect().top<0) $('#bookingForm').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function fillSummary() {
    const dateValue=$('#bDate').value;
    const when=dateValue ? new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+' · '+$('#bTime').value : '';
    const values={service:$('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value.split(' — ')[0],when,vehicle:$('#bVehicle').value.trim(),registration:$('#bRegistration').value.trim().toUpperCase(),vehicleType:$('#bVehicleType').selectedOptions[0]?.textContent || '',name:$('#bName').value.trim(),phone:$('#bPhone').value.trim()};
    document.querySelectorAll('[data-sum]').forEach(el => { el.textContent=values[el.dataset.sum] || ''; });
  }

  function validateStep(n) {
    const fields=stepEls[n-1].querySelectorAll('input,select');
    for(const f of fields){ if(!f.checkValidity()){f.reportValidity();return false;} }
    if(n===2 && $('#bPhone').value.replace(/\D/g,'').length<9){setBookingMessage('Please enter a valid mobile number.',false);$('#bPhone').focus();return false;}
    return true;
  }

  nextBtn.addEventListener('click', () => { if(!validateStep(step))return; setBookingMessage('',true); showStep(Math.min(step+1,3)); });
  backBtn.addEventListener('click', () => { setBookingMessage('',true); showStep(Math.max(step-1,1)); });

  document.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => { chooseService(b.dataset.book); showStep(1,{scroll:false}); $('#book').scrollIntoView({behavior:'smooth'}); $('#bVehicle').focus({preventScroll:true}); }));
  document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => { chooseService(b.dataset.plan==='Bubbly'?'Basic Wash':'Full Wash'); showStep(1,{scroll:false}); $('#book').scrollIntoView({behavior:'smooth'}); $('#bVehicle').focus({preventScroll:true}); }));

  $('#bookingForm').addEventListener('submit', async e => {
    e.preventDefault();
    if(step<3){nextBtn.click();return;}
    for(let n=1;n<=2;n++){if(!validateStep(n)){showStep(n);return;}}
    const submit=e.target.querySelector('button[type="submit"]'); submit.disabled=true; submit.textContent='Creating booking…';
    const payload={name:$('#bName').value.trim(),phone:$('#bPhone').value.trim(),vehicle:$('#bVehicle').value.trim(),registration:$('#bRegistration').value.trim(),vehicleType:$('#bVehicleType').value,service:$('#bService').selectedOptions[0]?.dataset?.name || $('#bService').value,date:$('#bDate').value,time:$('#bTime').value,notes:null};
    try {
      let result=null; let live=false;
      if(functionsBase || (firebaseReady && services.some(s => s.id && !String(s.id).match(/^(basic-wash|full-wash|premium-care)$/)))) {
        try { result=await createBackendBooking(payload); live=true; } catch(err){ console.warn('Live booking path failed; retaining safe MVP fallback.',err); }
      }
      if(!live && firebaseReady && services.some(s => s.id && !['basic-wash','full-wash','premium-care'].includes(s.id))){
        try { result=await createBackendBooking(payload); live=true; } catch(err){ console.warn('Firestore booking path failed; using local MVP mode.',err); }
      }
      if(!live) result=saveLocalBooking(payload);
      const number=result.bookingNumber || result.booking_number || result.id;
      if(live){
        setBookingMessage(`Booking ${number} received for ${payload.registration}. The team can now process it from the live queue.`);
      }else{
        setBookingMessage(`Booking ${number} created for ${payload.registration}. It is now in the MVP operations dashboard on this device.`);
      }
      e.target.reset(); $('#bDate').min=minBookingDate; populateServices(services); showStep(1,{scroll:false});
      $('#bookingResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch(error){ setBookingMessage(error.message || 'Booking failed. Please try again.',false); }
    finally{ submit.disabled=false; submit.innerHTML='Create booking <span>→</span>'; }
  });

  const dashBtn=$('#demoDash');
  if(dashBtn){
    const link=document.createElement('a');
    link.className=dashBtn.className; link.href='/dashboard.html'; link.textContent='Open operations dashboard →';
    dashBtn.replaceWith(link);
  }
  const closeModal=$('#closeModal');
  if(closeModal){ closeModal.addEventListener('click', () => { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden','true'); }); }
  $('#modal')?.addEventListener('click', e => { if(e.target.id==='modal') closeModal?.click(); });

  // Service workers are intentionally disabled for this production site.
  // The customer MVP remains network-first and keeps local bookings only as a safe fallback.
  populateServices(fallbackServices);
  loadBackendCatalogue();
})();
