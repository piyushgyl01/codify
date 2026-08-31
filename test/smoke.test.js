/**
 * Headless assertions over the whole model.
 *
 * Runs in plain Node with a localStorage stub and a DOM stub thin enough that
 * anything touching the real DOM fails loudly rather than passing by accident.
 * Everything here is logic the app cannot afford to get wrong quietly: mode
 * weighting, the retention model, retest scheduling, and the calibration that
 * checks the model against reality.
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
  documentElement: stubEl(),
  body: stubEl(),
  querySelector: () => stubEl(),
  querySelectorAll: () => [],
  createElement: () => stubEl(),
  getElementById: () => null,
  addEventListener() {},
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
const near = (a, b, tol = 0.51) => Math.abs(a - b) <= tol;
const group = name => console.log('\n\x1b[1m▸ ' + name + '\x1b[0m');

/* --------------------------------- imports -------------------------------- */

const St    = await import('../js/state.js');
const G     = await import('../js/game.js');
const A     = await import('../js/analytics.js');
const Pr    = await import('../js/data/practice.js');
const Tree  = await import('../js/data/skilltree.js');
const Drill = await import('../js/data/drills.js');
const Loot  = await import('../js/data/loot.js');
const Q     = await import('../js/data/quests.js');
const Ach   = await import('../js/data/achievements.js');

const key = n => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return G.dayKey(d);
};

/* ============================== profile & targets ========================== */
group('profile & targets');

St.saveProfile({ name: 'Test', hours: 2, goal: 'levelup', track: 'generalist', onboarded: true });
let t = St.targets();

ok('capacity is the stated hours', t.capacity === 120, `got ${t.capacity}`);
ok('the target is a fraction of capacity, never all of it', t.focus < t.capacity && t.focus > 0, `${t.focus}/${t.capacity}`);
ok('level-up intensity lands at 70%', t.focus === 85, `got ${t.focus}`);
ok('the ceiling sits above capacity', t.ceiling > t.capacity);
ok('a weekly target assumes one rest day', t.weekly === t.focus * 6);

St.saveProfile({ goal: 'sprint' });
ok('a harder goal raises the target', St.targets().focus > t.focus);
St.saveProfile({ goal: 'maintain' });
ok('an easier goal lowers it', St.targets().focus < t.focus);
St.saveProfile({ goal: 'levelup' });

ok('an absurd hours value is clamped', G.targetsFor({ hours: 999, goal: 'levelup' }).capacity === 720);
ok('a zero hours value still yields a usable target', G.targetsFor({ hours: 0, goal: 'levelup' }).focus >= 15);

/* ================================ mode weights ============================= */
group('practice modes');

ok('build is worth full value', Pr.modeWeight('build') === 1);
ok('watch is discounted hardest', Pr.modeWeight('watch') < Pr.modeWeight('read'));
ok('the ordering is build > drill > read > watch',
   Pr.modeWeight('build') > Pr.modeWeight('drill') &&
   Pr.modeWeight('drill') > Pr.modeWeight('read') &&
   Pr.modeWeight('read')  > Pr.modeWeight('watch'));
ok('an unknown mode falls back rather than throwing', Pr.modeWeight('nonsense') === 1);
ok('60 minutes of video is 21 effective minutes',
   Pr.effectiveMinutes({ minutes: 60, mode: 'watch' }) === 21);
ok('build and drill are the deliberate pair',
   Pr.isDeliberate('build') && Pr.isDeliberate('drill') &&
   !Pr.isDeliberate('read') && !Pr.isDeliberate('watch'));

/* ================================ focus log =============================== */
group('focus log');

St.logFocus({ minutes: 60, mode: 'build', path: 'lang', topic: 'parser' });
St.logFocus({ minutes: 60, mode: 'watch', path: 'web', topic: 'course' });
let tot = St.dayTotals();

ok('raw minutes add up', tot.minutes === 120);
ok('effective minutes apply the weights', tot.effMinutes === 81, `got ${tot.effMinutes}`);
ok('the deliberate share is computed on raw minutes', tot.deliberatePct === 50, `got ${tot.deliberatePct}`);
ok('sessions are counted', tot.sessions === 2);
ok('paths touched are counted distinctly', tot.paths === 2);
ok('XP is paid on effective, not raw, minutes', St.S.xp > 0);

