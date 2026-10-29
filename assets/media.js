// Bubbles & Brew — media and brand source of truth
// IMPORTANT: the site no longer uses a service worker. Remove any legacy
// registration/cache before the current page is allowed to continue.
(function purgeLegacyServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (sessionStorage.getItem('bb-sw-purged-v1')) return;
  sessionStorage.setItem('bb-sw-purged-v1', '1');
  Promise.all([
    navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister()))),
    'caches' in window ? caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))) : Promise.resolve()
  ]).finally(() => window.location.reload());
})();

window.BB_MEDIA = {
  hero: '/assets/hero.jpg',
  img0: '/assets/img0.jpg',
  img1: '/assets/img1.jpg',
  img2: '/assets/img2.jpg'
};

(function () {
  const MASTER_LOGO = '/assets/Bubbles-Brew-master-logo-transparent.png';

  const style = document.createElement('style');
  style.id = 'bb-master-brand';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&display=swap');
    :root { --navy:#063b4d; --navy2:#07586c; --aqua:#079bb7; --aqua2:#70d7e8; --cream:#f7eadb; --orange:#a9550c; --brown:#a9550c; --teal:#087f96; --paper:#fff; --ink:#123c49; --muted:#5d747c; --line:#d5e6e9; --bg:#fbfbf8; --card:#fff; --shadow:0 18px 55px rgba(6,59,77,.11); }
    html,body{font-family:'Manrope',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important}
    h1,h2,h3,.footer-slogan,.metrics b{font-family:'Bricolage Grotesque','Manrope',system-ui,sans-serif!important}
    body{letter-spacing:-.008em} h1,h2,h3{letter-spacing:-.035em}
    .topbar nav a,.eyebrow,.btn,button,input,select{font-family:'Manrope',system-ui,sans-serif!important}
    .topbar nav a{font-weight:800!important;letter-spacing:-.01em}.eyebrow{font-weight:800}
    .topbar{height:138px;padding:10px 24px;box-sizing:border-box;background:#fff!important;color:var(--navy);border-bottom:1px solid #dce8eb;box-shadow:0 4px 18px rgba(6,59,77,.07);backdrop-filter:none}
    .topbar .brand{height:100%;padding:6px 0;box-sizing:border-box;align-items:center;overflow:visible}
    .topbar nav a{color:var(--navy)!important}.topbar nav a:hover{background:rgba(7,155,183,.10)}.topbar nav a.is-current{background:var(--aqua)!important;color:#fff!important;box-shadow:0 7px 18px rgba(7,155,183,.20)}.topbar nav{gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
    .icon-btn,.menu-btn{display:grid!important;place-items:center!important;width:44px!important;height:44px!important;min-width:44px;padding:0!important;border:1px solid #cfe1e5!important;border-radius:12px!important;background:#fff!important;color:var(--navy)!important;font-size:0!important;line-height:1!important;box-shadow:0 3px 12px rgba(6,59,77,.05)}
    #themeBtn::before{content:'◐';font-size:20px;font-weight:800;line-height:1}#menuBtn::before{content:'☰';font-size:22px;font-weight:800;line-height:1}#menuBtn[aria-expanded="true"]::before{content:'×';font-size:27px}.icon-btn:hover,.menu-btn:hover{background:#f3fbfc!important;border-color:var(--aqua)!important}@media(min-width:851px){.menu-btn{display:none!important}}
    .brand-mark{content:url('${MASTER_LOGO}');width:520px;height:180px;max-width:45vw;display:block;object-fit:contain;object-position:center;background:transparent!important;filter:drop-shadow(0 2px 3px rgba(6,59,77,.12));image-rendering:auto;transform:translateZ(0)}.brand-word{display:none!important}
    .hero-logo img,.footer-logo img{content:url('${MASTER_LOGO}');object-fit:contain;background:transparent!important;image-rendering:auto;filter:drop-shadow(0 3px 5px rgba(6,59,77,.16));transform:translateZ(0)}
    .footer-logo{background:#fff!important;border-radius:18px;padding:14px 22px}
    .hero h1{color:var(--navy)}.hero h1 em{color:var(--brown)}.eyebrow{color:var(--aqua)}.eyebrow.dark{color:var(--teal)}.btn.primary,.service-foot button,.plan-grid button{background:var(--aqua);color:#fff}.btn.primary:hover{box-shadow:0 14px 32px rgba(7,155,183,.28)}.hero-photo{background:linear-gradient(145deg,var(--navy),var(--aqua))}.status-card strong{color:var(--aqua)}.service-card.featured{background:var(--navy);border-color:var(--navy)}.service-no{color:var(--aqua2)}.plan-grid article.popular{border-color:var(--aqua)}.plan-grid label{background:var(--aqua);color:#fff}.experience-panel,.dashboard-preview,footer{background:linear-gradient(135deg,var(--navy),var(--navy2))}.mini-flow i{color:var(--aqua)}.booking-note{background:var(--cream);border-color:#e5c7a5;color:#754112}.footer-small{color:var(--aqua2)}.footer-links a:hover{color:var(--aqua2)}:focus-visible{outline-color:var(--aqua)}body.dark{--bg:#062631;--card:#0b3441;--ink:#eaf8fa;--muted:#a9c5cb;--line:#1c4b58}
    @media(max-width:1100px){.topbar{height:132px;padding:8px 18px}.brand-mark{width:420px;height:150px;max-width:38vw}.topbar nav a{padding:9px 10px;font-size:13px}}
    @media(max-width:850px){.topbar{height:124px;padding:7px 14px}.brand-mark{width:450px;height:160px;max-width:55vw}.topbar nav.open{z-index:50}}
    @media(max-width:520px){.topbar{height:112px;padding:6px 10px}.brand-mark{width:390px;height:140px;max-width:72vw}}
  `;
  document.head.appendChild(style);

  function restoreOriginalMenu() {
    const nav = document.querySelector('#mainNav');
    if (!nav) return;
    nav.innerHTML = `
      <a href="#home">Home</a>
      <a href="#book">Book Wash</a>
      <a href="#membership">Monthly Plans</a>
      <a href="#cafe">Cafe Lounge</a>
      <a href="#beauty">Beauty Parlour</a>
      <a href="#membership">My Perks</a>
    `;
    const experienceItems = document.querySelectorAll('#experience .experience-list > div');
    if (experienceItems[0]) experienceItems[0].id = 'cafe';
    if (experienceItems[2]) experienceItems[2].id = 'beauty';
    nav.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){const target=document.querySelector(link.getAttribute('href'));if(target)target.scrollIntoView({behavior:'smooth',block:'center'});nav.classList.remove('open');const menuBtn=document.querySelector('#menuBtn');if(menuBtn){menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open menu')}})});
    const sections=[['home',0],['book',1],['membership',2],['experience',3],['experience',4],['membership',5]];
    function updateActiveMenu(){const y=window.scrollY+150;let current=0;sections.forEach(function(item,i){const el=document.getElementById(item[0]);if(el&&el.offsetTop<=y)current=i});nav.querySelectorAll('a').forEach(function(a,i){a.classList.toggle('is-current',i===current)})}
    window.addEventListener('scroll',updateActiveMenu,{passive:true});updateActiveMenu();
  }

  function enforceMasterLogo(){document.querySelectorAll('.brand-mark,.hero-logo img,.footer-logo img').forEach(function(img){img.src=MASTER_LOGO;img.removeAttribute('srcset');img.loading='eager';img.decoding='async'});document.querySelectorAll('.brand-word').forEach(function(img){img.style.display='none'})}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){enforceMasterLogo();restoreOriginalMenu()},{once:true})}else{enforceMasterLogo();restoreOriginalMenu()}
  const theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute('content','#ffffff');
})();
