/**
 * Service worker — makes Codify installable and fully usable offline.
 *
 * Everything is static and the save lives in localStorage, so there is nothing
 * to reconcile: cache the shell once and serve it cache-first. Bump
 * CACHE_VERSION whenever a shipped file changes, or installed clients keep
 * serving the old copy indefinitely.
 */

const CACHE_VERSION = 'v10';
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
  './js/charts.js',
  './js/data/achievements.js',
  './js/data/loot.js',
  './js/data/quests.js',
  './js/game.js',
  './js/github.js',
  './js/icons.js',
  './js/learn/plan.js',
  './js/learn/session.js',
  './js/learn/tutor.js',
  './js/main.js',
  './js/platforms.js',
  './js/pwa.js',
  './js/quiz.js',
  './js/router.js',
  './js/skillbook.js',
  './js/state.js',
  './js/sync.js',
  './js/tracks/cp/actions.js',
  './js/tracks/cp/codeforces.js',
  './js/tracks/cp/contests.js',
  './js/tracks/cp/hub.js',
  './js/tracks/cp/model.js',
  './js/tracks/cp/plan.js',
  './js/tracks/cp/skills.js',
  './js/tracks/cp/today.js',
  './js/tracks/cp/topics.js',
  './js/tracks/cp/view-mission.js',
  './js/tracks/index.js',
  './js/tracks/robotics/actions.js',
  './js/tracks/robotics/bosses.js',
  './js/tracks/robotics/hub.js',
  './js/tracks/robotics/model.js',
  './js/tracks/robotics/plan.js',
  './js/tracks/robotics/player.js',
  './js/tracks/robotics/roadmap.js',
  './js/tracks/robotics/skills.js',
  './js/tracks/robotics/today.js',
  './js/tracks/robotics/view-builds.js',
  './js/tracks/robotics/view-mission.js',
  './js/tracks/robotics/view-plan.js',
  './js/tracks/robotics/view-skills.js',
  './js/ui.js',
  './js/version.js',
  './js/views/focus.js',
  './js/views/hero.js',
  './js/views/home.js',
  './js/views/mission-parts.js',
  './js/views/onboarding.js',
  './js/views/player.js',
  './js/views/tracks.js',
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
  // Fonts are cross-origin and optional: serve whatever is cached, refresh in
  // the background, and fall back to the system stack if neither works. Without
  // this the type reflows on every offline launch.
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then(res => { if (res.ok || res.type === 'opaque') cache.put(request, res.clone()); return res; })
        .catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

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
