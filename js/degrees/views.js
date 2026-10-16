/**
 * A degree's screens: This week (the next work in every open course, practice
 * and the pace), Path (the six terms, the concentration, every course), Record
 * (what you have passed), and the classroom for each course — its units and
 * weekly assignments, free resources, practice and assessments.
 */
import { S, today, timerRunning } from '../state.js';
import * as E from '../learn/session.js';
import { levelOf } from '../game.js';
import { degreeData, degreeMeta, loadDegree, DEGREES } from './load.js';
import * as M from './model.js';
import * as A from './actions.js';
import { coursePractice, unitPractice } from './practice/index.js';
import { curriculumFor } from './curriculum/index.js';
import { projectsTab, mountProjects, projectCard } from '../career/view.js';
import { currentFlagship, FLAGSHIPS } from '../career/model.js';
import { skillById } from '../skillbook.js';
import { openCheck, openPractice, openCourseTest } from '../views/player.js';
import { openFocus } from '../views/focus.js';
import { esc, bar, toast, dialog, hm, confetti, sfx } from '../ui.js';
import { icon } from '../icons.js';

const ui = {};          // degree id → { tab, course, open: unit id }
const failed = {};
const st = id => (ui[id] ||= { tab: 'week', course: null, open: null });

export const openCourse = (id, key) => { Object.assign(st(id), { course: key }); };
export const openTab = (id, tab) => { Object.assign(st(id), { tab, course: null }); };

