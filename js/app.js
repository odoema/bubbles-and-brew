(() => {
  const $ = s => document.querySelector(s);
  const media = window.BB_MEDIA || {};
  const photoMap = {heroPhoto:media.hero,p1:media.img0,p2:media.img1,p3:media.img2};
  Object.entries(photoMap).forEach(([id,src]) => { const el=document.getElementById(id); if(el&&src) el.src=src; });
  const date = new Date(); date.setDate(date.getDate()+1); $('#bDate').min = date.toISOString().slice(0,10);
  $('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('bb-theme',document.body.classList.contains('dark')?'dark':'light')});
  if(localStorage.getItem('bb-theme')==='dark') document.body.classList.add('dark');
  $('#menuBtn').addEventListener('click',()=>{const n=$('#mainNav');n.style.display=n.style.display==='flex'?'none':'flex';n.style.position='absolute';n.style.top='70px';n.style.left='15px';n.style.right='15px';n.style.background='#082b36';n.style.padding='10px';n.style.borderRadius='14px';n.style.flexDirection='column'});
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{ $('#bService').value=b.dataset.book; $('#book').scrollIntoView({behavior:'smooth'}); }));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{ $('#bService').value='Full Wash'; $('#book').scrollIntoView({behavior:'smooth'}); $('#bName').focus(); }));
  $('#bookingForm').addEventListener('submit',e=>{
    e.preventDefault();
    const booking={id:'BB-'+String(Date.now()).slice(-6),name:$('#bName').value.trim(),phone:$('#bPhone').value.trim(),vehicle:$('#bVehicle').value.trim(),service:$('#bService').value,date:$('#bDate').value,time:$('#bTime').value,status:'REQUESTED',createdAt:new Date().toISOString()};
    const list=JSON.parse(localStorage.getItem('bb-bookings')||'[]'); list.unshift(booking); localStorage.setItem('bb-bookings',JSON.stringify(list));
    $('#bookingResult').textContent=`Booking request ${booking.id} created for ${booking.vehicle}. Preview mode: it is stored on this device only.`;
    e.target.reset(); $('#bDate').min=date.toISOString().slice(0,10);
  });
  $('#demoDash').addEventListener('click',()=>{ $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden','false'); });
  $('#closeModal').addEventListener('click',()=>{ $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden','true'); });
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal') $('#closeModal').click()});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();