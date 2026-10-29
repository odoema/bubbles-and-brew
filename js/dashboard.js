(() => {
  const cfg = window.BB_CONFIG || {};
  const API = cfg.googleAppsScriptUrl || '';
  const TOKEN_KEY = 'bb-dashboard-token';
  const prices = { 'Basic Wash': 15000, 'Full Wash': 25000, 'Premium Care': 45000 };
  const statusLabels = { requested:'REQUESTED', confirmed:'CONFIRMED', checked_in:'CHECKED IN', washing:'WASHING', ready:'READY', completed:'COMPLETED', cancelled:'CANCELLED', no_show:'NO-SHOW' };
  const nextStatus = { requested:'confirmed', confirmed:'checked_in', checked_in:'washing', washing:'ready', ready:'completed' };
  const $ = s => document.querySelector(s);
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const money = n => `UGX ${Number(n||0).toLocaleString()}`;
  const token = () => sessionStorage.getItem(TOKEN_KEY) || '';
  const askForToken = () => { const value=window.prompt('Enter the Bubbles & Brew Operations dashboard access code:'); if(value){sessionStorage.setItem(TOKEN_KEY,value.trim());return value.trim();} return ''; };
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3000);}
  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  async function apiGet(){
    if(!API) throw new Error('Google Apps Script URL is not configured.');
    let access=token() || askForToken();
    if(!access) throw new Error('Dashboard access code is required.');
    let response=await fetch(`${API}?action=bookings&token=${encodeURIComponent(access)}&t=${Date.now()}`,{cache:'no-store'});
    let data=await response.json().catch(()=>({success:false,error:'Invalid backend response.'}));
    if(data.success===false && /authorization/i.test(data.error||'')){sessionStorage.removeItem(TOKEN_KEY);access=askForToken();if(!access)throw new Error('Dashboard access code is required.');response=await fetch(`${API}?action=bookings&token=${encodeURIComponent(access)}&t=${Date.now()}`,{cache:'no-store'});data=await response.json();}
    if(!data.success) throw new Error(data.error||'Could not load live bookings.');
    return data.bookings || [];
  }
  async function apiPost(payload){
    if(!API) throw new Error('Google Apps Script URL is not configured.');
    const access=token() || askForToken(); if(!access) throw new Error('Dashboard access code is required.');
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,dashboardToken:access})});
    const data=await response.json().catch(()=>({success:false,error:'Invalid backend response.'}));
    if(!data.success) throw new Error(data.error||'Operation failed.');
    return data;
  }
  function normalize(b){return {id:b.bookingNumber,bookingNumber:b.bookingNumber||'',name:b.name||'Walk-in customer',phone:b.phone||'',vehicle:b.vehicle||'Vehicle',registration:String(b.registration||'').toUpperCase(),vehicleType:b.vehicleType||'other',service:b.service||'Full Wash',date:b.date||today(),time:b.time||'09:00',status:String(b.status||'requested').toLowerCase(),amount:Number(b.amount||0),notes:b.notes||'',createdAt:b.createdAt||'',updatedAt:b.updatedAt||''};}
  function renderKpis(list){const t=today(),todayList=list.filter(b=>b.date===t),completed=todayList.filter(b=>b.status==='completed'),revenue=completed.reduce((s,b)=>s+Number(b.amount||0),0),counts={bookings:todayList.length,requested:todayList.filter(b=>b.status==='requested').length,washing:todayList.filter(b=>b.status==='washing').length,ready:todayList.filter(b=>b.status==='ready').length,completed:completed.length,revenue};$('#kpis').innerHTML=[['Bookings',counts.bookings],['Requested',counts.requested],['Washing',counts.washing],['Ready',counts.ready],['Completed',counts.completed],['Revenue',money(counts.revenue)]].map(([label,value])=>`<div class="kpi"><b>${value}</b><span>${label}</span></div>`).join('');}
  function filtered(list){const q=($('#search').value||'').trim().toLowerCase(),dateMode=$('#dateFilter').value,status=$('#statusFilter').value;return list.filter(b=>{if(dateMode==='today'&&b.date!==today())return false;if(status!=='all'&&b.status!==status)return false;if(!q)return true;return [b.bookingNumber,b.name,b.phone,b.registration,b.vehicle,b.service,b.status].join(' ').toLowerCase().includes(q);}).sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));}
  async function render(){
    try{
      const list=(await apiGet()).map(normalize);renderKpis(list);const rows=filtered(list),tbody=$('#bookingRows');
      if(!rows.length){tbody.innerHTML='<tr><td colspan="8"><div class="empty"><b>No bookings in this view.</b>Live Google Sheets data is connected and currently has no matching bookings.</div></td></tr>';return;}
      tbody.innerHTML=rows.map(b=>{const next=nextStatus[b.status],action=next?`<button data-action="${next}" data-id="${escapeHtml(b.id)}">${statusLabels[next]}</button>`:'',cancel=['completed','cancelled','no_show'].includes(b.status)?'':`<button data-action="cancelled" data-id="${escapeHtml(b.id)}">CANCEL</button>`,noShow=['completed','cancelled','no_show'].includes(b.status)?'':`<button data-action="no_show" data-id="${escapeHtml(b.id)}">NO-SHOW</button>`,isNew=b.status==='requested',created=new Date(b.createdAt),createdText=Number.isNaN(created.getTime())?'':created.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});return `<tr class="${isNew?'new-booking-row':''}"><td><span class="booking-no">${escapeHtml(b.bookingNumber)}</span>${isNew?' <span class="new-badge">NEW</span>':''}<br><span class="muted">Received ${escapeHtml(createdText)}</span></td><td><b>${escapeHtml(b.name)}</b><br><span class="muted">${escapeHtml(b.phone)}</span></td><td><span class="vehicle">${escapeHtml(b.vehicle)}</span><br><span class="muted">${escapeHtml(b.registration)}</span></td><td>${escapeHtml(b.service)}</td><td>${escapeHtml(b.date)}<br><b>${escapeHtml(b.time)}</b></td><td><span class="status ${escapeHtml(b.status)}">${statusLabels[b.status]||b.status.toUpperCase()}</span></td><td>${money(b.amount)}</td><td><div class="actions">${action}${cancel}${noShow}</div></td></tr>`;}).join('');
    }catch(err){
      $('#kpis').innerHTML='';$('#bookingRows').innerHTML=`<tr><td colspan="8"><div class="empty"><b>Dashboard authorization required</b>${escapeHtml(err.message)}<br><button class="btn primary" id="authorizeBtn" style="margin-top:12px">Enter access code</button></div></td></tr>`;
      const btn=$('#authorizeBtn');if(btn)btn.addEventListener('click',()=>{sessionStorage.removeItem(TOKEN_KEY);render();});
    }
  }
  async function changeStatus(id,status){try{await apiPost({action:'updateStatus',bookingNumber:id,status});toast(`${id} → ${statusLabels[status]}`);await render();}catch(err){toast(err.message);}}
  function openModal(open){$('#modalBackdrop').classList.toggle('open',open);$('#modalBackdrop').setAttribute('aria-hidden',String(!open));if(open){$('#wDate').value=today();$('#wDate').min=today();setTimeout(()=>$('#wName').focus(),50);}}
  $('#bookingRows').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(btn)changeStatus(btn.dataset.id,btn.dataset.action);});
  ['search','dateFilter','statusFilter'].forEach(id=>$('#'+id).addEventListener('input',render));
  $('#refresh').addEventListener('click',render);$('#addBooking').addEventListener('click',()=>openModal(true));$('#cancelModal').addEventListener('click',()=>openModal(false));$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')openModal(false);});
  $('#walkInForm').addEventListener('submit',async e=>{e.preventDefault();const service=$('#wService').value;try{const result=await apiPost({action:'createWalkin',name:$('#wName').value.trim(),phone:$('#wPhone').value.trim(),vehicle:$('#wVehicle').value.trim(),registration:$('#wReg').value.trim().toUpperCase(),vehicleType:$('#wType').value,service,date:$('#wDate').value,time:$('#wTime').value,notes:$('#wNotes').value.trim()});e.target.reset();openModal(false);toast(`${result.bookingNumber} added and checked in`);await render();}catch(err){toast(err.message);}});
  $('#clearData').addEventListener('click',()=>{sessionStorage.removeItem(TOKEN_KEY);toast('Dashboard access cleared. Live Google Sheet data was not deleted.');render();});
  $('#print').addEventListener('click',()=>window.print());document.addEventListener('keydown',e=>{if(e.key==='Escape')openModal(false);});
  const sheetLink=$('#sheetLink');if(sheetLink&&cfg.operationsSheetUrl)sheetLink.href=cfg.operationsSheetUrl;else if(sheetLink)sheetLink.style.display='none';
  render();setInterval(render,15000);
})();
