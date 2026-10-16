/**
 * Service worker — makes Codify installable and fully usable offline.
 *
 * Everything is static and the save lives in localStorage, so there is nothing
 * to reconcile: cache the shell once and serve it cache-first. Bump
 * CACHE_VERSION whenever a shipped file changes, or installed clients keep
 * serving the old copy indefinitely.
 */

const CACHE_VERSION = 'v22';
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
  './js/degrees/actions.js',
  './js/degrees/curriculum/cs-term1.js',
  './js/degrees/curriculum/corrections.js',
  './js/degrees/curriculum/cs-term2.js',
  './js/degrees/curriculum/index.js',
  './js/degrees/curriculum/cs-term3.js',
  './js/degrees/curriculum/cs-term4.js',
  './js/degrees/curriculum/cs-term5.js',
  './js/degrees/curriculum/cs-term6.js',
  './js/degrees/curriculum/math-term0.js',
  './js/degrees/curriculum/math-term1.js',
  './js/degrees/curriculum/math-term2.js',
  './js/degrees/curriculum/math-term3.js',
  './js/degrees/curriculum/math-term4.js',
  './js/degrees/curriculum/math-term5.js',
  './js/degrees/curriculum/phys-term0.js',
  './js/degrees/curriculum/phys-term1.js',
  './js/degrees/curriculum/phys-term2.js',
  './js/degrees/curriculum/phys-term3.js',
  './js/degrees/curriculum/phys-term4.js',
  './js/degrees/curriculum/phys-term5.js',
  './js/degrees/curriculum/ee-term0.js',
  './js/degrees/curriculum/ee-term1.js',
  './js/degrees/practice/se.js',
  './js/degrees/practice/theory.js',
  './js/degrees/practice/compilers.js',
  './js/degrees/practice/security.js',
  './js/degrees/practice/hci.js',
  './js/degrees/practice/aiplan.js',
  './js/degrees/practice/distsys.js',
  './js/degrees/practice/inference.js',
  './js/degrees/practice/graphics.js',
  './js/degrees/practice/systems6.js',
  './js/degrees/practice/mathfound.js',
  './js/degrees/practice/mathcalc.js',
  './js/degrees/practice/mathalg.js',
  './js/degrees/practice/mathcomb.js',
  './js/degrees/practice/mathanalysis.js',
  './js/degrees/practice/mathapplied.js',
  './js/degrees/practice/physmech.js',
  './js/degrees/practice/physlab.js',
  './js/degrees/practice/physem.js',
  './js/degrees/practice/physadv.js',
  './js/degrees/practice/physfront.js',
  './js/degrees/practice/physsenior.js',
  './js/degrees/practice/eecircuits.js',
  './js/degrees/practice/eedigital.js',
  './js/degrees/practice/algos.js',
  './js/degrees/practice/os.js',
  './js/degrees/practice/db.js',
  './js/degrees/practice/net.js',
  './js/degrees/practice/pl.js',
  './js/degrees/practice/datastructs.js',
  './js/degrees/practice/arch.js',
  './js/degrees/practice/linalg.js',
  './js/degrees/practice/prob.js',
  './js/degrees/practice/web.js',
  './js/degrees/engine.js',
  './js/degrees/index.js',
  './js/degrees/load.js',
  './js/degrees/meta.js',
  './js/degrees/model.js',
  './js/degrees/practice/calculus.js',
  './js/degrees/practice/csystems.js',
  './js/degrees/practice/discrete.js',
  './js/degrees/practice/python-extra.js',
  './js/degrees/practice/writing.js',
  './js/degrees/practice/index.js',
  './js/degrees/practice/python-source.js',
  './js/degrees/views.js',
  './js/game.js',
  './js/github.js',
  './js/hf.js',
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
  './js/cloud.js',
  './js/career/flagships.js',
  './js/career/model.js',
  './js/career/view.js',
  './js/tracks/ai/actions.js',
  './js/tracks/ai/feed.js',
  './js/tracks/ai/hub.js',
  './js/tracks/ai/model.js',
  './js/tracks/ai/plan.js',
  './js/tracks/ai/skills.js',
  './js/tracks/ai/today.js',
  './js/tracks/ai/view-builds.js',
  './js/tracks/ai/view-mission.js',
  './js/tracks/ai/view-new.js',
  './js/tracks/ai/view-plan.js',
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
  './js/views/skills-list.js',
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
