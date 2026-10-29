/* Bubbles & Brew — safe cinematic hero restore */
(function(){
  const slides = [
    {image:'/assets/hero.jpg',kicker:'PROFESSIONAL VEHICLE CARE',title:'Your car deserves <em>a proper wash.</em>',text:'Premium car wash. Fresh coffee. A better day.',cta:'Book a Wash',secondary:'Explore Services',accent:'#0090B0',badge:'CAR WASH FIRST'},
    {image:'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1800&q=85',kicker:'THE MAIN EVENT',title:'Clean car. <em>Fresh start.</em>',text:'Professional vehicle care with a clean finish and less waiting around.',cta:'Book a Wash',secondary:'Our Services',accent:'#0090B0',badge:'CLEAN · CONFIDENT · READY'},
    {image:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85',kicker:'DRIVE IN WITH CONFIDENCE',title:'More than <em>a wash.</em>',text:'A polished vehicle-care experience built around quality and convenience.',cta:'Book Premium Care',secondary:'View Services',accent:'#006080',badge:'PREMIUM VEHICLE CARE'},
    {image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85',kicker:'THE WARM EXPERIENCE',title:'Wash your car. <em>Warm up.</em>',text:'Enjoy coffee, food and a comfortable place to wait while we care for your vehicle.',cta:'See the Café',secondary:'Book a Wash',accent:'#903000',badge:'WASH · WARM · ROLL'},
    {image:'https://images.unsplash.com/photo-1525609004556-c46c7dcfb6b3?auto=format&fit=crop&w=1800&q=85',kicker:'BUBBLES & BREW',title:'Wash. Warm. <em>Roll.</em>',text:'Come for professional car care. Make the wait enjoyable. Roll out refreshed.',cta:'Start Your Booking',secondary:'Explore',accent:'#006080',badge:'WASH, WARM AND ROLL'}
  ];

  const MASTER_LOGO = '/assets/Bubbles%20%26%20Brew%20Carwash%20Cafe%20Logo.png';

  function injectStyles() {
    if (document.getElementById('bb-cinematic-hero-styles')) return;
    const style = document.createElement('style');
    style.id = 'bb-cinematic-hero-styles';
    style.textContent = `
      body:has(.bb-cinematic-hero) .topbar{position:absolute!important;top:0;left:0;right:0;z-index:100;background:linear-gradient(180deg,rgba(0,48,64,.42),rgba(0,48,64,0));border-bottom:1px solid rgba(255,255,255,.10);color:#fff}
      body:has(.bb-cinematic-hero) .topbar a,body:has(.bb-cinematic-hero) .topbar .icon-btn,body:has(.bb-cinematic-hero) .topbar .menu-btn{color:#fff}
      body:has(.bb-cinematic-hero) .topbar .brand-word{filter:brightness(0) invert(1)}
      body:has(.bb-cinematic-hero) .topbar #mainNav a{color:#fff}
      .hero.bb-cinematic-hero{position:relative!important;display:block!important;min-height:clamp(640px,88vh,860px)!important;height:100vh;overflow:hidden;background:#003040!important}
      .bb-cinematic-track{position:absolute;inset:0;display:flex;width:500%;height:100%;transition:transform .9s cubic-bezier(.65,0,.2,1);will-change:transform}
      .bb-cinematic-slide{position:relative;flex:0 0 20%;height:100%;overflow:hidden;background:#003040}
      .bb-cinematic-slide img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
      .bb-cinematic-slide:after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(0,48,64,.82) 0%,rgba(0,48,64,.50) 34%,rgba(0,48,64,.10) 66%,rgba(0,48,64,.24) 100%),linear-gradient(0deg,rgba(0,48,64,.42),transparent 38%)}
      .bb-cinematic-copy{position:absolute;z-index:4;left:clamp(22px,7vw,110px);top:50%;transform:translateY(-40%);width:min(650px,54vw);color:#fff}
      .bb-cinematic-kicker{display:inline-flex;padding:7px 11px;border-radius:999px;background:var(--bb-accent);color:#fff;font-size:10px;font-weight:900;letter-spacing:.15em;line-height:1.2}
      .bb-cinematic-copy h1{margin:16px 0 12px;color:#fff;font-size:clamp(3rem,6.2vw,6.5rem);line-height:.91;letter-spacing:-.055em;text-shadow:0 5px 30px rgba(0,0,0,.28)}
      .bb-cinematic-copy h1 em{font-style:normal;color:#70d7e8}
      .bb-cinematic-copy p{margin:0;max-width:600px;color:#fff;font-size:clamp(1rem,1.5vw,1.28rem);line-height:1.5;text-shadow:0 2px 15px rgba(0,0,0,.3)}
      .bb-cinematic-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:25px}
      .bb-cinematic-btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:900;font:inherit;cursor:pointer}
      .bb-cinematic-btn.primary{background:#0090B0;color:#fff;border:1px solid #70d7e8;box-shadow:0 12px 30px rgba(0,48,64,.30)}
      .bb-cinematic-btn.secondary{background:rgba(255,255,255,.10);color:#fff;border:1px solid rgba(255,255,255,.55);backdrop-filter:blur(10px)}
      .bb-cinematic-meta{display:flex;align-items:center;gap:10px;margin-top:20px;color:#fff;font-size:11px;font-weight:800;letter-spacing:.04em}.bb-cinematic-meta b{color:#f0b35b}
      .bb-cinematic-badge{position:absolute;right:clamp(22px,5vw,72px);bottom:86px;z-index:4;padding:12px 16px;border-radius:14px;background:rgba(0,48,64,.68);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:10px;font-weight:900;letter-spacing:.14em;backdrop-filter:blur(12px)}
      .bb-cinematic-nav{position:absolute;left:clamp(22px,7vw,110px);bottom:30px;z-index:8;display:flex;align-items:center;gap:9px}
      .bb-cinematic-arrow{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(0,48,64,.55);color:#fff;font-size:28px;line-height:1;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(10px)}
      .bb-cinematic-arrow:hover{background:#0090B0;border-color:#0090B0}
      .bb-cinematic-dots{display:flex;align-items:center;gap:6px;padding:0 5px}.bb-cinematic-dot{width:8px;height:8px;border:0;border-radius:50%;padding:0;background:rgba(255,255,255,.45);cursor:pointer}.bb-cinematic-dot.active{width:28px;border-radius:99px;background:#fff}
      .bb-cinematic-count{color:#fff;font-size:10px;font-weight:900;letter-spacing:.1em;margin-left:5px}.bb-cinematic-progress{position:absolute;left:0;right:0;bottom:0;height:4px;z-index:9;background:rgba(255,255,255,.16)}.bb-cinematic-progress span{display:block;height:100%;width:20%;background:#0090B0;transition:width .3s ease,background .3s ease}
      .bb-cinematic-scroll{position:absolute;right:26px;bottom:30px;z-index:8;color:#fff;font-size:9px;font-weight:900;letter-spacing:.15em;writing-mode:vertical-rl;opacity:.82}
      @media(max-width:800px){body:has(.bb-cinematic-hero) .topbar{background:linear-gradient(180deg,rgba(0,48,64,.72),rgba(0,48,64,0))}.hero.bb-cinematic-hero{min-height:720px!important;height:88vh}.bb-cinematic-copy{left:20px;right:20px;width:auto;top:52%;transform:translateY(-38%)}.bb-cinematic-copy h1{font-size:clamp(2.7rem,12vw,4.3rem)}.bb-cinematic-copy p{font-size:.95rem;max-width:520px}.bb-cinematic-badge{right:20px;bottom:92px;font-size:8px;padding:9px 11px}.bb-cinematic-nav{left:20px;bottom:25px}.bb-cinematic-scroll{display:none}.bb-cinematic-slide img{object-position:58% center}}
      @media(max-width:520px){.hero.bb-cinematic-hero{min-height:690px!important;height:86vh}.bb-cinematic-copy{top:55%}.bb-cinematic-copy h1{font-size:2.75rem}.bb-cinematic-copy p{font-size:.86rem}.bb-cinematic-actions{margin-top:18px}.bb-cinematic-btn{padding:12px 17px;font-size:.83rem}.bb-cinematic-meta{font-size:9px;margin-top:14px}.bb-cinematic-badge{display:none}}
      @media(prefers-reduced-motion:reduce){.bb-cinematic-track{transition:none}.bb-cinematic-progress span{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function init(){
    const hero=document.querySelector('section.hero');
    if(!hero || hero.dataset.bbCinematic==='1') return;
    hero.dataset.bbCinematic='1';hero.classList.add('bb-cinematic-hero');injectStyles();
    const track=document.createElement('div');track.className='bb-cinematic-track';
    slides.forEach((s,i)=>{const slide=document.createElement('article');slide.className='bb-cinematic-slide';slide.style.setProperty('--bb-accent',s.accent);slide.innerHTML=`<img src="${s.image}" alt="${s.kicker} — Bubbles & Brew" ${i===0?'fetchpriority="high"':'loading="lazy"'}><div class="bb-cinematic-copy"><span class="bb-cinematic-kicker">${s.kicker}</span><h1>${s.title}</h1><p>${s.text}</p><div class="bb-cinematic-actions"><a class="bb-cinematic-btn primary" href="#book">${s.cta} <span>→</span></a><a class="bb-cinematic-btn secondary" href="#wash">${s.secondary}</a></div><div class="bb-cinematic-meta"><span><b>Car wash first</b></span><span>•</span><span>Jinja Road · Naguru</span><span>•</span><span>Wash, Warm and Roll</span></div></div><div class="bb-cinematic-badge">${s.badge}</div>`;track.appendChild(slide)});
    const nav=document.createElement('div');nav.className='bb-cinematic-nav';nav.innerHTML='<button class="bb-cinematic-arrow bb-c-prev" type="button" aria-label="Previous hero">‹</button><div class="bb-cinematic-dots" role="tablist"></div><button class="bb-cinematic-arrow bb-c-next" type="button" aria-label="Next hero">›</button><span class="bb-cinematic-count">01 / 05</span>';
    const progress=document.createElement('div');progress.className='bb-cinematic-progress';progress.innerHTML='<span></span>';
    const scroll=document.createElement('div');scroll.className='bb-cinematic-scroll';scroll.textContent='SCROLL TO EXPLORE ↓';
    hero.replaceChildren(track,nav,progress,scroll);
    const dots=nav.querySelector('.bb-cinematic-dots'),count=nav.querySelector('.bb-cinematic-count'),bar=progress.querySelector('span');let current=0,timer;const interval=6500;
    slides.forEach((_,i)=>{const dot=document.createElement('button');dot.type='button';dot.className='bb-cinematic-dot'+(i===0?' active':'');dot.setAttribute('aria-label',`Show hero ${i+1}`);dot.addEventListener('click',()=>{go(i);restart()});dots.appendChild(dot)});
    function go(n){current=(n+slides.length)%slides.length;track.style.transform=`translate3d(-${current*20}%,0,0)`;dots.querySelectorAll('.bb-cinematic-dot').forEach((d,i)=>d.classList.toggle('active',i===current));count.textContent=`${String(current+1).padStart(2,'0')} / 05`;bar.style.width=`${(current+1)*20}%`;bar.style.background=slides[current].accent}
    function restart(){clearInterval(timer);timer=setInterval(()=>go(current+1),interval)}
    nav.querySelector('.bb-c-prev').addEventListener('click',()=>{go(current-1);restart()});nav.querySelector('.bb-c-next').addEventListener('click',()=>{go(current+1);restart()});
    let sx=0,sy=0;hero.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){go(current+(dx<0?1:-1));restart()}},{passive:true});
    hero.addEventListener('mouseenter',()=>clearInterval(timer));hero.addEventListener('mouseleave',restart);hero.addEventListener('focusin',()=>clearInterval(timer));hero.addEventListener('focusout',restart);go(0);restart();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
