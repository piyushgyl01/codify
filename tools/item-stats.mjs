/**
 * Item statistics from the attempt log in one or more Codify backups.
 *
 * Every answer the app marks is logged (S.log: skill, level, right or wrong,
 * seconds, and for course tests the outcome and the sitting). This reads that
 * log back and asks the questions a test designer asks of a question bank:
 *
 *   difficulty      p, the share answered right — per skill, and per level
 *   time            the median seconds to answer
 *   discrimination  for course tests, the point-biserial correlation between
 *                   getting an item right and the rest of that sitting's score:
 *                   does a question separate people who know the course from
 *                   people who don't? Below about 0.2 it barely does.
 *   gain            per course, placement against end-of-course, as Hake's
 *                   normalised gain (post − pre) / (1 − pre)
 *
 * One learner's backup gives difficulty and time for that learner. Discrimination
 * needs many sittings by many people — pass several backups — and says so when
 * it has too few to mean anything.
 *
 *   node tools/item-stats.mjs backup.json [more.json ...] [--json]
 */
import { readFileSync } from 'node:fs';

const MIN_SITTINGS = 30;   // below this, a correlation is noise

const mean = a => (a.length ? a.reduce((n, x) => n + x, 0) / a.length : NaN);
const median = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

/** Pearson correlation of a 0/1 item with a continuous score: the point-biserial. */
export function pointBiserial(item, rest) {
  const sx = sd(rest), p = mean(item);
  if (!(sx > 0) || p === 0 || p === 1) return null;
  const m1 = mean(rest.filter((_, i) => item[i])), m0 = mean(rest.filter((_, i) => !item[i]));
  return ((m1 - m0) / sx) * Math.sqrt(p * (1 - p));
}

/** The statistics, from a list of log entries (each tagged with the learner it came from). */
export function itemStats(log) {
  const bySkill = new Map();
  for (const e of log) {
    const s = bySkill.get(e.s) || { skill: e.s, track: e.tr, n: 0, right: 0, secs: [], levels: {} };
    s.n++; s.right += e.ok ? 1 : 0; if (e.sec > 0) s.secs.push(e.sec);
    if (e.l != null) { const L = (s.levels[e.l] ||= { n: 0, right: 0 }); L.n++; L.right += e.ok ? 1 : 0; }
    bySkill.set(e.s, s);
  }
  const skills = [...bySkill.values()].map(s => ({
    skill: s.skill, track: s.track, n: s.n, p: s.right / s.n, medianSecs: median(s.secs),
    byLevel: Object.fromEntries(Object.entries(s.levels).map(([l, L]) => [l, { n: L.n, p: L.right / L.n }])),
  })).sort((a, b) => a.p - b.p);

  // Course tests: one sitting = one learner's one test on one day.
  const sittings = new Map();
  for (const e of log.filter(x => x.m === 'ctest' && x.x)) {
    const id = `${e.who}|${e.tr}|${e.x}`;
    const st = sittings.get(id) || { who: e.who, track: e.tr, course: e.x.split(':')[0], kind: e.x.split(':')[1], items: {} };
    st.items[e.o || e.s] = e.ok ? 1 : 0;
    sittings.set(id, st);
  }
  const byCourse = new Map();
  for (const st of sittings.values()) byCourse.set(`${st.track}/${st.course}`, [...(byCourse.get(`${st.track}/${st.course}`) || []), st]);
  const courses = [...byCourse.entries()].map(([course, list]) => {
    const itemIds = [...new Set(list.flatMap(st => Object.keys(st.items)))];
    const items = itemIds.map(id => {
      const taken = list.filter(st => id in st.items);
      const x = taken.map(st => st.items[id]), rest = taken.map(st => Object.values(st.items).reduce((n, v) => n + v, 0) - st.items[id]);
      return { item: id, sittings: taken.length, p: mean(x), discrimination: taken.length >= MIN_SITTINGS ? pointBiserial(x, rest) : null };
    });
    const share = st => mean(Object.values(st.items));
    const gains = [];
    for (const who of new Set(list.map(st => st.who))) {
      const mine = list.filter(st => st.who === who), pre = mine.find(st => st.kind === 'placement'), post = [...mine].reverse().find(st => st.kind === 'final');
      if (pre && post) { const a = share(pre), b = share(post); gains.push({ who, pre: a, post: b, gain: a < 1 ? (b - a) / (1 - a) : null }); }
    }
    return { course, sittings: list.length, learners: new Set(list.map(st => st.who)).size, items, gains };
  });
  return { attempts: log.length, learners: new Set(log.map(e => e.who)).size, skills, courses, minSittings: MIN_SITTINGS };
}

/* ---------------------------------- CLI ----------------------------------- */

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2), asJson = args.includes('--json'), files = args.filter(a => a !== '--json');
  if (!files.length) { console.error('usage: node tools/item-stats.mjs backup.json [more.json ...] [--json]'); process.exit(2); }
  const log = files.flatMap((f, i) => {
    const save = JSON.parse(readFileSync(f, 'utf8'));
    return (save.log || []).map(e => ({ ...e, who: i }));
  });
  const r = itemStats(log);
  if (asJson) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  const pct = x => (Number.isFinite(x) ? `${Math.round(x * 100)}%` : '–');
  console.log(`${r.attempts} answers from ${r.learners} learner${r.learners === 1 ? '' : 's'}.\n`);
  console.log('Hardest skills first (p = share right):');
  for (const s of r.skills.slice(0, 40)) {
    const lv = Object.entries(s.byLevel).map(([l, L]) => `L${l} ${pct(L.p)}/${L.n}`).join(' ');
    console.log(`  ${s.skill.padEnd(18)} ${String(s.n).padStart(4)} answers  p ${pct(s.p).padStart(4)}  median ${Number.isFinite(s.medianSecs) ? `${s.medianSecs}s` : '–'}   ${lv}`);
  }
  for (const c of r.courses) {
    console.log(`\n${c.course}: ${c.sittings} test sittings by ${c.learners} learner${c.learners === 1 ? '' : 's'}`);
    for (const it of c.items) console.log(`  ${it.item.padEnd(22)} p ${pct(it.p).padStart(4)}  discrimination ${it.discrimination == null ? `needs ${r.minSittings}+ sittings` : it.discrimination.toFixed(2)}`);
    if (c.gains.length > 5) {
      const gs = c.gains.map(g => g.gain).filter(Number.isFinite);
      console.log(`  ${c.gains.length} learners sat both tests: placement ${pct(mean(c.gains.map(g => g.pre)))} → end-of-course ${pct(mean(c.gains.map(g => g.post)))}, mean normalised gain ${mean(gs).toFixed(2)}`);
    } else for (const g of c.gains) console.log(`  learner ${g.who}: placement ${pct(g.pre)} → end-of-course ${pct(g.post)}, normalised gain ${g.gain == null ? '–' : g.gain.toFixed(2)}`);
  }
  if (r.learners < 2) console.log('\nOne learner: difficulty and time describe you, not the questions. Discrimination needs many people — pass their backups too.');
}
