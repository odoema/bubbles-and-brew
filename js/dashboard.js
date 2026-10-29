(() => {
  const KEY = 'bb-bookings';
  const prices = { 'Basic Wash': 15000, 'Full Wash': 25000, 'Premium Care': 45000 };
  const statusLabels = {
    requested: 'REQUESTED', confirmed: 'CONFIRMED', checked_in: 'CHECKED IN', washing: 'WASHING', ready: 'READY', completed: 'COMPLETED', cancelled: 'CANCELLED', no_show: 'NO-SHOW'
  };
  const nextStatus = { requested: 'confirmed', confirmed: 'checked_in', checked_in: 'washing', washing: 'ready', ready: 'completed' };
  const $ = s => document.querySelector(s);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const money = n => `UGX ${Number(n || 0).toLocaleString()}`;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } };
  const write = list => localStorage.setItem(KEY, JSON.stringify(list));
  const normalize = b => ({
    id: b.id || `BB-${Date.now().toString().slice(-6)}`,
    bookingNumber: b.bookingNumber || b.id || `BB-${Date.now().toString().slice(-6)}`,
    name: b.name || b.fullName || 'Walk-in customer', phone: b.phone || '', vehicle: b.vehicle || b.vehicleMakeModel || 'Vehicle',
    registration: String(b.registration || b.registrationNo || '').toUpperCase(), vehicleType: b.vehicleType || 'other',
    service: b.service || b.serviceName || 'Full Wash', date: b.date || b.scheduledDate || today(), time: b.time || b.scheduledTime || '09:00',
    status: String(b.status || 'requested').toLowerCase(), amount: Number(b.amount ?? b.quotedAmountUgx ?? prices[b.service] ?? 0),
    notes: b.notes || '', createdAt: b.createdAt || new Date().toISOString(), updatedAt: b.updatedAt || b.createdAt || new Date().toISOString()
  });
  const getList = () => read().map(normalize);
  const saveList = list => write(list.map(normalize));
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600); }
  function renderKpis(list) {
    const t = today(), todayList = list.filter(b => b.date === t), completed = todayList.filter(b => b.status === 'completed');
    const revenue = completed.reduce((s,b) => s + Number(b.amount || 0), 0);
    const counts = { bookings: todayList.length, requested: todayList.filter(b => b.status === 'requested').length, washing: todayList.filter(b => b.status === 'washing').length, ready: todayList.filter(b => b.status === 'ready').length, completed: completed.length, revenue };
    $('#kpis').innerHTML = [['Bookings',counts.bookings],['Requested',counts.requested],['Washing',counts.washing],['Ready',counts.ready],['Completed',counts.completed],['Revenue',money(counts.revenue)]].map(([label,value]) => `<div class="kpi"><b>${value}</b><span>${label}</span></div>`).join('');
  }
  function filtered(list) {
    const q = ($('#search').value || '').trim().toLowerCase(), dateMode = $('#dateFilter').value, status = $('#statusFilter').value;
    return list.filter(b => { if (dateMode === 'today' && b.date !== today()) return false; if (status !== 'all' && b.status !== status) return false; if (!q) return true; return [b.bookingNumber,b.name,b.phone,b.registration,b.vehicle,b.service,b.status].join(' ').toLowerCase().includes(q); }).sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }
  function render() {
    const list = getList(); renderKpis(list); const rows = filtered(list), tbody = $('#bookingRows');
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><b>No bookings in this view.</b>Customer bookings and walk-ins will appear here.</div></td></tr>`; return; }
    tbody.innerHTML = rows.map(b => {
      const next = nextStatus[b.status], action = next ? `<button data-action="${next}" data-id="${b.id}">${statusLabels[next]}</button>` : '';
      const cancel = ['completed','cancelled','no_show'].includes(b.status) ? '' : `<button data-action="cancelled" data-id="${b.id}">CANCEL</button>`;
      const noShow = ['completed','cancelled','no_show'].includes(b.status) ? '' : `<button data-action="no_show" data-id="${b.id}">NO-SHOW</button>`;
      const isNew = b.status === 'requested';
      const created = new Date(b.createdAt);
      const createdText = Number.isNaN(created.getTime()) ? '' : created.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
      return `<tr class="${isNew ? 'new-booking-row' : ''}"><td><span class="booking-no">${escapeHtml(b.bookingNumber)}</span>${isNew ? ' <span class="new-badge">NEW</span>' : ''}<br><span class="muted">Received ${escapeHtml(createdText)}</span></td><td><b>${escapeHtml(b.name)}</b><br><span class="muted">${escapeHtml(b.phone)}</span></td><td><span class="vehicle">${escapeHtml(b.vehicle)}</span><br><span class="muted">${escapeHtml(b.registration)}</span></td><td>${escapeHtml(b.service)}</td><td>${escapeHtml(b.date)}<br><b>${escapeHtml(b.time)}</b></td><td><span class="status ${b.status}">${statusLabels[b.status] || b.status.toUpperCase()}</span></td><td>${money(b.amount)}</td><td><div class="actions">${action}${cancel}${noShow}</div></td></tr>`;
    }).join('');
  }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function changeStatus(id,status) { const list=getList(), b=list.find(x=>x.id===id); if(!b)return; b.status=status; b.updatedAt=new Date().toISOString(); saveList(list); toast(`${b.bookingNumber} → ${statusLabels[status]}`); render(); }
  function openModal(open) { $('#modalBackdrop').classList.toggle('open',open); $('#modalBackdrop').setAttribute('aria-hidden',String(!open)); if(open){$('#wDate').value=today();$('#wDate').min=today();setTimeout(()=>$('#wName').focus(),50);} }
  $('#bookingRows').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(btn)changeStatus(btn.dataset.id,btn.dataset.action);});
  ['search','dateFilter','statusFilter'].forEach(id=>$(id==="search"?'#search':`#${id}`).addEventListener('input',render));
  $('#refresh').addEventListener('click',render); $('#addBooking').addEventListener('click',()=>openModal(true)); $('#cancelModal').addEventListener('click',()=>openModal(false)); $('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')openModal(false);});
  $('#walkInForm').addEventListener('submit',e=>{e.preventDefault();const service=$('#wService').value,d=$('#wDate').value,t=$('#wTime').value,bookingNumber=`BB-${d.replace(/-/g,'')}-${Math.random().toString(16).slice(2,8).toUpperCase()}`;const booking=normalize({id:bookingNumber,bookingNumber,name:$('#wName').value.trim(),phone:$('#wPhone').value.trim(),vehicle:$('#wVehicle').value.trim(),registration:$('#wReg').value.trim().toUpperCase(),vehicleType:$('#wType').value,service,date:d,time:t,status:'checked_in',amount:prices[service]||0,notes:$('#wNotes').value.trim(),createdAt:new Date().toISOString()});const list=getList();list.unshift(booking);saveList(list);e.target.reset();openModal(false);$('#wDate').value=today();toast(`${bookingNumber} added and checked in`);render();});
  $('#clearData').addEventListener('click',()=>{if(!confirm('Clear all local MVP booking data from this device? This cannot be undone.'))return;localStorage.removeItem(KEY);render();toast('Local test data cleared');});
  $('#print').addEventListener('click',()=>window.print()); document.addEventListener('keydown',e=>{if(e.key==='Escape')openModal(false);});
  window.addEventListener('storage', e => { if(e.key === KEY) render(); });
  window.addEventListener('focus', render);
  setInterval(render, 1000);
  render();
})();
