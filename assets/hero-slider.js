/* Bubbles & Brew — full hero scene slider
   Entire hero composition slides horizontally. Booking/app logic remains untouched. */
(function () {
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1800&q=85',
      kicker: 'THE MAIN EVENT',
      title: 'Your car deserves a proper wash.',
      text: 'Professional vehicle care with a clean finish, a clear process and less waiting around.',
      accent: '#0090B0',
      cta: 'Book a wash'
    },
    {
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85',
      kicker: 'DRIVE IN WITH CONFIDENCE',
      title: 'Clean car. Fresh start. Ready to roll.',
      text: 'Choose the right level of vehicle care for your day — from a simple refresh to premium attention.',
      accent: '#006080',
      cta: 'Explore services'
    },
    {
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85',
      kicker: 'PREMIUM VEHICLE CARE',
      title: 'More than a wash.',
      text: 'A polished vehicle-care experience built around quality, convenience and a better handover.',
      accent: '#0090B0',
      cta: 'Book premium care'
    },
    {
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85',
      kicker: 'THE WARM EXPERIENCE',
      title: 'Wash your car. Warm up with coffee.',
      text: 'While your vehicle is being cared for, enjoy coffee, food and a comfortable place to wait.',
      accent: '#903000',
      cta: 'See the experience'
    },
    {
      image: 'https://images.unsplash.com/photo-1525609004556-c46c7dcfb6b3?auto=format&fit=crop&w=1800&q=85',
      kicker: 'BUBBLES & BREW',
      title: 'Wash. Warm. Roll.',
      text: 'Come for professional car care. Make the wait enjoyable. Roll out refreshed and ready.',
      accent: '#006080',
      cta: 'Start your booking'
    }
  ];

  const MASTER_LOGO = '/assets/Bubbles%20%26%20Brew%20Carwash%20Cafe%20Logo.png';

  function injectStyles() {
    if (document.getElementById('bb-full-hero-styles')) return;
    const style = document.createElement('style');
    style.id = 'bb-full-hero-styles';
    style.textContent = `
      .hero.bb-full-hero{position:relative;display:block;min-height:clamp(560px,72vh,760px);overflow:hidden;background:#003040}
      .bb-hero-track{display:flex;width:500%;height:100%;min-height:inherit;transform:translate3d(0,0,0);transition:transform .85s cubic-bezier(.65,0,.2,1);will-change:transform}
      .bb-hero-scene{position:relative;flex:0 0 20%;min-height:inherit;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);background:#fbfbf8;overflow:hidden}
      .bb-hero-scene::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(0,48,64,.035),transparent 45%,rgba(0,144,176,.06));z-index:0}
      .bb-hero-copy{position:relative;z-index:3;display:flex;flex-direction:column;justify-content:center;padding:52px clamp(24px,5vw,76px) 62px;background:#fbfbf8}
      .bb-hero-logo{width:min(280px,70%);height:auto;display:block;margin-bottom:24px;object-fit:contain;object-position:left center}
      .bb-hero-kicker{display:inline-flex;align-items:center;gap:8px;width:max-content;max-width:100%;padding:7px 11px;border-radius:999px;background:var(--bb-accent);color:#fff;font-size:10px;font-weight:900;letter-spacing:.14em;line-height:1.2}
      .bb-hero-copy h1{margin:18px 0 12px;max-width:640px;color:#003040;font-size:clamp(2.5rem,5.3vw,5.15rem);line-height:.96;letter-spacing:-.045em}
      .bb-hero-copy h1 em{font-style:normal;color:#0090B0}
      .bb-hero-copy p{max-width:590px;margin:0;color:#49636b;font-size:clamp(1rem,1.5vw,1.18rem);line-height:1.6}
      .bb-hero-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:26px}
      .bb-hero-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:999px;padding:13px 19px;font-weight:900;text-decoration:none;cursor:pointer;font:inherit}
      .bb-hero-btn.primary{background:#003040;color:#fff;box-shadow:0 10px 26px rgba(0,48,64,.18)}
      .bb-hero-btn.secondary{background:#fff;color:#003040;border:1px solid #cbdde1}
      .bb-hero-trust{display:flex;flex-wrap:wrap;gap:8px 11px;margin-top:22px;color:#6b7d83;font-size:11px;font-weight:700}
      .bb-hero-trust b{color:#903000}
      .bb-hero-image{position:relative;min-height:inherit;overflow:hidden;background:#003040}
      .bb-hero-image img.bb-scene-photo{width:100%;height:100%;min-height:inherit;display:block;object-fit:cover}
      .bb-hero-image::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,48,64,.18),transparent 40%,rgba(0,48,64,.12));pointer-events:none}
      .bb-hero-badge{position:absolute;left:24px;bottom:26px;z-index:4;max-width:290px;padding:15px 17px;border-radius:16px;background:rgba(255,255,255,.94);box-shadow:0 16px 40px rgba(0,48,64,.2);backdrop-filter:blur(10px);border-left:4px solid var(--bb-accent)}
      .bb-hero-badge strong{display:block;color:#003040;font-size:13px;margin-bottom:4px}
      .bb-hero-badge span{display:block;color:#5d747c;font-size:11px;line-height:1.4}
      .bb-hero-nav{position:absolute;left:clamp(24px,5vw,76px);bottom:18px;z-index:20;display:flex;align-items:center;gap:9px}
      .bb-hero-arrow{width:40px;height:40px;border-radius:50%;border:1px solid #cbdde1;background:#fff;color:#003040;font-size:22px;line-height:1;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 20px rgba(0,48,64,.12)}
      .bb-hero-arrow:hover{background:#0090B0;color:#fff;border-color:#0090B0}
      .bb-hero-dots{display:flex;align-items:center;gap:6px;padding:0 3px}
      .bb-dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:#b6c9ce;cursor:pointer}
      .bb-dot.active{width:25px;border-radius:99px;background:#003040}
      .bb-hero-count{margin-left:5px;color:#6b7d83;font-size:10px;font-weight:900;letter-spacing:.1em}
      .bb-hero-progress{position:absolute;left:0;right:0;bottom:0;height:4px;background:#dbe9ec;z-index:21}
      .bb-hero-progress span{display:block;height:100%;width:20%;background:#0090B0;transition:width .3s ease,background .3s ease}
      @media(max-width:900px){
        .hero.bb-full-hero{min-height:720px}
        .bb-hero-scene{grid-template-columns:1fr;grid-template-rows:48% 52%}
        .bb-hero-copy{padding:26px 22px 72px;justify-content:center}
        .bb-hero-logo{width:210px;margin-bottom:15px}
        .bb-hero-copy h1{font-size:clamp(2rem,8vw,3.25rem);margin:12px 0 9px}
        .bb-hero-copy p{font-size:.94rem;line-height:1.45}
        .bb-hero-actions{margin-top:16px}
        .bb-hero-trust{margin-top:12px}
        .bb-hero-image{min-height:0}
        .bb-hero-badge{left:16px;bottom:16px}
        .bb-hero-nav{left:22px;bottom:17px}
      }
      @media(max-width:520px){
        .hero.bb-full-hero{min-height:690px}
        .bb-hero-scene{grid-template-rows:50% 50%}
        .bb-hero-copy{padding:20px 18px 70px}
        .bb-hero-logo{width:175px}
        .bb-hero-copy h1{font-size:2rem}
        .bb-hero-copy p{font-size:.86rem}
        .bb-hero-btn{padding:11px 15px;font-size:.85rem}
        .bb-hero-trust{font-size:9px}
        .bb-hero-badge{max-width:230px;padding:11px 13px}
        .bb-hero-badge strong{font-size:11px}.bb-hero-badge span{font-size:9px}
      }
      @media(prefers-reduced-motion:reduce){.bb-hero-track{transition:none}.bb-hero-progress span{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    const hero = document.querySelector('section.hero');
    if (!hero || hero.dataset.bbFullHero === '1') return;
    hero.dataset.bbFullHero = '1';
    injectStyles();

    const track = document.createElement('div');
    track.className = 'bb-hero-track';

    slides.forEach((slide, i) => {
      const scene = document.createElement('article');
      scene.className = 'bb-hero-scene';
      scene.style.setProperty('--bb-accent', slide.accent);
      scene.innerHTML = `
        <div class="bb-hero-copy">
          <img class="bb-hero-logo" src="${MASTER_LOGO}" alt="Bubbles & Brew — Wash, Warm and Roll">
          <span class="bb-hero-kicker">${slide.kicker}</span>
          <h1>${slide.title}</h1>
          <p>${slide.text}</p>
          <div class="bb-hero-actions">
            <a class="bb-hero-btn primary" href="#book">${slide.cta} <span>→</span></a>
            <a class="bb-hero-btn secondary" href="#wash">View services</a>
          </div>
          <div class="bb-hero-trust"><span><b>Car wash first</b></span><span>•</span><span>Professional care</span><span>•</span><span>Jinja Road · Naguru</span></div>
        </div>
        <div class="bb-hero-image">
          <img class="bb-scene-photo" src="${slide.image}" alt="${slide.title}" ${i === 0 ? '' : 'loading="lazy"'}>
          <div class="bb-hero-badge"><strong>${i === 3 ? 'A better place to wait.' : i === 4 ? 'WASH, WARM AND ROLL.' : 'Professional vehicle care.'}</strong><span>${i === 3 ? 'Coffee, food and comfort while your vehicle is being cared for.' : 'Clean process. Clear handover. Less waiting around.'}</span></div>
        </div>`;
      track.appendChild(scene);
    });

    const nav = document.createElement('div');
    nav.className = 'bb-hero-nav';
    nav.innerHTML = `<button type="button" class="bb-hero-arrow bb-prev" aria-label="Previous hero">‹</button><div class="bb-hero-dots" role="tablist" aria-label="Hero scenes"></div><button type="button" class="bb-hero-arrow bb-next" aria-label="Next hero">›</button><span class="bb-hero-count" aria-live="polite">01 / 05</span>`;

    const progress = document.createElement('div');
    progress.className = 'bb-hero-progress';
    progress.innerHTML = '<span></span>';

    hero.replaceChildren(track, nav, progress);

    const dots = nav.querySelector('.bb-hero-dots');
    const count = nav.querySelector('.bb-hero-count');
    const progressBar = progress.querySelector('span');
    let current = 0;
    let timer;
    const interval = 6500;

    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'bb-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show hero ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => { go(i); restart(); });
      dots.appendChild(dot);
    });

    function go(next) {
      current = (next + slides.length) % slides.length;
      track.style.transform = `translate3d(-${current * 20}%,0,0)`;
      nav.querySelectorAll('.bb-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      count.textContent = `${String(current + 1).padStart(2, '0')} / 05`;
      progressBar.style.width = `${(current + 1) * 20}%`;
      progressBar.style.background = slides[current].accent;
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), interval);
    }

    nav.querySelector('.bb-prev').addEventListener('click', () => { go(current - 1); restart(); });
    nav.querySelector('.bb-next').addEventListener('click', () => { go(current + 1); restart(); });

    let startX = 0;
    let startY = 0;
    hero.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; startY = e.changedTouches[0].clientY; }, {passive:true});
    hero.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { go(current + (dx < 0 ? 1 : -1)); restart(); }
    }, {passive:true});

    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', restart);
    hero.addEventListener('focusin', () => clearInterval(timer));
    hero.addEventListener('focusout', restart);
    go(0);
    restart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();