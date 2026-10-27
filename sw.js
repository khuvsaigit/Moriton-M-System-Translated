/* ============================================================
   Moriton Equine Center — Service Worker
   ------------------------------------------------------------
   Goals:
     1) Enable Progressive Web App (PWA) installation (app shell cache)
     2) Automatic updates upon new release deployment
   Exclusions:
     • Does NOT intercept Firestore / Auth / Storage requests
       (handled directly by Firebase SDK)

   ⚠️ Update APP_VERSION below with every release to purge stale cache.
   ============================================================ */

const APP_VERSION = '2026-10-23-2';

const SHELL_CACHE = 'moriton-shell-' + APP_VERSION;
const ASSET_CACHE = 'moriton-assets-v1';
const ASSET_MAX   = 40; 
const CDN_CACHE   = 'moriton-cdn-v1';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=' + APP_VERSION,
  './app.js?v=' + APP_VERSION,
  './dailyreport.js?v=' + APP_VERSION,
  './timesheet.js?v=' + APP_VERSION,
  './pharmacy.js?v=' + APP_VERSION,
  './lab.js?v=' + APP_VERSION,
  './firebase.js?v=' + APP_VERSION,
  './pwa.js?v=' + APP_VERSION,
  './manifest.json',
  './icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.warn('[SW] Failed to cache some shell resources:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('moriton-shell-') && cacheName !== SHELL_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.pathname.includes('/_/') || url.hostname.includes('firestore') || url.hostname.includes('firebasestorage') || url.hostname.includes('identitytoolkit') || url.hostname.includes('securetoken')) {
    return;
  }

  if (url.origin === location.origin) {
    if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webp')) {
      event.respondWith(
        caches.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.status === 200) {
              const resClone = res.clone();
              caches.open(ASSET_CACHE).then((cache) => {
                cache.put(req, resClone);
                limitCacheSize(ASSET_CACHE, ASSET_MAX);
              });
            }
            return res;
          }).catch(() => new Response('Asset offline', { status: 503 }));
        })
      );
      return;
    }

    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            fetch(req).then(res => {
              if (res && res.status === 200) caches.open(SHELL_CACHE).then(c => c.put(req, res));
            }).catch(()=>{});
          }
          return cached;
        }
        return fetch(req).then((res) => {
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const resClone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => { cache.put(req, resClone); });
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  if (url.hostname.includes('gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CDN_CACHE).then(c => c.put(req, resClone));
          }
          return res;
        }).catch(() => new Response('CDN offline', { status: 503 }));
      })
    );
    return;
  }
});

function limitCacheSize(name, size) {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}
