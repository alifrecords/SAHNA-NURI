// SAHNA NURI — oflayn ishlash: dastur fayllari keshda saqlanadi, internet uzilsa ham pult ochiladi.
const CACHE = 'sahna-nuri-v21';
const CORE = ['/', '/index.html', '/assets/app.css', '/assets/app.js', '/assets/install.js', '/assets/wheel.js', '/assets/i18n.js', '/assets/dmx.js', '/assets/license.js', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;
  // avval tarmoq (yangi versiya), bo'lmasa kesh
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match('/index.html')))
  );
});
