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

const rightAnswer = q => (q.kind === 'mc' ? q.correct : String(q.answer));
const wrongAnswer = q => (q.kind === 'mc' ? (q.correct + 1) % q.options.length : String(q.answer * 1.5 + 7));
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
ok('six months, 28 builds, each with proof', R.MONTHS.length === 6 && R.BUILDS.length === 28 && R.BUILDS.every(b => b.proof));
ok('every build points at a topic in its own month', R.BUILDS.every(b => R.topicById(b.topic)?.month === b.month));
ok('milestones name only real builds and skills',
  Object.values(R.MILESTONES).flat().every(m => (m.builds || []).every(R.buildById) && (m.skills || []).every(Sk.skillById)));

group('skill generators — 200 draws each');
let genErrors = [];
for (const s of Sk.SKILLS) {
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
ok(`all ${Sk.SKILLS.length} skills generate gradable questions`, !genErrors.length, genErrors.slice(0, 3).join(' | '));

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


group('Leitner boxes');
{
  let e = null;
  e = G.review(e, true, '2026-09-01');  ok('first right answer: box 1, due tomorrow', e.box === 1 && e.due === '2026-09-02');
  e = G.review(e, true, '2026-09-02');  ok('second: box 2, due in two days', e.box === 2 && e.due === '2026-09-04');
  e = G.review(e, true, '2026-09-04');  ok('third: box 3, due in four', e.box === 3 && e.due === '2026-09-08');
  e = G.review(e, false, '2026-09-08'); ok('a miss drops it to box 1, due tomorrow', e.box === 1 && e.due === '2026-09-09');
  for (let i = 0; i < 10; i++) e = G.review(e, true, e.due);
  ok('box 5 is the ceiling', e.box === 5);
}

group('picking a drill');
{
  const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const state = { a:{ box:2, due:'2026-09-01' }, b:{ box:1, due:'2026-09-03' }, c:{ box:3, due:'2026-08-30' }, d:{ box:5, due:'2026-12-01' } };
  const pick = G.pickDrill(pool, state, '2026-09-03', Q.seeded(1));
  ok('five skills, no repeats', pick.length === 5 && new Set(pick).size === 5);
  ok('the oldest due review comes first', pick[0] === 'c');
  ok('due reviews before anything new', pick.slice(0, 3).every(id => ['a', 'b', 'c'].includes(id)));
  ok('then new skills, in roadmap order', pick[3] === 'e' && pick[4] === 'f');
  ok('a skill not yet due is left alone', !pick.includes('d'));
  const tiny = G.pickDrill(['x', 'y'], {}, '2026-09-03');
  ok('a pool smaller than a drill still fills five', tiny.length === 5);
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
group('robotics: the daily drill');
reset();
{
  const rng = Q.seeded(42);
  const a = Ro.startDrill(undefined, rng);
  ok('five questions, only from open months', a.qs.length === 5 && a.qs.every(q => Sk.skillById(q.skill).month === 1));
  ok('starting again resumes rather than rerolling', Ro.startDrill(undefined, rng) === a);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  const s = Ro.finishSession(rng);
  ok('five right is a clean sheet that pays', s.perfect && s.reward.xp > 0);
  ok('the drill counts for the shared streak', St.S.streak.current === 1 && St.dayIsActive());
  ok('each skill moved to box 1', a.qs.every(q => Ro.skillBox(q.skill) === 1));
  ok('a second drill the same day is refused', Ro.startDrill() === null);
}

group('robotics: practice');
{
  const rng = Q.seeded(9);
  Ro.startPractice('lipo', undefined, rng);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  Ro.finishSession();
  const box = Ro.skillBox('lipo');
  Ro.startPractice('lipo', undefined, rng);
  while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng);
  Ro.finishSession();
  ok('practice introduces a skill but never moves it further', box === 1 && Ro.skillBox('lipo') === 1);
  for (let k = 0; k < 8; k++) { Ro.startPractice('ohm', undefined, rng); while (!Ro.sessionOver()) Ro.answer(rightAnswer(Ro.currentQuestion()), rng); Ro.finishSession(); }
  ok(`practice XP stops at ${Ro.XP.practiceCap} a day`, Ro.roboDay().practiceXp === Ro.XP.practiceCap);
  ok('practice for a locked month is refused', Ro.startPractice('fk') === null);
}

group('robotics: months opening');
ok('day 0: month 1 only', RM.unlockedMonths('2026-09-01', '2026-09-01').join() === '1');
ok('day 30: month 2 by date', RM.unlockedMonths('2026-09-01', '2026-10-01').join() === '1,2');
ok('beating boss 1 opens month 2 early', RM.unlockedMonths('2026-09-01', '2026-09-05', { 1:true }).join() === '1,2');
ok('boss 2 cannot open month 3 while month 2 is shut', RM.unlockedMonths('2026-09-01', '2026-09-05', { 2:true }).join() === '1');

group('robotics: bosses');
{
  const m1 = Sk.skillsIn(1).map(s => s.id);
  for (const id of m1) delete St.S.tracks.robotics.skills[id];
  ok('not ready until every skill has been met', !Ro.bossReady(1).ok);
  for (const id of m1) St.S.tracks.robotics.skills[id] = { box:1, due:'2099-01-01', seen:1, right:1, wrong:0 };
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
    robo:{ drill:{ score:5, total:5 }, bestRun:5, answered:15, correct:15, practiceCorrect:10 },
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
    St.S.tracks.robotics.builds.b01.verified && St.S.tracks.robotics.bosses[1].won && St.S.tracks.robotics.skills.ohm.box === 3 && St.S.tracks.robotics.direction === 'autonomy');
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
  const days = 180;
  const timer = 120, quests = 55 * 3;
  const drill = 4 * Ro.XP.drillRight * 1.15 + Ro.XP.drillDone + 0.2 * Ro.XP.drillPerfect;
  const robo = ((drill + timer + quests + 20) * days + R.BUILDS.reduce((n, b) => n + R.buildXp(b), 0)
    + R.MONTHS.reduce((n, m) => n + Boss.bossXp(m.n), 0)) * 1.2;
  const cp = ((2 * CM.solveXp(1300) + timer + quests) * days + 40 * T.tierXp({ n: 2 }) + 3 * 450) * 1.2;
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