const xpAfterBuild = St.S.xp;
St.logFocus({ minutes: 30, mode: 'build' });
const buildXp = St.S.xp - xpAfterBuild;
const xpBeforeWatch = St.S.xp;
St.logFocus({ minutes: 30, mode: 'watch' });
ok('the same minutes pay less when passive', St.S.xp - xpBeforeWatch < buildXp,
   `build ${buildXp} vs watch ${St.S.xp - xpBeforeWatch}`);

ok('minutes are clamped to something sane',
   (() => { St.logFocus({ minutes: 99999, mode: 'build' });
            return St.getDay().focus.at(-1).minutes === 720; })());

/* ------------------------------- undo is exact ---------------------------- */
const beforeMin = St.S.stats.minutes, beforeEff = St.S.stats.effMinutes;
const target = St.getDay().focus.find(e => e.minutes === 720);
St.removeFocus(target.uid);
ok('removing an entry rewinds lifetime minutes', St.S.stats.minutes === beforeMin - 720);
ok('removing an entry rewinds effective minutes too', St.S.stats.effMinutes === beforeEff - 720);
ok('removing a missing entry is a no-op', St.removeFocus('nope') === false);

/* ================================= problems =============================== */
group('problems');

St.logProblem({ name: 'Two Sum', pattern: 'hashing', difficulty: 'easy', minutes: 9, solved: true });
St.logProblem({ name: 'LRU Cache', pattern: 'design', difficulty: 'medium', minutes: 30, solved: true, hinted: true });
St.logProblem({ name: 'Word Ladder', pattern: 'graphs', difficulty: 'hard', minutes: 55, solved: false });
tot = St.dayTotals();

ok('attempts and solves are tracked separately', tot.problems === 3 && tot.solved === 2);
ok('hint-free solves are counted', tot.solvedNoHint === 1);
ok('distinct patterns are counted', tot.patterns === 3);

const solvedClean = Pr.problemReward({ difficulty: 'medium', solved: true, hinted: false, minutes: 28 });
const solvedHint  = Pr.problemReward({ difficulty: 'medium', solved: true, hinted: true, minutes: 28 });
const unsolved    = Pr.problemReward({ difficulty: 'medium', solved: false });
ok('a hint costs XP', solvedHint.xp < solvedClean.xp);
ok('an unsolved attempt still pays something', unsolved.xp > 0 && unsolved.xp < solvedHint.xp);
ok('beating par pays a capped bonus',
   Pr.problemReward({ difficulty: 'medium', solved: true, hinted: false, minutes: 1 }).xp
   <= Math.round(42 * 1.25));

const beforeSolved = St.S.stats.solved;
St.removeProblem(St.getDay().problems.find(p => p.name === 'Two Sum').uid);
ok('removing a solved problem rewinds the count', St.S.stats.solved === beforeSolved - 1);

/* =================================== ships ================================ */
group('ships');

St.logShip({ kind: 'commit', count: 4, repo: 'codify' });
St.logShip({ kind: 'pr', count: 1, repo: 'codify' });
tot = St.dayTotals();
ok('commits sum by count, not by entry', tot.commits === 4);
ok('pull requests are counted', tot.prs === 1);
ok('a project is worth more than a commit',
   Pr.shipReward('project').xp > Pr.shipReward('commit', 10).xp);
ok('ship counts are clamped',
   (() => { St.logShip({ kind:'commit', count: 9999 });
            return St.getDay().ships.at(-1).count === 200; })());

/* ================================== streak ================================ */
group('streak');

ok('a real day of work counts as active', St.dayIsActive() === true);
ok('the streak advanced', St.S.streak.current >= 1);

St.S.streak = { current: 5, best: 5, lastActive: key(3), freezes: 2 };
St.auditStreak();
ok('freezes cover a gap', St.S.streak.current === 5 && St.S.streak.freezes === 0);

St.S.streak = { current: 9, best: 9, lastActive: key(6), freezes: 0 };
St.auditStreak();
ok('too long a gap breaks it', St.S.streak.current === 0);

