/**
 * Headless assertions over the model.
 *
 * What is worth protecting: every generated question can be graded and has the
 * right answer; syncs are idempotent and can never double-pay; contests count
 * only in-window work; the GitHub verifier cannot be satisfied by the obvious
 * shortcuts; nothing typed by hand ever pays; migrating from Codify or Botify
 * loses nothing; and the economy lands where it was tuned. Each is cheap to break
 * by accident. Nothing touches the network — the verifier gets a fake fetch.
 */

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31m✗\x1b[0m ' + name + (extra ? '  \x1b[2m' + extra + '\x1b[0m' : '')); }
};
const group = n => console.log('\n\x1b[1m▸ ' + n + '\x1b[0m');
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const G    = await import('../js/game.js');
const Q    = await import('../js/quiz.js');
const GH   = await import('../js/github.js');
const L    = await import('../js/data/loot.js');
const Ach  = await import('../js/data/achievements.js');
const Qs   = await import('../js/data/quests.js');
const St   = await import('../js/state.js');
const R    = await import('../js/tracks/robotics/roadmap.js');
const Sk   = await import('../js/tracks/robotics/skills.js');
const Boss = await import('../js/tracks/robotics/bosses.js');
const RM   = await import('../js/tracks/robotics/model.js');
const Ro   = await import('../js/tracks/robotics/actions.js');
const T    = await import('../js/tracks/cp/topics.js');
const Con  = await import('../js/tracks/cp/contests.js');
const CM   = await import('../js/tracks/cp/model.js');
const Ca   = await import('../js/tracks/cp/actions.js');
const E    = await import('../js/learn/session.js');
const LP   = await import('../js/learn/plan.js');
const RP   = await import('../js/tracks/robotics/plan.js');
const CP   = await import('../js/tracks/cp/plan.js');
const CS   = await import('../js/tracks/cp/skills.js');
const SB   = await import('../js/skillbook.js');

const rightAnswer = q => (q.kind === 'mc' ? q.correct : String(q.answer));
// Far enough from any answer that no tolerance could accept it.
const wrongAnswer = q => (q.kind === 'mc' ? (q.correct + 1) % q.options.length : String(q.answer + Math.max(10, Math.abs(q.answer)) * 0.5 + 7));
const day = n => G.addDays(G.dayKey(), -n);
const now = () => Math.floor(Date.now() / 1000);
const solve = (key, rating, tags, agoDays = 0, at = null) => ({
  key, name: 'Problem ' + key, contestId: 1000, index: key, rating, tags,
  at: at ?? (now() - agoDays * 86400), day: day(agoDays), lang: 'C++',
});

/** A fresh, onboarded character with both tracks on. */
function reset(patch = {}) {
  store.clear();
  St.importSave(JSON.stringify({ v: 3, tracks: {}, profile: { name: 'T', onboarded: true, tracks: ['cp', 'robotics'] }, xp: 0 }));
  store.clear();
  Object.assign(St.S.profile, patch.profile || {});
  St.S.settings.sound = false;
}

/* ================================= levelling ============================== */
group('levelling');
ok('the curve only rises', Array.from({ length: 60 }, (_, i) => i + 1).every(l => G.xpToNext(l + 1) > G.xpToNext(l)));
ok('levelFromXp inverts xpAtLevel', [1, 5, 12, 30, 47].every(l => G.levelFromXp(G.xpAtLevel(l)).level === l));
ok('an absurd total does not loop forever', G.levelFromXp(1e12).level === 99);
ok('ranks are ordered', G.RANKS.every((r, i) => i === 0 || r.at > G.RANKS[i - 1].at));

/* ============================== robotics content ========================== */
group('robotics content');
ok('four months, 28 builds, each with proof', R.MONTHS.length === 4 && R.BUILDS.length === 28 && R.BUILDS.every(b => b.proof));
ok('every build is taught no later than its own month', R.BUILDS.every(b => R.topicById(b.topic)?.month <= b.month));
ok('every skill points at a real topic', Sk.SKILLS.every(s => R.topicById(s.topic)));
ok('milestones name only real builds and skills',
  Object.values(R.MILESTONES).flat().every(m => (m.builds || []).every(R.buildById) && (m.skills || []).every(Sk.skillById)));

group('skill generators — 200 draws each, both tracks');
ok('skill ids are unique across tracks', new Set(SB.ALL_SKILLS.map(s => s.id)).size === SB.ALL_SKILLS.length);
let genErrors = [];
for (const s of SB.ALL_SKILLS) {
  const rng = Q.seeded(s.order + 11);
  for (let i = 0; i < 200; i++) {
    let q;
    try { q = Q.generate(s.id, rng); } catch (e) { genErrors.push(`${s.id}: threw ${e.message}`); break; }
    const why = [];
    if (!q.q || q.q.length < 12) why.push('no question text');
    if (!q.explain) why.push('no explanation');
    if (q.kind === 'num') {
      if (!Number.isFinite(q.answer)) why.push(`answer ${q.answer}`);
      if (!(q.dp >= 0)) why.push('no dp');
      if (!Q.grade(q, String(q.answer)).correct) why.push('own answer rejected');
      if (!Q.grade(q, q.answer.toFixed(q.dp ?? 2)).correct && q.tol == null && (q.rtol ?? 0.02) > 0) why.push('rounded answer rejected');
      if (Q.grade(q, wrongAnswer(q)).correct) why.push('wrong answer accepted');
    } else if (q.kind === 'mc') {
      if (q.options.length < 2) why.push('fewer than 2 options');
      if (new Set(q.options).size !== q.options.length) why.push('duplicate options');
      if (!(q.correct >= 0 && q.correct < q.options.length)) why.push('bad correct index');
      if (!Q.grade(q, q.correct).correct) why.push('own answer rejected');
      if (Q.grade(q, wrongAnswer(q)).correct) why.push('wrong option accepted');
    } else why.push(`kind ${q.kind}`);
    if (why.length) { genErrors.push(`${s.id}: ${why.join(', ')} — ${q.q}`); break; }
  }
}
ok(`all ${SB.ALL_SKILLS.length} skills generate gradable questions`, !genErrors.length, genErrors.slice(0, 3).join(' | '));

group('multiple choice is shuffled');
{
  const rng = Q.seeded(3), positions = new Set();
  for (let i = 0; i < 60; i++) positions.add(Q.generate('meter', rng).correct);
  ok('the right answer is not always in the same place', positions.size >= 3, `positions seen: ${[...positions]}`);
}

group('spot checks against hand arithmetic');
{
  // A toolkit that always takes the first option and the low end of every range.
  const first = { int: a => a, pick: a => a[0], pickN: (a, k) => a.slice(0, k), shuffle: a => a,
                  mc: bank => ({ kind:'mc', q: bank[0].q, options:[bank[0].a, ...bank[0].w], correct:0, explain: bank[0].why }) };
  const g = id => Sk.skillById(id).gen(first);
  ok('Ohm: 5 mA through 100 Ω is 0.5 V', near(g('ohm').answer, 0.5));
  ok('divider: 3.3 V, 1k over 2.2k is 2.269 V', near(g('divider').answer, 3.3 * 2.2 / 3.2));
  ok('LED: 3.3 V, red 2.0 V at 10 mA needs 130 Ω', near(g('led').answer, 130));
  ok('colour code: brown-black-black is 10 Ω', g('bands').answer === 10);
  ok('LiPo: 1S full is 4.2 V', near(g('lipo').answer, 4.2));
  ok('PWM: 10% of 5 V averages 0.5 V', near(g('pwm').answer, 0.5));
  ok('encoder: 12 counts × 20:1 is 240', g('encoder').answer === 240);
  ok('FK: y = 80·sin(−60°) = −69.28 mm', near(g('fk').answer, 80 * Math.sin(-Math.PI / 3), 1e-9));
  ok('diff drive: r 0.03, ω 4 & 5 → 0.135 m/s', near(g('diffdrive').answer, 0.135));
  ok('gears: 3000 rpm through 10:1 is 300 rpm', near(g('gears').answer, 300));
  ok('torque: 100 g at 10 cm is 1 kg·cm', near(g('torque').answer, 1));
}


group('reading typed answers');
for (const [input, want] of [['4.7k', 4700], ['4k7', 4700], ['10 kΩ', 10000], ['1M', 1e6], ['4,700', 4700],
  ['2,5', 2.5], ['5.3 mm', 5.3], ['−3.5', -3.5], ['.25', 0.25], ['220 ohm', 220]]) {
  ok(`"${input}" reads as ${want}`, near(Q.parseNumber(input), want));
}
ok('text that is not a number is rejected, not scored as zero', !Q.grade({ kind:'num', answer:0, tol:0.1 }, 'dunno').correct);
ok('an answer off by 1000× is flagged as a unit slip',
  /unit/.test(Q.grade({ kind:'num', answer:0.02, dp:3, unit:'A' }, '20').note || ''));
ok('2% relative tolerance by default', Q.grade({ kind:'num', answer:100 }, '101.9').correct && !Q.grade({ kind:'num', answer:100 }, '103').correct);


group('skill levels');
{
  let out = G.scoreRound(null, { asked:2, right:2, secs:40 }, '2026-09-01');
  ok('a new skill played clean goes from level 1 to 2', out.at === 1 && out.to === 2 && out.move === 1);
  ok('and comes back after its gap', out.entry.due === G.addDays('2026-09-01', G.GAPS[1]));
  out = G.scoreRound(out.entry, { asked:3, right:2, secs:90 }, '2026-09-02');
  ok('one wrong: same level, back tomorrow', out.to === 2 && out.move === 0 && out.entry.due === '2026-09-03');
  out = G.scoreRound(out.entry, { asked:3, right:1, secs:90 }, '2026-09-03');
  ok('two wrong: down a level, back tomorrow', out.to === 1 && out.move === -1 && out.entry.due === '2026-09-04');
  out = G.scoreRound(out.entry, { asked:2, right:0 }, '2026-09-04');
  ok('level 1 is the floor', out.to === 1);
  ok('the best level is remembered', out.entry.best === 2);
  let e = out.entry;
  for (let i = 0; i < 30; i++) e = G.scoreRound(e, { asked: G.roundFor(G.levelOf(e)).n, right: G.roundFor(G.levelOf(e)).n }, e.due).entry;
  ok('level 10 is the ceiling', G.levelOf(e) === G.MAX_LEVEL);
  ok('only the last twelve rounds are kept', e.hist.length === 12);
  ok('an old Leitner box reads as a level', G.levelOf({ box:3, due:'2026-09-01' }) === 3 && G.levelOf(null) === 0);
  const ns = G.LEVELS.slice(1);
  ok('higher levels never ask fewer questions', ns.every((l, i) => !i || l[0] >= ns[i - 1][0]));
  ok('and never allow more time', ns.every((l, i) => !i || (l[1] < ns[i - 1][1] && l[2] < ns[i - 1][2])));
}

group('picking reviews');
{
  const pool = ['a', 'b', 'c', 'd', 'e'];
  const st = { a:{ level:2, due:'2026-09-01' }, b:{ level:1, due:'2026-09-03' }, c:{ level:3, due:'2026-08-30' }, d:{ level:5, due:'2026-12-01' } };
  const pick = G.pickReviews(pool, st, '2026-09-03', 100);
  ok('the most overdue comes first', pick[0] === 'c');
  ok('only skills that are due', pick.length === 3 && !pick.includes('d') && !pick.includes('e'));
  ok('a question budget limits how many', G.pickReviews(pool, st, '2026-09-03', 4).length === 1);
  ok('skills already in the mission are skipped', !G.pickReviews(pool, st, '2026-09-03', 100, ['c']).includes('c'));
}

group('the robotics plan');
{
  const MS = RP.MISSIONS;
  ok('120 missions, 30 a month', MS.length === 120 && R.MONTHS.every(m => MS.filter(x => x.month === m.n).length === 30));
  ok('numbered 1 to 120 in order', MS.every((x, i) => x.n === i + 1));
  const intro = MS.flatMap(x => x.skills);
  ok('every skill is introduced exactly once', intro.length === Sk.SKILLS.length && new Set(intro).size === Sk.SKILLS.length);
  ok('a skill is introduced in its own month', MS.every(x => x.skills.every(id => Sk.skillById(id).month === x.month)));
  ok('every day points at a real topic', MS.every(x => R.topicById(x.topic)));
  ok('each 30th day is the boss, with nothing else', MS.filter(x => x.boss).every(x => x.day === 30 && !x.build && !x.skills.length));
  const runs = R.BUILDS.map(b => MS.filter(x => x.build?.id === b.id));
  ok('all 28 builds are scheduled', runs.every(r => r.length >= 2));
  ok('every build ships last, in its own month', runs.every((r, i) => r.at(-1).build.kind === 'ship' && r.at(-1).month === R.BUILDS[i].month));
  ok('every step has something to do', MS.filter(x => x.build).every(x => RP.stepLine(x.build).length > 10));
  ok('the check grows each month', R.MONTHS.every((m, i) => !i || RP.checkBudget(m.n) > RP.checkBudget(m.n - 1)));
}

group('the programming plan');
{
  const MS = CP.MISSIONS;
  ok('120 missions, 30 a month', MS.length === 120 && CP.MONTHS.every(m => MS.filter(x => x.month === m.n).length === 30));
  const intro = MS.flatMap(x => x.skills);
  ok('every DSA skill is introduced exactly once', intro.length === CS.SKILLS.length && new Set(intro).size === CS.SKILLS.length);
  ok('a skill is introduced in its own month', MS.every(x => x.skills.every(id => CS.skillById(id).month === x.month)));
  ok('each 30th day is the month\'s contest', MS.filter(x => x.boss).map(x => x.n).join() === '30,60,90,120'
    && CP.MONTHS.every(m => Con.contestById(m.contest)));
  const CF_TAGS = new Set(['implementation', 'brute force', 'sortings', 'strings', 'binary search', 'two pointers', 'greedy',
    'constructive algorithms', 'number theory', 'math', 'bitmasks', 'data structures', 'hashing', 'graphs', 'dfs and similar',
    'shortest paths', 'dsu', 'trees', 'dp', 'combinatorics', 'probabilities', 'games', 'geometry', 'divide and conquer',
    'meet-in-the-middle', 'interactive']);
  ok('every solve tag is a real Codeforces tag', MS.every(x => x.tag === null || CF_TAGS.has(x.tag)));
  ok('every non-contest day asks for at least one solve', MS.filter(x => !x.boss).every(x => x.count >= 1));
  ok('every link is https', MS.flatMap(x => x.links).every(l => /^https:\/\//.test(l.url)));
}

group('DSA answers against brute force');
{
  const rng = Q.seeded(77), N = s => (s.match(/-?\d+/g) || []).map(Number);
  const draw = (id, test) => { for (let i = 0; i < 150; i++) { const q = Q.generate(id, rng); if (q.kind === 'num' && !test(q)) return q.q; } return null; };
  const pairs = text => [...text.matchAll(/\((\d+), (\d+)\)/g)].map(m => [+m[1], +m[2]]);

  let bad = draw('knapsack', q => {
    const W = +q.q.match(/capacity (\d+)/)[1], items = pairs(q.q);
    let best = 0;
    for (let m = 0; m < 1 << items.length; m++) {
      let w = 0, v = 0; items.forEach(([iw, iv], i) => { if (m >> i & 1) { w += iw; v += iv; } });
      if (w <= W) best = Math.max(best, v);
    }
    return best === q.answer;
  });
  ok('knapsack matches trying every subset', !bad, bad);

  bad = draw('lis', q => {
    const a = N(q.q.match(/\[(.*)\]/)[1]); let best = 0;
    for (let m = 1; m < 1 << a.length; m++) {
      const s = a.filter((_, i) => m >> i & 1);
      if (s.every((x, i) => !i || x > s[i - 1])) best = Math.max(best, s.length);
    }
    return best === q.answer;
  });
  ok('LIS matches trying every subsequence', !bad, bad);

  bad = draw('intervals', q => {
    const iv = [...q.q.matchAll(/\[(\d+), (\d+)\]/g)].map(m => [+m[1], +m[2]]); let best = 0;
    for (let m = 1; m < 1 << iv.length; m++) {
      const s = iv.filter((_, i) => m >> i & 1).sort((x, y) => x[0] - y[0]);
      if (s.every((x, i) => !i || x[0] >= s[i - 1][1])) best = Math.max(best, s.length);
    }
    return best === q.answer;
  });
  ok('interval scheduling matches trying every subset', !bad, bad);

  const edges = text => [...text.matchAll(/(\d+)–(\d+)(?: \((\d+)\))?/g)].map(m => [+m[1], +m[2], m[3] ? +m[3] : 1]);
  bad = draw('dijkstra', q => {
    const es = edges(q.q.split('Edges')[1]), n = 6, d = Array.from({ length: n + 1 }, (_, i) => Array(n + 1).fill(i ? Infinity : 0));
    for (let i = 1; i <= n; i++) d[i][i] = 0;
    for (const [u, v, w] of es) { d[u][v] = Math.min(d[u][v], w); d[v][u] = Math.min(d[v][u], w); }
    for (let k = 1; k <= n; k++) for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    return d[1][6] === q.answer;
  });
  ok('Dijkstra matches Floyd–Warshall', !bad, bad);

  bad = draw('mst', q => {
    const n = +q.q.match(/on 1\.\.(\d+)/)[1], es = edges(q.q.split('Edges')[1]);
    let best = Infinity;
    for (let m = 0; m < 1 << es.length; m++) {
      const pick = es.filter((_, i) => m >> i & 1);
      if (pick.length !== n - 1) continue;
      const p = Array.from({ length: n + 1 }, (_, i) => i), f = x => (p[x] === x ? x : (p[x] = f(p[x])));
      let ok2 = true; for (const [u, v] of pick) { if (f(u) === f(v)) { ok2 = false; break; } p[f(u)] = f(v); }
      if (ok2) best = Math.min(best, pick.reduce((s2, e) => s2 + e[2], 0));
    }
    return best === q.answer;
  });
  ok('MST matches trying every spanning tree', !bad, bad);

  bad = draw('gridpaths', q => {
    const [R2, C2] = N(q.q.match(/A (\d+) × (\d+)/)[0]), blocked = new Set(pairs(q.q.split('Blocked')[1]).map(([r, c]) => `${r},${c}`));
    const walk = (r, c) => (r > R2 || c > C2 || blocked.has(`${r},${c}`) ? 0 : r === R2 && c === C2 ? 1 : walk(r + 1, c) + walk(r, c + 1));
    return walk(1, 1) === q.answer;
  });
  ok('grid paths match walking every path', !bad, bad);

  bad = draw('inversions', q => {
    const a = N(q.q.match(/\[(.*)\]/)[1]); let c = 0;
    const sort = x => { if (x.length < 2) return x; const m = x.length >> 1, l = sort(x.slice(0, m)), r = sort(x.slice(m)), o = [];
      while (l.length && r.length) { if (r[0] < l[0]) { c += l.length; o.push(r.shift()); } else o.push(l.shift()); } return [...o, ...l, ...r]; };
    sort(a); return c === q.answer;
  });
  ok('inversions match a merge-sort count', !bad, bad);

  bad = draw('stairs', q => {
    const n = +q.q.match(/climb (\d+)/)[1], steps = N(q.q.match(/taking (.*) at a time/)[1]);
    const ways = k => (k === 0 ? 1 : k < 0 ? 0 : steps.reduce((s2, st) => s2 + ways(k - st), 0));
    return ways(n) === q.answer;
  });
  ok('stair counts match recursion', !bad, bad);

  bad = draw('lca', q => {
    const p = {}; for (const [, c, par] of q.q.matchAll(/p\((\d+)\) = (\d+)/g)) p[+c] = +par;
    const [u, v] = N(q.q.match(/of (\d+) and (\d+)\?/)[0]);
    const up = x => { const a = [x]; while (a.at(-1) !== 1) a.push(p[a.at(-1)]); return a; };
    return up(u).find(x => up(v).includes(x)) === q.answer;
  });
  ok('LCA matches walking both paths up', !bad, bad);

  bad = draw('modinv', q => { const [a, p] = N(q.q); return (a * q.answer) % p === 1; });
  ok('every modular inverse really is one', !bad, bad);
}

group('GitHub: reading a folder name');
for (const [input, want] of [
  ['tester/bench', 'tester|bench|'],
  ['tester/bench/m1/divider', 'tester|bench|m1/divider'],
  ['https://github.com/tester/bench/tree/main/m1/divider', 'tester|bench|m1/divider'],
  ['https://github.com/tester/bench.git', 'tester|bench|'],
]) {
  const t = GH.parseRepo(input);
  ok(`${input}`, t && `${t.owner}|${t.repo}|${t.path}` === want);
}
ok('rubbish is rejected', GH.parseRepo('not a repo') === null && GH.parseRepo('') === null);

group('GitHub: reading a write-up');
{
  const md = `# Divider\n![board](board.jpg)\n\nhttps://github.com/user-attachments/assets/12ab-34cd\n\n## What broke\nThe LED was in backwards.`;
  const m = GH.countMedia(md);
  ok('an image and a dropped-in video are both counted', m.images === 1 && m.videos === 1);
  ok('a GIF counts as video, once', GH.countMedia('![run](run.gif)').videos === 1 && GH.countMedia('![run](run.gif)').images === 0);
  ok('"## What broke" is found', GH.hasBrokeSection(md));
  ok('"**Debugging**" as a bold line is found', GH.hasBrokeSection('text\n**Debugging notes**\nmore'));
  ok('the word "broke" in a sentence is not a section', !GH.hasBrokeSection('It never broke once.'));
  ok('code blocks do not count as write-up', GH.wordCount('```\n' + 'word '.repeat(500) + '\n```\nfour real words here') === 4);
  ok('media in the first lines counts as "at the top"', GH.mediaNearTop(md) && !GH.mediaNearTop('a\n'.repeat(30) + '![x](y.png)'));
}

group('GitHub: build proof patterns');
{
  const need = (id, label) => R.buildById(id).proof.readme.find(r => r.label.startsWith(label)).re;
  const ohms = need('b02', 'Five');
  ok('five resistor readings are counted', GH.countMatches('220 Ω, 4.7kΩ, 10k ohm, 1M, 330 ohms', ohms) === 5);
  ok('"10 km" and "5 Mbps" are not resistances', GH.countMatches('10 km and 5 Mbps', ohms) === 0);
  ok('voltages are counted', GH.countMatches('calculated 2.27 V, measured 2.3V', need('b01', 'Two voltages')) === 2);
  ok('backlash in degrees or arcmin', GH.countMatches('about 1.5° of play', need('b13', 'Backlash')) === 1
    && GH.countMatches('12 arcmin', need('b13', 'Backlash')) === 1);
  ok('Kp and Kd are separate checks', need('b09', 'Your prop').test('Kp = 0.8') && !need('b09', 'Your deriv').test('Kp = 0.8'));
  ok('two success rates for the ACT build', GH.countMatches('went from 46% to 78.5 %', need('b25', 'Success')) === 2);
}


/* A fake GitHub. Files are { path: content }; the README for a folder is its README.md. */
function fakeGitHub({ owner = 'tester', repo = 'bench', priv = false, files = {}, commits = 5, limited = false, offline = false }) {
  const b64 = s => Buffer.from(s, 'utf8').toString('base64');
  const json = (status, body, headers = {}) => ({
    status, ok: status >= 200 && status < 300, json: async () => body,
    headers: { get: k => headers[k.toLowerCase()] ?? null },
  });
  return async url => {
    if (offline) throw new TypeError('Failed to fetch');
    if (limited) return json(403, {}, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 600) });
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);        // repos, owner, repo, ...
    if (parts[1] !== owner || parts[2] !== repo) return json(404, {});
    const rest = parts.slice(3);
    if (!rest.length) return json(200, { private: priv, owner: { login: owner }, default_branch: 'main' });
    if (rest[0] === 'readme') {
      const dir = rest.slice(1).map(decodeURIComponent).join('/');
      const content = files[(dir ? dir + '/' : '') + 'README.md'];
      return content == null ? json(404, {}) : json(200, { content: b64(content) });
    }
    if (rest[0] === 'contents') {
      const content = files[rest.slice(1).map(decodeURIComponent).join('/')];
      return content == null ? json(404, {}) : json(200, { content: b64(content) });
    }
    if (rest[0] === 'git') return json(200, { tree: Object.keys(files).map(path => ({ path, type: 'blob' })) });
    if (rest[0] === 'commits') {
      const author = u.searchParams.get('author');
      return json(200, author === owner ? Array.from({ length: commits }, (_, i) => ({ sha: String(i) })) : []);
    }
    return json(404, {});
  };
}

const goodB01 = `# A divider, then a transistor switch

![falstad screenshot](shot.png)

I built a voltage divider from a 10k and a 4.7k resistor across 5 V. By hand I got 1.60 V; Falstad showed 1.6 V,
which matched once I stopped reading the wrong node. Then I added an NPN transistor so a logic pin can switch an LED
that draws more current than the pin could supply on its own. The base resistor was the part I had to think about,
because without it the pin would try to push far too much current straight into the base and the LED would flicker
whenever the input floated between states. I wrote down every value I tried and what the simulator did with it, so
the next time I build this on a real breadboard I already know which numbers to start from and what to measure first.

## What broke
The LED stayed dark: I had the transistor's emitter and collector the wrong way round, so nothing conducted at all.`;


group('GitHub: verifying a build');
{
  const b01 = R.buildById('b01');
  const target = { owner:'tester', repo:'bench', path:'m1/divider' };
  const files = { 'm1/divider/README.md': goodB01, 'm1/divider/circuit.txt': 'x' };

  let r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files }) });
  ok('a complete write-up passes every check', r.ok && r.verified, r.checks?.filter(c => !c.pass).map(c => c.label).join(', '));
  ok('it records the link and the commit count', r.meta.url.includes('tester/bench') && r.meta.commits === 5);

  r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files: { 'm1/divider/README.md': goodB01.replace('## What broke', '## Notes') } }) });
  const failed = r.checks.filter(c => !c.pass).map(c => c.label);
  ok('no "what broke" section fails exactly that check', !r.verified && failed.length === 1 && /what broke/.test(failed[0]));

  r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files, commits: 1 }) });
  ok('one finished-demo commit is not enough', !r.verified && r.checks.some(c => /commits/.test(c.label) && !c.pass));

  r = await GH.verifyBuild(b01, { ...target, owner:'someone' }, { user:'tester', fetchImpl: fakeGitHub({ owner:'someone', files }) });
  ok('someone else\'s repo fails ownership and stops there', !r.verified && r.checks.length === 1 && /belongs to someone/.test(r.checks[0].detail));

  r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files, priv: true }) });
  ok('a private repo is refused', !r.verified && /private/.test(r.checks[0].detail));

  r = await GH.verifyBuild(b01, target, { user:'tester', usedBy:['tester/bench/m1/divider'], fetchImpl: fakeGitHub({ files }) });
  ok('a folder already used by another build is refused', !r.verified && r.checks.some(c => /another build/.test(c.label) && !c.pass));

  r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files, limited: true }) });
  ok('a rate limit is an error, not a failed check', !r.ok && /hourly limit/.test(r.error));

  r = await GH.verifyBuild(b01, target, { user:'tester', fetchImpl: fakeGitHub({ files, offline: true }) });
  ok('being offline is an error, not a failed check', !r.ok && /reach GitHub/.test(r.error));

  r = await GH.verifyBuild(b01, target, { user:'TESTER', fetchImpl: fakeGitHub({ files }) });
  ok('usernames match regardless of case', r.checks[0].pass);
}

