(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};
  const apiUrl = String(config.googleAppsScriptUrl || '').replace(/\/$/, '');
  const photoMap = { heroPhoto: media.hero, p1: media.img0, p2: media.img1, p3: media.img2 };
  Object.entries(photoMap).forEach(([id, src]) => { const el = document.getElementById(id); if (el && src) el.src = src; });

  const localDate = d => { const x = d || new Date(); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minBookingDate = localDate(tomorrow);
  if ($('#bDate')) $('#bDate').min = minBookingDate;

  const fallbackServices = [
    { id:'basic-wash', name:'Basic Wash', price_ugx:15000, sortOrder:10 },
    { id:'full-wash', name:'Full Wash', price_ugx:25000, sortOrder:20 },
    { id:'premium-care', name:'Premium Care', price_ugx:45000, sortOrder:30 }
  ];
  let services = fallbackServices.slice();
  let backendLive = false;

  const setBookingMessage = (message, good = true) => {
    const el = $('#bookingResult'); if (!el) return;
    el.textContent = message;
    el.classList.toggle('success', good); el.classList.toggle('error', !good);
  };

  function populateServices(list) {
    services = list.length ? list : fallbackServices.slice();
    const select = $('#bService'); if (!select) return;
    const current = select.value;
    select.innerHTML = services.map(s => `<option value="${String(s.id).replace(/"/g,'&quot;')}" data-name="${String(s.name).replace(/"/g,'&quot;')}">${s.name} — UGX ${Number(s.price_ugx || 0).toLocaleString()}</option>`).join('');
    const preferred = services.find(s => s.id === current || s.name === current);
    if (preferred) select.value = preferred.id;
  }

  function chooseService(name) {
    const select = $('#bService'); if (!select) return;
    const option = Array.from(select.options).find(o => (o.dataset.name || o.value) === name || o.textContent.split(' — ')[0] === name);
    if (option) select.value = option.value;
  }

  async function postToGoogle(action, payload) {
    if (!apiUrl) throw new Error('Google booking service is not configured.');
    const response = await fetch(apiUrl, { method:'POST', redirect:'follow', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action,...payload}) });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch (_) { throw new Error('The Google booking service returned an unexpected response.'); }
    if (!data.success) throw new Error(data.error || 'Google booking service rejected the request.');
    return data;
  }

  async function getFromGoogle(action) {
    if (!apiUrl) throw new Error('Google booking service is not configured.');
    const url = new URL(apiUrl); url.searchParams.set('action', action); url.searchParams.set('_t', Date.now());
    const response = await fetch(url.toString(), { method:'GET', redirect:'follow', cache:'no-store' });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch (_) { throw new Error('The Google booking service returned an unexpected response.'); }
    if (!data.success) throw new Error(data.error || 'Google booking service rejected the request.');
    return data;
  }

  function setSubmitAvailability() {
    const submit = $('#stepSubmit');
    if (!submit) return;
    submit.disabled = !backendLive;
    submit.title = backendLive ? '' : 'Live booking service is unavailable. Please refresh and try again.';
  }

  async function loadCatalogue() {
    if (!apiUrl) { backendLive = false; populateServices(fallbackServices); updateBackendNote(false); setSubmitAvailability(); return; }
    try {
      const result = await getFromGoogle('services');
      if (!result.success || !Array.isArray(result.services) || !result.services.length) throw new Error('No active services were returned.');
      populateServices(result.services); backendLive = true; updateBackendNote(true); setSubmitAvailability();
    } catch (err) {
      backendLive = false; populateServices(fallbackServices); updateBackendNote(false); setSubmitAvailability();
      console.warn('Google booking service unavailable', err);
    }
  }

  function updateBackendNote(live) {
    const note = document.querySelector('.booking-note span');
    const heading = document.querySelector('.booking-note b');
    if (live) {
      if (heading) heading.textContent = 'Live booking mode';
      if (note) note.textContent = 'Connected to Google Workspace. Confirmed bookings are written directly to Bubbles & Brew operations.';
    } else if (apiUrl) {
      if (heading) heading.textContent = 'Booking service unavailable';
      if (note) note.textContent = 'Live booking is temporarily unavailable. Please refresh the page and try again. Your booking will not be accepted until the live service is connected.';
    } else {
      if (heading) heading.textContent = 'Booking service not configured';
      if (note) note.textContent = 'The live Google booking service has not been configured yet.';
    }
  }

  $('#themeBtn')?.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('bb-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('bb-theme') === 'dark') document.body.classList.add('dark');

  const nav=$('#mainNav'), menuBtn=$('#menuBtn');
  if (nav && menuBtn) {
    const setMenu=open=>{nav.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');menuBtn.textContent=open?'✕':'☰';};
    menuBtn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
    window.matchMedia('(min-width:851px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});
  }

  const stepEls=Array.from(document.querySelectorAll('#bookingForm .step')), dots=Array.from(document.querySelectorAll('#bookingSteps li')), backBtn=$('#stepBack'), nextBtn=$('#stepNext');
  let step=1;
  function showStep(n,opts={}){
    step=n; stepEls.forEach(el=>{el.hidden=Number(el.dataset.step)!==n;});
    dots.forEach((d,i)=>{d.classList.toggle('active',i+1===n);d.classList.toggle('done',i+1<n);if(i+1===n)d.setAttribute('aria-current','step');else d.removeAttribute('aria-current');});
    if (backBtn) backBtn.hidden=n===1; if (nextBtn) nextBtn.hidden=n===3; if ($('#stepSubmit')) $('#stepSubmit').hidden=n!==3;
    if(n===3)fillSummary();
    if(opts.scroll!==false&&$('#bookingForm')?.getBoundingClientRect().top<0)$('#bookingForm').scrollIntoView({behavior:'smooth',block:'start'});
    setSubmitAvailability();
  }
  function fillSummary(){
    const dateValue=$('#bDate')?.value, when=dateValue?new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+' · '+$('#bTime')?.value:'';
    const values={service:$('#bService')?.selectedOptions[0]?.dataset?.name||$('#bService')?.value?.split(' — ')[0],when,vehicle:$('#bVehicle')?.value.trim(),registration:$('#bRegistration')?.value.trim().toUpperCase(),vehicleType:$('#bVehicleType')?.selectedOptions[0]?.textContent||'',name:$('#bName')?.value.trim(),phone:$('#bPhone')?.value.trim()};
    document.querySelectorAll('[data-sum]').forEach(el=>{el.textContent=values[el.dataset.sum]||'';});
  }
  function validateStep(n){
    const fields=stepEls[n-1].querySelectorAll('input,select');
    for(const f of fields){if(!f.checkValidity()){f.reportValidity();return false;}}
    if(n===2&&$('#bPhone').value.replace(/\D/g,'').length<9){setBookingMessage('Please enter a valid mobile number.',false);$('#bPhone').focus();return false;}
    return true;
  }
  nextBtn?.addEventListener('click',()=>{if(!validateStep(step))return;setBookingMessage('',true);showStep(Math.min(step+1,3));});
  backBtn?.addEventListener('click',()=>{setBookingMessage('',true);showStep(Math.max(step-1,1));});
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{chooseService(b.dataset.book);showStep(1,{scroll:false});$('#book')?.scrollIntoView({behavior:'smooth'});$('#bVehicle')?.focus({preventScroll:true});}));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{chooseService(b.dataset.plan==='Bubbly'?'Basic Wash':'Full Wash');showStep(1,{scroll:false});$('#book')?.scrollIntoView({behavior:'smooth'});$('#bVehicle')?.focus({preventScroll:true});}));

  $('#bookingForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); if(step<3){nextBtn?.click();return;}
    if(!backendLive){setBookingMessage('Live booking is currently unavailable. Please refresh the page and try again. No booking has been created.',false);await loadCatalogue();return;}
    for(let n=1;n<=2;n++){if(!validateStep(n)){showStep(n);return;}}
    const submit=e.target.querySelector('button[type="submit"]'); submit.disabled=true; submit.textContent='Sending booking…';
    const selected=$('#bService').selectedOptions[0];
    const payload={name:$('#bName').value.trim(),phone:$('#bPhone').value.trim(),vehicle:$('#bVehicle').value.trim(),registration:$('#bRegistration').value.trim(),vehicleType:$('#bVehicleType').value,service:selected?.dataset?.name||selected?.textContent?.split(' — ')[0]||'Basic Wash',serviceId:selected?.value||'basic-wash',date:$('#bDate').value,time:$('#bTime').value,notes:null};
    try {
      const result=await postToGoogle('createBooking',payload);
      setBookingMessage(`Booking ${result.bookingNumber} received for ${payload.registration}. The Bubbles & Brew team can now process it.`,true);
      e.target.reset(); if($('#bDate')) $('#bDate').min=minBookingDate; populateServices(services); showStep(1,{scroll:false}); $('#bookingResult')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch(error) {
      backendLive=false; updateBackendNote(false); setSubmitAvailability();
      setBookingMessage(`Booking was NOT created. ${error.message||'Please try again.'}`,false);
    } finally { submit.disabled=!backendLive; submit.innerHTML='Create booking <span>→</span>'; }
  });

  const dashBtn=$('#demoDash');
  if(dashBtn){const link=document.createElement('a');link.className=dashBtn.className;link.href='/dashboard.html';link.textContent='Open operations dashboard →';dashBtn.replaceWith(link);}
  const closeModal=$('#closeModal');
  if(closeModal)closeModal.addEventListener('click',()=>{$('#modal')?.classList.remove('open');$('#modal')?.setAttribute('aria-hidden','true');});
  $('#modal')?.addEventListener('click',e=>{if(e.target.id==='modal')closeModal?.click();});
  populateServices(fallbackServices); setSubmitAvailability(); loadCatalogue();
})();
