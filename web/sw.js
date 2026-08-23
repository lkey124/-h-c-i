// Service Worker for Bình Lưu - Luyện Đề B1 Vượt Ải PWA
const CACHE_NAME = 'b1-mastery-v2.5.5';
const ASSETS_TO_CACHE = [
  '/icons/app-logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('SW cache partial:', err));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // ALWAYS BYPASS CACHE FOR APIs AND DATABASE JSONs
  if (url.pathname.startsWith('/api/') || url.pathname.includes('.json')) {
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
