/* Bubbles & Brew — Expo hero carousel
   Five themed, auto-rotating hero slides. Visual-only enhancement; booking/app logic untouched. */
(function () {
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1800&q=85',
      kicker: 'THE MAIN EVENT',
      title: 'Your car deserves a proper wash.',
      text: 'Professional vehicle care with a clean finish, a clear process and less waiting around.',
      accent: '#079bb7'
    },
    {
      image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1800&q=85',
      kicker: 'WASH · WARM · ROLL',
      title: 'Wash your car. Warm up with coffee.',
      text: 'While your vehicle is being cared for, enjoy coffee, food and a comfortable place to wait.',
      accent: '#a9550c'
    },
    {
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85',
      kicker: 'DRIVE IN WITH CONFIDENCE',
      title: 'Clean car. Fresh start. Ready to roll.',
      text: 'From everyday washes to premium care, choose the service that fits your vehicle and your day.',
      accent: '#70d7e8'
    },
    {
      image: 'https://images.unsplash.com/photo-1525609004556-c46c7dcfb6b3?auto=format&fit=crop&w=1800&q=85',
      kicker: 'PREMIUM VEHICLE CARE',
      title: 'More than a wash.',
      text: 'A polished vehicle-care experience built around quality, convenience and a better handover.',
      accent: '#087f96'
    },
    {
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85',
      kicker: 'BUBBLES & BREW',
      title: 'Good coffee. Great company. Clean cars.',
      text: 'Come for the wash. Stay for the experience. Roll out feeling refreshed.',
      accent: '#f0b35b'
    }
  ];

  function init() {
    const photo = document.querySelector('.hero-photo');
    if (!photo) return;
    const oldImage = document.getElementById('heroPhoto');
    if (oldImage) oldImage.remove();

    const slider = document.createElement('div');
    slider.className = 'bb-hero-slider';
    slider.setAttribute('aria-label', 'Bubbles & Brew highlights');

    slides.forEach((slide, i) => {
      const item = document.createElement('article');
      item.className = 'bb-hero-slide' + (i === 0 ? ' is-active' : '');
      item.dataset.index = i;
      item.style.setProperty('--slide-accent', slide.accent);
      item.innerHTML = `
        <img src="${slide.image}" alt="${slide.title}" ${i === 0 ? '' : 'loading="lazy"'}>
        <div class="bb-hero-shade"></div>
        <div class="bb-hero-message">
          <span>${slide.kicker}</span>
          <h2>${slide.title}</h2>
          <p>${slide.text}</p>
        </div>`;
      slider.appendChild(item);
    });

    photo.prepend(slider);

    const controls = document.createElement('div');
    controls.className = 'bb-hero-controls';
    controls.innerHTML = `
      <button type="button" class="bb-hero-arrow bb-prev" aria-label="Previous highlight">‹</button>
      <div class="bb-hero-dots" role="tablist" aria-label="Hero slides"></div>
      <button type="button" class="bb-hero-arrow bb-next" aria-label="Next highlight">›</button>`;
    photo.appendChild(controls);

    const dots = controls.querySelector('.bb-hero-dots');
    let current = 0;
    let timer;

    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'bb-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show highlight ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dots.appendChild(dot);
    });

    function go(next) {
      const items = slider.querySelectorAll('.bb-hero-slide');
      const dotItems = dots.querySelectorAll('.bb-dot');
      items[current].classList.remove('is-active');
      dotItems[current].classList.remove('active');
      current = (next + slides.length) % slides.length;
      items[current].classList.add('is-active');
      dotItems[current].classList.add('active');
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), 5500);
    }
    controls.querySelector('.bb-prev').addEventListener('click', () => { go(current - 1); restart(); });
    controls.querySelector('.bb-next').addEventListener('click', () => { go(current + 1); restart(); });
    photo.addEventListener('mouseenter', () => clearInterval(timer));
    photo.addEventListener('mouseleave', restart);
    photo.addEventListener('focusin', () => clearInterval(timer));
    photo.addEventListener('focusout', restart);
    restart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();