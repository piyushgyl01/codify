/**
 * A degree — pure reads over its catalog `D` and its slice of the save `r`.
 * No storage, no network, so the tests can drive every rule.
 *
 * The slice:
 *   start          the day you started
 *   hours          hours a week you plan to study (the pace)
 *   concentration  the concentration you chose, or null
 *   units          { unitId: day }               units finished
 *   tasks          { "unitId#week": day }        weekly assignments finished (CS)
 *   assessments    { id: { score, max, points, day } }   your marking of each assessment
 *   notes          { unitId: text }              where your evidence for a unit lives
 *   waived         { courseKey: day }            prerequisites you said you already have
 *   passed         { courseKey: day }            when each course was passed
 *   skills, checks …                            practice, through the shared engine
 *
 * Ticking work done and marking an assessment are yours to do honestly: they
 * move you along the map and pay nothing. What pays is what the app can check
 * — practice it marks itself, and time on the focus timer.
 */
import { addDays, daysBetween } from '../game.js';

export const freshDegree = (start) => ({
  start, hours: 15, concentration: null,
  units: {}, tasks: {}, assessments: {}, notes: {}, waived: {}, passed: {},
  skills: {}, checks: {}, missions: {}, skipped: {}, scores: {}, testouts: {},
});

export const PACE_HOURS = [5, 10, 15, 20, 30, 40];

/** "Semester 1 · Year 1 · See the whole field" → "Semester 1", for places with one line to spare. */
export const termShort = label => String(label || '').split(' · ')[0];

export const taskKey = (unit, week) => `${unit.id}#${week.week}`;
export const courseByKey = (D, key) => D.courses.find(c => c.key === key) || null;
export const unitById = (D, id) => {
  for (const c of D.courses) { const u = c.units.find(x => x.id === id); if (u) return { course: c, unit: u }; }
  return null;
};

/* ---------------------------------- work ---------------------------------- */

/** A unit is done when it is ticked, or when every weekly assignment in it is. */
export function unitDone(r, u) {
  if (r.units?.[u.id]) return true;
  return !!u.weeks?.length && u.weeks.every(w => r.tasks?.[taskKey(u, w)]);
}
export const weekDone = (r, u, w) => !!r.tasks?.[taskKey(u, w)] || !!r.units?.[u.id];

/** Hours left in a unit: its unfinished weeks, or all of it. */
export function unitHoursLeft(r, u) {
  if (unitDone(r, u)) return 0;
  if (u.weeks?.length) return u.weeks.filter(w => !weekDone(r, u, w)).reduce((n, w) => n + (w.hours || 0), 0);
  return u.hours || 0;
}

/* ---------------------------------- path ---------------------------------- */

export const concentrationOf = (D, r) => D.concentrations.find(c => c.key === r.concentration) || null;

/** The courses you take: every fixed requirement, and the courses of your concentration once you choose one. */
export function pathKeys(D, r) {
  const keys = new Set(), conc = concentrationOf(D, r);
  for (const req of D.requirements) {
    if (req.concentration) { conc?.courses.forEach(k => keys.add(k)); continue; }
    const opts = req.options.map(o => o.course);
    const picked = r.picks?.[req.id]?.filter(k => opts.includes(k));
    (picked?.length ? picked : opts.slice(0, req.min || opts.length)).forEach(k => keys.add(k));
  }
  return keys;
}
export const pathCourses = (D, r) => { const keys = pathKeys(D, r); return D.courses.filter(c => keys.has(c.key)); };

/** Credits for each course, as its requirement awards them. */
export function creditsOf(D, key) {
  for (const req of D.requirements) { const o = req.options.find(x => x.course === key); if (o) return o.credits || 0; }
  return 0;
}
export const creditSystem = D => D.requirements.find(r => r.creditSystem)?.creditSystem || 'credits';

/** The concentration requirement still waits for a choice. */
export const needsConcentration = (D, r) => D.requirements.some(req => req.concentration) && !concentrationOf(D, r);

/* ------------------------------- assessments ------------------------------ */

