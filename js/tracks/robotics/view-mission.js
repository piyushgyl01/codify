/**
 * Today's robotics mission: learn one thing, prove it, build a step. The Robots
 * tab opens here, and the robotics card on Today is a smaller copy of the card.
 */
import { S, commitsOn, today } from '../../state.js';
import { mission, isVerified, bossReady, toggleRead } from './actions.js';
import { missionAt, stepLine, stepName, TOTAL_MISSIONS } from './plan.js';
import { monthByN, topicById, buildById } from './roadmap.js';
import { skillById } from './skills.js';
import { bossFor } from './bosses.js';
import { esc, sheet } from '../../ui.js';
import { icon } from '../../icons.js';
import { openBoss } from './player.js';
import { openBuild } from './view-builds.js';
import { showMonth } from './view-plan.js';
import { openTab } from './hub.js';
import { go } from '../../router.js';
import * as Parts from '../../views/mission-parts.js';
import * as E from '../../learn/session.js';

const T = 'robotics';

export function missionTitle(m) {
  if (m.boss) return `Boss day: ${bossFor(m.month).name}`;
  return m.learn;
}

/* --------------------------------- steps ---------------------------------- */

function learnStep(m) {
  const t = topicById(m.topic);
  return `<button class="m-step tap" data-mission-learn>
    <span class="m-num">1</span>
    <div class="grow"><div class="label">Learn</div>
      <div class="h3">${esc(m.learn)}</div>
      <div class="tiny">${esc(t.name)} · ${t.resources.filter(r => r.url).length} links</div>
      ${m.order ? `<div class="tiny m-order">📦 Order now: ${esc(m.order)}</div>` : ''}</div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** On the boss day the fight is the mission when the boss is ready; otherwise the day is a review of the month. */
function bossStep(m) {
  const won = S.tracks.robotics.bosses[m.month]?.won, ready = bossReady(m.month);
  const boss = bossFor(m.month);
  if (m.done || m.check || won || !ready.ok) {
    const why = won ? 'Boss already beaten.' : ready.why;
    return Parts.proveStep(T, m, 1, { note: m.done ? '' : `<div class="tiny">${esc(why)} Today is a review of this part.</div>` });
  }
  const active = S.active?.mode === 'boss';
  return `<div class="m-step">
    <span class="m-num">1</span>
    <div class="grow"><div class="label">This part's boss</div>
      <div class="h3">${boss.icon} Fight ${esc(boss.name)}</div><div class="tiny">${esc(boss.intro)}</div>
      <button class="btn hot block m-go" data-boss="${m.month}">${active ? 'Resume the fight' : 'Fight'}</button></div>
  </div>`;
}

function buildStep(m) {
  if (!m.build) return '';
  const b = buildById(m.build.id), verified = isVerified(b.id);
  const commits = commitsOn(), repos = [...new Set((S.github.pushes || []).filter(p => p.day === today()).map(p => p.repo))];
  const check = verified ? '<div class="tiny ok-line">✓ Verified on GitHub</div>'
    : !S.github.user ? '<div class="tiny m-check">Add your GitHub on Hero so your pushes count</div>'
    : commits ? `<div class="tiny ok-line">✓ ${commits} commit${commits === 1 ? '' : 's'} today · ${esc(repos.join(', '))}</div>`
    : '<div class="tiny m-check">Push a commit today. GitHub is checked; there is nothing to tick.</div>';
  const done = verified || (!!S.github.user && commits > 0);
  return `<button class="m-step tap ${done ? 'done' : ''}" data-build="${b.id}">
    <span class="m-num">3</span>
    <div class="grow"><div class="label">Build · ${stepName(m.build)} ${m.build.step}/${m.build.of}</div>
      <div class="h3">${esc(b.name)}</div>
      <div class="tiny m-task">${esc(stepLine(m.build))}</div>
      ${check}</div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** Between missions at a slower pace: keep going on the build from the last one. */
function keepBuilding(m) {
  const prev = m.n > 1 ? missionAt(m.n - 1) : null;
  if (!prev?.build) return '';
  const b = buildById(prev.build.id), commits = commitsOn();
  const check = isVerified(b.id) ? '<div class="tiny ok-line">✓ Verified on GitHub</div>'
    : !S.github.user ? '<div class="tiny m-check">Add your GitHub on Hero so your pushes count</div>'
    : commits ? `<div class="tiny ok-line">✓ ${commits} commit${commits === 1 ? '' : 's'} today</div>`
    : '<div class="tiny m-check">Push what you get done today.</div>';
  return `<button class="m-step tap" data-build="${b.id}">
    <span class="m-num">2</span>
    <div class="grow"><div class="label">Keep going · ${stepName(prev.build)} ${prev.build.step}/${prev.build.of}</div>
      <div class="h3">${esc(b.name)}</div>
      <div class="tiny m-task">${esc(stepLine(prev.build))}</div>${check}</div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** The mission card. `compact` is the version on Today. */
export function missionCard({ compact = false } = {}) {
  const m = mission(), month = monthByN(m.month);
  if (m.finished && !m.done) {
    return `<div class="card mission-card"><div class="h2">All missions done</div>
      <p class="sub" style="margin-top:6px">That is the whole plan. Keep your skills sharp with practice, and ship.</p></div>`;
  }
  if (!m.done && !m.check && !E.paceInfo(T).missionDay) {
    return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
      ${compact ? '' : Parts.header(T, m, month, { keepGoing: true })}
      <div class="m-steps">${Parts.keepGoing(T, m, keepBuilding(m))}</div>
    </div>`;
  }
  const next = m.done && m.n < TOTAL_MISSIONS ? missionAt(m.n + 1) : null;
  const steps = m.boss ? bossStep(m) : learnStep(m) + Parts.proveStep(T, m) + buildStep(m);
  return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
    ${compact ? '' : Parts.header(T, m, month)}
    <div class="m-steps">${steps}</div>
    ${Parts.testOutRow(T, m)}
    ${Parts.tomorrow(next, missionTitle)}
  </div>`;
}

/* ---------------------------------- learn --------------------------------- */

export function openLearn(n, rerender) {
  const m = missionAt(n), t = topicById(m.topic);
  const paint = () => {
    const res = t.resources.map(r => {
      const done = r.url && S.tracks.robotics.read[r.url];
      return `<div class="res ${done ? 'done' : ''}">
        ${r.url ? `<button class="res-check" data-read="${esc(r.url)}" aria-label="${done ? 'Mark unread' : 'Mark done'}">${done ? '✓' : ''}</button>` : '<span class="res-check static">$</span>'}
        <div class="grow"><div class="res-name">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)} ${icon('ext', 12).value}</a>` : esc(r.name)}</div>
          ${r.note ? `<div class="tiny">${esc(r.note)}</div>` : ''}</div>
        <span class="badge price">${esc(r.price)}</span></div>`;
    }).join('');
    const skills = m.skills.map(id => skillById(id).name);
    return `<div class="label">Mission ${m.n} · ${esc(t.name)}</div>
      <div class="h2" style="margin-top:6px">${esc(m.learn)}</div>
      <p class="sub" style="margin-top:10px">${esc(t.why)}</p>
      ${skills.length ? `<div class="card sunk pad-s" style="margin-top:14px"><div class="label">New in today's check</div>
        <div class="h3" style="margin-top:4px">${esc(skills.join(', '))}</div></div>` : ''}
      <div class="label" style="margin-top:16px">Where to learn it</div>
      <div class="res-list">${res}</div>
      <button class="btn block" style="margin-top:16px" data-open-month>See all of part ${m.month}</button>`;
  };
  sheet('Learn', paint(), (el, close) => {
    const wire = () => {
      el.querySelectorAll('[data-read]').forEach(b => {
        b.onclick = e => { e.preventDefault(); toggleRead(b.dataset.read); el.querySelector('.sheet-bd').innerHTML = paint(); wire(); };
      });
      el.querySelector('[data-open-month]').onclick = () => { close(); showMonth(m.month); openTab('plan'); go('robotics'); rerender(); };
    };
    wire();
  });
}

