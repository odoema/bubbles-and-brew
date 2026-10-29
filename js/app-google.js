(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const config = window.BB_CONFIG || {};
  const apiUrl = String(config.googleAppsScriptUrl || '').replace(/\/$/, '');
  const photoMap = { heroPhoto: media.hero, p1: media.img0, p2: media.img1, p3: media.img2 };
  Object.entries(photoMap).forEach(([id, src]) => { const el = document.getElementById(id); if (el && src) el.src = src; });

  const localDate = d => {
    const x = d || new Date();
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minBookingDate = localDate(tomorrow);
  $('#bDate').min = minBookingDate;

  const fallbackServices = [
    { id:'basic-wash', name:'Basic Wash', price_ugx:15000, sortOrder:10 },
    { id:'full-wash', name:'Full Wash', price_ugx:25000, sortOrder:20 },
    { id:'premium-care', name:'Premium Care', price_ugx:45000, sortOrder:30 }
  ];
  let services = fallbackServices.slice();

  const setBookingMessage = (message, good = true) => {
    const el = $('#bookingResult');
    el.textContent = message;
    el.classList.toggle('success', good);
    el.classList.toggle('error', !good);
  };

  function populateServices(list) {
    services = list.length ? list : fallbackServices.slice();
    const select = $('#bService');
    if (!select) return;
    const current = select.value;
    select.innerHTML = services.map(s => `<option value="${String(s.id).replace(/"/g,'&quot;')}" data-name="${String(s.name).replace(/"/g,'&quot;')}">${s.name} — UGX ${Number(s.price_ugx || 0).toLocaleString()}</option>`).join('');
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
    const booking = { id:bookingNumber, bookingNumber, ...payload, registration:String(payload.registration).trim().toUpperCase(), serviceId:service?.id || payload.serviceId || '', status:'requested', paymentStatus:'unpaid', amount:Number(service?.price_ugx || 0), quotedAmountUgx:Number(service?.price_ugx || 0), notes:payload.notes || '', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), source:'local-fallback' };
    const list = JSON.parse(localStorage.getItem('bb-bookings') || '[]');
    list.unshift(booking); localStorage.setItem('bb-bookings', JSON.stringify(list));
    return booking;
  }

  async function postToGoogle(action, payload) {
    if (!apiUrl) throw new Error('Google Apps Script endpoint is not configured yet.');
    const response = await fetch(apiUrl, { method:'POST', redirect:'follow', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action,...payload}) });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch (_) { throw new Error('The Google backend returned an unexpected response.'); }
    if (!data.success) throw new Error(data.error || 'Google backend rejected the request.');
    return data;
  }

  async function getFromGoogle(action) {
    if (!apiUrl) throw new Error('Google Apps Script endpoint is not configured yet.');
    const url = new URL(apiUrl);
    url.searchParams.set('action', action);
    url.searchParams.set('_t', Date.now());
    const response = await fetch(url.toString(), { method:'GET', redirect:'follow', cache:'no-store' });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch (_) { throw new Error('The Google backend returned an unexpected response.'); }
    if (!data.success) throw new Error(data.error || 'Google backend rejected the request.');
    return data;
  }

  async function loadCatalogue() {
    if (!apiUrl) { populateServices(fallbackServices); updateBackendNote(false); return; }
    try {
      const result = await getFromGoogle('services');
      if (result.success && Array.isArray(result.services) && result.services.length) { populateServices(result.services); updateBackendNote(true); }
      else { populateServices(fallbackServices); updateBackendNote(false); }
    } catch (err) { console.warn('Google catalogue unavailable', err); populateServices(fallbackServices); updateBackendNote(false); }
  }

  function updateBackendNote(live) {
    const note = document.querySelector('.booking-note span');
    const heading = document.querySelector('.booking-note b');
    if (live) {
      if (heading) heading.textContent = 'Live booking mode';
      if (note) note.textContent = 'Connected to Google Workspace. New bookings are written to the Bubbles & Brew operations Google Sheet.';
    } else if (apiUrl) {
      if (heading) heading.textContent = 'Google backend unavailable';
      if (note) note.textContent = 'The Google backend could not be reached, so this browser will keep a safe local test copy until the backend is available.';
    } else {
      if (heading) heading.textContent = 'Setup pending';
      if (note) note.textContent = 'Add the Google Apps Script /exec URL to js/config.js to send live bookings to Google Sheets.';
    }
  }

  $('#themeBtn').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('bb-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('bb-theme') === 'dark') document.body.classList.add('dark');

  const nav=$('#mainNav'), menuBtn=$('#menuBtn');
  const setMenu=open=>{nav.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');menuBtn.textContent=open?'✕':'☰';};
  menuBtn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
  window.matchMedia('(min-width:851px)').addEventListener('change',e=>{if(e.matches)setMenu(false);});

  const stepEls=Array.from(document.querySelectorAll('#bookingForm .step')), dots=Array.from(document.querySelectorAll('#bookingSteps li')), backBtn=$('#stepBack'), nextBtn=$('#stepNext');
  let step=1;
  function showStep(n,opts={}){
    step=n; stepEls.forEach(el=>{el.hidden=Number(el.dataset.step)!==n;});
    dots.forEach((d,i)=>{d.classList.toggle('active',i+1===n);d.classList.toggle('done',i+1<n);if(i+1===n)d.setAttribute('aria-current','step');else d.removeAttribute('aria-current');});
    backBtn.hidden=n===1;nextBtn.hidden=n===3;$('#stepSubmit').hidden=n!==3;if(n===3)fillSummary();
    if(opts.scroll!==false&&$('#bookingForm').getBoundingClientRect().top<0)$('#bookingForm').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function fillSummary(){
    const dateValue=$('#bDate').value, when=dateValue?new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+' · '+$('#bTime').value:'';
    const values={service:$('#bService').selectedOptions[0]?.dataset?.name||$('#bService').value.split(' — ')[0],when,vehicle:$('#bVehicle').value.trim(),registration:$('#bRegistration').value.trim().toUpperCase(),vehicleType:$('#bVehicleType').selectedOptions[0]?.textContent||'',name:$('#bName').value.trim(),phone:$('#bPhone').value.trim()};
    document.querySelectorAll('[data-sum]').forEach(el=>{el.textContent=values[el.dataset.sum]||'';});
  }
  function validateStep(n){
    const fields=stepEls[n-1].querySelectorAll('input,select');
    for(const f of fields){if(!f.checkValidity()){f.reportValidity();return false;}}
    if(n===2&&$('#bPhone').value.replace(/\D/g,'').length<9){setBookingMessage('Please enter a valid mobile number.',false);$('#bPhone').focus();return false;}
    return true;
  }
  nextBtn.addEventListener('click',()=>{if(!validateStep(step))return;setBookingMessage('',true);showStep(Math.min(step+1,3));});
  backBtn.addEventListener('click',()=>{setBookingMessage('',true);showStep(Math.max(step-1,1));});
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{chooseService(b.dataset.book);showStep(1,{scroll:false});$('#book').scrollIntoView({behavior:'smooth'});$('#bVehicle').focus({preventScroll:true});}));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{chooseService(b.dataset.plan==='Bubbly'?'Basic Wash':'Full Wash');showStep(1,{scroll:false});$('#book').scrollIntoView({behavior:'smooth'});$('#bVehicle').focus({preventScroll:true});}));

  $('#bookingForm').addEventListener('submit',async e=>{
    e.preventDefault(); if(step<3){nextBtn.click();return;}
    for(let n=1;n<=2;n++){if(!validateStep(n)){showStep(n);return;}}
    const submit=e.target.querySelector('button[type="submit"]');submit.disabled=true;submit.textContent='Saving booking…';
    const selected=$('#bService').selectedOptions[0];
    const payload={name:$('#bName').value.trim(),phone:$('#bPhone').value.trim(),vehicle:$('#bVehicle').value.trim(),registration:$('#bRegistration').value.trim(),vehicleType:$('#bVehicleType').value,service:selected?.dataset?.name||selected?.textContent?.split(' — ')[0]||'Basic Wash',serviceId:selected?.value||'basic-wash',date:$('#bDate').value,time:$('#bTime').value,notes:null};
    try{
      let result;
      if(apiUrl){
        try{
          result=await postToGoogle('createBooking',payload);
          const service=services.find(s=>s.id===payload.serviceId||s.name===payload.service);
          const localBooking={id:result.bookingNumber,bookingNumber:result.bookingNumber,...payload,amount:Number(result.quotedAmountUgx||service?.price_ugx||0),quotedAmountUgx:Number(result.quotedAmountUgx||service?.price_ugx||0),status:result.status||'requested',paymentStatus:'unpaid',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),source:'google-sheets'};
          const list=JSON.parse(localStorage.getItem('bb-bookings')||'[]');list.unshift(localBooking);localStorage.setItem('bb-bookings',JSON.stringify(list));
          setBookingMessage(`Booking ${result.bookingNumber} received for ${payload.registration}. The team can now process it from the Google operations sheet.`);
        }catch(err){console.warn('Google booking failed; local fallback used.',err);result=saveLocalBooking(payload);setBookingMessage(`Google backend was unavailable, so booking ${result.bookingNumber} was saved locally for testing.`,true);}
      }else{result=saveLocalBooking(payload);setBookingMessage(`Booking ${result.bookingNumber} created in local test mode. Configure Google Apps Script for live operations.`,true);}
      e.target.reset();$('#bDate').min=minBookingDate;populateServices(services);showStep(1,{scroll:false});$('#bookingResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    }catch(error){setBookingMessage(error.message||'Booking failed. Please try again.',false);}
    finally{submit.disabled=false;submit.innerHTML='Create booking <span>→</span>';}
  });

  const dashBtn=$('#demoDash');
  if(dashBtn){const link=document.createElement('a');link.className=dashBtn.className;link.href='/dashboard.html';link.textContent='Open operations dashboard →';dashBtn.replaceWith(link);}
  const closeModal=$('#closeModal');
  if(closeModal)closeModal.addEventListener('click',()=>{$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');});
  $('#modal')?.addEventListener('click',e=>{if(e.target.id==='modal')closeModal?.click();});
  populateServices(fallbackServices); loadCatalogue();
})();