/* ================================ skill tree ============================== */
group('skill tree');

ok('every prerequisite points at a real node',
   Tree.NODES.every(n => !n.needs || Tree.nodeById(n.needs)));
ok('node ids are unique', new Set(Tree.NODES.map(n => n.id)).size === Tree.NODES.length);
ok('every node names a real path',
   Tree.NODES.every(n => Tree.PATHS.some(p => p.id === n.path)));
ok('every node has a concrete task',
   Tree.NODES.every(n => typeof n.task === 'string' && n.task.length > 25));
ok('a prerequisite never gates at a higher level than its dependant',
   Tree.NODES.every(n => !n.needs || Tree.nodeById(n.needs).lvl <= n.lvl));
ok('no prerequisite cycles',
   Tree.NODES.every(n => { let cur = n, hops = 0;
     while (cur?.needs && hops++ < 50) cur = Tree.nodeById(cur.needs);
     return hops < 50; }));

St.S.xp = 0;
ok('a root node is available from level 1', St.nodeState(Tree.nodeById('syntax')) === 'available');
ok('a deep node is locked at level 1', St.nodeState(Tree.nodeById('consensus')) === 'locked');
ok('a node with an unmet prerequisite is locked',
   St.nodeState(Tree.nodeById('functions')) === 'locked');

ok('claiming a root node works', !!St.claimNode('syntax', 18));
ok('its dependant then opens', St.nodeState(Tree.nodeById('functions')) === 'available');
ok('claiming the same node twice is refused', St.claimNode('syntax', 5) === null);
ok('claiming a locked node is refused', St.claimNode('consensus', 5) === null);
ok('the claim is recorded on today', St.getDay().skillsClaimed.includes('syntax'));

/* =============================== retention ================================ */
group('retention model');

ok('retention is 1 on the day it was proven', G.predictedRetention(0, 10, 0) === 1);
ok('retention decays with time',
   G.predictedRetention(30, 10, 0) < G.predictedRetention(7, 10, 0));
ok('more hours on a path slow the decay',
   G.predictedRetention(30, 100, 0) > G.predictedRetention(30, 1, 0));
ok('each successful retest slows it further',
   G.predictedRetention(30, 10, 3) > G.predictedRetention(30, 10, 0));
ok('half-life is exactly a halving',
   near(G.predictedRetention(G.halfLifeDays(10, 0), 10, 0), 0.5, 0.001));
ok('retention never goes negative or above one',
   [0, 1, 50, 5000].every(d => { const r = G.predictedRetention(d, 5, 1); return r > 0 && r <= 1; }));
ok('freshness bands are ordered',
   G.freshnessFor(0.95).id === 'fresh' && G.freshnessFor(0.6).id === 'warm' &&
   G.freshnessFor(0.3).id === 'rusty' && G.freshnessFor(0.05).id === 'cold');

/* ------------------------------ the schedule ------------------------------ */
ok('the first retest is a week out', G.nextRetestGap(0) === 7);
ok('the schedule widens with each pass',
   G.nextRetestGap(1) > G.nextRetestGap(0) && G.nextRetestGap(2) > G.nextRetestGap(1));
ok('the schedule plateaus rather than running away',
   G.nextRetestGap(99) === G.RETEST_STEPS.at(-1));
ok('a failure brings it back in days, not weeks', G.nextRetestGap(3, true) === 3);

let status = St.skillStatus('syntax');
ok('a fresh claim is not yet due', status.due === false && status.dueIn === 7);

/* --------------------------- pass and fail behave ------------------------- */
St.S.skills.syntax.date = key(30);
St.S.skills.syntax.lastProof = key(30);
status = St.skillStatus('syntax');
ok('an old node becomes due', status.due === true);
ok('an old node has decayed', status.retention < 0.9);
ok('it appears in the due queue', St.dueRetests().some(s => s.node.id === 'syntax'));

St.logRetest('syntax', true, 15);
status = St.skillStatus('syntax');
ok('a pass advances the rung', status.passes === 1 && status.dueIn === 21);
ok('a pass resets the clock', status.since === 0);
ok('a pass is counted', St.S.stats.retestsPassed === 1);

