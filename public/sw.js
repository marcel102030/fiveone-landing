// Five One — Service Worker v1
// Estratégia: Cache First para assets estáticos, Network First para navegação

const CACHE_NAME = 'fiveone-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
];

// ── Install: pré-cacheamento dos arquivos críticos ────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: remove caches antigos ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Ignorar extensões do Chrome e protocolos não-http
  if (!url.protocol.startsWith('http')) return;

  // Ignorar chamadas de API: Supabase e Cloudflare Functions
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io') ||
    url.pathname.startsWith('/api/')
  ) return;

  // Ignorar analytics e serviços externos de terceiros
  if (
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('vimeo.com') ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('ytimg.com')
  ) return;

  // ── Assets estáticos (Vite gera nomes com hash → imutáveis) ──────────
  // Estratégia: Cache First
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Imagens e arquivos públicos estáticos ─────────────────────────────
  // Estratégia: Cache First com atualização em background
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif|woff2|woff|ttf)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ── Navegação (SPA com HashRouter) ────────────────────────────────────
  // Estratégia: Network First → cache → offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html')
            .then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // ── Demais requisições ────────────────────────────────────────────────
  // Estratégia: Network First com fallback para cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
