// Production vehicle-care photography for Bubbles & Brew
window.BB_MEDIA = {
  hero: '/assets/hero.jpg',
  img0: '/assets/img0.jpg',
  img1: '/assets/img1.jpg',
  img2: '/assets/img2.jpg'
};

// Master brand treatment: preserve the full master logo everywhere except the compact header logo.
(function () {
  const headerLogo = 'data:image/webp;base64,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';

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
    .brand-mark { content: url('${headerLogo}'); width: 150px; height: 60px; object-fit: contain; object-position: left center; }
    .brand-word { display: none; }
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
    .footer-logo { background: #fff; }
    .footer-small { color: var(--aqua2); }
    .footer-links a:hover { color: var(--aqua2); }
    :focus-visible { outline-color: var(--aqua); }
    body.dark { --bg: #062631; --card: #0b3441; --ink: #eaf8fa; --muted: #a9c5cb; --line: #1c4b58; }
  `;
  document.head.appendChild(style);
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', '#063b4d');
})();
