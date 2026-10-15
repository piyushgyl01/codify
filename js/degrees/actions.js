/**
 * Degree actions over the save: ticking work, marking assessments, choosing a
 * concentration and a pace, and reading progress exported from Course Atlas.
 *
 * None of these pay XP or credits — they are your own account of your work,
 * and the game only pays for what it can check. They do keep the map honest
 * about where you are, and a passed course is recorded the day it passes.
 */
import { S, emit, today, TRACK_IDS } from '../state.js';
import { degreeData, degreeMeta, DEGREES } from './load.js';
import * as M from './model.js';

const slice = id => S.tracks[id];

/** After any change: note the day each course passes, and forget it if it stops passing. */
function settle(id, key = today()) {
  const D = degreeData(id), r = slice(id);
  if (!D) return;
  r.passed ||= {};
  for (const c of M.pathCourses(D, r)) {
    const passed = M.courseStatus(D, r, c).passed;
    if (passed && !r.passed[c.key]) r.passed[c.key] = key;
    if (!passed && r.passed[c.key]) delete r.passed[c.key];
  }
}

function changed(id, what) { settle(id); emit('degree', { id, what }); }

export function toggleWeek(id, unitId, week, key = today()) {
  const r = slice(id), k = `${unitId}#${week}`;
  r.tasks ||= {};
  if (r.tasks[k]) { delete r.tasks[k]; delete r.units?.[unitId]; } else r.tasks[k] = key;
  changed(id, 'week');
  return !!r.tasks[k];
}

/** Tick a whole unit — or untick it, and its weeks with it. */
export function toggleUnit(id, unitId, key = today()) {
  const r = slice(id), D = degreeData(id), hit = D && M.unitById(D, unitId);
  r.units ||= {}; r.tasks ||= {};
  const done = hit ? M.unitDone(r, hit.unit) : !!r.units[unitId];
  if (done) {
    delete r.units[unitId];
    for (const w of hit?.unit.weeks || []) delete r.tasks[`${unitId}#${w.week}`];
  } else r.units[unitId] = key;
  changed(id, 'unit');
  return !done;
}

/**
 * Mark an assessment. Either a single score, or points per rubric criterion,
 * which are added up. Scores are clamped to what the assessment allows.
 */
export function markAssessment(id, assessmentId, { score = null, points = null } = {}, key = today()) {
  const D = degreeData(id), r = slice(id);
  const a = D?.courses.flatMap(c => c.assessments).find(x => x.id === assessmentId);
  if (!a) return null;
  let total = score, pts = null;
  if (points && a.rubric.length) {
    pts = Object.fromEntries(a.rubric.map(x => [x.criterion, Math.max(0, Math.min(x.points, Number(points[x.criterion]) || 0))]));
    total = Object.values(pts).reduce((n, v) => n + v, 0);
  }
  const max = a.rubric.length ? a.rubric.reduce((n, x) => n + x.points, 0) || a.max : a.max;
  if (total == null || !Number.isFinite(Number(total))) return null;
  r.assessments ||= {};
  r.assessments[a.id] = { score: Math.max(0, Math.min(max, Number(total))), max, ...(pts ? { points: pts } : {}), day: key };
  changed(id, 'assessment');
  return r.assessments[a.id];
}

export function clearAssessment(id, assessmentId) {
  delete slice(id).assessments?.[assessmentId];
  changed(id, 'assessment');
}

export function setNote(id, unitId, text) {
  const r = slice(id);
  r.notes ||= {};
  const v = String(text || '').trim().slice(0, 2000);
  if (v) r.notes[unitId] = v; else delete r.notes[unitId];
  emit('degree', { id, what: 'note' });
}

export function setConcentration(id, key) {
  const D = degreeData(id);
  if (key && !D?.concentrations.some(c => c.key === key)) return false;
  slice(id).concentration = key || null;
  changed(id, 'path');
  return true;
}

export function setHours(id, hours) {
  slice(id).hours = Math.max(1, Math.min(80, Math.round(hours) || 15));
  emit('degree', { id, what: 'pace' });
}

export function setStart(id, day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return false;
  slice(id).start = day > today() ? today() : day;
  emit('degree', { id, what: 'pace' });
  return true;
}

/** "I already know this": a course's prerequisites stop blocking it. Undo is the same call with false. */
export function waive(id, courseKey, on = true, key = today()) {
  const r = slice(id);
  r.waived ||= {};
  if (on) r.waived[courseKey] = key; else delete r.waived[courseKey];
  changed(id, 'path');
}

/**
 * An outside benchmark — an MIT exam marked against MIT's solutions, CS50's
 * check50 — and the score you got. Kept beside the app's own measures, so the
 * two can be compared; it pays nothing.
 */
