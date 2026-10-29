// Bubbles & Brew — media and brand source of truth
window.BB_MEDIA = {
  hero: '/assets/hero.jpg',
  img0: '/assets/img0.jpg',
  img1: '/assets/img1.jpg',
  img2: '/assets/img2.jpg'
};

(function () {
  // ONE SOURCE OF TRUTH: the official master PNG in assets.
  // GitHub Pages generates a transparent-background derivative from this source at deploy time.
  const MASTER_LOGO = '/assets/Bubbles-Brew-master-logo-transparent.png';

  const style = document.createElement('style');
  style.id = 'bb-master-brand';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&display=swap');

    :root {
      --navy: #063b4d;
      --navy2: #07586c;
      --aqua: #079bb7;
      --aqua2: #70d7e8;
      --cream: #f7eadb;
      --orange: #a9550c;
      --brown: #a9550c;
      --teal: #087f96;
      --paper: #ffffff;
      --ink: #123c49;
      --muted: #5d747c;
      --line: #d5e6e9;
      --bg: #fbfbf8;
      --card: #ffffff;
      --shadow: 0 18px 55px rgba(6,59,77,.11);
    }

    /* World-class type system: expressive display face + highly legible UI face. */
    html, body { font-family: 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
    h1, h2, h3, .footer-slogan, .metrics b { font-family: 'Bricolage Grotesque', 'Manrope', system-ui, sans-serif !important; }
    body { letter-spacing: -0.008em; }
    h1, h2, h3 { letter-spacing: -0.035em; }
    .topbar nav a { font-family: 'Manrope', system-ui, sans-serif !important; font-weight: 800 !important; letter-spacing: -0.01em; }
    .eyebrow { font-family: 'Manrope', system-ui, sans-serif !important; font-weight: 800; }
    .btn, button, input, select { font-family: 'Manrope', system-ui, sans-serif !important; }

    .topbar {
      height: 138px;
      padding: 10px 24px;
      box-sizing: border-box;
      background: #ffffff !important;
      color: var(--navy);
      border-bottom: 1px solid #dce8eb;
      box-shadow: 0 4px 18px rgba(6,59,77,.07);
      backdrop-filter: none;
    }

    /* Give the official logo breathing room above and below without changing the logo asset. */
    .topbar .brand {
      height: 100%;
      padding: 6px 0;
      box-sizing: border-box;
      align-items: center;
      overflow: visible;
    }

    /* Restored original customer-facing navigation. Every item has a live destination. */
    .topbar nav a { color: var(--navy) !important; }
    .topbar nav a:hover { background: rgba(7,155,183,.10); }
    .topbar nav a.is-current { background: var(--aqua) !important; color: #fff !important; box-shadow: 0 7px 18px rgba(7,155,183,.20); }
    .topbar nav { gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }

    /* Official master logo — 100% larger than the previous 260×90px size. */
    .brand-mark {
      content: url('${MASTER_LOGO}');
      width: 520px;
      height: 180px;
      max-width: 45vw;
      display: block;
      object-fit: contain;
      object-position: center;
      background: transparent !important;
      filter: drop-shadow(0 2px 3px rgba(6,59,77,.12));
      image-rendering: auto;
      transform: translateZ(0);
    }
    .brand-word { display: none !important; }

    .hero-logo img,
    .footer-logo img {
      content: url('${MASTER_LOGO}');
      object-fit: contain;
      background: transparent !important;
      image-rendering: auto;
      filter: drop-shadow(0 3px 5px rgba(6,59,77,.16));
      transform: translateZ(0);
    }
    .footer-logo { background: transparent !important; }

    .hero h1 { color: var(--navy); }
    .hero h1 em { color: var(--brown); }
    .eyebrow { color: var(--aqua); }
    .eyebrow.dark { color: var(--teal); }
    .btn.primary, .service-foot button, .plan-grid button { background: var(--aqua); color: #ffffff; }
    .btn.primary:hover { box-shadow: 0 14px 32px rgba(7,155,183,.28); }
    .hero-photo { background: linear-gradient(145deg, var(--navy), var(--aqua)); }
    .status-card strong { color: var(--aqua); }
    .service-card.featured { background: var(--navy); border-color: var(--navy); }
    .service-no { color: var(--aqua2); }
    .plan-grid article.popular { border-color: var(--aqua); }
    .plan-grid label { background: var(--aqua); color: #fff; }
    .experience-panel, .dashboard-preview, footer { background: linear-gradient(135deg, var(--navy), var(--navy2)); }
    .mini-flow i { color: var(--aqua); }
    .booking-note { background: var(--cream); border-color: #e5c7a5; color: #754112; }
    .footer-small { color: var(--aqua2); }
    .footer-links a:hover { color: var(--aqua2); }
    :focus-visible { outline-color: var(--aqua); }
    body.dark { --bg: #062631; --card: #0b3441; --ink: #eaf8fa; --muted: #a9c5cb; --line: #1c4b58; }

    @media (max-width: 1100px) {
      .topbar { height: 132px; padding: 8px 18px; }
      .brand-mark { width: 420px; height: 150px; max-width: 38vw; }
      .topbar nav a { padding: 9px 10px; font-size: 13px; }
    }
    @media (max-width: 850px) {
      .topbar { height: 124px; padding: 7px 14px; }
      .brand-mark { width: 450px; height: 160px; max-width: 55vw; }
    }
    @media (max-width: 520px) {
      .topbar { height: 112px; padding: 6px 10px; }
      .brand-mark { width: 390px; height: 140px; max-width: 72vw; }
    }
  `;
  document.head.appendChild(style);

  function restoreOriginalMenu() {
    const nav = document.querySelector('#mainNav');
    if (!nav) return;

    nav.innerHTML = `
      <a href="#home">Home</a>
      <a href="#book">Book Wash</a>
      <a href="#membership">Monthly Plans</a>
      <a href="#experience">Cafe Lounge</a>
      <a href="#experience">Beauty Parlour</a>
      <a href="#membership">My Perks</a>
    `;

    // Make each restored item work with the existing one-page application.
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const sections = [
      ['home', 0],
      ['book', 1],
      ['membership', 2],
      ['experience', 3],
      ['experience', 4],
      ['membership', 5]
    ];

    function updateActiveMenu() {
      const y = window.scrollY + 150;
      let current = 0;
      sections.forEach(function (item, i) {
        const el = document.getElementById(item[0]);
        if (el && el.offsetTop <= y) current = i;
      });
      nav.querySelectorAll('a').forEach(function (a, i) {
        a.classList.toggle('is-current', i === current);
      });
    }
    window.addEventListener('scroll', updateActiveMenu, { passive: true });
    updateActiveMenu();
  }

  function enforceMasterLogo() {
    document.querySelectorAll('.brand-mark, .hero-logo img, .footer-logo img').forEach(function (img) {
      img.src = MASTER_LOGO;
      img.removeAttribute('srcset');
      img.loading = 'eager';
      img.decoding = 'async';
    });
    document.querySelectorAll('.brand-word').forEach(function (img) {
      img.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      enforceMasterLogo();
      restoreOriginalMenu();
    }, { once: true });
  } else {
    enforceMasterLogo();
    restoreOriginalMenu();
  }

  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', '#ffffff');
})();
