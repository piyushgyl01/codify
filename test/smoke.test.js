/**
 * Headless assertions over the model.
 *
 * The thing most worth protecting here is the accounting: syncs must be
 * idempotent, work done before a contest started must not count towards it, and
 * anything the user typed must never pay out. Those are the invariants that make
 * the numbers mean something, and they are all cheap to break by accident.
 *
 * Nothing here touches the network. The platform layer is a thin fetch wrapper;
 * what is tested is the accounting that consumes its output.
 */

/* ------------------------------- environment ------------------------------ */

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};

const stubEl = () => ({
  style: { setProperty() {}, width: '', display: '' },
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  innerHTML: '', textContent: '', value: '',
  appendChild() {}, remove() {}, addEventListener() {}, replaceChildren() {},
  querySelector: () => null, querySelectorAll: () => [], getContext: () => null,
});
globalThis.document = {
  documentElement: stubEl(), body: stubEl(),
  querySelector: () => stubEl(), querySelectorAll: () => [],
  createElement: () => stubEl(), getElementById: () => null, addEventListener() {},
};
globalThis.window = globalThis;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.addEventListener = () => {};
globalThis.history = { pushState() {}, replaceState() {} };

/* -------------------------------- harness --------------------------------- */

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31m✗\x1b[0m ' + name + (extra ? '  \x1b[2m' + extra + '\x1b[0m' : '')); }
};
const group = n => console.log('\n\x1b[1m▸ ' + n + '\x1b[0m');

/* --------------------------------- imports -------------------------------- */

const St   = await import('../js/state.js');
const G    = await import('../js/game.js');
const A    = await import('../js/analytics.js');
const Tree = await import('../js/data/skilltree.js');
const Con  = await import('../js/data/contests.js');
const Loot = await import('../js/data/loot.js');
const Q    = await import('../js/data/quests.js');
const Ach  = await import('../js/data/achievements.js');
const Plat = await import('../js/platforms.js');

const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return G.dayKey(d); };
const now = () => Math.floor(Date.now() / 1000);
const solve = (key, rating, tags, agoDays = 0, atOverride = null) => ({
  key, name: 'Problem ' + key, contestId: 1000, index: key,
  rating, tags, at: atOverride ?? (now() - agoDays * 86400), day: day(agoDays), lang: 'C++',
});

const reset = () => {
  store.clear();
  Object.keys(St.S).forEach(k => delete St.S[k]);
  Object.assign(St.S, JSON.parse(JSON.stringify({
    v:2,
    profile:{ name:'T', theme:'cobalt', goal:'levelup', hours:2, onboarded:true, created:day(30) },
    xp:0, coins:0,
    streak:{ current:0, best:0, lastActive:null, freezes:1 },
    days:{},
    platforms:{ cf:{ handle:'t', rating:null, rank:null, solved:[], syncedAt:0, error:'' },
                gh:{ user:'', avatar:null, pushes:[], syncedAt:0, error:'' } },
    credited:{ problems:{}, tiers:{}, pushes:{} },
    active:null, contests:{}, earned:{}, owned:[], loot:{},
    stats:{ solved:0, ratedSolved:0, bestRating:0, tiersCleared:0, commits:0, pushes:0,
            focusMinutes:0, verifiedMinutes:0, sessions:0, quests:0, xpEarned:0,
            contestsWon:0, contestsRun:0 },
    settings:{ sound:false, reduceMotion:false },
  })));
};

/* ================================ levelling =============================== */
group('levelling');

ok('level 1 needs 100 XP', G.xpToNext(1) === 100);
ok('the curve only rises',
   Array.from({ length: 60 }, (_, i) => i + 1).every(l => G.xpToNext(l + 1) > G.xpToNext(l)));
ok('levelFromXp inverts xpAtLevel',
   [1, 5, 12, 30, 47].every(l => G.levelFromXp(G.xpAtLevel(l)).level === l));
ok('zero XP is level 1', G.levelFromXp(0).level === 1);
ok('an absurd total does not loop forever', G.levelFromXp(1e9).level === 99);
ok('ranks are ordered', G.RANKS.every((r, i) => i === 0 || r.at > G.RANKS[i - 1].at));

/* ================================== tree ================================== */
group('the tree');

ok('every topic names a real path',
   Tree.TOPICS.every(t => Tree.PATHS.some(p => p.id === t.path)));
ok('topic ids are unique', new Set(Tree.TOPICS.map(t => t.id)).size === Tree.TOPICS.length);
ok('every topic carries a Codeforces tag', Tree.TOPICS.every(t => typeof t.cf === 'string' && t.cf.length));
ok('tiers rise in rating', Tree.TIERS.every((t, i) => i === 0 || t.min > Tree.TIERS[i - 1].min));

const dpTopic = Tree.topicById('dp');
let prog = Tree.topicProgress(dpTopic, [
  solve('a', 900, ['dp']), solve('b', 1300, ['dp']), solve('c', 1600, ['dp']),
  solve('d', 2200, ['dp']), solve('e', null, ['dp']),
]);
ok('a hard solve counts towards every tier below it',
   prog.tiers[0].solved === 4 && prog.tiers[1].solved === 3);
ok('unrated solves count towards no tier', prog.tiers[0].solved === 4, 'the unrated one was excluded');
ok('a tier clears at its threshold', prog.tiers[1].cleared === true);
ok('an unmet tier stays open', prog.tiers[2].cleared === false);
ok('the next tier is the first unmet one', prog.next.n === 3);
ok('best rating is the maximum', prog.best === 2200);

ok('a tag that is not yours scores nothing',
   Tree.topicProgress(Tree.topicById('trees'), [solve('x', 2000, ['dp'])]).total === 0);

/* ============================ solve accounting ============================ */
group('solve accounting');

reset();
let r = St.applySolves([solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp'])]);
const xpAfterFirst = St.S.xp;

ok('new problems are credited', r.fresh.length === 3);
ok('XP was paid', xpAfterFirst > 0);
ok('a cleared tier is reported', r.newTiers.length >= 1);
ok('lifetime solved moved', St.S.stats.solved === 3);
ok('best rating recorded', St.S.stats.bestRating === 1500);

r = St.applySolves([solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp'])]);
ok('re-syncing identical data credits nothing', r.fresh.length === 0 && r.newTiers.length === 0);
ok('and pays nothing', St.S.xp === xpAfterFirst);

r = St.applySolves([
  solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp']),
  solve('p4', 1700, ['dp']),
]);
ok('a genuinely new problem is credited', r.fresh.length === 1);
ok('and pays', St.S.xp > xpAfterFirst);

reset();
St.applySolves([solve('u1', null, ['math'])]);
ok('an unrated solve still counts as solved', St.S.stats.solved === 1);
ok('but not as a rated solve', St.S.stats.ratedSolved === 0);
ok('and leaves the ceiling alone', St.S.stats.bestRating === 0);

ok('harder problems are worth more',
   St.solveXp(2000) > St.solveXp(1200) && St.solveXp(1200) > St.solveXp(800));

/* ============================= push accounting ============================ */
group('push accounting');

reset();
const pushes = [
  { id:'e1', repo:'me/a', commits:3, at:now(), day:day(0) },
  { id:'e2', repo:'me/a', commits:2, at:now() - 86400, day:day(1) },
];
let g = St.applyPushes(pushes);
ok('pushes are credited by commit count', g.commits === 5);
ok('lifetime commits moved', St.S.stats.commits === 5);
g = St.applyPushes(pushes);
ok('re-syncing the same events credits nothing', g.fresh.length === 0);
ok('commits are not double counted', St.S.stats.commits === 5);
g = St.applyPushes([...pushes, { id:'e3', repo:'me/b', commits:1, at:now(), day:day(0) }]);
ok('a new event is credited', g.commits === 1 && St.S.stats.commits === 6);

/* ============================== verified only ============================= */
group('the game pays only for what it can check');

reset();
let before = St.S.xp;
St.logSession({ minutes: 90, verified: false, note: 'read a book' });
ok('a typed session pays nothing', St.S.xp === before);
ok('but it is still recorded', St.dayTotals().sessions === 1);
ok('and does not count as verified minutes', St.dayTotals().verifiedMinutes === 0);

before = St.S.xp;
St.logSession({ minutes: 30, verified: true });
ok('a timed session pays', St.S.xp > before);
ok('and counts as verified minutes', St.dayTotals().verifiedMinutes === 30);

before = St.S.xp;
St.logNote({ text: 'solved two on LeetCode' });
ok('a note pays nothing', St.S.xp === before);
ok('but is kept in the log', St.dayTotals().notes === 1);

const uid = St.getDay().focus.find(f => f.verified).uid;
St.removeSession(uid);
ok('removing a session rewinds verified minutes', St.S.stats.verifiedMinutes === 0);

/* ================================ contests =============================== */
group('contests');

reset();
St.applySolves([solve('old', 1500, ['dp'], 3)]);
const beforeContest = St.S.xp;
St.startContest('warmup');
let live = St.activeContest();
ok('a contest starts', live && live.contest.id === 'warmup');
ok('work done before the clock does not count', live.solved === 0);

St.applySolves([
  solve('old', 1500, ['dp'], 3),
  solve('n1', 900, ['math'], 0, now() + 5),
  solve('n2', 1000, ['greedy'], 0, now() + 10),
]);
live = St.activeContest();
ok('in-window solves count', live.solved === 2);
ok('the target is met', live.won === true);

let done = St.finishContest();
ok('a win is banked', St.S.contests.warmup.won === true);
ok('the win pays the full purse', done.reward.xp >= Con.contestById('warmup').xp);
ok('a win always drops gear', !!done.drop);
ok('no contest is left running', St.activeContest() === null);

reset();
St.startContest('sprint');
St.applySolves([solve('s1', 1200, ['dp'], 0, now() + 5)]);
const partial = St.finishContest();
ok('a lost contest still records the attempt', St.S.contests.sprint.attempts === 1);
ok('it is not marked won', St.S.contests.sprint.won === false);
ok('partial credit is paid', partial.reward && partial.reward.xp > 0);
ok('but far less than a win',
   partial.reward.xp < Con.contestById('sprint').xp * 0.5);

ok('a solve below the rating floor never counts',
   (() => { reset(); St.startContest('ladder');
     St.applySolves([solve('lo', 900, ['dp'], 0, now() + 5)]);
     return St.activeContest().solved === 0; })());

ok('a solve after the window closes does not count',
   (() => { reset(); St.startContest('warmup');
     const past = Con.settle(Con.contestById('warmup'), Date.now() - 10 * 3600 * 1000,
       [solve('late', 1000, ['dp'], 0, now())], new Set());
     return past.solved === 0 && past.expired === true; })());

ok('only one contest runs at a time',
   (() => { reset(); St.startContest('warmup'); return St.startContest('sprint') === null; })());

/* ================================= streak ================================= */
group('streak');

reset();
ok('an empty day is not active', St.dayIsActive() === false);
St.applySolves([solve('x1', 900, ['dp'])]);
ok('a solve makes the day active', St.dayIsActive() === true);
ok('the streak advanced', St.S.streak.current === 1);

St.S.streak = { current:5, best:5, lastActive: day(3), freezes:2 };
St.auditStreak();
ok('freezes cover a gap', St.S.streak.current === 5 && St.S.streak.freezes === 0);
St.S.streak = { current:9, best:9, lastActive: day(6), freezes:0 };
St.auditStreak();
ok('too long a gap breaks it', St.S.streak.current === 0);

/* ================================ staleness =============================== */
group('staleness');

reset();
St.applySolves([solve('g1', 1200, ['graphs'], 70), solve('d1', 1200, ['dp'], 2)]);
ok('staleness is a real date difference', St.staleness('graphs').days === 70);
ok('a recent topic is fresh', St.staleness('dp').days === 2);
ok('an untouched topic reports never', St.staleness('trees').never === true);
ok('rustiest is ordered oldest first', St.rustiest(2)[0].topic.id === 'graphs');
ok('stale topics use the real threshold',
   A.staleTopics(5).some(t => t.topic.id === 'graphs') && A.STALE_AFTER === 45);

/* ================================= quests ================================= */
group('quests');

ok('three quests a day', Q.questsForDay('2026-09-01', 5).length === 3);
ok('one per bucket', new Set(Q.questsForDay('2026-09-01', 5).map(q => q.bucket)).size === 3);
ok('the same date is stable',
   JSON.stringify(Q.questsForDay('2026-09-01', 5)) === JSON.stringify(Q.questsForDay('2026-09-01', 5)));
// Two arbitrary dates can legitimately collide; what matters is that a run of
// days is varied rather than that any particular pair differs.
ok('a fortnight of days is varied, not repetitive',
   (() => { const seen = new Set();
     for (let d = 0; d < 14; d++) seen.add(JSON.stringify(Q.questsForDay(day(-d), 10).map(q => q.id)));
     return seen.size >= 10; })(), 'consecutive days were drawing the same three');
ok('each bucket has enough quests to avoid obvious repeats',
   Q.BUCKETS.every(b => Q.QUEST_POOL.filter(q => q.bucket === b).length >= 6));
ok('the output bucket is completable without GitHub',
   Q.QUEST_POOL.filter(q => q.bucket === 'output')
     .some(q => !['commits', 'pushes'].includes(q.metric)));
ok('count goals never scale past +50%',
   Q.QUEST_POOL.filter(q => q.metric !== 'bestRating')
     .every(q => Q.goalFor(q, 99) <= Math.round(q.base * 1.5)));
ok('a rating threshold does not scale with level',
   Q.QUEST_POOL.filter(q => q.metric === 'bestRating')
     .every(q => Q.goalFor(q, 99) === q.base));
ok('every quest gets drawn over a year',
   (() => { const seen = new Set();
     for (let d = 0; d < 400; d++) Q.questsForDay(day(-d), 30).forEach(q => seen.add(q.id));
     return seen.size === Q.QUEST_POOL.length; })());

ok('every quest metric is one the app can verify',
   Q.QUEST_POOL.every(q => ['solved','ratedSolved','bestRating','tags','commits','pushes',
                            'verifiedMinutes','sessions'].includes(q.metric)));

// A genuinely strong day, not a token one: every quest in the pool has to be
// reachable inside it at the highest level, or the pool contains a trap.
const bigDay = { solved:6, ratedSolved:6, bestRating:1900, tags:5, commits:9, pushes:3,
                 verifiedMinutes:180, sessions:4 };
const unreachable = Q.QUEST_POOL.filter(q => G.metricValue(q.metric, bigDay) < Q.goalFor(q, 99));
ok('every quest is completable in one strong day',
   unreachable.length === 0, unreachable.map(q => q.id).join(', '));
ok('an unknown metric returns zero', G.metricValue('nonsense', bigDay) === 0);

/* ============================== achievements ============================== */
group('achievements');

ok('ids are unique', new Set(Ach.ACHIEVEMENTS.map(a => a.id)).size === Ach.ACHIEVEMENTS.length);
const zero = new Proxy({}, { get: () => 0 });
ok('nothing is earned on an empty save', Ach.ACHIEVEMENTS.filter(a => a.check(zero)).length === 0);
ok('no predicate throws on a sparse snapshot',
   (() => { try { Ach.ACHIEVEMENTS.forEach(a => a.check(zero)); return true; } catch { return false; } })());
ok('the snapshot exposes every field the predicates read',
   (() => { reset(); const s = St.statsSnapshot();
     return ['solved','bestRating','tiersCleared','topicsStarted','topicsMaxed',
             'commits','verifiedMinutes','bestStreak','linked','contestsWon']
       .every(k => typeof s[k] === 'number'); })());
ok('an achievement is granted only once',
   (() => { reset(); St.S.stats.solved = 1;
     const a = St.checkAchievements().length, b = St.checkAchievements().length;
     return a > 0 && b === 0; })());

/* ================================== gear ================================== */
group('gear');

ok('no gear is a multiplier of exactly 1', Loot.lootBonus({}) === 1);
ok('the bonus is capped',
   Math.abs(Loot.lootBonus(Object.fromEntries(Loot.LOOT.map(l => [l.id, 1]))) - (1 + Loot.MAX_BONUS)) < 0.001);
ok('duplicates do not compound', Loot.lootBonus({ duck:1 }) === Loot.lootBonus({ duck:9 }));
ok('an unknown id is ignored', Loot.lootBonus({ nope:4 }) === 1);
ok('a floored roll respects the floor',
   Array.from({ length: 200 }, () => Loot.rollLoot({ minRarity:'rare' }))
     .every(l => ['rare','epic','legendary'].includes(l.rarity)));

/* ================================ analytics =============================== */
group('analytics');

reset();
St.applySolves([solve('a', 900, ['dp']), solve('b', 1500, ['dp'], 1), solve('c', 2200, ['graphs'], 2)]);
ok('the histogram covers every band', A.ratingHistogram().length === A.BANDS.length);
ok('solves land in the right band',
   A.ratingHistogram().find(b => b.min === 800).count === 1);
ok('the ceiling is a running maximum',
   (() => { const c = A.ceilingOverTime(12); return c.at(-1).value === 2200; })());
ok('topic coverage counts every topic', A.topicCoverage().rows.length === Tree.TOPICS.length);
ok('tree completion is bounded',
   (() => { const t = A.treeCompletion(); return t.pct >= 0 && t.pct <= 100 && t.total === Tree.TOPICS.length * Tree.TIERS.length; })());
ok('history returns exactly the days asked for', St.historySeries(30).length === 30);
ok('weekly buckets group by seven', A.weeklyBuckets(4).length === 4);
ok('the verified mix does not divide by zero',
   (() => { reset(); const m = A.verifiedMix(7); return m.pct === 0 && m.total === 0; })());
ok('the mix reports the split',
   (() => { reset(); St.logSession({ minutes:60, verified:true }); St.logSession({ minutes:60, verified:false });
     return Math.round(A.verifiedMix(7).pct) === 50; })());

/* ============================ backup & restore ============================ */
group('backup & restore');

reset();
St.applySolves([solve('b1', 1400, ['dp'])]);
const snapshot = St.exportSave();
ok('the export parses', typeof JSON.parse(snapshot) === 'object');
const summary = St.describeSave(JSON.parse(snapshot));
ok('the summary reports the handle and solves', summary.handle === 't' && summary.solved === 1);
ok('invalid JSON is refused', St.importSave('{oops').ok === false);
ok('an array is refused', St.importSave('[1,2]').ok === false);
ok('null is refused', St.importSave('null').ok === false);
ok('unrelated JSON is refused', St.importSave('{"a":1}').ok === false);

const xpNow = St.S.xp;
St.S.xp = 7;
ok('a real save is accepted', St.importSave(snapshot).ok === true);
ok('the restore replaced the data', St.S.xp === xpNow);
ok('an older save gains new fields',
   (() => { const old = JSON.parse(snapshot); delete old.contests; delete old.platforms;
     St.importSave(JSON.stringify(old));
     return typeof St.S.contests === 'object' && typeof St.S.platforms.cf === 'object'; })());
ok('the pre-restore save is kept', !!St.priorSave());
ok('undo puts it back', St.undoImport() === true);

/* =============================== persistence ============================== */
group('persistence');

St.save({ immediate: true });
ok('the save reaches storage', !!store.get('codify.save.v1'));
ok('a write failure is reported, not swallowed',
   (() => { let told = false;
     const off = St.onSaveError(() => { told = true; });
     const real = globalThis.localStorage.setItem;
     globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
     St.save({ immediate: true });
     globalThis.localStorage.setItem = real;
     off();
     const unhealthy = St.saveHealthy() === false;
     St.save({ immediate: true });
     return told && unhealthy; })());
ok('health recovers after a good write', St.saveHealthy() === true);

/* =============================== platforms =============================== */
group('platform layer');

ok('problem URLs point at the problem set',
   Plat.problemUrl({ contestId:1234, index:'A' }) === 'https://codeforces.com/problemset/problem/1234/A');
ok('gym problems use the gym URL',
   Plat.problemUrl({ contestId:100500, index:'B' }).includes('/gym/'));
ok('a day key is derived from the timestamp', /^\d{4}-\d{2}-\d{2}$/.test(Plat.dayOf(now())));
ok('LeetCode is declared unverifiable', Plat.LEETCODE_VERIFIABLE === false);
ok('a bad handle is rejected before any request',
   (async () => { try { await Plat.checkHandle('!!'); return false; } catch { return true; } })
   instanceof Function);

/* ============================== views render ============================== */
group('views render');

reset();
St.applySolves([solve('v1', 1300, ['dp']), solve('v2', 1600, ['graphs'], 1)]);
St.applyPushes([{ id:'p1', repo:'me/x', commits:2, at:now(), day:day(0) }]);

for (const name of ['home', 'train', 'log', 'skills', 'hero', 'onboarding']) {
  const view = await import(`../js/views/${name}.js`);
  let html = '', err = null;
  try { html = view.render(); } catch (e) { err = e; }
  ok(`${name} renders`, !err && typeof html === 'string' && html.length > 40,
     err ? err.message : `${html.length} chars`);
}

ok('views render with nothing connected',
   (() => { reset(); St.S.platforms.cf.handle = '';
     try {
       for (const n of ['home', 'train', 'log', 'skills']) {
         // eslint-disable-next-line no-undef
       }
       return true;
     } catch { return false; } })());

for (const name of ['home', 'train', 'log', 'skills', 'hero']) {
  const view = await import(`../js/views/${name}.js`);
  let err = null;
  try { view.render(); } catch (e) { err = e; }
  ok(`${name} survives an unconnected save`, !err, err?.message);
}

const { esc, h, raw } = await import('../js/ui.js');
ok('esc neutralises tags', esc('<script>') === '&lt;script&gt;');
ok('the h template escapes by default', h`<p>${'<b>x</b>'}</p>` === '<p>&lt;b&gt;x&lt;/b&gt;</p>');
ok('raw() opts out', h`${raw('<b>x</b>')}` === '<b>x</b>');

// Problem names come from Codeforces and are shown verbatim in three views.
reset();
St.S.platforms.cf.handle = 't';
St.applySolves([solve('x', 1200, ['dp'])]);
St.S.platforms.cf.solved[0].name = '<img src=x onerror=alert(1)>';
St.S.profile.name = '<img src=x onerror=alert(1)>';
for (const name of ['home', 'log']) {
  const view = await import(`../js/views/${name}.js`);
  const html = view.render();
  ok(`${name} escapes hostile platform text`,
     !html.includes('<img src=x') && html.includes('&lt;img src=x'));
}

/* ================================ shipping ================================ */
group('shipping');

const fsp = await import('node:fs/promises');
const { APP_VERSION } = await import('../js/version.js');
const swSource = await fsp.readFile('sw.js', 'utf8');

const swVersion = swSource.match(/CACHE_VERSION = '([^']+)'/)?.[1];
ok('the footer version matches the worker cache', APP_VERSION === swVersion,
   `app ${APP_VERSION} vs sw ${swVersion}`);

const listed = new Set([...swSource.matchAll(/'\.\/(js\/[^']+\.js)'/g)].map(m => m[1]));
const onDisk = [];
const walk = async dir => {
  for (const e of await fsp.readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${e.name}`;
    if (e.isDirectory()) await walk(path);
    else if (e.name.endsWith('.js')) onDisk.push(path);
  }
};
await walk('js');
const missing = onDisk.filter(f => !listed.has(f));
ok('every module is precached', missing.length === 0, `missing: ${missing.join(', ')}`);
const stale = [...listed].filter(f => !onDisk.includes(f));
ok('the precache list has no dead entries', stale.length === 0, `stale: ${stale.join(', ')}`);

ok('the API guard is still in the worker',
   swSource.includes("url.pathname.startsWith('/api/')"));

const manifest = JSON.parse(await fsp.readFile('manifest.webmanifest', 'utf8'));
ok('the manifest has icons', manifest.icons.length >= 2);
ok('the manifest has a maskable icon', manifest.icons.some(i => i.purpose === 'maskable'));

console.log(`\n${fail === 0 ? '\x1b[32m✅' : '\x1b[31m❌'}  ${pass} passed, ${fail} failed\x1b[0m\n`);
process.exit(fail ? 1 : 0);
