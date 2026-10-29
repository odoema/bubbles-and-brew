const CACHE = 'bb-v3-0';
const ASSETS = [
  '/css/app.css',
  '/js/app.js',
  '/js/config.js',
  '/assets/logo.png',
  '/assets/logo-mark.png',
  '/assets/logo-wordmark.png',
  '/assets/icon-192.png',
  '/assets/favicon-48.png',
  '/assets/media.js',
  '/assets/hero.jpg',
  '/assets/img0.jpg',
  '/assets/img1.jpg',
  '/assets/img2.jpg',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => clients.forEach(client => client.postMessage({ type: 'BB_REFRESH' })))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html');
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  // Never let an old cached HTML document become a second/stale home page.
  if (isNavigation) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Always take network first for application code so deployments cannot mix versions.
  if (isCode) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
