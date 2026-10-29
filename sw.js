/* Bubbles & Brew emergency service-worker retirement shim.
   The production site is intentionally network-only. This file exists temporarily
   so browsers that still have the old /sw.js registration can update, take control,
   clear legacy Cache Storage, and unregister the worker. */
const RETIREMENT_VERSION = 'bb-retire-2026-10-29-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});

self.addEventListener('fetch', (event) => {
  // Never serve legacy cached pages or assets.
  event.respondWith(fetch(event.request));
});