St.S.skills.syntax.lastProof = key(30);
St.logRetest('syntax', false, 20);
status = St.skillStatus('syntax');
ok('a failure drops a rung', status.passes === 0);
ok('a failure schedules a quick return', status.dueIn === 3);
ok('a failure is recorded rather than hidden', St.S.stats.retestsFailed === 1);
ok('history keeps every attempt', St.S.skills.syntax.history.length === 3);
ok('a retest on an unclaimed node is refused', St.logRetest('consensus', true, 5) === null);

/* =============================== calibration ============================== */
group('calibration');

ok('it declines to judge on thin evidence', A.calibration().tooFew === true);

// A node with a long, mixed retest history, on a path with real hours behind it.
// The tree is cleared first: nodes claimed by earlier sections carry retest
// history of their own, and this fixture is only meaningful in isolation.
St.S.skills = {};
for (let i = 60; i >= 0; i -= 3) St.logFocus({ minutes: 60, mode: 'build', path: 'data' }, key(i));
St.S.xp = 999999;                       // open the tree for the fixture
St.claimNode('array_', 30);
St.S.skills.array_.date = key(200);
St.S.skills.array_.history = [
  { date: key(200), passed: true, first: true },
  { date: key(170), passed: true }, { date: key(140), passed: false },
  { date: key(110), passed: true }, { date: key(80),  passed: true },
  { date: key(50),  passed: false }, { date: key(20), passed: true },
];
St.S.skills.array_.lastProof = key(20);

const cal = A.calibration();
ok('every retest after the first becomes an event', cal.events === 6, `got ${cal.events}`);
ok('predicted is a probability', cal.predicted > 0 && cal.predicted < 1);
ok('actual matches the fixture', near(cal.actual, 4 / 6, 0.001));
ok('a verdict is produced', ['match', 'optimistic', 'conservative'].includes(cal.verdict.key));
ok('tolerance narrows as evidence grows',
   (0.45 / Math.sqrt(50)) < (0.45 / Math.sqrt(6)));

// Force each verdict by moving actual away from predicted.
const forced = passed => {
  St.S.skills.array_.history = [{ date: key(200), passed: true, first: true },
    ...Array.from({ length: 8 }, (_, i) => ({ date: key(180 - i * 20), passed }))];
  return A.calibration();
};
ok('all-fail reads as the model being optimistic', forced(false).verdict.key === 'optimistic');
ok('all-pass on stale nodes reads as conservative', forced(true).verdict.key === 'conservative');

/* ------------------------- events are scored in the past ------------------ */
const events = A.retestEvents();
ok('events are ordered oldest first',
   events.every((e, i) => i === 0 || events[i - 1].date <= e.date));
ok('each event carries what was predicted at the time',
   events.every(e => e.predicted > 0 && e.predicted <= 1));

/* ================================== quests ================================ */
group('quests');

ok('three quests a day', Q.questsForDay('2026-09-01', 5).length === 3);
ok('one from each bucket',
   new Set(Q.questsForDay('2026-09-01', 5).map(q => q.bucket)).size === 3);
ok('the same date always gives the same three',
   JSON.stringify(Q.questsForDay('2026-09-01', 5)) === JSON.stringify(Q.questsForDay('2026-09-01', 5)));
ok('different dates vary',
   JSON.stringify(Q.questsForDay('2026-09-01', 5)) !== JSON.stringify(Q.questsForDay('2026-09-08', 5)));

ok('goals never scale past +50% of base',
   Q.QUEST_POOL.every(q => Q.goalFor(q, 99) <= Math.round(q.base * 1.5)));
ok('a percentage goal is never an impossible 100%',
   Q.QUEST_POOL.filter(q => q.unit === '%').every(q => Q.goalFor(q, 99) <= 95));
ok('every quest in the pool gets drawn eventually',
   (() => { const seen = new Set();
     for (let d = 0; d < 500; d++) Q.questsForDay(key(-d), 30).forEach(q => seen.add(q.id));
     return seen.size === Q.QUEST_POOL.length; })());