export const assessmentRecord = (r, a) => r.assessments?.[a.id] || null;
export const assessmentPct = (r, a) => { const rec = assessmentRecord(r, a); return rec ? (rec.score / (rec.max || a.max || 100)) * 100 : null; };

/** An assessment meets its own bar when it has one: the passing score, out of its maximum. */
export function assessmentPassed(r, a) {
  const rec = assessmentRecord(r, a);
  if (!rec) return false;
  return a.pass == null ? true : rec.score >= a.pass * ((rec.max || a.max) / (a.max || rec.max));
}

/** The course grade: assessments weighted as the course sets them; ones not yet marked count as zero. */
export function weightedPct(c, r) {
  const graded = c.assessments.filter(a => a.weight > 0);
  const total = graded.reduce((n, a) => n + a.weight, 0);
  if (!total) {
    const marked = c.assessments.filter(a => assessmentRecord(r, a));
    return marked.length ? marked.reduce((n, a) => n + assessmentPct(r, a), 0) / c.assessments.length : 0;
  }
  return graded.reduce((n, a) => n + a.weight * ((assessmentPct(r, a) ?? 0) / 100), 0) / total * 100;
}

/* --------------------------------- courses -------------------------------- */

/** Prerequisites still in the way: required courses in this degree that are neither passed nor waived. */
export function missingPrereqs(D, r, c) {
  if (r.waived?.[c.key]) return [];
  return c.prereqs.map(k => courseByKey(D, k)).filter(p => p && !courseStatus(D, r, p, { deep: false }).passed);
}

/**
 * Where a course stands.
 *   locked       a prerequisite is not passed yet
 *   not-started  nothing ticked
 *   studying     units to go
 *   assessments  units done; assessments to mark
 *   retry        everything marked, but below the bar
 *   passed       all units done, required assessments meet their bar, and the grade clears the course's
 */
export function courseStatus(D, r, c, { deep = true } = {}) {
  const unitsDone = c.units.filter(u => unitDone(r, u)).length;
  const hoursTotal = c.units.reduce((n, u) => n + (u.hours || 0), 0) + c.assessments.reduce((n, a) => n + (a.hours || 0), 0);
  const hoursLeft = c.units.reduce((n, u) => n + unitHoursLeft(r, u), 0)
    + c.assessments.filter(a => !assessmentRecord(r, a)).reduce((n, a) => n + (a.hours || 0), 0);
  const required = c.assessments.filter(a => a.required);
  const marked = c.assessments.filter(a => assessmentRecord(r, a)).length;
  const pct = weightedPct(c, r);
  const allUnits = unitsDone === c.units.length;
  const requiredOk = required.every(a => assessmentPassed(r, a));
  const passed = allUnits && requiredOk && pct >= c.passing && marked > 0;
  const missing = deep ? missingPrereqs(D, r, c) : [];
  const started = unitsDone > 0 || marked > 0 || c.units.some(u => u.weeks?.some(w => weekDone(r, u, w)));
  const state = passed ? 'passed' : missing.length && !started ? 'locked' : !started ? 'not-started'
    : !allUnits ? 'studying' : marked < c.assessments.length || !required.every(a => assessmentRecord(r, a)) ? 'assessments' : 'retry';
  const blockers = [];
  if (!allUnits) blockers.push(`${c.units.length - unitsDone} unit${c.units.length - unitsDone === 1 ? '' : 's'} to finish`);
  for (const a of required) if (!assessmentPassed(r, a)) blockers.push(assessmentRecord(r, a) ? `${a.title} is below its pass mark` : `${a.title} not marked yet`);
  if (allUnits && requiredOk && marked && pct < c.passing) blockers.push(`grade ${Math.round(pct)}% — the course needs ${c.passing}%`);
  return { state, passed, unitsDone, units: c.units.length, marked, assessments: c.assessments.length, pct, hoursTotal, hoursLeft, missing, blockers };
}

export const STATE_LABEL = {
  locked: 'Locked', 'not-started': 'Not started', studying: 'Studying', assessments: 'Assessments due', retry: 'Below the bar', passed: 'Passed',
};

/* ---------------------------------- terms --------------------------------- */

export function termCourses(D, r, t) { return pathCourses(D, r).filter(c => c.term === t); }

