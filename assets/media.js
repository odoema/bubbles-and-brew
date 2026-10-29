// Production vehicle-care photography for Bubbles & Brew
window.BB_MEDIA = {
  hero: '/assets/hero.jpg',
  img0: '/assets/img0.jpg',
  img1: '/assets/img1.jpg',
  img2: '/assets/img2.jpg'
};

// Master brand treatment: preserve the full master logo everywhere except the compact header logo.
(function () {
  const headerLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASsAAAA/CAYAAAC4lO6NAAAAAXNSR0IArs4cAA...';

  const style = document.createElement('style');
  style.id = 'bb-master-brand';
  style.textContent = `
    :root {
      --navy: #063b4d;
      --navy2: #07586c;
      --aqua: #079bb7;
      --aqua2: #70d7e8;
      --cream: #f7eadb;
      --orange: #a9550c;
      --brown: #a9550c;
      --teal: #087f96;
      --paper: #fbfbf8;
      --ink: #123c49;
      --muted: #5d747c;
      --line: #d5e6e9;
      --bg: #fbfbf8;
      --card: #ffffff;
      --shadow: 0 18px 55px rgba(6,59,77,.11);
    }

    body { background: var(--bg); color: var(--ink); }
    .topbar { background: rgba(251,251,248,.96); color: var(--navy); }
    .topbar nav a { color: var(--navy); }
    .topbar nav a:hover { background: rgba(7,155,183,.10); }

    /* Compact approved header logo only. */
    .brand-mark {
      content: url('${headerLogo}');
      width: 150px;
      height: 60px;
      object-fit: contain;
      object-position: left center;
    }
    .brand-word { display: none; }

    .hero h1 { color: var(--navy); }
    .hero h1 em { color: var(--brown); }
    .eyebrow { color: var(--aqua); }
    .eyebrow.dark { color: var(--teal); }
    .btn.primary,
    .service-foot button,
    .plan-grid button { background: var(--aqua); color: #ffffff; }
    .btn.primary:hover { box-shadow: 0 14px 32px rgba(7,155,183,.28); }
    .hero-photo { background: linear-gradient(145deg, var(--navy), var(--aqua)); }
    .status-card strong { color: var(--aqua); }
    .service-card.featured { background: var(--navy); border-color: var(--navy); }
    .service-no { color: var(--aqua2); }
    .plan-grid article.popular { border-color: var(--aqua); }
    .plan-grid label { background: var(--aqua); color: #fff; }
    .experience-panel,
    .dashboard-preview,
    footer { background: linear-gradient(135deg, var(--navy), var(--navy2)); }
    .mini-flow i { color: var(--aqua); }
    .booking-note { background: var(--cream); border-color: #e5c7a5; }
    .booking-note { color: #754112; }
    .footer-logo { background: #fff; }
    .footer-small { color: var(--aqua2); }
    .footer-links a:hover { color: var(--aqua2); }
    :focus-visible { outline-color: var(--aqua); }

    body.dark {
      --bg: #062631;
      --card: #0b3441;
      --ink: #eaf8fa;
      --muted: #a9c5cb;
      --line: #1c4b58;
    }
  `;
  document.head.appendChild(style);

  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', '#063b4d');
})();