export function recordBenchmark(id, benchId, score, max, key = today()) {
  const v = Number(score), m = Number(max);
  if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0 || v < 0 || v > m) return null;
  const r = slice(id);
  r.benchmarks ||= {};
  r.benchmarks[benchId] = [...(r.benchmarks[benchId] || []), { score: v, max: m, day: key }];
  emit('degree', { id, what: 'benchmark' });
  return r.benchmarks[benchId].at(-1);
}

/**
 * An answer-key check inside an assessment: a number the app computes (the
 * optimum of a cost model, the odd vertices of a graph) checked against yours.
 */
export function answerKeyCheck(id, check, value, key = today()) {
  const v = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(v)) return null;
  const ok = Math.abs(v - check.answer) <= (check.tol || 0) + 1e-9;
  const r = slice(id);
  r.keys ||= {};
  r.keys[check.id] = { value: v, ok, day: key };
  emit('degree', { id, what: 'key' });
  return r.keys[check.id];
}

/* ------------------------- importing Course Atlas ------------------------- */

const ATLAS_NAMESPACE = 'course-atlas-progress-v3';

/**
 * Read a Course Atlas progress backup (the file its footer saves) and fold it
 * into the degrees here: finished units, assessment scores, the concentration
 * and the pace. Nothing here is removed; ticks and scores already in Codify
 * win over the file's. Returns what was found, per degree.
 */
export function importAtlas(text, key = today()) {
  let file;
  try { file = JSON.parse(text); } catch { return { ok: false, error: 'That file is not valid JSON.' }; }
  if (file?.format !== 'course-atlas-progress-backup' || !file.entries) return { ok: false, error: 'That is not a Course Atlas progress backup.' };
  let envelope;
  try { envelope = JSON.parse(file.entries[ATLAS_NAMESPACE] || 'null'); } catch { envelope = null; }
  if (!envelope) return { ok: false, error: 'That backup has no Course Atlas progress in it.' };
  const stores = [envelope.guest, ...Object.values(envelope.owners || {})].filter(Boolean);
  const found = {};
  for (const store of stores) {
    for (const [programVersionId, p] of Object.entries(store.programs || {})) {
      const meta = DEGREES.find(d => degreeData(d.id)?.programIds.includes(programVersionId));
      if (!meta) continue;
      const D = degreeData(meta.id), r = slice(meta.id), alias = id => D.aliases[id] || id;
      const f = (found[meta.id] ||= { units: 0, assessments: 0 });
      for (const course of Object.values(p.courses || {})) {
        for (const uid of course.completedUnitIds || []) {
          const id = alias(uid);
          if (M.unitById(D, id) && !r.units[id]) { r.units[id] = (course.updatedAt || '').slice(0, 10) || key; f.units++; }
        }
      }
      for (const ev of Object.values(p.unitEvidences || {})) {
        const id = alias(ev.learningUnitId);
        if (ev.textOrUrl && M.unitById(D, id) && !r.notes[id]) r.notes[id] = String(ev.textOrUrl).slice(0, 2000);
      }
      const latest = {};
      for (const at of Object.values(p.assessmentAttempts || {})) {
        if (!at.result) continue;
        const id = alias(at.assessmentVersionId);
        if (!latest[id] || at.attemptNumber > latest[id].attemptNumber) latest[id] = at;
      }
      for (const [id, at] of Object.entries(latest)) {
        const a = D.courses.flatMap(c => c.assessments).find(x => x.id === id);
        if (!a || r.assessments[id]) continue;
        r.assessments[id] = { score: at.result.score, max: at.result.maximumScore || a.max, day: (at.result.evaluatedAt || '').slice(0, 10) || key };
        f.assessments++;
      }
      const conc = p.selectedConcentrationId && D.aliases[p.selectedConcentrationId];
      if (conc && !r.concentration) r.concentration = conc;
      if (p.enrollment?.paceHoursPerWeek) r.hours = Math.max(1, Math.min(80, Math.round(p.enrollment.paceHoursPerWeek)));
      if (p.enrollment?.startDate && /^\d{4}-\d{2}-\d{2}/.test(p.enrollment.startDate)) r.start = p.enrollment.startDate.slice(0, 10);
      if (!S.profile.tracks.includes(meta.id)) S.profile.tracks = TRACK_IDS.filter(t => [...S.profile.tracks, meta.id].includes(t));
      settle(meta.id, key);
    }
  }
  if (!Object.keys(found).length) return { ok: false, error: 'No degree in that backup matches one here — open the degree once first, then try again.' };
  emit('degree', { what: 'import' });
  return { ok: true, found, names: Object.keys(found).map(id => degreeMeta(id).title) };
}