/* ------------------------ every quest is completable ---------------------- */
const bigDay = {
  focus: [
    { minutes: 120, mode: 'build', path: 'lang', note: 'a real note about what I learned', ts: Date.now() },
    { minutes: 60, mode: 'drill', path: 'data', ts: Date.now() },
    { minutes: 45, mode: 'read', path: 'web', ts: Date.now() },
    { minutes: 50, mode: 'build', path: 'algo', drillId: 'cold-start', ts: Date.now() },
  ],
  problems: Array.from({ length: 8 }, (_, i) => ({
    solved: true, hinted: false, difficulty: ['easy', 'medium', 'hard'][i % 3],
    pattern: Pr.PATTERNS[i].id, minutes: 20, ts: Date.now(),
  })),
  ships: [{ kind: 'commit', count: 9, ts: Date.now() }, { kind: 'pr', count: 3, ts: Date.now() }],
  retests: [{ passed: true }, { passed: true }, { passed: true }],
  gauntlets: ['heisenbug'],
  skillsClaimed: ['syntax', 'functions'],
  claimed: [],
};
const uncompletable = Q.QUEST_POOL.filter(q =>
  G.metricValue(q.metric, bigDay, { neglected: Pr.PATTERNS[0].id }) < Q.goalFor(q, 99));
ok('every quest in the pool is completable in one strong day',
   uncompletable.length === 0, uncompletable.map(q => q.id).join(', '));

ok('a metric the day cannot answer returns zero, not undefined',
   G.metricValue('nonsense-metric', bigDay) === 0);

/* ================================= levelling ============================== */
group('levelling');

ok('level 1 needs 100 XP', G.xpToNext(1) === 100);
ok('the curve is monotonic',
   Array.from({ length: 60 }, (_, i) => i + 1).every(l => G.xpToNext(l + 1) > G.xpToNext(l)));
ok('levelFromXp inverts xpAtLevel',
   [1, 5, 12, 30, 47].every(l => G.levelFromXp(G.xpAtLevel(l)).level === l));
ok('zero XP is level 1', G.levelFromXp(0).level === 1);
ok('a colossal XP total does not loop forever', G.levelFromXp(1e9).level === 99);
ok('ranks are ordered by level',
   G.RANKS.every((r, i) => i === 0 || r.at > G.RANKS[i - 1].at));
ok('rankFor picks the highest reached',
   G.rankFor(14).name === 'Practitioner' && G.rankFor(15).name === 'Engineer');

/* =================================== loot ================================= */
group('gear');

ok('every item names a real rarity',
   Loot.LOOT.every(l => Loot.RARITY[l.rarity]));
ok('no gear at all is a multiplier of exactly 1', Loot.lootBonus({}) === 1);
ok('the bonus is capped',
   near(Loot.lootBonus(Object.fromEntries(Loot.LOOT.map(l => [l.id, 1]))), 1 + Loot.MAX_BONUS, 0.001));
ok('duplicates do not compound',
   Loot.lootBonus({ duck: 1 }) === Loot.lootBonus({ duck: 9 }));
ok('an unknown id is ignored', Loot.lootBonus({ 'not-a-thing': 4 }) === 1);
ok('a floored roll never returns something rarer than asked',
   Array.from({ length: 300 }, () => Loot.rollLoot({ minRarity: 'epic' }))
     .every(l => ['epic', 'legendary'].includes(l.rarity)));
ok('a zero chance drops nothing', Loot.rollLoot({ chance: 0 }) === null);

/* ================================== drills ================================ */
group('drills & gauntlets');

ok('drill and gauntlet ids do not collide',
   new Set([...Drill.DRILLS, ...Drill.GAUNTLETS].map(d => d.id)).size ===
   Drill.DRILLS.length + Drill.GAUNTLETS.length);
ok('every drill has steps with positive minutes',
   Drill.DRILLS.every(d => d.steps.length > 0 && d.steps.every(s => s.minutes > 0)));
ok('every drill names a real path',
   [...Drill.DRILLS, ...Drill.GAUNTLETS].every(d => Tree.PATHS.some(p => p.id === d.path)));
ok('every drill names a real mode',
   [...Drill.DRILLS, ...Drill.GAUNTLETS].every(d => Pr.MODES.some(m => m.id === d.mode)));
