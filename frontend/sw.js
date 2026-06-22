/* SupriBox service worker — instalável (PWA) e base do app TWA (Google Play).
   Estratégia: navegação = network-first (conteúdo sempre fresco) com fallback
   offline ao shell; estáticos = cache-first; API = sempre rede (nunca cacheia). */
const CACHE = 'supribox-v6';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
const API = /^\/(caixinha|assinatura|pagamento|usuarios|conteudos|webhook|health)\b/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;     // CDNs (fontes) passam direto
  if (API.test(url.pathname)) return;             // API: sempre rede, sem cache

  if (req.mode === 'navigate') {                  // páginas: rede primeiro
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('/', cp)); return r; })
        .catch(() => caches.match('/'))
    );
    return;
  }

  e.respondWith(                                  // estáticos: cache primeiro
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
      return r;
    }))
  );
});

// ===== Push notifications =====
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const title = d.title || 'SupriBox';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || 'Sua mensagem de hoje chegou ✦',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ws) => {
    for (const w of ws) { if ('focus' in w) { try { w.navigate(url); } catch (_) {} return w.focus(); } }
    return clients.openWindow(url);
  }));
});
