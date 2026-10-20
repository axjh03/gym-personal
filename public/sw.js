const CACHE = 'gym-guide-v1';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const [assets, images] = await Promise.all([
      fetch('/asset-manifest.json').then(response => response.json()),
      fetch('/precache.json').then(response => response.json())
    ]);
    const cache = await caches.open(CACHE);
    await cache.addAll(['/', '/index.html', '/manifest.json', '/icon.svg', ...Object.values(assets.files), ...images]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && url.hostname !== 'cdn.jsdelivr.net') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put('/index.html', response.clone()).catch(() => {});
        return response;
      } catch {
        return cache.match('/index.html');
      }
    }
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok || response.type === 'opaque') event.waitUntil(cache.put(event.request, response.clone()).catch(() => {}));
    return response;
  })());
});