/* ---------------------------------- wiring -------------------------------- */

export function mountMission(root, rerender) {
  Parts.mountParts(root, T, rerender);
  root.querySelectorAll('[data-mission-learn]').forEach(el => { el.onclick = () => openLearn(mission().n, rerender); });
  root.querySelectorAll('.m-steps [data-build]').forEach(el => { el.onclick = () => openBuild(el.dataset.build, rerender); });
  root.querySelectorAll('.m-steps [data-boss]').forEach(el => { el.onclick = () => openBoss(+el.dataset.boss, rerender); });
}

/* ---------------------------------- page ---------------------------------- */

const describe = x => ({
  title: missionTitle(x),
  sub: [
    ...(x.skills.length ? [`new: ${x.skills.map(id => skillById(id).name).join(', ')}`] : []),
    ...(x.build ? [`${stepName(x.build)} · ${buildById(x.build.id).name}`] : []),
  ].join(' · '),
});

export function render() {
  return `<div class="stack s4 fade-up">
    ${missionCard()}
    ${Parts.paceCard(T)}
    ${Parts.progressCard(T)}
    ${Parts.comingUp(T, describe)}
    ${Parts.howItWorks(T, 'Build steps count when GitHub shows a push that day, and a build pays when its folder passes the checks. The check alone finishes the mission, because parts can take days to arrive.')}
  </div>`;
}

export const mount = mountMission;
