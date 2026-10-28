/* Auragika service worker: lets the page open offline and keeps repeat visits fast.
   - Pages and other un-fingerprinted files (manifest, icons): network first, cache as fallback.
   - Fingerprinted assets (/css/, /js/, /images/ carry a content hash in the name): cache first.
   - Cross-origin requests (Google Fonts) are left to the browser.
   Bump CACHE when the caching rules change; old caches are deleted on activate. */

var CACHE = 'auragika-v4';
var HASHED = /^\/(css|js|images)\//;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add('/'); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

function store(req, res) {
  if (res && res.ok) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copy); });
  }
  return res;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (HASHED.test(url.pathname)) {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) { return store(req, res); });
    }));
    return;
  }

  e.respondWith(fetch(req).then(function (res) { return store(req, res); }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || (req.mode === 'navigate' ? caches.match('/') : Response.error());
    });
  }));
});