ok('every tier is reachable',
   [1, 2, 3, 4, 5].every(t => Drill.drillsOfTier(t).length > 0));
ok('planned minutes include the rests',
   Drill.drillMinutes(Drill.DRILLS[0]) >
   Drill.DRILLS[0].steps.reduce((n, s) => n + s.minutes, 0));
ok('every gauntlet taunts at each threshold',
   Drill.GAUNTLETS.every(g => [75, 50, 25, 0].every(k => typeof g.taunts[k] === 'string')));

/* ----------------------------- finishing a run ---------------------------- */
const drill = Drill.getSession('cold-start');
const allDone = drill.steps.map(s => ({ ...s, done: true }));
const xpBefore = St.S.xp;
const gearBefore = St.gearBonus();
const runA = St.finishSession(drill, { steps: allDone, seconds: 1400, comboMult: 1.24, bestCombo: 3, passed: true });
ok('a finished drill pays XP', St.S.xp > xpBefore);
ok('a finished drill writes into the focus log',
   St.getDay().focus.at(-1).drillId === 'cold-start');
ok('the logged minutes come from the clock, not the plan',
   St.getDay().focus.at(-1).minutes === 23, `got ${St.getDay().focus.at(-1).minutes}`);
ok('the drill counter moved', St.S.stats.drills >= 1);
ok('the best combo is remembered', St.S.stats.bestCombo >= 3);

const halfDone = drill.steps.map((s, i) => ({ ...s, done: i === 0 }));
const xpMid = St.S.xp;
St.finishSession(drill, { steps: halfDone, seconds: 600, comboMult: 1, bestCombo: 1, passed: true });
const partialXp = St.S.xp - xpMid;
ok('a partial run pays less than a full one', partialXp < (runA.xp), `${partialXp} vs ${runA.xp}`);
ok('a partial run still pays something', partialXp > 0);

/* ------------------------------- gauntlets -------------------------------- */
const gaunt = Drill.getSession('heisenbug');
St.finishSession(gaunt, {
  steps: gaunt.steps.map(s => ({ ...s, done: false })), seconds: 300,
  comboMult: 1, bestCombo: 0, passed: false,
});
ok('a lost gauntlet records the attempt', St.S.gauntlets.heisenbug.attempts === 1);
ok('a lost gauntlet is not won', St.S.gauntlets.heisenbug.won === false);
ok('a loss does not count towards the achievement', St.S.stats.gauntlets === 0);

St.finishSession(gaunt, {
  steps: gaunt.steps.map(s => ({ ...s, done: true })), seconds: 3600,
  comboMult: 1.4, bestCombo: 5, passed: true,
});
ok('a won gauntlet is recorded', St.S.gauntlets.heisenbug.won === true);
ok('a win after a loss counts as a comeback', St.S.stats.gauntletComebacks === 1);
ok('a won gauntlet always drops gear', St.gearBonus() >= gearBefore);

/* ================================ analytics =============================== */
group('analytics');

// The bug this guards: a 100%-passive day has deliberatePct 0, and filtering on
// "value > 0" makes the worst days invisible and reports the average as perfect.
store.clear();
const S2 = St.S;
Object.keys(S2.days).forEach(k => delete S2.days[k]);
S2.stats.deliberateDays = 0;
for (let i = 5; i >= 3; i--) St.logFocus({ minutes: 60, mode: 'watch', path: 'web' }, key(i));
for (let i = 2; i >= 0; i--) St.logFocus({ minutes: 60, mode: 'build', path: 'web' }, key(i));
const avgs = A.rollingAverages(7);
ok('a percentage averages over every logged day, zeros included',
   avgs.deliberatePct === 50, `got ${avgs.deliberatePct}`);
ok('a total averages only over days it happened on', avgs.minutes === 60);
ok('logged days are counted', avgs.loggedDays === 6);

const ma = A.movingAverage(St.historySeries(7), 'deliberatePct', 7, { overLogged: true });
ok('the moving average takes the same option', Math.round(ma.at(-1)) === 50);

ok('focus bands are ordered',
   A.focusBand(100, 100) === 'on' && A.focusBand(70, 100) === 'near' &&
   A.focusBand(10, 100) === 'off' && A.focusBand(0, 100) === 'none');

