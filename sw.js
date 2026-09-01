/**
 * Service worker — makes Codify installable and fully usable offline.
 *
 * Everything is static and the save lives in localStorage, so there is nothing
 * to reconcile: cache the shell once and serve it cache-first. Bump
 * CACHE_VERSION whenever a shipped file changes, or installed clients keep
 * serving the old copy indefinitely.
 */

const CACHE_VERSION = 'v2';
const CACHE = `codify-${CACHE_VERSION}`;

/**
 * Everything needed to boot with no network at all.
 *
 * If any of these cannot be cached the install must FAIL: a worker that
 * activates with a half-filled cache looks installed while providing no offline
 * support, and never self-heals because install already succeeded. cache.addAll
 * is atomic, which is exactly the behaviour wanted here.
 */
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/components.css',
  './css/views.css',
  './js/analytics.js',
  './js/charts.js',
  './js/data/achievements.js',
  './js/data/drills.js',
  './js/data/loot.js',
  './js/data/practice.js',
  './js/data/quests.js',
  './js/data/skilltree.js',
  './js/game.js',
  './js/icons.js',
  './js/main.js',
  './js/pwa.js',
  './js/router.js',
  './js/state.js',
  './js/ui.js',
  './js/version.js',
  './js/views/dashboard.js',
  './js/views/hero.js',
  './js/views/home.js',
  './js/views/log.js',
  './js/views/onboarding.js',
  './js/views/player.js',
  './js/views/skills.js',
  './js/views/train.js',
];

/** Nice to have offline, not worth failing an install over. */
const OPTIONAL = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(url => new Request(url, { cache: 'reload' })));
    await Promise.all(OPTIONAL.map(url =>
      cache.add(new Request(url, { cache: 'reload' }))
           .catch(err => console.warn('[sw] optional asset skipped:', url, err.message))));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/** Let the page tell a waiting worker to take over immediately. */
self.addEventListener('message', event => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

/**
 * On localhost, stay out of the way entirely. Cache-first means an edited file
 * keeps serving its old copy until the cache is cleared by hand, which burns
 * debugging time on changes that did in fact apply.
 */
const IS_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('fetch', event => {
  if (IS_DEV) return;

  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigations always resolve to the app shell — it is a single-page app, and
  // this is what makes a deep link work with no connection.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match('./index.html');
      if (cached) return cached;
      try { return await fetch(request); }
      catch { return new Response('Offline', { status: 503, statusText: 'Offline' }); }
    })());
    return;
  }

  // Never cache an API response. Cache Storage ignores Cache-Control — a put()
  // is explicit — so without this a same-origin GET would fall into the
  // cache-first branch below and every later call would return the first frozen
  // answer. There is no API here today; this guard is what keeps it true when
  // there is one.
  if (url.pathname.startsWith('/api/')) return;

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
      return res;
    } catch {
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