group('GitHub: file and forbid checks');
{
  const b15 = R.buildById('b15');
  const readme = goodB01.replace('# A divider', '# ROS graph') + '\n\nRecorded with ros2 bag and replayed it.';
  const pkg = { 'ros/README.md': readme, 'ros/package.xml': '', 'ros/msg/Reading.msg': '', 'ros/srv/Config.srv': '', 'ros/launch/graph.launch.py': '' };
  let r = await GH.verifyBuild(b15, { owner:'tester', repo:'bench', path:'ros' }, { user:'tester', fetchImpl: fakeGitHub({ files: pkg }) });
  ok('a real ROS 2 package passes', r.verified, r.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  const noSrv = { ...pkg }; delete noSrv['ros/srv/Config.srv'];
  r = await GH.verifyBuild(b15, { owner:'tester', repo:'bench', path:'ros' }, { user:'tester', fetchImpl: fakeGitHub({ files: noSrv }) });
  ok('a missing .srv is caught', !r.verified && r.checks.some(c => /\.srv/.test(c.label) && !c.pass));
  r = await GH.verifyBuild(b15, { owner:'tester', repo:'bench', path:'ros' }, { user:'tester',
    fetchImpl: fakeGitHub({ files: { ...pkg, 'ros/README.md': readme + '\nRun catkin_make first.' } }) });
  ok('ROS 1 in the write-up fails the build', !r.verified && r.checks.some(c => /ROS 1/.test(c.label) && !c.pass));
  r = await GH.verifyBuild(b15, { owner:'tester', repo:'bench', path:'ros' }, { user:'tester',
    fetchImpl: fakeGitHub({ files: { ...pkg, 'other/x.srv': '' } }) });
  ok('files outside the folder do not count for it', r.verified);
}

group('GitHub: the interview write-up');
{
  const b28 = R.buildById('b28');
  const qa = Array.from({ length: 10 }, (_, i) => `### Why did you pick gain ${i}?\nBecause the step response at that value settled fastest without ringing, which I checked on the plot twice over. Lower values drifted under load and higher ones oscillated once the battery sagged below nominal.`).join('\n\n');
  const r = await GH.verifyBuild(b28, { owner:'tester', repo:'bench', path:'' }, { user:'tester', fetchImpl: fakeGitHub({ files: { 'INTERVIEW.md': qa } }) });
  ok('ten answered questions in INTERVIEW.md pass', r.verified, r.checks.filter(c => !c.pass).map(c => c.label).join(', '));
}


/* ============================ programming: tree =========================== */
group('programming: the tree');
{
  const dp = T.topicById('dp');
  const p = T.topicProgress(dp, [solve('a', 900, ['dp']), solve('b', 1300, ['dp']), solve('c', 1600, ['dp']), solve('d', 2200, ['dp']), solve('e', null, ['dp'])]);
  ok('a hard solve counts towards every tier below it', p.tiers[0].solved === 4 && p.tiers[1].solved === 3);
  ok('unrated solves count towards no tier', p.tiers[0].solved === 4);
  ok('a tier clears at its threshold, the next one stays open', p.tiers[1].cleared && !p.tiers[2].cleared && p.next.n === 3);
  ok('every topic carries a real Codeforces tag', T.TOPICS.every(t => typeof t.cf === 'string' && t.cf.length));
}

group('programming: solve accounting');
reset();
{
  let r = Ca.applySolves([solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp'])]);
  const xp1 = St.S.xp;
  ok('new problems are credited and pay', r.fresh.length === 3 && xp1 > 0);
  ok('a cleared tier is reported', r.newTiers.length >= 1);
  r = Ca.applySolves([solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp'])]);
  ok('re-syncing identical data credits and pays nothing', r.fresh.length === 0 && r.newTiers.length === 0 && St.S.xp === xp1);
  r = Ca.applySolves([solve('p1', 900, ['dp']), solve('p2', 1300, ['dp']), solve('p3', 1500, ['dp']), solve('p4', 1700, ['dp'])]);
  ok('a genuinely new problem is credited once', r.fresh.length === 1 && St.S.xp > xp1);
  ok('harder problems are worth more', CM.solveXp(2000) > CM.solveXp(1200) && CM.solveXp(1200) > CM.solveXp(800));
  ok('a solve today makes the day count for the shared streak', St.dayIsActive() && St.S.streak.current === 1);
}

group('shared: GitHub commits');
reset();
{
  const pushes = [{ id:'e1', repo:'me/a', commits:3, at:now(), day:day(0) }, { id:'e2', repo:'me/a', commits:2, at:now() - 86400, day:day(1) }];
  let g = St.applyPushes(pushes);
  ok('pushes are credited by commit count', g.commits === 5 && St.S.stats.commits === 5);
  g = St.applyPushes(pushes);
  ok('the same events are never counted twice', g.fresh.length === 0 && St.S.stats.commits === 5);
}

group('programming: contests');
reset();
{
  Ca.applySolves([solve('old', 1500, ['dp'], 3)]);
  Ca.startContest('warmup');
  ok('work done before the clock does not count', Ca.activeContest().solved === 0);
  Ca.applySolves([solve('old', 1500, ['dp'], 3), solve('n1', 900, ['math'], 0, now() + 5), solve('n2', 1000, ['greedy'], 0, now() + 10)]);
  ok('in-window solves count and meet the target', Ca.activeContest().solved === 2 && Ca.activeContest().won);
  const done = Ca.finishContest();
  ok('a win is banked, pays the full purse and drops desk gear',
    St.S.tracks.cp.contests.warmup.won && done.reward.xp >= Con.contestById('warmup').xp && done.drop?.set === 'desk');
  reset(); Ca.startContest('ladder');
  Ca.applySolves([solve('lo', 900, ['dp'], 0, now() + 5)]);
  ok('a solve below the rating floor never counts', Ca.activeContest().solved === 0);
  ok('only one contest runs at a time', Ca.startContest('sprint') === null);
  const late = Con.settle(Con.contestById('warmup'), Date.now() - 10 * 3600 * 1000, [solve('late', 1000, ['dp'], 0, now())], new Set());
  ok('a solve after the window closes does not count', late.solved === 0 && late.expired);
}

/* ============================ robotics: sessions ========================== */
group('robotics: the daily mission');
reset();
{
  const rng = Q.seeded(42);
  const today = G.dayKey();
  const m1 = Ro.mission();
  ok('it starts at mission 1, on Ohm\'s law and dividers', m1.n === 1 && !m1.done && m1.skills.join() === 'ohm,divider');
  const a = Ro.startMission(today, rng);
  ok('its check starts today\'s new skills at level 1', a.groups.every(g => g.isNew && g.level === 1) && a.groups.map(g => g.skill).join() === m1.skills.join());
  ok('level 1 asks two questions a skill, with three minutes each for a number', a.qs.length === 2 * a.groups.length && a.qs.filter(q => q.kind === 'num').every(q => q.secs === 180));
  ok('starting again resumes rather than rerolling', Ro.startMission(today, rng) === a);
  Ro.markShown(1000); Ro.markShown(5000);
  ok('a question\'s clock starts once, and a reload does not restart it', a.qStartedAt === 1000);
  a.qStartedAt = Date.now() - 1000 * (a.qs[0].secs + 30);
  const late = Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  ok('a right answer given after time is up counts as wrong', !late.correct);
  while (!Ro.sessionOver()) { Ro.markShown(); Ro.answer(rightAnswer(Ro.currentQuestion()), rng); }
  const s = Ro.finishSession(rng);
  const [g1, g2] = s.groups;
  ok('the skill with a miss stays at level 1', g1.to === 1 && g1.move === 0);
  ok('a clean skill goes up to level 2', !g2 || (g2.to === 2 && Ro.skillLevel(g2.skill) === 2));
  ok('the mission is recorded as done today', Ro.missionsDone() === 1 && Ro.missionDoneToday() && St.S.tracks.robotics.missions[1] === today);
  ok('and its check is recorded against it', St.S.tracks.robotics.checks[1]?.total === 4);
  ok('it counts for the shared streak', St.S.streak.current === 1 && St.dayIsActive());
  ok('the skill score is logged for the day', St.S.tracks.robotics.scores[today] === Ro.skillScore() && s.scoreTo === Ro.skillScore());
  ok('a second mission the same day is refused', Ro.startMission(today) === null);
  ok('today still shows mission 1, done', Ro.mission().n === 1 && Ro.mission().done);

  const tomorrow = G.addDays(today, 3);  // three days later: nothing is skipped
  const b = Ro.startMission(tomorrow, rng);
  ok('a missed day skips nothing: the next one is mission 2', b.n === 2);
  ok('its check brings back yesterday\'s skills as well as today\'s new ones',
    b.groups.some(g => !g.isNew) && Ro.mission(tomorrow).skills.every(id => b.groups.some(g => g.skill === id)));
  while (!Ro.sessionOver()) Ro.answer(wrongAnswer(Ro.currentQuestion()), rng);
  const bad = Ro.finishSession(rng);
  ok('a bad day still counts as done, and levels drop where they should', Ro.missionsDone() === 2 && bad.groups.every(g => g.to === Math.max(1, g.level - (g.n >= 2 ? 1 : 0))));
}

group('robotics: practice');
{
  const rng = Q.seeded(9);
  const before = Ro.skillLevel('ohm');
  Ro.startPractice('lipo', undefined, rng);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  Ro.finishSession();
  ok('practice starts a skill you had not met, at level 1', Ro.skillLevel('lipo') === 1);
  for (let k = 0; k < 8; k++) { Ro.startPractice('ohm', undefined, rng); while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng); Ro.finishSession(); }
  ok('practice never moves a level', Ro.skillLevel('ohm') === before);
  ok(`practice XP stops at ${Ro.XP.practiceCap} a day`, Ro.roboDay().practiceXp === Ro.XP.practiceCap);
  ok('practice for a locked month is refused', Ro.startPractice('fk') === null);
}

group('robotics: months opening');
ok('day 0: month 1 only', LP.unlockedMonths('2026-09-01', '2026-09-01').join() === '1');
ok('day 30: month 2 by date', LP.unlockedMonths('2026-09-01', '2026-10-01').join() === '1,2');
ok('mission 31: month 2, whatever the date', LP.unlockedMonths('2026-09-01', '2026-09-02', {}, 31).join() === '1,2');
ok('beating boss 1 opens month 2 early', LP.unlockedMonths('2026-09-01', '2026-09-05', { 1:true }).join() === '1,2');
ok('boss 2 cannot open month 3 while month 2 is shut', LP.unlockedMonths('2026-09-01', '2026-09-05', { 2:true }).join() === '1');
ok('four months at most', LP.unlockedMonths('2026-01-01', '2026-12-31').join() === '1,2,3,4');

group('robotics: bosses');
{
  const m1 = Sk.skillsIn(1).map(s => s.id);
  for (const id of m1) delete St.S.tracks.robotics.skills[id];
  ok('not ready until every skill has been met', !Ro.bossReady(1).ok);
  for (const id of m1) St.S.tracks.robotics.skills[id] = { level:1, due:'2099-01-01', seen:1, right:1, wrong:0, hist:[] };
  ok('not ready without a verified build', !Ro.bossReady(1).ok && /build/.test(Ro.bossReady(1).why));
  Ro.applyVerification('b02', { owner:'t', repo:'r', path:'m' }, { ok:true, verified:true, checks:[], meta:{ mediaTop:true } });
  ok('ready once both are true', Ro.bossReady(1).ok);
  const rng = Q.seeded(5);
  Ro.startBoss(1, undefined, rng);
  Ro.answer(wrongAnswer(Ro.currentQuestion()), rng); Ro.answer(null, rng);
  ok('a wrong answer and a timeout each cost a heart', St.S.active.hearts === Boss.BOSS_HEARTS - 2);
  ok('walking away is a loss, one attempt a day', !Ro.abandonSession().won && !Ro.bossReady(1).ok);
  St.S.tracks.robotics.bosses[1].lastTry = '2000-01-01';
  Ro.startBoss(1, undefined, rng);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  const won = Ro.finishSession(rng);
  ok('eight straight right answers bring it down', won.won && won.results.length <= 8);
  ok('a boss drops rare-or-better bench gear', won.drop && L.RARITY[won.drop.rarity].rank >= 1 && won.drop.set === 'bench');
  ok('and month 2 opens today', Ro.isUnlocked(2));

  // Boss day: mission 30 is the fight itself when the boss is ready.
  delete St.S.tracks.robotics.bosses[1];
  St.S.tracks.robotics.missions = Object.fromEntries(Array.from({ length: 29 }, (_, i) => [i + 1, '2000-01-01']));
  const f = Ro.startMission(undefined, rng);
  ok('mission 30 is the month\'s boss fight', f.mode === 'boss' && f.mission === 30 && f.month === 1);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  Ro.finishSession(rng);
  ok('fighting it completes the mission', Ro.missionsDone() === 30 && Ro.missionDoneToday());
}

group('robotics: paying for builds');
{
  const pass = { ok:true, verified:true, checks:[{ label:'x', pass:true }], meta:{ url:'u', mediaTop:true } };
  const xp0 = St.S.xp;
  ok('the first pass pays out', Ro.applyVerification('b01', { owner:'t', repo:'b', path:'d' }, pass).newly && St.S.xp > xp0);
  const xp1 = St.S.xp;
  ok('a second pass pays nothing more', !Ro.applyVerification('b01', { owner:'t', repo:'b', path:'d' }, pass).newly && St.S.xp === xp1);
  Ro.applyVerification('b01', { owner:'t', repo:'b', path:'d' }, { ok:true, verified:false, checks:[{ label:'x', pass:false }], meta:{} });
  ok('a failing re-check keeps it verified, and shows the failure', Ro.isVerified('b01') && St.S.tracks.robotics.builds.b01.lastPassed === false);
  ok('the claimed folder is excluded from other builds', Ro.claimedTargets('b03').includes('t/b/d'));
}

/* ========================== programming: missions ========================= */
group('programming: the daily mission');
reset();
{
  const rng = Q.seeded(21), key = G.dayKey();
  Ca.linkCodeforces({ handle: 'tester', rating: null });
  const m = Ca.mission();
  ok('it starts at mission 1, on complexity', m.n === 1 && m.skills.join() === 'bigo,ops' && m.tag === 'implementation');
  ok('an unrated beginner starts at 800', Ca.targetFor('implementation') === 800);
  const tagged = (k, rating, tags = ['implementation']) => ({ key: k, name: k, contestId: 1, index: k, rating, tags, at: now(), day: key });

  Ca.applySolves([tagged('A1', 800), tagged('A2', 900)]);
  ok('solving first is not enough: the check is half the mission', !Ca.mission().done);
  Ca.startMission(key, rng);
  while (!E.sessionOver()) E.answer(rightAnswer(E.currentQuestion()), rng);
  const s = E.finishSession(rng);
  ok('the check then finishes it, because the judge already accepted two', s.completed && Ca.mission().done && Ca.missionsDone() === 1);
  ok('and the level for that tag goes up 100', Ca.targetFor('implementation') === 900);

  // Next day: check first, then the judge.
  const k2 = G.addDays(key, 1), rng2 = Q.seeded(22);
  const m2 = E.mission('cp', k2);
  ok('the next day is mission 2', m2.n === 2 && !m2.done);
  E.startMission('cp', k2, rng2);
  while (!E.sessionOver()) E.answer(rightAnswer(E.currentQuestion()), rng2);
  const s2 = E.finishSession(rng2);
  ok('a check alone leaves the mission waiting on the solves', !s2.completed && E.mission('cp', k2).check && !E.mission('cp', k2).done);
  ok('a second check that day is refused', E.startMission('cp', k2) === null);
  St.S.tracks.cp.solved.push({ ...tagged('B1', 700), day: k2 });
  ok('a problem below your level does not count', !Ca.settleMission(k2));
  St.S.tracks.cp.solved.push({ ...tagged('B2', 900), day: k2 }, { ...tagged('B3', 1000, ['implementation', 'math']), day: k2 });
  ok('two at or above it do', Ca.settleMission(k2) && E.mission('cp', k2).done);

  const before = Ca.targetFor('math');
  Ca.lowerTarget('math');
  ok('"too hard today" drops a tag\'s level by 100, never below 800', Ca.targetFor('math') === Math.max(800, before - 100));
  for (let i = 0; i < 20; i++) Ca.lowerTarget('math');
  ok('and stops at 800', Ca.targetFor('math') === 800);
}

group('programming: a rated player starts near their rating');
reset();
{
  Ca.linkCodeforces({ handle: 'strong', rating: 1900 });
  Ca.applySolves([solve('x1', 2400, ['dp'], 3), solve('x2', 900, ['implementation'], 3)]);
  ok('never more than 100 above the rating', Ca.targetFor('dp') === 2000);
  ok('never more than 300 below it', Ca.targetFor('implementation') === 1600);
  ok('a tag never solved starts from the rating too', Ca.targetFor('geometry') === 1600);
}

group('programming: the contest day');
reset();
{
  Ca.linkCodeforces({ handle: 'tester', rating: null });
  St.S.tracks.cp.missions = Object.fromEntries(Array.from({ length: 29 }, (_, i) => [i + 1, '2000-01-01']));
  const m = Ca.mission();
  ok('mission 30 is the month\'s contest, with no check', m.boss && Ca.contestFor(m).id === 'warmup' && Ca.startMission() === null);
  Ca.startContest('warmup');
  Ca.finishContest();
  ok('finishing the contest — even lost — completes the mission', Ca.mission().done && Ca.missionsDone() === 30);
}

group('testing out of a week');
reset();
{
  const rng = Q.seeded(31);
  const t = Ro.testOut(1);
  ok('week 1 can be tested out of', t.ok && t.skills.length >= 2 && t.left.length === 7);
  Ro.startTestOut(1, undefined, rng);
  ok('six questions, at level 4 timing', St.S.active.qs.length === E.TEST_OUT.questions && St.S.active.qs.filter(q => q.kind === 'num').every(q => q.secs === G.LEVELS[4][1]));
  let k = 0;
  while (!E.sessionOver()) E.answer(k++ === 0 ? wrongAnswer(E.currentQuestion()) : rightAnswer(E.currentQuestion()), rng);
  const s = E.finishSession(rng);
  ok('five of six passes', s.passed && s.skipped === 7);
  ok('the week is skipped: today\'s mission is now day 8', Ro.mission().n === 8 && !Ro.mission().done);
  ok('skipping does not use up the day', !Ro.missionDoneToday() && Ro.startMission() !== null);
  E.abandonSession(); St.S.active = null;
  ok('the week\'s skills start at level 3', t.skills.every(id => Ro.skillLevel(id) >= 3));
  ok('the same week cannot be tried twice in a day', Ro.startTestOut(2, undefined, rng) !== null && (E.abandonSession(), St.S.active = null, true));

  reset();
  Ro.startTestOut(1, undefined, rng);
  while (!E.sessionOver()) E.answer(wrongAnswer(E.currentQuestion()), rng);
  const f = E.finishSession(rng);
  ok('a failed test skips nothing', !f.passed && Ro.mission().n === 1);
  ok('and waits until tomorrow', Ro.startTestOut(1) === null && Ro.testOut(1).triedToday);
  ok('a week with fewer than two new skills cannot be tested out of', !Ro.testOut(5).ok);
}

group('pace: the same plan over 4, 6, 8 or 12 months');
reset();
{
  const d0 = G.dayKey(), at = n => G.addDays(d0, n), rng = Q.seeded(41);
  const doMission = key => { E.startMission('robotics', key, rng); while (!E.sessionOver()) E.answer(rightAnswer(E.currentQuestion()), rng); return E.finishSession(rng); };
  ok('four months by default: every day is a mission day', E.paceOf('robotics').months === 4 && E.paceInfo('robotics').missionDay);
  const f4 = E.paceInfo('robotics').finish;
  ok('only 4, 6, 8 and 12 are paces', !E.setPace('robotics', 5) && E.setPace('robotics', 12, d0));
  const f12 = E.paceInfo('robotics', d0).finish;
  ok('twelve months ends about three times later', G.daysBetween(d0, f12) >= 3 * G.daysBetween(d0, f4) - 3);
  ok('day 1 at twelve months is a mission day', E.paceInfo('robotics', d0).missionDay);
  doMission(d0);
  ok('the next two days are keep-going days', !E.paceInfo('robotics', at(1)).missionDay && !E.paceInfo('robotics', at(2)).missionDay);
  ok('and the third brings the next mission', E.paceInfo('robotics', at(3)).missionDay);

  const r = E.startReview('robotics', at(1), rng);
  ok('a keep-going day has a review of what is due', r && r.mode === 'review' && r.groups.every(g => g.from >= 1));
  while (!E.sessionOver()) E.answer(rightAnswer(E.currentQuestion()), rng);
  const rev = E.finishSession(rng);
  ok('it moves levels like a mission, but uses up no mission', rev.groups.some(g => g.move > 0) && E.missionsDone('robotics') === 1);
  ok('it keeps the streak going', St.dayIsActive(at(1)));
  ok('one review a day', E.startReview('robotics', at(1)) === null);

  const early = doMission(at(2));
  ok('you can still do the next mission early', early.completed && E.missionsDone('robotics') === 2);
  ok('which puts you ahead: the next mission day moves later', !E.paceInfo('robotics', at(3)).missionDay && E.paceInfo('robotics', at(6)).missionDay);

  const done = E.missionsDone('robotics');
  E.setPace('robotics', 4, at(3));
  ok('changing pace keeps every mission done', E.missionsDone('robotics') === done && E.paceInfo('robotics', at(3)).missionDay);
  E.setPace('robotics', 6, at(3));
  ok('a new pace counts from your last mission: a day and a half after it at six months',
    !E.paceInfo('robotics', at(3)).missionDay && E.paceInfo('robotics', at(4)).missionDay);
  E.setPace('robotics', 12, at(3)); E.setPace('robotics', 6, at(3)); E.setPace('robotics', 12, at(3));
  ok('so switching back and forth never hands out an extra mission', !E.paceInfo('robotics', at(3)).missionDay);
  ok('each track has its own pace', E.paceOf('cp').months === 4 && E.paceOf('robotics').months === 12);
}

/* ============================== shared: timer ============================= */
group('shared: the focus timer');
reset();
{
  const realNow = Date.now; let offset = 0;
  Date.now = () => realNow() + offset;
  St.timerStart('cp:dp'); offset += 30 * 1000;
  ok('under a minute logs nothing', St.timerStop().min === 0 && St.getDay().timerMin === 0);
  St.timerStart('robotics:b05'); offset += 50 * 60 * 1000;
  const r = St.timerStop();
  ok('fifty minutes logs fifty, tagged', r.min === 50 && St.getDay().timerMin === 50 && St.getDay().timerTagged === 50);
  ok('twenty timed minutes make the day count', St.dayIsActive());
  St.timerStart(); offset += 9 * 3600 * 1000;
  ok(`a forgotten nine-hour timer counts ${St.MAX_SESSION_MIN} minutes at most`, St.timerStop().min === St.MAX_SESSION_MIN);
  ok('timer XP stops at 1.5× the daily goal', St.getDay().timerXp === St.timerCap());
  St.timerStart(); offset += 3600 * 1000;
  ok('you can trim a session down', St.timerStop(20).min === 20);
  St.timerStart(); offset += 600 * 1000;
  ok('but never up', St.timerStop(500).min === 10);
  Date.now = realNow;
  ok('there is no function anywhere to type in minutes or claim a solve', !('logSession' in St) && !('logNote' in St));
}

group('shared: streak');
reset();
{
  ok('an empty day does not count', !St.dayIsActive());
  St.S.streak = { current:5, best:5, lastActive: day(3), freezes:2 };
  St.auditStreak();
  ok('freezes cover a gap', St.S.streak.current === 5 && St.S.streak.freezes === 0);
  St.S.streak = { current:9, best:9, lastActive: day(6), freezes:0 };
  St.auditStreak();
  ok('too long a gap breaks it', St.S.streak.current === 0);
}

/* ============================== shared: quests ============================ */
group('shared: quests across tracks');
{
  const ctx = (patch = {}) => ({ key:'2026-10-10', day:{ timerMin:90, timerTagged:90, claimed:[] },
    cp:{ solved:4, ratedSolved:4, bestRating:2000, tags:3 },
    robo:{ mission:{ score:9, total:9 }, ups:2, bestRun:5, answered:15, correct:15, practiceCorrect:10 },
    commits:3, rating:2000, github:true, usable:['cp', 'robotics'], ...patch });
  const c = ctx();
  ok('every quest in every pool can be finished in one day', Qs.QUESTS.every(q => q.value(c) >= q.goal), Qs.QUESTS.filter(q => q.value(c) < q.goal).map(q => q.id).join());
  const both = Qs.questsForDay('2026-10-10', c);
  ok('two tracks: one shared quest and one from each track', both.length === 3 && both[0].track === 'core' && new Set(both.slice(1).map(q => q.track)).size === 2);
  const one = Qs.questsForDay('2026-10-10', ctx({ usable:['robotics'] }));
  ok('one track: both track quests come from it', one.length === 3 && one.slice(1).every(q => q.track === 'robotics'));
  const unlinked = Qs.questsForDay('2026-10-10', ctx({ usable:['robotics'] }));
  ok('an unlinked Codeforces account deals no programming quests', unlinked.every(q => q.track !== 'cp'));
  let beginnerGotHard = false;
  for (let i = 0; i < 90; i++) {
    const k = G.addDays('2026-09-01', i);
    if (Qs.questsForDay(k, ctx({ key:k, rating:900, usable:['cp'] })).some(q => q.id === 'r1600' || q.id === 'r1900')) beginnerGotHard = true;
  }
  ok('a 900-rated beginner is never dealt "reach 1600"', !beginnerGotHard);
  const noGh = new Set();
  for (let i = 0; i < 90; i++) Qs.questsForDay(G.addDays('2026-09-01', i), ctx({ github:false })).forEach(q => noGh.add(q.id));
  ok('no GitHub means no commit quests', !noGh.has('ship1') && !noGh.has('ship3'));
  ok('the same date always deals the same quests', Qs.questsForDay('2026-11-11', c).map(q => q.id).join() === Qs.questsForDay('2026-11-11', c).map(q => q.id).join());
}

/* =============================== migrations =============================== */
group('migration: an existing Codify save upgrades in place');
{
  const codify = {
    v:2, profile:{ name:'Piyush', theme:'cobalt', goal:'grind', onboarded:true, created:day(40) },
    xp:5000, coins:900, streak:{ current:12, best:20, lastActive:day(0), freezes:2 },
    days:{ [day(1)]: { focus:[{ uid:'a', minutes:45, topic:'dp', verified:true, ts:Date.now() }, { uid:'b', minutes:90, verified:false, ts:Date.now() }],
                       notes:[{ uid:'n', text:'did two on leetcode' }], claimed:['q-solve-1'] } },
    platforms:{ cf:{ handle:'tourist', rating:3500, rank:'legendary grandmaster', solved:[solve('x1', 1500, ['dp'], 1)], syncedAt:1 },
                gh:{ user:'octo', pushes:[{ id:'e9', commits:4, day:day(1) }], syncedAt:1 } },
    credited:{ problems:{ x1: day(1) }, tiers:{}, pushes:{ e9: day(1) } },
    active:null, contests:{ warmup:{ won:true, attempts:1, best:2 } },
    earned:{ 'first-solve': day(10), 'streak-7': day(5) }, owned:['cyan'], loot:{ duck:1, harness:1 },
    stats:{ solved:1, ratedSolved:1, bestRating:1500, tiersCleared:0, commits:4, pushes:1, verifiedMinutes:45, sessions:2, quests:9, xpEarned:5000, contestsWon:1, contestsRun:1 },
    settings:{ sound:false, reduceMotion:false },
  };
  const m = St.migrate(codify);
  ok('XP, credits, streak and gear carry over', m.xp === 5000 && m.coins === 900 && m.streak.current === 12 && m.loot.duck && m.loot.harness);
  ok('owned gear keeps its IDs in the merged set', ['duck', 'harness'].every(id => L.LOOT_BY_ID[id]));
  ok('achievements already earned stay earned', m.earned['first-solve'] && m.earned['streak-7'] && Ach.ACHIEVEMENTS.some(a => a.id === 'streak-7'));
  ok('the Codeforces handle, solves and credit carry over', m.tracks.cp.handle === 'tourist' && m.tracks.cp.solved.length === 1 && m.tracks.cp.credited.problems.x1);
  ok('GitHub and its credited pushes carry over', m.github.user === 'octo' && m.github.credited.e9);
  ok('the named goal becomes minutes and a solve target', m.profile.focusGoal === 90 && m.tracks.cp.dailySolves === 3);
  ok('a timed session becomes timer minutes', m.days[day(1)].timerMin === 45 && m.days[day(1)].timer[0].tag === 'cp:dp');
  ok('typed sessions and notes are kept, not deleted', m.legacy.days[day(1)].sessions.length === 1 && m.legacy.days[day(1)].notes.length === 1);
  ok('both tracks are switched on, with a note about what changed', m.profile.tracks.join() === 'cp,robotics' && m.notice === 'merged');

  St.importSave(JSON.stringify(codify));
  const xp = St.S.xp;
  Ca.applySolves([solve('x1', 1500, ['dp'], 1)]);
  St.applyPushes([{ id:'e9', commits:4, day:day(1) }]);
  ok('re-syncing after the upgrade pays nothing twice', St.S.xp === xp && St.S.stats.commits === 4);
}

group('migration: folding in Botify');
{
  const botify = {
    v:1, profile:{ name:'P', github:'octo', start:day(10), goal:120, direction:'autonomy', onboarded:true, created:day(10) },
    xp:2000, coins:300, streak:{ current:4, best:9, lastActive:day(0), freezes:1 },
    skills:{ ohm:{ box:3, due:day(-2), seen:3, right:3, wrong:0 } },
    builds:{ b01:{ target:{ owner:'octo', repo:'bench', path:'m1' }, verified:true, verifiedAt:day(2), checks:[], meta:{ mediaTop:true } } },
    bosses:{ 1:{ won:true, wonAt:day(3), attempts:1 } },
    days:{ [day(2)]: { drill:{ score:4, total:5 }, answered:5, correct:4, bestRun:3, bench:[{ start:1, end:2, min:60, tag:'b01' }], benchMin:60, benchTagged:60, benchXp:60, claimed:[] } },
    timer:null, active:null, read:{ 'https://www.falstad.com/circuit/': day(5) },
    earned:{ streak7: day(1), drill1: day(9) }, owned:['sun'], loot:{ meter:1, printer:1 },
    stats:{ drills:6, perfectDrills:2, answered:30, correct:25, benchMin:600, sessions:10, quests:5, bossFights:1, xpEarned:2000 },
    settings:{ sound:true, reduceMotion:false },
  };
  reset();
  Ca.applySolves([solve('c1', 1200, ['math'])]);
  const before = { xp: St.S.xp, solved: St.S.tracks.cp.solved.length };
  const r = St.importBotify(JSON.stringify(botify));
  ok('it is accepted as a Botify backup', r.ok && r.summary.kind === 'Botify');
  ok('its robotics progress becomes this robotics track',
    St.S.tracks.robotics.builds.b01.verified && St.S.tracks.robotics.bosses[1].won && Ro.skillLevel('ohm') === 3 && St.S.tracks.robotics.direction === 'autonomy');
  ok('its XP is added to yours, not swapped for it', St.S.xp === before.xp + 2000);
  ok('programming progress is untouched', St.S.tracks.cp.solved.length === before.solved);
  ok('gear and achievements are combined, with Botify IDs mapped', St.S.loot.meter && St.S.loot.printer && St.S.earned['streak-7'] && St.S.earned.drill1);
  ok('bench time becomes shared timer time, tags namespaced', St.S.days[day(2)].timerMin === 60 && St.S.days[day(2)].timer[0].tag === 'robotics:b01');
  ok('its daily drill history comes too', St.S.days[day(2)].robotics.drill.score === 4);
  ok('the reading list comes too', !!St.S.tracks.robotics.read['https://www.falstad.com/circuit/']);
  ok('and it can be undone', St.undoImport() && St.S.tracks.robotics.builds.b01 === undefined);
  ok('a random JSON file is refused', !St.importBotify('{"hello":1}').ok && !St.importSave('{"hello":1}').ok);
}

/* ================================ economy ================================= */
group('economy, one track played honestly');
{
  const days = RP.MISSIONS.length;
  const timer = 120, quests = 55 * 3;
  // A typical mission: about fourteen questions at 88%, a level-up or two.
  const drill = 14 * 0.88 * (Ro.XP.right + 3) + 1.5 * Ro.XP.levelUp + Ro.XP.missionDone + 0.2 * Ro.XP.missionClean;
  const robo = ((drill + timer + quests + 20) * days + R.BUILDS.reduce((n, b) => n + R.buildXp(b), 0)
    + R.MONTHS.reduce((n, m) => n + Boss.bossXp(m.n), 0)) * 1.2;
  const cp = ((2 * CM.solveXp(1300) + drill + timer + quests) * days + 40 * T.tierXp({ n: 2 }) + 3 * 450) * 1.2;
  const lr = G.levelFromXp(robo).level, lc = G.levelFromXp(cp).level;
  ok(`robotics alone lands between 40 and 55 (level ${lr})`, lr >= 40 && lr <= 55);
  ok(`programming alone lands between 35 and 55 (level ${lc})`, lc >= 35 && lc <= 55);
  ok('the first week reaches a new rank', G.rankFor(G.levelFromXp((drill + timer + quests) * 7).level).at >= 5);
}

group('gear');
{
  ok('the bonus is capped at +40%', near(L.lootBonus(Object.fromEntries(L.LOOT.map(l => [l.id, 1]))), 1.4));
  const rng = Q.seeded(8);
  ok('a floored roll never goes below its floor', Array.from({ length: 300 }, () => L.rollLoot({ minRarity:'epic', rng })).every(d => L.RARITY[d.rarity].rank >= 2));
  ok('a set-limited roll stays in its set', Array.from({ length: 200 }, () => L.rollLoot({ set:'bench', rng })).every(d => d.set === 'bench'));
  ok('gear IDs are unique', new Set(L.LOOT.map(l => l.id)).size === L.LOOT.length);
  ok('achievement IDs are unique', new Set(Ach.ACHIEVEMENTS.map(a => a.id)).size === Ach.ACHIEVEMENTS.length);
  const snap = St.statsSnapshot();
  ok('every achievement reads a real stat', Ach.ACHIEVEMENTS.every(a => typeof a.check(snap) === 'boolean'));
}

/* ================================ shipping ================================ */
group('shipping');
{
  const fs = await import('node:fs/promises');
  const { APP_VERSION } = await import('../js/version.js');
  const sw = await fs.readFile('sw.js', 'utf8');
  ok('the footer version matches the service worker cache', sw.includes(`CACHE_VERSION = '${APP_VERSION}'`));
  const onDisk = [];
  const walk = async dir => { for (const e of await fs.readdir(dir, { withFileTypes: true })) { const p = `${dir}/${e.name}`; if (e.isDirectory()) await walk(p); else if (p.endsWith('.js')) onDisk.push(p); } };
  await walk('js');
  const missing = onDisk.filter(f => !sw.includes(`'./${f}'`));
  ok('every module is precached for offline use', !missing.length, missing.join(', '));
  const broken = [];
  for (const f of onDisk) {
    const src = await fs.readFile(f, 'utf8');
    for (const m of src.matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
      const target = new URL(m[1], `file://${process.cwd()}/${f}`).pathname;
      try { await fs.access(target); } catch { broken.push(`${f} → ${m[1]}`); }
    }
  }
  ok('every import points at a real file', !broken.length, broken.join(', '));
  const all = (await Promise.all(onDisk.map(f => fs.readFile(f, 'utf8')))).join('\n');
  ok('no tokens or keys in the source', !/ghp_[A-Za-z0-9]{20,}|github_pat_|sk-[A-Za-z0-9]{20,}/.test(all));
}

console.log(`\n${fail === 0 ? '\x1b[32m✅' : '\x1b[31m❌'}  ${pass} passed, ${fail} failed\x1b[0m\n`);
process.exit(fail ? 1 : 0);