const mb = A.modeBreakdown(St.getDay());
ok('mode breakdown sums to 100%',
   near(mb.groups.reduce((n, g) => n + g.pct, 0), 100, 0.01));
ok('an empty day has no breakdown rather than a divide by zero',
   A.modeBreakdown({ focus: [] }) === null);

ok('overreach stays quiet under the ceiling', A.overreach(7) === null);
for (let i = 6; i >= 0; i--) St.logFocus({ minutes: 200, mode: 'build', path: 'web' }, key(i));
ok('overreach fires above the ceiling', A.overreach(7) !== null);

const bands = A.retentionBands();
ok('retention bands cover every held node',
   Object.values(bands.bands).reduce((a, b) => a + b, 0) === bands.total);

const fc = A.retentionForecast(90);
ok('the forecast decays', fc.at(-1).value < fc[0].value);
ok('the forecast stays a probability', fc.every(p => p.value >= 0 && p.value <= 1));

const qf = A.queueForecast(14);
ok('the queue forecast covers every day asked for', qf.length === 15);

const cov = A.patternCoverage();
ok('pattern coverage counts every pattern', cov.rows.length === Pr.PATTERNS.length);
ok('the neglected pattern is one that exists',
   Pr.PATTERNS.some(p => p.id === St.neglectedPattern()));

const balance = A.pathBalance();
ok('path balance covers every path', balance.rows.length === Tree.PATHS.length);

ok('history series returns exactly the days asked for', St.historySeries(30).length === 30);
ok('weekly buckets group by seven', A.weeklyBuckets(4).length === 4);

/* =============================== achievements ============================= */
group('achievements');

ok('achievement ids are unique',
   new Set(Ach.ACHIEVEMENTS.map(a => a.id)).size === Ach.ACHIEVEMENTS.length);
const zero = new Proxy({}, { get: () => 0 });
ok('nothing is earned on an empty save',
   Ach.ACHIEVEMENTS.filter(a => a.check(zero)).length === 0);
ok('no predicate throws on a sparse snapshot',
   (() => { try { Ach.ACHIEVEMENTS.forEach(a => a.check(zero)); return true; }
            catch { return false; } })());
ok('a snapshot exposes every field the predicates read',
   (() => { const snap = St.statsSnapshot();
     return ['skills','pathsTouched','pathsComplete','patternsCovered','gauntlets','bestStreak','level']
       .every(k => typeof snap[k] === 'number'); })());
ok('an achievement is granted only once',
   (() => { St.S.earned = {}; St.S.stats.sessions = 1;
     const first = St.checkAchievements().length;
     const second = St.checkAchievements().length;
     return first > 0 && second === 0; })());

/* ============================ backup & restore ============================ */
group('backup & restore');

const snapshot = St.exportSave();
ok('an export round-trips as JSON', typeof JSON.parse(snapshot) === 'object');

const summary = St.describeSave(JSON.parse(snapshot));
ok('a summary reports the level', summary.level === St.progress().level);
ok('a summary reports day coverage', summary.days > 0 && !!summary.firstDay);

ok('invalid JSON is refused', St.importSave('{oh no').ok === false);
ok('an array is refused', St.importSave('[1,2,3]').ok === false);
ok('null is refused', St.importSave('null').ok === false);
ok('valid JSON that is not a save is refused',
   St.importSave('{"hello":"world"}').ok === false);

const xpNow = St.S.xp;
St.S.xp = 42;
ok('a real save is accepted', St.importSave(snapshot).ok === true);
ok('the restore actually replaced the data', St.S.xp === xpNow);

ok('a save from an older build gains new fields',
   (() => { const old = JSON.parse(snapshot);
     delete old.settings; delete old.gauntlets;
     St.importSave(JSON.stringify(old));
     return typeof St.S.settings.sound === 'boolean' && typeof St.S.gauntlets === 'object'; })());

ok('the pre-restore save is kept for undo', !!St.priorSave());
ok('undo restores it', St.undoImport() === true);

/* =============================== persistence ============================== */
group('persistence');