const pct = n => `${Math.round(n)}%`;
const shortDateKey = key => new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const STATE_BADGE = { locked: 'mute', 'not-started': '', studying: 'warn', assessments: 'warn', retry: 'warn', passed: 'good' };
const badge = s => `<span class="badge ${STATE_BADGE[s.state]}">${s.state === 'passed' ? '✓ ' : s.state === 'locked' ? '🔒 ' : ''}${esc(M.STATE_LABEL[s.state])}</span>`;
const link = (url, text) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)} ${icon('ext', 12).value}</a>` : esc(text);
const courseName = c => `${c.code ? `${c.code} · ` : ''}${c.title}`;
/** A weekly assignment's title already says its week more often than not. */
const weekTitle = w => (/^week\s*\d+/i.test(w.title) ? w.title : `Week ${w.week} · ${w.title}`);

/* --------------------------------- loading -------------------------------- */

function loading(id) {
  const meta = degreeMeta(id);
  return failed[id]
    ? `<div class="card warn-card"><div class="h3">Could not load ${esc(meta.title)}</div>
        <div class="tiny">The degree's course list did not download. Check the connection and try again.</div>
        <button class="btn sm" style="margin-top:10px" data-retry>Try again</button></div>`
    : `<div class="card"><div class="h3">${meta.icon} Loading ${esc(meta.title)}…</div><div class="tiny">${meta.courses} courses, ${meta.units} units.</div></div>`;
}

function ensure(id, root, rerender) {
  if (degreeData(id)) return;
  root.querySelector('[data-retry]')?.addEventListener('click', () => { failed[id] = false; rerender(); });
  if (failed[id]) return;
  loadDegree(id).then(() => rerender()).catch(() => { failed[id] = true; rerender(); });
}

/* ---------------------------------- pieces -------------------------------- */

function taskRow(id, t) {
  const r = S.tracks[id];
  if (t.kind === 'assessment') {
    return `<div class="res deg-task">
      <span class="res-check static">✎</span>
      <div class="grow"><div class="tiny">${esc(courseName(t.course))} · assessment · ${t.hours || '?'} h</div>
        <div class="res-name">${esc(t.title)}</div>
        <div class="tiny" style="margin-top:2px">${esc(t.text)}</div>
        <button class="btn xs" style="margin-top:8px" data-mark="${t.assessment.id}" data-course="${t.course.key}">Mark it</button></div></div>`;
  }
  const done = t.kind === 'week' ? M.weekDone(r, t.unit, t.week) : M.unitDone(r, t.unit);
  const tick = t.kind === 'week' ? `data-week="${t.unit.id}|${t.week.week}"` : `data-unit="${t.unit.id}"`;
  return `<div class="res deg-task ${done ? 'done' : ''}">
    <button class="res-check" ${tick} aria-label="${done ? 'Untick' : 'Tick as done'}">${done ? '✓' : ''}</button>
    <div class="grow"><div class="tiny">${esc(courseName(t.course))} · ${t.kind === 'week' ? `week ${t.week.week}` : esc(t.unit.label)} · ${t.hours || '?'} h</div>
      <div class="res-name">${t.url ? link(t.url, t.title) : esc(t.title)}</div>
      <div class="tiny" style="margin-top:2px">${esc(t.text)}</div>
      ${t.produce ? `<div class="tiny deg-produce"><b>Produce:</b> ${esc(t.produce)}</div>` : ''}
      <button class="linkish tiny" data-open-course="${t.course.key}">Open the course</button></div></div>`;
}

/** Practice across the courses you are in now: one check per course a day, due skills first. */
function practiceCard(id, D, r) {
  const courses = M.pathCourses(D, r).filter(c => c.term <= M.currentTerm(D, r) && !M.courseStatus(D, r, c).passed);
  const rows = courses.map(c => {
    const ids = coursePractice(id, c.key);
    if (!ids.length) return '';
    const key = `course:${c.key}`, done = E.checkDoneToday(id, key);
    const due = ids.filter(s => !levelOf(r.skills?.[s]) || (r.skills[s].due && r.skills[s].due <= today())).length;
    return `<div class="between deg-prac"><div class="grow"><div class="h3 truncate">${esc(c.code || c.title)}</div>
        <div class="tiny">${ids.length} skill${ids.length === 1 ? '' : 's'} · ${done ? 'checked today' : due ? `${due} due or new` : 'none due'}</div></div>
      ${done ? '<span class="badge good">✓</span>' : `<button class="btn ${due ? 'primary' : ''} sm" data-check="${c.key}">Check</button>`}</div>`;
  }).join('');
  if (!rows) return '';
  return `<div class="card"><div class="between"><div class="h3">Practice the app marks</div><span class="badge">pays XP</span></div>
    <div class="tiny" style="margin-top:4px">Short timed checks on what these courses teach. Skills level up and come back when they fall due — the only part of a degree the app can mark itself.</div>
    <div style="margin-top:8px">${rows}</div></div>`;
}

function paceCard(id, D, r) {
  const p = M.projection(D, r, today());
  return `<div class="card">
    <div class="between"><div class="h3">Your pace</div><span class="tiny">${hm(p.hoursLeft * 60)} of study left</span></div>
    <div class="seg" style="margin-top:10px">${M.PACE_HOURS.map(h => `<button class="${r.hours === h ? 'on' : ''}" data-hours="${h}">${h} h</button>`).join('')}</div>
    <div class="tiny" style="margin-top:8px">${r.hours} hours a week ≈ ${p.weeks} weeks to go, finishing around <b>${esc(shortDateKey(p.finish))}</b>.
      A university student puts in 40–50; the material is the same, only the calendar changes.</div>
    <div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" data-timer>${icon('clock', 14).value} Study with the timer</button>
      <span class="tiny grow">Timed minutes pay XP and keep your streak.</span></div>
  </div>`;
}

/* ---------------------------------- tabs ---------------------------------- */

function weekTab(id, D, r) {
  const tasks = M.nextTasks(D, r, { limit: 8 }), locked = M.lockedNow(D, r), prog = M.degreeProgress(D, r);
  const t = prog.term;
  if (t >= D.terms.length) {
    return `<div class="card"><div class="h2">🎓 Every course passed</div>
      <div class="sub" style="margin-top:6px">${esc(D.title)} is complete on the map: ${prog.passed} courses and ${prog.credits} credits. Keep the practice sharp, and look at the Record.</div></div>
      ${practiceCard(id, D, r)}`;
  }
  const concTerm = Math.min(...D.concentrations.flatMap(c => c.courses).map(k => M.courseByKey(D, k)?.term ?? 99));
  const choose = M.needsConcentration(D, r) && t >= concTerm - 1
    ? `<div class="card warn-card"><div class="h3">Choose your concentration</div>
        <div class="tiny">Its courses start in ${esc(D.terms[concTerm] || 'a later term')}.</div>
        <button class="btn sm" style="margin-top:8px" data-tab="path">Choose on the Path</button></div>` : '';
  return `${choose}
    <div class="card">
      <div class="between"><div class="h3">Next up · ${esc(M.termShort(D.terms[t]))}</div><span class="tiny">${prog.unitsDone}/${prog.units} units</span></div>
      <div class="tiny" style="margin-top:4px">The next piece of work in each course you are taking now. Tick it when it is really done — that is your word, not a grade.</div>
      <div class="res-list" style="margin-top:10px">${tasks.length ? tasks.map(x => taskRow(id, x)).join('') : '<div class="tiny">Nothing open — see the locked courses below, or the Path.</div>'}</div>
    </div>
    ${locked.length ? `<div class="card sunk"><div class="h3">🔒 Waiting on prerequisites</div>${locked.map(c => `<div class="tiny" style="margin-top:6px">
        <button class="linkish" data-open-course="${c.key}">${esc(courseName(c))}</button> needs ${M.missingPrereqs(D, r, c).map(p => esc(p.code || p.title)).join(', ')}</div>`).join('')}</div>` : ''}
    ${practiceCard(id, D, r)}
    ${paceCard(id, D, r)}
    <details class="card sunk flush explain"><summary><span class="h3 grow">How a degree works here</span><span class="chev">${icon('chevron', 16).value}</span></summary>
      <div class="topic-bd">
        <p class="sub">${esc(D.title)} is ${D.terms.length} terms of courses in the order a university teaches them, each built on free material from the people who teach it — ${esc(D.workload)}</p>
        <p class="sub" style="margin-top:8px">Each course has units of work, and most have weekly assignments that say exactly what to read or watch and what to produce. Tick them as you finish. Each course ends with assessments you sit and mark against their rubric; pass them and the course passes.</p>
        <p class="sub" style="margin-top:8px">None of that pays XP — it is your own account, and Codify only pays for what it can check. What pays: the practice checks (marked by the app) and time on the focus timer.</p>
        <p class="sub" style="margin-top:8px">${esc(D.notice)}</p>
      </div></details>`;
}

function pathTab(id, D, r) {
  const prog = M.degreeProgress(D, r), conc = M.concentrationOf(D, r);
  const concTerm = Math.min(...D.concentrations.flatMap(c => c.courses).map(k => M.courseByKey(D, k)?.term ?? 99));
  const terms = D.terms.map((label, t) => {
    const courses = M.termCourses(D, r, t), passed = courses.filter(c => M.courseStatus(D, r, c).passed).length;
    const cur = t === prog.term;
    return `${t === concTerm ? '%%CONC%%' : ''}<div class="card month-card ${t > prog.term ? 'locked' : ''}" style="--mc:${cur ? 'var(--accent)' : 'var(--ink)'}">
      <div class="between"><div class="h3">${esc(label)}</div><span class="badge ${passed === courses.length && courses.length ? 'good' : cur ? 'solid' : ''}">${passed}/${courses.length}</span></div>
      <div class="deg-courses">${courses.map(c => {
        const s = M.courseStatus(D, r, c);
        return `<button class="deg-course" data-open-course="${c.key}">
          <div class="between"><span class="tiny">${esc(c.code)}${c.prereqs.length ? ` · after ${c.prereqs.map(k => esc(M.courseByKey(D, k)?.code || k)).join(', ')}` : ''}</span>${badge(s)}</div>
          <div class="h3" style="margin-top:2px">${esc(c.title)}</div>
          <div style="margin-top:6px">${bar((s.unitsDone / s.units) * 100, { color: s.passed ? 'var(--good)' : 'var(--accent)' })}</div>
          <div class="tiny" style="margin-top:4px">${s.unitsDone}/${s.units} units · ${s.marked}/${s.assessments} assessments marked${coursePractice(id, c.key).length ? ' · practice' : ''}</div>
        </button>`;
      }).join('') || '<div class="tiny">Your concentration\'s courses go here once you choose one.</div>'}</div></div>`;
  }).join('');
  const concentrations = D.concentrations.length ? `<div class="card">
      <div class="between"><div class="h3">Concentration</div>${conc ? `<span class="badge solid">${esc(conc.title)}</span>` : '<span class="badge warn">not chosen</span>'}</div>
      <div class="tiny" style="margin-top:4px">Two courses that go deep in one direction, in the last terms. You can change your mind until you start them.</div>
      <div class="stack s2" style="margin-top:10px">${D.concentrations.map(c => `<button class="card tap pad-s opt ${conc?.key === c.key ? 'on' : ''}" data-conc="${c.key}">
        <div class="h3">${esc(c.title)}</div><div class="tiny">${esc(c.description)}</div>
        <div class="tiny" style="margin-top:4px">${c.courses.map(k => esc(M.courseByKey(D, k)?.title || k)).join(' · ')}</div>
        ${c.capstones[0] ? `<div class="tiny" style="margin-top:4px">Capstone idea: ${esc(c.capstones[0])}</div>` : ''}</button>`).join('')}</div></div>` : '';
  return `<div class="card">
      <div class="label">${esc(D.duration)} · ${esc(D.credential)}</div>
      <div class="sub" style="margin-top:6px">${esc(D.summary)}</div>
      <details class="deg-more"><summary class="tiny"><b>What you will be able to do</b></summary>
        <ul class="focus">${D.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul></details>
      <div style="margin-top:10px">${bar((prog.passed / Math.max(1, prog.courses)) * 100, { color: 'var(--ink)' })}</div>
      <div class="tiny" style="margin-top:4px">${prog.passed} of ${prog.courses} courses · ${prog.credits}/${prog.creditsTotal} ${esc(M.creditSystem(D))}</div>
    </div>
    ${terms.includes('%%CONC%%') ? terms.replace('%%CONC%%', concentrations) : concentrations + terms}`;
}

function recordTab(id, D, r) {
  const prog = M.degreeProgress(D, r), rows = M.transcript(D, r);
  return `<div class="grid3">
      <div class="tile"><div class="v">${prog.passed}</div><div class="k">courses passed</div></div>
      <div class="tile"><div class="v">${prog.credits}</div><div class="k">credits</div></div>
      <div class="tile"><div class="v">${prog.unitsDone}</div><div class="k">units done</div></div></div>
    <div class="card"><div class="h3">Transcript</div>
      ${rows.length ? rows.map(x => `<div class="between res-row"><div class="grow"><div class="h3 truncate">${esc(courseName(x.course))}</div>
          <div class="tiny">${esc(D.terms[x.course.term] || '')}${x.day ? ` · passed ${esc(shortDateKey(x.day))}` : ''} · ${x.credits} credits</div></div>
          <span class="badge good">${pct(x.status.pct)}</span></div>`).join('') : '<div class="tiny" style="margin-top:6px">No course passed yet. A course passes when its units are done and its assessments, marked against their rubrics, clear its bar.</div>'}
    </div>
    <div class="card sunk"><div class="h3">Coming from Course Atlas?</div>
      <div class="tiny" style="margin-top:4px">Save a progress backup from the Course Atlas footer, then load it here. Finished units, assessment scores, your concentration and pace come across; nothing here is overwritten.</div>
      <button class="btn sm" style="margin-top:10px" data-import>Load a Course Atlas backup</button></div>
    <div class="card sunk"><div class="tiny">${esc(D.notice)}</div></div>`;
}

/* --------------------------------- course --------------------------------- */

function unitBlock(id, D, r, c, u) {
  const done = M.unitDone(r, u), open = st(id).open === u.id;
  const weeks = u.weeks?.length ? `<div class="checklist">${u.weeks.map(w => {
    const ok = M.weekDone(r, u, w);
    return `<div class="chk ${ok ? 'pass' : ''}"><button class="chk-mark" data-week="${u.id}|${w.week}" aria-label="${ok ? 'Untick' : 'Tick'} week ${w.week}">${ok ? '✓' : ''}</button>
      <div class="grow"><div class="chk-label">${w.url ? link(w.url, weekTitle(w)) : esc(weekTitle(w))} <span class="tiny">· ${w.hours} h</span></div>
        <div class="tiny">${esc(w.activity)}</div><div class="tiny deg-produce"><b>Produce:</b> ${esc(w.deliverable)}</div></div></div>`;
  }).join('')}</div>` : `<button class="btn ${done ? '' : 'primary'} sm" style="margin-top:10px" data-unit="${u.id}">${done ? '✓ Done — untick' : 'Tick the unit as done'}</button>`;
  const practice = unitPractice(u.id, c.key, u.order, id), assessments = c.assessments.filter(a => a.unit === u.id);
  const cur = curriculumFor(id, c.key), sets = cur?.problemSets?.[u.order] || [];
  const grader = cur?.grader || 'CS50\'s check50 — run each command in a terminal with check50 installed. That is CS50\'s own grader, not this app.';
  const psets = sets.length ? `<div class="deg-psets"><div class="h3">Problem sets</div>
      <div class="tiny">Checked by ${esc(grader)}</div>
      ${sets.map(p => `<div class="deg-pset"><span class="grow">${link(p.url, p.name)}</span>${p.cmd ? `<code>${esc(p.cmd)}</code>` : ''}</div>`).join('')}</div>` : '';
  return `<details class="card flush topic deg-unit ${done ? 'done' : ''}" data-unit-block="${u.id}" ${open ? 'open' : ''}>
    <summary class="between" style="padding:12px 14px"><span class="deg-tick ${done ? 'on' : ''}">${done ? '✓' : u.order}</span>
      <div class="grow"><div class="tiny">${esc(u.label)} · ${esc(u.kind)} · ${u.hours} h</div><div class="h3">${esc(u.title)}</div></div>
      <span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd">
      <div class="sub">${esc(u.activity)}</div>
      ${u.evidence ? `<div class="tiny deg-produce" style="margin-top:6px"><b>Produce:</b> ${esc(u.evidence)}</div>` : ''}
      ${u.where ? `<div class="tiny" style="margin-top:6px"><b>Where:</b> ${u.url ? link(u.url, u.where.split(' — ').slice(0, 3).join(' — ')) : esc(u.where)}</div>` : ''}
      ${weeks}
      ${psets}
      ${practice.length ? `<div class="between deg-prac" style="margin-top:10px"><div class="grow"><div class="h3">Practice this unit</div>
          <div class="tiny">${practice.map(s => esc(skillById(s)?.name || s)).join(' · ')}</div></div>
        <button class="btn sm" data-ucheck="${u.id}">Check</button></div>` : ''}
      ${assessments.map(a => `<div class="tiny" style="margin-top:8px">📝 This unit ends with <b>${esc(a.title)}</b> — mark it below.</div>`).join('')}
      <label class="field" style="margin-top:10px"><span class="tiny">Your evidence — a link or a note</span>
        <textarea class="input" rows="2" data-note="${u.id}" placeholder="Repo, notebook, photo of your notes…">${esc(r.notes?.[u.id] || '')}</textarea></label>
    </div></details>`;
}

/** What each degree's outcomes are mapped to (the codes under each outcome). */
const STANDARD = { cs: 'CS2023', math: 'QAA MSOR and the GRE', phys: 'the GRE and AAPT', ee: 'ABET and the FE exam', me: 'ABET and the FE exam' };

function anchorsFor(id, c, a, x) {
  const an = curriculumFor(id, c.key)?.anchors?.[`${a.stage}/${x.criterion}`];
  if (!an) return `<div class="tiny">${esc(x.description)}</div>`;
  // The rubric itself says what partial credit is worth ("…award 15 when…"); say so only when it does.
  const part = x.partial ?? x.description?.match(/award (\d+) when/i)?.[1];
  return `<div class="deg-anchors"><div class="tiny"><b>${x.points}:</b> ${esc(an.full)}</div><div class="tiny"><b>${part ?? `≈ ${Math.round(x.points / 2)}`}:</b> ${esc(an.part)}</div><div class="tiny"><b>0:</b> ${esc(an.none)}</div></div>`;
}

function keyChecksFor(id, r, c, a) {
  const checks = curriculumFor(id, c.key)?.keyChecks?.[a.stage] || [];
  if (!checks.length) return '';
  return `<div class="deg-keys"><div class="h3">Check your numbers</div>
    <div class="tiny">The app works these out itself. Get them right before you mark the accuracy lines.</div>
    ${checks.map(k => { const got = r.keys?.[k.id]; return `<div class="deg-key" data-key-row="${k.id}"><div class="tiny grow">${esc(k.q)}</div>
      <input class="input num" inputmode="decimal" data-key-input="${k.id}" value="${got ? got.value : ''}" aria-label="Your answer">
      <button class="btn sm" data-key="${k.id}" data-key-course="${c.key}" data-key-stage="${a.stage}">Check</button>
      ${got ? `<span class="badge ${got.ok ? 'good' : 'warn'}">${got.ok ? '✓ right' : '✗ not yet'}</span>` : ''}</div>`; }).join('')}</div>`;
}

function assessmentBlock(id, D, r, a, c) {
  const rec = M.assessmentRecord(r, a), max = a.rubric.length ? a.rubric.reduce((n, x) => n + x.points, 0) : a.max;
  const ok = rec && M.assessmentPassed(r, a);
  const form = a.rubric.length
    ? `<div class="deg-rubric">${a.rubric.map(x => `<label class="deg-crit"><div class="grow"><div class="h3">${esc(x.criterion)} <span class="tiny">/ ${x.points}</span></div>
          ${anchorsFor(id, c, a, x)}</div>
        <input class="input num" type="number" inputmode="numeric" min="0" max="${x.points}" step="1" data-pt="${esc(x.criterion)}" value="${rec?.points?.[x.criterion] ?? ''}"></label>`).join('')}</div>`
    : `<label class="deg-crit"><div class="grow"><div class="h3">Your score <span class="tiny">/ ${a.max}</span></div>
        <div class="tiny">Mark it honestly against the instructions above.</div></div>
        <input class="input num" type="number" inputmode="numeric" min="0" max="${a.max}" step="1" data-score value="${rec?.score ?? ''}"></label>`;
  return `<div class="card deg-assess ${ok ? 'got' : ''}" data-assess="${a.id}">
    <div class="between"><div class="tiny">${esc(a.stage || 'assessment')} · ${a.hours || '?'} h${a.weight ? ` · ${a.weight}% of the grade` : ''}</div>
      ${a.required ? '<span class="badge">required</span>' : ''}</div>
    <div class="h3" style="margin-top:4px">${esc(a.title)}</div>
    <div class="sub" style="margin-top:4px">${esc(a.instructions)}</div>
    ${a.evidence.length ? `<div class="tiny deg-produce" style="margin-top:6px"><b>Submit:</b> ${a.evidence.map(esc).join('; ')}</div>` : ''}
    ${keyChecksFor(id, r, c, a)}
    <details class="deg-more" ${rec ? '' : 'open'}><summary class="tiny"><b>${rec ? `Marked ${rec.score}/${rec.max}${a.pass != null ? ` · pass ${a.pass}` : ''} — ${ok ? 'passed' : 'below the bar'}` : `Mark it${a.pass != null ? ` · pass mark ${a.pass}/${max}` : ''}`}</b></summary>
      ${form}
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn primary sm" data-save-assess="${a.id}">Save the mark</button>
        ${rec ? `<button class="btn ghost sm" data-clear-assess="${a.id}">Clear</button>` : ''}</div></details>
  </div>`;
}

function coursePage(id, D, r, c) {
  const s = M.courseStatus(D, r, c), practice = coursePractice(id, c.key), waived = !!r.waived?.[c.key];
  const missing = M.missingPrereqs(D, r, c);
  const lock = missing.length ? `<div class="card warn-card"><div class="h3">🔒 Needs ${missing.map(p => esc(courseName(p))).join(', ')}</div>
      <div class="tiny">Pass ${missing.length === 1 ? 'it' : 'them'} first — or, if you already know ${missing.length === 1 ? 'it' : 'them'}, unlock this course yourself.</div>
      <button class="btn sm" style="margin-top:8px" data-waive="${c.key}">I already know ${missing.length === 1 ? 'it' : 'these'} — unlock</button></div>`
    : waived ? `<div class="tiny">Prerequisites waived by you. <button class="linkish tiny" data-unwaive="${c.key}">Undo</button></div>` : '';
  return `<button class="back-link" data-close-course>${icon('back', 16).value} ${esc(D.title)}</button>
    <div class="card">
      <div class="between"><span class="label">${esc(c.code)} · ${esc(D.terms[c.term] || '')} · ${c.hours} h</span>${badge(s)}</div>
      <div class="h2" style="margin-top:6px">${esc(c.title)}</div>
      <div class="sub" style="margin-top:4px">${esc(c.summary)}</div>
      <div style="margin-top:10px">${bar((s.unitsDone / s.units) * 100, { color: s.passed ? 'var(--good)' : 'var(--accent)' })}</div>
      <div class="tiny" style="margin-top:4px">${s.unitsDone}/${s.units} units · grade ${pct(s.pct)} of ${c.passing}% needed · ${hm(s.hoursLeft * 60)} left</div>
      ${!s.passed && s.blockers.length ? `<div class="tiny" style="margin-top:4px">To pass: ${s.blockers.map(esc).join(' · ')}</div>` : ''}
    </div>
    ${lock}
    <div class="card"><div class="h3">Start here</div><div class="sub" style="margin-top:4px">${esc(c.first)}</div>
      ${c.setup.length ? `<details class="deg-more"><summary class="tiny"><b>Set up</b></summary><ul class="focus">${c.setup.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${curriculumFor(id, c.key) ? '' : `<details class="deg-more"><summary class="tiny"><b>What you will be able to do</b></summary><ul class="focus">${c.outcomes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`}
    </div>
    ${courseProject(id, c)}
    ${outcomesCard(id, r, c)}
    <div class="card"><div class="h3">Free material</div><div class="res-list">${c.resources.map(x => `<div class="res">
        <span class="res-check static">${x.role === 'primary' ? '★' : '·'}</span>
        <div class="grow"><div class="res-name">${link(x.url, x.title)}</div>
          <div class="tiny">${esc(x.provider)}${x.license ? ` · ${x.licenseUrl ? link(x.licenseUrl, x.license) : esc(x.license)}` : ''}${x.free ? ' · free' : ''}</div></div></div>`).join('')}</div></div>
    ${practice.length ? `<div class="card"><div class="between"><div class="h3">Practice the app marks</div>
        ${E.checkDoneToday(id, `course:${c.key}`) ? '<span class="badge good">✓ checked today</span>' : `<button class="btn primary sm" data-check="${c.key}">Check</button>`}</div>
      <div class="lv-chips" style="margin-top:8px">${practice.map(sk => `<button class="lv-chip ${levelOf(r.skills?.[sk]) ? '' : 'new'}" data-practice="${sk}">${esc(skillById(sk)?.name || sk)} <b>${levelOf(r.skills?.[sk]) ? `Lv ${levelOf(r.skills[sk])}` : 'new'}</b></button>`).join('')}</div>
      <div class="tiny" style="margin-top:6px">Check moves levels and pays XP, once a day. Tap a skill to practise it with no clock.</div></div>` : ''}
    <div class="section-head"><div class="h2">Units</div><span class="tiny">${s.unitsDone}/${s.units}</span></div>
    <div class="stack s2">${c.units.map(u => unitBlock(id, D, r, c, u)).join('')}</div>
    <div class="section-head"><div class="h2">Assessments</div><span class="tiny">pass at ${c.passing}%</span></div>
    <div class="stack s2">${c.assessments.map(a => assessmentBlock(id, D, r, a, c)).join('')}</div>
    ${benchmarksCard(id, r, c)}
    ${auditCard(id, c)}`;
}

/** The term's flagship project, on the course pages it draws on. */
function courseProject(id, c) {
  const f = FLAGSHIPS.find(x => x.track === id && x.uses.includes(c.key));
  return f ? `<div class="stack s1"><div class="label">This course feeds a flagship project</div>${projectCard(f)}</div>` : '';
}

/* -------------------------- audited course design -------------------------- */

const MAX_LV = 10;
/** How far along an outcome is: the average level of the skills that check it, out of 10. */
const outcomeLevel = (r, o) => (o.skills.length ? o.skills.reduce((n, sk) => n + levelOf(r.skills?.[sk]), 0) / o.skills.length : null);

function outcomesCard(id, r, c) {
  const cur = curriculumFor(id, c.key);
  if (!cur) return '';
  const tests = E.courseTestsOf(id, c.key), last = kind => [...tests].reverse().find(t => t.kind === kind);
  const place = last('placement'), fin = last('final');
  const testable = cur.outcomes.filter(o => o.skills.length).length;
  return `<div class="card"><div class="between"><div class="h3">What you will be able to do</div><span class="tiny">${cur.outcomes.length} outcomes · mapped to ${esc(STANDARD[id] || 'a standard')}</span></div>
    <div class="deg-outcomes">${cur.outcomes.map(o => {
      const lv = outcomeLevel(r, o), p = place?.outcomes?.[o.id], f = fin?.outcomes?.[o.id];
      return `<div class="deg-outcome"><div class="between"><div class="grow"><div class="h3">${esc(o.text)}</div>
          <div class="tiny">${o.cs2023.map(esc).join(' · ')}${o.units.length ? ` · unit${o.units.length > 1 ? 's' : ''} ${o.units.join(', ')}` : ''}${o.assessed.length ? ` · graded in the ${o.assessed.join(' and ')}` : ''}</div></div>
          ${p != null || f != null ? `<span class="tiny">${p != null ? `before ${p ? '✓' : '✗'}` : ''}${p != null && f != null ? ' · ' : ''}${f != null ? `after ${f ? '✓' : '✗'}` : ''}</span>` : ''}</div>
        ${lv == null ? '<div class="tiny" style="margin-top:4px">Judged by the rubric — the app cannot mark this one.</div>'
          : `<div style="margin-top:6px">${bar((lv / MAX_LV) * 100, { color: lv >= 5 ? 'var(--good)' : 'var(--accent)' })}</div>
             <div class="tiny" style="margin-top:2px">level ${lv.toFixed(1)} of ${MAX_LV} across ${o.skills.map(sk => esc(skillById(sk)?.name || sk)).join(', ')}</div>`}</div>`;
    }).join('')}</div>
    <div class="deg-tests">
      <div class="tiny">${testable} questions, one per outcome the app can check, at level ${E.COURSE_TEST.level}. Nothing levels — it measures. Take the placement test before you start and the end-of-course test after.</div>
      <div class="row" style="gap:8px;margin-top:8px">
        <button class="btn sm" data-ctest="placement" data-ctest-course="${c.key}">Placement test${place ? ` · last ${place.right}/${place.total}` : ''}</button>
        <button class="btn sm" data-ctest="final" data-ctest-course="${c.key}">End-of-course test${fin ? ` · last ${fin.right}/${fin.total}` : ''}</button>
      </div></div></div>`;
}

function benchmarksCard(id, r, c) {
  const cur = curriculumFor(id, c.key);
  if (!cur?.benchmarks?.length) return '';
  return `<div class="card"><div class="h3">Outside benchmarks</div>
    <div class="tiny" style="margin-top:4px">Checks that are not you and not this app — each one below is scored by someone else's exam, grader or leaderboard. Record what you get; it pays nothing, but it is the honest test of everything above.</div>
    ${cur.benchmarks.map(b => {
      const hist = r.benchmarks?.[b.id] || [], lastB = hist.at(-1);
      return `<div class="deg-bench" data-bench-row="${b.id}"><div class="grow"><div class="h3">${link(b.url, b.name)}</div><div class="tiny">${esc(b.how)}</div>
          ${lastB ? `<div class="tiny" style="margin-top:2px"><b>Last: ${lastB.score}/${lastB.max}</b> on ${esc(lastB.day)}${hist.length > 1 ? ` · ${hist.length} attempts` : ''}</div>` : ''}</div>
        <div class="row" style="gap:6px"><input class="input num" inputmode="decimal" data-bench-input="${b.id}" placeholder="0–${b.max}" aria-label="Score"><button class="btn sm" data-bench="${b.id}" data-bench-max="${b.max}">Save</button></div></div>`;
    }).join('')}</div>`;
}

function auditCard(id, c) {
  const cur = curriculumFor(id, c.key);
  if (!cur?.gaps?.length) return '';
  return `<details class="card sunk flush explain"><summary><span class="h3 grow">What the October 2026 audit changed</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd">${cur.gaps.map(g => `<p class="sub" style="margin-top:6px"><b>${esc(g.what)}.</b> ${esc(g.why)} ${esc(g.fix)} ${g.url ? link(g.url, 'Source') : ''}</p>`).join('')}
      <p class="tiny" style="margin-top:8px">The full audit, with its evidence, is in ${esc(cur.doc || 'docs/cs-term1-audit.md')}.</p></div></details>`;
}

/* ---------------------------------- hub ----------------------------------- */

const TABS = [['week', 'This week'], ['path', 'Path'], ['projects', 'Projects'], ['record', 'Record']];

export function hubFor(id) {
  return {
    render() {
      const meta = degreeMeta(id), D = degreeData(id), r = S.tracks[id], u = st(id);
      if (!D) return `<div class="fade-up"><div class="page-head"><div class="h1">${esc(meta.title)}</div></div>${loading(id)}</div>`;
      const c = u.course && M.courseByKey(D, u.course);
      if (c) return `<div class="fade-up stack s3">${coursePage(id, D, r, c)}</div>`;
      const prog = M.degreeProgress(D, r);
      const body = u.tab === 'path' ? pathTab(id, D, r) : u.tab === 'record' ? recordTab(id, D, r) : u.tab === 'projects' ? projectsTab(id, currentFlagship(id)) : weekTab(id, D, r);
      return `<div class="fade-up">
        <div class="between page-head"><div><div class="h1">${esc(D.title)}</div>
          <div class="sub">${prog.term < D.terms.length ? esc(M.termShort(D.terms[prog.term])) : 'Complete'} · ${prog.passed}/${prog.courses} courses</div></div>
          <span class="badge solid">${meta.icon} ${esc(D.short)}</span></div>
        <div class="seg" style="margin-top:14px">${TABS.map(([k, l]) => `<button class="${k === u.tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
        <div class="stack s3" style="margin-top:16px">${body}</div>
      </div>`;
    },
    mount(root, rerender) {
      ensure(id, root, rerender);
      mountDegree(id, root, rerender);
    },
  };
}

/** Every button a degree screen or its Today card can show. */
export function mountDegree(id, root, rerender) {
  const D = degreeData(id), u = st(id), view = () => document.getElementById('view');
  const on = (sel, fn) => root.querySelectorAll(sel).forEach(el => el.addEventListener('click', e => { e.preventDefault(); fn(el, e); }));
  on('[data-tab]', b => { u.tab = b.dataset.tab; u.course = null; rerender(); view()?.scrollTo({ top: 0 }); });
  on('[data-open-course]', b => { u.course = b.dataset.openCourse; u.open = null; rerender(); view()?.scrollTo({ top: 0 }); });
  on('[data-close-course]', () => { u.course = null; rerender(); view()?.scrollTo({ top: 0 }); });
  on('[data-week]', b => { const [unit, w] = b.dataset.week.split('|'); u.open = unit; afterTick(id, D, () => A.toggleWeek(id, unit, +w)); });
  on('[data-unit]', b => { u.open = b.dataset.unit; afterTick(id, D, () => A.toggleUnit(id, b.dataset.unit)); });
  on('[data-hours]', b => A.setHours(id, +b.dataset.hours));
  on('[data-conc]', b => {
    const key = b.dataset.conc, r = S.tracks[id];
    A.setConcentration(id, r.concentration === key ? null : key);
  });
  on('[data-waive]', b => A.waive(id, b.dataset.waive, true));
  on('[data-unwaive]', b => A.waive(id, b.dataset.unwaive, false));
  on('[data-timer]', () => { if (timerRunning()) toast('The timer is already running.'); openFocus(rerender); });
  on('[data-check]', b => {
    const c = M.courseByKey(D, b.dataset.check), ids = E.pickCheck(id, coursePractice(id, c.key));
    openCheck(id, ids, { key: `course:${c.key}`, label: `${c.code || c.title} check` }, rerender);
  });
  on('[data-ucheck]', b => {
    const hit = M.unitById(D, b.dataset.ucheck);
    openCheck(id, unitPractice(b.dataset.ucheck, hit.course.key, hit.unit.order, id), { key: `unit:${b.dataset.ucheck}`, label: `${hit.course.code} · ${hit.unit.title}` }, rerender);
  });
  on('[data-practice]', b => openPractice(id, b.dataset.practice, rerender));
  mountProjects(root, rerender);
  on('[data-ctest]', b => {
    const c = M.courseByKey(D, b.dataset.ctestCourse), cur = curriculumFor(id, c.key);
    const items = cur.outcomes.filter(o => o.skills.length).map(o => ({ outcome: o.id, text: o.text, skill: o.skills[Math.floor(Math.random() * o.skills.length)] }));
    openCourseTest(id, c.key, b.dataset.ctest, items, { label: `${c.code} ${b.dataset.ctest === 'placement' ? 'placement' : 'end-of-course'} test` }, rerender);
  });
  on('[data-bench]', b => {
    const input = root.querySelector(`[data-bench-input="${b.dataset.bench}"]`);
    if (!A.recordBenchmark(id, b.dataset.bench, input.value, +b.dataset.benchMax)) toast(`Enter a score from 0 to ${b.dataset.benchMax}.`);
  });
  on('[data-key]', b => {
    const cur = curriculumFor(id, b.dataset.keyCourse), check = cur.keyChecks[b.dataset.keyStage].find(k => k.id === b.dataset.key);
    const input = root.querySelector(`[data-key-input="${b.dataset.key}"]`);
    const res = A.answerKeyCheck(id, check, input.value);
    if (!res) toast('Enter a number.');
  });
  on('[data-mark]', b => { u.course = b.dataset.course; rerender(); setTimeout(() => document.querySelector(`[data-assess="${b.dataset.mark}"]`)?.scrollIntoView({ block: 'start' }), 60); });
  on('[data-save-assess]', b => {
    const card = b.closest('[data-assess]'), aid = b.dataset.saveAssess;
    const pts = [...card.querySelectorAll('[data-pt]')];
    const score = card.querySelector('[data-score]');
    if (pts.length && pts.some(i => i.value === '')) { toast('Give every rubric line a score first.'); return; }
    if (score && score.value === '') { toast('Enter a score first.'); return; }
    const before = M.courseStatus(D, S.tracks[id], courseOfAssessment(D, aid)).passed;
    const rec = A.markAssessment(id, aid, pts.length ? { points: Object.fromEntries(pts.map(i => [i.dataset.pt, i.value])) } : { score: score.value });
    if (!rec) { toast('That mark could not be saved.'); return; }
    celebrate(id, D, courseOfAssessment(D, aid), before);
  });
  on('[data-clear-assess]', b => A.clearAssessment(id, b.dataset.clearAssess));
  on('[data-import]', () => importBackup(rerender));
  root.querySelectorAll('[data-note]').forEach(t => t.addEventListener('change', () => A.setNote(id, t.dataset.note, t.value)));
  root.querySelectorAll('[data-unit-block]').forEach(d => d.addEventListener('toggle', () => { if (d.open) u.open = d.dataset.unitBlock; }));
}

const courseOfAssessment = (D, aid) => D.courses.find(c => c.assessments.some(a => a.id === aid));

function afterTick(id, D, fn) {
  const hitCourses = M.pathCourses(D, S.tracks[id]);
  const before = new Set(hitCourses.filter(c => M.courseStatus(D, S.tracks[id], c).passed).map(c => c.key));
  fn();
  for (const c of hitCourses) if (!before.has(c.key) && M.courseStatus(D, S.tracks[id], c).passed) celebrate(id, D, c, false);
}

function celebrate(id, D, c, before) {
  if (!c || before || !M.courseStatus(D, S.tracks[id], c).passed) return;
  confetti(90); sfx('reward');
  toast(`🎓 <b>${esc(c.code || '')} passed</b> — ${esc(c.title)}`, 3600);
}

async function importBackup(rerender) {
  const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'application/json,.json' });
  inp.onchange = async () => {
    const f = inp.files?.[0];
    if (!f) return;
    const text = await f.text();
    try { await Promise.all(DEGREES.map(d => loadDegree(d.id))); }
    catch { toast('Could not load the degrees to match the backup against — check the connection.'); return; }
    const res = A.importAtlas(text);
    if (!res.ok) { toast(esc(res.error), 4000); return; }
    const lines = Object.entries(res.found).map(([id, f]) => `<div class="between res-row"><span class="h3">${esc(degreeMeta(id).title)}</span>
      <span class="tiny">${f.units} units · ${f.assessments} assessments</span></div>`).join('');
    dialog(`<div class="h2">Course Atlas progress loaded</div><div class="card sunk" style="margin-top:12px;text-align:left">${lines}</div>
      <button class="btn primary block" style="margin-top:14px" data-ok>Done</button>`, (d, close) => { d.querySelector('[data-ok]').onclick = () => { close(); rerender(); }; });
  };
  inp.click();
}

/* -------------------------------- today card ------------------------------ */

export function todayCard(id) {
  const meta = degreeMeta(id), D = degreeData(id);
  if (!D) return `<div class="card track-card" style="--tc:${meta.color}"><div class="path-top"><span class="path-ico">${meta.icon}</span>
      <div class="grow"><div class="h3">${esc(meta.title)}</div><div class="tiny">Loading…</div></div></div></div>`;
  const r = S.tracks[id], prog = M.degreeProgress(D, r), tasks = M.nextTasks(D, r, { limit: 2 });
  const termFrac = D.terms.map((_, t) => {
    const cs = M.termCourses(D, r, t);
    return cs.length ? cs.filter(c => M.courseStatus(D, r, c).passed).length / cs.length : 0;
  });
  const dueCourse = M.pathCourses(D, r).find(c => c.term <= prog.term && !M.courseStatus(D, r, c).passed
    && coursePractice(id, c.key).length && !E.checkDoneToday(id, `course:${c.key}`));
  return `<div class="card track-card" style="--tc:${meta.color}" data-degree-card="${id}">
    <div class="path-top"><span class="path-ico">${meta.icon}</span>
      <div class="grow"><div class="h3">${prog.term < D.terms.length ? esc(M.termShort(D.terms[prog.term])) : 'Complete'} · ${esc(D.title)}</div>
        <div class="tiny truncate">${prog.passed} of ${prog.courses} courses passed · ${prog.unitsDone}/${prog.units} units</div></div>
      <button class="btn xs" data-go="${id}">Open</button></div>
    <div class="plan-bar" style="margin-top:10px;--cols:${D.terms.length}">${termFrac.map((f, t) => `<i class="${t <= prog.term ? 'open' : ''} ${f >= 1 ? 'cleared' : ''}" style="--f:${f}"></i>`).join('')}</div>
    ${tasks.length ? `<div class="res-list" style="margin-top:10px">${tasks.map(t => taskRow(id, t)).join('')}</div>` : ''}
    ${dueCourse ? `<div class="between" style="margin-top:10px"><span class="tiny grow">Practice due in ${esc(dueCourse.code || dueCourse.title)}</span>
      <button class="btn primary sm" data-check="${dueCourse.key}">Check</button></div>` : ''}
  </div>`;
}

export function mountToday(id, root, rerender) {
  const card = root.querySelector(`[data-degree-card="${id}"]`);
  if (!degreeData(id)) { loadDegree(id).then(() => rerender()).catch(() => {}); return; }
  if (card) mountDegree(id, card, rerender);
}

/** The focus timer can be tagged with any course you are in now. */
export function timerTags(id) {
  const D = degreeData(id), meta = degreeMeta(id);
  if (!D) return [];
  const r = S.tracks[id], term = M.currentTerm(D, r);
  return M.pathCourses(D, r).filter(c => c.term <= term && !M.courseStatus(D, r, c).passed)
    .map(c => ({ value: `${id}:${c.key}`, label: `${meta.title} · ${c.code ? `${c.code} ` : ''}${c.title}` }));
}