/** The first term with a course still to pass; the number of terms once everything is passed. */
export function currentTerm(D, r) {
  const path = pathCourses(D, r);
  for (let t = 0; t < D.terms.length; t++) if (path.some(c => c.term === t && !courseStatus(D, r, c).passed)) return t;
  return D.terms.length;
}

/* ---------------------------------- today --------------------------------- */

/**
 * What to do next: in each course of the earliest unfinished terms that is
 * open, its next piece of work — a weekly assignment, a unit, or an
 * assessment to sit and mark.
 */
export function nextTasks(D, r, { limit = 6 } = {}) {
  const out = [], cur = currentTerm(D, r);
  for (const c of pathCourses(D, r)) {
    if (c.term > cur || out.length >= limit) continue;
    const st = courseStatus(D, r, c);
    if (st.passed || st.state === 'locked') continue;
    const u = c.units.find(x => !unitDone(r, x));
    if (u) {
      const w = u.weeks?.find(x => !weekDone(r, u, x));
      out.push(w ? { kind: 'week', course: c, unit: u, week: w, title: w.title, text: w.activity, produce: w.deliverable, hours: w.hours, url: w.url || u.url }
        : { kind: 'unit', course: c, unit: u, title: u.title, text: u.activity, produce: u.evidence, hours: u.hours, url: u.url });
      continue;
    }
    const a = c.assessments.find(x => !assessmentPassed(r, x) && (x.required || !assessmentRecord(r, x))) || c.assessments.find(x => !assessmentRecord(r, x));
    if (a) out.push({ kind: 'assessment', course: c, assessment: a, title: a.title, text: a.instructions, produce: a.evidence.join('; '), hours: a.hours });
  }
  return out;
}

/** Courses you could start but whose prerequisites are not passed — shown so a lock never looks like a bug. */
export const lockedNow = (D, r) => termCourses(D, r, currentTerm(D, r)).filter(c => courseStatus(D, r, c).state === 'locked');

/* -------------------------------- progress -------------------------------- */

export function degreeProgress(D, r) {
  const path = pathCourses(D, r), statuses = path.map(c => [c, courseStatus(D, r, c)]);
  const passed = statuses.filter(([, s]) => s.passed);
  const hoursLeft = statuses.reduce((n, [, s]) => n + s.hoursLeft, 0) + (needsConcentration(D, r) ? concentrationHours(D) : 0);
  return {
    courses: path.length + (needsConcentration(D, r) ? concentrationCount(D) : 0), passed: passed.length,
    units: statuses.reduce((n, [, s]) => n + s.units, 0), unitsDone: statuses.reduce((n, [, s]) => n + s.unitsDone, 0),
    credits: passed.reduce((n, [c]) => n + creditsOf(D, c.key), 0),
    creditsTotal: D.requirements.reduce((n, req) => n + (req.credits || 0), 0),
    hoursLeft, term: currentTerm(D, r),
  };
}

const concentrationCount = D => Math.max(...D.concentrations.map(c => c.courses.length), 0);
const concentrationHours = D => {
  const sizes = D.concentrations.map(c => c.courses.reduce((n, k) => n + (courseByKey(D, k)?.hours || 0), 0));
  return sizes.length ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0;
};

/** At your pace: weeks of study left and the day you would finish. */
export function projection(D, r, key) {
  const left = degreeProgress(D, r).hoursLeft, perWeek = Math.max(1, r.hours || 15);
  const weeks = Math.ceil(left / perWeek);
  return { hoursLeft: left, weeks, finish: addDays(key, weeks * 7), perWeek };
}

/** Your record: every passed course, when, with its grade and credits. */
export function transcript(D, r) {
  return pathCourses(D, r).map(c => ({ course: c, status: courseStatus(D, r, c) }))
    .filter(x => x.status.passed)
    .map(x => ({ ...x, day: r.passed?.[x.course.key] || null, credits: creditsOf(D, x.course.key) }));
}

/** Days since you started, for "week N of your degree". */
export const weekOfDegree = (r, key) => Math.floor(Math.max(0, daysBetween(r.start || key, key)) / 7) + 1;