St.save({ immediate: true });
ok('the save reaches storage', !!store.get('codify.save.v1'));
ok('a stored save parses', typeof JSON.parse(store.get('codify.save.v1')) === 'object');
ok('a write failure is reported, not swallowed',
   (() => { let told = false;
     const off = St.onSaveError(() => { told = true; });
     const real = globalThis.localStorage.setItem;
     globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
     St.save({ immediate: true });
     globalThis.localStorage.setItem = real;
     off();
     const healthy = St.saveHealthy();
     St.save({ immediate: true });                 // restore health for later tests
     return told && healthy === false; })());
ok('health recovers after a successful write', St.saveHealthy() === true);

/* ============================== views render ============================== */
group('views render');

for (const name of ['home', 'train', 'log', 'skills', 'hero', 'onboarding']) {
  const view = await import(`../js/views/${name}.js`);
  let html = '', err = null;
  try { html = view.render(); } catch (e) { err = e; }
  ok(`${name} renders without throwing`, !err && typeof html === 'string' && html.length > 50,
     err ? err.message : `${html.length} chars`);
}

const { esc, h, raw } = await import('../js/ui.js');
ok('esc neutralises tags', esc('<script>') === '&lt;script&gt;');
ok('esc neutralises quotes and ampersands', esc(`"&'`) === '&quot;&amp;&#39;');
ok('the h template escapes interpolations by default',
   h`<p>${'<b>x</b>'}</p>` === '<p>&lt;b&gt;x&lt;/b&gt;</p>');
ok('raw() opts a value out of escaping', h`${raw('<b>x</b>')}` === '<b>x</b>');

// Free text reaches the DOM from four places: the profile name, a session topic
// and note, a problem name, and a repo. Every one is attacker-shaped if a save
// file is ever shared, so render the views that show them and look for a live tag.
const HOSTILE = '<img src=x onerror=alert(1)>';
St.saveProfile({ name: HOSTILE });
St.logFocus({ minutes: 30, mode: 'build', path: 'lang', topic: HOSTILE, note: HOSTILE });
St.logProblem({ name: HOSTILE, pattern: 'arrays', difficulty: 'easy', minutes: 5, solved: true });
St.logShip({ kind: 'commit', count: 1, repo: HOSTILE });

for (const name of ['home', 'log', 'hero']) {
  const view = await import(`../js/views/${name}.js`);
  const html = view.render();
  ok(`${name} escapes hostile free text`,
     !html.includes('<img src=x') && html.includes('&lt;img src=x'),
     'an unescaped interpolation reached the markup');
}

/* ================================ shipping ================================ */
group('shipping');

const fsp = await import('node:fs/promises');
const { APP_VERSION } = await import('../js/version.js');
const swSource = await fsp.readFile('sw.js', 'utf8');

const swVersion = swSource.match(/CACHE_VERSION = '([^']+)'/)?.[1];
ok('the footer version matches the service worker cache',
   APP_VERSION === swVersion, `app ${APP_VERSION} vs sw ${swVersion}`);

// cache.addAll is atomic, so a module missing from CORE does not fail loudly —
// it is simply absent when the app is opened with no connection.
const listed = new Set([...swSource.matchAll(/'\.\/(js\/[^']+\.js)'/g)].map(m => m[1]));
const onDisk = [];
const walk = async dir => {
  for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.js')) onDisk.push(path);
  }
};
await walk('js');
const missing = onDisk.filter(f => !listed.has(f));
ok('every module is precached', missing.length === 0, `missing: ${missing.join(', ')}`);

ok('the API guard is present in the service worker',
   swSource.includes("url.pathname.startsWith('/api/')"),
   'a same-origin API GET would otherwise be cached forever');

const manifest = JSON.parse(await fsp.readFile('manifest.webmanifest', 'utf8'));
ok('the manifest is valid JSON with icons', manifest.icons.length >= 2);
ok('the manifest has a maskable icon',
   manifest.icons.some(i => i.purpose === 'maskable'));

/* --------------------------------- result --------------------------------- */

console.log(`\n${fail === 0 ? '\x1b[32m✅' : '\x1b[31m❌'}  ${pass} passed, ${fail} failed\x1b[0m\n`);
process.exit(fail ? 1 : 0);
